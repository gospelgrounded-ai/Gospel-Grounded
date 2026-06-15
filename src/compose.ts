import Anthropic from "@anthropic-ai/sdk";
import { Transcript, GraphicCue, EditPlan, ColorGradeSettings, ZoomCue, CutPoint } from "./types";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GraphicCueSchema = z.object({
  type: z.enum(["text_overlay", "lower_third", "bullet_list", "comparison_chart", "title_card"]),
  startTime: z.number(),
  endTime: z.number(),
  data: z.record(z.unknown()),
});

const ColorGradeSchema = z.object({
  preset: z.enum(["cinematic", "warm", "cool", "punchy", "natural"]),
  brightness: z.number(),
  contrast: z.number(),
  saturate: z.number(),
  sepia: z.number(),
});

const ZoomCueSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  scale: z.number().min(1.0).max(1.3),
  originX: z.number().min(0).max(1),
  originY: z.number().min(0).max(1),
});

const CutPointSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  reason: z.string(),
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
Types available:
- text_overlay: { text: string, emphasis?: boolean }
- lower_third: { title: string, subtitle?: string }
- bullet_list: { heading?: string, items: string[] }
- comparison_chart: { leftLabel: string, rightLabel: string, rows: [{label, left, right}] }
- title_card: { title: string, subtitle?: string }

Rules:
- Space graphics at least 3 seconds apart
- Each graphic displays for 3–6 seconds
- Always add a title_card at startTime: 0
- Use text_overlay for key quotes (max 8 words)
- Use bullet_list when listing 3+ items
- Use comparison_chart when comparing two things
- Use lower_third when introducing a tool, person, or concept
- Align timing exactly with when that content is spoken

== COLOR GRADING ==
Choose ONE preset for the entire video and return its CSS filter values:
- cinematic: { preset: "cinematic", brightness: 0.95, contrast: 1.1, saturate: 0.85, sepia: 0.05 }
- warm:      { preset: "warm",      brightness: 1.05, contrast: 1.05, saturate: 1.1,  sepia: 0.15 }
- cool:      { preset: "cool",      brightness: 1.0,  contrast: 1.08, saturate: 0.9,  sepia: 0.0  }
- punchy:    { preset: "punchy",    brightness: 1.0,  contrast: 1.2,  saturate: 1.3,  sepia: 0.0  }
- natural:   { preset: "natural",   brightness: 1.0,  contrast: 1.0,  saturate: 1.0,  sepia: 0.0  }

Selection: Gospel/devotional → cinematic or warm. Tech tutorial → cool. High-energy → punchy. Neutral → natural.

== ZOOM CUES (all times in original video seconds) ==
- Maximum 1 zoom per 30 seconds of video
- Scale 1.1–1.2 (subtle — never jarring)
- Zoom duration 2–4 seconds
- Place zooms at emotionally resonant or high-impact moments
- originX: 0.5, originY: 0.5 for center zoom (default)

== JUMP CUTS (all times in original video seconds) ==
Remove ONLY these:
1. Filler words: "um", "uh", "er", "like" (as filler), "you know", "sort of", "kind of" — use word timestamps to isolate the exact word gap
2. Silences/pauses: gaps between consecutive words > 0.8 seconds
3. Repeated phrases: speaker restarts the same sentence

Rules:
- Minimum cut duration: 0.3 seconds
- Be conservative — preserve natural speech rhythm
- Do NOT cut mid-sentence pauses that are part of normal delivery
- Sort cutPoints by startTime ascending

Return ONLY valid JSON, no markdown, no explanation.`;

export async function planGraphics(
  transcript: Transcript,
  videoTitle: string = "Video"
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
  return {
    graphics: parsed.graphics as unknown as GraphicCue[],
    colorGrade: parsed.colorGrade as ColorGradeSettings,
    zoomCues: parsed.zoomCues as ZoomCue[],
    cutPoints: (parsed.cutPoints as CutPoint[]).sort((a, b) => a.startTime - b.startTime),
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
  fps: number = 30
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
  };
}
