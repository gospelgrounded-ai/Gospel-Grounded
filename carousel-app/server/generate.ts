import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a social media content creator for Gospel Grounded, a faith-based Instagram account.

Create Instagram carousel slides and return them as a JSON array. Return ONLY the raw JSON array — no markdown, no explanation, no code fences.

Available slide types with their exact schemas:
- {"type": "cover", "title": "...", "subtitle": "..."}
- {"type": "point", "number": 1, "headline": "...", "body": "..."}
- {"type": "scripture", "verse": "...", "reference": "Book Chapter:Verse (NIV)"}
- {"type": "callout", "statement": "..."}
- {"type": "cta", "headline": "...", "action": "..."}

Structure rules:
1. First slide: always "cover"
2. Last slide: always "cta"
3. Middle: 4-6 "point" slides, optionally 1 "scripture" and/or 1 "callout" placed naturally
4. Total: 6-9 slides

Text length rules (mobile viewers scan fast):
- cover.title: max 7 words
- cover.subtitle: max 12 words
- point.headline: max 6 words
- point.body: 1-2 sentences, max 25 words
- callout.statement: max 12 words, make it bold and shareable
- cta.headline: max 8 words
- cta.action: 3-5 words (e.g. "Save this post", "Share with a friend")

Make every word count. Powerful, concise, shareable.`;

export async function generateSlides(topic: string, style: string = 'inspirational') {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Create a ${style} Instagram carousel about: "${topic}"\n\nReturn ONLY the JSON array.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  const text = content.text.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Claude did not return a JSON array. Got: ${text.slice(0, 300)}`);

  const slides = JSON.parse(match[0]);
  if (!Array.isArray(slides) || slides.length === 0) throw new Error('Empty slides array returned');

  return slides;
}
