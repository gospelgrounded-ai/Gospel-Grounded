import React, { useState } from 'react';
import type { HistoryEntry, GenerateRequest } from '../types';
import { clearHistory, deleteHistoryEntry } from '../utils/history';

interface Props {
  entries: HistoryEntry[];
  onRegenerate: (req: GenerateRequest) => void;
  onEntriesChange: (entries: HistoryEntry[]) => void;
}

const THEME_COLORS: Record<string, string> = {
  warm: '#c44820',
  dark: '#c8a028',
  forest: '#5a7c28',
  terra: '#c45020',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function HistoryPanel({ entries, onRegenerate, onEntriesChange }: Props) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  const handleClearAll = () => {
    clearHistory();
    onEntriesChange([]);
  };

  const handleDelete = (id: string) => {
    onEntriesChange(deleteHistoryEntry(id));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
        }}
      >
        <span>Recent carousels ({entries.length})</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          padding: '8px 0',
        }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {/* Theme dot */}
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: THEME_COLORS[entry.theme] ?? '#e94560',
                flexShrink: 0,
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {entry.topic}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {entry.slideCount} slides · {entry.style} · {timeAgo(entry.createdAt)}
                </div>
              </div>

              {/* Regenerate */}
              <button
                onClick={() => onRegenerate({ topic: entry.topic, style: entry.style as GenerateRequest['style'], theme: entry.theme })}
                title="Regenerate"
                style={{
                  padding: '5px 10px',
                  background: 'rgba(233,69,96,0.1)',
                  border: '1px solid rgba(233,69,96,0.25)',
                  borderRadius: 6,
                  color: '#e94560',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                ↺
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(entry.id)}
                title="Remove"
                style={{
                  padding: '5px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}

          <div style={{ padding: '10px 20px 4px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleClearAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.2)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear all history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
