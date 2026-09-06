/**
 * Script Generators for PowerShell, Bash, and JSON configuration
 * Local CLI scripts execute using local Git binary and bypass GitHub REST API rate limits completely.
 */

export function generatePowerShellScript(commits) {
  let script = `# ==========================================================================\n`;
  script += `# GitGraph Studio - Local PowerShell Backdate Script (Rate-Limit Free!)\n`;
  script += `# Run this script in your Git repository root using PowerShell\n`;
  script += `# Note: Executes local 'git commit' commands — ZERO GitHub API rate limits.\n`;
  script += `# ==========================================================================\n\n`;
  script += `Write-Host "🚀 Starting Git Backdate process for ${commits.length} dates..." -ForegroundColor Green\n\n`;
  script += `if (-not (Test-Path "data")) { New-Item -ItemType Directory -Path "data" }\n\n`;

  commits.forEach((c) => {
    script += `# Date: ${c.date} (Commits: ${c.count})\n`;
    for (let i = 0; i < c.count; i++) {
      script += `Add-Content -Path "data/activity_log.txt" -Value "[${c.date} 12:00:00] Commit #${i + 1}"\n`;
      script += `git add data/activity_log.txt\n`;
      script += `$env:GIT_AUTHOR_DATE="${c.date}T12:00:00"\n`;
      script += `$env:GIT_COMMITTER_DATE="${c.date}T12:00:00"\n`;
      script += `git commit -m "Activity backfill ${c.date} (#${i + 1})" --date="${c.date}T12:00:00"\n`;
    }
  });

  script += `\nWrite-Host "🎉 Success! ${commits.reduce((a, b) => a + b.count, 0)} backdated commits created locally." -ForegroundColor Green\n`;
  script += `Write-Host "Push to GitHub using: git push origin main" -ForegroundColor Yellow\n`;
  return script;
}

export function generateBashScript(commits) {
  let script = `#!/bin/bash\n`;
  script += `# ==========================================================================\n`;
  script += `# GitGraph Studio - Local Bash Backdate Script (Rate-Limit Free!)\n`;
  script += `# Run in your repository root terminal: bash backdate.sh\n`;
  script += `# Note: Executes local 'git commit' commands — ZERO GitHub API rate limits.\n`;
  script += `# ==========================================================================\n\n`;
  script += `mkdir -p data\n\n`;

  commits.forEach((c) => {
    script += `# Date: ${c.date}\n`;
    for (let i = 0; i < c.count; i++) {
      script += `echo "[${c.date} 12:00:00] Commit #${i + 1}" >> data/activity_log.txt\n`;
      script += `git add data/activity_log.txt\n`;
      script += `GIT_AUTHOR_DATE="${c.date}T12:00:00" GIT_COMMITTER_DATE="${c.date}T12:00:00" git commit -m "Activity backfill ${c.date} (#${i + 1})" --date="${c.date}T12:00:00"\n`;
    }
  });

  script += `\necho "🎉 Success! Created ${commits.reduce((a, b) => a + b.count, 0)} backdated commits locally."\n`;
  script += `echo "Push to GitHub using: git push origin main"\n`;
  return script;
}

export function generateCommitsJson(commits) {
  return JSON.stringify(commits, null, 2);
}
