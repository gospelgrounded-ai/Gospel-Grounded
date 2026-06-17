import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

/**
 * Apply broadcast-quality audio processing to an MP4 in-place.
 *
 * Filter chain (order matters for voice):
 *   1. highpass=f=80          — cut low-end rumble, handling noise, AC hum
 *   2. afftdn=nf=-25          — adaptive FFT noise reduction (hiss, room noise)
 *   3. equalizer @ 200 Hz -3  — cut boxy/muddy low-mids
 *   4. acompressor 4:1        — even out loud/quiet moments in the speaker's voice
 *   5. equalizer @ 3000 Hz +2 — boost speech presence / intelligibility
 *   6. loudnorm I=-14         — EBU R128 to YouTube's -14 LUFS target
 *
 * Video stream is stream-copied (no re-encode), so this is fast.
 */
export async function engineerAudio(
  videoPath: string,
  onProgress?: (msg: string) => void
): Promise<void> {
  const log = (msg: string) => { console.log(msg); onProgress?.(msg); };
  log("Engineering audio (denoise → compress → EQ → −14 LUFS)...");

  const tmpPath = path.join(os.tmpdir(), `gospel-audio-${Date.now()}.mp4`);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .videoCodec("copy")
      .audioFilters([
        "highpass=f=80",
        "afftdn=nf=-25",
        "equalizer=f=200:width_type=o:width=2:g=-3",
        "acompressor=threshold=-20dB:ratio=4:attack=5:release=50",
        "equalizer=f=3000:width_type=o:width=2:g=2",
        "loudnorm=I=-14:TP=-2:LRA=11",
      ])
      .audioCodec("aac")
      .audioBitrate("192k")
      .output(tmpPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  fs.renameSync(tmpPath, videoPath);
  log("Audio engineering complete.");
}
