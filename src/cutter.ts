import * as path from "path";
import * as fs from "fs";
import { spawnSync } from "child_process";
import { Transcript, TranscriptSegment, TranscriptWord } from "./types";

const FILLER_WORDS = new Set(["um", "uh", "hmm", "hm", "erm", "mhm"]);
const FILLER_PAD = 0.05; // seconds of silence to keep either side of a removed filler

// Pauses longer than this will be shortened (seconds)
const PAUSE_CUT_THRESHOLD = parseFloat(process.env.PAUSE_CUT_THRESHOLD ?? "1.0");
// How much silence to leave at each shortened pause (seconds)
const PAUSE_KEEP_DURATION = parseFloat(process.env.PAUSE_KEEP_DURATION ?? "0.3");

interface Interval {
  start: number;
  end: number;
}

function findRemoveIntervals(transcript: Transcript): Interval[] {
  const remove: Interval[] = [];

  for (const seg of transcript.segments) {
    for (const word of seg.words) {
      const clean = word.word.toLowerCase().replace(/[^a-z]/g, "");
      if (FILLER_WORDS.has(clean)) {
        remove.push({
          start: Math.max(0, word.start - FILLER_PAD),
          end: word.end + FILLER_PAD,
        });
      }
    }
  }

  // Shorten pauses between segments that exceed the threshold
  for (let i = 1; i < transcript.segments.length; i++) {
    const prev = transcript.segments[i - 1];
    const curr = transcript.segments[i];
    const gap = curr.start - prev.end;
    if (gap > PAUSE_CUT_THRESHOLD) {
      const halfKeep = PAUSE_KEEP_DURATION / 2;
      remove.push({
        start: prev.end + halfKeep,
        end: curr.start - halfKeep,
      });
    }
  }

  return mergeIntervals(remove.sort((a, b) => a.start - b.start));
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const merged: Interval[] = [{ ...intervals[0] }];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i].start <= last.end + 0.01) {
      last.end = Math.max(last.end, intervals[i].end);
    } else {
      merged.push({ ...intervals[i] });
    }
  }
  return merged;
}

function invertIntervals(remove: Interval[], duration: number): Interval[] {
  const keep: Interval[] = [];
  let cursor = 0;
  for (const r of remove) {
    if (r.start > cursor + 0.01) keep.push({ start: cursor, end: r.start });
    cursor = r.end;
  }
  if (cursor < duration - 0.01) keep.push({ start: cursor, end: duration });
  return keep;
}

function remapTranscript(transcript: Transcript, keepIntervals: Interval[]): Transcript {
  // For each keep interval, record where it starts in the output timeline
  const mapping: { inStart: number; inEnd: number; outStart: number }[] = [];
  let outCursor = 0;
  for (const k of keepIntervals) {
    mapping.push({ inStart: k.start, inEnd: k.end, outStart: outCursor });
    outCursor += k.end - k.start;
  }

  function remapTime(t: number): number | null {
    for (const m of mapping) {
      if (t >= m.inStart - 0.001 && t <= m.inEnd + 0.001) {
        return m.outStart + Math.max(0, t - m.inStart);
      }
    }
    return null;
  }

  const segments: TranscriptSegment[] = [];
  for (const seg of transcript.segments) {
    const newStart = remapTime(seg.start);
    const newEnd = remapTime(seg.end);
    if (newStart === null || newEnd === null) continue;

    const words: TranscriptWord[] = [];
    for (const w of seg.words) {
      const ws = remapTime(w.start);
      const we = remapTime(w.end);
      if (ws !== null && we !== null) {
        words.push({ ...w, start: ws, end: we });
      }
    }

    if (words.length > 0) {
      segments.push({ ...seg, start: newStart, end: newEnd, words });
    }
  }

  const newDuration = mapping.reduce((sum, m) => sum + (m.inEnd - m.inStart), 0);
  return { segments, fullText: segments.map((s) => s.text).join(" "), duration: newDuration };
}

/**
 * Cuts filler words and long pauses from a video using FFmpeg.
 * Returns the path to the cut video and a transcript with remapped timestamps.
 * If nothing needs cutting, returns the original video and transcript unchanged.
 */
export async function cutVideo(
  videoPath: string,
  transcript: Transcript,
  duration: number,
  outputDir: string
): Promise<{ cutVideoPath: string; adjustedTranscript: Transcript; cutDuration: number }> {
  const removeIntervals = findRemoveIntervals(transcript);

  if (removeIntervals.length === 0) {
    console.log("No fillers or long pauses detected — skipping cut step.");
    return { cutVideoPath: videoPath, adjustedTranscript: transcript, cutDuration: duration };
  }

  const keepIntervals = invertIntervals(removeIntervals, duration);
  if (keepIntervals.length === 0) {
    return { cutVideoPath: videoPath, adjustedTranscript: transcript, cutDuration: duration };
  }

  const adjustedTranscript = remapTranscript(transcript, keepIntervals);
  const cutDuration = keepIntervals.reduce((sum, k) => sum + (k.end - k.start), 0);

  const basename = path.basename(videoPath, path.extname(videoPath));
  const cutVideoPath = path.join(outputDir, `${basename}_cut.mp4`);
  const filterScriptPath = path.join(outputDir, `${basename}_filter.txt`);

  // Build FFmpeg filter_complex using a script file to avoid shell-quoting issues
  const filterLines: string[] = [];
  const inputLabels: string[] = [];

  for (let i = 0; i < keepIntervals.length; i++) {
    const { start, end } = keepIntervals[i];
    const dur = Math.max(0.1, end - start);
    const fadeDur = Math.min(0.03, dur / 4).toFixed(4);
    const fadeOutStart = (dur - parseFloat(fadeDur)).toFixed(4);

    filterLines.push(
      `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`,
      `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,` +
        `afade=t=in:st=0:d=${fadeDur},afade=t=out:st=${fadeOutStart}:d=${fadeDur}[a${i}]`
    );
    inputLabels.push(`[v${i}][a${i}]`);
  }

  filterLines.push(
    `${inputLabels.join("")}concat=n=${keepIntervals.length}:v=1:a=1[outv][outa]`
  );

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(filterScriptPath, filterLines.join("\n"));

  const fillerRemovals = removeIntervals.filter((r) => r.end - r.start < 0.5).length;
  const pauseRemovals = removeIntervals.length - fillerRemovals;
  console.log(
    `Cutting video: ${fillerRemovals} filler word(s), ${pauseRemovals} long pause(s) removed.`
  );

  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i", videoPath,
      "-filter_complex_script", filterScriptPath,
      "-map", "[outv]",
      "-map", "[outa]",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "18",
      "-c:a", "aac",
      "-b:a", "192k",
      cutVideoPath,
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  fs.unlinkSync(filterScriptPath);

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() ?? "";
    throw new Error(`FFmpeg cut failed:\n${stderr.slice(-2000)}`);
  }

  console.log(
    `Cut complete. New duration: ${cutDuration.toFixed(1)}s (original: ${duration.toFixed(1)}s)`
  );
  return { cutVideoPath, adjustedTranscript, cutDuration };
}
