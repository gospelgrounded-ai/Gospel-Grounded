import React, { useState, useCallback } from 'react';
import type { Slide, Caption, GenerateRequest, Theme } from './types';
import { IdeaForm } from './components/IdeaForm';
import { SlidePreview } from './components/SlidePreview';
import { CaptionPanel } from './components/CaptionPanel';

export default function App() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [theme, setTheme] = useState<Theme>('warm');

  const handleGenerate = useCallback(async (req: GenerateRequest) => {
    setLoading(true);
    setError(null);
    setSlides([]);
    setCaptions([]);
    setTopic(req.topic);
    if (req.theme) setTheme(req.theme);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setSlides(data.slides);
      setCaptions(data.captions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          padding: '28px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#e94560',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ✦
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Carousel Generator
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
            Gospel Grounded · AI-powered Instagram slides
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 40px 80px' }}>
        {/* Form card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '28px 32px',
            marginBottom: 8,
          }}
        >
          <IdeaForm onGenerate={handleGenerate} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(233,69,96,0.08)',
              border: '1px solid rgba(233,69,96,0.25)',
              borderRadius: 10,
              padding: '14px 18px',
              marginTop: 16,
              color: '#e94560',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(233,69,96,0.2)',
                borderTopColor: '#e94560',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 15, margin: '0 0 6px', color: 'rgba(255,255,255,0.7)' }}>
              Crafting your carousel…
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>Claude is writing your slides</p>
          </div>
        )}

        {/* Results */}
        {!loading && slides.length > 0 && (
          <>
            <SlidePreview slides={slides} topic={topic} theme={theme} />
            {captions.length > 0 && <CaptionPanel captions={captions} />}
          </>
        )}

        {/* Empty state */}
        {!loading && slides.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 15 }}>Enter your idea above to generate a carousel</p>
          </div>
        )}
      </main>
    </div>
  );
}
