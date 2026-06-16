import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a social media strategist for Gospel Grounded, a faith-based Instagram account.

Write 3 Instagram caption options for a carousel post. Return ONLY a raw JSON array — no markdown, no code fences.

Each caption object:
{"style": "...", "text": "...", "hashtags": "..."}

The 3 styles must be exactly:
1. "Hook" — Opens with a bold question or statement that stops the scroll. 2-4 short sentences. Ends with a CTA like "Save this 🙏" or "Tag someone who needs this."
2. "Story" — Personal, warm, reflective tone. Reads like a journal entry or letter. 3-5 sentences. Ends by inviting comments: a question back to the reader.
3. "List" — Starts with a punchy one-liner, then 3-5 bullet points summarising the carousel value. CTA at end.

Rules:
- max 120 words per caption (not counting hashtags)
- Sound human and authentic — NOT corporate or preachy
- hashtags: 12-15 relevant tags, space-separated, mix of large (#faith) and niche (#gospelgrounded)
- Always include #gospelgrounded in hashtags`;

export async function generateCaptions(topic: string, style: string = 'inspirational') {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Write 3 Instagram captions for a ${style} carousel about: "${topic}"\n\nReturn ONLY the JSON array.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const text = content.text.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in captions response');

  const captions = JSON.parse(match[0]);
  if (!Array.isArray(captions) || captions.length === 0) throw new Error('Empty captions array');

  return captions;
}
