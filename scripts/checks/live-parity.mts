// README: "This repository includes the same public browser data that the live atlas serves", and the MCP
// server reads the same retained evidence. This check compares the repo with production:
//   1. the live MCP server's release and tool names against packages/material-world;
//   2. every file under public/data against the bytes served at the same URL (both sides gunzipped).
// Exit 0: parity. Exit 1: drift (repo and production disagree). Exit 2: production unreachable; never a pass.
// Networked, so it is not part of `pnpm check`. Run with `pnpm check:live`; CI runs it weekly.
import {readFile,readdir,appendFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {querySchemas,snapshot} from '../../packages/material-world/query';

const origin=process.env.LIVE_ORIGIN||'https://overshoot.gaiaai.xyz';
const root=new URL('../../public/',import.meta.url);
const unzip=(b:Buffer)=>{while(b[0]===31&&b[1]===139)b=gunzipSync(b);return b};
const lines:string[]=[];const say=(s:string)=>{console.log(s);lines.push(s)};

async function rpc(method:string){
 const r=await fetch(origin+'/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params:method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'live-parity',version:'1'}}:{}})});
 if(!r.ok)throw Error(`${method}: HTTP ${r.status}`);
 return ((await r.json()) as {result:{serverInfo?:{version:string};tools?:{name:string}[]}}).result;
}
let live:{version:string;tools:string[]};
try{live={version:(await rpc('initialize')).serverInfo!.version,tools:(await rpc('tools/list')).tools!.map(t=>t.name)}}
catch(e){console.error(`UNKNOWN: production MCP unreachable at ${origin}: ${(e as Error).message}`);process.exit(2)}

let drift=0;
const repoTools=Object.keys(querySchemas),onlyLive=live.tools.filter(t=>!repoTools.includes(t)),onlyRepo=repoTools.filter(t=>!live.tools.includes(t));
say(`MCP release: live ${live.version}, repo ${snapshot.release}.0.0`);
if(live.version!==`${snapshot.release}.0.0`)drift++;
if(onlyLive.length){drift++;say(`MCP tools only in production (${onlyLive.length}): ${onlyLive.join(', ')}`)}
if(onlyRepo.length){drift++;say(`MCP tools only in the repo (${onlyRepo.length}): ${onlyRepo.join(', ')}`)}

const files:string[]=[];
for(const entry of await readdir(new URL('data/',root),{recursive:true,withFileTypes:true}))if(entry.isFile())files.push((entry.parentPath+'/'+entry.name).slice(new URL(root).pathname.length-1));
const differ:string[]=[],missing:string[]=[],failed:string[]=[];
let next=0;
await Promise.all(Array.from({length:12},async()=>{
 while(next<files.length){
  const path=files[next++];
  try{
   const r=await fetch(origin+path);
   if(r.status===404){missing.push(path);continue}
   if(!r.ok){failed.push(`${path} HTTP ${r.status}`);continue}
   const [a,b]=[unzip(Buffer.from(await r.arrayBuffer())),unzip(await readFile(new URL('.'+path,root)))];
   if(!a.equals(b))differ.push(path);
  }catch(e){failed.push(`${path} ${(e as Error).message}`)}
 }
}));
say(`Data: ${files.length} repo files; ${files.length-differ.length-missing.length-failed.length} identical, ${differ.length} different at the same URL, ${missing.length} not served, ${failed.length} unreachable.`);
const byVersion=(list:string[])=>Object.entries(list.reduce<Record<string,number>>((n,p)=>{const v=p.split('/')[2];n[v]=(n[v]||0)+1;return n},{})).sort(([a],[b])=>+a.slice(1)-+b.slice(1)).map(([v,n])=>`${v} ${n}`).join(', ');
if(missing.length)say(`  not served, by version: ${byVersion(missing)}`);
for(const [label,list] of [['different',differ],['unreachable',failed]] as const)for(const p of list.sort().slice(0,40))say(`  ${label}: ${p}`);
if(differ.length||missing.length)drift++;
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Live parity\n\n```\n'+lines.join('\n')+'\n```\n');
if(drift){console.error(`DRIFT: the repo and ${origin} disagree. Reconcile the repo with what production serves before releasing from it.`);process.exit(1)}
if(failed.length){console.error('UNKNOWN: some files could not be compared.');process.exit(2)}
console.log(`PASS: repo matches ${origin}.`);
