import { Octokit } from '@octokit/rest';

/**
 * Validate token and retrieve user & repository info
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
            error: `Repository '${owner}/${repo}' not found (404).\n\nCheck:\n1. Is the repository name spelled correctly? (e.g. 'git_cron_schedular')\n2. If the repository is Private, ensure your Personal Access Token has the 'repo' scope permission enabled!`
          };
        }
        throw repoErr;
      }
    }

    return {
      success: true,
      username: user.login,
      email: primaryEmail,
      avatarUrl: user.avatar_url,
      repository: repository ? repository.full_name : null,
      defaultBranch: repository ? repository.default_branch : 'main'
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
 */
export async function executeDirectApiCommits({
  token: rawToken,
  owner: rawOwner,
  repo: rawRepo,
  branch = 'main',
  authorEmail: rawAuthorEmail,
  commits,
  onProgress
}) {
  const token = (rawToken || '').trim();
  const owner = (rawOwner || '').trim();
  const repo = (rawRepo || '').trim();
  const targetBranch = (branch || 'main').trim();
  const customAuthorEmail = (rawAuthorEmail || '').trim();

  const octokit = new Octokit({ auth: token });

  onProgress({
    current: 0,
    total: commits.length,
    message: '🚀 Initializing GitHub API connection...',
    logs: ['Connecting to GitHub API...']
  });

  try {
    // 1. Get HEAD commit of target branch
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
    
    // Resolve email
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

    let totalCreated = 0;
    const totalCommitsToMake = commits.reduce((a, b) => a + b.count, 0);

    onProgress({
      current: 0,
      total: totalCommitsToMake,
      message: `Target branch '${targetBranch}' ready (Commit Email: ${resolvedEmail}). Starting commit generation...`,
      logs: [
        `HEAD commit SHA: ${currentCommitSha.substring(0, 7)}`,
        `Author Email: ${resolvedEmail}`
      ]
    });

    let currentLogText = `GitGraph Studio Direct API Sync\nStarted: ${new Date().toISOString()}\n\n`;

    // 2. Loop through each date
    for (let dIdx = 0; dIdx < commits.length; dIdx++) {
      const item = commits[dIdx];
      const dateIso = `${item.date}T12:00:00Z`;

      for (let cIdx = 0; cIdx < item.count; cIdx++) {
        totalCreated++;

        currentLogText += `[${dateIso}] Direct API commit #${cIdx + 1} for ${item.date}\n`;

        // Create Blob
        const blobRes = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: currentLogText,
          encoding: 'utf-8'
        });

        // Create Tree with updated activity log file
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

        // Create Commit with backdated author & committer timestamps
        const newCommitRes = await octokit.rest.git.createCommit({
          owner,
          repo,
          message: `Activity backfill ${item.date} (#${cIdx + 1}) [API]`,
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

        onProgress({
          current: totalCreated,
          total: totalCommitsToMake,
          message: `Creating commit for ${item.date} (${totalCreated}/${totalCommitsToMake})...`,
          logs: [
            `Created commit ${currentCommitSha.substring(0, 7)} for date ${item.date}`
          ]
        });
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

    onProgress({
      current: totalCommitsToMake,
      total: totalCommitsToMake,
      message: '✅ SUCCESS! All commits pushed directly to GitHub!',
      logs: [
        `🎉 Successfully created and pushed ${totalCommitsToMake} backdated commits directly to GitHub!`,
        `💡 NOTE: If GitHub hasn't turned your graph green yet, verify:`,
        `   1. Email: Make sure '${resolvedEmail}' is listed under your GitHub Settings -> Emails.`,
        `   2. Private Repos: If this repo is Private, turn ON "Include private contributions" in your GitHub Profile settings.`,
        `   3. Cache: GitHub contribution graph updates can take 5-10 minutes to re-index.`
      ],
      completed: true
    });

    return { success: true, count: totalCommitsToMake };
  } catch (err) {
    const errorMsg = err.status === 404
      ? `Repository '${owner}/${repo}' not found (404). If the repo is Private, make sure your token has the 'repo' scope permission!`
      : err.message;

    onProgress({
      current: 0,
      total: 1,
      message: `❌ API Error: ${errorMsg}`,
      logs: [`Error: ${errorMsg}`],
      error: true
    });
    return { success: false, error: errorMsg };
  }
}
