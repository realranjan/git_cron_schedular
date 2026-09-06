/**
 * GitHub Actions Cron Execution Script
 * Runs automatically on schedule to keep contribution graph active
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../data/activity_log.txt');

const MOTIVATIONAL_QUOTES = [
  "Consistency is the code of success.",
  "Small daily improvements over time lead to stunning results.",
  "Automate the routine, unleash the creative.",
  "Building the future, one commit at a time.",
  "Keep shipping, stay inspired.",
  "Code, commit, repeat."
];

function runScheduledCommit() {
  const dataDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString();
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const logContent = `[CRON RUN: ${timestamp}] — "${randomQuote}"\n`;
  fs.appendFileSync(LOG_FILE, logContent);

  console.log(`✅ Activity log updated at ${timestamp}`);
  console.log(`Quote of the day: ${randomQuote}`);
}

runScheduledCommit();
