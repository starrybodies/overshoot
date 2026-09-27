'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {DeckGL} from '@deck.gl/react';
import {_GlobeView as GlobeView} from '@deck.gl/core';
import {GeoJsonLayer,SolidPolygonLayer,ArcLayer,ScatterplotLayer,TextLayer} from '@deck.gl/layers';
import {geoInterpolate} from 'd3-geo';
import type {Feature,FeatureCollection,Geometry} from 'geojson';
import type {MappedFlow} from './Globe';
import type {SiteFeature} from './data';
import {toDeckZoom,fromDeckZoom,type Camera} from './camera';
export type GlobeFeature=Feature<Geometry,{name:string;numeric:string;center:[number,number]}>;
type Props={geo:FeatureCollection<Geometry,GlobeFeature['properties']>;grid:Feature|null;view:Camera;width:number;height:number;color:(f:GlobeFeature)=>[number,number,number,number];countryId:(f:GlobeFeature)=>string|undefined;selected:string;layerKey:string;flows:MappedFlow[];sites:SiteFeature[];siteType:string;selectedSite:string;motionPaused:boolean;onInteraction:()=>void;onSite:(f:SiteFeature)=>void;onFlow:(f:MappedFlow)=>void;onCamera:(v:Camera,commit:boolean)=>void;onCountry:(id:string,center:[number,number])=>void;onHover:(f:GlobeFeature|null,x:number,y:number)=>void;onReady:()=>void;onFailure:()=>void};
export default function WebGLGlobe(props:Props){
 const {geo,grid,view,width,height,color,countryId,selected,layerKey,flows,sites,siteType,selectedSite,motionPaused,onSite,onFlow,onCamera,onCountry,onHover,onReady,onFailure,onInteraction}=props;
 // Keep the controller alive across layer and camera updates.
 const globeView=useMemo(()=>new GlobeView({id:'planet',resolution:5,controller:{dragRotate:false,inertia:180,scrollZoom:{speed:.005,smooth:true},touchZoom:true}}),[]);
 const latest=useRef(props);latest.current=props;
 const [phase,setPhase]=useState(0);
 const paths=useMemo(()=>flows.map(f=>geoInterpolate(f.start,f.end)),[flows]);
 useEffect(()=>{if(motionPaused||!flows.length)return;const preference=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0;
  const tick=(now:number)=>{if(now-last>50){last=now;setPhase((now/10000)%1)}if(!document.hidden&&!preference.matches)frame=requestAnimationFrame(tick)};
  const resume=()=>{cancelAnimationFrame(frame);if(!document.hidden&&!preference.matches)frame=requestAnimationFrame(tick)};resume();document.addEventListener('visibilitychange',resume);preference.addEventListener('change',resume);return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);preference.removeEventListener('change',resume)};
 },[motionPaused,flows.length]);
 const siteMax=Math.max(1,...sites.map(f=>f.properties.value||0));
 const fixedLayers=useMemo(()=>[
  new SolidPolygonLayer({id:'ocean',data:[[[-180,90],[0,90],[180,90],[180,-90],[0,-90],[-180,-90]]],getPolygon:d=>d as [number,number][],getFillColor:[17,39,59],pickable:false}),
  ...(grid?[new GeoJsonLayer({id:'graticule',data:grid,getLineColor:[114,160,198,70],getLineWidth:1,lineWidthUnits:'pixels',pickable:false})]:[]),
  new GeoJsonLayer({id:'countries',data:geo,filled:true,stroked:true,getFillColor:f=>color(f as GlobeFeature),getLineColor:f=>countryId(f as GlobeFeature)===selected?[255,230,170,255]:[156,190,222,100],getLineWidth:f=>countryId(f as GlobeFeature)===selected?1.8:.6,lineWidthUnits:'pixels',pickable:true,autoHighlight:true,highlightColor:[210,228,252,70],updateTriggers:{getFillColor:[layerKey],getLineColor:[selected],getLineWidth:[selected]},onClick:info=>{const f=info.object as GlobeFeature;const id=f&&latest.current.countryId(f);if(id)latest.current.onCountry(id,f.properties.center)},onHover:info=>latest.current.onHover(info.object as GlobeFeature|null,info.x,info.y)}),
  new ArcLayer<MappedFlow>({id:'reported-trade',data:flows,greatCircle:true,numSegments:70,getSourcePosition:f=>f.start,getTargetPosition:f=>f.end,getSourceColor:f=>f.type==='raw'?[255,209,108,210]:[106,229,193,210],getTargetColor:f=>f.type==='raw'?[255,209,108,210]:[106,229,193,210],getWidth:f=>f.width,getHeight:0,widthUnits:'pixels',pickable:true,onClick:info=>{if(info.object)latest.current.onFlow(info.object)}}),
  new ScatterplotLayer<SiteFeature>({id:'material-sites',data:sites,getPosition:f=>f.geometry.coordinates as [number,number],radiusUnits:'pixels',getRadius:f=>2+7*Math.sqrt((f.properties.value||0)/siteMax),getFillColor:siteType==='river-plastic'?[145,191,255,220]:siteType==='landfill'?[255,146,123,220]:siteType==='mining-area'?[255,209,108,220]:[106,229,193,220],stroked:true,getLineColor:f=>f.properties.id===selectedSite?[255,255,255,255]:[19,36,59,210],getLineWidth:f=>f.properties.id===selectedSite?2:1,lineWidthUnits:'pixels',pickable:true,updateTriggers:{getLineColor:[selectedSite],getRadius:[siteMax],getFillColor:[siteType]},onClick:info=>{if(info.object)latest.current.onSite(info.object)}})
 ],[geo,grid,layerKey,selected,flows,sites,siteType,selectedSite,siteMax]);
 const markers=useMemo(()=>paths.map((path,i)=>({point:[...path((phase+i*.173)%1),1000] as [number,number,number],radius:Math.max(1.8,flows[i].width*.65)})),[paths,phase,flows]);
 const endpointLabels=flows.length===1?[{point:flows[0].start,name:flows[0].origin},{point:flows[0].end,name:flows[0].destination}]:[];
 const layers=[...fixedLayers,...(!motionPaused?[new ScatterplotLayer({id:'flow-direction',data:markers,getPosition:d=>d.point,getRadius:d=>d.radius,radiusUnits:'pixels',getFillColor:[244,251,255,255],pickable:false})]:[]),new TextLayer({id:'route-endpoints',data:endpointLabels,getPosition:d=>d.point,getText:d=>d.name,getSize:13,getPixelOffset:[12,-12],getTextAnchor:'start',getColor:[242,248,255],outlineWidth:3,outlineColor:[17,39,59],fontFamily:'sans-serif',fontSettings:{sdf:true},pickable:false})];
 const loaded=useRef(false),interacting=useRef(false);
 return <DeckGL views={globeView} viewState={{...view,zoom:toDeckZoom(view,width,height),minZoom:toDeckZoom({...view,zoom:-.5},width,height),maxZoom:toDeckZoom({...view,zoom:4},width,height)}} layers={layers} useDevicePixels={Math.min(1.5,window.devicePixelRatio)} onViewStateChange={({viewState,interactionState})=>{onInteraction();const camera=viewState as Camera;onCamera({...camera,zoom:fromDeckZoom(camera,width,height)},!interactionState.isDragging&&!interactionState.isZooming&&!interactionState.inTransition)}} onInteractionStateChange={state=>{const active=!!(state.isDragging||state.isZooming);if(active)onInteraction();if(interacting.current&&!active)onCamera(latest.current.view,true);interacting.current=active}} onAfterRender={()=>{if(!loaded.current){loaded.current=true;onReady()}}} onError={onFailure} getCursor={({isDragging})=>isDragging?'grabbing':'grab'}/>;
}
