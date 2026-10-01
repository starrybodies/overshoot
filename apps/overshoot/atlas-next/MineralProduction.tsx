'use client';
import {useState} from 'react';
import {ArrowRight,ArrowUpRight} from 'lucide-react';
import {useMaterialArtifact} from '../material-data';
import WorldMap from '../world/WorldMap';
import type {Country} from '../world/model';
import {compact} from './common';
import {placeName} from './PlaceContext';
import './mineral-production.css';

type Series={id:string;material:string;measure:string;year:number;basis:string;unit:string;source:string;worldTotal:number;rows:{country:string;value:number}[]};
type Catalog={edition:string;reviewedAt:string;method:string;series:Series[]};
const labels:Record<string,string>={'copper-mine':'Copper · mined','copper-refinery':'Copper · refined','aluminium-smelter':'Aluminium · smelted','lithium-mine':'Lithium · mined','steel-raw':'Steel · raw output'};
const defaults:Record<string,string>={copper:'copper-mine',aluminium:'aluminium-smelter',steel:'steel-raw',lithium:'lithium-mine'};
export default function MineralProduction({material='',place='WORLD',countries,onPlace,onExplore}:{material?:string;place?:string;countries?:Country[];onPlace?:(id:string)=>void;onExplore?:(material:string,place:string)=>void}){
 const result=useMaterialArtifact<Catalog>('/data/v39/usgs-minerals-2025.json');
 const directory=useMaterialArtifact<Country[]>(countries?null:'/data/v11/countries.json');
 const [chosen,setChosen]=useState(''),[localPlace,setLocalPlace]=useState('WORLD');
 const options=(result.data?.series||[]).filter(s=>!material||s.material===material);
 const id=options.some(s=>s.id===chosen)?chosen:defaults[material]||'copper-mine';
 const series=options.find(s=>s.id===id)||options[0];
 const listing=countries||directory.data||[];
 const current=onPlace?place:localPlace;
 const values=new Map(series?.rows.map(r=>[r.country,r.value])||[]);
 const sorted=[...values.values()].sort((a,b)=>a-b);
 const thresholds=[.2,.4,.6,.8].map(p=>sorted[Math.min(sorted.length-1,Math.floor(p*sorted.length))]||0);
 const selected=series?.rows.find(r=>r.country===current);
 const ranked=[...(series?.rows||[])].sort((a,b)=>b.value-a.value).slice(0,7);
 const changePlace=(id:string)=>onPlace?onPlace(id):setLocalPlace(id);
 return <section className="om-production" aria-label="USGS 2025 mineral production">
  <div className="om-header"><div><span className="oa-kicker">MEASURED BY PROCESS · 2025 ESTIMATES</span><h2>Where was it produced?</h2><p>Mine, refinery, smelter and steel output are separate measures. Select a country to inspect the estimate; these figures do not trace a shipment.</p></div><label>Production stage<select value={series?.id||id} onChange={e=>setChosen(e.target.value)}>{options.map(s=><option key={s.id} value={s.id}>{labels[s.id]}</option>)}</select></label></div>
  {result.error||directory.error?<p role="alert">The production source could not load. <a href="/data/v39/usgs-minerals-2025.json">Download the source table ↗</a></p>:!series||!listing.length?<p>Loading production estimates…</p>:<div className="oa-map-workspace om-workspace"><WorldMap flows={[]} sites={[]} countries={listing} place={current} selected="" onFlow={()=>{}} onSite={()=>{}} onPlace={changePlace} color="#b87948" siteView={false} countryLayer={{values,thresholds,label:series.measure,year:'2025 estimate',unit:'metric tonnes',loading:false}}/><aside className="oa-map-inspector"><span className="oa-kicker">USGS MCS 2026 · {current==='WORLD'?'WORLD TOTAL':placeName(current,listing).toUpperCase()}</span><h3>{series.measure}</h3><p className="oa-map-value">{current==='WORLD'?compact(series.worldTotal):selected?compact(selected.value):'No published figure'}<span>{current==='WORLD'||selected?'metric tonnes · 2025 estimate':'No country observation in this table'}</span></p><p className="oa-small">{current==='WORLD'?'Publisher’s independently rounded world total; the country sample is incomplete.':'A country estimate for this process. It is not a plant count, rated capacity or supplier relationship.'}</p><div className="oa-connection-list"><span className="oa-kicker">LARGEST REPORTED COUNTRIES</span>{ranked.map(r=><button key={r.country} onClick={()=>changePlace(r.country)} aria-pressed={current===r.country}><span>{placeName(r.country,listing)}</span><b>{compact(r.value)}</b></button>)}</div>{current!=='WORLD'&&<button className="oa-text-link" onClick={()=>changePlace('WORLD')}>Return to world total <ArrowRight size={14}/></button>}{onExplore&&series.material!=='lithium'&&<button className="oa-button" onClick={()=>onExplore(series.material,current)}>Explore {series.material} journey <ArrowRight size={15}/></button>}<a className="oa-text-link" href={series.source} target="_blank" rel="noreferrer">Original USGS table <ArrowUpRight size={14}/></a></aside></div>}
  <p className="om-method">{result.data?.method} <a href="/data/v39/usgs-minerals-2025.json">Download 63 country observations ↗</a></p>
 </section>;
}
