import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import { spawn } from "child_process";
import { BrollCue, CutPoint } from "./types";
import { remapTime } from "./editUtils";

const PEXELS_API = "https://api.pexels.com/videos/search";

interface PexelsVideoFile {
  quality: string;
  file_type: string;
  link: string;
}

interface PexelsVideo {
  duration: number;
  video_files: PexelsVideoFile[];
}

async function searchPexels(query: string, minDuration: number): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY ?? "";
  if (!apiKey) return null;

  const url = `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;

  return new Promise((resolve) => {
    const req = https.get(url, { headers: { Authorization: apiKey } }, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const videos: PexelsVideo[] = json.videos ?? [];
          const suitable = videos.find((v) => v.duration >= Math.max(minDuration, 3));
          if (!suitable) { resolve(null); return; }
          const file =
            suitable.video_files.find((f) => f.quality === "hd" && f.file_type === "video/mp4") ??
            suitable.video_files.find((f) => f.file_type === "video/mp4");
          resolve(file?.link ?? null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(15_000, () => { req.destroy(); resolve(null); });
  });
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    function doRequest(targetUrl: string, hops = 0) {
      if (hops > 5) { reject(new Error("Too many redirects")); return; }
      const proto = targetUrl.startsWith("https") ? https : http;
      proto.get(targetUrl, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode!) && res.headers.location) {
          res.resume();
          doRequest(res.headers.location, hops + 1);
          return;
        }
        if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode}`)); return; }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", reject);
        res.on("error", reject);
      }).on("error", reject);
    }
    doRequest(url);
  });
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-y", ...args], { stdio: "pipe" });
    const stderr: string[] = [];
    proc.stderr?.on("data", (d: Buffer) => stderr.push(d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg b-roll failed (code ${code}):\n${stderr.slice(-8).join("")}`));
    });
    proc.on("error", reject);
  });
}

/**
 * Fetch Pexels clips for each cue, download them, then composite over the
 * rendered video by replacing main footage during each b-roll window.
 * Cue timestamps are in original video time and remapped to the edited timeline.
 */
export async function fetchAndCompositeBroll(
  videoPath: string,
  brollCues: BrollCue[],
  cutPoints: CutPoint[],
  cacheDir: string,
  onProgress?: (msg: string) => void
): Promise<void> {
  const log = (msg: string) => { console.log(msg); onProgress?.(msg); };

  if (!process.env.PEXELS_API_KEY) {
    log("No PEXELS_API_KEY set — skipping b-roll.");
    return;
  }

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  // Remap cue times from original → edited timeline
  const mappedCues = brollCues
    .map((cue) => {
      const editedStart = remapTime(cue.startTime, cutPoints);
      const editedEnd   = remapTime(cue.endTime,   cutPoints);
      if (editedStart === null || editedEnd === null || editedEnd <= editedStart) return null;
      return { ...cue, editedStart, editedEnd, duration: editedEnd - editedStart };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (mappedCues.length === 0) return;

  log(`Fetching ${mappedCues.length} b-roll clip(s) from Pexels...`);

  type ReadyCue = { editedStart: number; editedEnd: number; duration: number; clipPath: string };
  const readyCues: ReadyCue[] = [];

  for (const cue of mappedCues) {
    // Use start time as part of cache key so reruns skip re-downloads
    const clipFile = path.join(cacheDir, `broll_${cue.editedStart.toFixed(1)}.mp4`);

    if (!fs.existsSync(clipFile)) {
      log(`  Searching Pexels: "${cue.query}"...`);
      const videoUrl = await searchPexels(cue.query, cue.duration);
      if (!videoUrl) { log(`  No result for "${cue.query}" — skipping.`); continue; }
      log(`  Downloading...`);
      await downloadFile(videoUrl, clipFile);
    }

    readyCues.push({ editedStart: cue.editedStart, editedEnd: cue.editedEnd, duration: cue.duration, clipPath: clipFile });
  }

  if (readyCues.length === 0) return;

  log(`Compositing ${readyCues.length} b-roll clip(s)...`);

  const tmpPath = videoPath.replace(/\.mp4$/i, "_broll.mp4");

  // Build filter_complex: for each b-roll window, trim + scale the clip, then
  // overlay it on the main video (replacing it) during that time range.
  const args: string[] = ["-i", videoPath];
  readyCues.forEach((c) => args.push("-i", c.clipPath));

  const filterParts: string[] = [];
  let currentVideo = "[0:v]";

  readyCues.forEach((cue, i) => {
    const inputIdx = i + 1;
    filterParts.push(
      `[${inputIdx}:v]trim=duration=${cue.duration.toFixed(3)},setpts=PTS-STARTPTS,` +
      `scale=1920:1080:force_original_aspect_ratio=decrease,` +
      `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[broll${i}]`
    );
    filterParts.push(
      `${currentVideo}[broll${i}]overlay=enable='between(t,${cue.editedStart.toFixed(3)},${cue.editedEnd.toFixed(3)})'[vout${i}]`
    );
    currentVideo = `[vout${i}]`;
  });

  args.push(
    "-filter_complex", filterParts.join(";"),
    "-map", currentVideo,
    "-map", "0:a",
    "-c:v", "libx264", "-crf", "18", "-preset", "fast",
    "-c:a", "copy",
    tmpPath
  );

  await runFfmpeg(args);
  fs.renameSync(tmpPath, videoPath);
  log("B-roll composited.");
}
