import assert from 'node:assert/strict';
import {atlasUrl,defaultAtlasState,readAtlasState,type AtlasState} from '../../apps/overshoot/atlas-next/atlasState';
import {profiles} from '../../apps/overshoot/atlas-next/data';

const location=(url:string)=>new URL(url,'https://example.test');
const check=(update:Partial<AtlasState>)=>{
 const state={...defaultAtlasState,...update};
 const result=readAtlasState(location(atlasUrl(state)));
 assert.deepEqual(result,state,`A shared link must preserve this view: ${atlasUrl(state)}`);
};
check({view:'materials',material:'copper',form:'7403',place:'CHN',direction:'in'});
check({view:'materials',material:'electronics',form:'8549',layer:'waste'});
check({view:'trade',material:'copper',form:'2603',place:'BC',product:'260300:KGM'});
check({view:'trade',dataset:'controlled',place:'CAN',direction:'in'});
check({view:'facilities',kind:'documented',place:'BC'});
check({view:'places',place:'JPN'});
check({view:'about'});
assert.equal(atlasUrl({...defaultAtlasState,view:'local',material:'copper',localLat:'48.81389',localLon:'-123.49722',localPlace:'Salt Spring Island'}),'/local?lat=48.81389&lon=-123.49722&city=Salt+Spring+Island');
assert.equal(atlasUrl({...defaultAtlasState,view:'waste',material:'copper'}),'/waste');
assert.equal(atlasUrl({...defaultAtlasState,view:'about',material:'copper'}),'/about');
check({view:'materials',material:'fuels',form:'2709',layer:'production',place:'QAT',energyMeasure:'gas-exports',energyPeriod:'2024',energyRegion:'middle-east'});
check({view:'materials',material:'fuels',form:'2709',place:'SAU',energyMeasure:'monthly-crude-exports',energyPeriod:'2026-06'});
assert.equal(readAtlasState(location('/materials?energy=../../x&period=2026-99&region=bogus')).energyMeasure,'crude-production');
assert.equal(readAtlasState(location('/materials?period=2026-99')).energyPeriod,'');
check({view:'places',place:'CAN',placeView:'waste',wastePlace:'CAN-vcvr'});
check({view:'places',place:'WORLD',placeView:'waste',wastePlace:'CHI'});
check({view:'places',place:'JPN',accountYear:'1992'});
check({view:'materials',material:'wood',form:'4403',layer:'production'});
check({view:'materials',material:'food',form:'1001',layer:'production'});
for(const profile of profiles)check({view:'materials',material:profile.id,form:profile.codes[0]||''});
assert.equal(readAtlasState(location('/')).view,'home');
assert.equal(readAtlasState(location('/materials')).view,'materials');
assert.equal(readAtlasState(location('/?view=trade&material=copper&country=ca&form=7404')).place,'CAN');
assert.equal(readAtlasState(location('/?material=copper')).view,'materials');
assert.equal(readAtlasState(location('/materials?material=copper&form=9999')).form,'2603');
assert.equal(readAtlasState(location('/places?place=invalid')).place,'WORLD');
assert.equal(readAtlasState(location('/trade?place=WORLD&direction=in')).direction,'out');
assert.equal(readAtlasState(location('/materials?material=made-up')).material,'paper');
assert.equal(readAtlasState(location('/places?year=2050')).accountYear,'2024');
assert.equal(readAtlasState(location('/places?year=1969')).accountYear,'2024');
assert.equal(readAtlasState(location('/places?wastePlace=../x')).wastePlace,'');
console.log('PASS: New routes, shared filters, legacy links and invalid input handling.');
check({view:'facilities',kind:'power',place:'SAU',site:'wri-GEODB0040767'});
check({view:'facilities',kind:'river',place:'UNASSIGNED',site:'river-plastic-12091'});
check({view:'data'});

assert.equal(readAtlasState({pathname:'/facilities',search:'?place=KOS&kind=wastewater'}).place,'XKX');
assert.equal(readAtlasState({pathname:'/facilities',search:'?kind=industry'}).kind,'industry');

check({view:'facilities',kind:'mining',siteType:'Copper mine',siteQuery:'Los',siteBasis:'estimated',siteSource:'climate-trace-2025',siteSort:'quantity',place:'CHL'});
check({view:'materials',material:'textiles',form:'6309',layer:'production',productionItem:'767',productionYear:'2000'});

check({view:'facilities',kind:'mining',place:'ZNC',site:'trace-1516731'});

check({view:'materials',material:'fuels',form:'2709',place:'VEN',layer:'journey',journeyLayers:'extraction,refining,use'});
check({view:'materials',material:'plastic',form:'3915',layer:'journey',journeyLayers:'none'});
