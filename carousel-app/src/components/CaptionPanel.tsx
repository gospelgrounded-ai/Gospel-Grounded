import React, { useState } from 'react';
import type { Caption } from '../types';

interface Props {
  captions: Caption[];
}

const STYLE_COLORS: Record<string, string> = {
  Hook:  '#e94560',
  Story: '#c8a028',
  List:  '#5a7c28',
};

export function CaptionPanel({ captions }: Props) {
  const [copied, setCopied] = useState<number | null>(null);
  const [showHashtags, setShowHashtags] = useState<number | null>(null);

  const copy = async (index: number, text: string, hashtags: string) => {
    await navigator.clipboard.writeText(`${text}\n\n${hashtags}`);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ marginTop: 56 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Caption options
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          3 styles — tap Copy to grab caption + hashtags together
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {captions.map((cap, i) => {
          const accent = STYLE_COLORS[cap.style] ?? '#e94560';
          const isCopied = copied === i;
          const hashOpen = showHashtags === i;

          return (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `3px solid ${accent}`,
                borderRadius: '0 10px 10px 0',
                padding: '18px 20px',
              }}
            >
              {/* Style badge + copy button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: accent,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}>
                  {cap.style}
                </span>
                <button
                  onClick={() => copy(i, cap.text, cap.hashtags)}
                  style={{
                    padding: '6px 14px',
                    background: isCopied ? `${accent}22` : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isCopied ? accent : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 6,
                    color: isCopied ? accent : 'rgba(255,255,255,0.6)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isCopied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Caption text */}
              <p style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.82)',
                margin: '0 0 12px',
                whiteSpace: 'pre-wrap',
              }}>
                {cap.text}
              </p>

              {/* Hashtags — toggled */}
              <button
                onClick={() => setShowHashtags(hashOpen ? null : i)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'inherit',
                  letterSpacing: '0.04em',
                }}
              >
                {hashOpen ? '▲ Hide hashtags' : '▼ Show hashtags'}
              </button>
              {hashOpen && (
                <p style={{
                  fontSize: 12,
                  color: accent,
                  opacity: 0.75,
                  margin: '10px 0 0',
                  lineHeight: 1.8,
                  wordBreak: 'break-word',
                }}>
                  {cap.hashtags}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
