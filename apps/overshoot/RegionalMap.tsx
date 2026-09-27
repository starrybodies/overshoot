'use client';
/** Site-level adapter; only mount after a validated, licensed site snapshot exists. */
import {useEffect,useRef} from 'react';
import {Map as MapLibreMap} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {FeatureCollection} from 'geojson';
export default function RegionalMap({features,center,sourceId,onSelect}:{features:FeatureCollection;center:[number,number];sourceId:string;onSelect:(id:string)=>void}){
 const element=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!element.current)return;const map=new MapLibreMap({container:element.current,center,zoom:9,style:{version:8,sources:{sites:{type:'geojson',data:features}},layers:[{id:'background',type:'background',paint:{'background-color':'#141c16'}},{id:'sites',type:'circle',source:'sites',paint:{'circle-radius':6,'circle-color':'#e2bd79','circle-stroke-width':2,'circle-stroke-color':'#151b17'}}]},attributionControl:false});map.on('click','sites',event=>{const id=event.features?.[0]?.properties?.id;if(id)onSelect(String(id))});return()=>map.remove()},[features,center,sourceId,onSelect]);
 return <div ref={element} style={{position:'absolute',inset:0}} aria-label={`Regional site map. Provenance: ${sourceId}`}/>;
}
