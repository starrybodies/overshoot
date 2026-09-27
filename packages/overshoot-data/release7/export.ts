import type {JourneyDataset,JourneyEvidence} from './types';
export function evidenceCSV(records:JourneyEvidence[],data:JourneyDataset){
 const columns=['id','material','place','stages','title','entity','description','kind','year','quantity','unit','quantity_scope','destinations_json','gap','source_ids','source_urls'];
 const rows=records.map(r=>[r.id,r.materials.join('|'),r.place,(r.supportedStages??[r.stage]).join('|'),r.title,r.entity,r.technical,r.kind,r.year??'',r.quantity?.value??'',r.quantity?.unit??'',r.quantity?.label??'',r.destinations?JSON.stringify(r.destinations):'',r.gap,r.source_ids.join('|'),r.source_ids.map(id=>data.sources.find(s=>s.id===id)?.url??'').join('|')]);
 return [columns,...rows].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
}
export const exportHref=(text:string,type:string)=>`data:${type};charset=utf-8,${encodeURIComponent(text)}`;
