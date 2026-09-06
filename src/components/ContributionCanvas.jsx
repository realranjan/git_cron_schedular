import React, { useState } from 'react';
import { getMonthLabels, extractCommitsFromMatrix, applyDateRangeFilter, createEmptyMatrix } from '../utils/matrixUtils';
import {
  Eraser,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Shuffle,
  Repeat,
  Calendar,
  Search,
  CheckSquare,
  SlidersHorizontal
} from 'lucide-react';

export default function ContributionCanvas({ matrix, setMatrix, activeLevel, setActiveLevel }) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Year & Filter States
  const [selectedYear, setSelectedYear] = useState('rolling'); // 'rolling', '2026', '2025', '2024', '2023'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]); // 0=Sun, 6=Sat
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const monthLabels = getMonthLabels(matrix);
  const dayNames = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const dayOptions = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
  ];

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setMatrix(createEmptyMatrix(year));
    if (year !== 'rolling') {
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

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

  // Quick Preset Handlers
  const handleQuickPreset = (type) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (type === 'last30') {
      const past30 = new Date(today);
      past30.setDate(today.getDate() - 30);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(todayStr);
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (type === 'last90') {
      const past90 = new Date(today);
      past90.setDate(today.getDate() - 90);
      setStartDate(past90.toISOString().split('T')[0]);
      setEndDate(todayStr);
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (type === 'year2026') {
      handleYearChange('2026');
    } else if (type === 'year2025') {
      handleYearChange('2025');
    } else if (type === 'year2024') {
      handleYearChange('2024');
    } else if (type === 'year2023') {
      handleYearChange('2023');
    } else if (type === 'weekdays') {
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (type === 'weekends') {
      setSelectedDays([0, 6]);
    } else if (type === 'reset') {
      handleYearChange('rolling');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setSearchQuery('');
    }
  };

  // Apply Batch Action on Selected Range
  const handleApplyRangeBatch = (mode) => {
    setMatrix(prev => applyDateRangeFilter(prev, {
      startDate,
      endDate,
      daysOfWeek: selectedDays,
      targetLevel: activeLevel,
      mode
    }));
  };

  const toggleDayFilter = (dayValue) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const commits = extractCommitsFromMatrix(matrix);

  return (
    <div className="panel-card" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header & Quick Action Buttons */}
      <div className="panel-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Paintbrush size={22} style={{ color: 'var(--gh-level-4)' }} />
          <span>Contribution Matrix Editor</span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Yearly View Switcher */}
          <div style={{ display: 'flex', background: 'rgba(3, 7, 18, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
            {['rolling', '2026', '2025', '2024', '2023'].map(yr => (
              <button
                key={yr}
                onClick={() => handleYearChange(yr)}
                style={{
                  background: selectedYear === yr ? 'var(--gh-level-4)' : 'transparent',
                  color: selectedYear === yr ? '#070a0f' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {yr === 'rolling' ? 'Past 365 Days' : yr}
              </button>
            ))}
          </div>

          <button
            className={`btn ${showFilterPanel ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <SlidersHorizontal size={13} /> Date Range & Filters
          </button>
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
            <Sparkles size={13} /> Fill Grid
          </button>
        </div>
      </div>

      {/* Date Range & Filter Expansion Panel */}
      {showFilterPanel && (
        <div style={{
          background: 'rgba(3, 7, 18, 0.75)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gh-level-4)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} /> Filter Commits by Year, Date Range & Days of Week
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Till Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Specific Date / Text</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2025-05-15 or May"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {/* Quick Presets & Day Checkboxes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Year & Presets:</span>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('year2026')}>Full 2026</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('year2025')}>Full 2025</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('year2024')}>Full 2024</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('year2023')}>Full 2023</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('last30')}>Last 30 Days</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('last90')}>Last 90 Days</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('weekdays')}>Weekdays</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('weekends')}>Weekends</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleQuickPreset('reset')}>Reset Filters</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {dayOptions.map(day => (
                <label key={day.value} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', color: selectedDays.includes(day.value) ? 'var(--gh-level-4)' : 'var(--text-dim)' }}>
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.value)}
                    onChange={() => toggleDayFilter(day.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          {/* Batch Range Execution Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleApplyRangeBatch('set')}>
              <CheckSquare size={13} /> Paint Level {activeLevel} on Filtered Range
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleApplyRangeBatch('random')}>
              <Shuffle size={13} /> Randomize Filtered Range
            </button>
            <button className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleApplyRangeBatch('clear')}>
              <Eraser size={13} /> Clear Filtered Range
            </button>
          </div>
        </div>
      )}

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
              week.map((cell, dIdx) => {
                const isMatchedBySearch = searchQuery && cell.dateString.includes(searchQuery);
                return (
                  <div
                    key={`${wIdx}-${dIdx}`}
                    className={`cell level-${cell.level} ${cell.isFuture ? 'future-cell' : ''}`}
                    onMouseDown={() => handleCellMouseDown(wIdx, dIdx)}
                    onMouseEnter={() => handleCellMouseEnter(wIdx, dIdx, cell)}
                    style={{
                      opacity: cell.isFuture ? 0.15 : 1,
                      outline: isMatchedBySearch ? '2px solid #38bdf8' : 'none',
                      transform: isMatchedBySearch ? 'scale(1.3)' : undefined,
                      zIndex: isMatchedBySearch ? 20 : undefined
                    }}
                  />
                );
              })
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
            <span>Viewing: <strong style={{ color: 'var(--gh-level-4)' }}>{selectedYear === 'rolling' ? 'Past 365 Days' : `Year ${selectedYear}`}</strong> | Drag mouse to paint grid</span>
          )}
        </div>
      </div>
    </div>
  );
}
