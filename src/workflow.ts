import * as path from "path";
import * as fs from "fs";
import * as readline from "readline";
import { config } from "dotenv";
config();

import { transcribeVideo, shortenWordGaps } from "./transcribe";
import { planGraphics, buildEditPlan } from "./compose";
import { renderVideo } from "./render";
import { EditPlan } from "./types";

const MAX_GAP = parseFloat(process.env.MAX_WORD_GAP ?? "0.2");
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./out";

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

export async function runPipeline(
  videoPath: string,          // filesystem path for FFmpeg (audio extraction)
  videoTitle: string,
  outputDir: string,
  onProgress: (msg: string) => void = console.log,
  remotionVideoUrl?: string   // HTTP URL for Remotion renderer (falls back to videoPath)
): Promise<string> {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  onProgress("Extracting audio and transcribing with Whisper...");
  const { transcript: rawTranscript, duration } = await transcribeVideo(videoPath);
  const transcript = shortenWordGaps(rawTranscript, MAX_GAP);

  onProgress("Planning edits with Claude (color grade, zooms, cuts, graphics)...");
  const { graphics, colorGrade, zoomCues, cutPoints } = await planGraphics(transcript, videoTitle);

  // EditPlan.videoPath must be accessible by Remotion's Chromium renderer via HTTP
  const planVideoPath = remotionVideoUrl ?? videoPath;
  const plan = buildEditPlan(
    planVideoPath, transcript, graphics, colorGrade, zoomCues, cutPoints, duration
  );

  const planCachePath = path.join(outputDir, `${videoTitle}.plan.json`);
  fs.writeFileSync(planCachePath, JSON.stringify(plan, null, 2));

  onProgress("Rendering final video with Remotion...");
  const outputPath = path.join(outputDir, `${videoTitle}_edited.mp4`);
  await renderVideo(plan, outputPath, onProgress);

  return outputPath;
}

async function run() {
  const videoPath = process.argv[2] ?? process.env.INPUT_VIDEO_PATH;
  if (!videoPath || !fs.existsSync(videoPath)) {
    console.error("Usage: ts-node src/workflow.ts <path-to-video.mp4>");
    console.error("       or set INPUT_VIDEO_PATH in .env");
    process.exit(1);
  }

  const videoTitle = path.basename(videoPath, path.extname(videoPath));
  const planCachePath = path.join(OUTPUT_DIR, `${videoTitle}.plan.json`);

  console.log("=== Gospel Grounded Automated Video Editor ===\n");
  console.log(`Video: ${videoPath}`);

  let plan: EditPlan;

  if (fs.existsSync(planCachePath)) {
    const reuse = await ask(`Cached edit plan found. Reuse it? (y/n): `);
    if (reuse.toLowerCase().startsWith("y")) {
      plan = JSON.parse(fs.readFileSync(planCachePath, "utf-8"));
      console.log("Loaded cached plan.");
    } else {
      plan = await buildPlan(videoPath, videoTitle, planCachePath);
    }
  } else {
    plan = await buildPlan(videoPath, videoTitle, planCachePath);
  }

  const cutCount = plan.cutPoints?.length ?? 0;
  const zoomCount = plan.zoomCues?.length ?? 0;
  console.log(`\nColor grade: ${plan.colorGrade?.preset ?? "none"}`);
  console.log(`Graphics: ${plan.graphics.length}`);
  plan.graphics.forEach((g, i) => {
    console.log(`  ${i + 1}. [${g.startTime.toFixed(1)}s–${g.endTime.toFixed(1)}s] ${g.type}`);
  });
  console.log(`Zoom cues: ${zoomCount}`);
  console.log(`Jump cuts: ${cutCount}`);

  const action = await ask(
    "\nWhat would you like to do?\n  1. Preview in Remotion Studio\n  2. Render final video\n  3. Both\n  q. Quit\nChoice: "
  );

  if (action === "q") {
    console.log("Exiting.");
    return;
  }

  if (action === "1" || action === "3") {
    await launchStudio(plan);
  }

  if (action === "2" || action === "3") {
    const outputPath = path.join(OUTPUT_DIR, `${videoTitle}_edited.mp4`);
    await renderVideo(plan, outputPath);
    console.log(`\nFinal video saved to: ${outputPath}`);
  }
}

async function buildPlan(
  videoPath: string,
  videoTitle: string,
  cachePath: string
): Promise<EditPlan> {
  const { transcript: rawTranscript, duration } = await transcribeVideo(videoPath);

  console.log(`\nTranscription complete. Duration: ${duration.toFixed(1)}s`);
  console.log(`Shortening word gaps > ${MAX_GAP}s...`);
  const transcript = shortenWordGaps(rawTranscript, MAX_GAP);

  console.log("\nAsking Claude to plan the edit...");
  const { graphics, colorGrade, zoomCues, cutPoints } = await planGraphics(transcript, videoTitle);

  const plan = buildEditPlan(
    videoPath, transcript, graphics, colorGrade, zoomCues, cutPoints, duration
  );

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(plan, null, 2));
  console.log(`Plan cached to ${cachePath}`);

  return plan;
}

async function launchStudio(plan: EditPlan) {
  const { execSync } = await import("child_process");
  const planArg = JSON.stringify(JSON.stringify({ plan }));
  const port = parseInt(process.env.REMOTION_PORT ?? "3000");
  const studioCmd = `npx remotion studio src/Root.tsx --props=${planArg} --port=${port}`;

  console.log(`\nLaunching Remotion Studio on http://localhost:${port} ...`);
  console.log("Press Ctrl+C to stop the studio and continue.\n");

  try {
    execSync(studioCmd, { stdio: "inherit" });
  } catch {
    // user quit studio with Ctrl+C — that's expected
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error("Workflow error:", err);
    process.exit(1);
  });
}
