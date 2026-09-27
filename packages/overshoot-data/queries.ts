import type { ExtractionData, ExtractionRow, Material } from './types';
export type Result<T> = { status:'available'; data:T; source_ids:string[] } | { status:'unavailable'; reason:string; source_ids:string[] };
const extractionIndexes = new WeakMap<ExtractionData,Map<string,ExtractionRow>>();
function index(data:ExtractionData){let found=extractionIndexes.get(data);if(!found){found=new Map(data.rows.map(r=>[`${r.country}:${r.year}`,r]));extractionIndexes.set(data,found)}return found}
export function getExtraction(data:ExtractionData,country:string,material:Material,year:number,metric:'absolute'|'percapita'='absolute'):Result<{value:number;unit:string;year:number;country:string;estimated:boolean}> {
 const row=index(data).get(`${country}:${year}`);
 if(!row)return {status:'unavailable',reason:'No extraction observation for this country and year.',source_ids:[data.source_id]};
 const key=material==='all'?'total':material;
 const pc=(row as ExtractionRow & {per_capita?:Record<string,number|null>}).per_capita;
 let value=metric==='percapita'?pc?.[key]??null:row[key];
 if(metric==='percapita'&&value===null&&row.population&&row[key]!==null)value=row[key]!/row.population;
 if(value===null||value===undefined)return {status:'unavailable',reason:metric==='percapita'?'Population-normalized value is unavailable for this selection.':'This material is not reported for this country and year.',source_ids:[row.source_id]};
 return {status:'available',data:{value,unit:metric==='percapita'?'tonnes/person/year':'tonnes/year',year,country,estimated:row.estimated??year>=2022},source_ids:[row.source_id,...(metric==='percapita'&&row.population_source_id?[row.population_source_id]:[])]};
}
export function compareCountries(data:ExtractionData,countries:string[],material:Material,year:number){return countries.map(country=>({country,result:getExtraction(data,country,material,year)}));}
export function formatMass(value:number,metric='absolute') {if(metric==='percapita')return {number:new Intl.NumberFormat('en',{maximumFractionDigits:1}).format(value),unit:'tonnes / person'};if(value>=1e9)return {number:(value/1e9).toFixed(2),unit:'billion tonnes'};if(value>=1e6)return {number:(value/1e6).toFixed(1),unit:'million tonnes'};if(value>=1e3)return {number:(value/1e3).toFixed(1),unit:'thousand tonnes'};return {number:value.toFixed(0),unit:'tonnes'};}
export const annualRate=(tonnes:number,year:number)=>tonnes/((new Date(Date.UTC(year+1,0,1)).getTime()-new Date(Date.UTC(year,0,1)).getTime())/1000);
