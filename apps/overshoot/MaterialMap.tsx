'use client';
import {useMemo,useState} from 'react';
import {geoEqualEarth,geoPath} from 'd3-geo';
import type {FeatureCollection,LineString} from 'geojson';
import {Button} from '@/components/ui/button';
import {useMaterialArtifact} from './material-data';
export interface QuantityFlow {id:string;origin:string;destination:string;originLabel:string;destinationLabel:string;quantity:number;unit:string;estimated:boolean;record:Record<string,unknown>}
export interface MapCountry {id:string;name:string;numeric:string;center?:[number,number]}
export default function MaterialMap({flows,selected,onSelect,regional}:{flows:QuantityFlow[];selected:string;onSelect:(id:string)=>void;regional:boolean}){
 const {data:geo}=useMaterialArtifact<FeatureCollection>('/data/v2/geography.json'),{data:countries}=useMaterialArtifact<MapCountry[]>('/data/v2/countries.json');
 const [longitude,setLongitude]=useState(regional?160:0);
 const projection=useMemo(()=>geoEqualEarth().rotate([-longitude,0]).fitExtent([[20,15],[980,475]],{type:'Sphere'}),[longitude]);const path=geoPath(projection);
 const coords=useMemo(()=>new Map(countries?.filter(c=>c.center).map(c=>[c.id,c.center!])),[countries]);
 // This representative point locates the province, never a mine, port or household.
 const mapped=flows.flatMap(f=>{const a=regional?[-125,54] as [number,number]:coords.get(f.origin),b=coords.get(f.destination);return a&&b&&f.quantity>0?[{...f,a,b}]:[]});
 const max=Math.max(1,...mapped.map(f=>f.quantity));
 return <section className="material-map" aria-label="Geographic view of selected material flows">
 <div className="material-map-toolbar"><span>{regional?'British Columbia → last-known destination':'Country-to-country observations'}</span><div><Button variant="ghost" aria-label="Rotate map west" onClick={()=>setLongitude(v=>v-35)}>←</Button><Button variant="ghost" onClick={()=>setLongitude(regional?160:0)}>Reset</Button><Button variant="ghost" aria-label="Rotate map east" onClick={()=>setLongitude(v=>v+35)}>→</Button></div></div>
 <svg viewBox="0 0 1000 490" role="img" aria-label={`${mapped.length} mapped flows. Select a destination in the accessible list below to highlight it.`}>
 <path d={path({type:'Sphere'})||''} fill="#142839" stroke="#315164"/>
 {geo?.features.map((f,i)=><path key={i} d={path(f)||''} fill="#244355" stroke="#497080" strokeWidth=".5"/>)}
 {mapped.map(f=><path key={f.id} d={path({type:'LineString',coordinates:[f.a,f.b]} as LineString)||''} fill="none" stroke={selected===f.id?'#efffa8':regional?'#ffae71':'#73e6cc'} opacity={selected&&selected!==f.id?.35:.85} strokeWidth={1+8*Math.sqrt(f.quantity/max)} strokeDasharray={f.estimated?'4 5':undefined} onClick={()=>onSelect(f.id)}><title>{f.originLabel} to {f.destinationLabel}: {f.quantity.toLocaleString()} {f.unit}{f.estimated?' (estimated)':''}</title></path>)}
 {selected&&mapped.filter(f=>f.id===selected).map(f=>{const p=projection(f.b);return p?<circle key={f.id} cx={p[0]} cy={p[1]} r="6" fill="#efffa8" stroke="#101c2c" strokeWidth="2"/>:null})}
 </svg>
 <p>Line width scales with the selected quantity. Lines connect representative places; they are not transport routes. {regional?'The BC point represents the province, not an extraction site. ':''}{flows.length>mapped.length?`${flows.length-mapped.length} records have no mapped geometry or positive quantity; all remain in the list.`:''}</p>
 </section>
}
