'use client';
import {useMemo,useState} from 'react';
import {geoConicConformal,geoPath} from 'd3-geo';
import type {FeatureCollection} from 'geojson';
import {ArrowUpRight,Download,MapPin} from 'lucide-react';
import {useMaterialArtifact} from '../material-data';
import {exportCSV,number} from './common';

type Region={name:string;glassTonnes:number};
type Glass={depositBeverage:{regions:Region[];regionalWeightTotalTonnes:number;regionalWeightNote:string;source:string;estimatedTonnesRecovered:number}};
const emptyRegions:Region[]=[];
const aliases:Record<string,string>={
 'Bulkley/Nechako':'Bulkley-Nechako','Fraser–Fort George':'Fraser-Fort George','Kitimat–Stikine':'Kitimat-Stikine',
 'Skeena–Queen Charlotte':'North Coast','Capital Regional District':'Capital','Alberni/Clayoquot':'Alberni-Clayoquot',
 'Greater Vancouver':'Metro-Vancouver','Powell River':'qathet','Squamish–Lillooet':'Squamish-Lillooet',
 'Okanagan–Similkameen':'Okanagan-Similkameen','Columbia Shuswap':'Columbia-Shuswap',
 'Thompson–Nicola':'Thompson-Nicola','Comox':'Comox-Strathcona','Strathcona':'Comox-Strathcona'
};
const colors=['#dae5d3','#9bbb9b','#5e997d','#23735d'];
function mappedName(name:string){return aliases[name]||name}
export default function GlassReturnsMap(){
 const data=useMaterialArtifact<Glass>('/data/v29/bc-glass.json');
 const geo=useMaterialArtifact<FeatureCollection>('/data/v10/bc-districts.json');
 const [selected,setSelected]=useState('Capital'),[all,setAll]=useState(false);
 const regions=data.data?.depositBeverage.regions||emptyRegions;
 const rows=useMemo(()=>[...regions].sort((a,b)=>b.glassTonnes-a.glassTonnes),[regions]);
 const combined=useMemo(()=>{const tally=new Map<string,number>();for(const r of regions){const name=mappedName(r.name);tally.set(name,(tally.get(name)||0)+r.glassTonnes)}return tally},[regions]);
 const projection=useMemo(()=>geo.data?geoConicConformal().parallels([50,58]).rotate([126,0]).fitExtent([[22,25],[518,535]],geo.data):null,[geo.data]);
 const path=geoPath(projection);
 const selectedRows=regions.filter(r=>mappedName(r.name)===selected),selectedValue=combined.get(selected);
 const shade=(v?:number)=>v===undefined?'#e0e2d9':colors[[500,2000,5000].filter(t=>v>=t).length];
 const mapped=new Set(geo.data?.features.map(f=>String(f.properties?.district)));
 return <div className="gi-returns" id="bc-glass-returns"><div className="gi-returns-heading"><div><span className="oa-kicker">REPORTED RETURNS · 2025 · GLASS DEPOSIT STREAM ONLY</span><h3>Where were returns reported?</h3><p>Explore 28 Return-It regional observations. The areas show reported return weights, not processors, destination markets or transport lines. Overall recovery also counts some sampled curbside and commercial containers.</p></div>{data.data&&<button onClick={()=>exportCSV(regions.map(r=>({region:r.name,recovered_glass_estimated_tonnes:r.glassTonnes,year:2025,source:data.data!.depositBeverage.source})),'overshoot-bc-deposit-glass-returns-2025.csv')}><Download size={15}/>Export 28 regions</button>}</div>
  {data.error?<p role="alert">Regional return records could not load.</p>:!data.data?<p>Loading the return records…</p>:<><div className="gi-returns-layout"><div className="gi-returns-map"><div className="oa-map-eyebrow"><MapPin size={15}/>British Columbia · estimated glass tonnes returned</div>{geo.error?<p role="alert">Boundary map unavailable. The region list remains available.</p>:!geo.data?<p>Loading reporting-area boundaries…</p>:<svg viewBox="0 0 540 570" role="group" aria-label="BC regional deposit glass returns, 2025">{geo.data.features.map((feature,i)=>{const name=String(feature.properties?.district),value=combined.get(name);return <path key={i} d={path(feature)||''} fill={shade(value)} stroke={selected===name?'#ce823e':'#f6f5ef'} strokeWidth={selected===name?3:1} tabIndex={0} role="button" aria-label={name+': '+(value===undefined?'no matched return observation':number(value,0)+' estimated tonnes returned')} aria-pressed={selected===name} onClick={()=>setSelected(name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(name)}}}><title>{name}: {value===undefined?'Not matched':number(value,0)+' estimated tonnes'}</title></path>})}<text x="24" y="553" fill="#65776b" fontSize="12">Return regions · not destinations</text></svg>}<div className="gi-return-legend">{colors.map((c,i)=><span key={c}><i style={{background:c}}/>{['under 500','500–1,999','2,000–4,999','5,000+'][i]}</span>)}<span><i style={{background:'#e0e2d9'}}/>Unmatched</span></div><p className="oa-small">Comox and Strathcona are combined only for this older boundary map. Northern Rockies appears in the list but has no polygon here. “Skeena–Queen Charlotte” and “Powell River” are matched to their later district names. Boundary joins are display transformations, not new source observations.</p></div><div className="gi-return-detail" aria-live="polite"><span className="oa-kicker">SELECTED REPORTING AREA</span><h4>{selectedRows.map(r=>r.name).join(' + ')||selected}</h4><strong>{selectedValue===undefined?'No matched value':number(selectedValue,0)+' t'}</strong><p>Estimated glass weight returned in 2025{selectedRows.length>1?' · two reported areas combined for display':''}. No local recycling destination is implied.</p><div className="gi-return-list"><h5>Reported regional values</h5>{rows.slice(0,all?rows.length:8).map(r=><button key={r.name} aria-pressed={mappedName(r.name)===selected} onClick={()=>setSelected(mappedName(r.name))}><span>{r.name}{!mapped.has(mappedName(r.name))&&<small> · not mapped</small>}</span><b>{number(r.glassTonnes,0)} t</b><i style={{width:Math.max(1,r.glassTonnes/rows[0].glassTonnes*100)+'%'}}/></button>)}{!all&&<button className="gi-show-all" onClick={()=>setAll(true)}>Show all 28 reported regions</button>}</div></div></div><p className="gi-returns-note">{data.data.depositBeverage.regionalWeightNote} <a href={data.data.depositBeverage.source} target="_blank" rel="noreferrer">Encorp 2025 source table <ArrowUpRight size={13}/></a></p></>}
 </div>;
}
