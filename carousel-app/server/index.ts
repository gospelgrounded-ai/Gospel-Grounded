import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { generateSlides } from './generate';

// Load .env from project root (parent of carousel-app/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { topic, style } = req.body as { topic?: string; style?: string };

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    console.log(`\n→ Generating carousel: "${topic}" [${style || 'inspirational'}]`);
    const slides = await generateSlides(topic.trim(), style);
    console.log(`✓ Generated ${slides.length} slides`);

    res.json({ slides });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to generate carousel',
    });
  }
});

const PORT = parseInt(process.env.CAROUSEL_PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Carousel API → http://localhost:${PORT}`);
});
