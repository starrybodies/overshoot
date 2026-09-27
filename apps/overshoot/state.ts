import { create } from 'zustand';
import { SCENES, type Material, type Scene } from '@/packages/overshoot-data/types';
export type AtlasState = { scene:Scene; year:number; country:string; material:Material; mode:'story'|'explore'; metric:'absolute'|'percapita'; flow:'raw'|'discard'|'controlled'; wasteStream:string; wasteScope:string; treatmentYear:number; siteType:string; stockView:string; commodity:string; destination:string; site:string; longitude:number; latitude:number; zoom:number; secondary:number; set:(patch:Partial<Omit<AtlasState,'set'>>)=>void };
export const useAtlas = create<AtlasState>((set)=>({scene:'extraction',year:2024,country:'WORLD',material:'all',mode:'story',metric:'absolute',flow:'raw',wasteStream:'destinations',wasteScope:'TOT_X_MIN',treatmentYear:0,siteType:'river-plastic',stockView:'flows',commodity:'2603',destination:'WORLD',site:'',longitude:27,latitude:18,zoom:.55,secondary:6.9,set:patch=>set(patch)}));
const finite=(v:string|null,fallback:number,min:number,max:number)=>v!==null&&v.trim()!==''&&Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export function decodeState(url:URL):Partial<AtlasState> {
 const p=url.searchParams, scene=url.pathname.split('/')[1];
 return {scene:SCENES.some(s=>s.id===scene)?scene as Scene:'extraction',year:Math.round(finite(p.get('year'),2024,1970,2024)),country:/^[A-Z]{3}$/.test(p.get('country')||'')?p.get('country')!:'WORLD',material:['biomass','fossil','metals','minerals'].includes(p.get('material')||'')?p.get('material') as Material:'all',mode:p.get('mode')==='explore'?'explore':'story',metric:p.get('metric')==='percapita'?'percapita':'absolute',flow:p.get('flow')==='controlled'?'controlled':p.get('flow')==='discard'?'discard':'raw',wasteScope:p.get('scope')==='TOTAL'?'TOTAL':'TOT_X_MIN',treatmentYear:Math.round(finite(p.get('treatmentYear'),0,0,2024)),wasteStream:['destinations','treatment','ewaste-location','municipal','ewaste','plastics','food','hazardous','places'].includes(p.get('waste')||'')?p.get('waste')!:'destinations',siteType:['river-plastic','landfill','mining-area','wastewater-treatment'].includes(p.get('layer')||'')?p.get('layer')!:'river-plastic',stockView:['flows','mass','country'].includes(p.get('stock')||'')?p.get('stock')!:'flows',commodity:['2603','2601','2701','2709','1001','4403','3915','4707','7204','7404','7602','6309','8549'].includes(p.get('commodity')||'')?p.get('commodity')!:(p.get('flow')==='discard'||scene==='discard'?'3915':'2603'),destination:/^[A-Z]{3}$/.test(p.get('destination')||'')?p.get('destination')!:'WORLD',site:p.get('site')||'',longitude:finite(p.get('lng'),27,-180,180),latitude:finite(p.get('lat'),18,-85,85),zoom:finite(p.get('zoom'),.55,-1,5),secondary:finite(p.get('secondary'),6.9,0,80)};
}
export function encodeState(s:Omit<AtlasState,'set'>) {
 const q=new URLSearchParams({year:String(s.year),country:s.country,material:s.material,mode:s.mode,metric:s.metric,lng:s.longitude.toFixed(2),lat:s.latitude.toFixed(2),zoom:s.zoom.toFixed(2)});
 if(s.scene==='flow'){q.set('flow',s.flow);q.set('commodity',s.commodity);q.set('destination',s.destination)}
 if(s.scene==='discard'){q.set('waste',s.wasteStream);q.set('layer',s.siteType);q.set('commodity',s.commodity);q.set('destination',s.destination);q.set('scope',s.wasteScope);if(s.treatmentYear)q.set('treatmentYear',String(s.treatmentYear))}
 if(s.scene==='stock')q.set('stock',s.stockView);
 if(s.site)q.set('site',s.site);
 if(s.scene==='return')q.set('secondary',String(s.secondary));
 return `/${s.scene}?${q}`;
}
