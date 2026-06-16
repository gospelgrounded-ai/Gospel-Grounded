import Anthropic from "@anthropic-ai/sdk";
import {
  Transcript,
  GraphicCue,
  EditPlan,
  ColorGradeSettings,
  ZoomCue,
  CutPoint,
  EditFeatures,
  GraphicStyleName,
} from "./types";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

// passthrough() keeps any extra fields (e.g. when Claude puts data fields flat instead of nested)
const GraphicCueSchema = z.object({
  type: z.enum(["text_overlay", "lower_third", "bullet_list", "comparison_chart", "title_card", "chapter_card"]),
  startTime: z.number(),
  endTime: z.number(),
  data: z.record(z.unknown()).optional(),
}).passthrough();

const ColorGradeSchema = z.object({
  preset: z.enum(["cinematic", "warm", "cool", "punchy", "natural", "studio_warm"]),
  brightness: z.number(),
  contrast: z.number(),
  saturate: z.number(),
  sepia: z.number(),
});

const ZoomCueSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  scale: z.number().min(1.0).max(1.3),
  originX: z.number().min(0).max(1).optional().default(0.5),
  originY: z.number().min(0).max(1).optional().default(0.5),
});

const CutPointSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  reason: z.string().optional().default("pause"),
});

const EditPlanSchema = z.object({
  graphics: z.array(GraphicCueSchema),
  colorGrade: ColorGradeSchema,
  zoomCues: z.array(ZoomCueSchema),
  cutPoints: z.array(CutPointSchema),
});

const SYSTEM_PROMPT = `You are a professional video editor AI for long-form YouTube content. Given a transcript with word-level timestamps, you plan graphics, color grading, smooth zoom effects, and jump cuts.

Your output must be valid JSON with exactly four keys: graphics, colorGrade, zoomCues, cutPoints.

== GRAPHICS ==
Each graphic object MUST have exactly these four fields: type, startTime, endTime, data.
The "data" field is a nested object — never put data fields at the top level of the graphic.

Example of CORRECT format:
{ "type": "title_card", "startTime": 0, "endTime": 5, "data": { "title": "Faith vs Works", "subtitle": "A Biblical Study" } }
{ "type": "chapter_card", "startTime": 62, "endTime": 67, "data": { "label": "PART ONE", "title": "THE PROBLEM" } }
{ "type": "text_overlay", "startTime": 45, "endTime": 50, "data": { "text": "Faith without works is dead", "emphasis": true } }
{ "type": "lower_third", "startTime": 90, "endTime": 95, "data": { "title": "James 2:17", "subtitle": "New Testament" } }
{ "type": "bullet_list", "startTime": 120, "endTime": 126, "data": { "heading": "Key Points", "items": ["Point one", "Point two", "Point three"] } }

Data shape per type:
- title_card:      { title: string, subtitle?: string }
- chapter_card:    { label?: string, title: string }
- text_overlay:    { text: string, emphasis?: boolean }
- lower_third:     { title: string, subtitle?: string }
- bullet_list:     { heading?: string, items: string[] }
- comparison_chart: { leftLabel: string, rightLabel: string, rows: [{label, left, right}] }

When to use each type — choose whichever fits the moment best:
- title_card:      ALWAYS at startTime: 0 for the video title. Never use again.
- chapter_card:    Full-screen cinematic interstitial for major section transitions. Use when the speaker clearly shifts to a new topic, numbered point, or named section (e.g. "Now let's look at...", "The second thing is...", "Part two:"). Display 4–5 seconds. Max 1 per 4 minutes. Label = section marker (e.g. "PART TWO", "THE SOLUTION"); title = the section name in 1–4 ALL CAPS words.
- text_overlay:    Short key quote or statistic (max 8 words), high-impact spoken line
- lower_third:     Introduce a scripture reference, person, tool, or named concept
- bullet_list:     3+ items being listed or enumerated by the speaker
- comparison_chart: Side-by-side contrast of two things

General rules:
- Space non-chapter graphics at least 3 seconds apart
- Each non-chapter graphic displays for 3–6 seconds
- chapter_cards may overlap or be close to other graphics — they dominate the screen
- Align all timing exactly with when that content is spoken

== COLOR GRADING ==
Choose ONE preset for the entire video and return its CSS filter values:
- cinematic:   { preset: "cinematic",   brightness: 0.95, contrast: 1.1,  saturate: 0.85, sepia: 0.05 }
- warm:        { preset: "warm",        brightness: 1.05, contrast: 1.05, saturate: 1.1,  sepia: 0.15 }
- cool:        { preset: "cool",        brightness: 1.0,  contrast: 1.08, saturate: 0.9,  sepia: 0.0  }
- punchy:      { preset: "punchy",      brightness: 1.0,  contrast: 1.2,  saturate: 1.3,  sepia: 0.0  }
- natural:     { preset: "natural",     brightness: 1.0,  contrast: 1.0,  saturate: 1.0,  sepia: 0.0  }
- studio_warm: { preset: "studio_warm", brightness: 1.0, contrast: 1.28, saturate: 0.87, sepia: 0.03 }

Selection: Gospel/devotional → studio_warm or cinematic. Tech tutorial → cool. High-energy → punchy. Neutral → natural.
studio_warm gives a medium-bright, high-contrast, slightly muted look with natural skin tones (dark moody background, punchy shadows, barely any colour cast — matches professional studio Gospel/church channels).

== ZOOM CUES (all times in original video seconds) ==
- Maximum 1 zoom per 30 seconds of video
- Scale 1.1–1.2 (subtle — never jarring)
- Zoom duration 2–4 seconds
- Place zooms at emotionally resonant or high-impact moments
- originX: 0.5, originY: 0.5 for center zoom (default)

== JUMP CUTS (all times in original video seconds) ==
Remove ONLY these — and be VERY conservative:
1. Filler words: "um", "uh", "er" — use word timestamps to isolate the exact word
2. Dead air / silences: gaps between consecutive words > 2.0 seconds (only obvious dead silence, NOT intentional dramatic pauses)
3. Obvious restarts: speaker clearly restarts the exact same sentence from the beginning

Rules:
- Minimum cut duration: 0.5 seconds
- DO NOT cut pauses shorter than 2.0 seconds — many are intentional for emphasis and rhythm
- DO NOT cut mid-sentence pauses — they are part of natural delivery
- DO NOT cut after rhetorical questions or before a key point
- Sort cutPoints by startTime ascending
- When in doubt, DO NOT cut

Return ONLY valid JSON, no markdown, no explanation.`;

const DEFAULT_FEATURES: EditFeatures = {
  colorGrade: true,
  zooms: true,
  jumpCuts: true,
  graphics: true,
};

const NATURAL_COLOR_GRADE: ColorGradeSettings = {
  preset: "natural",
  brightness: 1.0,
  contrast: 1.0,
  saturate: 1.0,
  sepia: 0.0,
};

export async function planGraphics(
  transcript: Transcript,
  videoTitle: string = "Video",
  features: EditFeatures = DEFAULT_FEATURES
): Promise<{ graphics: GraphicCue[]; colorGrade: ColorGradeSettings; zoomCues: ZoomCue[]; cutPoints: CutPoint[] }> {
  const transcriptText = transcript.segments
    .map((s) => {
      const words = s.words.map((w) => `[${w.start.toFixed(2)}s]${w.word}`).join(" ");
      return `[${s.start.toFixed(1)}s-${s.end.toFixed(1)}s] ${s.text}\n  words: ${words}`;
    })
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Video title: "${videoTitle}"
Video duration: ${transcript.duration.toFixed(1)} seconds

Transcript with word-level timestamps:
${transcriptText}

Plan the full edit. Return JSON with "graphics", "colorGrade", "zoomCues", and "cutPoints".`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return valid JSON for edit plan");

  const parsed = EditPlanSchema.parse(JSON.parse(jsonMatch[0]));

  // Normalise graphics: Claude sometimes returns type-specific fields flat on the object
  // (e.g. { type, startTime, endTime, title, subtitle }) instead of nested under "data".
  const graphics = parsed.graphics.map((g: Record<string, unknown>) => {
    if (g.data && typeof g.data === "object") return g;
    const { type, startTime, endTime, ...rest } = g;
    return { type, startTime, endTime, data: rest };
  }) as unknown as GraphicCue[];

  return {
    graphics: features.graphics ? graphics : [],
    colorGrade: features.colorGrade
      ? (parsed.colorGrade as ColorGradeSettings)
      : NATURAL_COLOR_GRADE,
    zoomCues: features.zooms ? (parsed.zoomCues as ZoomCue[]) : [],
    cutPoints: features.jumpCuts
      ? (parsed.cutPoints as CutPoint[]).sort((a, b) => a.startTime - b.startTime)
      : [],
  };
}

export function buildEditPlan(
  videoPath: string,
  transcript: Transcript,
  graphics: GraphicCue[],
  colorGrade: ColorGradeSettings,
  zoomCues: ZoomCue[],
  cutPoints: CutPoint[],
  duration: number,
  fps: number = 30,
  style: GraphicStyleName = "bold",
  features: EditFeatures = DEFAULT_FEATURES
): EditPlan {
  return {
    videoPath,
    transcript,
    graphics,
    colorGrade,
    zoomCues,
    cutPoints,
    fps,
    durationInSeconds: duration,
    style,
    features,
  };
}
