import React, { useState } from 'react';
import { getMonthLabels, extractCommitsFromMatrix } from '../utils/matrixUtils';
import { Eraser, Paintbrush, RotateCcw, Sparkles, Shuffle, Repeat } from 'lucide-react';

export default function ContributionCanvas({ matrix, setMatrix, activeLevel, setActiveLevel }) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  const monthLabels = getMonthLabels(matrix);
  const dayNames = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const handleCellMouseDown = (weekIndex, dayIndex) => {
    setIsMouseDown(true);
    paintCell(weekIndex, dayIndex);
  };

  const handleCellMouseEnter = (weekIndex, dayIndex, cell) => {
    setHoveredCell(cell);
    if (isMouseDown) {
      paintCell(weekIndex, dayIndex);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const paintCell = (weekIndex, dayIndex) => {
    setMatrix(prevMatrix => {
      const nextMatrix = JSON.parse(JSON.stringify(prevMatrix));
      const targetCell = nextMatrix[weekIndex][dayIndex];
      if (targetCell && !targetCell.isFuture) {
        targetCell.level = activeLevel;
      }
      return nextMatrix;
    });
  };

  const clearCanvas = () => {
    setMatrix(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.forEach(week => week.forEach(cell => cell.level = 0));
      return next;
    });
  };

  const fillCanvas = (level) => {
    setMatrix(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.forEach(week => week.forEach(cell => {
        if (!cell.isFuture) cell.level = level;
      }));
      return next;
    });
  };

  const invertCanvas = () => {
    setMatrix(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.forEach(week => week.forEach(cell => {
        if (!cell.isFuture) {
          cell.level = cell.level === 0 ? 4 : 0;
        }
      }));
      return next;
    });
  };

  const randomizeCanvas = () => {
    setMatrix(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.forEach(week => week.forEach(cell => {
        if (!cell.isFuture) {
          cell.level = Math.random() > 0.35 ? Math.floor(Math.random() * 4) + 1 : 0;
        }
      }));
      return next;
    });
  };

  const commits = extractCommitsFromMatrix(matrix);
  const totalCommits = commits.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="panel-card" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="panel-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Paintbrush size={22} style={{ color: 'var(--gh-level-4)' }} />
          <span>Contribution Matrix Editor</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={invertCanvas} title="Invert graph colors">
            <Repeat size={13} /> Invert
          </button>
          <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={randomizeCanvas} title="Randomize commits">
            <Shuffle size={13} /> Random
          </button>
          <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={clearCanvas} title="Clear Canvas">
            <RotateCcw size={13} /> Clear
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => fillCanvas(activeLevel)} title="Fill entire grid">
            <Sparkles size={13} /> Fill
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="graph-wrapper">
        {/* Month Row Header */}
        <div className="graph-month-labels">
          {monthLabels.map((m, idx) => (
            <span
              key={idx}
              style={{
                gridColumnStart: m.weekIndex + 1,
                minWidth: '28px',
                textAlign: 'left'
              }}
            >
              {m.name}
            </span>
          ))}
        </div>

        {/* Day Name Rows + Matrix */}
        <div className="graph-body">
          <div className="graph-day-labels">
            {dayNames.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="graph-matrix">
            {matrix.map((week, wIdx) =>
              week.map((cell, dIdx) => (
                <div
                  key={`${wIdx}-${dIdx}`}
                  className={`cell level-${cell.level} ${cell.isFuture ? 'future-cell' : ''}`}
                  onMouseDown={() => handleCellMouseDown(wIdx, dIdx)}
                  onMouseEnter={() => handleCellMouseEnter(wIdx, dIdx, cell)}
                  style={{ opacity: cell.isFuture ? 0.15 : 1 }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toolbar & Level Selector */}
      <div className="toolbar-container">
        <div className="color-picker-group">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.4rem', fontWeight: 600 }}>
            Brush Intensity:
          </span>
          {[0, 1, 2, 3, 4].map(lvl => (
            <button
              key={lvl}
              className={`picker-btn level-${lvl} ${activeLevel === lvl ? 'active' : ''}`}
              style={{
                backgroundColor: lvl === 0 ? 'var(--gh-level-0)' : `var(--gh-level-${lvl})`
              }}
              onClick={() => setActiveLevel(lvl)}
              title={lvl === 0 ? 'Eraser (Level 0)' : `Level ${lvl} (${lvl * 3} commits)`}
            >
              {lvl === 0 && <Eraser size={13} style={{ color: 'var(--text-muted)' }} />}
            </button>
          ))}
        </div>

        {/* Tooltip & Info */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {hoveredCell ? (
            <span>
              <strong style={{ color: 'var(--text-main)' }}>{hoveredCell.dateString}</strong>: {hoveredCell.level === 0 ? 'No commits' : `${hoveredCell.level * 3} commits (Level ${hoveredCell.level})`}
            </span>
          ) : (
            <span>Drag mouse to paint on 365-day grid</span>
          )}
        </div>
      </div>
    </div>
  );
}
