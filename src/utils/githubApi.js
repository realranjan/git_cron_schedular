import { Octokit } from '@octokit/rest';

/**
 * Validate token and retrieve user & repository info
 */
export async function testGitHubToken(token, owner, repo) {
  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    let repository = null;
    if (owner && repo) {
      const res = await octokit.rest.repos.get({ owner, repo });
      repository = res.data;
    }

    return {
      success: true,
      username: user.login,
      avatarUrl: user.avatar_url,
      repository: repository ? repository.full_name : null,
      defaultBranch: repository ? repository.default_branch : 'main'
    };
  } catch (err) {
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
  token,
  owner,
  repo,
  branch = 'main',
  commits,
  onProgress
}) {
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
      ref: `heads/${branch}`
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
    const committerEmail = user.email || `${user.login}@users.noreply.github.com`;

    let totalCreated = 0;
    const totalCommitsToMake = commits.reduce((a, b) => a + b.count, 0);

    onProgress({
      current: 0,
      total: totalCommitsToMake,
      message: `Target branch '${branch}' ready. Starting commit generation...`,
      logs: [`HEAD commit SHA: ${currentCommitSha.substring(0, 7)}`]
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
            email: committerEmail,
            date: dateIso
          },
          committer: {
            name: committerName,
            email: committerEmail,
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
      logs: [`Updating refs/heads/${branch} -> ${currentCommitSha.substring(0, 7)}`]
    });

    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: currentCommitSha,
      force: true
    });

    onProgress({
      current: totalCommitsToMake,
      total: totalCommitsToMake,
      message: '✅ SUCCESS! All commits pushed directly to GitHub!',
      logs: [
        `🎉 Successfully created and pushed ${totalCommitsToMake} backdated commits directly to GitHub!`
      ],
      completed: true
    });

    return { success: true, count: totalCommitsToMake };
  } catch (err) {
    onProgress({
      current: 0,
      total: 1,
      message: `❌ API Error: ${err.message}`,
      logs: [`Error: ${err.message}`],
      error: true
    });
    return { success: false, error: err.message };
  }
}
