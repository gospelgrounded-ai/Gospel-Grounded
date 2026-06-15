import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import { Transcript, TranscriptSegment } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractAudio(videoPath: string): Promise<string> {
  const audioPath = path.join(os.tmpdir(), `gg_audio_${Date.now()}.mp3`);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioChannels(1)
      .audioBitrate("64k")
      .output(audioPath)
      .on("end", () => resolve(audioPath))
      .on("error", reject)
      .run();
  });
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration ?? 0);
    });
  });
}

export async function transcribeAudio(audioPath: string): Promise<Transcript> {
  const audioStream = fs.createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioStream,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment", "word"],
  });

  const segments: TranscriptSegment[] = (response.segments ?? []).map((seg) => ({
    text: seg.text.trim(),
    start: seg.start,
    end: seg.end,
    words: ((seg as any).words ?? []).map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    })),
  }));

  return {
    segments,
    fullText: response.text,
    duration: segments.at(-1)?.end ?? 0,
  };
}

export async function transcribeVideo(videoPath: string): Promise<{ transcript: Transcript; duration: number }> {
  console.log("Extracting audio from video...");
  const audioPath = await extractAudio(videoPath);

  console.log("Transcribing audio with Whisper...");
  const transcript = await transcribeAudio(audioPath);

  console.log("Getting video duration...");
  const duration = await getVideoDuration(videoPath);

  fs.unlinkSync(audioPath);

  return { transcript, duration };
}

export function shortenWordGaps(transcript: Transcript, maxGap: number = 0.2): Transcript {
  const segments = transcript.segments.map((seg, i) => {
    if (i === 0) return seg;
    const prev = transcript.segments[i - 1];
    const gap = seg.start - prev.end;
    if (gap > maxGap) {
      const shift = gap - maxGap;
      return {
        ...seg,
        start: seg.start - shift,
        end: seg.end - shift,
        words: seg.words.map((w) => ({ ...w, start: w.start - shift, end: w.end - shift })),
      };
    }
    return seg;
  });
  return { ...transcript, segments };
}

if (require.main === module) {
  const videoPath = process.argv[2] ?? process.env.INPUT_VIDEO_PATH;
  if (!videoPath) {
    console.error("Usage: ts-node transcribe.ts <video-path>");
    process.exit(1);
  }
  transcribeVideo(videoPath).then(({ transcript }) => {
    console.log(JSON.stringify(transcript, null, 2));
  });
}
