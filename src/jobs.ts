import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export type JobStatus =
  | "queued"
  | "transcribing"
  | "planning"
  | "rendering"
  | "engineering"
  | "done"
  | "failed";

export interface Job {
  id: string;
  videoPath: string;
  outputPath?: string;
  srtPath?: string;
  status: JobStatus;
  progress: string;
  error?: string;
  createdAt: string;
}

export const jobEmitter = new EventEmitter();
const jobs = new Map<string, Job>();

export function createJob(videoPath: string): Job {
  const job: Job = {
    id: uuidv4(),
    videoPath,
    status: "queued",
    progress: "Queued, waiting to start...",
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  return job;
}

export function updateJob(id: string, updates: Partial<Job>): void {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, updates);
  jobEmitter.emit(`job:${id}`, { ...job });
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function listJobs(): Job[] {
  return [...jobs.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
