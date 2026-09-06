import React, { useState } from 'react';
import { createEmptyMatrix, extractCommitsFromMatrix } from './utils/matrixUtils';
import ContributionCanvas from './components/ContributionCanvas';
import PresetSelector from './components/PresetSelector';
import ExecutionModal from './components/ExecutionModal';
import {
  GitCommit,
  Calendar,
  Zap,
  TrendingUp,
  Play,
  Layers
} from 'lucide-react';

export default function App() {
  const [matrix, setMatrix] = useState(() => createEmptyMatrix());
  const [activeLevel, setActiveLevel] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const commits = extractCommitsFromMatrix(matrix);
  const totalCommits = commits.reduce((sum, c) => sum + c.count, 0);
  const totalDays = commits.length;
  const activityScore = Math.min(100, Math.round((totalDays / 365) * 100));

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="brand">
          <GitCommit className="brand-icon" size={28} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>GitGraph Studio</span>
              <span className="badge">v1.0 PRO</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              GitHub Contribution Graph Designer & Backdate Sync Engine
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary glow-active" onClick={() => setIsModalOpen(true)}>
            <Play size={16} /> Export Commits ({totalCommits})
          </button>
        </div>
      </nav>

      {/* Top Key Statistics Bar */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-val">{totalDays}</div>
            <div className="stat-lbl">Active Days Painted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={20} />
          </div>
          <div>
            <div className="stat-val">{totalCommits}</div>
            <div className="stat-lbl">Generated Commits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-val">{activityScore}%</div>
            <div className="stat-lbl">Yearly Graph Fill</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Layers size={20} />
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--gh-level-4)' }}>Direct API & CLI</div>
            <div className="stat-lbl">Sync Engine</div>
          </div>
        </div>
      </div>

      {/* Studio Canvas & Presets Grid */}
      <div className="main-grid">
        <div>
          <ContributionCanvas
            matrix={matrix}
            setMatrix={setMatrix}
            activeLevel={activeLevel}
            setActiveLevel={setActiveLevel}
          />
        </div>

        <div>
          <PresetSelector
            matrix={matrix}
            setMatrix={setMatrix}
          />

          {/* Quick Action Footer Panel */}
          <div className="panel-card" style={{ marginTop: '1.5rem' }}>
            <div className="panel-title" style={{ fontSize: '0.95rem' }}>
              <span>Execution Ready</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Export your pixel graph design directly to GitHub via API or generate PowerShell & Bash scripts for rate-limit-free local commits!
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Play size={16} /> Apply {totalCommits} Commits to GitHub
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      <ExecutionModal
        matrix={matrix}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

