'use client';
import {useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Download} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {useMaterialArtifact} from '../material-data';
import WorldMap from '../world/WorldMap';
import type {Country} from '../world/model';
import MaterialMap from './MaterialMap';
import JourneyMap from './JourneyMap';
import DocumentedConnections from './DocumentedConnections';
import ProductionMap from './ProductionMap';
import MaterialSitesMap,{type OpenMaterialSites} from './MaterialSitesMap';
import {materialSiteLayers} from './materialSites';
import EnergyMap,{type EnergySelection} from './EnergyMap';
import MineralProduction from './MineralProduction';
import type {WasteIndex} from './WasteSystems';
import {Choice,Loading,ErrorState,compact,number,exportCSV} from './common';
import {placeName} from './PlaceContext';
import type {ProductionSelection} from '@/packages/material-world/production';
import type {Profile} from './data';
import './journey-navigation.css';
export type MaterialLayer=''|'connections'|'journey'|'trade'|'waste'|'extraction'|'production'|'sites'|'minerals';
type Props=React.ComponentProps<typeof MaterialMap>&{network:string;onNetwork:(id:string,place:string)=>void;journeyLayers:string;onJourneyLayers:(layers:string)=>void;onSites:OpenMaterialSites;productionSelection:ProductionSelection;onProductionSelection:(v:Partial<ProductionSelection>)=>void;layer:MaterialLayer;onLayer:(layer:MaterialLayer)=>void;energySelection:EnergySelection;onEnergySelection:(v:Partial<EnergySelection>)=>void};
type Metric={country:string;metric:string;year:number|null;value:number;unit:string;source_id:string;estimated?:boolean;footnotes?:string[];method?:string;[key:string]:unknown};
type Source={id:string;title:string;url:string;method:string;publisher:string};
const waste:Record<string,{id:string;title:string;scope:string}>={
 food:{id:'food_waste',title:'Food waste generated',scope:'Food waste at household, food service and retail stages. It is separate from food lost during farming, storage and transport.'},
 electronics:{id:'ewaste_generated',title:'Electronic waste generated',scope:'Discarded electrical and electronic equipment. Generation does not establish how much was collected or recycled.'},
 garbage:{id:'municipal_waste_generated',title:'Municipal waste generated',scope:'Waste from households and comparable sources. National definitions differ; it does not include all industrial waste.'},
 plastic:{id:'plastic_waste_generated',title:'Plastic waste generated',scope:'All plastic waste in the OECD model, including packaging and other uses. Only a small country sample is included here.'},
 'rigid-plastic':{id:'plastic_waste_generated',title:'Plastic waste generated',scope:'All plastic waste in the OECD model. This broader category does not isolate bulky rigid products.'}
};
const extraction:Record<string,{column:number;title:string;scope:string}>={
 concrete:{column:5,title:'Non-metallic mineral extraction',scope:'Includes construction minerals and other non-metallic minerals. This is broader than concrete and does not measure concrete production.'},
 glass:{column:5,title:'Non-metallic mineral extraction',scope:'Includes minerals used across many industries. This is context for glass’s mineral inputs, not a glass-specific total.'},
 copper:{column:4,title:'Metal ore extraction',scope:'Gross weight of all metal ores, including rock in the ore. It does not isolate copper or measure contained metal.'},
 aluminium:{column:4,title:'Metal ore extraction',scope:'All metal ores, not just bauxite. Gross ore weight is different from the weight of refined aluminium.'},
 steel:{column:4,title:'Metal ore extraction',scope:'All metal ores, not just iron ore. This is broader extraction context for the metal supply chain.'},
 fuels:{column:3,title:'Fossil fuel extraction',scope:'Coal, oil, gas and other fossil energy carriers taken from the environment. This measures extraction, not combustion emissions.'},
 paper:{column:2,title:'Biomass extraction',scope:'Crops, crop residues, wood and other biomass. This broad account does not isolate wood fibre used for paper.'},
 wood:{column:2,title:'Biomass extraction',scope:'Includes crops and other biomass alongside wood. This is not a timber-specific production figure.'}
};
export default function MaterialGeography(props:Props){
 const options=[{id:'journey',name:'Journey layers'},{id:'connections',name:'Documented links'},...(materialSiteLayers[props.profile.id]?[{id:'sites',name:'Mines & facilities'}]:[]),...(['copper','aluminium','steel'].includes(props.profile.id)?[{id:'minerals',name:'2025 production'}]:[]),...(['food','wood','paper','fuels','textiles'].includes(props.profile.id)?[{id:'production',name:props.profile.id==='fuels'?'Oil, gas & coal':'Production'}]:[]),...(props.profile.codes.length?[{id:'trade',name:'Trade connections'}]:[]),...(waste[props.profile.id]?[{id:'waste',name:'Waste generated'}]:[]),...(extraction[props.profile.id]?[{id:'extraction',name:'Extraction context'}]:[])];
 const hasLinks=['fuels','copper','aluminium','steel'].includes(props.profile.id);
 const journeySteps:[MaterialLayer,string,string][]=hasLinks?[['connections','Named links','Reported movement between named places'],['journey','Stage locations','Independent source records at each stage']]:[['journey','Stage locations','Independent source records at each stage']];
 if(['copper','aluminium','steel'].includes(props.profile.id))journeySteps.push(['minerals','2025 production','USGS country output by process']);
 if(props.profile.codes.length)journeySteps.push(['trade','Country trade','Reported border crossing by material form']);
 if(waste[props.profile.id])journeySteps.push(['waste','After use','Waste generated, where measured']);
 const defaultLayer=hasLinks?'connections':'journey';
 const active=options.some(o=>o.id===props.layer)?props.layer:defaultLayer;
 const stepIndex=journeySteps.findIndex(([id])=>id===active),next=stepIndex<0?journeySteps[0]:journeySteps[stepIndex+1];
 return <div className="oa-material-geography"><nav className="oa-journey-nav" aria-label="Follow this material through the evidence"><div className="oa-journey-nav-head"><div><span className="oa-kicker">FOLLOW THE EVIDENCE</span><p>Move between connected operations, independent stage records, country production, trade and after use. Each view has its own source and boundary.</p></div>{next&&<button className="oa-journey-next" onClick={()=>props.onLayer(next[0])}>Next: {next[1]} <ArrowRight size={16}/></button>}</div><ol>{journeySteps.map(([id,label,description],i)=><li key={id}><button type="button" onClick={()=>props.onLayer(id)} aria-current={active===id?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span><strong>{label}</strong><small>{description}</small></button></li>)}</ol></nav><div className="oa-evidence-switch"><span>Other views and measures</span><Tabs value={active} onValueChange={v=>props.onLayer(v as MaterialLayer)}><TabsList aria-label="Material map data">{options.map(o=><TabsTrigger key={o.id} value={o.id}>{o.name}</TabsTrigger>)}</TabsList></Tabs></div>{active==='connections'?<DocumentedConnections profile={props.profile} place={props.place} countries={props.countries} networkId={props.network} onNetwork={props.onNetwork} onJourney={()=>props.onLayer('journey')} onPlace={place=>props.onChange({place})} onSites={props.onSites}/>:active==='journey'?<JourneyMap profile={props.profile} place={props.place} countries={props.countries} layers={props.journeyLayers} onLayers={props.onJourneyLayers} onPlace={place=>props.onChange({place})} onSites={props.onSites} onConnections={()=>props.onLayer('connections')} onAccounts={()=>props.onPlaces()} onEnergy={()=>{props.onLayer('production')}}/>:active==='minerals'?<MineralProduction material={props.profile.id} place={props.place} countries={props.countries} onPlace={place=>props.onChange({place})}/>:active==='sites'?<MaterialSitesMap profile={props.profile} place={props.place} countries={props.countries} onPlace={place=>props.onChange({place})} onSites={props.onSites}/>:active==='trade'?<MaterialMap {...props}/>:active==='production'&&props.profile.id==='fuels'?<EnergyMap selection={props.energySelection} onSelection={props.onEnergySelection} place={props.place} countries={props.countries} onPlace={place=>props.onChange({place})} onPlaces={props.onPlaces}/>:active==='production'?<ProductionMap selection={props.productionSelection} onSelection={props.onProductionSelection} profile={props.profile} place={props.place} countries={props.countries} onPlace={place=>props.onChange({place})} onPlaces={props.onPlaces}/>:<MaterialMetricMap key={props.profile.id+active} profile={props.profile} layer={active as 'waste'|'extraction'} place={props.place} countries={props.countries} onPlace={place=>props.onChange({place})} onPlaces={props.onPlaces}/>}</div>
}
function MaterialMetricMap({profile,layer,place,countries,onPlace,onPlaces}:{profile:Profile;layer:'waste'|'extraction';place:string;countries:Country[];onPlace:(id:string)=>void;onPlaces:(id?:string,waste?:boolean)=>void}){
 const isExtraction=layer==='extraction',municipal=profile.id==='garbage',meta=isExtraction?extraction[profile.id]:waste[profile.id];
 const [year,setYear]=useState('2024');
 const metrics=useMaterialArtifact<{records:Metric[]}>(!isExtraction&&!municipal?'/data/v3/metrics-latest.json':null);
 const wasteBank=useMaterialArtifact<WasteIndex>(municipal?'/data/v12/waste-index.json':null);
 const accounts=useMaterialArtifact<{observations:Array<Array<string|number|boolean|null>>;years:number[]}>(isExtraction?'/data/v2/extraction.json':null);
 const registry=useMaterialArtifact<Source[]>('/data/v3/sources.json');
 const rows=useMemo<Metric[]>(()=>municipal?(wasteBank.data?.records||[]).filter(r=>r.level==='country'&&r.tonnes!==null).map(r=>({country:r.country,metric:'municipal_waste_generated',year:r.year,value:r.tonnes!,unit:'tonnes',source_id:'worldbank-waw3-2026'})):isExtraction?(accounts.data?.observations||[]).filter(r=>r[1]===Number(year)&&typeof r[extraction[profile.id].column]==='number').map(r=>({country:String(r[0]),metric:meta.title,year:Number(r[1]),value:Number(r[extraction[profile.id].column]),unit:'tonnes',source_id:'irp-2026',estimated:!!r[9]})):(metrics.data?.records||[]).filter(r=>r.metric===waste[profile.id].id),[municipal,wasteBank.data,isExtraction,accounts.data,metrics.data,profile.id,year]);
 const data=municipal?wasteBank:isExtraction?accounts:metrics;
 const validIds=useMemo(()=>new Set(countries.map(c=>c.id)),[countries]);
 const ranked=useMemo(()=>rows.filter(r=>validIds.has(r.country)).sort((a,b)=>b.value-a.value),[rows,validIds]);
 const values=useMemo(()=>new Map(ranked.map(r=>[r.country,r.value])),[ranked]);
 const record=rows.find(r=>r.country===place);
 const source=registry.data?.find(s=>s.id===(record?.source_id||rows[0]?.source_id));
 const years=[...new Set(ranked.map(r=>r.year).filter((y):y is number=>y!==null))].sort();
 const dateLabel=isExtraction?year:years.length===1?String(years[0]):years.length?years[0]+'–'+years.at(-1)+' · latest available':'Latest available';
 const loading=!data.data&&!data.error;
 return <section className="oa-material-map" aria-label={meta.title}>
  <div className="oa-map-toolbar"><div className="oa-map-intro"><span className="oa-kicker">{isExtraction?'RAW MATERIALS':'AFTER USE'}</span><h2>{meta.title}</h2></div>{isExtraction?<Choice label="Extraction year" value={year} onChange={setYear} options={(accounts.data?.years||[2024]).slice().reverse().map(y=>({id:String(y),name:String(y)}))}/>:<span className="oa-small">{dateLabel}</span>}</div>
  <p className="oa-layer-scope">{meta.scope}</p>
  {data.error?<ErrorState message={data.error}/>:<div className="oa-map-workspace"><WorldMap flows={[]} sites={[]} countries={countries} place={place} selected="" onFlow={()=>{}} onSite={()=>{}} onPlace={onPlace} color={profile.color} siteView={false} countryLayer={{values,label:meta.title,year:dateLabel,unit:'tonnes',thresholds:[1e5,1e6,1e7,1e8],loading}}/>
   <aside className="oa-map-inspector" aria-label="Selected material measure">{loading?<Loading/>:<><span className="oa-kicker">{placeName(place,countries)}</span><h3>{meta.title}</h3><p className="oa-map-value">{record?compact(record.value):'No observation'}<span>{record?'tonnes · '+record.year+(record.estimated?' · source estimate':''):'Choose a country with available data'}</span></p>{record&&<p className="oa-small">{number(record.value,0)} tonnes{record.footnotes?.length?' · '+record.footnotes.join(' · '):''}</p>}
    <p className="oa-small">{ranked.length} country / area observations. {years.length>1?'Years differ by country; this is not a same-year ranking.':'Figures compare the available source records.'}{isExtraction?' Recent years use source estimates.':''}</p>
    <div className="oa-connection-list"><span className="oa-kicker">LARGEST AVAILABLE FIGURES</span>{ranked.slice(0,4).map(r=><button key={r.country} onClick={()=>onPlace(r.country)} aria-pressed={place===r.country}><span>{placeName(r.country,countries)}<small>{r.year}</small></span><b>{compact(r.value)}</b></button>)}</div>
    <button className="oa-button" onClick={()=>onPlaces(place,municipal)}>{municipal?'Composition, collection & treatment':'Open this place’s accounts'}<ArrowRight size={16}/></button>
    {source&&<a className="oa-text-link" href={source.url} target="_blank" rel="noreferrer">Primary source<ArrowUpRight size={15}/></a>}
    {place!=='WORLD'&&<button className="oa-text-link" onClick={()=>onPlace('WORLD')}>Show worldwide context<ArrowRight size={15}/></button>}
   </>}</aside>
  </div>}
  <div className="oa-data-source-line"><span>{source?.title||'Loading source details…'}</span><button className="oa-text-link" disabled={!rows.length} onClick={()=>exportCSV(rows,'overshoot-'+profile.id+'-'+layer+'.csv')}><Download size={15}/>Download data</button></div>
  <details className="oa-method"><summary>What is included in this measure?</summary><p>{meta.scope}</p>{source&&<p>{source.method}</p>}<p>Missing values are left empty. A global figure is retained only where the source supplies it; partial country samples are not added into a global total.</p>{record&&<details><summary>Selected source record</summary><pre>{JSON.stringify(record,null,2)}</pre></details>}</details>
 </section>
}
