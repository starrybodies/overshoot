import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeExtractionArtifact,type CompactArtifact} from '../artifact';
import {getExtraction,compareCountries,annualRate} from '../queries';
import {decodeState,encodeState,useAtlas} from '../../../apps/overshoot/state';
import {atlasTools} from '../../../apps/overshoot/webmcp';
const raw=JSON.parse(fs.readFileSync('public/data/v2/extraction.json','utf8')) as CompactArtifact;
const data=decodeExtractionArtifact(raw);
const sources=JSON.parse(fs.readFileSync('public/data/v2/sources.json','utf8')) as {id:string}[];
const scene=JSON.parse(fs.readFileSync('public/data/v2/scenes.json','utf8'));
test('All observations retain source lineage, valid tonnes and unique country/year keys',()=>{
 const known=new Set(sources.map(s=>s.id));const keys=new Set();
 for(const r of data.rows){assert(known.has(r.source_id));assert(!keys.has(`${r.country}:${r.year}`));keys.add(`${r.country}:${r.year}`);for(const k of ['total','biomass','metals','fossil','minerals'] as const)assert(r[k]===null||Number.isFinite(r[k])&&r[k]!>=0);assert.equal(r.original_unit,'t')}
 assert.equal(data.years.length,55);assert.equal(data.countries.length,232);
});
test('Authoritative totals and native per-capita survive artifact decoding',()=>{
 const r=getExtraction(data,'WORLD','all',2024);assert.equal(r.status,'available');if(r.status==='available'){assert(Math.abs(r.data.value-106971469894.03)<.01);assert.equal(r.data.estimated,true)}
 const pc=getExtraction(data,'WORLD','all',2024,'percapita');assert.equal(pc.status,'available');if(pc.status==='available')assert.equal(pc.data.value,13.2178);
 const bio=getExtraction(data,'WORLD','biomass',2024,'percapita');assert.equal(bio.status,'available');if(bio.status==='available')assert(Math.abs(bio.data.value-27254383807/8092997781)<1e-12);
});
test('Unavailable country/material cells are never replaced with zero or regional values',()=>{
 assert.equal(getExtraction(data,'ZZZ','all',2024).status,'unavailable');
 const r=data.rows.find(r=>r.country!=='WORLD'&&r.metals===null)!;assert(r);assert.equal(getExtraction(data,r.country,'metals',r.year).status,'unavailable');

});
test('Planetary counter handles leap years and annual totals exactly',()=>{
 assert.equal(annualRate(366*86400,2024),1);assert.equal(annualRate(365*86400,2023),1);
});
test('Deep links round-trip material, scene, country, normalization, camera and scenario',()=>{
 const state={...useAtlas.getState(),scene:'return' as const,country:'CAN',year:2001,material:'metals' as const,metric:'percapita' as const,mode:'explore' as const,longitude:-123.44,latitude:48.88,zoom:1.25,secondary:38.4};
 const decoded=decodeState(new URL(encodeState(state),'https://atlas.example'));
 for(const key of ['scene','country','year','material','metric','mode','longitude','latitude','zoom','secondary'] as const)assert.equal(decoded[key],state[key]);
 assert.equal(decodeState(new URL('https://atlas.example/not-a-scene?year=garbage&zoom=999')).scene,'extraction');
 assert.equal(decodeState(new URL('https://atlas.example/?zoom=999')).zoom,5);
});
test('Finite tools reject bad input without changing the atlas, and valid navigation matches the interface',()=>{
 const tools=atlasTools(data),nav=tools.find(t=>t.name==='navigateAtlas')!,query=tools.find(t=>t.name==='getExtraction')!;
 const before=useAtlas.getState().country;assert.throws(()=>nav.execute({scene:'extraction',country:'ZZZ'}));assert.equal(useAtlas.getState().country,before);
 nav.execute({scene:'extraction',country:'CAN',year:2021,material:'minerals'});assert.equal(useAtlas.getState().country,'CAN');assert.equal(useAtlas.getState().material,'minerals');
 const r=query.execute({country:'CAN',year:2021,material:'minerals'}) as {status:string};assert.equal(r.status,'available');assert.throws(()=>query.execute({country:'CAN',year:2200}));
});
test('Stock projections and waste reference years remain distinct from the extraction timeline',()=>{
 assert.equal(scene.circularity.referenceYear,'2021');assert.equal(scene.circularity.share,6.9);assert.equal(scene.waste.global.year,2022);assert.equal(scene.unep_waste_fate.year,2020);
 assert(scene.stock.rows.filter((r:{year:number})=>r.year>2015).every((r:{projected:boolean})=>r.projected));
 assert.equal(new Set(scene.waste.countries.map((r:{country:string})=>r.country)).size,217);
 assert(scene.waste.countries.some((r:{year:number})=>r.year!==2022));
 assert.equal(scene.material_system_2021.gross_additions_to_stock_tonnes,62600000000);
});
