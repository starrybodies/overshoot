import {test} from 'node:test';
import assert from 'node:assert/strict';
import {journeyData} from '../release7/dataset';
import {initialJourney,readJourney,journeyQuery,visibleEvidence,evidenceAtStage} from '../release7/types';
import {evidenceCSV,exportHref} from '../release7/export';
test('journey URL retains material, place, stage, reading depth, mode and research search',()=>{
 const s={...initialJourney,material:'rigid-plastic' as const,place:'bc' as const,stage:'after' as const,view:'research' as const,detail:true,query:'Hartland & cover'};
 assert.deepEqual(readJourney(journeyQuery(s)),s);
 assert.deepEqual(readJourney('?material=made-up&place=unknown&stage=lost&view=x&detail=wrong'),initialJourney);
});
test('every record and process explanation resolves to acquired source metadata',()=>{
 const ids=new Set(journeyData.sources.map(s=>s.id));assert.equal(ids.size,20);
 assert.equal(new Set(journeyData.evidence.map(e=>e.id)).size,journeyData.evidence.length);
 for(const e of journeyData.evidence){assert.ok(e.source_ids.length>0);for(const id of e.source_ids)assert.ok(ids.has(id),id);assert.ok(e.gap.length>0)}
 for(const m of journeyData.materials)for(const p of Object.values(m.steps))for(const id of p.sources)assert.ok(ids.has(id),id);
 for(const s of journeyData.sources){assert.ok(new URL(s.url).protocol==='https:');assert.ok(s.license&&s.method&&s.coverage&&s.retrievedAt)}
});
test('a local selection cannot inherit provincial markets or unlinked landfill routes',()=>{
 for(const material of journeyData.materials){const local=visibleEvidence(journeyData,{...initialJourney,material:material.id});assert.ok(local.every(e=>e.place==='salt-spring'));assert.ok(local.every(e=>!e.destinations))}
 assert.equal(visibleEvidence(journeyData,{...initialJourney,material:'garbage'}).length,0);
 assert.ok(visibleEvidence(journeyData,{...initialJourney,material:'garbage',place:'bc'}).some(e=>evidenceAtStage(e,'after')));
});
test('rigid landfill-cover plastics remain separate from packaging and source dashes stay missing',()=>{
 const rigid=visibleEvidence(journeyData,{...initialJourney,material:'rigid-plastic',place:'bc'});assert.ok(rigid.some(r=>r.id==='hartland-bulky-plastic'));
 assert.ok(!visibleEvidence(journeyData,{...initialJourney,place:'bc'}).some(r=>r.id==='hartland-bulky-plastic'));
 const plastic=journeyData.evidence.find(r=>r.id==='end-markets-plastic')!;assert.equal(plastic.destinations?.[0].percent,99.5);assert.equal(plastic.destinations?.[1].percent,null);
 const paper=journeyData.evidence.find(r=>r.id==='end-markets-paper')!;assert.equal(paper.destinations?.[2].percent,46.7);assert.equal(paper.destinations?.[2].previousPercent,59.5);
});
test('exports preserve scope, units, unknowns, geography and provenance without guessed quantities',()=>{
 const csv=evidenceCSV(journeyData.evidence,journeyData);assert.ok(csv.includes('quantity_scope'));assert.ok(csv.includes('2025 disposal · all Recycle BC program materials combined'));assert.ok(csv.includes('"percent"":null'));assert.ok(csv.includes('https://www.crd.ca/'));
 assert.equal(decodeURIComponent(exportHref(csv,'text/csv').split(',').slice(1).join(',')),csv);
 assert.equal(journeyData.evidence.find(e=>e.id==='hartland-gas')?.quantity,undefined);
 assert.equal(journeyData.evidence.find(e=>e.id==='electronics-processing')?.quantity,undefined);
});
