'use client';
import {useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,MapPin} from 'lucide-react';
import {useMaterialArtifact} from '../material-data';
import {facilityCatalogPath,facilityPins,type FacilityIndex,type FacilityCatalog,type FacilityPin} from '@/packages/material-world/model';
import WorldMap from '../world/WorldMap';
import type {Country,SiteFeature} from '../world/model';
import type {Profile} from './data';
import type {SiteKind} from './FacilitiesPage';
import {materialSiteLayers} from './materialSites';
import {Choice,ErrorState,Loading,number} from './common';
import {placeName} from './PlaceContext';
export type OpenMaterialSites=(selection?:{kind?:SiteKind;siteType?:string;site?:string;place?:string})=>void;
const empty:FacilityPin[]=[];
export default function MaterialSitesMap({profile,place,countries,onPlace,onSites}:{profile:Profile;place:string;countries:Country[];onPlace:(p:string)=>void;onSites:OpenMaterialSites}){
 const layers=materialSiteLayers[profile.id]||[];
 const [choice,setChoice]=useState('0');
 const layer=layers[Number(choice)]||layers[0];
 const catalog=useMaterialArtifact<FacilityCatalog>(facilityCatalogPath);
 const country=['BC','SSI'].includes(place)?'CAN':place;
 const regional=country!==place;
 const dataset=catalog.data?.datasets[layer.kind];
 const entry=country==='WORLD'?dataset?.world:dataset?.countries[country];
 const data=useMaterialArtifact<FacilityIndex>(entry?.index||null);
 const rows=(data.data?Array.from(facilityPins(data.data)):empty).filter(r=>!layer.type||r.type===layer.type);
 const features=useMemo<SiteFeature[]>(()=>rows.map(r=>({type:'Feature',geometry:{type:'Point',coordinates:r.coordinates},properties:{id:r.id,name:r.name,type:r.type,country:r.country,source_id:r.source,year:r.year,value:null,unit:'',metric:'Source location',basis:r.basis}})),[rows]);
 const loading=!catalog.data||!!entry&&!data.data&&!data.error;
 const leadingCountries=useMemo(()=>{const counts=new Map<string,number>();for(const r of rows)counts.set(r.country,(counts.get(r.country)||0)+1);return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,3)},[rows]);
 const globalCount=layer.type?dataset?.world?.types[layer.type]||0:dataset?.count||0;
 function open(r:FacilityPin){onSites({kind:layer.kind,siteType:layer.type,place:r.country,site:r.id})}
 return <section className="oa-material-map oa-site-map" aria-label="Material facilities">
  <div className="oa-map-toolbar"><div className="oa-map-intro"><span className="oa-kicker">PHYSICAL LOCATIONS</span><h2>{layer.label}</h2></div>{layers.length>1&&<Choice label="Supply-chain stage" value={choice} onChange={setChoice} options={layers.map((l,i)=>({id:String(i),name:l.label}))}/>}</div>
  <p className="oa-layer-scope">{layer.explanation}{regional&&<> This view covers Canada; these sources do not support a complete inventory for {placeName(place,countries)}.</>}</p>
  {data.error||catalog.error?<ErrorState message={data.error||catalog.error!}/>:<div className="oa-map-workspace"><WorldMap flows={[]} sites={features} countries={countries} place={country} selected="" onFlow={()=>{}} onSite={s=>{const r=rows.find(r=>r.id===s.properties.id);if(r)open(r)}} onPlace={onPlace} color={profile.color} siteView/>
   <aside className="oa-map-inspector"><span className="oa-kicker">{placeName(country,countries)}</span><h3>{layer.label}</h3>{loading?<Loading/>:<><p className="oa-map-value">{number(rows.length,0)}<span>source locations in this view</span></p>{rows.length?<p className="oa-small">Select a marker for coordinates, source evidence and the original record. Close locations cluster together until you zoom in.</p>:<p className="oa-small">This snapshot has no matching records here. That does not establish that no facilities exist.</p>}{place==='WORLD'&&leadingCountries.length>0&&<div className="oa-connection-list"><span className="oa-kicker">MOST LOCATIONS IN THIS SOURCE</span>{leadingCountries.map(([id,count])=><button key={id} onClick={()=>onPlace(id)}><span>{placeName(id,countries)}</span><b>{number(count,0)}</b></button>)}<p className="oa-small">Record counts describe coverage, not production or market share.</p></div>}<div className="oa-connection-list"><span className="oa-kicker">{rows.length?'INSPECT A LOCATION':'CONTINUE YOUR SEARCH'}</span>{rows.slice(0,place==='WORLD'?2:4).map(r=><button key={r.id} onClick={()=>open(r)}><span>{r.name}<small>{placeName(r.country,countries)} · {r.year||'Source dates vary'}</small></span><ArrowUpRight size={15}/></button>)}</div><button className="oa-button outline" onClick={()=>onSites({kind:layer.kind,siteType:layer.type,place:country})}><MapPin size={16}/>Search these sites</button>{place!=='WORLD'&&<button className="oa-text-link" onClick={()=>onPlace('WORLD')}>See {number(globalCount,0)} worldwide<ArrowRight size={15}/></button>}</>}</aside>
  </div>}
  <div className="oa-data-source-line"><a href={profile.id==='garbage'?'/data':'https://climatetrace.org/data'} target={profile.id==='garbage'?undefined:'_blank'} rel="noreferrer">{profile.id==='garbage'?'Source inventory & coverage':'Climate TRACE · 2025 point-source inventory'}<ArrowUpRight size={14}/></a><span>Locations identify operations. They do not establish supplier-to-customer routes.</span></div>
 </section>
}
