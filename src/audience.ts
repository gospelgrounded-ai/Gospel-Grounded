import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { Transcript, AudienceReport, AudiencePersona, RelatedChannel } from "./types";
import { searchVideos, getChannelDetails, YouTubeChannel } from "./youtube";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Zod schemas ───────────────────────────────────────────────────────────────

const PersonaSchema = z.object({
  name: z.string(),
  description: z.string(),
  interests: z.array(z.string()),
  age_range: z.string(),
});

const AudienceAnalysisSchema = z.object({
  contentSummary: z.string(),
  primaryKeywords: z.array(z.string()),
  secondaryKeywords: z.array(z.string()),
  targetPersonas: z.array(PersonaSchema),
  suggestedTitle: z.string(),
  suggestedDescription: z.string(),
  suggestedTags: z.array(z.string()),
  suggestedHashtags: z.array(z.string()),
  communityPostSuggestion: z.string(),
  postingStrategy: z.string(),
  youtubeSearchQueries: z.array(z.string()),
});

const RankedChannelSchema = z.object({
  channelId: z.string(),
  channelTitle: z.string(),
  subscriberCount: z.string(),
  relevanceReason: z.string(),
});

// ── System prompts ────────────────────────────────────────────────────────────

const AUDIENCE_SYSTEM_PROMPT = `You are a YouTube audience strategy expert. Given a video transcript, you:
1. Identify who the ideal viewers are (demographics, interests, pain points).
2. Extract SEO keywords the YouTube algorithm will use to surface the video.
3. Write optimised metadata (title, description, tags, hashtags).
4. Suggest a YouTube Community post to share the video with the right audience.
5. Produce a 3–5 sentence posting strategy covering timing, cross-promotion, and engagement tactics.
6. Generate 3 YouTube search queries to find channels already serving this audience.

Output ONLY valid JSON matching this schema exactly:
{
  "contentSummary": "string",
  "primaryKeywords": ["string"],
  "secondaryKeywords": ["string"],
  "targetPersonas": [{ "name": "string", "description": "string", "interests": ["string"], "age_range": "string" }],
  "suggestedTitle": "string",
  "suggestedDescription": "string",
  "suggestedTags": ["string"],
  "suggestedHashtags": ["string"],
  "communityPostSuggestion": "string",
  "postingStrategy": "string",
  "youtubeSearchQueries": ["string"]
}`;

// ── Core functions ────────────────────────────────────────────────────────────

async function analyseWithClaude(
  transcript: Transcript,
  videoTitle: string
): Promise<z.infer<typeof AudienceAnalysisSchema>> {
  const transcriptText = transcript.segments
    .map((s) => `[${s.start.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: AUDIENCE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Video title: "${videoTitle}"\nDuration: ${transcript.duration.toFixed(0)}s\n\nTranscript:\n${transcriptText}\n\nGenerate the full audience targeting analysis as JSON.`,
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned no JSON for audience analysis");

  return AudienceAnalysisSchema.parse(JSON.parse(jsonMatch[0]));
}

async function rankChannels(
  channels: YouTubeChannel[],
  contentSummary: string,
  keywords: string[]
): Promise<RelatedChannel[]> {
  if (channels.length === 0) return [];

  const channelList = channels
    .map(
      (c) =>
        `ID: ${c.id} | Title: ${c.title} | Subs: ${c.subscriberCount} | ${c.description.slice(0, 120)}`
    )
    .join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "You select the most relevant YouTube channels for a video's target audience. Return JSON only.",
    messages: [
      {
        role: "user",
        content: `Content: ${contentSummary}\nKeywords: ${keywords.join(", ")}\n\nChannels:\n${channelList}\n\nPick the top 5 most relevant and return:\n{"ranked":[{"channelId":"","channelTitle":"","subscriberCount":"","relevanceReason":""}]}`,
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return z.array(RankedChannelSchema).parse(parsed.ranked ?? []);
  } catch {
    return [];
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateAudienceReport(
  transcript: Transcript,
  videoTitle: string
): Promise<AudienceReport> {
  console.log("\n[Audience] Analysing content with Claude...");
  const analysis = await analyseWithClaude(transcript, videoTitle);

  let relatedChannels: RelatedChannel[] = [];

  if (process.env.YOUTUBE_API_KEY) {
    console.log("[Audience] Researching YouTube niche...");
    const videoResults = await Promise.all(
      analysis.youtubeSearchQueries.slice(0, 3).map((q) => searchVideos(q, 5))
    );

    const channelMap = new Map<string, string>();
    for (const video of videoResults.flat()) {
      if (!channelMap.has(video.channelId)) {
        channelMap.set(video.channelId, video.channelTitle);
      }
    }

    const channelIds = Array.from(channelMap.keys()).slice(0, 12);
    if (channelIds.length > 0) {
      const channels = await getChannelDetails(channelIds);
      console.log(`[Audience] Ranking ${channels.length} candidate channels...`);
      relatedChannels = await rankChannels(
        channels,
        analysis.contentSummary,
        analysis.primaryKeywords
      );
    }
  } else {
    console.log("[Audience] YOUTUBE_API_KEY not set — skipping channel research.");
  }

  return {
    videoTitle,
    generatedAt: new Date().toISOString(),
    contentSummary: analysis.contentSummary,
    targetPersonas: analysis.targetPersonas,
    primaryKeywords: analysis.primaryKeywords,
    secondaryKeywords: analysis.secondaryKeywords,
    suggestedTitle: analysis.suggestedTitle,
    suggestedDescription: analysis.suggestedDescription,
    suggestedTags: analysis.suggestedTags,
    suggestedHashtags: analysis.suggestedHashtags,
    relatedChannels,
    communityPostSuggestion: analysis.communityPostSuggestion,
    postingStrategy: analysis.postingStrategy,
  };
}

export function printAudienceReport(report: AudienceReport): void {
  const line = "─".repeat(60);
  console.log(`\n${line}`);
  console.log("  AUDIENCE TARGETING REPORT");
  console.log(line);
  console.log(`\nVideo : ${report.videoTitle}`);
  console.log(`Date  : ${report.generatedAt}`);

  console.log(`\n${line}`);
  console.log("CONTENT SUMMARY");
  console.log(line);
  console.log(report.contentSummary);

  console.log(`\n${line}`);
  console.log("TARGET PERSONAS");
  console.log(line);
  for (const p of report.targetPersonas) {
    console.log(`\n  ${p.name} (${p.age_range})`);
    console.log(`  ${p.description}`);
    console.log(`  Interests: ${p.interests.join(", ")}`);
  }

  console.log(`\n${line}`);
  console.log("SEO METADATA");
  console.log(line);
  console.log(`\nTitle       : ${report.suggestedTitle}`);
  console.log(`\nDescription :\n${report.suggestedDescription}`);
  console.log(`\nPrimary tags: ${report.primaryKeywords.join(", ")}`);
  console.log(`All tags    : ${report.suggestedTags.join(", ")}`);
  console.log(`Hashtags    : ${report.suggestedHashtags.join(" ")}`);

  if (report.relatedChannels.length > 0) {
    console.log(`\n${line}`);
    console.log("CHANNELS TO TARGET / COLLABORATE WITH");
    console.log(line);
    for (const ch of report.relatedChannels) {
      const subs = parseInt(ch.subscriberCount, 10);
      const subsFmt = isNaN(subs)
        ? ch.subscriberCount
        : subs >= 1_000_000
        ? `${(subs / 1_000_000).toFixed(1)}M`
        : subs >= 1_000
        ? `${(subs / 1_000).toFixed(0)}K`
        : String(subs);
      console.log(`\n  ${ch.channelTitle} (${subsFmt} subs)`);
      console.log(`  Why: ${ch.relevanceReason}`);
    }
  }

  console.log(`\n${line}`);
  console.log("COMMUNITY POST");
  console.log(line);
  console.log(report.communityPostSuggestion);

  console.log(`\n${line}`);
  console.log("POSTING STRATEGY");
  console.log(line);
  console.log(report.postingStrategy);
  console.log(`\n${line}\n`);
}
