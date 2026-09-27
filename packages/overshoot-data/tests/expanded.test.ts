import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type {SiteFeature} from '../../../apps/overshoot/data';
import {getMaterialFootprint,getBilateralFlow,getSites,getMetric} from '../expanded-queries';
import {decodeState,encodeState,useAtlas} from '../../../apps/overshoot/state';
const read=(f:string)=>JSON.parse(fs.readFileSync(`public/data/${['sources.json','metrics-latest.json','metrics/XKX.json'].includes(f)?'v3':'v2'}/${f}`,'utf8'));
const sources=new Set(read('sources.json').map((s:{id:string})=>s.id));
test('Expanded observations resolve provenance and preserve original conversions',()=>{
 for(const file of fs.readdirSync('public/data/v2/metrics'))for(const row of read(`metrics/${file}`).records){assert(sources.has(row.source_id));assert(Number.isFinite(row.value));assert(row.unit);assert(row.original_unit)}
 const trade=read('trade.json');assert.equal(trade.flows.length,4963);
 for(const row of trade.flows){assert.equal(row.tonnes,row.original_value/1000);assert.equal(row.is_net_weight_estimated,false);assert(sources.has(row.source_id));assert(row.snapshot);assert.equal(row.mirror,false)}
 for(const file of ['river-sites','landfill-sites','mining-sites','wastewater-sites'])for(const f of read(file+'.geojson').features){assert(sources.has(f.properties.source_id));assert(f.geometry.coordinates.every(Number.isFinite));assert(f.properties.source_row!==undefined);if(file==='landfill-sites'&&f.properties.value!==null)assert.equal(f.properties.value,Number((f.properties.original_value*.90718474).toFixed(4)));if(file==='wastewater-sites'){assert.equal(f.properties.unit,'m³/day');assert.equal(f.properties.year,null)}}
});
test('Native footprints, country-year gaps and material classes survive typed lookup',()=>{
 const rows=read('resources/2024.json').rows;const native=rows.find((r:{country:string})=>r.country==='JPN');const q=getMaterialFootprint(rows,'JPN','all',2024);assert.equal(q.status,'available');if(q.status==='available')assert.equal(q.data.value,native.footprint);
 assert.equal(getMaterialFootprint(rows,'HKG','all',2024).status,'unavailable');assert.equal(getMaterialFootprint(rows,'JPN','all',1970).status,'unavailable');
 const country=read('metrics/CAN.json').records;assert.equal(getMetric(country,'CAN','ewaste_generated',2022).status,'available');assert.equal(getMetric(country,'CAN','ewaste_generated',1901).status,'unavailable');
});
test('Trade returns reporter quantities and exposes unaltered mirror disagreement',()=>{
 const flows=read('trade.json').flows;const q=getBilateralFlow(flows,'CHL','CHN','2603',2024);assert.equal(q.status,'available');const note=read('trade-quality.json').notes[0];if(q.status==='available')assert.equal(q.data[0].tonnes,note.exporter_reported_tonnes);assert.notEqual(note.exporter_reported_tonnes,note.importer_reported_tonnes);assert.equal(getBilateralFlow(flows,'USA','CHN','3915',1970).status,'unavailable');
});
test('Site filtering preserves real geography and absence is not zero',()=>{
 const f=read('river-sites.geojson').features as SiteFeature[];const q=getSites(f,'river-plastic','PHL',[120,14,122,16]);assert.equal(q.status,'available');if(q.status==='available')assert(q.data.some(r=>r.properties.name==='Pasig River outfall'));
 assert.equal(getSites(f,'river-plastic','CAN').status,'unavailable');
});
test('Expanded selections reproduce in shared URLs',()=>{
 for(const update of [{scene:'discard' as const,wasteStream:'places',siteType:'river-plastic',site:'meijer-12639'},{scene:'stock' as const,stockView:'country'},{scene:'flow' as const,flow:'controlled' as const,destination:'CHN'}]){const s={...useAtlas.getState(),...update};const d=decodeState(new URL(encodeState(s),'https://atlas.example'));for(const k of Object.keys(update))assert.equal(d[k as keyof typeof d],s[k as keyof typeof s])}
});

test('Scene metric selections include acquired treatment and sector records without projections',()=>{const r=read('metrics-latest.json').records;for(const metric of ['food_service_food_waste','retail_food_waste','hazardous_waste_treated_recycl'])assert(r.some((v:{metric:string})=>v.metric===metric));assert(!r.some((v:{method?:string})=>v.method?.includes('projection beyond')))});
