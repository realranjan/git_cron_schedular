import React, { useState } from 'react';
import { Clock, Copy, Download, Check, ShieldCheck, Cpu } from 'lucide-react';

export default function CronScheduler() {
  const [cronExpr, setCronExpr] = useState('0 0 * * *');
  const [branch, setBranch] = useState('main');
  const [copied, setCopied] = useState(false);

  const generateWorkflowYaml = () => {
    return `name: Auto Commit Cron Scheduler

on:
  schedule:
    - cron: '${cronExpr}'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  auto-commit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Execute Auto-Commit Script
        run: node scripts/auto_commit.js

      - name: Commit & Push Changes
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add data/activity_log.txt
          git diff --quiet && git diff --staged --quiet || git commit -m "chore(auto-commit): scheduled activity update"
          git push origin ${branch}
`;
  };

  const yamlContent = generateWorkflowYaml();

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto_commit.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-card">
      <div className="panel-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} style={{ color: 'var(--gh-level-4)' }} />
          <span>Ongoing Auto-Commit Cron Scheduler</span>
        </div>
        <span className="badge">
          <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Serverless GitHub Actions
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Never break your commit streak again. GitHub Actions will run automatically on GitHub’s infrastructure on your schedule.
      </p>

      {/* Schedule Selection Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Frequency Preset</label>
          <select
            className="form-input"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
          >
            <option value="0 0 * * *">Every Day at Midnight UTC (0 0 * * *)</option>
            <option value="0 12 * * *">Every Day at Noon UTC (0 12 * * *)</option>
            <option value="0 0,12 * * *">Twice Daily (0 0,12 * * *)</option>
            <option value="0 */6 * * *">Every 6 Hours (0 */6 * * *)</option>
            <option value="0 9 * * 1-5">Weekdays at 9 AM UTC (0 9 * * 1-5)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Target Branch</label>
          <input
            type="text"
            className="form-input"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
          />
        </div>
      </div>

      {/* Code YAML Block */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <div className="code-box">
          <pre>{yamlContent}</pre>
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={handleCopy}>
            {copied ? <Check size={14} style={{ color: 'var(--gh-level-4)' }} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy YAML'}
          </button>
          <button className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={handleDownload}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: '#010409', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        📁 Place this file at: <code style={{ color: 'var(--gh-level-4)', fontFamily: 'var(--font-mono)' }}>.github/workflows/auto_commit.yml</code> in your repository.
      </div>
    </div>
  );
}
