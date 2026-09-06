import React, { useState } from 'react';
import { renderTextOnMatrix, applyPresetPattern } from '../utils/matrixUtils';
import { Type, Heart, Bot, Flame, Shuffle, Wand2 } from 'lucide-react';

export default function PresetSelector({ matrix, setMatrix }) {
  const [customText, setCustomText] = useState('HI');
  const [presetLevel, setPresetLevel] = useState(4);

  const handleApplyText = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const newMatrix = renderTextOnMatrix(matrix, customText, presetLevel);
    setMatrix(newMatrix);
  };

  const handleApplyPreset = (presetType) => {
    const newMatrix = applyPresetPattern(matrix, presetType, presetLevel);
    setMatrix(newMatrix);
  };

  return (
    <div className="panel-card">
      <div className="panel-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wand2 size={20} style={{ color: 'var(--gh-level-4)' }} />
          <span>Preset Art & Generator</span>
        </div>
      </div>

      {/* Spell Custom Text Section */}
      <form onSubmit={handleApplyText} className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Type size={14} /> Spell Text on Matrix (A-Z)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            value={customText}
            onChange={(e) => setCustomText(e.target.value.toUpperCase())}
            placeholder="e.g. HELLO, GIT, WIN"
            maxLength={8}
          />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Spell Text
          </button>
        </div>
      </form>

      {/* Preset Pattern Cards Grid */}
      <div className="preset-grid">
        <div className="preset-card" onClick={() => handleApplyPreset('heart')}>
          <Heart size={24} style={{ color: '#f85149', margin: '0 auto' }} />
          <div className="preset-title">Heart Beats</div>
          <div className="preset-desc">Glowing hearts pattern</div>
        </div>

        <div className="preset-card" onClick={() => handleApplyPreset('invader')}>
          <Bot size={24} style={{ color: 'var(--gh-level-4)', margin: '0 auto' }} />
          <div className="preset-title">Space Invader</div>
          <div className="preset-desc">Retro pixel sprites</div>
        </div>

        <div className="preset-card" onClick={() => handleApplyPreset('streak-master')}>
          <Flame size={24} style={{ color: '#d29922', margin: '0 auto' }} />
          <div className="preset-title">Streak Master</div>
          <div className="preset-desc">100% full green year</div>
        </div>

        <div className="preset-card" onClick={() => handleApplyPreset('full-backfill')}>
          <Shuffle size={24} style={{ color: '#58a6ff', margin: '0 auto' }} />
          <div className="preset-title">Realistic Backfill</div>
          <div className="preset-desc">Natural contribution graph</div>
        </div>
      </div>
    </div>
  );
}
