import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {runQuery,type AssetReader} from '../../packages/material-world/query';
import {selectTradeEvidence} from '../../packages/material-world/trade';
import {portCalls,type Port,type PortActivity,type MaritimeCatalog} from '../../packages/material-world/maritime';
import {readAtlasState,atlasUrl,defaultAtlasState} from '../../apps/overshoot/atlas-next/atlasState';
import type {TradeRecord} from '../../apps/overshoot/world/model';
const root=new URL('../../',import.meta.url);
const read:AssetReader=async<T,>(path:string)=>{const b=await readFile(new URL('public'+path,root));return JSON.parse((b[0]===31&&b[1]===139?gunzipSync(b):b).toString()) as T};
const catalog=await read<MaritimeCatalog>('/data/v16/maritime/catalog.json');
const ports=await read<Port[]>(catalog.portsPath),activity=await read<PortActivity[]>(catalog.activityPath);
assert.equal(ports.length,2065);assert.equal(new Set(ports.map(p=>p.id)).size,ports.length);
assert.equal(catalog.months.length,12);assert.equal(activity.length,24780);
assert.equal(new Set(activity.map(r=>r.port+'|'+r.month)).size,activity.length);
for(const p of ports){assert(p.coordinates.every(Number.isFinite));assert(Math.abs(p.coordinates[0])<=180&&Math.abs(p.coordinates[1])<=90)}
for(const r of activity){assert(catalog.months.includes(r.month));assert(r.days>0&&r.days<=r.expectedDays)}
const venPorts=await runQuery('ports',{country:'VEN',limit:100},read);
assert.equal(venPorts.matched,18);assert((venPorts.records as Port[]).some(p=>p.name==='Jose Terminal'));
const jose=await runQuery('port_activity',{port:'port524',month:'2026-08'},read);
assert.equal((jose.rows as PortActivity[]).length,1);assert.equal(portCalls((jose.rows as PortActivity[])[0],'tanker'),10);assert.equal((jose.rows as PortActivity[])[0].days,31);
assert.equal(portCalls(undefined,'tanker'),null);assert.equal(portCalls({...activity[0],portcalls_tanker:0},'tanker'),0);
await assert.rejects(runQuery('port_activity',{port:'../../x'},read));
await assert.rejects(runQuery('port_activity',{port:'port524',month:'2099-01'},read));
await assert.rejects(runQuery('ports',{country:'VEN',limit:10000},read));
const x=await read<{flows:TradeRecord[]}>('/data/v15/trade.json'),m=await read<{flows:TradeRecord[]}>('/data/v16/oil-imports.json');
assert.equal(m.flows.length,2647);
assert(m.flows.every(r=>r.reported_flow==='M'&&r.reporter===r.destination&&r.is_net_weight_estimated===false&&r.tonnes===Number(r.original_value)/1000));
const world=selectTradeEvidence(x.flows,m.flows,'WORLD','out');
const groups=new Map<string,Set<string>>();
for(const r of world){const key=[r.origin,r.commodity,r.year].join('|');if(!groups.has(key))groups.set(key,new Set());groups.get(key)!.add(r.reported_flow)}
assert([...groups.values()].every(s=>s.size===1),'Never combine exporter and mirror importer observations for an origin/product/year');
const ven=await runQuery('trade',{country:'VEN',commodity:'2709',limit:100},read);
assert.equal(ven.matched,5);assert.equal(ven.reportingBasis,'Partners’ import declarations');
const rows=ven.records as TradeRecord[];
assert(rows.some(r=>r.reporter==='USA'&&r.tonnes===13157409.636));assert(rows.some(r=>r.reporter==='ESP'&&r.tonnes===2919460));
const ownImports=selectTradeEvidence(x.flows,m.flows,'ESP','in','2709');assert(ownImports.every(r=>r.reporter==='ESP'&&r.reported_flow==='M'));
const energy=await runQuery('energy',{country:'VEN',measure:'crude-production',from:'2025',to:'2025'},read);
assert.equal((energy.rows as Array<{value:number}>)[0].value,972616.4383561644);
const refineries=await runQuery('journey',{material:'fuels',country:'VEN',stage:'refining'},read);
assert.equal(refineries.matched,3);assert((refineries.records as Array<{type:string}>).every(r=>r.type==='Oil refinery'));
const gap=await runQuery('journey',{material:'copper',country:'WORLD',stage:'manufacturing'},read);assert.equal(gap.matched,0);assert.equal((gap.stage as {path:string|null}).path,null);
const ocean=await runQuery('journey',{material:'plastic',stage:'ocean',limit:2},read);assert.equal(ocean.matched,31819);assert.equal((ocean.records as unknown[]).length,2);
await assert.rejects(runQuery('journey',{material:'../../x'},read));
const state={...defaultAtlasState,view:'materials' as const,material:'fuels',form:'2709',place:'VEN',layer:'journey' as const,journeyLayers:'extraction,refining,use',mapPorts:true,mapShipping:false,portMonth:'2026-07',portVessel:'tanker' as const,portId:'port524',portsWorldwide:true};
assert.deepEqual(readAtlasState(new URL(atlasUrl(state),'https://example.test')),state);
// Verify every source response hash used by the new tabular feeds.
let verified=0;
for(const folder of ['portwatch','oil-imports']){
 const path='packages/overshoot-data/release16/raw/'+folder+'/';
 const manifest=JSON.parse(await readFile(new URL(path+'manifest.json',root),'utf8')) as Array<{file:string;sha256?:string;status?:number}>;
 for(const item of manifest){if(!item.sha256)continue;const raw=gunzipSync(await readFile(new URL(path+item.file,root)));assert.equal(createHash('sha256').update(raw).digest('hex'),item.sha256);verified++}
}
console.log(`PASS: ${verified} source hashes; 2,065 ports; 24,780 monthly observations; Venezuela oil, refinery and port queries; preserved zero/null semantics; reporting-side deduplication; bounded APIs; shareable overlays.`);
