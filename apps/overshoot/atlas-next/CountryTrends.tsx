'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Download} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {useMaterialArtifact} from '../material-data';
import type {Country} from '../world/model';
import {Choice,compact,exportCSV,Loading,number,Refs} from './common';
import {placeName} from './PlaceContext';
type Row={year:number;estimated:boolean;[key:string]:number|boolean|null};
type History={country:string;rows:Row[]};
const measures={domesticConsumption:{label:'Material use',explanation:'Domestic material consumption counts extraction plus physical imports minus exports. It measures material entering domestic use.'},footprint:{label:'Material footprint',explanation:'The material footprint estimates extraction worldwide associated with a country’s final demand, including raw materials embodied in imported products.'},extraction:{label:'Extraction',explanation:'Biomass, fossil fuels, metal ores and non-metallic minerals physically taken from the environment within the territory.'}};
export default function CountryTrends({place,countries,year:committedYear,onYear}:{place:string;countries:Country[];year:string;onYear:(v:string)=>void}){
 const svgRef=useRef<SVGSVGElement>(null),[plotWidth,setPlotWidth]=useState(820);
 const [year,setYear]=useState(committedYear);
 useEffect(()=>setYear(committedYear),[committedYear]);
 const [measure,setMeasure]=useState<keyof typeof measures>('domesticConsumption'),[basis,setBasis]=useState('person'),[compare,setCompare]=useState('WORLD');
 const comparison=compare===place?(place==='WORLD'?'USA':'WORLD'):compare;
 const primary=useMaterialArtifact<History>('/data/v12/history/'+place+'.json'),secondary=useMaterialArtifact<History>('/data/v12/history/'+comparison+'.json');
 useEffect(()=>{const svg=svgRef.current;if(!svg)return;const resize=()=>setPlotWidth(Math.max(260,Math.min(820,Math.round(svg.clientWidth))));resize();if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(resize);observer.observe(svg);return()=>observer.disconnect()},[!!primary.data]);
 const field=measure+(basis==='person'?'PerCapita':'');
 const a=primary.data?.rows||[],b=secondary.data?.rows||[];
 const current=a.find(r=>r.year===+year),other=b.find(r=>r.year===+year);
 const numeric=(r:Row)=>typeof r[field]==='number'&&Number.isFinite(r[field]);
 const chart=useMemo(()=>{
  const values=[...a,...b].filter(numeric).map(r=>r[field] as number);if(!values.length)return null;
  const max=Math.max(...values,0)||1,min=Math.min(...values,0),height=190;
  const x=(y:number)=>56+(y-1970)/54*(plotWidth-104),y=(v:number)=>24+(max-v)/(max-min)*height;
  const path=(rows:Row[])=>{let active=false;return rows.map(r=>{if(!numeric(r)){active=false;return ''}const p=(active?'L':'M')+x(r.year).toFixed(2)+','+y(r[field] as number).toFixed(2);active=true;return p}).join(' ')};
  return {max,min,x,y,pathA:path(a),pathB:path(b),ticks:[max,min+(max-min)/2,min]};
 },[primary.data,secondary.data,field,plotWidth]);
 const format=(v:number|boolean|null|undefined)=>typeof v==='number'?(basis==='person'?number(v,1):compact(v)):'Not available';
 const first=a.find(numeric),last=a.slice().reverse().find(numeric);
 const change=first&&last&&Number(first[field])>0?(Number(last[field])/Number(first[field])-1)*100:null;
 if(primary.error)return <section className="oa-history"><h2>History unavailable for this place.</h2><p>No national material account is retained for this selection. The other available records remain accessible below.</p></section>;
 return <section className="oa-history" id="place-history" aria-label="Material history and country comparison">
  <div className="oa-depth-heading"><div><span className="oa-kicker">1970–2024 · MATERIAL ACCOUNTS</span><h2>How has it changed?</h2><p>Compare the scale of material use over time. Switch to a per-person view to account for population.</p></div><Tabs value={basis} onValueChange={setBasis}><TabsList aria-label="History measurement basis"><TabsTrigger value="person">Per person</TabsTrigger><TabsTrigger value="total">Total tonnes</TabsTrigger></TabsList></Tabs></div>
  <div className="oa-history-controls"><Choice label="Track a measure" value={measure} onChange={v=>setMeasure(v as keyof typeof measures)} options={Object.entries(measures).map(([id,m])=>({id,name:m.label}))}/><Choice label="Compare with" value={comparison} onChange={setCompare} options={[{id:'WORLD',name:'Worldwide average / total'},...countries.map(c=>({id:c.id,name:c.name}))].filter(c=>c.id!==place)}/></div>
  {!primary.data?<Loading/>:chart?<>
   <div className="oa-history-values" aria-live="polite"><div><span><i/>{placeName(place,countries)}</span><strong>{format(current?.[field])}<small>{basis==='person'?'t / person':'t'} · {year}</small></strong></div><div><span><i/>{placeName(comparison,countries)}</span><strong>{format(other?.[field])}<small>{basis==='person'?'t / person':'t'} · {year}</small></strong></div></div>
   <svg ref={svgRef} className="oa-history-chart" viewBox={`0 0 ${plotWidth} 260`} role="img" aria-label={`${measures[measure].label} for ${placeName(place,countries)} and ${placeName(comparison,countries)}, 1970 to 2024. Use the year slider below to read exact values.`}>
    <rect x={chart.x(2022)} y="18" width={chart.x(2024)-chart.x(2022)} height="202" className="oa-estimate-shade"/>
    {chart.ticks.map((v,i)=><g key={i}><line x1="56" y1={chart.y(v)} x2={plotWidth-48} y2={chart.y(v)}/><text x="46" y={chart.y(v)+4} textAnchor="end">{basis==='person'?number(v,0):compact(v)}</text></g>)}
    {(plotWidth<560?[1970,1995,2024]:[1970,1980,1990,2000,2010,2020,2024]).map(y=><text key={y} x={chart.x(y)} y="243" textAnchor="middle">{y}</text>)}
    <path d={chart.pathB} className="oa-history-line comparison"/><path d={chart.pathA} className="oa-history-line"/>
    <line x1={chart.x(+year)} x2={chart.x(+year)} y1="18" y2="220" className="oa-year-guide"/>
    {typeof current?.[field]==='number'&&<circle cx={chart.x(+year)} cy={chart.y(current[field] as number)} r="5" className="oa-history-point"/>}
    {typeof other?.[field]==='number'&&<circle cx={chart.x(+year)} cy={chart.y(other[field] as number)} r="5" className="oa-history-point comparison"/>}
   </svg>
   <label className="oa-year-scrubber"><span>Read a year <strong>{year}</strong></span><input type="range" aria-label="History year" min="1970" max="2024" value={year} onChange={e=>setYear(e.target.value)} onPointerUp={e=>onYear(e.currentTarget.value)} onKeyUp={e=>onYear(e.currentTarget.value)} onBlur={e=>{if(e.currentTarget.value!==committedYear)onYear(e.currentTarget.value)}}/><small>1970<span>2024</span></small></label>
   <div className="oa-trend-explanation"><p>{measures[measure].explanation}</p>{change!==null&&first&&last&&<p><strong>{placeName(place,countries)}: {change>=0?'+':''}{number(change,0)}%</strong> between {first.year} and {last.year} for this measure{basis==='person'?' per person':''}. The source flags 2022–2024 as estimates.</p>}</div>
   {secondary.error&&<p className="oa-small">The selected comparison has no retained account. Choose another country.</p>}
  </>:<p className="oa-empty-inline">No values are available for this measure. Try material use or extraction.</p>}
  <div className="oa-data-source-line"><Refs ids={['irp']}/><button className="oa-text-link" disabled={!a.length} onClick={()=>exportCSV(a.map(r=>({country:place,...r,source_id:'irp-resource-accounts-2026',unit:'tonnes; per-capita fields in tonnes/person'})),'overshoot-history-'+place+'.csv')}><Download size={15}/>Download history</button></div>
  <details className="oa-method"><summary>How to read this comparison</summary><p>Material use and material footprint answer different questions. The footprint includes upstream extraction outside the consuming country; it is model-based. It is not added to domestic material consumption. Gaps remain empty and negative source values are preserved.</p><p>The series has 55 annual observations where available. This is a dated source release, not a live measurement. Country and global totals may not reconcile exactly across accounting concepts.</p>{current&&<pre>{JSON.stringify(current,null,2)}</pre>}</details>
 </section>
}
