#!/usr/bin/env ts-node
/**
 * CLI: Apple Log → Rec.709 LUT conversion
 *
 * Usage:
 *   npx ts-node src/lut-cli.ts input.mp4 output.mp4 [options]
 *
 * Options:
 *   --lut <path>       Path to .cube LUT file (default: auto-detect in luts/)
 *   --quality <level>  high | balanced | fast  (default: balanced)
 *   --native           Use FFmpeg colorspace filter instead of a LUT file
 */
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

function printUsage() {
  console.error(`
Usage: ts-node src/lut-cli.ts <input.mp4> <output.mp4> [--lut <path>] [--quality high|balanced|fast] [--native]
`);
}

const args = process.argv.slice(2);
if (args.length < 2 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(args.length < 2 ? 1 : 0);
}

const [inputPath, outputPath] = args;

let lutPath: string | null = null;
let quality = 'balanced';
let useNative = false;

for (let i = 2; i < args.length; i++) {
  if (args[i] === '--lut' && args[i + 1]) {
    lutPath = path.resolve(args[++i]);
  } else if (args[i] === '--quality' && args[i + 1]) {
    quality = args[++i];
  } else if (args[i] === '--native') {
    useNative = true;
  }
}

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

// Auto-detect LUT from luts/ directory if not specified
if (!useNative && !lutPath) {
  const lutsDir = path.resolve('./luts');
  if (fs.existsSync(lutsDir)) {
    const found = fs.readdirSync(lutsDir).find(f => /\.(cube|3dl)$/i.test(f));
    if (found) {
      lutPath = path.join(lutsDir, found);
      console.log(`Auto-detected LUT: ${lutPath}`);
    }
  }
  if (!lutPath) {
    console.error(
      'No LUT file found. Place a .cube file in ./luts/ or pass --lut <path> or --native.',
    );
    process.exit(1);
  }
}

const crfMap: Record<string, string> = { high: '18', balanced: '23', fast: '28' };
const presetMap: Record<string, string> = { high: 'slow', balanced: 'medium', fast: 'fast' };
const crf = crfMap[quality] ?? '23';
const preset = presetMap[quality] ?? 'medium';

let vf: string;
if (useNative) {
  vf = 'colorspace=all=bt709:iall=bt2020:fast=1,format=yuv420p';
  console.log('Mode: FFmpeg native colorspace conversion (bt2020 → bt709)');
} else {
  const escaped = (lutPath || '').replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
  vf = `lut3d=file='${escaped}',format=yuv420p`;
  console.log(`Mode: LUT file → ${lutPath}`);
}

console.log(`Quality: ${quality} (CRF ${crf}, preset ${preset})`);
console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log('');

// Ensure output directory exists
const outDir = path.dirname(path.resolve(outputPath));
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const ffmpegArgs = [
  '-hide_banner',
  '-i', inputPath,
  '-vf', vf,
  '-c:v', 'libx264',
  '-crf', crf,
  '-preset', preset,
  '-c:a', 'copy',
  '-movflags', '+faststart',
  '-progress', 'pipe:2',
  '-nostats',
  '-y',
  outputPath,
];

const proc = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'inherit', 'pipe'] });

let totalUs = 0;
let stderr = '';
let lastPct = -1;

proc.stderr!.on('data', (chunk: Buffer) => {
  const text = chunk.toString();
  stderr += text;

  if (totalUs === 0) {
    const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (m) {
      totalUs = (parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3])) * 1_000_000;
    }
  }

  const timeMatch = text.match(/out_time_us=(\d+)/);
  if (timeMatch && totalUs > 0) {
    const pct = Math.min(99, Math.round((parseInt(timeMatch[1]) / totalUs) * 100));
    if (pct !== lastPct) {
      lastPct = pct;
      process.stdout.write(`\rProgress: ${pct}%   `);
    }
  }
});

proc.on('close', code => {
  process.stdout.write('\r');
  if (code === 0) {
    console.log(`\n✅  Done → ${outputPath}`);
  } else {
    console.error(`\n❌  FFmpeg exited with code ${code}`);
    console.error(stderr.slice(-1000));
    process.exit(code ?? 1);
  }
});

proc.on('error', err => {
  console.error(`\n❌  Failed to launch FFmpeg: ${err.message}`);
  console.error('    Make sure ffmpeg is installed and on your PATH.');
  process.exit(1);
});
