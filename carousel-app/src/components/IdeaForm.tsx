import React, { useState } from 'react';
import type { GenerateRequest } from '../types';

interface Props {
  onGenerate: (req: GenerateRequest) => void;
  loading: boolean;
}

export function IdeaForm({ onGenerate, loading }: Props) {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<GenerateRequest['style']>('inspirational');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    onGenerate({ topic: topic.trim(), style });
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 8,
  };

  const canSubmit = topic.trim().length > 0 && !loading;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Your idea or topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='e.g. "5 reasons prayer changes everything" or "How to trust God in hard times"'
          rows={3}
          style={{
            ...inputStyle,
            width: '100%',
            padding: '14px 16px',
            resize: 'vertical',
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(233,69,96,0.5)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>Tone</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as GenerateRequest['style'])}
            style={{
              ...inputStyle,
              padding: '11px 14px',
              cursor: 'pointer',
              appearance: 'none',
              paddingRight: 36,
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
            background: canSubmit ? '#e94560' : 'rgba(233,69,96,0.25)',
            color: canSubmit ? '#fff' : 'rgba(255,255,255,0.4)',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, color 0.2s',
            letterSpacing: '0.03em',
          }}
        >
          {loading ? '✦ Generating…' : '✦ Generate Carousel'}
        </button>
      </div>
    </form>
  );
}
