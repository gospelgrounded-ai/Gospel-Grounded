import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { generateSlides } from './generate';
import { generateCaptions } from './captions';

// In production the key comes from the host's env vars.
// Locally it falls back to the root .env file.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { topic, style } = req.body as { topic?: string; style?: string };

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    console.log(`\n→ Generating carousel: "${topic}" [${style || 'inspirational'}]`);
    const [slides, captions] = await Promise.all([
      generateSlides(topic.trim(), style),
      generateCaptions(topic.trim(), style),
    ]);
    console.log(`✓ Generated ${slides.length} slides + ${captions.length} captions`);

    res.json({ slides, captions });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to generate carousel',
    });
  }
});

// In production, serve the Vite-built frontend from ../dist
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Railway injects PORT; fall back to 3001 for local dev
const PORT = parseInt(process.env.PORT || process.env.CAROUSEL_PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Carousel server → http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
