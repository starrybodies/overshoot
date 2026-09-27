import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {safeCamera,wrapLongitude,interpolateCamera,toDeckZoom,fromDeckZoom} from '../../../apps/overshoot/camera';
import {getWasteDestinations,treatmentLeaves,type TreatmentRecord,type TreatmentData} from '../destinations';
import {decodeState,encodeState,useAtlas} from '../../../apps/overshoot/state';
const read=(name:string)=>JSON.parse(fs.readFileSync(`public/data/v3/${name}`,'utf8'));
test('Camera crosses the antimeridian by the short route and clamps invalid inputs',()=>{
 const a={longitude:179,latitude:10,zoom:.55},b={longitude:-179,latitude:20,zoom:1};
 const half=interpolateCamera(a,b,.5);assert.equal(Math.abs(half.longitude),180);assert.equal(half.latitude,15);
 assert.equal(wrapLongitude(181),-179);assert.deepEqual(interpolateCamera(a,b,1),b);
 assert.deepEqual(safeCamera({longitude:Infinity,latitude:99,zoom:9}),{longitude:27,latitude:85,zoom:4});
});
test('GPU camera conversion preserves angular size across latitude, resize and zoom',()=>{
 for(const [width,height] of [[390,400],[900,550],[600,900]])for(const latitude of [-85,-60,0,60,85])for(const zoom of [-.5,.55,2,4]){
  const view={longitude:170,latitude,zoom},gpu={...view,zoom:toDeckZoom(view,width,height)};
  assert(Math.abs(fromDeckZoom(gpu,width,height)-zoom)<1e-8);
 }
});
test('Treatment charts cannot double-count combined categories or infer confidential cells',()=>{
 const base:TreatmentRecord={country:'AAA',name:'Example',year:2022,scope:'TOTAL',source_id:'source',flags:{},source_cells:{},values:{TRT:100,RCV_R_B:50,RCV_R:30,RCV_B:20,DSP_L_OTH:40,DSP_L:30,DSP_OTH:10,RCV_E:10}};
 const leaves=treatmentLeaves(base);assert.equal(leaves.reduce((n,r)=>n+r.value,0),100);assert(!leaves.some(r=>r.code==='RCV_R_B'||r.code==='DSP_L_OTH'));
 delete base.values.RCV_B;assert.equal(treatmentLeaves(base).filter(r=>r.code.startsWith('RCV_R')).length,1);assert(treatmentLeaves(base).some(r=>r.code==='RCV_R_B'));assert(!treatmentLeaves(base).some(r=>r.code==='RCV_B'));
});
test('New treatment values retain source cells, actual years and geographic exceptions',()=>{
 const sources=new Set(read('sources.json').map((r:{id:string})=>r.id));
 for(const file of ['treatment.json','weee-treatment.json'])for(const row of (read(file) as TreatmentData).records){assert(sources.has(row.source_id));for(const [code,value] of Object.entries(row.values)){assert(Number.isFinite(value));assert(row.source_cells[code]);assert(!['GBR','XKX'].includes(row.country))}}
 const weee=read('weee-treatment.json') as TreatmentData;assert(weee.geography_exceptions?.DEU);const ireland=weee.records.find(r=>r.country==='IRL'&&r.year===2023)!;assert.equal(ireland.values.TRT,63946);assert.equal(ireland.values.TRT_NAT,40532);assert.equal(ireland.values.TRT_EU_FOR,1841);assert.equal(ireland.values.TRT_NEU,21573);
});
test('Scrap routes preserve native exporter weights and destination deep links',()=>{
 const data=JSON.parse(fs.readFileSync('public/data/v2/trade.json','utf8'));const routes=getWasteDestinations(data.flows,'USA','3915',2024);assert(routes.length);assert(routes.every(r=>r.origin==='USA'&&r.source_id==='comtrade'));assert(routes[0].tonnes>=routes[1].tonnes);assert.equal(getWasteDestinations(data.flows,'USA','3915',1970).length,0);
 const state={...useAtlas.getState(),scene:'discard' as const,wasteStream:'destinations',commodity:'3915',destination:'MYS',country:'USA',wasteScope:'TOTAL',treatmentYear:2022};const decoded=decodeState(new URL(encodeState(state),'https://atlas.example'));for(const k of ['wasteStream','commodity','destination','country','wasteScope','treatmentYear'] as const)assert.equal(decoded[k],state[k]);
});
test('Restricted Basel quantities have no public artifact and remain explicitly blocked',()=>{
 assert.equal(read('sources.json').find((s:{id:string})=>s.id==='basel-national-reporting').status,'blocked');assert(!fs.existsSync('public/data/v2/basel.json'));assert(!fs.existsSync('public/data/v2/basel'));
});
