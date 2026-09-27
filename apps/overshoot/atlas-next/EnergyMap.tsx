'use client';
import {useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Download,Search} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {useMaterialArtifact} from '../material-data';
import WorldMap from '../world/WorldMap';
import type {Country} from '../world/model';
import {Choice,compact,ErrorState,exportCSV,Loading,number} from './common';
import {placeName} from './PlaceContext';

export type EnergySelection={energyMeasure:string;energyPeriod:string;energyRegion:string};
export type EnergyMeasure={id:string;name:string;fuel:string;measure:string;unit:string;factor:number;frequency:string;sourceId:string;description:string;periods:string[];latestPeriod:string;defaultPeriod:string;countries:number;numericRecords:number;coverageByPeriod:Record<string,number>};
export type EnergyRow={country:string;period:string;value:number|null;rawValue:number|string|null;flag:string|null};
type Series={series_id:string;name:string;units:string;source:string;last_updated:string|null};
type EnergyData=EnergyMeasure&{rows:EnergyRow[];series:Record<string,Series>;assessments?:Record<string,string>};
export type EnergyCatalog={retrievedAt:string;refreshMode:string;numericRecords:number;countries:number;middleEast:string[];measures:EnergyMeasure[];sources:Record<string,{publisher:string;name:string;url:string;license:string;termsUrl:string;retrievedAt:string;method:string;limitations:string}>};
const regions=[{id:'all',name:'All countries'},{id:'middle-east',name:'Middle East'},{id:'Africa',name:'Africa'},{id:'Americas',name:'Americas'},{id:'Asia',name:'Asia'},{id:'Europe',name:'Europe'},{id:'Oceania',name:'Oceania'}];
export function energyPeriodLabel(period:string){if(period.length===4)return period;const [year,month]=period.split('-');return new Intl.DateTimeFormat(undefined,{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(+year,+month-1,1)))}
export default function EnergyMap({place,countries,onPlace,onPlaces,selection,onSelection}:{place:string;countries:Country[];onPlace:(id:string)=>void;onPlaces:(id?:string)=>void;selection:EnergySelection;onSelection:(v:Partial<EnergySelection>)=>void}){
 const catalog=useMaterialArtifact<EnergyCatalog>('/data/v13/energy/catalog.json');
 const measure=catalog.data?.measures.find(m=>m.id===selection.energyMeasure)||catalog.data?.measures[0];
 if(catalog.error)return <ErrorState message={catalog.error}/>;
 if(!catalog.data||!measure)return <Loading/>;
 return <EnergyWorkspace key={measure.id} catalog={catalog.data} measure={measure} place={place} countries={countries} onPlace={onPlace} onPlaces={onPlaces} selection={selection} onSelection={onSelection}/>;
}
function EnergyWorkspace({catalog,measure,place,countries,onPlace,onPlaces,selection,onSelection}:{catalog:EnergyCatalog;measure:EnergyMeasure;place:string;countries:Country[];onPlace:(id:string)=>void;onPlaces:(id?:string)=>void;selection:EnergySelection;onSelection:(v:Partial<EnergySelection>)=>void}){
 const data=useMaterialArtifact<EnergyData>('/data/v13/energy/'+measure.id+'.json');
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(12);
 const period=measure.periods.includes(selection.energyPeriod)?selection.energyPeriod:measure.defaultPeriod;
 const region=regions.some(r=>r.id===selection.energyRegion)?selection.energyRegion:'all';
 const ids=useMemo(()=>new Set(countries.filter(c=>region==='all'||(region==='middle-east'?catalog.middleEast.includes(c.id):(c as Country&{region?:string}).region===region)).map(c=>c.id)),[countries,region,catalog.middleEast]);
 const periodRows=useMemo(()=>data.data?.rows.filter(r=>r.period===period)||[],[data.data,period]);
 const ranked=useMemo(()=>periodRows.filter((r):r is EnergyRow&{value:number}=>ids.has(r.country)&&r.value!==null).sort((a,b)=>b.value-a.value),[periodRows,ids]);
 const values=useMemo(()=>new Map(ranked.map(r=>[r.country,r.value])),[ranked]);
 const record=periodRows.find(r=>r.country===place);
 const source=catalog.sources[measure.sourceId],original=data.data?.series[place];
 const history=useMemo(()=>data.data?.rows.filter(r=>r.country===place)||[],[data.data,place]);
 const latest=history.filter(r=>r.value!==null).at(-1);
 const shown=ranked.filter(r=>(placeName(r.country,countries)+' '+r.country).toLowerCase().includes(query.toLowerCase()));
 const missing=countries.filter(c=>ids.has(c.id)&&!values.has(c.id));
 const monthly=measure.frequency==='monthly';
 const thresholds=measure.unit==='tonnes'?[1e5,1e6,1e7,1e8]:measure.unit==='billion m³'?[1,10,50,100]:[1e4,1e5,1e6,1e7];
 function selectMeasure(id:string){onSelection({energyMeasure:id,energyPeriod:''})}
 function inspectCountry(id:string){onPlace(id);document.getElementById('material-map')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
 function download(rows:EnergyRow[],suffix:string){exportCSV(rows.map(r=>({...r,unit:measure.unit,source_id:measure.sourceId,series_id:data.data?.series[r.country]?.series_id,original_unit:data.data?.series[r.country]?.units,source_updated:data.data?.series[r.country]?.last_updated,assessment:r.flag?data.data?.assessments?.[r.flag]||r.flag:null,acquired:source.retrievedAt})),'overshoot-'+measure.id+'-'+suffix+'.csv')}
 return <section className="oa-material-map oa-energy" aria-label="Oil, gas and coal data">
  <div className="oa-map-toolbar"><div className="oa-map-intro"><span className="oa-kicker">PRODUCTION, USE & TRADE</span><h2>Oil, gas & coal.</h2></div><Tabs value={measure.fuel} onValueChange={fuel=>selectMeasure(catalog.measures.find(m=>m.fuel===fuel)!.id)}><TabsList aria-label="Fuel"><TabsTrigger value="oil">Oil</TabsTrigger><TabsTrigger value="gas">Natural gas</TabsTrigger><TabsTrigger value="coal">Coal</TabsTrigger></TabsList></Tabs></div>
  <div className="oa-energy-controls"><Choice label="Measure & source" value={measure.id} onChange={selectMeasure} options={catalog.measures.filter(m=>m.fuel===measure.fuel).map(m=>({id:m.id,name:m.measure+' · '+(m.frequency==='monthly'?'JODI monthly':'EIA annual')}))}/><Choice label={monthly?'Reporting month':'Reporting year'} value={period} onChange={v=>onSelection({energyPeriod:v})} options={measure.periods.map(p=>({id:p,name:energyPeriodLabel(p)}))}/><Choice label="Compare countries in" value={region} onChange={v=>{onSelection({energyRegion:v});setLimit(12)}} options={regions}/></div>
  <p className="oa-layer-scope">{measure.description}</p>
  <div className="oa-energy-coverage" aria-live="polite"><strong>{data.data?ranked.length+' of '+ids.size+' countries / areas':'Loading country coverage…'}</strong><span>with a value in {energyPeriodLabel(period)} · {source.publisher}</span><a href="#energy-coverage" onClick={()=>{const panel=document.getElementById('energy-coverage');if(panel instanceof HTMLDetailsElement)panel.open=true}}>See coverage gaps</a></div>
  {data.error?<ErrorState message={data.error}/>:<div className="oa-map-workspace"><WorldMap flows={[]} sites={[]} countries={countries} place={place} selected="" onFlow={()=>{}} onSite={()=>{}} onPlace={onPlace} color="#996f38" siteView={false} countryLayer={{values,label:measure.name,year:energyPeriodLabel(period),unit:measure.unit,thresholds,loading:!data.data}}/>
   <aside className="oa-map-inspector" aria-label="Selected energy record">{!data.data?<Loading/>:<><span className="oa-kicker">{placeName(place,countries)}</span><h3>{measure.name}</h3><p className="oa-map-value">{record?.value!==null&&record?.value!==undefined?compact(record.value):place==='WORLD'?'Select a country':'Not reported'}<span>{measure.unit} · {energyPeriodLabel(period)}</span></p>
    {record?.value!==null&&record?.value!==undefined&&<p className="oa-small">{number(record.value,measure.unit==='billion m³'?3:0)} {measure.unit}{place==='WORLD'?' · publisher’s world total':''}</p>}
    {record?.flag&&<p className={'oa-energy-quality'+(record.flag!=='1'?' caution':'')}>JODI: {data.data.assessments?.[record.flag]||record.flag}</p>}
    {record?.value===null&&<p className="oa-small">Source marker: <code>{String(record.rawValue)}</code>. No numeric observation is supplied for this period.</p>}
    {!record&&place!=='WORLD'&&<p className="oa-small">This source has no retained record for this country and period.</p>}
    {latest&&record?.value==null&&latest.period!==period&&<button className="oa-text-link" onClick={()=>onSelection({energyPeriod:latest.period})}>Open the latest country value · {energyPeriodLabel(latest.period)}<ArrowRight size={15}/></button>}
    {monthly&&record?.value==null&&<button className="oa-text-link" onClick={()=>selectMeasure('crude-production')}>Check EIA annual production<ArrowRight size={15}/></button>}
    {place!=='WORLD'&&!ids.has(place)&&<button className="oa-text-link" onClick={()=>onSelection({energyRegion:'all'})}>Show this country in the comparison<ArrowRight size={15}/></button>}
    {place==='WORLD'&&region!=='all'&&<p className="oa-small">The figure above, when available, is worldwide. No regional total is calculated from this selection.</p>}
    <div className="oa-connection-list"><span className="oa-kicker">LARGEST AVAILABLE VALUES</span>{ranked.slice(0,4).map(r=><button key={r.country} onClick={()=>onPlace(r.country)} aria-pressed={place===r.country}><span>{placeName(r.country,countries)}<small>{energyPeriodLabel(r.period)}</small></span><b>{compact(r.value)}</b></button>)}</div>
    <button className="oa-text-link" onClick={()=>onPlaces(place)}>Open this place’s material accounts<ArrowRight size={15}/></button>
   </>}</aside>
  </div>}
  <div className="oa-data-source-line"><a href={source.url} target="_blank" rel="noreferrer">{source.name}<ArrowUpRight size={14}/></a><button className="oa-text-link" disabled={!data.data} onClick={()=>download(periodRows.filter(r=>ids.has(r.country)) ,period)}><Download size={15}/>Download this comparison</button></div>
  {!!history.length&&<div className="oa-energy-history"><div className="oa-section-heading"><div><span className="oa-kicker">{placeName(place,countries)}</span><h3>{monthly?'Month by month':'Across the years'}</h3><p>{measure.name} · {measure.unit}</p></div><button className="oa-text-link" onClick={()=>download(history,place)}><Download size={15}/>Download history</button></div><EnergyTrend rows={history} period={period} unit={measure.unit} onPeriod={v=>onSelection({energyPeriod:v})}/></div>}
  <div className="oa-production-register"><div className="oa-section-heading"><div><h3>Compare countries</h3><p>{energyPeriodLabel(period)} · {measure.unit} · one reporting period</p></div><label className="oa-inline-search"><Search size={16}/><input aria-label="Find a country in energy comparison" placeholder="Find a country" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12)}}/></label></div>
   {shown.slice(0,limit).map((r,i)=><button className="oa-source-data-row" key={r.country} onClick={()=>inspectCountry(r.country)} aria-pressed={place===r.country}><span className="oa-rank">{i+1}</span><span>{placeName(r.country,countries)}<small>{r.flag?data.data?.assessments?.[r.flag]:'EIA annual observation'}</small></span><strong>{compact(r.value)}</strong><ArrowUpRight size={16}/></button>)}{!shown.length&&data.data&&<p className="oa-empty-inline">No numeric records match this selection. Try another period or region.</p>}{shown.length>limit&&<button className="oa-button outline oa-more" onClick={()=>setLimit(n=>n+20)}>Show more countries</button>}
  </div>
  <details className="oa-method" id="energy-coverage"><summary>Coverage, missing reports & updates</summary><p>{source.limitations}</p><p>{catalog.refreshMode} Acquired {catalog.retrievedAt}. The newest reporting period retained for this measure is {energyPeriodLabel(measure.latestPeriod)}. A source update date is different from the reporting period.</p><p>{missing.length} selectable countries / areas have no numeric value for this period{region!=='all'?' in this region':''}. Zero values are included only when supplied by the source.</p><div className="oa-energy-missing">{missing.map(c=><button key={c.id} onClick={()=>onPlace(c.id)}>{c.name}</button>)}</div>{region==='middle-east'&&<p>The Middle East comparison is an explicit browsing group of 16 countries and areas, including Iran, Türkiye and Cyprus. It does not change the source’s country definitions or create a regional total.</p>}</details>
  <details className="oa-method"><summary>Definitions & the original source record</summary><p>{source.method}</p><p>{source.license}</p><p>Production, consumption and trade use different product definitions. Reserves are a stock underground; they are not estimated from these production flows. No unreported flows are inferred to make a balance. Historical boundaries and reporting definitions can change; the map uses present-day outlines.</p><a className="oa-text-link" href={source.termsUrl} target="_blank" rel="noreferrer">Publisher’s data and reuse notes<ArrowUpRight size={15}/></a>{record&&<pre>{JSON.stringify({measure:measure.name,sourceId:measure.sourceId,...record,unit:measure.unit,conversionFactor:measure.factor,...original},null,2)}</pre>}</details>
 </section>;
}
function EnergyTrend({rows,period,unit,onPeriod}:{rows:EnergyRow[];period:string;unit:string;onPeriod:(p:string)=>void}){
 const numeric=rows.filter((r):r is EnergyRow&{value:number}=>r.value!==null);
 if(!numeric.length)return <p>No numeric history is available for this country and measure.</p>;
 const max=Math.max(...numeric.map(r=>r.value),0)||1,min=Math.min(...numeric.map(r=>r.value),0),n=rows.length;
 const x=(i:number)=>64+(i/Math.max(1,n-1))*712,y=(v:number)=>24+(max-v)/(max-min)*146;
 let active=false;const path=rows.map((r,i)=>{if(r.value===null){active=false;return ''}const d=(active?'L':'M')+x(i)+','+y(r.value);active=true;return d}).join(' ');
 const index=rows.findIndex(r=>r.period===period),selected=rows[index];
 return <><svg className="oa-history-chart oa-energy-chart" viewBox="0 0 820 212" role="img" aria-label={'Source history, '+energyPeriodLabel(rows[0].period)+' to '+energyPeriodLabel(rows.at(-1)!.period)+'. Missing values break the line. Exact values are in the table below.'}>{[0,max/2,max].map(v=><g key={v}><line x1="64" y1={y(v)} x2="776" y2={y(v)}/><text x="54" y={y(v)+4} textAnchor="end">{compact(v)}</text></g>)}<path d={path} className="oa-history-line"/>{selected?.value!==null&&selected?.value!==undefined&&<circle cx={x(index)} cy={y(selected.value)} r="5" className="oa-history-point"/>}<text x="64" y="201">{energyPeriodLabel(rows[0].period)}</text><text x="776" y="201" textAnchor="end">{energyPeriodLabel(rows.at(-1)!.period)}</text></svg><details className="oa-method"><summary>Read the exact history</summary><div className="oa-energy-history-table"><table><caption>{unit} · select a period to update the map</caption><thead><tr><th scope="col">Period</th><th scope="col">Value</th><th scope="col">Source marker</th></tr></thead><tbody>{rows.slice().reverse().map(r=><tr key={r.period}><th scope="row"><button className="oa-text-link" onClick={()=>onPeriod(r.period)}>{energyPeriodLabel(r.period)}</button></th><td>{r.value===null?'Not reported':number(r.value,3)}</td><td>{r.flag?'Assessment '+r.flag:r.value===null?String(r.rawValue):'—'}</td></tr>)}</tbody></table></div></details></>;
}
