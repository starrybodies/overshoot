'use client';
import {useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Download} from 'lucide-react';
import {useMaterialArtifact} from '../material-data';
import WorldMap from '../world/WorldMap';
import type {Country} from '../world/model';
import type {ProductionRow,ProductionCatalog,ProductionSelection} from '@/packages/material-world/production';
import {Choice,compact,ErrorState,exportCSV,Loading,number} from './common';
import {placeName} from './PlaceContext';
import type {Profile} from './data';
const empty:ProductionRow[]=[];
export default function ProductionMap({profile,place,countries,onPlace,onPlaces,selection,onSelection}:{profile:Profile;place:string;countries:Country[];onPlace:(id:string)=>void;onPlaces:(id?:string)=>void;selection:ProductionSelection;onSelection:(p:Partial<ProductionSelection>)=>void}){
 const catalog=useMaterialArtifact<ProductionCatalog>(`/data/v15/production/${profile.id}/catalog.json`);
 const item=catalog.data?.products[selection.productionItem]?selection.productionItem:catalog.data?.defaultItem||'';
 const product=catalog.data?.products[item];
 const data=useMaterialArtifact<ProductionRow[]>(product?.path||null);
 const year=product?.years.includes(Number(selection.productionYear))?Number(selection.productionYear):product?.years.at(-1)||2024;
 const [limit,setLimit]=useState(8);
 const rows=useMemo(()=>(data.data||empty).filter(r=>r.year===year),[data.data,year]);
 const ids=useMemo(()=>new Set(countries.map(c=>c.id)),[countries]);
 const ranked=useMemo(()=>rows.filter(r=>r.country!=='WORLD'&&r.value!==null&&ids.has(r.country)).sort((a,b)=>b.value!-a.value!),[rows,ids]);
 const values=useMemo(()=>new Map(ranked.map(r=>[r.country,r.value!])),[ranked]);
 const country=['BC','SSI'].includes(place)?'CAN':place;
 const history=useMemo(()=>(data.data||empty).filter(r=>r.country===country).sort((a,b)=>a.year-b.year),[data.data,country]);
 const record=rows.find(r=>r.country===country),world=rows.find(r=>r.country==='WORLD');
 const share=record?.value!=null&&world?.value&&country!=='WORLD'?record.value/world.value*100:null;
 const error=catalog.error||data.error;
 if(error)return <ErrorState message={error}/>;
 if(!catalog.data||!product)return <Loading/>;
 const source=catalog.data;
 return <section className="oa-material-map oa-production-map" aria-label="Production by country">
  <div className="oa-map-toolbar"><div className="oa-map-intro"><span className="oa-kicker">PRODUCTION · FAO · {year}</span><h2>{profile.id==='food'?'What the world produces.':profile.id==='paper'?'From fibre to paper.':profile.id==='textiles'?'The fibres before the fabric.':'From forests to wood products.'}</h2></div><div className="oa-production-year"><Choice label="Product" value={item} onChange={productionItem=>{onSelection({productionItem});setLimit(8)}} options={Object.entries(source.products).map(([id,p])=>({id,name:p.name}))}/><Choice label="Production year" value={String(year)} onChange={productionYear=>onSelection({productionYear})} options={product.years.slice().reverse().map(y=>({id:String(y),name:String(y)}))}/></div></div>
  <p className="oa-layer-scope">{product.description}</p>
  <div className="oa-map-workspace"><WorldMap flows={[]} sites={[]} countries={countries} place={country} selected="" onFlow={()=>{}} onSite={()=>{}} onPlace={onPlace} color={profile.color} siteView={false} countryLayer={{values,label:product.name+' production',year:String(year),unit:product.unit,thresholds:[1e5,1e6,1e7,1e8],loading:!data.data}}/>
   <aside className="oa-map-inspector"><span className="oa-kicker">{placeName(country,countries)}{place!==country?' · national series':''}</span><h3>{product.name}</h3>{!data.data?<Loading/>:<><p className="oa-map-value">{record?.value!=null?compact(record.value):'Not reported'}<span>{product.unit} · {year}</span></p>{record?.value!=null&&<p className="oa-small">{number(record.value,0)} {product.unit} · {source.sourceFlags[record.source_flag]||record.source_flag}</p>}{share!==null&&<p className="oa-production-share"><strong>{number(share,1)}%</strong> of the source’s worldwide quantity</p>}<ProductionTrend rows={history} unit={product.unit} selectedYear={year} onYear={productionYear=>onSelection({productionYear:String(productionYear)})}/><p className="oa-small">{ranked.length} countries / areas report a value for this product and year. A gap is not zero.</p><div className="oa-connection-list"><span className="oa-kicker">LEADING PRODUCERS · {year}</span>{ranked.slice(0,4).map(r=><button key={r.country} onClick={()=>onPlace(r.country)} aria-pressed={country===r.country}><span>{placeName(r.country,countries)}<small>{source.sourceFlags[r.source_flag]||r.source_flag}</small></span><b>{compact(r.value!)}</b></button>)}</div></>}<button className="oa-text-link" onClick={()=>onPlaces(country)}>Open this place’s accounts<ArrowRight size={15}/></button>{place!=='WORLD'&&<button className="oa-text-link" onClick={()=>onPlace('WORLD')}>See worldwide production<ArrowRight size={15}/></button>}</aside>
  </div>
  <div className="oa-data-source-line"><a href={source.url} target="_blank" rel="noreferrer">FAOSTAT · {source.title}<ArrowUpRight size={14}/></a><button className="oa-text-link" disabled={!data.data} onClick={()=>exportCSV(rows.map(r=>({...r,source_url:source.url,source_edition:source.edition,source_flag_definition:source.sourceFlags[r.source_flag],license:source.license})),`overshoot-production-${item}-${year}.csv`)}><Download size={15}/>Download {year}</button><button className="oa-text-link" disabled={!history.length} onClick={()=>exportCSV(history.map(r=>({...r,source_url:source.url,source_flag_definition:source.sourceFlags[r.source_flag],source_edition:source.edition,license:source.license})),`overshoot-production-${item}-${country}-history.csv`)}>Download this place’s history<Download size={15}/></button></div>
  <details className="oa-method"><summary>Source, definitions and estimates</summary><p>{Object.keys(source.products).length} products are available in this guide. {profile.id==='textiles'?'These are natural fibres and other biological inputs, not finished textiles or synthetic-fibre production.':'Products describe different stages of processing and cannot be added into a single material total.'}</p><ul>{source.limitations.map(l=><li key={l}>{l}</li>)}</ul><p>Source release: {source.edition}. Acquired {source.retrievedAt}. {source.license}.</p><a className="oa-text-link" href={source.methodUrl} target="_blank" rel="noreferrer">Definitions & methodology<ArrowUpRight size={15}/></a>{record&&<><h3>Selected source record</h3><pre>{JSON.stringify(record,null,2)}</pre></>}</details>
  <div className="oa-production-register"><div className="oa-section-heading"><div><h3>Compare producers</h3><p>{product.name} · {year} · {product.unit}</p></div></div>{ranked.slice(0,limit).map((r,i)=><button key={r.country} className="oa-source-data-row" onClick={()=>{onPlace(r.country);document.getElementById('material-map')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}}><span className="oa-rank">{i+1}</span><span>{placeName(r.country,countries)}<small>{source.sourceFlags[r.source_flag]||r.source_flag}</small></span><strong>{compact(r.value!)}</strong><ArrowUpRight size={16}/></button>)}{limit<ranked.length&&<button className="oa-button outline oa-more" onClick={()=>setLimit(n=>n+15)}>Show more producers</button>}</div>
 </section>;
}
function ProductionTrend({rows,unit,selectedYear,onYear}:{rows:ProductionRow[];unit:string;selectedYear:number;onYear:(y:number)=>void}){
 const valid=rows.filter(r=>r.value!==null);if(valid.length<2)return null;
 const first=valid[0],last=valid.at(-1)!,max=Math.max(...valid.map(r=>r.value!)),span=last.year-first.year||1;
 const x=(y:number)=>(y-first.year)/span*280+4,y=(v:number)=>70-v/(max||1)*62;
 let previous=0;const line=valid.map(r=>{const move=r.year!==previous+1;previous=r.year;return `${move?'M':'L'}${x(r.year).toFixed(2)},${y(r.value!).toFixed(2)}`}).join(' ');
 const selected=valid.find(r=>r.year===selectedYear);
 return <div className="oa-production-trend"><strong>How production has changed</strong><svg viewBox="0 0 288 78" role="img" aria-label={`Production from ${first.year} to ${last.year}; latest ${number(last.value!,0)} ${unit}. Gaps are not interpolated.`}><path d="M4,70H284" stroke="var(--oa-line)"/><path d={line} stroke="currentColor" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke"/>{selected&&<circle cx={x(selectedYear)} cy={y(selected.value!)} r="4" fill="currentColor"/>}</svg><div><span>{first.year}</span><button onClick={()=>onYear(last.year)}>Latest: {compact(last.value!)} {unit} · {last.year}</button></div></div>
}
