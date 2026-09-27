#!/usr/bin/env node
// Build the launch film animatic: a timed cut of the whole film.
//
//   node launch-film/animatic/build.mjs            # animatic with slates, labels and VO subtitles
//   node launch-film/animatic/build.mjs --clean    # rough cut: no labels or subtitles
//
// Inputs, all optional except the plates:
//   plates/video/*.webm       real interface recordings (capture/capture.mjs --mode video)
//   generated/<G id>.<ext>    generated takes (mp4, mov or webm); a missing take renders as a slate
//   audio/vo.<ext>            recorded voiceover laid from 0:00 (wav, mp3, m4a, aac or flac)
//   audio/music.<ext>         score or temp track laid from 0:00, mixed under the VO
//
// Output: out/overshoot-animatic.mp4 (or overshoot-roughcut.mp4 with --clean),
// 1920×1080, 24 fps, H.264 + AAC.
//
// Needs Playwright (for the cards) and ffmpeg (FFMPEG=/path/to/ffmpeg, ffmpeg on
// PATH, or `pip install imageio-ffmpeg`).
import {execFileSync,execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {fps,size,timeline} from './timeline.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const film=path.resolve(here,'..');
const repo=path.resolve(film,'..');
const clean=process.argv.includes('--clean');
const out=path.join(film,'out');
const work=path.join(out,'.work');
const {width:W,height:H}=size;
const SUB=200; // subtitle strip height, overlaid at the foot of the frame

function findFfmpeg(){
 const candidates=[process.env.FFMPEG,'ffmpeg'].filter(Boolean);
 for(const bin of candidates){try{execFileSync(bin,['-version'],{stdio:'ignore'});return bin}catch{}}
 try{return execFileSync('python3',['-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],{encoding:'utf8'}).trim()}catch{}
 throw new Error('ffmpeg not found. Set FFMPEG, install ffmpeg, or pip install imageio-ffmpeg.');
}
async function loadPlaywright(){
 try{return await import('playwright')}catch{}
 try{return await import(pathToFileURL(path.join(execSync('npm root -g',{encoding:'utf8'}).trim(),'playwright','index.mjs')).href)}catch{}
 throw new Error('Playwright is not installed. Run: npm install --no-save playwright');
}
const ffmpeg=findFfmpeg();
const run=args=>execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:['ignore','ignore','inherit']});
const probe=file=>{
 try{execFileSync(ffmpeg,['-hide_banner','-i',file],{encoding:'utf8',stdio:['ignore','pipe','pipe']})}catch(error){
  const m=/Duration: (\d+):(\d+):([\d.]+)/.exec(String(error.stderr));
  if(m)return Number(m[1])*3600+Number(m[2])*60+Number(m[3]);
 }
 throw new Error(`Cannot read duration of ${file}`);
};
const clock=s=>`${Math.floor(s/60)}:${(s%60).toFixed(1).padStart(4,'0')}`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>');

// ── Sources of truth: the shot list and the VO script ─────────────────────
async function readShots(){
 const text=await readFile(path.join(film,'SHOT-LIST.md'),'utf8'),shots={};
 for(const block of text.split(/^### /m).slice(1)){
  const [head,...lines]=block.split('\n');
  const m=/^(G\d+) · (.+?) · /.exec(head);
  if(!m)continue;
  const field=name=>lines.find(l=>l.startsWith(`- **${name}:**`))?.replace(`- **${name}:**`,'').trim()||'';
  shots[m[1]]={title:m[2],first:field('First frame'),last:field('Last frame')};
 }
 return shots;
}
async function readCues(){
 const text=await readFile(path.join(film,'VO-SCRIPT.md'),'utf8'),cues=[];
 for(const line of text.split('\n')){
  const m=/^\| (\d+) \| (\d+):(\d+) \| (.+?) \|/.exec(line);
  if(m)cues.push({n:Number(m[1]),at:Number(m[2])*60+Number(m[3]),text:m[4]});
 }
 return cues.map((c,i)=>({...c,until:Math.min(cues[i+1]?.at??c.at+4,c.at+4)}));
}
async function findMedia(dir,base,exts){
 if(!existsSync(dir))return null;
 const files=await readdir(dir);
 const hit=exts.map(e=>`${base}.${e}`).find(f=>files.includes(f));
 return hit?path.join(dir,hit):null;
}

// ── Cards, rendered in the atlas's own type ────────────────────────────────
const font=p=>pathToFileURL(path.join(repo,'node_modules',p)).href;
const asset=p=>pathToFileURL(p).href;
const css=`
@font-face{font-family:Grotesk;src:url(${font('@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2')}) format('woff2');font-weight:300 700}
@font-face{font-family:Plex;src:url(${font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')}) format('woff2')}
@font-face{font-family:Sans;src:url(${font('@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2')}) format('woff2');font-weight:100 1000}
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden;font-family:Sans,sans-serif;color:#edf2e8}
.kicker{font-family:Plex,monospace;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#a4b7a4}
.title{font-family:Grotesk,sans-serif;font-weight:500;letter-spacing:-.065em;line-height:1.02}
`;
const cards={
 slate:(id,seg,shot)=>`<body style="background:#0b110e;padding:120px 150px;display:flex;flex-direction:column;justify-content:space-between">
  <div><p class="kicker">Generated shot · placeholder</p>
  <h1 class="title" style="font-size:132px;margin-top:36px"><span style="color:#b85226">${id}</span> ${esc(shot.title)}</h1>
  <p class="kicker" style="margin-top:28px;color:#c3dfa4">${clock(seg.start)} – ${clock(seg.end)} · ${(seg.end-seg.start).toFixed(1)} s</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:80px;font-size:30px;line-height:1.4;color:#c9d6c6">
   <div><p class="kicker" style="margin-bottom:14px">First frame</p>${inline(shot.first)}</div>
   <div><p class="kicker" style="margin-bottom:14px">Last frame</p>${inline(shot.last)}</div></div>
  <p class="kicker" style="font-size:17px;color:#6f8470">Replace with launch-film/generated/${id}.mp4 · prompt in SHOT-LIST.md</p></body>`,
 label:text=>`<body><div class="kicker" style="position:absolute;left:28px;bottom:26px;padding:9px 14px;background:rgba(7,10,8,.78);border:1px solid rgba(195,223,164,.35);border-radius:6px;font-size:17px;color:#edf2e8">${esc(text)}</div></body>`,
 subtitle:text=>`<body><div style="position:absolute;left:0;right:0;bottom:40px;text-align:center"><span style="display:inline-block;max-width:1500px;padding:12px 26px;background:rgba(7,10,8,.72);border-radius:8px;font-size:40px;line-height:1.3;font-weight:450">${esc(text)}</span></div></body>`,
 title:which=>`<body style="background:radial-gradient(ellipse at 30% 55%,rgba(7,10,8,.55),rgba(7,10,8,0) 65%)"><h1 class="title" style="position:absolute;left:150px;top:50%;transform:translateY(-50%);font-size:150px;color:${which==='go'?'#c3dfa4':'#edf2e8'}">${which==='go'?'Where did it go?':'Where did it<br>come from?'}</h1></body>`,
 end:()=>`<body style="background:#070a08;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
  <div style="width:1100px;height:300px;overflow:hidden;position:relative;mix-blend-mode:screen"><img src="${asset(path.join(repo,'public','overshoot-lockup.png'))}" style="position:absolute;width:1100px;left:0;top:-125px;filter:invert(1) hue-rotate(180deg)"></div>
  <p style="font-size:38px;color:#c9d6c6;margin-top:-40px">A planetary atlas of material flows.</p>
  <div style="display:flex;align-items:center;gap:18px;margin-top:70px"><img src="${asset(path.join(film,'brand','gaia-ai-mark.png'))}" style="width:74px;height:74px"><span class="kicker" style="font-size:22px;color:#edf2e8">A Gaia AI product</span></div>
  <p style="font-size:34px;margin-top:80px;color:#c3dfa4">Explore the material world. <b style="font-weight:600;color:#edf2e8">overshoot.gaiaai.xyz</b></p>
  <p class="title" style="font-size:54px;margin-top:40px;letter-spacing:-.04em">Try it. Explore it. Tell us what we’re missing.</p></body>`,
};

async function renderCards(jobs){
 const {chromium}=await loadPlaywright();
 const browser=await chromium.launch({args:['--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width:W,height:H}});
 for(const [file,body] of jobs){
  const html=path.join(work,'card.html');
  await writeFile(html,`<!doctype html><meta charset="utf-8"><style>${css}</style>${body}`);
  await page.goto(pathToFileURL(html).href);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(50);
  await page.screenshot({path:file,omitBackground:true,clip:file.includes(`${path.sep}sub-`)?{x:0,y:H-SUB,width:W,height:SUB}:undefined});
 }
 await browser.close();
}

// ── Build ─────────────────────────────────────────────────────────────────
const shots=await readShots(),cues=await readCues();
for(const [i,seg] of timeline.entries()){
 if(seg.end<=seg.start)throw new Error(`${seg.id}: end must follow start`);
 if(i&&Math.abs(timeline[i-1].end-seg.start)>1e-6)throw new Error(`${seg.id}: gap or overlap after ${timeline[i-1].id}`);
 if(seg.id.startsWith('G')&&!shots[seg.id])throw new Error(`${seg.id} is not in SHOT-LIST.md`);
}
await rm(work,{recursive:true,force:true});
await mkdir(work,{recursive:true});

const jobs=[],plan=[];
let frame=0;
for(const [i,seg] of timeline.entries()){
 // Frame counts come from the cumulative timecode so rounding never drifts.
 const frames=Math.round(seg.end*fps)-frame;frame+=frames;
 const item={...seg,frames,index:i,file:path.join(work,`seg-${String(i).padStart(2,'0')}.mp4`)};
 if(seg.id==='END'){item.card=path.join(work,'end.png');jobs.push([item.card,cards.end()])}
 else if(seg.plate){
  item.source=path.join(film,'plates','video',`${seg.plate}.webm`);
  if(!existsSync(item.source))throw new Error(`Missing plate ${item.source}. Run capture/capture.mjs --mode video first.`);
  const length=probe(item.source),dur=frames/fps;
  item.in=seg.in??Math.max(0,length-1-dur);
  if(item.in+dur>length+.01)throw new Error(`${seg.id}: in-point ${item.in}s runs past the ${length.toFixed(1)}s recording`);
  item.labelText=`${seg.id} · plate · ${seg.plate.replace(/^P\d+-/,'')}${seg.note?' · '+seg.note:''}`;
 }else{
  item.take=await findMedia(path.join(film,'generated'),seg.id,['mp4','mov','webm','m4v']);
  if(!item.take){item.card=path.join(work,`slate-${seg.id}.png`);jobs.push([item.card,cards.slate(seg.id,seg,shots[seg.id])])}
  item.labelText=`${seg.id} · ${item.take?'generated take':'slate'} · ${shots[seg.id].title}`;
 }
 if(item.labelText&&!clean){item.label=path.join(work,`label-${i}.png`);jobs.push([item.label,cards.label(item.labelText)])}
 if(seg.title){item.titleCard=path.join(work,`title-${seg.title}.png`);jobs.push([item.titleCard,cards.title(seg.title)])}
 plan.push(item);
}
const subs=clean?[]:cues.map(c=>({...c,file:path.join(work,`sub-${c.n}.png`)}));
for(const s of subs)jobs.push([s.file,cards.subtitle(s.text)]);
console.log(`Rendering ${jobs.length} cards…`);
await renderCards(jobs);

const fit=`scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${fps}`;
const enc=['-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(fps),'-an'];
for(const item of plan){
 const dur=item.frames/fps,inputs=[],chain=[];
 if(item.card){inputs.push('-loop','1','-framerate',String(fps),'-i',item.card);chain.push(`[0:v]${fit}[base]`)}
 else if(item.take){inputs.push('-i',item.take);chain.push(`[0:v]${fit},tpad=stop_mode=clone:stop_duration=${dur}[base]`)}
 else{inputs.push('-ss',item.in.toFixed(3),'-i',item.source);chain.push(`[0:v]${fit},tpad=stop_mode=clone:stop_duration=${dur}[base]`)}
 let last='base',n=1;
 if(item.id==='END'){chain.push(`[${last}]fade=in:st=0:d=1.2[endfade]`);last='endfade'}
 if(item.titleCard){
  const at=Math.max(0,item.titleAt-item.start);
  inputs.push('-loop','1','-framerate',String(fps),'-t',String(dur),'-i',item.titleCard);
  chain.push(`[${n}:v]format=rgba,fade=in:st=${at}:d=0.7:alpha=1[t${n}]`,`[${last}][t${n}]overlay=0:0:shortest=1[v${n}]`);last=`v${n}`;n++;
 }
 if(item.label){inputs.push('-i',item.label);chain.push(`[${last}][${n}:v]overlay=0:0[v${n}]`);last=`v${n}`;n++}
 // VO subtitles are burned into each segment they overlap, in segment time.
 for(const s of subs.filter(s=>s.at<item.end&&s.until>item.start)){
  const from=Math.max(0,s.at-item.start),to=Math.min(dur,s.until-item.start);
  inputs.push('-loop','1','-framerate',String(fps),'-t',String(dur),'-i',s.file);
  chain.push(`[${last}][${n}:v]overlay=0:${H-SUB}:enable='between(t,${from.toFixed(3)},${(to-0.001).toFixed(3)})'[v${n}]`);last=`v${n}`;n++;
 }
 run([...inputs,'-filter_complex',chain.join(';'),'-map',`[${last}]`,'-frames:v',String(item.frames),...enc,item.file]);
 process.stdout.write(`  ${item.id.padEnd(4)} ${clock(item.start)}–${clock(item.end)}  ${item.card&&item.id!=='END'?'slate':item.take?'take':item.id==='END'?'end card':'plate'}\n`);
}

// Concatenate, then lay fades and sound over the whole film.
const list=path.join(work,'segments.txt');
await writeFile(list,plan.map(p=>`file '${p.file.replace(/'/g,"'\\''")}'`).join('\n')+'\n');
const joined=path.join(work,'joined.mp4');
run(['-f','concat','-safe','0','-i',list,'-c','copy',joined]);

const total=frame/fps;
const vo=await findMedia(path.join(film,'audio'),'vo',['wav','mp3','m4a','aac','flac']);
const music=await findMedia(path.join(film,'audio'),'music',['wav','mp3','m4a','aac','flac']);
// Mix the sound in its own pass: filtering audio alongside the video makes the
// AAC encoder receive out-of-order timestamps and truncates the track.
const mix=path.join(work,'mix.wav'),audioIn=[],audioChain=[],tracks=[];
for(const [file,gain] of [[vo,1],[music,vo?0.35:1]])if(file){
 const i=tracks.length;audioIn.push('-i',file);
 audioChain.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${gain},apad=whole_dur=${total.toFixed(3)},atrim=0:${total.toFixed(3)}[a${i}]`);
 tracks.push(`[a${i}]`);
}
if(tracks.length)run([...audioIn,'-filter_complex',[...audioChain,tracks.length>1?`${tracks.join('')}amix=inputs=${tracks.length}:duration=longest:normalize=0[aout]`:`${tracks[0]}anull[aout]`].join(';'),'-map','[aout]','-c:a','pcm_s16le',mix]);
else run(['-f','lavfi','-t',total.toFixed(3),'-i','anullsrc=channel_layout=stereo:sample_rate=48000','-c:a','pcm_s16le',mix]);

const name=clean?'overshoot-roughcut.mp4':'overshoot-animatic.mp4';
const final=path.join(out,name);
run(['-i',joined,'-i',mix,'-filter_complex',`[0:v]fade=in:st=0:d=0.8,fade=out:st=${(total-1.2).toFixed(3)}:d=1.2[vout]`,'-map','[vout]','-map','1:a','-t',total.toFixed(3),
 '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-r',String(fps),'-c:a','aac','-b:a','192k','-movflags','+faststart',final]);

const takes=plan.filter(p=>p.take).length,slates=plan.filter(p=>p.card&&p.id!=='END').length;
console.log(`\n${name}: ${clock(total)} · ${plan.filter(p=>p.plate).length} plate cuts · ${takes} generated takes · ${slates} slates${vo?' · VO':''}${music?' · music':''}`);
console.log(final);
