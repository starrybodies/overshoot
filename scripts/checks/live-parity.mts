// README: the website, JSON API and MCP server "read the same retained evidence" as this repository. This
// check compares the repo with production:
//   1. the live MCP server's release and tool names against packages/material-world;
//   2. every file under public/data against the bytes served at the same URL (both sides gunzipped).
// Differences already recorded in live-parity-baseline.json print as KNOWN; anything else is new drift.
// Exit 0: no new drift. Exit 1: new drift. Exit 2: production could not be compared; never a pass.
// Networked, so not part of `pnpm check`. Run `pnpm check:live` (CI runs it weekly);
// `pnpm check:live --write-baseline` records the current differences as known.
import {readFile,readdir,writeFile,appendFile} from 'node:fs/promises';
import {join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {querySchemas,snapshot} from '../../packages/material-world/query';

type Baseline={note:string;liveVersion:string;onlyLive:string[];onlyRepo:string[];different:string[];notServed:string[]};
const origin=process.env.LIVE_ORIGIN||'https://overshoot.gaiaai.xyz';
const root=fileURLToPath(new URL('../../public/',import.meta.url));
const baselineUrl=new URL('./live-parity-baseline.json',import.meta.url);
const baseline=JSON.parse(await readFile(baselineUrl,'utf8')) as Baseline;
const unzip=(b:Buffer)=>{while(b[0]===31&&b[1]===139)b=gunzipSync(b);return b};
const lines:string[]=[];const say=(s:string)=>{console.log(s);lines.push(s)};
async function finish(code:number,message:string){
 (code?console.error:console.log)(message);lines.push(message);
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Live parity\n\n```\n'+lines.join('\n')+'\n```\n');
 process.exit(code);
}
async function get(url:string,init?:RequestInit){
 for(let attempt=1;;attempt++){
  try{const r=await fetch(url,{...init,signal:AbortSignal.timeout(30_000)});if((r.status===429||r.status>=500)&&attempt<3)throw Error('HTTP '+r.status);return r}
  catch(e){if(attempt>=3)throw e;await new Promise(done=>setTimeout(done,1000*attempt))}
 }
}
async function rpc(method:string){
 const r=await get(origin+'/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params:method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'live-parity',version:'1'}}:{}})});
 if(!r.ok)throw Error(`${method}: HTTP ${r.status}`);
 const body=await r.text(),json=r.headers.get('content-type')?.includes('text/event-stream')?body.split('\n').filter(l=>l.startsWith('data:')).at(-1)!.slice(5):body;
 return (JSON.parse(json) as {result:{serverInfo?:{version:string};tools?:{name:string}[]}}).result;
}

const current:Baseline={note:baseline.note,liveVersion:'',onlyLive:[],onlyRepo:[],different:[],notServed:[]};
let unknown='';
try{
 current.liveVersion=(await rpc('initialize')).serverInfo!.version;
 const live=(await rpc('tools/list')).tools!.map(t=>t.name),repo=Object.keys(querySchemas);
 current.onlyLive=live.filter(t=>!repo.includes(t)).sort();current.onlyRepo=repo.filter(t=>!live.includes(t)).sort();
}catch(e){unknown=`production MCP unreachable at ${origin}: ${(e as Error).message}`}

const files:string[]=[];
for(const entry of await readdir(join(root,'data'),{recursive:true,withFileTypes:true}))if(entry.isFile())files.push('/'+relative(root,join(entry.parentPath,entry.name)).split(sep).join('/'));
const missing:string[]=[],failed:string[]=[];
let next=0,answered=0;
await Promise.all(Array.from({length:12},async()=>{
 while(next<files.length&&(answered||failed.length<36)){ // stop early when production does not answer at all
  const path=files[next++];
  try{
   const r=await get(origin+path);answered++;
   if(r.status===404){missing.push(path);continue}
   if(!r.ok){failed.push(`${path} HTTP ${r.status}`);continue}
   if(!unzip(Buffer.from(await r.arrayBuffer())).equals(unzip(await readFile(join(root,path)))))current.different.push(path);
  }catch(e){failed.push(`${path} ${(e as Error).message}`)}
 }
}));
// Record a missing file by its highest directory below /data/ whose files are all missing, e.g. "/data/v14/facilities/energy/".
const dirs=(p:string)=>{const [,,v,...rest]=p.split('/').slice(0,-1);return Array.from({length:rest.length+1},(_,i)=>`/data/${v}/`+rest.slice(0,i).map(d=>d+'/').join(''))};
const total=new Map<string,number>(),gone=new Map<string,number>();
for(const p of files)for(const d of dirs(p))total.set(d,(total.get(d)||0)+1);
for(const p of missing)for(const d of dirs(p))gone.set(d,(gone.get(d)||0)+1);
current.notServed=[...new Set(missing.map(p=>dirs(p).find(d=>gone.get(d)===total.get(d))||p))].sort();
current.different.sort();

if(process.argv.includes('--write-baseline')){
 if(unknown||failed.length||!answered)await finish(2,'UNKNOWN: not writing a baseline from an incomplete comparison.');
 await writeFile(baselineUrl,JSON.stringify(current,null,1)+'\n');
 await finish(0,'Baseline written to scripts/checks/live-parity-baseline.json.');
}

say(`MCP release: live ${current.liveVersion||'unknown'}, repo ${snapshot.release}.0.0`);
say(`Data: ${files.length} repo files; ${files.length-current.different.length-missing.length-failed.length} identical, ${current.different.length} different at the same URL, ${missing.length} not served, ${failed.length} unreachable.`);
const fresh:string[]=[],known:string[]=[],complete=answered>0&&!failed.length;
const sort=(label:string,now:string[],before:string[])=>{for(const x of now)(before.includes(x)?known:fresh).push(`${label}: ${x}`);for(const x of before)if(!now.includes(x)&&(label.startsWith('MCP')?!unknown:complete))say(`RESOLVED (remove from the baseline): ${label}: ${x}`)};
if(current.liveVersion&&current.liveVersion!==`${snapshot.release}.0.0`)(current.liveVersion===baseline.liveVersion?known:fresh).push(`MCP release ${current.liveVersion} in production`);
sort('MCP tool only in production',current.onlyLive,baseline.onlyLive);
sort('MCP tool only in the repo',current.onlyRepo,baseline.onlyRepo);
sort('different at the same URL',current.different,baseline.different);
const covered=(p:string,list:string[])=>list.some(x=>x===p||(x.endsWith('/')&&p.startsWith(x)));
for(const x of current.notServed)(covered(x,baseline.notServed)?known:fresh).push(`not served: ${x}`);
if(complete)for(const x of baseline.notServed)if(!current.notServed.some(p=>covered(p,[x])||covered(x,[p])))say(`RESOLVED (remove from the baseline): not served: ${x}`);
for(const x of known.slice(0,60))say(`KNOWN ${x}`);
if(known.length>60)say(`KNOWN ...and ${known.length-60} more (see live-parity-baseline.json)`);
for(const x of fresh)say(`NEW   ${x}`);
for(const x of failed.slice(0,20))say(`UNREACHABLE ${x}`);
if(fresh.length)await finish(1,`DRIFT: ${fresh.length} new difference(s) between the repo and ${origin}. Reconcile the repo with production before releasing from it.`);
if(unknown||failed.length||!answered)await finish(2,`UNKNOWN: ${unknown||(answered?failed.length+' file(s) could not be compared':'no data file could be fetched')}.`);
await finish(0,known.length?`PASS: no new drift; ${known.length} known difference(s) remain (live-parity-baseline.json).`:`PASS: repo matches ${origin}.`);
