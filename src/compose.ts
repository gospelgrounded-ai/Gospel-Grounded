import Anthropic from "@anthropic-ai/sdk";
import { Transcript, GraphicCue, EditPlan } from "./types";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GraphicCueSchema = z.object({
  type: z.enum(["text_overlay", "lower_third", "bullet_list", "comparison_chart", "title_card"]),
  startTime: z.number(),
  endTime: z.number(),
  data: z.record(z.unknown()),
});

const EditPlanSchema = z.object({
  graphics: z.array(GraphicCueSchema),
});

const SYSTEM_PROMPT = `You are a professional video editor AI. Given a video transcript with timestamps,
you plan which graphics and text overlays to add to enhance the video.

Your output must be valid JSON matching the schema for an array of graphic cues.

Graphic types available:
- text_overlay: { text: string, emphasis?: boolean }
- lower_third: { title: string, subtitle?: string }
- bullet_list: { heading?: string, items: string[] }
- comparison_chart: { leftLabel: string, rightLabel: string, rows: [{label, left, right}] }
- title_card: { title: string, subtitle?: string }

Rules:
- Space graphics at least 3 seconds apart
- Each graphic should display for 3-6 seconds
- Add a title_card at the very start (startTime: 0)
- Use text_overlay for key quotes or emphasis points (max 8 words)
- Use bullet_list when listing 3+ items
- Use comparison_chart when comparing two options/things
- Use lower_third when introducing a tool or concept
- Match graphic timing exactly to when the relevant content is spoken
- Return ONLY valid JSON, no explanation`;

export async function planGraphics(
  transcript: Transcript,
  videoTitle: string = "Video"
): Promise<GraphicCue[]> {
  const transcriptText = transcript.segments
    .map((s) => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Video title: "${videoTitle}"
Video duration: ${transcript.duration.toFixed(1)} seconds

Transcript with timestamps:
${transcriptText}

Plan the graphics for this video. Return a JSON object with a "graphics" array.`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return valid JSON for graphics plan");

  const parsed = EditPlanSchema.parse(JSON.parse(jsonMatch[0]));
  return parsed.graphics as unknown as GraphicCue[];
}

export function buildEditPlan(
  videoPath: string,
  transcript: Transcript,
  graphics: GraphicCue[],
  duration: number,
  fps: number = 30
): EditPlan {
  return {
    videoPath,
    transcript,
    graphics,
    fps,
    durationInSeconds: duration,
  };
}
