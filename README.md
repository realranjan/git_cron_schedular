# 🎨 GitGraph Studio — Contribution Graph Art & Automated Backdate Engine

> **Design custom GitHub contribution graph pixel art, spell text across your calendar matrix, backdate commits via 1-click browser push, and schedule automated daily activity workflows.**

[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Cron_Bot-2088FF.svg?logo=github-actions)](https://github.com/features/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Hosted-000000.svg?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**GitGraph Studio** is a full-stack, serverless web application that empowers developers to customize their GitHub contribution graph. Whether you want to backfill missing activity, create pixel art logos, spell text across your contribution graph, or automate daily commits to maintain a streak, GitGraph Studio provides a sleek, Developer Cyberpunk interface to accomplish it seamlessly.

---

## ✨ Key Features

- 🎨 **Interactive 52x7 Matrix Canvas**:
  - Drag-and-paint brush tool with 5 intensity levels (Level 0 - Level 4).
  - Quick action controls: *Invert*, *Randomize*, *Clear*, and *Fill Grid*.
  - Real-time cell hover tooltips showing date strings and calculated commit counts.

- 📅 **Yearly View Switcher & Advanced Date Filters**:
  - Switch canvas view between **Past 365 Days**, **2026**, **2025**, **2024**, and **2023**.
  - Custom Date Range filter panel (`From Date` / `Till Date`).
  - Search engine to locate and highlight specific dates or months in real time.
  - Day-of-week checkboxes (*Sun*, *Mon*, *Tue*, *Wed*, *Thu*, *Fri*, *Sat*).
  - Batch action operations (*Paint*, *Randomize*, or *Clear* on filtered date ranges).

- 🚀 **1-Click Direct Browser API Push**:
  - Backdate commits directly from the browser using a GitHub Personal Access Token (PAT).
  - Zero local Git installation required—executes using GitHub's Git Data REST API.
  - Built-in token verification, live progress indicator, and streaming execution logs.

- 🔤 **Text Generator & Pixel Art Presets**:
  - Built-in 5x7 pixel font map to spell custom text (A-Z) on the contribution graph.
  - One-click presets: *Heart Beats*, *Space Invader*, *Streak Master*, and *Realistic Backfill*.

- 🤖 **Automated GitHub Actions Cron Scheduler**:
  - Native `.github/workflows/auto_commit.yml` workflow for automated daily commits.
  - Runs 24/7 on GitHub Actions cloud infrastructure.

- 🛡️ **100% Client-Side Privacy & Security**:
  - Tokens and credentials are processed strictly in-memory or saved in browser `localStorage`.
  - Zero backend databases or third-party servers storing user keys.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- `npm` or `yarn`

### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/realranjan/git_cron_schedular.git
cd git_cron_schedular

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start painting!

---

## 📖 How to Use

### Option 1: Direct 1-Click Browser Push (Recommended)
1. Open GitGraph Studio and paint your contribution graph or generate a preset.
2. Click **Export Commits**.
3. Select the **Direct 1-Click Push (GitHub Token)** tab.
4. Enter your **GitHub Owner**, **Repository Name** (e.g. `git_cron_schedular`), and a **Personal Access Token (PAT)** with `repo` permissions.
5. Click **Verify Token & Repo**, then click **🚀 Direct Push Commits to GitHub**.

### Option 2: Automated GitHub Actions Cron Bot
1. Fork or push this repository to your GitHub account.
2. Go to your repository's **Actions** tab on GitHub:
   - `https://github.com/<your-username>/git_cron_schedular/actions`
3. Click **Enable workflows**.
4. Go to **Settings -> Actions -> General -> Workflow permissions** and select **Read and write permissions**.
5. The bot will automatically commit daily at 00:00 UTC!

### Option 3: Local Script Export (PowerShell / Bash / Node.js)
1. Paint your matrix in GitGraph Studio and click **Export Commits**.
2. Download the script of your choice:
   - **PowerShell (`.ps1`)**: Run `.\backdate.ps1` in your repository root.
   - **Bash (`.sh`)**: Run `bash backdate.sh` in your repository root.
   - **JSON (`commits.json`)**: Save to `data/commits.json` and run `node scripts/backdate.js`.
3. Push to GitHub: `git push origin main`.

---

## 🛠️ Built With

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **GitHub REST API**: [@octokit/rest](https://github.com/octokit/rest.js)
- **Styling**: Custom Glassmorphic Cyberpunk CSS Engine
- **CI/CD & Hosting**: [GitHub Actions](https://github.com/features/actions) & [Vercel](https://vercel.com/)

---

## 🔒 Security & Token Scope

To use Direct Browser Push, create a [GitHub Personal Access Token (Classic)](https://github.com/settings/tokens):
- **Scope required**: `repo` *(Full control of private repositories)*
- Your token is stored locally in your browser and is only sent directly to `https://api.github.com`. It is **never** sent to any intermediate server.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p center>Made with ❤️ by <a href="https://github.com/realranjan">realranjan</a></p>
