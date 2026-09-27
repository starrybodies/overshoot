import type {ExtractionData,ExtractionRow,Country} from './types';
export interface CompactArtifact{version:string;source_id:string;unit:'t';years:number[];countries:Country[];columns:string[];observations:(string|number|null|boolean)[][]}
/** Lineage is factored into the envelope; no statistical values are interpolated. */
export function decodeExtractionArtifact(input:CompactArtifact):ExtractionData{
 if(input.unit!=='t'||!Array.isArray(input.observations)||input.columns.join(',')!=='country,year,biomass,fossil,metals,minerals,total,population,per_capita_total,estimated')throw Error('Unsupported extraction artifact');
 const rows:ExtractionRow[]=input.observations.map(([country,year,biomass,fossil,metals,minerals,total,population,per_capita_total,estimated])=>{
 const r={country,year,biomass,fossil,metals,minerals,total,population,source_id:input.source_id,original_unit:input.unit,estimated,per_capita:{total:per_capita_total}} as ExtractionRow;
 for(const m of ['biomass','fossil','metals','minerals'] as const)r.per_capita![m]=r.population&&r[m]!==null?r[m]!/r.population:null;
 return r;
 });
 return{version:input.version,source_id:input.source_id,years:input.years,countries:input.countries,rows};
}
