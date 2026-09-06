import React, { useState, useEffect } from 'react';
import { generatePowerShellScript, generateBashScript, generateCommitsJson } from '../utils/gitEngine';
import { extractCommitsFromMatrix } from '../utils/matrixUtils';
import { testGitHubToken, executeDirectApiCommits } from '../utils/githubApi';
import {
  Download,
  Copy,
  Check,
  Terminal,
  X,
  Play,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ExecutionModal({ matrix, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct', 'ps1', 'sh', 'json'
  const [copied, setCopied] = useState(false);

  // GitHub Token & Credentials State
  const [token, setToken] = useState(() => localStorage.getItem('gh_pat') || '');
  const [owner, setOwner] = useState(() => localStorage.getItem('gh_owner') || 'realranjan');
  const [repo, setRepo] = useState(() => localStorage.getItem('gh_repo') || 'git_cron_schedular');
  const [branch, setBranch] = useState(() => localStorage.getItem('gh_branch') || 'main');
  const [showToken, setShowToken] = useState(false);
  const [remember, setRemember] = useState(true);

  // Verification & Execution state
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [logs, setLogs] = useState([]);

  const commits = extractCommitsFromMatrix(matrix);
  const totalCommits = commits.reduce((a, b) => a + b.count, 0);

  useEffect(() => {
    if (remember) {
      if (token) localStorage.setItem('gh_pat', token);
      if (owner) localStorage.setItem('gh_owner', owner);
      if (repo) localStorage.setItem('gh_repo', repo);
      if (branch) localStorage.setItem('gh_branch', branch);
    }
  }, [token, owner, repo, branch, remember]);

  if (!isOpen) return null;

  const ps1Script = generatePowerShellScript(commits);
  const shScript = generateBashScript(commits);
  const jsonContent = generateCommitsJson(commits);

  const getActiveContent = () => {
    if (activeTab === 'ps1') return ps1Script;
    if (activeTab === 'sh') return shScript;
    return jsonContent;
  };

  const getFilename = () => {
    if (activeTab === 'ps1') return 'backdate.ps1';
    if (activeTab === 'sh') return 'backdate.sh';
    return 'commits.json';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    const filename = getFilename();
    const mimeType = activeTab === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerifyToken = async () => {
    if (!token) return;
    setVerifying(true);
    setVerifyStatus(null);
    const res = await testGitHubToken(token, owner, repo);
    setVerifying(false);
    setVerifyStatus(res);
  };

  const handleDirectPush = async () => {
    if (!token || !owner || !repo) {
      alert('Please enter your GitHub Personal Access Token, Repository Owner, and Repo Name.');
      return;
    }

    setExecuting(true);
    setLogs([]);

    const res = await executeDirectApiCommits({
      token,
      owner,
      repo,
      branch,
      commits,
      onProgress: (p) => {
        setProgress(p);
        if (p.logs && p.logs.length > 0) {
          setLogs(prev => [...prev, ...p.logs]);
        }
      }
    });

    setExecuting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="panel-card" style={{ width: '100%', maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="panel-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={22} style={{ color: 'var(--gh-level-4)' }} />
            <span>Apply Commits to GitHub</span>
          </div>
          <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Total dates painted: <strong style={{ color: 'var(--gh-level-4)' }}>{commits.length}</strong> | Total backdated commits: <strong style={{ color: 'var(--text-main)' }}>{totalCommits}</strong>
        </p>

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => setActiveTab('direct')}
          >
            <Key size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Direct 1-Click Push (GitHub Token)
          </button>
          <button
            className={`tab-btn ${activeTab === 'ps1' ? 'active' : ''}`}
            onClick={() => setActiveTab('ps1')}
          >
            PowerShell (.ps1)
          </button>
          <button
            className={`tab-btn ${activeTab === 'sh' ? 'active' : ''}`}
            onClick={() => setActiveTab('sh')}
          >
            Bash Script (.sh)
          </button>
          <button
            className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON Config (Node.js)
          </button>
        </div>

        {/* Tab 1: Direct GitHub Token Push */}
        {activeTab === 'direct' && (
          <div>
            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--gh-level-4)', flexShrink: 0 }} />
              <div>
                <strong>Direct API Execution</strong>: Enter your GitHub Personal Access Token (PAT) to commit directly from the browser! No local git installation or shell command execution required.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">GitHub Owner / Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. octocat"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repository Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g. git_cron_job"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Personal Access Token (PAT)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showToken ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  className="form-input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                />
              </div>
            </div>

            {/* Verification Status Feedback */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={handleVerifyToken}
                disabled={verifying || !token}
              >
                {verifying ? 'Verifying...' : 'Verify Token & Repo'}
              </button>

              {verifyStatus && (
                <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {verifyStatus.success ? (
                    <span style={{ color: 'var(--gh-level-4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={15} /> Verified user @{verifyStatus.username}
                    </span>
                  ) : (
                    <span style={{ color: '#f85149', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertCircle size={15} /> {verifyStatus.error}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Execution Controls */}
            <button
              className="btn btn-primary glow-active"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              onClick={handleDirectPush}
              disabled={executing || !token || !owner || !repo || totalCommits === 0}
            >
              <Zap size={18} /> {executing ? 'Pushing Commits...' : `🚀 Direct Push ${totalCommits} Commits to GitHub`}
            </button>

            {/* Progress Bar & Live Log Monitor */}
            {progress && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <span>{progress.message}</span>
                  <span>{Math.round((progress.current / Math.max(1, progress.total)) * 100)}%</span>
                </div>
                <div style={{ height: '8px', background: '#030712', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--gh-level-2), var(--gh-level-4))',
                    transition: 'width 0.15s ease'
                  }} />
                </div>

                <div className="code-box" style={{ maxHeight: '180px', fontSize: '0.75rem' }}>
                  <pre>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs 2, 3, 4: Code Scripts */}
        {activeTab !== 'direct' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <div className="code-box" style={{ maxHeight: '300px' }}>
                <pre>{getActiveContent()}</pre>
              </div>
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={handleCopy}>
                  {copied ? <Check size={14} style={{ color: 'var(--gh-level-4)' }} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={handleDownload}>
                  <Download size={14} /> Download {getFilename()}
                </button>
              </div>
            </div>

            <div style={{ background: '#030712', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.825rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Play size={14} style={{ color: 'var(--gh-level-4)' }} /> Execution steps:
              </div>
              {activeTab === 'ps1' && (
                <ol style={{ marginLeft: '1.2rem', color: 'var(--text-muted)' }}>
                  <li>Save script as <code>backdate.ps1</code> in your repo root.</li>
                  <li>Run: <code>.\backdate.ps1</code></li>
                  <li>Push to GitHub: <code>git push origin main</code></li>
                </ol>
              )}
              {activeTab === 'sh' && (
                <ol style={{ marginLeft: '1.2rem', color: 'var(--text-muted)' }}>
                  <li>Save script as <code>backdate.sh</code> in your repo root.</li>
                  <li>Run: <code>bash backdate.sh</code></li>
                  <li>Push to GitHub: <code>git push origin main</code></li>
                </ol>
              )}
              {activeTab === 'json' && (
                <ol style={{ marginLeft: '1.2rem', color: 'var(--text-muted)' }}>
                  <li>Save JSON into <code>data/commits.json</code>.</li>
                  <li>Run local engine: <code>node scripts/backdate.js</code></li>
                  <li>Push to GitHub: <code>git push origin main</code></li>
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
