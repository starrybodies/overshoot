'use client';
import {ArrowUpRight} from 'lucide-react';
import type {CountryLayer} from '../world/WorldMap';
import type {Country} from '../world/model';
import {placeName} from './PlaceContext';
import './capacity-evidence.css';

export type CapacityRow={country:string;sourceCountry:string;plants:number;cementMtpa?:number;clinkerMtpa?:number;capacityMtpa?:number|null;bofMtpa?:number|null;eafMtpa?:number|null;otherMtpa?:number|null};
export type CapacitySnapshot={material:string;edition:string;source:string;unit:string;scope:string;world:CapacityRow;rows:CapacityRow[];license:string;licenseUrl:string;sourceTables:Record<string,{url:string;sha256:string;rows:number}>};
const concrete=[['cementMtpa','Cement capacity','Mtpa'],['clinkerMtpa','Clinker capacity','Mtpa'],['plants','Operating plants','plants']] as const;
const steel=[['capacityMtpa','Steel capacity','Mtpa'],['bofMtpa','Basic oxygen','Mtpa'],['eafMtpa','Electric arc','Mtpa'],['plants','Operating plants','plants']] as const;
export function capacityOptions(material:string){return material==='steel'?steel:concrete}
export function capacityLayer(data:CapacitySnapshot,metric:string):CountryLayer{
 const option=capacityOptions(data.material).find(o=>o[0]===metric)||capacityOptions(data.material)[0];
 return {values:new Map(data.rows.flatMap(r=>{const v=r[option[0] as keyof CapacityRow];return typeof v==='number'&&Number.isFinite(v)?[[r.country,v] as [string,number]]:[]})),label:option[1]+' · '+data.edition,unit:option[2],year:data.edition.includes('July')?'Jul 2026':'Jun 2026',thresholds:option[2]==='plants'?[1,5,20,80]:[1,5,25,100]};
}
const format=(n:number,decimals=1)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:decimals}).format(n);
export function CapacityEvidence({data,metric,onMetric,place,countries,onPlace}:{data:CapacitySnapshot;metric:string;onMetric:(m:string)=>void;place:string;countries:Country[];onPlace:(p:string)=>void}){
 const options=capacityOptions(data.material),selected=place==='WORLD'?data.world:data.rows.find(r=>r.country===(place==='BC'||place==='SSI'?'CAN':place));
 const leaders=[...data.rows].filter(r=>typeof r[options[0][0] as keyof CapacityRow]==='number').sort((a,b)=>Number(b[options[0][0] as keyof CapacityRow])-Number(a[options[0][0] as keyof CapacityRow])).slice(0,5);
 return <div className="oj-capacity"><div className="oj-capacity-heading"><div><span className="oa-kicker">REPORTED INDUSTRIAL CAPACITY · {data.edition}</span><h3>{data.material==='steel'?'Where crude steel can be made':'Where cement and clinker can be made'}</h3><p>{data.material==='steel'?'Rated crude steelmaking capacity at GEM’s tracked operating plants. Basic oxygen and electric arc are production methods.':'Rated capacity at GEM’s tracked operating cement plants. Clinker is an intermediate material made in kilns; grinding plants can make cement without making clinker.'}</p></div><strong>{data.material==='steel'?data.rows.length+' areas with plant counts':data.rows.length+' countries and areas'}</strong></div>
 <div className="oj-capacity-metrics" role="group" aria-label="Color the country map by">{options.map(([id,label,unit])=>{const v=selected?.[id as keyof CapacityRow];return <button key={id} aria-pressed={metric===id} onClick={()=>onMetric(id)}><span>{label}</span><b>{typeof v==='number'?format(v,unit==='plants'?0:1):'No figure'}</b><small>{unit} · {place==='WORLD'?'tracked worldwide':placeName(place,countries)}</small></button>})}</div>
 <div className="oj-capacity-places"><span>Explore:</span>{leaders.map(r=><button key={r.country} onClick={()=>onPlace(r.country)} aria-pressed={place===r.country}>{placeName(r.country,countries)}</button>)}{place!=='WORLD'&&<button onClick={()=>onPlace('WORLD')}>World</button>}</div>
 <p className="oj-capacity-note">{data.scope} The country shading is GEM’s aggregate; the point markers are a separate Climate TRACE inventory and must not be summed with it. <a href={data.source} target="_blank" rel="noreferrer">GEM methodology <ArrowUpRight size={13}/></a> <a href={data.material==='steel'?'/data/v35/steel-country.json':'/data/v35/cement-country.json'} target="_blank" rel="noreferrer">Download these country rows <ArrowUpRight size={13}/></a></p></div>
}
