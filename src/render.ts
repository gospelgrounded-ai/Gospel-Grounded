import * as path from "path";
import * as fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { EditPlan } from "./types";

export async function renderVideo(plan: EditPlan, outputPath: string): Promise<string> {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log("Bundling Remotion composition...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "Root.tsx"),
    webpackOverride: (config) => config,
  });

  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "VideoComposition",
    inputProps: { plan },
  });

  console.log(`Rendering video to ${outputPath}...`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: { plan },
    onProgress: ({ progress }) => {
      process.stdout.write(`\rRendering: ${(progress * 100).toFixed(1)}%`);
    },
  });

  console.log("\nRender complete.");
  return outputPath;
}
