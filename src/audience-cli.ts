import * as path from "path";
import * as fs from "fs";
import { config } from "dotenv";
config();

import { transcribeVideo, shortenWordGaps } from "./transcribe";
import { generateAudienceReport, printAudienceReport } from "./audience";

const MAX_GAP = parseFloat(process.env.MAX_WORD_GAP ?? "0.2");
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./out";

async function run() {
  const videoPath = process.argv[2] ?? process.env.INPUT_VIDEO_PATH;
  if (!videoPath || !fs.existsSync(videoPath)) {
    console.error("Usage: npm run audience -- <path-to-video.mp4>");
    console.error("       or set INPUT_VIDEO_PATH in .env");
    process.exit(1);
  }

  const videoTitle = path.basename(videoPath, path.extname(videoPath));
  const transcriptCachePath = path.join(OUTPUT_DIR, `${videoTitle}.transcript.json`);
  const reportCachePath = path.join(OUTPUT_DIR, `${videoTitle}.audience.json`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("=== Gospel Grounded — Audience Targeting ===\n");
  console.log(`Video: ${videoPath}`);

  // Load or generate transcript
  let transcript: any;
  if (fs.existsSync(transcriptCachePath)) {
    console.log("Loading cached transcript...");
    transcript = JSON.parse(fs.readFileSync(transcriptCachePath, "utf-8"));
  } else {
    console.log("Transcribing video...");
    const { transcript: raw, duration } = await transcribeVideo(videoPath);
    transcript = shortenWordGaps(raw, MAX_GAP);
    transcript.duration = duration;
    fs.writeFileSync(transcriptCachePath, JSON.stringify(transcript, null, 2));
    console.log(`Transcript cached to ${transcriptCachePath}`);
  }

  const report = await generateAudienceReport(transcript, videoTitle);

  fs.writeFileSync(reportCachePath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${reportCachePath}`);

  printAudienceReport(report);
}

run().catch((err) => {
  console.error("Audience analysis error:", err);
  process.exit(1);
});
