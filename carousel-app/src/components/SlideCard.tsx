import React from 'react';
import type { Slide, Theme } from '../types';

interface Props {
  slide: Slide;
  index: number;
  total: number;
  theme?: Theme;
}

const S = 400;

// Each theme has two alternating backgrounds (light/dark) + accent color
const THEMES = {
  warm: {
    bg1: '#f0e6cc', text1: '#1a1008', // cream
    bg2: '#1a1008', text2: '#f0e6cc', // dark brown
    accent: '#c44820',
    grain: 0.07,
  },
  dark: {
    bg1: '#120e08', text1: '#f0e0b8', // espresso
    bg2: '#f0e0b8', text2: '#120e08', // pale gold
    accent: '#c8a028',
    grain: 0.06,
  },
  forest: {
    bg1: '#e8dfc0', text1: '#1a2010', // parchment
    bg2: '#1e2a14', text2: '#e8dfc0', // deep green
    accent: '#5a7c28',
    grain: 0.07,
  },
  terra: {
    bg1: '#c45020', text1: '#f5e8c0', // terracotta
    bg2: '#f5e8c0', text2: '#1a0f05', // cream
    accent: '#1a0f05',
    grain: 0.05,
  },
};

// Subtle grain texture overlay using SVG feTurbulence
function Grain({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity,
        mixBlendMode: 'overlay',
        backgroundSize: '160px 160px',
      }}
    />
  );
}

function Handle({ color }: { color: string }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 9,
      fontWeight: 700,
      color,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      opacity: 0.4,
      zIndex: 10,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      @gospelgrounded
    </div>
  );
}

function Counter({ index, total, color }: { index: number; total: number; color: string }) {
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 18,
      fontSize: 10,
      fontWeight: 600,
      color,
      opacity: 0.4,
      letterSpacing: '0.06em',
      zIndex: 10,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {index + 1}/{total}
    </div>
  );
}

export function SlideCard({ slide, index, total, theme = 'warm' }: Props) {
  const t = THEMES[theme];

  // Cover and CTA always use bg1; other slides alternate
  const useBg2 = (slide.type === 'point' || slide.type === 'callout') && index % 2 === 0;
  const bg = useBg2 ? t.bg2 : t.bg1;
  const text = useBg2 ? t.text2 : t.text1;
  const muted = `${text}70`;

  const base: React.CSSProperties = {
    width: S,
    height: S,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: bg,
    flexShrink: 0,
  };

  const ANTON: React.CSSProperties = {
    fontFamily: "'Anton', Impact, sans-serif",
    fontWeight: 400,
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.01em',
    lineHeight: 0.95,
  };

  if (slide.type === 'cover') {
    const words = slide.title.split(' ');
    const fontSize = words.length <= 3 ? 76 : words.length <= 5 ? 62 : 50;
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 0 48px' }}>
        <Grain opacity={t.grain} />
        {/* Top accent rule */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: t.accent, zIndex: 10 }} />
        <div style={{ padding: '0 26px', position: 'relative', zIndex: 10 }}>
          {words.map((word, wi) => (
            <div key={wi} style={{ ...ANTON, fontSize, color: text }}>
              {word}
            </div>
          ))}
          <div style={{
            marginTop: 18,
            fontSize: 12,
            fontWeight: 400,
            color: muted,
            lineHeight: 1.55,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {slide.subtitle}
          </div>
        </div>
        <Handle color={text} />
      </div>
    );
  }

  if (slide.type === 'point') {
    const headlineSize = slide.headline.length < 18 ? 52 : slide.headline.length < 28 ? 42 : 32;
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 0 48px' }}>
        <Grain opacity={t.grain} />
        {/* Ghost number */}
        <div style={{
          position: 'absolute',
          top: -30,
          left: -6,
          ...ANTON,
          fontSize: 240,
          color: text,
          opacity: 0.05,
          lineHeight: 1,
          userSelect: 'none',
          zIndex: 1,
        }}>
          {slide.number}
        </div>
        <Counter index={index} total={total} color={text} />
        <div style={{ padding: '0 26px', position: 'relative', zIndex: 10 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: t.accent,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 14,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {String(slide.number).padStart(2, '0')} —
          </div>
          <div style={{ ...ANTON, fontSize: headlineSize, color: text, marginBottom: 16 }}>
            {slide.headline}
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 300,
            color: muted,
            lineHeight: 1.7,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {slide.body}
          </div>
        </div>
        <Handle color={text} />
      </div>
    );
  }

  if (slide.type === 'scripture') {
    // Smaller verse font when the text is long
    const verseFontSize = slide.verse.length > 180 ? 14 : slide.verse.length > 120 ? 16 : 19;
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 34px 48px' }}>
        <Grain opacity={t.grain} />
        {/* Decorative quote — pushed above the top edge so it never overlaps content */}
        <div style={{
          position: 'absolute',
          top: -60,
          left: 10,
          fontFamily: 'Georgia, serif',
          fontSize: 180,
          color: text,
          opacity: 0.07,
          lineHeight: 1,
          userSelect: 'none',
          zIndex: 1,
        }}>"</div>
        <Counter index={index} total={total} color={text} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
          {/* Context line — shown when verse is part of a series */}
          {slide.context && (
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
              padding: '0 4px',
            }}>
              {slide.context}
            </p>
          )}
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: verseFontSize,
            fontStyle: 'italic',
            fontWeight: 400,
            color: text,
            lineHeight: 1.75,
            margin: '0 0 26px',
          }}>
            "{slide.verse}"
          </p>
          <div style={{ width: 28, height: 2, background: t.accent, margin: '0 auto 16px' }} />
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: t.accent,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            {slide.reference}
          </p>
        </div>
        <Handle color={text} />
      </div>
    );
  }

  if (slide.type === 'quote') {
    const quoteSize = slide.quote.length < 80 ? 20 : slide.quote.length < 140 ? 17 : 14;
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 30px 48px' }}>
        <Grain opacity={t.grain} />
        {/* Large decorative open-quote — pushed above edge so it never covers text */}
        <div style={{
          position: 'absolute',
          top: -65,
          left: 18,
          fontFamily: 'Georgia, serif',
          fontSize: 200,
          color: t.accent,
          opacity: 0.13,
          lineHeight: 1,
          userSelect: 'none',
          zIndex: 1,
        }}>"</div>
        <Counter index={index} total={total} color={text} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: quoteSize,
            fontStyle: 'italic',
            fontWeight: 400,
            color: text,
            lineHeight: 1.7,
            margin: '0 0 24px',
          }}>
            "{slide.quote}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 2, background: t.accent, flexShrink: 0 }} />
            <div>
              <div style={{
                fontFamily: "'Anton', Impact, sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: text,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1.2,
              }}>
                {slide.author}
              </div>
              {slide.authorTitle && (
                <div style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 400,
                  color: muted,
                  marginTop: 2,
                  letterSpacing: '0.04em',
                }}>
                  {slide.authorTitle}
                </div>
              )}
            </div>
          </div>
        </div>
        <Handle color={text} />
      </div>
    );
  }

  if (slide.type === 'callout') {
    const stmtSize = slide.statement.length < 25 ? 50 : slide.statement.length < 40 ? 38 : 28;
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px 48px' }}>
        <Grain opacity={t.grain} />
        {/* Left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: t.accent, zIndex: 10 }} />
        <Counter index={index} total={total} color={text} />
        <div style={{ ...ANTON, fontSize: stmtSize, color: text, position: 'relative', zIndex: 10 }}>
          {slide.statement}
        </div>
        <Handle color={text} />
      </div>
    );
  }

  if (slide.type === 'cta') {
    const headlineSize = slide.headline.length < 20 ? 52 : slide.headline.length < 32 ? 40 : 30;
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px 48px' }}>
        <Grain opacity={t.grain} />
        {/* Bottom accent rule */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: t.accent, zIndex: 10 }} />
        <Counter index={index} total={total} color={text} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ ...ANTON, fontSize: headlineSize, color: text, marginBottom: 26 }}>
            {slide.headline}
          </div>
          <div style={{
            display: 'inline-block',
            background: t.accent,
            color: t.bg1,
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '10px 22px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {slide.action}
          </div>
        </div>
        <Handle color={text} />
      </div>
    );
  }

  return null;
}
