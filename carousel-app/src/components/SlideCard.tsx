import React from 'react';
import type { Slide } from '../types';

interface Props {
  slide: Slide;
  index: number;
  total: number;
}

// All dimensions designed for 400x400 display.
// html-to-image exports at pixelRatio 2.7 → ~1080x1080px Instagram square.
const S = 400;

const base: React.CSSProperties = {
  width: S,
  height: S,
  position: 'relative',
  overflow: 'hidden',
  fontFamily: "'Inter', system-ui, sans-serif",
  flexShrink: 0,
};

const RED = '#e94560';
const GOLD = '#f4a832';
const WHITE = '#ffffff';
const MUTED = 'rgba(255,255,255,0.35)';

function SlideCounter({ index, total }: { index: number; total: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 24,
        fontSize: 11,
        fontWeight: 600,
        color: MUTED,
        letterSpacing: '0.08em',
      }}
    >
      {index + 1} / {total}
    </div>
  );
}

function Brand() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 18,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 9,
        fontWeight: 700,
        color: MUTED,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
      }}
    >
      Gospel Grounded
    </div>
  );
}

export function SlideCard({ slide, index, total }: Props) {
  if (slide.type === 'cover') {
    return (
      <div
        style={{
          ...base,
          background: 'radial-gradient(ellipse 80% 80% at 50% 60%, #1a0835 0%, #08080f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 36px',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%)`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Top accent line */}
        <div style={{ width: 44, height: 3, background: RED, borderRadius: 2, marginBottom: 28 }} />
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.1,
            margin: '0 0 20px',
            letterSpacing: '-0.02em',
          }}
        >
          {slide.title}
        </h1>
        <p
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: GOLD,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {slide.subtitle}
        </p>
        {/* Bottom accent line */}
        <div style={{ width: 44, height: 3, background: RED, borderRadius: 2, marginTop: 28 }} />
        <Brand />
      </div>
    );
  }

  if (slide.type === 'point') {
    return (
      <div
        style={{
          ...base,
          background: 'linear-gradient(160deg, #0c0f1e 0%, #08080f 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '36px 36px 52px',
        }}
      >
        {/* Ghost number */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 14,
            fontSize: 130,
            fontWeight: 900,
            color: RED,
            opacity: 0.08,
            lineHeight: 1,
            userSelect: 'none',
            letterSpacing: '-0.05em',
          }}
        >
          {slide.number}
        </div>
        <SlideCounter index={index} total={total} />
        {/* Point label */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: RED,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Point {slide.number}
        </div>
        {/* Divider */}
        <div style={{ width: 32, height: 2, background: RED, borderRadius: 1, marginBottom: 20 }} />
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.2,
            margin: '0 0 18px',
            letterSpacing: '-0.01em',
          }}
        >
          {slide.headline}
        </h2>
        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          {slide.body}
        </p>
        <Brand />
      </div>
    );
  }

  if (slide.type === 'scripture') {
    return (
      <div
        style={{
          ...base,
          background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #0d1a2e 0%, #08080f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '36px 40px 52px',
        }}
      >
        {/* Decorative quote mark */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 20,
            fontSize: 100,
            fontFamily: 'Georgia, serif',
            color: RED,
            opacity: 0.12,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          "
        </div>
        <SlideCounter index={index} total={total} />
        <p
          style={{
            fontSize: 17,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: WHITE,
            lineHeight: 1.7,
            margin: '0 0 24px',
          }}
        >
          "{slide.verse}"
        </p>
        <div style={{ width: 36, height: 2, background: RED, borderRadius: 1, marginBottom: 14 }} />
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {slide.reference}
        </p>
        <Brand />
      </div>
    );
  }

  if (slide.type === 'callout') {
    return (
      <div
        style={{
          ...base,
          background: 'linear-gradient(135deg, #150818 0%, #08080f 60%, #150818 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '36px 40px 52px',
        }}
      >
        {/* Center glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(233,69,96,0.08) 0%, transparent 70%)`,
          }}
        />
        <SlideCounter index={index} total={total} />
        <div style={{ width: 44, height: 3, background: RED, borderRadius: 2, marginBottom: 28 }} />
        <p
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.35,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {slide.statement}
        </p>
        <div style={{ width: 44, height: 3, background: RED, borderRadius: 2, marginTop: 28 }} />
        <Brand />
      </div>
    );
  }

  if (slide.type === 'cta') {
    return (
      <div
        style={{
          ...base,
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #1a0820 0%, #08080f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '36px 36px 52px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(233,69,96,0.07) 0%, transparent 70%)`,
          }}
        />
        <SlideCounter index={index} total={total} />
        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.2,
            margin: '0 0 28px',
            letterSpacing: '-0.02em',
          }}
        >
          {slide.headline}
        </h2>
        {/* CTA pill button (visual only) */}
        <div
          style={{
            background: RED,
            color: WHITE,
            fontSize: 14,
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: 50,
            letterSpacing: '0.04em',
          }}
        >
          {slide.action}
        </div>
        <Brand />
      </div>
    );
  }

  return null;
}
