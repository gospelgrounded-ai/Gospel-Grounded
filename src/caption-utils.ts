import Anthropic from "@anthropic-ai/sdk";
import { TranscriptSegment } from "./types";

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

// Break long caption lines at ~42 chars (subtitle broadcast standard)
function wrapCaptionLine(text: string, maxLen = 42): string {
  if (text.length <= maxLen) return text;
  const mid = Math.ceil(text.length / 2);
  const after = text.indexOf(" ", mid);
  const before = text.lastIndexOf(" ", mid);
  let breakAt: number;
  if (after === -1 && before === -1) breakAt = mid;
  else if (after === -1) breakAt = before;
  else if (before === -1) breakAt = after;
  else breakAt = Math.abs(mid - after) < Math.abs(mid - before) ? after : before;
  return text.slice(0, breakAt) + "\n" + text.slice(breakAt + 1);
}

export function generateSRT(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = formatSRTTime(seg.start);
      const end = formatSRTTime(seg.end);
      const text = wrapCaptionLine(seg.text.trim());
      return `${i + 1}\n${start} --> ${end}\n${text}`;
    })
    .join("\n\n");
}

export function generateVTT(segments: TranscriptSegment[]): string {
  const entries = segments
    .map((seg) => {
      const start = formatVTTTime(seg.start);
      const end = formatVTTTime(seg.end);
      const text = wrapCaptionLine(seg.text.trim());
      return `${start} --> ${end}\n${text}`;
    })
    .join("\n\n");
  return `WEBVTT\n\n${entries}`;
}

export async function generateTitleRecommendations(fullText: string): Promise<string[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a YouTube SEO and title expert. Based on this video transcript, generate 8 compelling video title recommendations that maximise click-through rate.

Rules:
- Each title must be 50–70 characters and specific to the actual content
- Mix formats across the 8: questions, "how to", numbered lists, bold declarations, curiosity hooks
- Zero generic titles — every word must feel earned by the transcript content
- Return ONLY a JSON array of strings, nothing else

Transcript:
${fullText.slice(0, 4000)}

JSON array only:`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") return [];

  const raw = block.text.trim();
  // Try direct parse first, then extract embedded array
  const attempts = [raw, (raw.match(/\[[\s\S]*\]/) ?? [])[0]].filter(Boolean);
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt!);
      if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === "string");
    } catch {
      // try next
    }
  }
  return [];
}
