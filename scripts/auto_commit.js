/**
 * GitHub Actions Cron Execution Script
 * Supports Realistic Developer commits, variable intensity, and quotes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, '../data/activity_log.txt');

// Config from ENV or defaults
const MODE = process.env.COMMIT_MODE || 'realistic'; // 'realistic', 'consistent', 'heavy', 'fixed'
const MIN_COMMITS = parseInt(process.env.MIN_COMMITS || '1', 10);
const MAX_COMMITS = parseInt(process.env.MAX_COMMITS || '4', 10);
const SKIP_CHANCE = parseFloat(process.env.SKIP_CHANCE || '0.15'); // 15% chance to skip for human realism

const MOTIVATIONAL_QUOTES = [
  "Consistency is the code of success.",
  "Small daily improvements over time lead to stunning results.",
  "Automate the routine, unleash the creative.",
  "Building the future, one commit at a time.",
  "Keep shipping, stay inspired.",
  "Code, commit, repeat.",
  "Progress over perfection."
];

function runScheduledCommit() {
  if (MODE === 'realistic' && Math.random() < SKIP_CHANCE) {
    console.log("🎲 Realistic human skip triggered today (rest day). No commits generated.");
    return;
  }

  const dataDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const commitCount = Math.floor(Math.random() * (MAX_COMMITS - MIN_COMMITS + 1)) + MIN_COMMITS;
  const now = new Date();

  for (let i = 0; i < commitCount; i++) {
    const timestamp = now.toISOString();
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    const logContent = `[CRON RUN ${timestamp} #${i + 1}/${commitCount}] — "${randomQuote}"\n`;
    fs.appendFileSync(LOG_FILE, logContent);
  }

  console.log(`✅ Activity log updated with ${commitCount} commits at ${now.toISOString()}`);
}

runScheduledCommit();
