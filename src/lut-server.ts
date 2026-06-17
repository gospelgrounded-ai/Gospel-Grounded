#!/usr/bin/env ts-node
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const PORT = parseInt(process.env.PORT || process.env.LUT_SERVER_PORT || '4000', 10);
const UPLOAD_DIR = path.resolve('./uploads');
const OUTPUT_DIR = path.resolve('./out');
const LUTS_DIR = path.resolve('./luts');
const PARTIAL_DIR = path.join(UPLOAD_DIR, 'partial');

for (const dir of [UPLOAD_DIR, OUTPUT_DIR, LUTS_DIR, PARTIAL_DIR]) {
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

// Multer for LUT files (small, goes straight to luts/)
const lutUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, LUTS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase(); // preserve .cube / .3dl
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Multer for 8 MB chunks (goes to UPLOAD_DIR with temp name, we rename after)
const chunkUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, _file, cb) => cb(null, `tmp-chunk-${Date.now()}-${Math.random().toString(36).slice(2)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB safety margin over 8 MB chunk
});

const app = express();
app.use(express.json());

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
.builtin-area{display:none;margin-bottom:20px}
.builtin-area.show{display:block}
select{width:100%;padding:11px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#e8e8ee;font-size:.88rem;cursor:pointer;appearance:auto}
select:focus{outline:none;border-color:#e94560}
select option{background:#111}
.lut-loading{color:#666;font-size:.82rem;padding:6px 0}
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
      <input type="file" id="vfile" accept="video/*,.mp4,.mov,.mxf">
    </div>

    <label>LUT Source</label>
    <div class="opts">
      <div class="opt on" id="o-builtin" onclick="setLut('builtin')">Built-in LUT<small>choose LUT</small></div>
      <div class="opt" id="o-upload" onclick="setLut('upload')">Upload .cube<small>bring your own</small></div>
      <div class="opt" id="o-ffmpeg" onclick="setLut('ffmpeg')">FFmpeg Native<small>no file needed</small></div>
    </div>
    <div class="hint" id="hint"></div>
    <div class="builtin-area show" id="builtin-area">
      <div class="lut-loading" id="lut-loading">Loading LUTs…</div>
      <select id="lut-select" style="display:none"></select>
    </div>
    <div class="lut-area" id="lut-area">
      <div class="drop" id="ldrop" style="padding:22px;margin-bottom:20px">
        <p>.cube or .3dl LUT file</p>
        <p class="fname" id="lname"></p>
        <input type="file" id="lfile" accept=".cube,.3dl">
      </div>
    </div>

    <label>Output Quality</label>
    <div class="row">
      <div class="qopt" id="q-high" onclick="setQ('high')">High<small>CRF 18</small></div>
      <div class="qopt on" id="q-balanced" onclick="setQ('balanced')">Balanced<small>CRF 23</small></div>
      <div class="qopt" id="q-fast" onclick="setQ('fast')">Fast<small>CRF 28</small></div>
    </div>

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
const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB — stays under Railway's ingress limit
let lutMode='builtin', quality='balanced', evtSrc=null;

// Fetch and populate LUT dropdown (8-second timeout + retry)
function loadLuts(){
  var loading=document.getElementById('lut-loading');
  var sel=document.getElementById('lut-select');
  loading.innerHTML='Loading LUTs&#8230;';loading.style.display='block';
  sel.innerHTML='<option value="">-- loading --</option>';sel.style.display='block';sel.disabled=true;
  var ctrl=typeof AbortController!=='undefined'?new AbortController():null;
  var timer=setTimeout(function(){if(ctrl)ctrl.abort();},8000);
  fetch('/luts',ctrl?{signal:ctrl.signal}:{}).then(function(r){return r.json();}).then(function(luts){
    clearTimeout(timer);
    loading.style.display='none';
    sel.innerHTML='';sel.disabled=false;
    if(!Array.isArray(luts)||!luts.length){
      sel.innerHTML='<option value="">No LUTs found</option>';return;
    }
    var groups={};
    for(var i=0;i<luts.length;i++){var g=luts[i].group||'';if(!groups[g])groups[g]=[];groups[g].push(luts[i]);}
    var gKeys=Object.keys(groups).sort();
    for(var ki=0;ki<gKeys.length;ki++){
      var gk=gKeys[ki];var items=groups[gk];
      if(gKeys.length>1&&gk){
        var og=document.createElement('optgroup');
        og.label=gk.replace(/-/g,' ').replace(/\//g,' / ');
        for(var ji=0;ji<items.length;ji++){var o=document.createElement('option');o.value=items[ji].path;o.textContent=items[ji].name;og.appendChild(o);}
        sel.appendChild(og);
      }else{
        for(var ji=0;ji<items.length;ji++){var o=document.createElement('option');o.value=items[ji].path;o.textContent=items[ji].name;sel.appendChild(o);}
      }
    }
  }).catch(function(){
    clearTimeout(timer);
    loading.innerHTML='Could not load LUTs. <a href="#" onclick="loadLuts();return false;" style="color:#e94560">Retry</a>';
    loading.style.display='block';
    sel.innerHTML='<option value="">-- unavailable --</option>';sel.disabled=true;
  });
}

function setLut(m){
  lutMode=m;
  ['builtin','upload','ffmpeg'].forEach(v=>document.getElementById('o-'+v).classList.toggle('on',v===m));
  document.getElementById('builtin-area').classList.toggle('show',m==='builtin');
  document.getElementById('lut-area').classList.toggle('show',m==='upload');
  const h=document.getElementById('hint');
  if(m==='ffmpeg'){h.style.display='block';h.textContent='Uses FFmpeg colorspace filter (bt2020 → bt709). Decent approximation — no .cube file required.'}
  else{h.style.display='none'}
  if(m==='builtin'){var s=document.getElementById('lut-select');if(!s.options.length||s.options[0].value==='')loadLuts();}
}

function setQ(q){
  quality=q;
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
loadLuts(); // pre-load on page ready

document.getElementById('form').addEventListener('submit',async function(e){
  e.preventDefault();
  const vf=document.getElementById('vfile').files[0];
  if(!vf){alert('Select a video file first.');return}
  const lutUploadFile=document.getElementById('lfile').files[0];
  if(lutMode==='upload'&&!lutUploadFile){alert('Select a .cube LUT file.');return}

  if(evtSrc){evtSrc.close();evtSrc=null}
  const sbtn=document.getElementById('sbtn');
  sbtn.disabled=true;
  document.getElementById('status').style.display='block';
  document.getElementById('dlbtn').style.display='none';
  document.getElementById('errmsg').style.display='none';

  try{
    // Step 1: upload LUT if needed (small file, one shot)
    let lutToken=null;
    if(lutMode==='upload'){
      sbtn.textContent='Uploading LUT…';
      setProgress(1,'Uploading LUT file…');
      const fd=new FormData();
      fd.append('lut',lutUploadFile);
      const r=await fetch('/upload-lut',{method:'POST',body:fd});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||r.statusText);
      lutToken=d.lutToken;
    }

    // Step 2: upload video in 8 MB chunks
    const totalChunks=Math.ceil(vf.size/CHUNK_SIZE);
    const uploadId=Date.now()+'-'+Math.random().toString(36).slice(2,8);

    for(let i=0;i<totalChunks;i++){
      const pct=Math.round((i/totalChunks)*80);
      sbtn.textContent='Uploading…';
      setProgress(pct,'Uploading… chunk '+(i+1)+'/'+totalChunks);
      const chunk=vf.slice(i*CHUNK_SIZE,Math.min((i+1)*CHUNK_SIZE,vf.size));
      const fd=new FormData();
      fd.append('chunk',chunk,vf.name);
      fd.append('uploadId',uploadId);
      fd.append('chunkIndex',String(i));
      fd.append('totalChunks',String(totalChunks));
      fd.append('originalName',vf.name);

      await new Promise(function(resolve,reject){
        const xhr=new XMLHttpRequest();
        xhr.open('POST','/chunk');
        xhr.onload=()=>xhr.status<300?resolve(null):reject(new Error('Chunk '+i+' failed ('+xhr.status+'): '+xhr.responseText));
        xhr.onerror=()=>reject(new Error('Network error on chunk '+(i+1)));
        xhr.send(fd);
      });
    }

    // Step 3: trigger conversion
    setProgress(82,'Assembling file…');
    sbtn.textContent='Processing…';
    const lutFile=lutMode==='builtin'?document.getElementById('lut-select').value:'';
    const cr=await fetch('/start-convert',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({uploadId,originalName:vf.name,lutMode,quality,lutToken,lutFile})
    });
    const cd=await cr.json();
    if(!cr.ok)throw new Error(cd.error||cr.statusText);

    startProgress(cd.jobId,vf.name,sbtn);
  }catch(err){
    showErr(String(err.message||err));
    sbtn.disabled=false;sbtn.textContent='Convert Video';
  }
});

function startProgress(jobId,fileName,sbtn){
  sbtn.textContent='Converting…';
  setProgress(85,'Starting FFmpeg…');
  evtSrc=new EventSource('/progress/'+jobId);
  evtSrc.onmessage=ev=>{
    const d=JSON.parse(ev.data);
    if(d.error){showErr(d.error);evtSrc.close();sbtn.disabled=false;sbtn.textContent='Convert Video';return}
    if(d.status==='running'||d.status==='queued'){
      // Map FFmpeg 0-100 progress to UI 85-99 range
      const pct=85+Math.round((d.progress||0)*0.14);
      setProgress(pct,'Converting… '+(d.progress||0)+'%');
    }else if(d.status==='done'){
      setProgress(100,'Done!');
      evtSrc.close();
      const dl=document.getElementById('dlbtn');
      dl.href='/download/'+jobId;
      dl.download=fileName.replace(/\\.[^.]+$/,'')+'_rec709.mp4';
      dl.style.display='block';
      sbtn.disabled=false;sbtn.textContent='Convert Another';
    }else if(d.status==='error'){
      showErr(d.error||'Conversion failed');
      evtSrc.close();
      sbtn.disabled=false;sbtn.textContent='Convert Video';
    }
  };
  evtSrc.onerror=()=>{
    evtSrc.close();evtSrc=null;
    const poll=()=>{
      fetch('/status/'+jobId).then(r=>r.json()).then(d=>{
        if(d.status==='running'||d.status==='queued'){
          const pct=85+Math.round((d.progress||0)*0.14);
          setProgress(pct,'Converting… '+(d.progress||0)+'%');
          setTimeout(poll,3000);
        }else if(d.status==='done'){
          setProgress(100,'Done!');
          const dl=document.getElementById('dlbtn');
          dl.href='/download/'+jobId;
          dl.download=fileName.replace(/\\.[^.]+$/,'')+'_rec709.mp4';
          dl.style.display='block';
          sbtn.disabled=false;sbtn.textContent='Convert Another';
        }else{
          showErr(d.error||'Conversion failed');
          sbtn.disabled=false;sbtn.textContent='Convert Video';
        }
      }).catch(()=>setTimeout(poll,5000));
    };
    setTimeout(poll,3000);
  };
}

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

// ─── LUT scanner ─────────────────────────────────────────────────────────────

interface LutEntry { name: string; path: string; group: string }

function scanLuts(dir: string, relBase: string = ''): LutEntry[] {
  const results: LutEntry[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...scanLuts(path.join(dir, entry.name), relPath));
    } else if (/\.(cube|3dl)$/i.test(entry.name)) {
      const base = path.basename(entry.name, path.extname(entry.name));
      const name = base.replace(/_/g, ' ');
      const group = relBase;
      results.push({ name, path: relPath, group });
    }
  }
  return results;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.send(HTML));

app.get('/luts', (_req, res) => {
  try {
    res.json(scanLuts(LUTS_DIR));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload a small LUT file ahead of conversion
app.post('/upload-lut', lutUpload.single('lut'), (req, res) => {
  if (!req.file) { res.status(400).json({ error: 'No LUT file' }); return; }
  res.json({ lutToken: path.basename(req.file.path) });
});

// Receive one 8 MB chunk
app.post('/chunk', chunkUpload.single('chunk'), (req, res) => {
  if (!req.file) { res.status(400).json({ error: 'No chunk data' }); return; }

  const { uploadId, chunkIndex, totalChunks, originalName } = req.body as Record<string, string>;
  if (!uploadId || chunkIndex === undefined || !totalChunks) {
    fs.unlink(req.file.path, () => {});
    res.status(400).json({ error: 'Missing chunk metadata' });
    return;
  }

  const partialDir = path.join(PARTIAL_DIR, uploadId);
  fs.mkdirSync(partialDir, { recursive: true });

  const idx = String(parseInt(chunkIndex)).padStart(6, '0');
  const dest = path.join(partialDir, `chunk-${idx}`);
  fs.renameSync(req.file.path, dest);

  const received = fs.readdirSync(partialDir).filter(f => f.startsWith('chunk-')).length;
  res.json({ ok: true, received, total: parseInt(totalChunks) });
});

// Assemble chunks and kick off FFmpeg
app.post('/start-convert', async (req, res) => {
  const { uploadId, originalName, lutMode, quality, lutToken, lutFile } = req.body as Record<string, string>;
  if (!uploadId || !originalName) {
    res.status(400).json({ error: 'Missing uploadId or originalName' });
    return;
  }

  const partialDir = path.join(PARTIAL_DIR, uploadId);
  if (!fs.existsSync(partialDir)) {
    res.status(400).json({ error: 'No chunks found for this uploadId' });
    return;
  }

  const chunks = fs.readdirSync(partialDir).filter(f => f.startsWith('chunk-')).sort();
  if (chunks.length === 0) {
    res.status(400).json({ error: 'No chunks found' });
    return;
  }

  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const assembledPath = path.join(UPLOAD_DIR, `${uploadId}-${safeName}`);

  try {
    await assembleChunks(partialDir, chunks, assembledPath);
  } catch (err: any) {
    res.status(500).json({ error: `Assembly failed: ${err.message}` });
    return;
  }

  // Resolve LUT path
  let lutPath: string | null = null;
  if (lutMode === 'builtin') {
    if (lutFile) {
      // Client selected a specific LUT — resolve relative to LUTS_DIR, sanitise traversal
      const resolved = path.resolve(LUTS_DIR, lutFile);
      if (!resolved.startsWith(LUTS_DIR + path.sep) && resolved !== LUTS_DIR) {
        fs.unlink(assembledPath, () => {});
        res.status(400).json({ error: 'Invalid LUT path' });
        return;
      }
      if (!fs.existsSync(resolved)) {
        fs.unlink(assembledPath, () => {});
        res.status(400).json({ error: `LUT not found: ${lutFile}` });
        return;
      }
      lutPath = resolved;
    } else {
      // Fall back to first found LUT (recursive)
      const all = scanLuts(LUTS_DIR);
      if (all.length === 0) {
        fs.unlink(assembledPath, () => {});
        res.status(400).json({
          error: 'No LUT found in luts/ directory. Use "Upload .cube" or "FFmpeg Native" mode.',
        });
        return;
      }
      lutPath = path.join(LUTS_DIR, all[0].path);
    }
  } else if (lutMode === 'upload') {
    if (!lutToken) {
      fs.unlink(assembledPath, () => {});
      res.status(400).json({ error: 'No LUT token — upload the LUT file first' });
      return;
    }
    lutPath = path.join(LUTS_DIR, lutToken);
    if (!fs.existsSync(lutPath)) {
      fs.unlink(assembledPath, () => {});
      res.status(400).json({ error: 'LUT file not found on server' });
      return;
    }
  }

  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const baseName = path.basename(originalName, path.extname(originalName));
  const outputName = `${baseName}_rec709.mp4`;
  const outputPath = path.join(OUTPUT_DIR, `${jobId}-${outputName}`);

  const job: Job = {
    status: 'queued',
    progress: 0,
    outputPath,
    outputName,
    inputPath: assembledPath,
    createdAt: Date.now(),
  };
  jobs.set(jobId, job);

  runConversion(jobId, assembledPath, outputPath, lutPath, lutMode === 'ffmpeg', quality || 'balanced');
  res.json({ jobId });
});

app.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
  res.json({ status: job.status, progress: job.progress, error: job.error });
});

app.get('/progress/:jobId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (payload: object) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
  const keepalive = setInterval(() => res.write(': keepalive\n\n'), 25_000);

  const poll = () => {
    const job = jobs.get(req.params.jobId);
    if (!job) { send({ error: 'Job not found' }); clearInterval(keepalive); res.end(); return; }
    send({ status: job.status, progress: job.progress, error: job.error });
    if (job.status === 'done' || job.status === 'error') {
      clearInterval(keepalive); res.end();
    } else {
      setTimeout(poll, 600);
    }
  };
  poll();

  req.on('close', () => { clearInterval(keepalive); res.end(); });
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function assembleChunks(partialDir: string, chunks: string[], outputPath: string) {
  const writeStream = fs.createWriteStream(outputPath);
  for (const chunkFile of chunks) {
    const chunkPath = path.join(partialDir, chunkFile);
    await new Promise<void>((resolve, reject) => {
      const rs = fs.createReadStream(chunkPath);
      rs.on('end', resolve);
      rs.on('error', reject);
      rs.pipe(writeStream, { end: false });
    });
    fs.unlinkSync(chunkPath);
  }
  await new Promise<void>((resolve, reject) => writeStream.end((err: Error | null) => err ? reject(err) : resolve()));
  try { fs.rmdirSync(partialDir); } catch {}
}

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
  const presetMap: Record<string, string> = { high: 'medium', balanced: 'medium', fast: 'fast' };
  const crf = crfMap[quality] ?? '23';
  const preset = presetMap[quality] ?? 'medium';

  let vf: string;
  if (useNative) {
    vf = 'colorspace=all=bt709:iall=bt2020:fast=1,format=yuv420p';
  } else {
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
    '-threads', '2',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    '-progress', 'pipe:2',
    '-nostats',
    '-y',
    outputPath,
  ];

  console.log(`[${jobId}] FFmpeg starting (${quality}, ${useNative ? 'native' : 'lut'})`);
  const proc = spawn('ffmpeg', args);

  let totalUs = 0;
  let stderr = '';

  proc.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    stderr += text;
    if (totalUs === 0) {
      const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (m) totalUs = (parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3])) * 1_000_000;
    }
    const tm = text.match(/out_time_us=(\d+)/);
    if (tm && totalUs > 0) job.progress = Math.min(99, Math.round((parseInt(tm[1]) / totalUs) * 100));
  });

  proc.on('close', (code, signal) => {
    if (code === 0) {
      job.status = 'done';
      job.progress = 100;
      console.log(`[${jobId}] Done → ${outputPath}`);
    } else {
      job.status = 'error';
      const reason = signal ? `killed by signal ${signal} (OOM — try Fast quality)` : `exited with code ${code}`;
      const snippet = stderr.slice(-400).trim();
      job.error = `FFmpeg ${reason}.\n\n${snippet}`;
      console.error(`[${jobId}] Failed: ${reason}\n${snippet}`);
      fs.unlink(outputPath, () => {});
    }
    fs.unlink(inputPath, () => {});
  });

  proc.on('error', err => {
    job.status = 'error';
    job.error = `Could not launch FFmpeg: ${err.message}`;
    fs.unlink(inputPath, () => {});
  });
}

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅  LUT Converter on http://0.0.0.0:${PORT}`);
  console.log(`    LUT folder: ${LUTS_DIR}\n`);
});
