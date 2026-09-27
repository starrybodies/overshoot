import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {connectionsPath,type ConnectionCatalog} from '../../packages/material-world/connections';
import {runQuery,type AssetReader} from '../../packages/material-world/query';
import {flowEndpoints,flowLabel,connectionBounds} from '../../apps/overshoot/world/connectionGeometry';
import {atlasUrl,readAtlasState,defaultAtlasState} from '../../apps/overshoot/atlas-next/atlasState';
import type {JourneyPin} from '../../packages/material-world/journey';
import type {Port} from '../../packages/material-world/maritime';
import type {Flow} from '../../apps/overshoot/world/model';
const root=new URL('../../',import.meta.url);
const read:AssetReader=async<T,>(path:string)=>{const b=await readFile(new URL('public'+path,root));return JSON.parse((b[0]===31&&b[1]===139?gunzipSync(b):b).toString()) as T};
const catalog=await read<ConnectionCatalog>(connectionsPath);
const pins=new Map<string,JourneyPin>();
for(const name of await readdir(new URL('public/data/v16/journeys/',root))){if(!name.startsWith('layer-'))continue;for(const p of await read<JourneyPin[]>('/data/v16/journeys/'+name))pins.set(p.id,p)}
const ports=new Map((await read<Port[]>('/data/v16/maritime/ports.json')).map(p=>[p.id,p]));
const sourceIds=new Set(catalog.sources.map(s=>s.id));
assert.equal(sourceIds.size,10);
assert.equal(catalog.networks.length,5);
assert.equal(new Set(catalog.networks.flatMap(n=>n.nodes.map(p=>p.country))).size,6);
const flowExamples:Flow[]=[];
for(const n of catalog.networks){
 const nodes=new Map(n.nodes.map(p=>[p.id,p]));assert.equal(nodes.size,n.nodes.length);
 for(const p of n.nodes){
  if(p.facility){const upstream=pins.get(p.facility.id)!;assert(upstream,p.name);assert.deepEqual(p.coordinates,upstream.coordinates);assert.equal(p.country,upstream.country);assert.equal(p.facility.kind,upstream.kind)}
  else if(p.portId){const upstream=ports.get(p.portId)!;assert(upstream,p.name);assert.deepEqual(p.coordinates,upstream.coordinates);assert.equal(p.country,upstream.country)}
  else if(p.locationSource==='directemar-coloso-2020')assert.deepEqual(p.coordinates,[-70.4650056,-23.7568417]);
  else assert.equal(p.coordinates,null,'No point without upstream identity evidence');
 }
 for(const l of n.links){
  const a=nodes.get(l.from),b=nodes.get(l.to);assert(a&&b,'Every endpoint resolves');assert.equal(l.quantity,null);assert.equal(l.evidence,'operator-reported');assert(l.sourceIds.length>0&&l.sourceIds.every(s=>sourceIds.has(s)));assert(l.period&&l.scope);
  assert.equal(l.geometry,a.coordinates&&b.coordinates?'schematic':'unmapped');
  if(a.coordinates&&b.coordinates)flowExamples.push({id:l.id,origin:a.country,destination:b.country,originLabel:a.name,destinationLabel:b.name,amount:0,unit:'Quantity not reported',year:0,estimated:false,basis:l.scope,sourceUrl:catalog.sources.find(s=>s.id===l.sourceIds[0])!.url,record:l,connection:{mode:l.mode,from:a.coordinates,to:b.coordinates}});
 }
}
assert.equal(catalog.networks.flatMap(n=>n.links).length,10);assert.equal(flowExamples.length,8);
for(const f of flowExamples){assert(flowEndpoints(f,new Map()));assert(!flowLabel(f,String).includes('0 Quantity'));assert(connectionBounds([f]))}
assert.equal(flowEndpoints({...flowExamples[0],connection:{...flowExamples[0].connection!,from:[181,0]}},new Map()),null);
const ordinary={...flowExamples[0],connection:undefined,origin:'BC',destination:'JPN',amount:10};
assert.deepEqual(flowEndpoints(ordinary,new Map([['JPN',[138,36]]]))?.a,[-125,54]);
assert.equal(flowEndpoints({...ordinary,amount:0},new Map([['JPN',[138,36]]])),null);
assert.equal(connectionBounds([ordinary]),null);
const all=await runQuery('connections',{},read);assert.equal(all.links,10);assert.equal(all.mappedLinks,8);
const norway=await runQuery('connections',{country:'NOR'},read);assert.equal(norway.matched,1);assert.equal((norway.networks as ConnectionCatalog['networks'])[0].id,'kiruna-narvik');
const brazil=await runQuery('connections',{material:'aluminium',country:'BRA'},read);assert.equal(brazil.links,3);assert.equal(brazil.mappedLinks,2);assert.equal((brazil.sources as unknown[]).length,2);
const missing=await runQuery('connections',{material:'fuels',country:'VEN'},read);assert.equal(missing.matched,0);assert.match(missing.coverage as string,/coverage gaps/);
await assert.rejects(runQuery('connections',{network:'not-a-network'},read));
await assert.rejects(runQuery('connections',{network:'../../secret'},read));
await assert.rejects(runQuery('connections',{country:'CHL',unexpected:true},read));
const state={...defaultAtlasState,view:'materials' as const,material:'aluminium',form:'7602',place:'AUS',layer:'connections' as const,network:'queensland-aluminium'};
assert.deepEqual(readAtlasState(new URL(atlasUrl(state),'https://example.test')),state);
assert.equal(readAtlasState(new URL('/materials?network=../../x','https://example.test')).network,'');
console.log('PASS: 10 source-backed links; 8 mapped / 2 explicitly unmapped; exact upstream locations; null quantities; cross-border discovery; invalid inputs; regional trade anchors; share links.');
