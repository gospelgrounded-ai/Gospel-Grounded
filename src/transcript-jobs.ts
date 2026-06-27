import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export type TranscriptJobStatus =
  | "queued"
  | "transcribing"
  | "generating"
  | "done"
  | "failed";

export interface TranscriptJob {
  id: string;
  videoPath: string;
  originalName: string;
  status: TranscriptJobStatus;
  progress: string;
  error?: string;
  createdAt: string;
  // Populated on success
  fullText?: string;
  srt?: string;
  vtt?: string;
  titles?: string[];
  durationSeconds?: number;
  segmentCount?: number;
}

export const transcriptJobEmitter = new EventEmitter();
const store = new Map<string, TranscriptJob>();

export function createTranscriptJob(videoPath: string, originalName: string): TranscriptJob {
  const job: TranscriptJob = {
    id: uuidv4(),
    videoPath,
    originalName,
    status: "queued",
    progress: "Queued — waiting to start...",
    createdAt: new Date().toISOString(),
  };
  store.set(job.id, job);
  return job;
}

export function updateTranscriptJob(id: string, updates: Partial<TranscriptJob>): void {
  const job = store.get(id);
  if (!job) return;
  Object.assign(job, updates);
  transcriptJobEmitter.emit(`job:${id}`, { ...job });
}

export function getTranscriptJob(id: string): TranscriptJob | undefined {
  return store.get(id);
}

export function listTranscriptJobs(): TranscriptJob[] {
  return [...store.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
