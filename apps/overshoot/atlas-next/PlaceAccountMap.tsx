'use client';
import {useMemo,useState} from 'react';
import {ArrowDown,ArrowRight} from 'lucide-react';
import WorldMap from '../world/WorldMap';
import type {Country} from '../world/model';
import {Choice,compact,number,Refs,Loading} from './common';
export type Account={country:string;year:number;extraction:number|null;imports:number|null;exports:number|null;domesticConsumption:number|null;estimated?:boolean;[key:string]:unknown};
const measures={
 extraction:{label:'Material extraction',unit:'tonnes',description:'Material taken from the environment: biomass, fossil fuels, metal ores and non-metallic minerals.',question:'Where is material taken from the environment?'},
 domesticConsumption:{label:'Domestic material consumption',unit:'tonnes',description:'Extraction plus physical imports minus physical exports. This can enter products and buildings, be used as fuel, or later become waste.',question:'Where does material enter domestic use?'},
 extractionPerCapita:{label:'Extraction per person',unit:'tonnes per person',description:'Annual extraction divided by the source population. It compares the scale of extraction relative to population, not an individual’s use.',question:'How does extraction compare per person?'},
 domesticConsumptionPerCapita:{label:'Consumption per person',unit:'tonnes per person',description:'Domestic material consumption divided by the source population. This is an economy-wide average, not a household footprint.',question:'How does material use compare per person?'}
};
export default function PlaceAccountMap({rows,countries,place,year,years,onYear,onPlace,onSites,loading}:{loading:boolean;years:number[];onYear:(year:string)=>void;onSites:()=>void;rows:Account[];countries:Country[];place:string;year:string;onPlace:(place:string)=>void}){
 const [measure,setMeasure]=useState<keyof typeof measures>('extraction');
 const meta=measures[measure],perPerson=meta.unit==='tonnes per person';
 const {values,ranked}=useMemo(()=>{const ids=new Set(countries.filter(c=>c.id!=='WORLD').map(c=>c.id));const valid=rows.filter(r=>ids.has(r.country)&&typeof r[measure]==='number'&&Number.isFinite(r[measure]));return {values:new Map(valid.map(r=>[r.country,r[measure] as number])),ranked:valid.sort((a,b)=>(b[measure] as number)-(a[measure] as number))}},[rows,countries,measure]);
 const name=countries.find(c=>c.id===place)?.name||place,account=rows.find(r=>r.country===place),amount=account?.[measure],rank=ranked.findIndex(r=>r.country===place);
 return <section className="oa-place-map" aria-label="Compare country material accounts">
  <div className="oa-map-toolbar"><div className="oa-map-intro"><span className="oa-kicker">01 / THE GEOGRAPHY OF MATERIAL USE</span><h2>{meta.question}</h2></div><Choice label="Account year" value={year} onChange={onYear} options={years.map(y=>({id:String(y),name:String(y)}))}/><Choice label="Compare countries by" value={measure} onChange={v=>setMeasure(v as keyof typeof measures)} options={Object.entries(measures).map(([id,m])=>({id,name:m.label}))}/></div>
  <div className="oa-map-workspace"><WorldMap flows={[]} sites={[]} countries={countries} place={place} selected="" onFlow={()=>{}} onSite={()=>{}} onPlace={onPlace} color="#245740" siteView={false} countryLayer={{values,loading,label:meta.label,unit:meta.unit,year,thresholds:perPerson?[5,10,20,40]:[1e6,1e7,1e8,1e9]}}/>
   <aside className="oa-map-inspector">{loading?<Loading/>:<><span className="oa-kicker">{place==='WORLD'?'GLOBAL CONTEXT':name.toUpperCase()} · {year}</span><h3>{meta.label}</h3><p className="oa-map-value">{typeof amount==='number'?perPerson?number(amount,1):compact(amount):'Unreported'}<span>{meta.unit}{account?.estimated?' · source estimate':''}</span></p><p>{meta.description}</p>{rank>=0&&<p className="oa-small">Ranked {rank+1} of {ranked.length} retained country / area accounts for this measure.</p>}
    <div className="oa-connection-list"><span className="oa-kicker">LARGEST AVAILABLE ACCOUNTS</span>{ranked.slice(0,4).map((r,i)=><button key={r.country} onClick={()=>onPlace(r.country)} aria-pressed={place===r.country}><span><small>{i+1}</small> {countries.find(c=>c.id===r.country)?.name||r.country}</span><b>{perPerson?number(r[measure] as number,1):compact(r[measure] as number)}</b></button>)}</div>
    {account&&<a className="oa-text-link" href="#place-account">Read the material balance<ArrowDown size={15}/></a>}{place!=='WORLD'&&<button className="oa-text-link" onClick={()=>onPlace('WORLD')}>Return to worldwide accounts<ArrowRight size={15}/></button>}
   </>}</aside>
  </div>
  <div className="oa-read-map"><div><span className="oa-kicker">CHANGE THE QUESTION, CHANGE THE MAP</span><p>Total tonnes show the scale of an economy’s material flows. Per-person values show that scale relative to population. The two views can reveal very different patterns.</p></div><div><span className="oa-kicker">EXTRACTION IS NOT DISPOSAL</span><p>Material can remain in roads, buildings and products for years. Continue below to distinguish annual flows, accumulated stocks and measured waste streams.</p><button className="oa-text-link" onClick={onSites}>Find operations and hotspots<ArrowRight size={15}/></button><Refs ids={['irp']}/></div></div>
 </section>
}
