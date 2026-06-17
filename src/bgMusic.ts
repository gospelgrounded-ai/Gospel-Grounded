import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { MusicMood } from "./types";

const MOOD_KEYWORDS: Record<MusicMood, string[]> = {
  devotional:  ["devotional", "worship", "sacred", "hymn", "prayer", "gospel", "church"],
  energetic:   ["energetic", "upbeat", "powerful", "hype", "driving", "fast", "pump"],
  reflective:  ["reflective", "contemplative", "quiet", "meditation", "slow", "gentle", "thoughtful"],
  uplifting:   ["uplifting", "inspiring", "hopeful", "positive", "bright", "joyful", "triumphant"],
  peaceful:    ["peaceful", "calm", "ambient", "serene", "soft", "relaxing", "chill"],
  dramatic:    ["dramatic", "cinematic", "intense", "epic", "tense", "climactic", "dark"],
};

/** Scan musicDir for audio files and return the path of the best mood match. */
export function pickMusicTrack(mood: MusicMood, musicDir: string): string | null {
  if (!fs.existsSync(musicDir)) return null;

  const files = fs.readdirSync(musicDir).filter((f) => /\.(mp3|wav|m4a|aac|flac)$/i.test(f));
  if (files.length === 0) return null;

  const keywords = MOOD_KEYWORDS[mood] ?? [];

  const scored = files.map((f) => {
    const lower = f.toLowerCase();
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
    return { file: f, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // If nothing keyword-matched, fall back to a random track
  if (scored[0].score === 0) {
    const idx = Math.floor(Math.random() * files.length);
    return path.join(musicDir, files[idx]);
  }

  return path.join(musicDir, scored[0].file);
}

function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ], { stdio: "pipe" });
    let out = "";
    proc.stdout?.on("data", (d: Buffer) => { out += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve(parseFloat(out.trim()) || 60);
      else reject(new Error("ffprobe failed getting duration"));
    });
    proc.on("error", reject);
  });
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-y", ...args], { stdio: "pipe" });
    const stderr: string[] = [];
    proc.stderr?.on("data", (d: Buffer) => stderr.push(d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg bgMusic failed (code ${code}):\n${stderr.slice(-8).join("")}`));
    });
    proc.on("error", reject);
  });
}

/**
 * Mix a background music track into videoPath in-place with sidechain ducking.
 *
 * The speech audio acts as a sidechain trigger: whenever the speaker's voice
 * is above the threshold the music is compressed (ducked) automatically, then
 * released back up during pauses. This is the technique used in professional
 * podcast and YouTube mixes.
 *
 * Ducking parameters:
 *   threshold 0.02 (~−34 dBFS) — activates when voice is clearly present
 *   ratio     6:1              — strong but not total suppression
 *   attack    20 ms            — fast enough to catch word starts
 *   release   600 ms           — gradual fade-back so it doesn't pump
 */
export async function mixBgMusic(
  videoPath: string,
  trackPath: string,
  volumeDb = -18,
  onProgress?: (msg: string) => void
): Promise<void> {
  const log = (msg: string) => { console.log(msg); onProgress?.(msg); };

  log(`Mixing background music with ducking: ${path.basename(trackPath)}`);

  const duration = await getVideoDuration(videoPath);
  const fadeOutStart = Math.max(0, duration - 3).toFixed(2);
  const volumeLinear = Math.pow(10, volumeDb / 20).toFixed(5);

  const tmpPath = videoPath.replace(/\.mp4$/i, "_bgmusic.mp4");

  // [0:a] split → [speech] for final mix + [sc] as sidechain trigger
  // [1:a] → volume + fades → [bgm_raw]
  // sidechaincompress ducks [bgm_raw] whenever [sc] (speech) is loud → [bgm_ducked]
  // final mix: [speech] + [bgm_ducked]
  const musicFilter =
    `[0:a]asplit=2[speech][sc];` +
    `[1:a]volume=${volumeLinear},` +
    `afade=t=in:st=0:d=3,` +
    `afade=t=out:st=${fadeOutStart}:d=3[bgm_raw];` +
    `[bgm_raw][sc]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=600[bgm_ducked];` +
    `[speech][bgm_ducked]amix=inputs=2:duration=first:dropout_transition=2[outa]`;

  const args = [
    "-i", videoPath,
    "-stream_loop", "-1",   // loop track if it's shorter than the video
    "-i", trackPath,
    "-filter_complex", musicFilter,
    "-map", "0:v", "-c:v", "copy",
    "-map", "[outa]", "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    tmpPath,
  ];

  await runFfmpeg(args);
  fs.renameSync(tmpPath, videoPath);
  log("Background music mixed in.");
}
