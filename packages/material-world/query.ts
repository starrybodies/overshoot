import {researchBase,collectionRows,comparisonDate,type WasteCatalog,type WasteObservation,type CityCollectionData,type WasteComparison} from './wasteResearch';
import {z} from 'zod';
import {geoContains} from 'd3-geo';
import {connectionsPath,selectNetworks,type ConnectionCatalog} from './connections';
import {selectTradeEvidence,tradeBasis,tradeBasisLabels} from './trade';
import type {MaritimeCatalog,Port,PortActivity} from './maritime';
import type {JourneyCatalog,JourneyPin} from './journey';
import type {ProductionCatalog,ProductionRow} from './production';
import {environmentCatalog,environmentLayer,environmentImage,tileUrl} from './environment';
import {facilityCatalogPath,facilityPins,facilityKinds,matchesFacility,type FacilityCatalog,type FacilityRecord,type FacilityPin,type FacilityIndex} from './model';

export type AssetReader = <T>(path:string)=>Promise<T>;
const country=z.string().regex(/^(?:[A-Z]{3}|WORLD|UNASSIGNED)$/);
const kind=z.enum(facilityKinds);
const year=z.number().int().min(1900).max(2100);
const facilitySelection={country,kind};
export const querySchemas={
  mineral_production:z.object({series:z.enum(['copper-mine','copper-refinery','aluminium-smelter','lithium-mine','steel-raw']).default('copper-mine'),country:country.default('WORLD'),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(1000).default(0)}).strict(),
  industrial_capacity:z.object({material:z.enum(['concrete','steel']),country:country.default('WORLD'),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(1000).default(0)}).strict(),
  glass_program:z.object({program:z.enum(['deposit','refillable','nondeposit']).default('deposit'),region:z.string().max(80).optional()}).strict(),
  source_observatory:z.object({material:z.enum(['fuels','copper','aluminium','steel','lithium','concrete','glass','paper','wood','plastic','textiles','food','electronics','garbage']).optional(),status:z.enum(['retained','source identified']).optional()}).strict(),
  estimate_production_gap:z.object({material:z.enum(['food','wood','paper','textiles']),country,item:z.string().regex(/^\d{1,8}$/).optional(),year:year.min(1970).max(2024)}).strict(),
  waste_catalog:z.object({country:country.default('WORLD'),group:z.enum(['Municipal waste','Packaging','Electronic waste','Hazardous waste','Food waste']).optional()}).strict(),
  waste_history:z.object({series:z.string().regex(/^[a-z0-9-]{1,120}$/),countries:z.array(country).min(1).max(4),from:year.default(1900),to:year.default(2100),limit:z.number().int().min(1).max(500).default(100),offset:z.number().int().min(0).max(100000).default(0)}).strict(),
  waste_collection:z.object({country:country.default('WORLD'),query:z.string().max(120).default(''),year:z.union([year,z.literal('latest'),z.literal('all')]).default('latest'),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(10000).default(0)}).strict(),
  waste_compare:z.object({places:z.array(z.string().regex(/^[A-Z]{3}(?:-[A-Za-z0-9_-]{1,50})?$/)).max(4).optional(),country:country.default('WORLD'),level:z.enum(['country','city']).default('country'),measure:z.string().regex(/^[A-Za-z_0-9]{1,80}$/).default('perPerson'),query:z.string().max(120).default(''),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(10000).default(0)}).strict(),
  connections:z.object({material:z.enum(['fuels','copper','aluminium','steel','lithium','concrete','glass','paper','wood','plastic','rigid-plastic','textiles','food','electronics','garbage']).optional(),country:country.default('WORLD'),network:z.string().regex(/^[a-z0-9-]{1,80}$/).optional(),limit:z.number().int().min(1).max(30).default(12),offset:z.number().int().min(0).max(1000).default(0)}).strict(),
  coal_receipts:z.object({plantId:z.number().int().positive().optional(),mineId:z.string().regex(/^\d{1,8}$/).optional(),month:z.number().int().min(1).max(12).optional(),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(10000).default(0)}).strict(),
  ports:z.object({country:country.default('WORLD'),query:z.string().max(120).optional(),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(10000).default(0)}).strict(),
  port_activity:z.object({port:z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),month:z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/).optional()}).strict(),
  journey:z.object({material:z.enum(['fuels','copper','aluminium','steel','lithium','concrete','glass','paper','wood','plastic','rigid-plastic','textiles','food','electronics','garbage']),country:country.default('WORLD'),stage:z.enum(['extraction','refining','manufacturing','use','recovery','disposal','ocean']).optional(),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(200000).default(0)}).strict(),
  research_path:z.object({material:z.enum(['fuels','copper','aluminium','steel','lithium','concrete','glass','paper','wood','plastic','rigid-plastic','textiles','food','electronics','garbage']),place:z.union([country,z.literal('BC'),z.literal('SSI')]).default('WORLD')}).strict(),
  trade:z.object({country,direction:z.enum(['in','out']).default('out'),commodity:z.string().regex(/^\d{4}$/).optional(),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(20000).default(0)}).strict(),
  production_catalog:z.object({material:z.enum(['food','wood','paper','textiles'])}).strict(),
  production:z.object({material:z.enum(['food','wood','paper','textiles']),country,item:z.string().regex(/^\d{1,8}$/).optional(),from:year.min(1970).max(2024).default(1970),to:year.min(1970).max(2024).default(2024)}).strict(),
  environment:z.object({layer:z.enum(['relief','satellite','vegetation','ocean']).optional(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),bbox:z.tuple([z.number().min(-180).max(180),z.number().min(-85).max(85),z.number().min(-180).max(180),z.number().min(-85).max(85)]).optional()}).strict(),
  coverage:z.object({country:country.optional()}).strict(),
  facilities:z.object({...facilitySelection,query:z.string().max(120).optional(),region:z.string().max(80).optional(),type:z.string().max(120).optional(),source:z.string().max(100).optional(),basis:z.enum(['reported','modeled','estimated','capacity','unspecified','location','mapped']).optional(),bbox:z.tuple([z.number().min(-180).max(180),z.number().min(-90).max(90),z.number().min(-180).max(180),z.number().min(-90).max(90)]).optional(),limit:z.number().int().min(1).max(100).default(30),offset:z.number().int().min(0).max(100000).default(0)}).strict(),
  local_context:z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),radiusKm:z.number().min(1).max(250).default(50)}).strict(),
  facility:z.object({...facilitySelection,id:z.string().min(1).max(150)}).strict(),
  energy:z.object({country,measure:z.string().regex(/^[a-z-]{3,48}$/),from:z.string().regex(/^\d{4}(-\d{2})?$/).optional(),to:z.string().regex(/^\d{4}(-\d{2})?$/).optional()}).strict(),
  waste:z.object({place:z.string().regex(/^[A-Z]{3}(?:-[A-Za-z0-9_-]{1,20})?$/)}).strict(),
  material_accounts:z.object({country,from:year.default(1970),to:year.default(2024)}).strict(),
  estimate_energy_gap:z.object({country,measure:z.string().regex(/^[a-z-]{3,48}$/),year}).strict(),
};
export type QueryName=keyof typeof querySchemas;
type EnergyRow={country:string;period:string;value:number|null;rawValue:unknown;flag:unknown};
type EnergyData={unit:string;description:string;sourceId:string;frequency:string;factor:number;series:Record<string,unknown>;rows:EnergyRow[]};
type EnergyCatalog={sources:Record<string,unknown>;measures:Array<{id:string;name:string;unit:string;frequency:string;latestPeriod:string;countries:number}>;refreshMode:string;numericRecords:number};
const snapshot={release:'39',publishedAt:'2026-09-27',refresh:'Reviewed snapshots; no live or automatic refresh.',missing:'A missing record or null value is not zero.'};

export async function runQuery(name:QueryName,input:unknown,read:AssetReader):Promise<Record<string,unknown>>{
  // All paths below are built from validated identifiers and catalogue membership.
  const data=querySchemas[name].parse(input);
  const catalog=()=>read<FacilityCatalog>(facilityCatalogPath);
  if(name==='mineral_production'){
    const q=data as z.infer<typeof querySchemas.mineral_production>;
    const source=await read<{edition:string;reviewedAt:string;method:string;series:Array<{id:string;material:string;measure:string;year:number;basis:string;unit:string;source:string;sourcePdfSha256:string;worldTotal:number;rows:Array<{country:string;value:number}>}>}>('/data/v39/usgs-minerals-2025.json');
    const series=source.series.find(s=>s.id===q.series)!;
    const rows=q.country==='WORLD'?series.rows:series.rows.filter(r=>r.country===q.country);
    return {snapshot,edition:source.edition,reviewedAt:source.reviewedAt,method:source.method,series:q.series,measure:series.measure,year:series.year,basis:series.basis,unit:series.unit,worldTotal:series.worldTotal,source:series.source,sourcePdfSha256:series.sourcePdfSha256,matched:rows.length,limit:q.limit,offset:q.offset,rows:rows.slice(q.offset,q.offset+q.limit),limitations:['The 2025 values are USGS estimates, not final production.','World totals include countries outside the named list and are rounded separately.','Production does not establish a supplier, customer or route.']};
  }
  if(name==='glass_program'){
    const q=data as z.infer<typeof querySchemas.glass_program>;
    const source=await read<{depositBeverage:{regions:Array<{name:string;glassTonnes:number}>;source:string};refillableMilk:unknown;nonDeposit:unknown;scope:string}>('/data/v29/bc-glass.json');
    if(q.program==='deposit'){
      const {regions,...summary}=source.depositBeverage;
      const selected=q.region?regions.filter(r=>r.name.toLowerCase()===q.region!.toLowerCase()):regions;
      return {snapshot,program:'deposit beverage glass',summary,regions:selected,regionMatched:q.region?selected.length>0:null,regionalMethod:'Estimated regional weights, not tracked shipment origins or processor destinations. The individually rounded entries, printed table total and province headline do not reconcile exactly.',source:source.depositBeverage.source,limitations:['Program totals are not non-deposit jar or refillable dairy figures.','No downstream branch tonnage is reported.','No facility route may be interpolated.']};
    }
    if(q.region)throw Error('Only deposit beverage glass has regional figures. Omit region for the other programs.');
    return {snapshot,program:q.program,data:q.program==='refillable'?source.refillableMilk:source.nonDeposit,scope:source.scope,limitations:q.program==='refillable'?['Dairy-reported data were not independently verified by Encorp.','The return rate is not a number of lifetime reuse cycles.']:['End-market location share is not a collection or recycling rate.','Collected glass tonnage is not reported here.']};
  }
  if(name==='source_observatory'){
    const q=data as z.infer<typeof querySchemas.source_observatory>;
    const source=await read<{reviewedAt:string;method:string;sources:Array<{materials:string[];status:string}>}>('/data/v42/source-opportunities.json');
    const sources=source.sources.filter(s=>(!q.material||s.materials.includes(q.material))&&(!q.status||s.status===q.status));
    return {snapshot,reviewedAt:source.reviewedAt,method:source.method,sources,matched:sources.length};
  }
  if(name==='industrial_capacity'){
    const q=data as z.infer<typeof querySchemas.industrial_capacity>;
    const table=await read<{edition:string;source:string;unit:string;scope:string;license:string;licenseUrl:string;world:Record<string,unknown>;rows:Array<{country:string}>}>(`/data/v35/${q.material==='steel'?'steel':'cement'}-country.json`);
    const rows=q.country==='WORLD'?table.rows:table.rows.filter(r=>r.country===q.country);
    return {snapshot,material:q.material,edition:table.edition,source:table.source,license:table.license,licenseUrl:table.licenseUrl,unit:table.unit,scope:table.scope,world:table.world,matched:rows.length,limit:q.limit,offset:q.offset,rows:rows.slice(q.offset,q.offset+q.limit),limitations:['Capacity is rated potential output, not actual production or trade.','Country totals are separate from the mapped Climate TRACE facility points; no supplier link is inferred.']};
  }
  if(name==='estimate_production_gap'){
    const q=data as z.infer<typeof querySchemas.estimate_production_gap>;
    const source=await read<ProductionCatalog>(`/data/v15/production/${q.material}/catalog.json`);
    const item=q.item||source.defaultItem,product=source.products[item];
    if(!product)throw Error('Unknown product. Use production_catalog to discover item IDs.');
    const observations=(await read<ProductionRow[]>(product.path)).filter(r=>r.country===q.country);
    const evidence={snapshot,material:q.material,country:q.country,item,product:{name:product.name,unit:product.unit},source:{publisher:source.publisher,url:source.url,edition:source.edition,license:source.license}};
    const exact=observations.find(r=>r.year===q.year&&r.value!==null);
    if(exact)return {...evidence,estimate:null,reason:'A source observation already exists; no estimate was generated.',sourceObservation:exact};
    const numeric=observations.filter(r=>r.value!==null).sort((a,b)=>a.year-b.year);
    const before=numeric.filter(r=>r.year<q.year).at(-1),after=numeric.find(r=>r.year>q.year);
    if(!before||!after||after.year-before.year>3)return {...evidence,estimate:null,reason:'Two numeric observations no more than three years apart are required; no extrapolation.',sourceObservation:observations.find(r=>r.year===q.year)||null};
    const fraction=(q.year-before.year)/(after.year-before.year);
    return {...evidence,estimate:{year:q.year,value:before.value!+(after.value!-before.value!)*fraction,unit:product.unit,basis:'Derived linear interpolation',formula:'before + (after − before) × (targetYear − beforeYear) / (afterYear − beforeYear)',inputs:[before,after],stored:false,uncertainty:'No statistical interval; source flags or production shocks may make the linear assumption inappropriate.'},sourceObservation:observations.find(r=>r.year===q.year)||null};
  }
  if(name==='local_context'){
    const q=data as z.infer<typeof querySchemas.local_context>;
    const [geo,countries,cata]=await Promise.all([
      read<{features:Array<{properties:{numeric:string};geometry:GeoJSON.Geometry}>}>('/data/v2/geography.json'),
      read<Array<{id:string;name:string;numeric:string}>>('/data/v11/countries.json'),catalog()
    ]);
    const feature=geo.features.find(f=>geoContains(f.geometry,[q.longitude,q.latitude]));
    const area=countries.find(c=>c.numeric===feature?.properties.numeric);
    const found:Array<FacilityPin&{kind:string;distanceKm:number;sourceUrl:string;sourceTitle:string}>=[];
    const counts:Record<string,number>={};
    // Country indexes avoid loading an entire global inventory. River outfalls lack
    // dependable country assignments, so this one layer uses the world index.
    for(const k of facilityKinds){
      const entry=k==='river'?cata.datasets[k].world:area?cata.datasets[k].countries[area.id]:cata.datasets[k].world;
      counts[k]=0;
      if(!entry?.index)continue;
      const index=await read<FacilityIndex>(entry.index);
      for(const pin of facilityPins(index)){
        const [longitude,latitude]=pin.coordinates;
        const dLat=(latitude-q.latitude)*Math.PI/180,dLon=(longitude-q.longitude)*Math.PI/180;
        const a=Math.sin(dLat/2)**2+Math.cos(q.latitude*Math.PI/180)*Math.cos(latitude*Math.PI/180)*Math.sin(dLon/2)**2;
        const distanceKm=6371.0088*2*Math.asin(Math.min(1,Math.sqrt(a)));
        if(distanceKm>q.radiusKm)continue;
        counts[k]++;
        const source=cata.sources[pin.source];
        found.push({...pin,kind:k,distanceKm:Math.round(distanceKm*10)/10,sourceUrl:source?.url||'',sourceTitle:source?.title||pin.source});
      }
    }
    found.sort((a,b)=>a.distanceKm-b.distanceKm);
    // Simplified land polygons can exclude lakes, ports and small islands. A nearby
    // source-country label is useful context, but it remains an explicit inference.
    const nearestAssigned=found.find(r=>r.distanceKm<=Math.min(25,q.radiusKm)&&!['UNASSIGNED','ZNC'].includes(r.country));
    const resolved=area||countries.find(c=>c.id===nearestAssigned?.country);
    const countryMethod=area?'Natural Earth polygon':resolved?'Nearest source record within 25 km':'Unresolved';
    let nationalExtraction:null|{year:number;tonnes:number|null;estimated:boolean;source:unknown}=null;
    if(resolved){
      try{const table=await read<{sourceId:string;rows:Array<{year:number;extraction:number|null;estimated:boolean}>}>(`/data/v12/history/${resolved.id}.json`);
        const row=table.rows.filter(r=>r.extraction!==null).at(-1);
        const sources=await read<Array<{id:string;title?:string;url?:string;edition?:string;license?:string}>>('/data/v3/sources.json');
        const source=sources.find(s=>s.id===table.sourceId);
        if(row)nationalExtraction={year:row.year,tonnes:row.extraction,estimated:row.estimated,source:source?{id:source.id,title:source.title,url:source.url,edition:source.edition,license:source.license}:null};
      }catch{/* An unavailable national table is a coverage gap, not zero. */}
    }
    return {snapshot,location:{latitude:q.latitude,longitude:q.longitude,radiusKm:q.radiusKm,country:resolved?.id||null,countryName:resolved?.name||null,countryMethod,countryBoundary:'Natural Earth simplified boundaries may omit lakes, coastlines and small territories. A country from the nearest source record is an inference, not a boundary check.'},counts,matched:found.length,records:found.slice(0,60),nationalExtraction,definitions:{nearby:'Geodesic distance from the selected coordinate. Counts are source records inside the radius, not unique operating facilities.',extraction:'A country total across material categories, never a measurement for this local radius.',river:'River outfalls are modeled leakage estimates; other markers mix reported locations, capacities and emissions. Quantities are not additive.'},coverage:cata.countDefinition};
  }
  if(name==='waste_catalog'||name==='waste_history'){
    const cata=await read<WasteCatalog>(researchBase+'catalog.json');
    if(name==='waste_catalog'){
      const q=data as z.infer<typeof querySchemas.waste_catalog>;
      return {snapshot,counts:cata.counts,series:cata.series.filter(s=>(q.country==='WORLD'||s.countries[q.country])&&(!q.group||s.group===q.group)),sources:cata.sources,method:'Source-separated series. Country aggregates are not combined; overlapping treatment categories are not additive. City collection uses a separate source register.'};
    }
    const q=data as z.infer<typeof querySchemas.waste_history>;
    if(q.from>q.to)throw Error('from must be before or equal to to.');
    const series=cata.series.find(s=>s.id===q.series);if(!series)throw Error('Unknown series. Call waste_catalog to discover identifiers.');
    const rows=(await read<WasteObservation[]>(series.path)).filter(r=>(q.countries.includes('WORLD')||q.countries.includes(r.country))&&r.year>=q.from&&r.year<=q.to);
    return {snapshot,series,source:cata.sources[series.sourceId],records:rows.slice(q.offset,q.offset+q.limit),matched:rows.length,offset:q.offset,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,method:series.comparability,limitations:['Records retain estimates, projections and source flags. No interpolation is applied.','Country definitions and years vary; source coverage is not a complete global inventory.']};
  }
  if(name==='waste_collection'){
    const q=data as z.infer<typeof querySchemas.waste_collection>,table=await read<CityCollectionData>(researchBase+'city-collection.json');
    const rows=collectionRows(table.records,q.country,q.query,String(q.year));
    return {snapshot,records:rows.slice(q.offset,q.offset+q.limit),matched:rows.length,cityIdentifiers:new Set(rows.map(r=>r.cityId)).size,offset:q.offset,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,source:table.source,method:table.method,limitations:['Latest means latest retained source year, not current year. All ties at the latest city/year are retained.','Collection does not establish recycling or controlled disposal. Source denominators can differ.','No coordinates or city matches are inferred. Source city identifiers can represent service areas.']};
  }
  if(name==='waste_compare'){
    const q=data as z.infer<typeof querySchemas.waste_compare>,table=await read<WasteComparison>(researchBase+'comparison.json');
    const field=table.fields[q.measure];if(!field)throw Error('Unknown measure. Available measures: '+Object.keys(table.fields).join(', '));
    if(q.places?.some(id=>!table.records.some(r=>r.id===id)))throw Error('Unknown place identifier. Omit places to discover country or city records.');
    const rows=table.records.filter(r=>q.places?q.places.includes(r.id):r.level===q.level&&(q.country==='WORLD'||q.country===r.country)&&(!q.query||(r.name+' '+r.countryName).toLowerCase().includes(q.query.toLowerCase()))).sort((a,b)=>a.name.localeCompare(b.name));
    return {snapshot,measure:{id:q.measure,...field},source:table.source,records:rows.slice(q.offset,q.offset+q.limit).map(r=>({id:r.id,name:r.name,country:r.country,level:r.level,observation:r.observations[q.measure]||null,sourceDate:comparisonDate(r.observations[q.measure]),recordPath:'/data/v12/waste/'+r.id+'.json',recordUrl:'/waste?wasteTab=records&place='+r.country+'&wastePlace='+r.id})),matched:rows.length,offset:q.offset,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,definitions:table.fields,limitations:['Dates, definitions and service boundaries differ. This is not a performance ranking.','Missing values remain null. Treatment and composition shares are not normalized to 100%.']};
  }
  if(name==='connections'){
    const q=data as z.infer<typeof querySchemas.connections>,[original,coal]=await Promise.all([read<ConnectionCatalog>(connectionsPath),read<ConnectionCatalog>('/data/v30/coal-paths.json')]);
    const cata={...original,sources:[...original.sources,...coal.sources],networks:[...coal.networks,...original.networks]};
    if(q.network&&!cata.networks.some(n=>n.id===q.network))throw Error('Unknown documented network. Omit network to discover available examples.');
    const matched=selectNetworks(cata,q.material,q.country).filter(n=>!q.network||n.id===q.network);
    const networks=q.network?matched:matched.slice(q.offset,q.offset+q.limit),sourceIds=new Set(networks.flatMap(n=>n.links.flatMap(l=>l.sourceIds)));
    return {snapshot,networks,matched:matched.length,offset:q.offset,nextOffset:!q.network&&q.offset+q.limit<matched.length?q.offset+q.limit:null,index:matched.map(n=>({id:n.id,material:n.material,title:n.title,region:n.region,links:n.links.length})),links:networks.reduce((n,r)=>n+r.links.length,0),mappedLinks:networks.reduce((n,r)=>n+r.links.filter(l=>l.geometry==='schematic').length,0),sources:cata.sources.filter(s=>sourceIds.has(s.id)),method:coal.method+' Other networks: '+original.method,geometry:coal.geometry,reviewedAt:coal.reviewedAt,coverage:'189 U.S. coal plants plus five curated operator networks. The 2025 EIA ledger retains 6,545 named-mine monthly rows; not a global inventory. Use coal_receipts for monthly records. The drawn line is not a measured transport path.'};
  }
  if(name==='coal_receipts'){
    const q=data as z.infer<typeof querySchemas.coal_receipts>;
    const table=await read<{source:string;unit:string;rows:Array<{plantId:number;mineId:string;month:number;shortTons:number;fuelCode:string;transportMode:string|null}>}>('/data/v30/coal-receipts-2025.json');
    const rows=table.rows.filter(r=>(!q.plantId||r.plantId===q.plantId)&&(!q.mineId||r.mineId===q.mineId)&&(!q.month||r.month===q.month));
    return {snapshot,year:2025,source:'https://www.eia.gov/electricity/data/eia923/index.php',unit:table.unit,records:rows.slice(q.offset,q.offset+q.limit),matched:rows.length,offset:q.offset,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,method:'Final reported EIA-923 Schedule 2 coal deliveries with valid MSHA mine IDs. No missing months or quantities have been interpolated. Mine and plant positions are joined from separate government inventories in connections. Receipt is not the month the coal was burned.'};
  }
  if(name==='ports'||name==='port_activity'){
    const cata=await read<MaritimeCatalog>('/data/v16/maritime/catalog.json');
    const ports=await read<Port[]>(cata.portsPath);
    if(name==='ports'){
      const q=data as z.infer<typeof querySchemas.ports>;
      const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const rows=ports.filter(p=>(q.country==='WORLD'||p.country===q.country)&&(!q.query||normalize(p.name+' '+p.countryName+' '+p.locode).includes(normalize(q.query))));
      return {snapshot,records:rows.slice(q.offset,q.offset+q.limit),matched:rows.length,offset:q.offset,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,source:cata.source,months:cata.months,coverage:{ports:cata.count,countries:cata.countries},shippingDensity:await read(cata.densityPath),scope:'A port register and transport context, not commodity-specific supply links. Use port_activity for monthly visits and modeled cargo.'};
    }
    const q=data as z.infer<typeof querySchemas.port_activity>,port=ports.find(p=>p.id===q.port);
    if(!port)throw Error('Unknown source port identifier. Use ports to discover IDs.');
    if(q.month&&!cata.months.includes(q.month))throw Error('Month is outside the retained snapshot. Use ports for available months.');
    const rows=(await read<PortActivity[]>(cata.activityPath)).filter(r=>r.port===q.port&&(!q.month||r.month===q.month));
    return {snapshot,port,rows,source:cata.source,units:{portcalls:'visits, not unique vessels',import:'modeled tonnes',export:'modeled tonnes'},observationCoverage:'days / expectedDays identifies partial months; nulls are not zero.',method:cata.source.method,sourceQueries:q.month?cata.queries[q.month]:undefined,limitations:cata.source.limitations};
  }
  if(name==='journey'){
    const q=data as z.infer<typeof querySchemas.journey>,cata=await read<JourneyCatalog>(`/data/v16/journeys/${q.material}.json`);
    if(!q.stage)return {snapshot,catalog:cata,country:q.country,stages:cata.stages.map(s=>({...s,selectedCountryRecords:q.country==='WORLD'?s.count:s.countries[q.country]||0}))};
    const stage=cata.stages.find(s=>s.id===q.stage);
    if(!stage)throw Error('Stage is not in this guide. Omit stage to discover available layers.');
    const rows=stage.path?(await read<JourneyPin[]>(stage.path)).filter(r=>q.country==='WORLD'||r.country===q.country):[];
    const sources=(await catalog()).sources;
    return {snapshot,material:q.material,country:q.country,stage,records:rows.slice(q.offset,q.offset+q.limit),matched:rows.length,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,method:cata.method,sources:Object.fromEntries([...new Set(rows.map(r=>r.source))].map(id=>[id,sources[id]])),limitations:['These are independently sourced locations, not verified supplier-buyer links or tracked shipments.','General recovery, disposal and river layers are contextual; they do not identify a specific product’s destination.','Source quantities have different units, years and boundaries; they cannot be summed into a material balance.']};
  }
  if(name==='research_path'){
    const q=data as z.infer<typeof querySchemas.research_path>;
    const countryScope=['BC','SSI'].includes(q.place)?'CAN':q.place;
    const [cata,facilities]=await Promise.all([read<JourneyCatalog>(`/data/v16/journeys/${q.material}.json`),catalog()]);
    const relevantStages=cata.stages.map(stage=>({stage:stage.id,label:stage.label,records:countryScope==='WORLD'?stage.count:stage.countries[countryScope]||0,geography:countryScope,geographyNote:countryScope!==q.place?'These counts cover Canada, not British Columbia or Salt Spring Island. Apply a regional filter to the original facility records where the source supplies one.':null,available:!!stage.path,scope:stage.scope,method:stage.path?'Independent source locations. This stage is not connected by a verified shipment to the next stage.':'No source locations assigned to this stage; this does not mean no activity exists.',inspect:{tool:'journey',arguments:{material:q.material,country:countryScope,stage:stage.id}}}));
    const bcGlass=q.place==='BC'&&q.material==='glass'?{question:'Where did the glass used here come from?',origin:{status:'unresolved',reason:'No BC glass import-by-product series or individual product supplier chain is ingested.',research:'https://www150.statcan.gc.ca/n1/pub/71-607-x/71-607-x2021004-eng.htm',scope:'The Statistics Canada CIMT web application supports detailed import commodities and provincial selection; that external source is not a ranked origin result in this snapshot.'},afterUse:{status:'reported-program-end-market',value:100,unit:'percent of reported glass-packaging end markets within BC',year:2025,publisher:'Recycle BC',source:'https://bc-webmedia-assets-prod-shared-ca-central-1.s3.ca-central-1.amazonaws.com/wp-content/uploads/2026/06/11123719/RecycleBC_AnnualReport2025_F_compressed.pdf',limitations:['Only the Recycle BC packaging and paper program.','The share is not a collection or recycling rate.','No individual receiver or new product is established.']},depositGlass:{status:'reported-program-recovery',containersRecovered:159640710,reportedUnitRecoveryPercent:89.2,estimatedTonnesRecovered:54542,year:2025,publisher:'Encorp Pacific',source:'https://ar.return-it.ca/ar2025/deposits-refunds-recovery.html',nextQuery:{tool:'glass_program',arguments:{program:'deposit'}},limitations:['Deposit beverage glass is distinct from non-deposit jars and dairy refillables.','Downstream branches have no reported tonnages or verified shipment paths.']},refillableMilk:{status:'dairy-reported',containersReturned:2666659,reportedReturnPercent:83.6,nextQuery:{tool:'glass_program',arguments:{program:'refillable'}},limitations:['Producer-operated return loop, outside the Return-It beverage deposit system.','Submitted figures not independently verified by Encorp.']},page:'/places?place=BC#bc-glass'}:null;
    return {snapshot,material:q.material,place:q.place,facilityGeography:countryScope,stages:relevantStages,sourceCatalog:cata.sourceCatalog,sourceMethods:cata.method,primarySources:facilities.sources,bcGlass,followUp:{trade:{tool:'trade',arguments:{country:countryScope,direction:'in'},interpretation:'Trade reports border crossings, not a specific supplier chain; discover retained products first.'},facilitySearch:{tool:'facilities',arguments:{country:countryScope,kind:'industry'},interpretation:'Search/filter source locations; a count is never the total number of producers.'}},limitations:['No inferred mine-to-consumer-to-recycler chain.','Country data cannot be converted into local mass balances.','Unavailable layers and missing partner reports remain gaps, not zeros.']};
  }
  if(name==='trade'){
    const q=data as z.infer<typeof querySchemas.trade>;
    type TradeRow={origin:string;destination:string;commodity:string;year:number;tonnes:number;reporter:string;reported_flow:string;source_url:string};
    const table=await read<{flows:TradeRow[];commodities:Array<{id:string;name:string}>;reporters:string[];years:number[];coverage_note:string;method:string;exclusions:unknown}>('/data/v15/trade.json');
    if(q.commodity&&!table.commodities.some(c=>c.id===q.commodity))throw Error('Unknown HS4 product for this snapshot. Omit commodity to discover available products.');
    const oil=await read<{flows:TradeRow[];coverage_note:string;reporters:string[]}>('/data/v16/oil-imports.json');
    const rows=selectTradeEvidence(table.flows,oil.flows,q.country,q.direction,q.commodity).sort((a,b)=>b.tonnes-a.tonnes);
    const sources=await read<Array<{id:string}>>('/data/v16/sources.json');
    return {snapshot,country:q.country,direction:q.direction,reportingBasis:tradeBasisLabels[tradeBasis(rows,q.direction,q.country)],records:rows.slice(q.offset,q.offset+q.limit),matched:rows.length,offset:q.offset,limit:q.limit,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,unit:'metric tonnes of product; native kilograms divided by 1,000',years:table.years,commodities:table.commodities,reporters:table.reporters,partnerImportReporters:oil.reporters,coverage:table.coverage_note,oilCoverage:oil.coverage_note,method:table.method,exclusions:table.exclusions,source:sources.find(s=>s.id==='comtrade'),limitations:['Only strictly positive non-estimated net weights are retained. Missing records do not establish zero trade.','Trading partners are not verified end users, treatment destinations or shipping routes.','For outgoing oil, partner imports fill only a missing origin/product/year export group. Incoming oil uses own import reports where available; neither side is double-counted.','Detailed copper import declarations in the website are a separate dataset and are not combined here.']};
  }
  if(name==='production_catalog'||name==='production'){
    const q=data as z.infer<typeof querySchemas.production>;
    const source=await read<ProductionCatalog>(`/data/v15/production/${q.material}/catalog.json`);
    if(name==='production_catalog')return {snapshot,catalog:source};
    if(q.from>q.to)throw Error('from must be before or equal to to.');
    const item=q.item||source.defaultItem,product=source.products[item];
    if(!product)throw Error('Unknown product for this guide. Call production_catalog for available item IDs.');
    const rows=await read<ProductionRow[]>(product.path);
    return {snapshot,material:q.material,country:q.country,item,product,rows:rows.filter(r=>r.country===q.country&&r.year>=q.from&&r.year<=q.to),source:{title:source.title,publisher:source.publisher,url:source.url,methodUrl:source.methodUrl,edition:source.edition,license:source.license,sha256:source.sourceArchiveSha256},sourceFlags:source.sourceFlags,limitations:source.limitations};
  }
  if(name==='environment'){
    const q=data as z.infer<typeof querySchemas.environment>;
    if(!q.layer)return {snapshot,environment:environmentCatalog};
    if(q.bbox&&(q.bbox[0]>=q.bbox[2]||q.bbox[1]>=q.bbox[3]))throw Error('Image bounds require west < east and south < north. Split a date-line crossing into two images.');
    const layer=environmentLayer(q.layer,q.date)!;
    return {snapshot,layer,tiles:tileUrl(layer),mapImageUrl:q.bbox?environmentImage(layer,q.bbox):null,scope:environmentCatalog.scope,interpretation:'These are satellite visualization services, not extracted numerical measurements or a facility impact assessment.'};
  }
  if(name==='coverage'){
    const {country:c}=data as z.infer<typeof querySchemas.coverage>;
    const [cata,energy]=await Promise.all([catalog(),read<EnergyCatalog>('/data/v13/energy/catalog.json')]);
    const datasets=Object.fromEntries(Object.entries(cata.datasets).map(([id,d])=>[id,c&&c!=='WORLD'?d.countries[c]||{count:0,coverage:'No assigned source records. This does not mean no facilities exist.'}:{count:d.count,countries:Object.fromEntries(Object.entries(d.countries).map(([iso,v])=>[iso,v.count]))}]));
    return {snapshot,country:c||null,facilities:datasets,countDefinition:cata.countDefinition,sourceAreas:cata.sourceAreas,sources:cata.sources,energy:{measures:energy.measures.map(({id,name,unit,frequency,latestPeriod,countries})=>({id,name,unit,frequency,latestPeriod,countries})),sources:energy.sources},otherDatasets:{connections:'189 U.S. generating plants with reported 2025 named-mine coal receipts and five additional operator-described networks. Use connections for sourced endpoints and coal_receipts for monthly rows. Lines are schematic.',production:'FAO production histories for 84 food, forestry and natural-fibre products within 1970–2024. Call production_catalog for products, years and units.',trade:'Selected 2024 export observations plus separately retained oil import reports. One reporting side is selected per product/year group; use trade to discover the reporting basis.',maritime:'2,065 PortWatch locations across 180 source country/area codes; 24,780 monthly observations, September 2025–August 2026. Use ports and port_activity. World Bank historical commercial shipping density is a separate 2015–2021 visualization.',journey:'Fourteen material guides, source-filtered lifecycle locations and explicit gaps. Use journey without stage to discover coverage. No inferred supplier-buyer connections.',material_accounts:'UNEP IRP country material accounts, 1970–2024. Mass: tonnes; per-capita: tonnes/person; population: persons.',waste:'World Bank What a Waste 3.0: 217 country and 262 city records, with field-level references. Use waste_compare to compare places, waste_catalog and waste_history for 123 series / 63,813 historical observations, and waste_collection for 5,170 observations on 4,452 city/area identifiers.'}};
  }
  if(name==='facilities'||name==='facility'){
    const q=data as z.infer<typeof querySchemas.facilities>&{id?:string};
    if(q.bbox&&q.bbox[1]>q.bbox[3])throw Error('The south bound must not exceed the north bound.');
    const cata=await catalog(),dataset=cata.datasets[q.kind],entry=q.country==='WORLD'?dataset.world:dataset.countries[q.country];
    if(!entry)return {snapshot,records:[],matched:0,coverage:'No assigned records in this source snapshot. This does not establish absence of facilities.',sources:[]};
    const records:FacilityRecord[]=[],selected:FacilityPin[]=[];let matched=0;
    const index=await read<FacilityIndex>(entry.index!);
    for(const pin of facilityPins(index)){
      if(name==='facility'){if(pin.id===q.id){selected.push(pin);break}}
      else if(matchesFacility(pin,q)){if(matched>=q.offset&&selected.length<q.limit)selected.push(pin);matched++}
    }
    // Read only the detail chunks needed for this bounded result page.
    const groups=new Map<string,Set<string>>();
    for(const pin of selected){const path=dataset.countries[pin.country].parts[pin.part];if(!groups.has(path))groups.set(path,new Set());groups.get(path)!.add(pin.id)}
    for(const [path,ids] of groups){const chunk=await read<FacilityRecord[]>(path);records.push(...chunk.filter(r=>ids.has(r.id)))}
    const order=new Map(selected.map((p,i)=>[p.id,i]));records.sort((a,b)=>order.get(a.id)!-order.get(b.id)!);
    if(name==='facility'&&records[0]){const r=records[0];return {snapshot,record:r,source:cata.sources[r.source],recordUrl:`/facilities?kind=${q.kind}&place=${r.country}&site=${encodeURIComponent(r.id)}`,countDefinition:cata.countDefinition}}
    if(name==='facility')throw Error('Record not found in the specified dataset and country.');
    return {snapshot,records,matched,offset:q.offset,limit:q.limit,nextOffset:q.offset+records.length<matched?q.offset+records.length:null,coverage:entry,countDefinition:cata.countDefinition,sources:Object.fromEntries(entry.sources.map(id=>[id,cata.sources[id]]))};
  }
  if(name==='energy'||name==='estimate_energy_gap'){
    const q=data as z.infer<typeof querySchemas.energy>&{year?:number};
    const cata=await read<EnergyCatalog>('/data/v13/energy/catalog.json');
    if(!cata.measures.some(m=>m.id===q.measure))throw Error('Unknown measure. Call coverage for available measure IDs.');
    const table=await read<EnergyData>(`/data/v13/energy/${q.measure}.json`);
    const rows=table.rows.filter(r=>r.country===q.country);
    const evidence={snapshot,measure:q.measure,country:q.country,unit:table.unit,definition:table.description,source:cata.sources[table.sourceId],series:table.series[q.country]??null,conversionFactor:table.factor};
    if(name==='energy'){
      if(q.from&&q.to&&q.from>q.to)throw Error('from must be before or equal to to.');
      return {...evidence,rows:rows.filter(r=>(!q.from||r.period>=q.from)&&(!q.to||r.period<=q.to)),coverage:rows.length?'Source flags and original values are retained.':'No series for this country; missing is not zero.'};
    }
    if(table.frequency!=='annual')throw Error('Interpolation is available only for annual series.');
    const exact=rows.find(r=>r.period===String(q.year));
    if(exact?.value!=null)return {...evidence,estimate:null,reason:'An existing source value is available; no estimate generated.',sourceObservation:exact};
    const available=rows.filter(r=>r.value!=null).sort((a,b)=>a.period.localeCompare(b.period));
    const before=available.filter(r=>Number(r.period)<q.year!).at(-1),after=available.find(r=>Number(r.period)>q.year!);
    if(!before||!after||Number(after.period)-Number(before.period)>3)return {...evidence,estimate:null,reason:'Requires two numeric observations no more than three years apart. No extrapolation is performed.'};
    const fraction=(q.year!-Number(before.period))/(Number(after.period)-Number(before.period));
    return {...evidence,estimate:{period:String(q.year),value:before.value!+(after.value!-before.value!)*fraction,basis:'Derived linear interpolation',formula:'before + (after − before) × (targetYear − beforeYear) / (afterYear − beforeYear)',inputs:[before,after],uncertainty:'No statistical interval is estimated. The linear assumption may miss interruptions or structural change.',stored:false},sourceObservation:exact??null};
  }
  if(name==='waste'){
    const {place}=data as z.infer<typeof querySchemas.waste>;
    const index=await read<{records:Array<{id:string}>;fields:unknown;citation:string;url:string;license:string}>('/data/v12/waste-index.json');
    if(!index.records.some(r=>r.id===place))throw Error('No retained waste record for this place. City IDs can be found in /data/v12/waste-index.json.');
    return {snapshot,record:await read(`/data/v12/waste/${place}.json`),fields:index.fields,source:{citation:index.citation,url:index.url,license:index.license},limitations:'Each field may have a different observation year and boundary. Sent for recycling does not measure recovered output. Projections are separate fields.'};
  }
  const q=data as z.infer<typeof querySchemas.material_accounts>;
  if(q.from>q.to)throw Error('from must be before or equal to to.');
  const directory=await read<Array<{id:string}>>('/data/v11/countries.json');
  if(q.country!=='WORLD'&&!directory.some(c=>c.id===q.country))throw Error('Unknown country.');
  const table=await read<{sourceId:string;country:string;rows:Array<{year:number}>}>(`/data/v12/history/${q.country}.json`);
  const sources=await read<Array<{id:string}>>('/data/v3/sources.json');
  return {snapshot,country:q.country,rows:table.rows.filter(r=>r.year>=q.from&&r.year<=q.to),units:{extraction:'tonnes',imports:'tonnes',exports:'tonnes',domesticConsumption:'tonnes',footprint:'tonnes',population:'persons',extractionPerCapita:'tonnes/person',domesticConsumptionPerCapita:'tonnes/person',footprintPerCapita:'tonnes/person'},source:sources.find(s=>s.id===table.sourceId),limitations:'Physical trade, domestic extraction and consumption-based material footprint have different accounting boundaries. Footprint is modeled. Later source estimates retain the estimated flag.'};
}
