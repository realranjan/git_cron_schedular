/**
 * Node.js Backdate Commit Engine
 * Reads data/commits.json and creates backdated git commits
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COMMITS_FILE = path.join(__dirname, '../data/commits.json');
const LOG_FILE = path.join(__dirname, '../data/activity_log.txt');

function runBackdateEngine() {
  if (!fs.existsSync(COMMITS_FILE)) {
    console.error('Error: data/commits.json not found! Export a design from the Web UI first.');
    process.exit(1);
  }

  // Ensure data directory exists
  const dataDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const commitPlan = JSON.parse(fs.readFileSync(COMMITS_FILE, 'utf8'));
  console.log(`🚀 Backdate Engine initialized. Total dates to populate: ${commitPlan.length}`);

  let totalCommitsMade = 0;

  commitPlan.forEach((item, idx) => {
    const { date, count } = item;
    const dateObj = new Date(`${date}T12:00:00`);
    const dateIso = dateObj.toISOString();

    for (let i = 0; i < count; i++) {
      // Append entry to activity_log.txt
      const logEntry = `[${dateIso}] Backdate commit #${i + 1} for date ${date}\n`;
      fs.appendFileSync(LOG_FILE, logEntry);

      // Stage log file
      execSync('git add data/activity_log.txt', { stdio: 'pipe' });

      // Execute git commit with environment variables for date override
      const env = {
        ...process.env,
        GIT_AUTHOR_DATE: dateIso,
        GIT_COMMITTER_DATE: dateIso
      };

      try {
        execSync(`git commit -m "Activity backfill ${date} (#${i + 1})" --date="${dateIso}"`, {
          env,
          stdio: 'pipe'
        });
        totalCommitsMade++;
      } catch (err) {
        // If git commit fails (e.g. no changes), force update
        fs.appendFileSync(LOG_FILE, `/* update ${Date.now()} */\n`);
        execSync('git add data/activity_log.txt', { stdio: 'pipe' });
        execSync(`git commit -m "Activity sync ${date} (#${i + 1})" --date="${dateIso}"`, {
          env,
          stdio: 'pipe'
        });
        totalCommitsMade++;
      }
    }

    if ((idx + 1) % 10 === 0 || idx === commitPlan.length - 1) {
      console.log(` progress: ${idx + 1}/${commitPlan.length} dates processed (${totalCommitsMade} commits)...`);
    }
  });

  console.log(`\n✅ Success! Created ${totalCommitsMade} backdated commits.`);
  console.log(`👉 Run 'git push origin main' (or 'git push origin main --force') to update your GitHub graph!`);
}

runBackdateEngine();
