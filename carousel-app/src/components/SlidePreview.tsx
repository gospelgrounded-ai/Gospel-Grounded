import React, { useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import type { Slide, Theme } from '../types';
import { SlideCard } from './SlideCard';

interface Props {
  slides: Slide[];
  topic: string;
  theme?: Theme;
}

export function SlidePreview({ slides, topic, theme }: Props) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [rendering, setRendering] = useState(true);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Capture slides as PNG data-URLs.
  // Slides are rendered off-screen (position:fixed left:-9999px) so they
  // never cause horizontal overflow on mobile during processing.
  useEffect(() => {
    setRendering(true);
    setSlideImages([]);
    setRenderProgress(0);

    const renderAll = async () => {
      await new Promise((r) => setTimeout(r, 400));
      const images: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const el = slideRefs.current[i];
        if (el) {
          const url = await htmlToImage.toPng(el, { pixelRatio: 2.7, cacheBust: true });
          images.push(url);
          setRenderProgress(i + 1);
        }
      }
      setSlideImages(images);
      setRendering(false);
    };

    renderAll();
  }, [slides]);

  const downloadSlide = (index: number) => {
    const src = slideImages[index];
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `slide-${String(index + 1).padStart(2, '0')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = async () => {
    setDownloadingAll(true);
    for (let i = 0; i < slideImages.length; i++) {
      downloadSlide(i);
      await new Promise((r) => setTimeout(r, 400));
    }
    setDownloadingAll(false);
  };

  const pct = slides.length > 0 ? Math.round((renderProgress / slides.length) * 100) : 0;

  return (
    <div style={{ marginTop: 48 }}>

      {/* ── Off-screen capture zone ─────────────────────────────────────
          Slides sit outside the viewport (left: -9999px) so html-to-image
          can read them without causing any horizontal scroll on mobile.  */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: 400, pointerEvents: 'none', zIndex: -1 }}>
        {slides.map((slide, i) => (
          <div key={i} ref={(el) => { slideRefs.current[i] = el; }} style={{ marginBottom: 20, lineHeight: 0 }}>
            <SlideCard slide={slide} index={i} total={slides.length} theme={theme} />
          </div>
        ))}
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            {rendering ? `Preparing slides…` : `${slides.length} slides ready`}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>"{topic}"</p>
        </div>
        {!rendering && (
          <button
            onClick={downloadAll}
            disabled={downloadingAll}
            style={{
              padding: '10px 20px',
              background: 'rgba(233,69,96,0.15)',
              color: '#e94560',
              border: '1px solid rgba(233,69,96,0.35)',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: downloadingAll ? 'not-allowed' : 'pointer',
              opacity: downloadingAll ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {downloadingAll ? 'Downloading…' : '↓ Download All'}
          </button>
        )}
      </div>

      {/* ── Progress bar (capture phase) ────────────────────────────── */}
      {rendering && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: '#e94560',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            {renderProgress} of {slides.length} slides processed
          </p>
        </div>
      )}

      {/* ── Image grid (display phase) ──────────────────────────────────
          Uses min(300px, 100%) so the minimum column width never exceeds
          the container — gives a clean single column on narrow phones.  */}
      {!rendering && slideImages.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>📱</span>
            <span>Mobile: <strong style={{ color: 'rgba(255,255,255,0.5)' }}>long-press → Save to Photos</strong></span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Desktop: use download buttons</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
            gap: 16,
          }}>
            {slideImages.map((src, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
                />
                <button
                  onClick={() => downloadSlide(i)}
                  style={{
                    padding: '9px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 7,
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  ↓ Slide {i + 1}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
