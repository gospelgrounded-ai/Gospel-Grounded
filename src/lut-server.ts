#!/usr/bin/env ts-node
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const PORT = parseInt(process.env.LUT_SERVER_PORT || '4000', 10);
const UPLOAD_DIR = path.resolve('./uploads');
const OUTPUT_DIR = path.resolve('./out');
const LUTS_DIR = path.resolve('./luts');

for (const dir of [UPLOAD_DIR, OUTPUT_DIR, LUTS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

interface Job {
  status: 'queued' | 'running' | 'done' | 'error';
  progress: number;
  outputPath?: string;
  outputName?: string;
  inputPath?: string;
  error?: string;
  createdAt: number;
}
const jobs = new Map<string, Job>();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, file.fieldname === 'lut' ? LUTS_DIR : UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 * 1024 } });

const app = express();
app.use(express.json());

// Clean up jobs + files older than 2 hours
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    if (job.createdAt < cutoff) {
      if (job.outputPath) fs.unlink(job.outputPath, () => {});
      if (job.inputPath) fs.unlink(job.inputPath, () => {});
      jobs.delete(id);
    }
  }
}, 30 * 60 * 1000);

// ─── HTML UI ─────────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Apple Log → Rec.709 Converter</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#07070f;color:#e8e8ee;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:48px 20px}
h1{font-size:1.9rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:6px}
.sub{color:#666;font-size:.88rem;margin-bottom:44px}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:32px;width:100%;max-width:580px;margin-bottom:16px}
label{display:block;font-size:.75rem;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px}
.drop{border:2px dashed rgba(255,255,255,.15);border-radius:12px;padding:36px 20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:24px}
.drop:hover,.drop.over{border-color:#e94560;background:rgba(233,69,96,.06)}
.drop .ico{font-size:2.2rem;margin-bottom:10px;display:block}
.drop p{color:#777;font-size:.88rem;line-height:1.5}
.drop .fname{color:#e94560;font-weight:600;margin-top:8px;font-size:.9rem;word-break:break-all}
input[type=file]{display:none}
.opts{display:flex;gap:10px;margin-bottom:10px}
.opt{flex:1;padding:12px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;cursor:pointer;text-align:center;font-size:.82rem;font-weight:500;transition:all .2s;line-height:1.4}
.opt small{display:block;color:#555;font-size:.72rem;margin-top:3px}
.opt.on{border-color:#e94560;background:rgba(233,69,96,.1);color:#e94560}
.opt.on small{color:#c43a54}
.hint{background:rgba(233,69,96,.08);border:1px solid rgba(233,69,96,.18);border-radius:8px;padding:11px 14px;font-size:.8rem;color:#c43a54;margin-bottom:14px;line-height:1.5;display:none}
.hint a{color:#e94560}
.lut-area{display:none;margin-bottom:4px}
.lut-area.show{display:block}
.row{display:flex;gap:10px;margin-bottom:24px}
.qopt{flex:1;padding:11px 8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;cursor:pointer;text-align:center;font-size:.82rem;font-weight:500;transition:all .2s;line-height:1.4}
.qopt small{display:block;color:#555;font-size:.72rem;margin-top:3px}
.qopt.on{border-color:#e94560;background:rgba(233,69,96,.1);color:#e94560}
.qopt.on small{color:#c43a54}
.btn{width:100%;padding:15px;background:#e94560;color:#fff;border:none;border-radius:11px;font-size:.98rem;font-weight:700;cursor:pointer;transition:background .2s;letter-spacing:.01em}
.btn:hover{background:#c43a54}
.btn:disabled{background:#2a2a35;color:#555;cursor:not-allowed}
#status{display:none}
.prog-wrap{margin:14px 0 6px}
.prog-bg{background:rgba(255,255,255,.08);border-radius:99px;height:7px;overflow:hidden}
.prog-fill{height:100%;background:#e94560;border-radius:99px;transition:width .4s ease;width:0%}
.prog-pct{text-align:right;font-size:.75rem;color:#666;margin-top:5px}
.stext{font-size:.9rem;color:#aaa;margin-bottom:4px}
.dl-btn{display:block;width:100%;padding:14px;background:#1c6e42;color:#fff;border:none;border-radius:11px;font-size:.95rem;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;margin-top:14px;transition:background .2s}
.dl-btn:hover{background:#175735}
.err{color:#e94560;font-size:.85rem;margin-top:10px;padding:10px 14px;background:rgba(233,69,96,.08);border-radius:8px;border:1px solid rgba(233,69,96,.2)}
</style>
</head>
<body>
<h1>Apple Log → Rec.709</h1>
<p class="sub">FFmpeg LUT Converter &middot; Gospel Grounded</p>

<div class="card">
  <form id="form">
    <label>Video File</label>
    <div class="drop" id="vdrop">
      <span class="ico">🎬</span>
      <p>Drag &amp; drop your Apple Log video here<br>or <strong>click to browse</strong></p>
      <p class="fname" id="vname"></p>
      <input type="file" id="vfile" name="video" accept="video/*,.mp4,.mov,.mxf">
    </div>

    <label>LUT Source</label>
    <div class="opts">
      <div class="opt on" id="o-builtin" onclick="setLut('builtin')">Built-in LUT<small>luts/ folder</small></div>
      <div class="opt" id="o-upload" onclick="setLut('upload')">Upload .cube<small>bring your own</small></div>
      <div class="opt" id="o-ffmpeg" onclick="setLut('ffmpeg')">FFmpeg Native<small>no file needed</small></div>
    </div>
    <div class="hint" id="hint"></div>
    <div class="lut-area" id="lut-area">
      <div class="drop" id="ldrop" style="padding:22px;margin-bottom:20px">
        <p>.cube or .3dl LUT file</p>
        <p class="fname" id="lname"></p>
        <input type="file" id="lfile" name="lut" accept=".cube,.3dl">
      </div>
    </div>
    <input type="hidden" id="lutMode" name="lutMode" value="builtin">

    <label>Output Quality</label>
    <div class="row">
      <div class="qopt" id="q-high" onclick="setQ('high')">High<small>CRF 18 &middot; slow</small></div>
      <div class="qopt on" id="q-balanced" onclick="setQ('balanced')">Balanced<small>CRF 23 &middot; medium</small></div>
      <div class="qopt" id="q-fast" onclick="setQ('fast')">Fast<small>CRF 28 &middot; fast</small></div>
    </div>
    <input type="hidden" id="quality" name="quality" value="balanced">

    <button type="submit" class="btn" id="sbtn">Convert Video</button>
  </form>
</div>

<div id="status" class="card">
  <div class="stext" id="stext">Processing…</div>
  <div class="prog-wrap">
    <div class="prog-bg"><div class="prog-fill" id="pfill"></div></div>
    <div class="prog-pct" id="ppct">0%</div>
  </div>
  <a id="dlbtn" class="dl-btn" style="display:none" download>⬇&nbsp; Download Converted Video</a>
  <div class="err" id="errmsg" style="display:none"></div>
</div>

<script>
let lutMode='builtin', quality='balanced', evtSrc=null;

function setLut(m){
  lutMode=m;
  document.getElementById('lutMode').value=m;
  ['builtin','upload','ffmpeg'].forEach(v=>document.getElementById('o-'+v).classList.toggle('on',v===m));
  document.getElementById('lut-area').classList.toggle('show',m==='upload');
  const h=document.getElementById('hint');
  if(m==='builtin'){h.style.display='block';h.innerHTML='Place the Apple Log to Rec.709 <code>.cube</code> file in the <strong>luts/</strong> directory on the server. <a href="https://support.apple.com/en-us/111900" target="_blank">Download from Apple →</a>'}
  else if(m==='ffmpeg'){h.style.display='block';h.textContent='Uses FFmpeg colorspace filter (bt2020 → bt709). Decent approximation — no .cube file required.'}
  else{h.style.display='none'}
}

function setQ(q){
  quality=q;
  document.getElementById('quality').value=q;
  ['high','balanced','fast'].forEach(v=>document.getElementById('q-'+v).classList.toggle('on',v===q));
}

function wire(dropId,inputId,nameId){
  const dz=document.getElementById(dropId),inp=document.getElementById(inputId);
  dz.addEventListener('click',()=>inp.click());
  dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('over')});
  dz.addEventListener('dragleave',()=>dz.classList.remove('over'));
  dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('over');if(e.dataTransfer.files[0]){inp.files=e.dataTransfer.files;document.getElementById(nameId).textContent=e.dataTransfer.files[0].name}});
  inp.addEventListener('change',()=>document.getElementById(nameId).textContent=inp.files[0]?.name||'');
}
wire('vdrop','vfile','vname');
wire('ldrop','lfile','lname');

document.getElementById('form').addEventListener('submit',async e=>{
  e.preventDefault();
  const vf=document.getElementById('vfile').files[0];
  if(!vf){alert('Select a video file first.');return}
  if(lutMode==='upload'&&!document.getElementById('lfile').files[0]){alert('Select a .cube LUT file.');return}

  if(evtSrc){evtSrc.close();evtSrc=null}

  const fd=new FormData();
  fd.append('video',vf);
  if(lutMode==='upload')fd.append('lut',document.getElementById('lfile').files[0]);
  fd.append('lutMode',lutMode);
  fd.append('quality',quality);

  const sbtn=document.getElementById('sbtn');
  sbtn.disabled=true; sbtn.textContent='Converting…';
  const st=document.getElementById('status');
  st.style.display='block';
  document.getElementById('dlbtn').style.display='none';
  document.getElementById('errmsg').style.display='none';
  setProgress(3,'Uploading…');

  let jobId;
  try{
    const r=await fetch('/convert',{method:'POST',body:fd});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||r.statusText);
    jobId=data.jobId;
  }catch(err){
    showErr('Upload failed: '+err.message);
    sbtn.disabled=false;sbtn.textContent='Convert Video';
    return;
  }

  setProgress(5,'Starting FFmpeg…');
  evtSrc=new EventSource('/progress/'+jobId);
  evtSrc.onmessage=ev=>{
    const d=JSON.parse(ev.data);
    if(d.error){showErr(d.error);evtSrc.close();sbtn.disabled=false;sbtn.textContent='Convert Video';return}
    if(d.status==='running'||d.status==='queued'){
      const pct=d.progress||5;
      setProgress(pct,'Converting… '+pct+'%');
    }else if(d.status==='done'){
      setProgress(100,'Done!');
      evtSrc.close();
      const dl=document.getElementById('dlbtn');
      dl.href='/download/'+jobId;
      dl.download=vf.name.replace(/\\.[^.]+$/,'')+'_rec709.mp4';
      dl.style.display='block';
      sbtn.disabled=false;sbtn.textContent='Convert Another';
    }else if(d.status==='error'){
      showErr(d.error||'Conversion failed');
      evtSrc.close();
      sbtn.disabled=false;sbtn.textContent='Convert Video';
    }
  };
  evtSrc.onerror=()=>{showErr('Lost connection to server');evtSrc.close()};
});

function setProgress(pct,text){
  document.getElementById('pfill').style.width=pct+'%';
  document.getElementById('ppct').textContent=pct+'%';
  document.getElementById('stext').textContent=text;
}
function showErr(msg){
  const e=document.getElementById('errmsg');
  e.textContent=msg;e.style.display='block';
  setProgress(0,'Error');
}
</script>
</body>
</html>`;

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.send(HTML));

app.post(
  '/convert',
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'lut', maxCount: 1 }]),
  (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const videoFile = files['video']?.[0];
    const lutFile = files['lut']?.[0];

    if (!videoFile) {
      res.status(400).json({ error: 'No video file uploaded' });
      return;
    }

    const lutMode = (req.body.lutMode as string) || 'builtin';
    const quality = (req.body.quality as string) || 'balanced';

    let lutPath: string | null = null;

    if (lutMode === 'builtin') {
      const cubes = fs.readdirSync(LUTS_DIR).filter(f => /\.(cube|3dl)$/i.test(f));
      if (cubes.length === 0) {
        fs.unlink(videoFile.path, () => {});
        res.status(400).json({
          error:
            'No LUT found in the luts/ directory. Place your Apple Log→Rec.709 .cube file there, ' +
            'or choose "Upload .cube" / "FFmpeg Native" mode.',
        });
        return;
      }
      lutPath = path.join(LUTS_DIR, cubes[0]);
    } else if (lutMode === 'upload') {
      if (!lutFile) {
        fs.unlink(videoFile.path, () => {});
        res.status(400).json({ error: 'No LUT file uploaded' });
        return;
      }
      lutPath = lutFile.path;
    }

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const baseName = path.basename(videoFile.originalname, path.extname(videoFile.originalname));
    const outputName = `${baseName}_rec709.mp4`;
    const outputPath = path.join(OUTPUT_DIR, `${jobId}-${outputName}`);

    const job: Job = {
      status: 'queued',
      progress: 0,
      outputPath,
      outputName,
      inputPath: videoFile.path,
      createdAt: Date.now(),
    };
    jobs.set(jobId, job);

    runConversion(jobId, videoFile.path, outputPath, lutPath, lutMode === 'ffmpeg', quality);

    res.json({ jobId });
  },
);

app.get('/progress/:jobId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (payload: object) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  const poll = () => {
    const job = jobs.get(req.params.jobId);
    if (!job) {
      send({ error: 'Job not found' });
      res.end();
      return;
    }
    send({ status: job.status, progress: job.progress, error: job.error });
    if (job.status === 'done' || job.status === 'error') {
      res.end();
    } else {
      setTimeout(poll, 600);
    }
  };
  poll();

  req.on('close', () => res.end());
});

app.get('/download/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'done' || !job.outputPath) {
    res.status(404).json({ error: 'Output not ready' });
    return;
  }
  res.download(job.outputPath, job.outputName || 'converted.mp4', err => {
    if (!err) {
      setTimeout(() => {
        if (job.outputPath) fs.unlink(job.outputPath, () => {});
        jobs.delete(req.params.jobId);
      }, 10_000);
    }
  });
});

// ─── FFmpeg conversion ───────────────────────────────────────────────────────

function runConversion(
  jobId: string,
  inputPath: string,
  outputPath: string,
  lutPath: string | null,
  useNative: boolean,
  quality: string,
) {
  const job = jobs.get(jobId)!;
  job.status = 'running';

  const crfMap: Record<string, string> = { high: '18', balanced: '23', fast: '28' };
  const presetMap: Record<string, string> = { high: 'slow', balanced: 'medium', fast: 'fast' };
  const crf = crfMap[quality] ?? '23';
  const preset = presetMap[quality] ?? 'medium';

  let vf: string;
  if (useNative) {
    vf = 'colorspace=all=bt709:iall=bt2020:fast=1,format=yuv420p';
  } else {
    // Escape colons in path for FFmpeg filter graph (Linux)
    const escaped = (lutPath || '').replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
    vf = `lut3d=file='${escaped}',format=yuv420p`;
  }

  const args = [
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

  console.log(`[${jobId}] Starting FFmpeg: ffmpeg ${args.join(' ')}`);
  const proc = spawn('ffmpeg', args);

  let totalUs = 0;
  let stderr = '';

  proc.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    stderr += text;

    // Grab total duration once
    if (totalUs === 0) {
      const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (m) {
        totalUs =
          (parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3])) * 1_000_000;
      }
    }

    // Parse -progress pipe output: "out_time_us=<microseconds>"
    const timeMatch = text.match(/out_time_us=(\d+)/);
    if (timeMatch && totalUs > 0) {
      const current = parseInt(timeMatch[1]);
      job.progress = Math.min(99, Math.round((current / totalUs) * 100));
    }
  });

  proc.on('close', code => {
    if (code === 0) {
      job.status = 'done';
      job.progress = 100;
      console.log(`[${jobId}] Done → ${outputPath}`);
    } else {
      job.status = 'error';
      job.error = `FFmpeg exited with code ${code}. Last output:\n${stderr.slice(-800)}`;
      console.error(`[${jobId}] FFmpeg error (code ${code})`);
      fs.unlink(outputPath, () => {});
    }
    fs.unlink(inputPath, () => {});
  });

  proc.on('error', err => {
    job.status = 'error';
    job.error = `Failed to launch FFmpeg: ${err.message}. Is ffmpeg installed and on PATH?`;
    console.error(`[${jobId}] spawn error:`, err.message);
    fs.unlink(inputPath, () => {});
  });
}

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅  LUT Converter running on http://0.0.0.0:${PORT}`);
  console.log(`    Tailscale: http://<your-tailscale-ip>:${PORT}`);
  console.log(`    LUT folder: ${LUTS_DIR}\n`);
});
