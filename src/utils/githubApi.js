import { Octokit } from '@octokit/rest';

/**
 * Helper to delay execution (prevent secondary rate limits)
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch GitHub API rate limit status for token
 */
export async function fetchRateLimit(rawToken) {
  const token = (rawToken || '').trim();
  if (!token) return null;

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.rateLimit.get();
    const core = data.resources.core;
    return {
      limit: core.limit,
      remaining: core.remaining,
      reset: core.reset, // Unix timestamp (seconds)
      resetDate: new Date(core.reset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch {
    return null;
  }
}

/**
 * Validate token and retrieve user, repository & rate-limit info
 */
export async function testGitHubToken(rawToken, rawOwner, rawRepo) {
  const token = (rawToken || '').trim();
  const owner = (rawOwner || '').trim();
  const repo = (rawRepo || '').trim();

  if (!token) {
    return { success: false, error: 'Personal Access Token cannot be empty.' };
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    let primaryEmail = user.email;
    if (!primaryEmail) {
      try {
        const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
        const verifiedPrimary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
        if (verifiedPrimary) primaryEmail = verifiedPrimary.email;
      } catch {
        // scope missing or not granted
      }
    }

    let repository = null;
    if (owner && repo) {
      try {
        const res = await octokit.rest.repos.get({ owner, repo });
        repository = res.data;
      } catch (repoErr) {
        if (repoErr.status === 404) {
          return {
            success: false,
            username: user.login,
            email: primaryEmail,
            error: `Repository '${owner}/${repo}' not found (404).\n\nCheck:\n1. Is the repository name spelled correctly?\n2. If Private, ensure token has the 'repo' scope permission enabled!`
          };
        }
        throw repoErr;
      }
    }

    const rateLimit = await fetchRateLimit(token);

    return {
      success: true,
      username: user.login,
      email: primaryEmail,
      avatarUrl: user.avatar_url,
      repository: repository ? repository.full_name : null,
      defaultBranch: repository ? repository.default_branch : 'main',
      rateLimit
    };
  } catch (err) {
    if (err.status === 401) {
      return { success: false, error: 'Unauthorized (401): Invalid Personal Access Token.' };
    }
    return {
      success: false,
      error: err.message || 'Invalid Personal Access Token or repository access denied.'
    };
  }
}

/**
 * Direct 1-Click Backdate Commit Executor via GitHub API
 * Includes rate-limit throttling, exponential backoff, and resume capability
 */
export async function executeDirectApiCommits({
  token: rawToken,
  owner: rawOwner,
  repo: rawRepo,
  branch = 'main',
  authorEmail: rawAuthorEmail,
  commits,
  startIndex = 0,
  onProgress
}) {
  const token = (rawToken || '').trim();
  const owner = (rawOwner || '').trim();
  const repo = (rawRepo || '').trim();
  const targetBranch = (branch || 'main').trim();
  const customAuthorEmail = (rawAuthorEmail || '').trim();

  const octokit = new Octokit({ auth: token });

  // Expand commits matrix into individual commit items
  const flatCommits = [];
  commits.forEach((item) => {
    for (let cIdx = 0; cIdx < item.count; cIdx++) {
      flatCommits.push({
        date: item.date,
        commitNum: cIdx + 1,
        dateIso: `${item.date}T12:00:00Z`
      });
    }
  });

  const totalCommitsToMake = flatCommits.length;

  onProgress({
    current: startIndex,
    total: totalCommitsToMake,
    message: startIndex > 0
      ? `🔄 Resuming direct API commit sync from commit #${startIndex + 1}...`
      : '🚀 Initializing GitHub API connection...',
    logs: [startIndex > 0 ? `Resuming execution at commit ${startIndex + 1}/${totalCommitsToMake}` : 'Connecting to GitHub API...']
  });

  try {
    // 1. Fetch current HEAD of target branch
    const refRes = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${targetBranch}`
    });
    let currentCommitSha = refRes.data.object.sha;

    const commitRes = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha
    });
    let currentTreeSha = commitRes.data.tree.sha;

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const committerName = user.name || user.login;

    // Resolve author email
    let resolvedEmail = customAuthorEmail || user.email;
    if (!resolvedEmail) {
      try {
        const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
        const verifiedPrimary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
        if (verifiedPrimary) resolvedEmail = verifiedPrimary.email;
      } catch {
        // scope missing
      }
    }
    if (!resolvedEmail) {
      resolvedEmail = `${user.login}@users.noreply.github.com`;
    }

    onProgress({
      current: startIndex,
      total: totalCommitsToMake,
      message: `Target branch '${targetBranch}' ready (Commit Email: ${resolvedEmail}). Executing commit sequence...`,
      logs: [
        `HEAD commit SHA: ${currentCommitSha.substring(0, 7)}`,
        `Author Email: ${resolvedEmail}`,
        `Total backdated commits queued: ${totalCommitsToMake}`
      ]
    });

    let currentLogText = `GitGraph Studio Direct API Sync\nStarted: ${new Date().toISOString()}\n\n`;
    let totalCreated = startIndex;

    // 2. Loop through flat commits starting at startIndex
    for (let i = startIndex; i < totalCommitsToMake; i++) {
      const commitItem = flatCommits[i];
      const dateIso = commitItem.dateIso;

      currentLogText += `[${dateIso}] Direct API commit #${commitItem.commitNum} for ${commitItem.date} (${i + 1}/${totalCommitsToMake})\n`;

      // Smart Throttle Pacing (120ms delay per commit to stay within secondary rate limits)
      if (i > startIndex) {
        await sleep(120);
      }

      // Retry mechanism with exponential backoff on HTTP 403 / 429 Rate Limits
      let attempts = 0;
      const maxAttempts = 3;
      let commitSuccess = false;

      while (!commitSuccess && attempts < maxAttempts) {
        try {
          attempts++;

          // Create Blob
          const blobRes = await octokit.rest.git.createBlob({
            owner,
            repo,
            content: currentLogText,
            encoding: 'utf-8'
          });

          // Create Tree
          const treeRes = await octokit.rest.git.createTree({
            owner,
            repo,
            base_tree: currentTreeSha,
            tree: [
              {
                path: 'data/activity_log.txt',
                mode: '100644',
                type: 'blob',
                sha: blobRes.data.sha
              }
            ]
          });

          // Create Commit
          const newCommitRes = await octokit.rest.git.createCommit({
            owner,
            repo,
            message: `Activity backfill ${commitItem.date} (#${commitItem.commitNum}) [API]`,
            tree: treeRes.data.sha,
            parents: [currentCommitSha],
            author: {
              name: committerName,
              email: resolvedEmail,
              date: dateIso
            },
            committer: {
              name: committerName,
              email: resolvedEmail,
              date: dateIso
            }
          });

          currentCommitSha = newCommitRes.data.sha;
          currentTreeSha = treeRes.data.sha;
          totalCreated = i + 1;
          commitSuccess = true;

          onProgress({
            current: totalCreated,
            total: totalCommitsToMake,
            message: `Creating commit for ${commitItem.date} (${totalCreated}/${totalCommitsToMake})...`,
            logs: [
              `Created commit ${currentCommitSha.substring(0, 7)} for date ${commitItem.date}`
            ],
            lastIndex: i
          });
        } catch (apiErr) {
          const isRateLimit = apiErr.status === 403 || apiErr.status === 429 ||
            (apiErr.message && apiErr.message.toLowerCase().includes('rate limit'));

          if (isRateLimit && attempts < maxAttempts) {
            const backoffMs = attempts * 3000;
            onProgress({
              current: totalCreated,
              total: totalCommitsToMake,
              message: `⚠️ Rate limit warning! Throttling and retrying in ${backoffMs / 1000}s (Attempt ${attempts}/${maxAttempts})...`,
              logs: [`Rate limit hit at commit #${i + 1}. Retrying in ${backoffMs / 1000}s...`]
            });
            await sleep(backoffMs);
          } else {
            // Unhandled error or exhausted rate limit retries
            throw apiErr;
          }
        }
      }
    }

    // 3. Update branch ref to final commit
    onProgress({
      current: totalCommitsToMake,
      total: totalCommitsToMake,
      message: 'Updating GitHub branch reference...',
      logs: [`Updating refs/heads/${targetBranch} -> ${currentCommitSha.substring(0, 7)}`]
    });

    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${targetBranch}`,
      sha: currentCommitSha,
      force: true
    });

    const finalRateLimit = await fetchRateLimit(token);

    onProgress({
      current: totalCommitsToMake,
      total: totalCommitsToMake,
      message: '✅ SUCCESS! All commits pushed directly to GitHub!',
      logs: [
        `🎉 Successfully created and pushed ${totalCommitsToMake} backdated commits directly to GitHub!`,
        `💡 Email registered: ${resolvedEmail}`,
        `💡 GitHub contribution graph updates can take 5-10 minutes to re-index.`
      ],
      completed: true,
      rateLimit: finalRateLimit
    });

    return { success: true, count: totalCommitsToMake };
  } catch (err) {
    const isRateLimit = err.status === 403 || err.status === 429 ||
      (err.message && err.message.toLowerCase().includes('rate limit'));

    const errorMsg = err.status === 404
      ? `Repository '${owner}/${repo}' not found (404). If the repo is Private, ensure your Personal Access Token has the 'repo' scope permission!`
      : err.message;

    const rateLimit = await fetchRateLimit(token);

    onProgress({
      current: startIndex,
      total: totalCommitsToMake,
      message: isRateLimit
        ? `🛑 API Rate Limit Exceeded: GitHub paused execution.`
        : `❌ API Error: ${errorMsg}`,
      logs: [`Error: ${errorMsg}`],
      error: true,
      isRateLimit,
      lastIndex: Math.max(0, startIndex),
      rateLimit
    });

    return {
      success: false,
      error: errorMsg,
      isRateLimit,
      lastIndex: Math.max(0, startIndex),
      rateLimit
    };
  }
}
