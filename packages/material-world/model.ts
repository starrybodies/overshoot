/** A source record is not necessarily a unique physical facility. */
export const facilityKinds = ['landfill','wastewater','power','energy','industry','mining','river'] as const;
export type FacilityKind = typeof facilityKinds[number];
export type MeasurementBasis = 'reported'|'modeled'|'estimated'|'capacity'|'unspecified'|'location'|'mapped';
export type FacilityPin = {
  id:string; name:string; country:string; region:string; locality:string;
  coordinates:[number,number]; type:string; source:string;
  value:number|null; unit:string; metric:string; year:number|null;
  basis:MeasurementBasis; status:string|null; part:number;
};
export type FacilityRecord = Omit<FacilityPin,'part'> & {
  kind:FacilityKind; sourceRow:string; attributes:Record<string,string|number|boolean|null>;
};
export type FacilityIndex=FacilityPin[]|{fields:Array<keyof FacilityPin>;dictionaries:Partial<Record<keyof FacilityPin,unknown[]>>;rows:unknown[][]};
/** World indexes dictionary-encode repeated labels. Values remain unchanged. */
export function* facilityPins(index:FacilityIndex):Generator<FacilityPin>{
  if(Array.isArray(index)){yield* index;return}
  for(const row of index.rows){
    const pin:Record<string,unknown>={};
    index.fields.forEach((key,i)=>{pin[key]=index.dictionaries[key]?index.dictionaries[key]![Number(row[i])]:row[i]});
    yield pin as FacilityPin;
  }
}
export type DataSource = {
  title:string; publisher:string; url:string; license:string; licenseUrl:string;
  edition:string; retrievedAt:string; coverage:string; method:string;
  limits:string[]; question:string; download:string; citation?:string;
};
export const sourceAreaNames:Record<string,string>={ZNC:'Northern Cyprus · source area',UNASSIGNED:'Country not assigned by source'};
export const facilityCatalogPath='/data/v15/facilities/catalog.json';
export type CountryCoverage = {count:number;parts:string[];index?:string;regions:Record<string,number>;types:Record<string,number>;bases:Partial<Record<MeasurementBasis,number>>;sources:string[]};
export type FacilityCatalog = {
  version:string; publishedAt:string; totalRecords:number; sources:Record<string,DataSource>;
  sourceAreas?:Record<string,{name:string;publisherLabel:string;source:string;note:string}>;
  datasets:Record<FacilityKind,{count:number;world?:CountryCoverage;countries:Record<string,CountryCoverage>}>;
  exclusions:Record<string,Record<string,number>>; countDefinition:string;
};
export type FacilityFilter = {query?:string;region?:string;type?:string;basis?:string;source?:string;bbox?:[number,number,number,number]};
export const basisLabels:Record<MeasurementBasis,string> = {
  reported:'Reported measurement',modeled:'Modeled estimate',estimated:'Source estimate',capacity:'Design capacity',
  unspecified:'Reported · basis unclear',location:'Location only',mapped:'Mapped footprint',
};
export const kindLabels:Record<FacilityKind,string> = {industry:'Manufacturing',power:'Power plants',landfill:'Waste & recycling',wastewater:'Wastewater',energy:'Oil & gas',mining:'Mines & land',river:'River plastic'};
export const kindQuestions:Record<FacilityKind,string> = {
  power:'Where does electricity come from, and what powers the plants?',
  industry:'Where are everyday materials made?',
  landfill:'Where is waste collected, recovered or disposed of?',
  wastewater:'Where is wastewater treated, and how much leaves a plant?',
  energy:'Where is oil and gas gathered, processed or stored?',
  mining:'Where has mining changed the land?',
  river:'Where could river-borne plastic reach the sea?',
};
export function normalizeSearch(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export function matchesFacility(r:FacilityPin|FacilityRecord,filter:FacilityFilter){
  if(filter.source&&r.source!==filter.source)return false;
  if(filter.region&&r.region!==filter.region)return false;
  if(filter.type&&r.type!==filter.type)return false;
  if(filter.basis&&r.basis!==filter.basis)return false;
  if(filter.bbox){const [w,s,e,n]=filter.bbox,[x,y]=r.coordinates;if(y<s||y>n||(w<=e?x<w||x>e:x<w&&x>e))return false}
  if(filter.query){const terms=normalizeSearch(filter.query).trim().split(/\s+/);const text=normalizeSearch([r.name,r.locality,r.region,r.type,r.id].join(' '));if(!terms.every(t=>text.includes(t)))return false}
  return true;
}
export function measurementNote(basis:MeasurementBasis){return {
  reported:'A quantity supplied by the source. Its observation year and scope still matter.',
  modeled:'An estimate produced by the source model. It is not a direct measurement.',
  estimated:'An inventory estimate assembled from models and public reports. The source does not specify a measurement method for this individual value.',
  capacity:'A rated or design limit. Actual operation and output can differ; power capacity and annual energy are different quantities.',
  unspecified:'The source reports a quantity without identifying whether it is treated flow or capacity.',
  location:'The source identifies infrastructure here. It provides no throughput measurement for this record.',
  mapped:'Area identified in satellite imagery. Land area does not measure mineral production.',
}[basis]}
