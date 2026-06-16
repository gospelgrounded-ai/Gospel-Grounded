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
  // PNG data-URLs for each slide once captured
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [rendering, setRendering] = useState(true);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // After slides mount, auto-convert every slide to a PNG data-URL.
  // Once done, the <img> tags stay in the page permanently so mobile
  // users can long-press → "Save to Photos" without needing JS downloads.
  useEffect(() => {
    setRendering(true);
    setSlideImages([]);
    setRenderProgress(0);

    const renderAll = async () => {
      await new Promise((r) => setTimeout(r, 400)); // let DOM settle
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

  // Desktop download — triggers file save from stored data-URL
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

  const btnBase: React.CSSProperties = {
    border: 'none',
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            {rendering
              ? `Preparing slides… ${renderProgress} / ${slides.length}`
              : `${slides.length} slides ready`}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>"{topic}"</p>
        </div>
        {!rendering && (
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
        )}
      </div>

      {/* ── CAPTURE PHASE ──────────────────────────────────────────────
          Slides are rendered as React components so html-to-image can
          capture them. They stay visible while being processed so the
          user can see progress. Hidden once all images are ready.       */}
      <div style={{ display: rendering ? 'grid' : 'none', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { slideRefs.current[i] = el; }}
            style={{ lineHeight: 0 }}
          >
            <SlideCard slide={slide} index={i} total={slides.length} theme={theme} />
          </div>
        ))}
      </div>

      {/* ── DISPLAY PHASE ──────────────────────────────────────────────
          PNG <img> tags — persist on the page so mobile users can
          long-press → "Save to Photos" at any time.                    */}
      {!rendering && slideImages.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📱</span>
            <span>Mobile: <strong style={{ color: 'rgba(255,255,255,0.5)' }}>long-press any slide → "Save to Photos"</strong></span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Desktop: use the download buttons below</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {slideImages.map((src, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* The img tag is what mobile users long-press to save */}
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 4,
                  }}
                />
                <button
                  onClick={() => downloadSlide(i)}
                  style={{
                    ...btnBase,
                    padding: '9px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.65)',
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
