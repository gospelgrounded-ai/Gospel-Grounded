import React, { useState } from 'react';
import type { GenerateRequest, Theme } from '../types';

interface Props {
  onGenerate: (req: GenerateRequest) => void;
  loading: boolean;
}

const THEMES: { value: Theme; label: string; preview: string }[] = [
  { value: 'warm',   label: 'Warm',   preview: 'Cream & brown' },
  { value: 'dark',   label: 'Dark',   preview: 'Espresso & gold' },
  { value: 'forest', label: 'Forest', preview: 'Parchment & green' },
  { value: 'terra',  label: 'Terra',  preview: 'Terracotta & cream' },
];

export function IdeaForm({ onGenerate, loading }: Props) {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<GenerateRequest['style']>('inspirational');
  const [theme, setTheme] = useState<Theme>('warm');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    onGenerate({ topic: topic.trim(), style, theme });
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 10,
  };

  const canSubmit = topic.trim().length > 0 && !loading;

  const THEME_COLORS: Record<Theme, string> = {
    warm: '#c44820',
    dark: '#c8a028',
    forest: '#5a7c28',
    terra: '#c45020',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Your idea or topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='e.g. "5 reasons prayer changes everything" or "How to trust God in hard times"'
          rows={3}
          style={{ ...inputStyle, width: '100%', padding: '14px 16px', resize: 'vertical', lineHeight: 1.6 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(233,69,96,0.5)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
      </div>

      {/* Theme picker */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Color theme</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {THEMES.map((t) => {
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                style={{
                  padding: '10px 16px',
                  background: active ? `${THEME_COLORS[t.value]}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? THEME_COLORS[t.value] : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: THEME_COLORS[t.value], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                    {t.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingLeft: 18 }}>
                  {t.preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>Tone</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as GenerateRequest['style'])}
            style={{
              ...inputStyle,
              padding: '11px 36px 11px 14px',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23ffffff60' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            <option value="inspirational">Inspirational</option>
            <option value="educational">Educational</option>
            <option value="devotional">Devotional</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: '12px 28px',
            background: canSubmit ? '#e94560' : 'rgba(233,69,96,0.2)',
            color: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            letterSpacing: '0.03em',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {loading ? '✦ Generating…' : '✦ Generate Carousel'}
        </button>
      </div>
    </form>
  );
}
