#!/usr/bin/env node
// Render generated shots from code, frame by frame, into launch-film/generated/.
//
//   node launch-film/render/render.mjs G12            # one shot
//   node launch-film/render/render.mjs G02,G07,G11    # several
//   node launch-film/render/render.mjs G12 --frames 0,84,167   # stills only, for review
//
// Durations come from animatic/timeline.mjs, so a retimed cut re-renders to fit.
//
// Each shot is a scene in scenes.js drawn on a 1920×1080 canvas. The page is
// stepped one frame at a time and every frame is piped to ffmpeg, so timing is
// exact regardless of how long a frame takes to draw. Geography and points come
// from the atlas's own data (world-atlas, public/data); nothing is invented.

import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {spawn,execSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {fps,size,timeline} from '../animatic/timeline.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const film=path.join(here,'..'),root=path.join(film,'..');
const args=process.argv.slice(2);
const ids=(args.find(a=>!a.startsWith('--'))||'').split(',').filter(Boolean);
const framesArg=args.includes('--frames')?args[args.indexOf('--frames')+1].split(',').map(Number):null;
if(!ids.length)throw new Error('Usage: render.mjs <G id>[,<G id>…] [--frames n,n,…]');

async function loadPlaywright(){
 try{return await import('playwright')}catch{}
 return await import(pathToFileURL(path.join(execSync('npm root -g',{encoding:'utf8'}).trim(),'playwright','index.mjs')).href);
}

const require=createRequire(path.join(root,'package.json'));
const dist=(from,name)=>{const entry=from.resolve(name);return path.join(entry.slice(0,entry.lastIndexOf(`/${name}/`)+name.length+1),'dist',`${name}.min.js`)};
const d3geo=dist(require,'d3-geo');
const d3array=dist(createRequire(d3geo),'d3-array');
const topojson=dist(require,'topojson-client');

const points=async file=>JSON.parse(await readFile(path.join(root,'public','data',file),'utf8')).features.flatMap(f=>f.geometry.coordinates);
const data={
 land:JSON.parse(await readFile(require.resolve('world-atlas/land-50m.json'),'utf8')),
 mines:await points('v2/mining-sites.geojson'),
 landfills:await points('v2/landfill-sites.geojson'),
 rivers:await points('v2/river-sites.geojson'),
};
const still=async name=>'data:image/png;base64,'+(await readFile(path.join(film,'plates','stills',name))).toString('base64');

const {chromium}=await loadPlaywright();
const browser=await chromium.launch();
const page=await browser.newPage({viewport:size});
page.on('pageerror',e=>{console.error(e);process.exitCode=1});
await page.setContent(`<body style="margin:0;background:#000"><canvas id="c" width="${size.width}" height="${size.height}"></canvas></body>`);
for(const file of [d3array,d3geo,topojson])await page.addScriptTag({path:file});
await page.addScriptTag({content:`window.DATA=${JSON.stringify(data)};window.STILLS=${JSON.stringify({P15:await still('P15-return-global--last.png')})};`});
await page.addScriptTag({path:path.join(here,'scenes.js')});
await page.evaluate(()=>window.ready);

for(const id of ids){
 const seg=timeline.find(s=>s.id===id);
 if(!seg)throw new Error(`${id} is not in animatic/timeline.mjs`);
 const duration=seg.end-seg.start;
 await page.evaluate(id=>window.setup(id),id);
 const total=Math.round(duration*fps);
 if(framesArg){
  const dir=path.join(film,'generated','review');await mkdir(dir,{recursive:true});
  for(const f of framesArg){
   await page.evaluate(([f,fps])=>window.draw(f/fps),[Math.min(f,total-1),fps]);
   await writeFile(path.join(dir,`${id}-${f}.jpg`),await page.screenshot({type:'jpeg',quality:90}));
  }
  console.log(`${id}: ${framesArg.length} review frames → generated/review/`);
  continue;
 }
 const out=path.join(film,'generated',`${id}.mp4`);await mkdir(path.dirname(out),{recursive:true});
 const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-',
  '-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
 for(let f=0;f<total;f++){
  await page.evaluate(t=>window.draw(t),f/fps);
  const buf=await page.screenshot({type:'jpeg',quality:95});
  if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
 }
 ff.stdin.end();await new Promise(r=>ff.on('close',r));
 console.log(`${id}: ${total} frames, ${duration}s → ${path.relative(root,out)}`);
}
await browser.close();
