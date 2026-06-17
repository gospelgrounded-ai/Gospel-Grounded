import * as fs from "fs";
import { Transcript, CutPoint } from "./types";
import { remapTime } from "./editUtils";

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return (
    `${String(h).padStart(2, "0")}:` +
    `${String(m).padStart(2, "0")}:` +
    `${String(s).padStart(2, "0")},` +
    `${String(ms).padStart(3, "0")}`
  );
}

/**
 * Build a properly timed SRT from the transcript, with jump cuts removed.
 *
 * Words are grouped into caption blocks of up to 8 words. A new block starts
 * early if there is a natural pause > 1 s between words (e.g. after a cut or
 * a long breath), keeping captions aligned to speech rhythm.
 */
export function generateSrt(transcript: Transcript, cutPoints: CutPoint[]): string {
  // Flatten all words, filter out anything that falls inside a cut, remap times
  const retainedWords = transcript.segments
    .flatMap((seg) => seg.words)
    .map((w) => {
      const start = remapTime(w.start, cutPoints);
      const end   = remapTime(w.end,   cutPoints);
      if (start === null || end === null) return null;
      return { word: w.word.trim().replace(/^\s+|\s+$/g, ""), start, end };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null && w.word.length > 0);

  if (retainedWords.length === 0) return "";

  // Group into caption blocks
  const WORDS_PER_BLOCK = 8;
  const GAP_THRESHOLD   = 1.0; // seconds — start new block on long pause

  type Block = { start: number; end: number; words: string[] };
  const blocks: Block[] = [];
  let current: Block = { start: retainedWords[0].start, end: retainedWords[0].end, words: [] };

  for (const w of retainedWords) {
    const gapFromPrev = current.words.length > 0 ? w.start - current.end : 0;
    const blockFull   = current.words.length >= WORDS_PER_BLOCK;
    const naturalPause = gapFromPrev > GAP_THRESHOLD;

    if ((blockFull || naturalPause) && current.words.length > 0) {
      blocks.push(current);
      current = { start: w.start, end: w.end, words: [] };
    }

    current.words.push(w.word);
    current.end = w.end;
  }

  if (current.words.length > 0) blocks.push(current);

  // Render SRT
  return (
    blocks
      .map((b, i) =>
        `${i + 1}\n` +
        `${formatSrtTime(b.start)} --> ${formatSrtTime(b.end)}\n` +
        `${b.words.join(" ")}`
      )
      .join("\n\n") + "\n"
  );
}

/**
 * Generate and write the SRT file next to the edited video.
 * Returns the path of the written file.
 */
export function saveSrt(
  transcript: Transcript,
  cutPoints: CutPoint[],
  editedVideoPath: string
): string {
  const srtPath = editedVideoPath.replace(/\.[^.]+$/, ".srt");
  fs.writeFileSync(srtPath, generateSrt(transcript, cutPoints), "utf-8");
  return srtPath;
}
