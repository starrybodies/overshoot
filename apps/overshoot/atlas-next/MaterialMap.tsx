'use client';
import {useState} from 'react';
import {tradeBasisLabels} from '@/packages/material-world/trade';
import {ArrowRight,ArrowUpRight,MapPin} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import WorldMap from '../world/WorldMap';
import type {Country} from '../world/model';
import {Choice,ErrorState,Loading,Refs,number,compact} from './common';
import {formNames,type Profile} from './data';
import {useTradeEvidence} from './useTradeEvidence';
import {materialGuides} from './evidenceGuide';
import {placeName} from './PlaceContext';
type Props={profile:Profile;place:string;countries:Country[];form:string;direction:'in'|'out';onChange:(p:{form?:string;direction?:'in'|'out';place?:string})=>void;onTrade:()=>void;onPlaces:(place?:string,waste?:boolean)=>void;onStage:(stage:number)=>void};
export default function MaterialMap({profile,place,countries,form,direction,onChange,onTrade,onPlaces,onStage}:Props){
 const [selectedId,setSelectedId]=useState('');
 const {flows,loading,error,product,bc,world,disagreement,reportingBasis,reporterCount}=useTradeEvidence({profile,place,form,direction,countries});
 const selected=flows.find(f=>f.id===selectedId)||flows[0];
 const guide=materialGuides[profile.id];
 const total=flows.reduce((sum,f)=>sum+f.amount,0);
 const formLabel=bc&&product?product.commodity:formNames[form]||profile.name;
 const peer=selected?(direction==='in'?selected.origin:selected.destination):'';
 return <section className="oa-material-map" aria-label="Material geography">
  <div className="oa-map-toolbar"><div className="oa-map-intro"><span className="oa-kicker">01 / FOLLOW THE MATERIAL</span><h2>Where does it move?</h2></div>{profile.codes.length>0&&<Choice label="Material form" value={form} onChange={form=>onChange({form})} options={profile.codes.map(c=>({id:c,name:formNames[c]||c}))}/>}<div className="oa-direction-control"><span>{loading?'Loading trade evidence…':tradeBasisLabels[reportingBasis]+' · 2024'}</span>{!world&&<Tabs value={direction} onValueChange={v=>onChange({direction:v as 'in'|'out'})}><TabsList aria-label="Map trade direction"><TabsTrigger value="in" disabled={world}>Comes from</TabsTrigger><TabsTrigger value="out">Goes to</TabsTrigger></TabsList></Tabs>}{world&&<strong className="oa-direction-label">Trade between countries</strong>}</div></div>
  <div className="oa-map-workspace">
   <div className="oa-map-canvas"><WorldMap flows={flows} sites={[]} countries={countries} place={bc?'BC':place} selected={selected?.id||''} onFlow={f=>setSelectedId(f.id)} onSite={()=>{}} onPlace={place=>onChange({place})} color={profile.color} siteView={false}/><div className="oa-map-context"><MapPin size={16}/><span>{world?'Selected reporting countries':placeName(place,countries)}{bc?' · province-level export records':' · '+(loading?'Loading trade evidence…':tradeBasisLabels[reportingBasis])}{place==='SSI'?' · no island-level attribution':''}</span>{place!=='WORLD'&&<button className="oa-text-link" onClick={()=>onChange({place:'WORLD',direction:'out'})}>World view<ArrowUpRight size={14}/></button>}</div></div>
   <aside className="oa-map-inspector" aria-label="Selected connection">
    {error?<ErrorState message={error}/>:loading?<Loading/>:selected?<>
     <span className="oa-kicker">{selected.id===flows[0]?.id?'LARGEST AVAILABLE CONNECTION':'SELECTED CONNECTION'}</span><h3>{selected.originLabel}<ArrowRight size={20}/>{selected.destinationLabel}</h3>
     <p className="oa-map-value">{compact(selected.amount)}<span>{selected.unit} · {selected.year}</span></p>
     <p className="oa-record-description">{formLabel}</p>
     <div className="oa-connection-list" aria-label="Largest connections">{flows.slice(0,3).map(f=><button key={f.id} aria-pressed={f.id===selected.id} onClick={()=>setSelectedId(f.id)}><span>{world?f.originLabel+' → '+f.destinationLabel:direction==='in'?f.originLabel:f.destinationLabel}</span><b>{compact(f.amount)}</b></button>)}</div>
     <p className="oa-small">{number(selected.amount/total*100)}% of the quantity in this selection · {flows.length} records.</p>
     <details className="oa-record-detail"><summary>Source and measurement</summary><p>{selected.basis}</p><p>{bc?'The province of production and last-known foreign destination are reported. Interprovincial trade is excluded.':String(selected.record.reported_flow)==='M'?'This is the receiving country’s import declaration.':'This is an exporter’s declaration. This may be a partner’s export declaration rather than the destination’s import report.'}</p><p>A trading partner is recorded. The final factory, product and treatment outcome are not identified by this entry.</p><strong>{number(selected.amount,3)} {selected.unit}</strong><a className="oa-text-link" href={selected.sourceUrl} target="_blank" rel="noreferrer">Primary source<ArrowUpRight size={14}/></a><details><summary>Original record</summary><pre>{JSON.stringify(selected.record,null,2)}</pre></details></details>
     {disagreement&&selected.origin===disagreement.origin&&selected.destination===disagreement.destination&&<div className="oa-map-source-check"><strong>Two reporters, different weights</strong><p>Chile’s export record: {compact(disagreement.exporter_reported_tonnes)} t. China’s import record: {compact(disagreement.importer_reported_tonnes)} t. The difference is unresolved.</p><button className="oa-text-link" onClick={()=>onChange({place:direction==='in'?'CHL':'CHN',direction:direction==='in'?'out':'in'})}>Compare the other declaration<ArrowRight size={14}/></button></div>}
     <button className="oa-button" onClick={onTrade}>Open all trade records<ArrowRight size={16}/></button>
     {countries.some(c=>c.id===peer)&&<button className="oa-text-link" onClick={()=>onPlaces(peer)}>Understand {direction==='in'?selected.originLabel:selected.destinationLabel}<ArrowRight size={15}/></button>}
    </>:<><span className="oa-kicker">NO MATCHING RECORDS</span><h3>{bc&&direction==='in'?'This snapshot retains BC exports':'No trade records in this selection'}</h3><p>{guide.boundary}</p><p className="oa-small">This is a gap in bilateral trade coverage. Production and facility data are separate.</p>{place!=='WORLD'&&<button className="oa-button" onClick={()=>onChange({place:'WORLD',direction:'out'})}>Check worldwide records<ArrowRight size={16}/></button>}<button className="oa-text-link" onClick={()=>onPlaces()}>See material & waste accounts<ArrowRight size={16}/></button></>}
   </aside>
  </div>
  <div className="oa-read-map"><div><span className="oa-kicker">WHAT MOVES</span><p>{guide.moving}</p></div><div><span className="oa-kicker">WHAT HAPPENS NEXT</span><p>{guide.next}</p><button className="oa-text-link" onClick={()=>onStage(guide.stage)}>See the physical process<ArrowRight size={15}/></button></div></div>
  <details className="oa-method oa-map-method"><summary>How to read this map</summary><p>{guide.boundary}</p><p>The map shows statistical connections between countries or regions. The process explains how this material can change. Named operations below add documented examples; they are only connected to one another when an operator or another source establishes that link.</p><p>Line widths compare quantities within the selected material form and unit. Curves connect geographic anchors and do not show a ship’s course, a port or the path taken by an individual object. The interactive map shows up to 200 connections; the atlas shows 60. Trade contains the full available list.</p><Refs ids={['comtrade',...profile.steps[guide.stage].refs]}/></details>
 </section>
}
