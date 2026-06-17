import * as path from "path";
import * as fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { EditPlan } from "./types";

export async function renderVideo(
  plan: EditPlan,
  outputPath: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const log = (msg: string) => {
    console.log(msg);
    onProgress?.(msg);
  };

  log("Bundling Remotion composition (this takes 2–5 min on first run)...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "Root.tsx"),
    webpackOverride: (config) => config,
    onProgress: (pct) => {
      process.stdout.write(`\r  Webpack: ${pct}%   `);
    },
  });
  process.stdout.write("\n");
  log("Bundle complete. Loading composition...");

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "VideoComposition",
    inputProps: { plan },
  });

  const totalFrames = composition.durationInFrames;
  log(`Rendering ${totalFrames} frames to ${outputPath}...`);

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    pixelFormat: "yuv420p",   // critical for broad player compatibility (config file is CLI-only)
    imageFormat: "jpeg",
    jpegQuality: 98,          // near-lossless intermediate frames — eliminates blocking artifacts
    crf: 16,                  // visually lossless output (default 18; lower = better quality)
    concurrency: 8,           // faster rendering on multi-core machines
    outputLocation: outputPath,
    inputProps: { plan },
    onProgress: ({ renderedFrames, progress }) => {
      const pct = (progress * 100).toFixed(1);
      process.stdout.write(`\r  Frames: ${renderedFrames}/${totalFrames} (${pct}%)   `);
      // Push a throttled update to the phone every ~5%
      if (renderedFrames % Math.max(1, Math.floor(totalFrames / 20)) === 0) {
        onProgress?.(`Rendering video... ${pct}% (${renderedFrames}/${totalFrames} frames)`);
      }
    },
  });

  process.stdout.write("\n");
  log("Render complete.");
  return outputPath;
}
