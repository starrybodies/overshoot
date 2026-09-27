#!/usr/bin/env node
// Record the real OVERSHOOT interface for the launch film.
//
//   node launch-film/capture/capture.mjs                 # all plates, live site
//   node launch-film/capture/capture.mjs --base http://localhost:5173 --only P04-escondida,P05-journey
//   node launch-film/capture/capture.mjs --mode stills   # 4K keyframes only
//
// Modes:
//   stills  3840×2160 PNG first/last/named frames (deviceScaleFactor 2). These
//           are the frames to hand the video model as first/last-frame anchors.
//   video   1920×1080 WebM of each move. Use for timing and the animatic; record
//           final 4K/60 masters with a screen recorder following the same plate.
//   both    (default)
//
// Needs Playwright. If it is not installed: npm install --no-save playwright
// and either `npx playwright install chromium` or set CHROMIUM_PATH.
import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {captures} from './captures.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const args=Object.fromEntries(process.argv.slice(2).reduce((pairs,arg,i,all)=>{if(arg.startsWith('--'))pairs.push([arg.slice(2),all[i+1]&&!all[i+1].startsWith('--')?all[i+1]:'1']);return pairs},[]));
const base=(args.base||'https://overshoot.gaiaai.xyz').replace(/\/$/,'');
const mode=args.mode||'both';
const theme=args.theme||'dark';
const out=path.resolve(args.out||path.join(here,'..','plates'));
const only=args.only?new Set(args.only.split(',')):null;
if(!['stills','video','both'].includes(mode))throw new Error(`Unknown --mode ${mode}`);
if(!['dark','light'].includes(theme))throw new Error(`Unknown --theme ${theme}`);

async function loadPlaywright(){
 try{return await import('playwright')}catch{}
 try{
  const root=execSync('npm root -g',{encoding:'utf8'}).trim();
  return await import(pathToFileURL(path.join(root,'playwright','index.mjs')).href);
 }catch{}
 throw new Error('Playwright is not installed. Run: npm install --no-save playwright');
}
function chromiumPath(){
 const custom=process.env.CHROMIUM_PATH;
 if(custom&&!existsSync(custom))throw new Error(`CHROMIUM_PATH does not exist: ${custom}`);
 return custom||undefined;
}

const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
async function smoothScroll(page,px,ms){
 await page.evaluate(async ({px,ms})=>{
  const start=window.scrollY,t0=performance.now(),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  await new Promise(done=>{const tick=now=>{const t=Math.min(1,(now-t0)/ms);window.scrollTo({top:start+px*ease(t),behavior:'instant'});if(t<1)requestAnimationFrame(tick);else done()};requestAnimationFrame(tick)});
 },{px,ms});
}

async function run(page,capture,{stills,dir}){
 const shots=[];
 const still=async name=>{if(!stills)return;const file=path.join(dir,`${capture.id}--${name}.png`);await page.screenshot({path:file});shots.push(path.relative(out,file))};
 await page.goto(base+capture.url,{waitUntil:'networkidle',timeout:120000});
 await page.waitForTimeout(1500);
 await still('first');
 for(const step of capture.steps){
  try{
   if(step.wait)await page.waitForTimeout(step.wait);
   else if(step.still)await still(step.still);
   else if(step.scrollTo){
    const target=page.getByText(step.scrollTo,{exact:false}).first();
    const box=await target.boundingBox();
    if(box)await smoothScroll(page,box.y+box.height/2-page.viewportSize().height/2,step.ms||3000);
   }
   else if(step.scroll!==undefined)await smoothScroll(page,step.scroll,step.ms||2500);
   else if(step.click)await (step.click.hasText?page.getByRole(step.click.role).filter({hasText:step.click.hasText}):page.getByRole(step.click.role,{name:step.click.name,exact:true})).first().click();
   else if(step.clickText)await page.getByText(step.clickText,{exact:true}).first().click();
   else if(step.hover)await page.getByText(step.hover,{exact:true}).first().hover();
   else if(step.type)await page.locator(step.type.selector).pressSequentially(step.type.text,{delay:step.type.delay||120});
   else if(step.press)await page.keyboard.press(step.press);
   else if(step.drag){
    const box=await page.locator(step.drag.selector).first().boundingBox();
    if(box){
     const x=box.x+box.width/2,y=box.y+box.height/2,frames=Math.max(1,Math.round((step.drag.ms||2000)/16));
     await page.mouse.move(x,y);await page.mouse.down();
     for(let i=1;i<=frames;i++){const t=ease(i/frames);await page.mouse.move(x+step.drag.dx*t,y+step.drag.dy*t);await page.waitForTimeout(16)}
     await page.mouse.up();
    }
   }
  }catch(error){console.warn(`  ${capture.id}: skipped ${JSON.stringify(step)} (${error.message.split('\n')[0]})`)}
 }
 await still('last');
 return shots;
}

const {chromium}=await loadPlaywright();
const browser=await chromium.launch({executablePath:chromiumPath(),args:['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--hide-scrollbars']});
const prepare=`try{localStorage.setItem('overshoot-mail-invite-v1','seen');localStorage.setItem('overshoot-theme','${theme}')}catch{}`;
const selected=captures.filter(c=>!only||only.has(c.id));
if(!selected.length)throw new Error('No captures match --only');
await mkdir(out,{recursive:true});
const manifest={base,theme,mode,capturedAt:new Date().toISOString(),plates:[]};

for(const capture of selected){
 console.log(`${capture.id}  ${capture.title}`);
 const plate={id:capture.id,title:capture.title,url:base+capture.url,stills:[],video:null};
 if(mode!=='video'){
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:2,locale:'en-US',colorScheme:theme,reducedMotion:'no-preference'});
  await context.addInitScript(prepare);
  plate.stills=await run(await context.newPage(),capture,{stills:true,dir:path.join(out,'stills')});
  await context.close();
 }
 if(mode!=='stills'){
  const dir=path.join(out,'video');
  const context=await browser.newContext({viewport:{width:1920,height:1080},locale:'en-US',colorScheme:theme,recordVideo:{dir,size:{width:1920,height:1080}}});
  await context.addInitScript(prepare);
  const page=await context.newPage();
  await run(page,capture,{stills:false,dir});
  const video=page.video();
  await context.close();
  if(video){const file=path.join(dir,`${capture.id}.webm`);await rename(await video.path(),file);plate.video=path.relative(out,file)}
 }
 manifest.plates.push(plate);
}
await browser.close();
// A partial run (--only) updates its plates and keeps the others already recorded.
const manifestFile=path.join(out,'manifest.json');
let previous=[];
try{previous=JSON.parse(await readFile(manifestFile,'utf8')).plates||[]}catch{}
const fresh=new Set(manifest.plates.map(p=>p.id));
const merged=new Map(previous.map(p=>[p.id,p]));
for(const plate of manifest.plates){const before=merged.get(plate.id);merged.set(plate.id,{...plate,stills:plate.stills.length?plate.stills:before?.stills||[],video:plate.video||before?.video||null})}
manifest.plates=[...merged.values()].sort((a,b)=>a.id.localeCompare(b.id));
await writeFile(manifestFile,JSON.stringify(manifest,null,1)+'\n');
console.log(`\n${fresh.size} plates recorded → ${out}`);
