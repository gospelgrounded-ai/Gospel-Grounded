import { CutPoint } from "./types";

export interface RetainedSegment {
  originalStart: number;
  originalEnd: number;
  editedStart: number;
  durationSecs: number;
}

export function computeRetainedSegments(
  durationInSeconds: number,
  cutPoints: CutPoint[]
): RetainedSegment[] {
  const sorted = [...cutPoints].sort((a, b) => a.startTime - b.startTime);
  const segments: RetainedSegment[] = [];
  let cursor = 0;
  let editedCursor = 0;

  for (const cut of sorted) {
    const segEnd = Math.min(cut.startTime, durationInSeconds);
    if (segEnd > cursor) {
      const dur = segEnd - cursor;
      segments.push({
        originalStart: cursor,
        originalEnd: segEnd,
        editedStart: editedCursor,
        durationSecs: dur,
      });
      editedCursor += dur;
    }
    cursor = Math.max(cursor, cut.endTime);
  }

  if (cursor < durationInSeconds) {
    segments.push({
      originalStart: cursor,
      originalEnd: durationInSeconds,
      editedStart: editedCursor,
      durationSecs: durationInSeconds - cursor,
    });
  }

  return segments;
}

export function remapTime(originalTime: number, cutPoints: CutPoint[]): number | null {
  const sorted = [...cutPoints].sort((a, b) => a.startTime - b.startTime);

  let totalCutBefore = 0;
  for (const cut of sorted) {
    if (originalTime >= cut.startTime && originalTime < cut.endTime) {
      return null; // inside a cut — skip this cue
    }
    if (cut.endTime <= originalTime) {
      totalCutBefore += cut.endTime - cut.startTime;
    }
  }

  return originalTime - totalCutBefore;
}

export function computeEditedDuration(
  durationInSeconds: number,
  cutPoints: CutPoint[]
): number {
  const totalCut = cutPoints.reduce((sum, c) => sum + Math.max(0, c.endTime - c.startTime), 0);
  return Math.max(1, durationInSeconds - totalCut);
}
