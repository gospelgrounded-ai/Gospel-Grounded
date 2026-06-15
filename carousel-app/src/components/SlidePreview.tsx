import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import type { Slide } from '../types';
import { SlideCard } from './SlideCard';

interface Props {
  slides: Slide[];
  topic: string;
}

export function SlidePreview({ slides, topic }: Props) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const downloadSlide = async (index: number) => {
    const el = slideRefs.current[index];
    if (!el) return;
    setDownloading(index);
    try {
      const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2.7, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `slide-${String(index + 1).padStart(2, '0')}.png`;
      a.click();
    } finally {
      setDownloading(null);
    }
  };

  const downloadAll = async () => {
    setDownloadingAll(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        await downloadSlide(i);
        await new Promise((r) => setTimeout(r, 300));
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  const btnBase: React.CSSProperties = {
    border: 'none',
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}
          >
            {slides.length} slides ready
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>"{topic}"</p>
        </div>
        <button
          onClick={downloadAll}
          disabled={downloadingAll}
          style={{
            ...btnBase,
            padding: '10px 20px',
            background: 'rgba(233,69,96,0.15)',
            color: '#e94560',
            border: '1px solid rgba(233,69,96,0.35)',
            opacity: downloadingAll ? 0.5 : 1,
            cursor: downloadingAll ? 'not-allowed' : 'pointer',
          }}
        >
          {downloadingAll ? 'Downloading…' : '↓ Download All'}
        </button>
      </div>

      {/* Slide grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 20,
        }}
      >
        {slides.map((slide, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* The slide element — this is what gets captured for export */}
            <div
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              style={{ lineHeight: 0 }}
            >
              <SlideCard slide={slide} index={i} total={slides.length} />
            </div>
            <button
              onClick={() => downloadSlide(i)}
              disabled={downloading === i || downloadingAll}
              style={{
                ...btnBase,
                padding: '9px',
                background: 'rgba(255,255,255,0.05)',
                color:
                  downloading === i || downloadingAll ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                cursor:
                  downloading === i || downloadingAll ? 'not-allowed' : 'pointer',
              }}
            >
              {downloading === i ? 'Downloading…' : `↓ Slide ${i + 1}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
