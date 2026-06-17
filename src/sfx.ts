import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { GraphicCue, CutPoint } from "./types";
import { remapTime } from "./editUtils";

// ── WAV synthesis ─────────────────────────────────────────────────────────────

function wavHeader(buf: Buffer, numSamples: number, sampleRate: number): void {
  const dataSize = numSamples * 2; // 16-bit mono
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);               // PCM
  buf.writeUInt16LE(1, 22);               // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);  // byte rate
  buf.writeUInt16LE(2, 32);               // block align
  buf.writeUInt16LE(16, 34);              // bits per sample
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
}

/** Linear frequency sweep (chirp) with exponential amplitude decay */
function chirp(
  startHz: number, endHz: number, durationSec: number,
  decay: number, volume: number, sr = 44100
): Buffer {
  const n = Math.floor(sr * durationSec);
  const buf = Buffer.alloc(44 + n * 2);
  wavHeader(buf, n, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const phase = 2 * Math.PI * (startHz * t + ((endHz - startHz) * t * t) / (2 * durationSec));
    const s = Math.sin(phase) * Math.exp(-decay * t) * volume;
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s * 32767))), 44 + i * 2);
  }
  return buf;
}

/** Pure sine tone with exponential decay */
function tone(hz: number, durationSec: number, decay: number, volume: number, sr = 44100): Buffer {
  const n = Math.floor(sr * durationSec);
  const buf = Buffer.alloc(44 + n * 2);
  wavHeader(buf, n, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const s = Math.sin(2 * Math.PI * hz * t) * Math.exp(-decay * t) * volume;
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s * 32767))), 44 + i * 2);
  }
  return buf;
}

// ── SFX library ───────────────────────────────────────────────────────────────
// Each entry: () => Buffer so sounds are only generated when needed.

const SFX_GENERATORS: Record<string, () => Buffer> = {
  // Cinematic downward sweep — 1200 Hz → 150 Hz over 0.45 s (whoosh)
  "whoosh.wav": () => chirp(1200, 150, 0.45, 2.5, 0.65),
  // Short upward sweep — 400 Hz → 900 Hz over 0.28 s (reveal / chart)
  "reveal.wav": () => chirp(400, 900, 0.28, 4, 0.5),
  // Quick pop at 700 Hz (text callout)
  "pop.wav":    () => tone(700, 0.12, 38, 0.5),
  // Rising slide — 260 Hz → 620 Hz over 0.22 s (lower third)
  "slide.wav":  () => chirp(260, 620, 0.22, 6, 0.42),
  // Light tick at 1400 Hz (bullet list item)
  "tick.wav":   () => tone(1400, 0.08, 65, 0.35),
};

const GRAPHIC_TO_SFX: Partial<Record<string, string>> = {
  title_card:       "whoosh.wav",
  chapter_card:     "whoosh.wav",
  text_overlay:     "pop.wav",
  lower_third:      "slide.wav",
  bullet_list:      "tick.wav",
  comparison_chart: "reveal.wav",
};

/** Write SFX WAV files to sfxDir if they don't already exist. */
export function ensureSfxFiles(sfxDir: string): void {
  if (!fs.existsSync(sfxDir)) fs.mkdirSync(sfxDir, { recursive: true });
  for (const [name, generate] of Object.entries(SFX_GENERATORS)) {
    const p = path.join(sfxDir, name);
    if (!fs.existsSync(p)) fs.writeFileSync(p, generate());
  }
}

// ── FFmpeg mixer ──────────────────────────────────────────────────────────────

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-y", ...args], { stdio: "pipe" });
    const stderr: string[] = [];
    proc.stderr?.on("data", (d: Buffer) => stderr.push(d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg SFX mix failed (code ${code}):\n${stderr.slice(-8).join("")}`));
    });
    proc.on("error", reject);
  });
}

/**
 * Mix sound effects into videoPath in-place.
 * Graphic timestamps are in original video time; they are remapped to edited
 * timeline (accounting for any jump cuts) before being used as FFmpeg delays.
 */
export async function mixSfx(
  videoPath: string,
  graphics: GraphicCue[],
  cutPoints: CutPoint[],
  sfxDir: string,
  sfxVolume = 0.18,
  onProgress?: (msg: string) => void
): Promise<void> {
  const log = (msg: string) => { console.log(msg); onProgress?.(msg); };

  const cues = graphics
    .map((g) => {
      const sfxFile = GRAPHIC_TO_SFX[g.type];
      if (!sfxFile) return null;
      const sfxPath = path.join(sfxDir, sfxFile);
      if (!fs.existsSync(sfxPath)) return null;
      const editedStart = remapTime(g.startTime, cutPoints);
      if (editedStart === null || editedStart < 0) return null;
      return { sfxPath, delayMs: Math.round(editedStart * 1000) };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (cues.length === 0) return;

  log(`Mixing ${cues.length} sound effects into video...`);

  const tmpPath = videoPath.replace(/\.mp4$/i, "_sfx.mp4");

  // Build FFmpeg -filter_complex
  // [0:a]          = the video's audio track
  // [1:a]..[N:a]   = each SFX, delayed to match its graphic's edited start time
  // amix           = blend them all together
  const filterParts: string[] = [];
  const mixInputs: string[] = ["[0:a]"];

  cues.forEach((cue, i) => {
    filterParts.push(
      `[${i + 1}:a]volume=${sfxVolume},adelay=${cue.delayMs}|${cue.delayMs}[sfx${i}]`
    );
    mixInputs.push(`[sfx${i}]`);
  });

  filterParts.push(
    `${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first[outa]`
  );

  const args: string[] = ["-i", videoPath];
  cues.forEach((c) => args.push("-i", c.sfxPath));
  args.push(
    "-filter_complex", filterParts.join(";"),
    "-map", "0:v", "-c:v", "copy",
    "-map", "[outa]", "-c:a", "aac", "-b:a", "192k",
    tmpPath
  );

  await runFfmpeg(args);
  fs.renameSync(tmpPath, videoPath);
  log("Sound effects mixed in.");
}
