/**
 * Script Generators for PowerShell, Bash, and JSON configuration
 */

export function generatePowerShellScript(commits) {
  let script = `# GitGraph Studio - Backdate PowerShell Script\n`;
  script += `# Run this script in your Git repository root using PowerShell\n\n`;
  script += `Write-Host "Starting Git Backdate process for ${commits.length} dates..." -ForegroundColor Green\n\n`;
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

  script += `\nWrite-Host "Done! ${commits.reduce((a, b) => a + b.count, 0)} backdated commits created." -ForegroundColor Green\n`;
  script += `Write-Host "Run 'git push origin main' to push to GitHub!" -ForegroundColor Yellow\n`;
  return script;
}

export function generateBashScript(commits) {
  let script = `#!/bin/bash\n`;
  script += `# GitGraph Studio - Backdate Bash Script\n`;
  script += `# Run in your terminal: bash backdate.sh\n\n`;
  script += `mkdir -p data\n\n`;

  commits.forEach((c) => {
    script += `# Date: ${c.date}\n`;
    for (let i = 0; i < c.count; i++) {
      script += `echo "[${c.date} 12:00:00] Commit #${i + 1}" >> data/activity_log.txt\n`;
      script += `git add data/activity_log.txt\n`;
      script += `GIT_AUTHOR_DATE="${c.date}T12:00:00" GIT_COMMITTER_DATE="${c.date}T12:00:00" git commit -m "Activity backfill ${c.date} (#${i + 1})" --date="${c.date}T12:00:00"\n`;
    }
  });

  script += `\necho "Done! Run 'git push origin main' to update GitHub!"\n`;
  return script;
}

export function generateCommitsJson(commits) {
  return JSON.stringify(commits, null, 2);
}
