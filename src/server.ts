import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "dotenv";
config();

import { createJob, updateJob, getJob, listJobs, jobEmitter, Job } from "./jobs";
import { runPipeline } from "./workflow";
import { EditFeatures, GraphicStyleName } from "./types";

const PORT = parseInt(process.env.SERVER_PORT ?? "3001");
const UPLOADS_DIR = path.resolve("./uploads");

const DEFAULT_FEATURES: EditFeatures = {
  colorGrade: true,
  zooms: true,
  jumpCuts: true,
  graphics: true,
  audioEngineer: true,
};

const app = express();

// Multer saves to ./uploads/ with a random filename (no extension)
const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 10 * 1024 ** 3 }, // 10 GB for long-form video
});

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Serve uploaded videos over HTTP so Remotion's renderer can fetch them
// (Remotion can't read files from the local filesystem directly during render)
app.use("/uploads", express.static(UPLOADS_DIR));

async function processJob(
  jobId: string,
  fsPath: string,         // absolute filesystem path for FFmpeg
  originalName: string,
  remotionUrl: string,    // HTTP URL for Remotion renderer
  features: EditFeatures,
  style: GraphicStyleName
): Promise<void> {
  const outputDir = process.env.OUTPUT_DIR ?? "./out";
  const videoTitle = path.basename(originalName, path.extname(originalName));

  try {
    updateJob(jobId, { status: "transcribing", progress: "Extracting audio and transcribing..." });

    const outputPath = await runPipeline(
      fsPath,
      videoTitle,
      outputDir,
      (msg) => {
        const statusMap: Record<string, Job["status"]> = {
          "Extracting audio": "transcribing",
          "Planning edits": "planning",
          "Rendering": "rendering",
          "Engineering audio": "engineering",
        };
        const matched = Object.entries(statusMap).find(([k]) => msg.startsWith(k));
        updateJob(jobId, {
          status: matched ? matched[1] : undefined,
          progress: msg,
        });
      },
      remotionUrl,
      features,
      style
    );

    updateJob(jobId, { status: "done", progress: "Done! Your video is ready to download.", outputPath });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    updateJob(jobId, { status: "failed", error: message, progress: `Failed: ${message}` });
  }
}

// Upload endpoint — accepts .mp4, .mov, .m4v
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No video file uploaded" });
    return;
  }

  // Rename to preserve the original extension so FFmpeg and Remotion detect the codec
  const ext = path.extname(req.file.originalname).toLowerCase() || ".mp4";
  const namedFile = req.file.path + ext;
  fs.renameSync(req.file.path, namedFile);

  // Parse style and features from form fields
  const style = (req.body?.style as GraphicStyleName) ?? "bold";
  let features: EditFeatures = DEFAULT_FEATURES;
  if (req.body?.features) {
    try {
      features = JSON.parse(req.body.features) as EditFeatures;
    } catch {
      // malformed JSON — use defaults
    }
  }

  // Pass an HTTP URL so Remotion's Chromium renderer can fetch the video during rendering
  const videoUrl = `http://localhost:${PORT}/uploads/${path.basename(namedFile)}`;
  // Use the absolute filesystem path for FFmpeg (audio extraction)
  const absolutePath = path.resolve(namedFile);

  const job = createJob(absolutePath);
  res.json({ jobId: job.id });

  // FFmpeg reads the local file; Remotion fetches via HTTP from our Express server
  processJob(job.id, absolutePath, req.file.originalname, videoUrl, features, style);
});

// SSE status stream — keeps mobile browser updated during long processing
app.get("/status/:jobId", (req, res) => {
  const { jobId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const job = getJob(jobId);
  if (job) res.write(`data: ${JSON.stringify(job)}\n\n`);

  const onUpdate = (updated: Job) => {
    res.write(`data: ${JSON.stringify(updated)}\n\n`);
    if (updated.status === "done" || updated.status === "failed") {
      clearInterval(heartbeat);
      res.end();
    }
  };

  // Heartbeat prevents SSE timeout on mobile browsers (drops after ~60s inactivity)
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 20_000);
  jobEmitter.on(`job:${jobId}`, onUpdate);
  req.on("close", () => {
    clearInterval(heartbeat);
    jobEmitter.off(`job:${jobId}`, onUpdate);
  });
});

// JSON polling fallback — for when phone screen locks and SSE drops
app.get("/api/jobs/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

// Download finished video
app.get("/download/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job?.outputPath || !fs.existsSync(job.outputPath)) {
    res.status(404).send("Video not ready or file missing");
    return;
  }
  res.download(job.outputPath);
});

// List all jobs (most recent first)
app.get("/api/jobs", (_req, res) => {
  res.json(listJobs());
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\nGospel Grounded upload server running at http://0.0.0.0:${PORT}`);
  console.log(`Open http://<your-machine-ip>:${PORT} on your phone to upload videos.\n`);
});

// 3-hour timeout covers worst-case: upload (30 min) + transcribe (8 min) + render (90 min)
server.setTimeout(3 * 60 * 60 * 1000);
