'use client';
import {useEffect,useId,useMemo,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as GLMap,StyleSpecification,GeoJSONSource} from 'maplibre-gl';
import {geoGraticule10,geoBounds} from 'd3-geo';
import type {FeatureCollection,Feature} from 'geojson';
import {Globe2,Map as MapIcon,Minus,Plus,RotateCcw,Maximize,Minimize} from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useMaterialArtifact} from '../material-data';
import {useAppTheme} from '../atlas-next/AppTheme';
import {compact,number} from './model';
import type {WorldMapProps} from './WorldMap';
import {countryScale as scale,palette,routeGeometry,overlayLayers} from './mapLayers';
import {flowEndpoints,flowLabel,connectionBounds} from './connectionGeometry';
import {configureMapWorker} from './mapWorker';
import {shippingTiles} from '@/packages/material-world/maritime';
import {tileUrl} from '@/packages/material-world/environment';
const duration=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:750;
function collection(features:Feature[]):FeatureCollection{return {type:'FeatureCollection',features}}
const source=(data:FeatureCollection)=>({type:'geojson' as const,data});
const gridGeo=collection([{type:'Feature',properties:{},geometry:geoGraticule10()}]);
function baseStyle(dark:boolean):StyleSpecification{const p=palette(dark);return {version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':p.water}}]}}
export default function GeographicMap(props:WorldMapProps&{onFallback:(reason?:string)=>void}){
 const {flows,sites,countries,place,selected,onFlow,onSite,onPlace,color,siteView,countryLayer,raster,shippingDensity,onFallback}=props;
 const geography=useMaterialArtifact<FeatureCollection>('/data/v10/geography.json');
 const {dark}=useAppTheme();
 const container=useRef<HTMLDivElement>(null),frame=useRef<HTMLElement>(null),map=useRef<GLMap|null>(null);
 const styleReady=useRef(false),styleKind=useRef<'base'|'detail'>('base');
 const appliedData=useRef(new Map<string,FeatureCollection>()),appliedProjection=useRef('');
 const [rasterError,setRasterError]=useState(false);
 const appliedRaster=useRef('');
 const [projection,setProjection]=useState<'mercator'|'globe'>('mercator'),[detail,setDetail]=useState(false),[detailState,setDetailState]=useState(''),[proportional,setProportional]=useState(false),[hover,setHover]=useState(''),[expanded,setExpanded]=useState(false),[ready,setReady]=useState(false);
 const mapId=useId().replaceAll(':','');
 const coordinates=useMemo(()=>new Map([...countries.filter(c=>c.center).map(c=>[c.id,c.center!] as const),['BC',[-125,54] as [number,number]],['SSI',[-123.5,48.8] as [number,number]]]),[countries]);
 // Keep the inspected connection visible even when it falls below the 200-line display cap.
 const locatedRoutes=useMemo(()=>flows.filter(f=>flowEndpoints(f,coordinates)),[flows,coordinates]);
 const comparableRoutes=locatedRoutes.length>0&&new Set(locatedRoutes.map(f=>[f.unit,f.basis,f.year,f.connection?'documented connection':'country report'].join('|'))).size===1;
 const located=useMemo(()=>{const drawn=(comparableRoutes?[...locatedRoutes].sort((a,b)=>b.amount-a.amount):locatedRoutes).slice(0,200);const inspected=locatedRoutes.find(f=>f.id===selected);if(inspected&&!drawn.includes(inspected))drawn.splice(199,1,inspected);return drawn},[locatedRoutes,comparableRoutes,selected]);
 const routeGeo=useMemo(()=>collection(located.map(f=>({type:'Feature',geometry:routeGeometry(flowEndpoints(f,coordinates)!.a,flowEndpoints(f,coordinates)!.b),properties:{id:f.id,label:flowLabel(f,compact),connection:!!f.connection,amount:f.amount,estimated:f.estimated}}))),[located,coordinates]);
 const routes=useMemo(()=>new Set(flows.flatMap(f=>[f.origin,f.destination])),[flows]);
 const countryGeo=useMemo(()=>{const names=new Map(countries.map(c=>[c.numeric,c]));return collection((geography.data?.features||[]).map((f,i)=>{const c=names.get(String(f.properties?.numeric)),value=c?countryLayer?.values.get(c.id):undefined;return {...f,id:i,properties:{...f.properties,iso:c?.id||'',name:c?.name||f.properties?.name,value:value??null,connected:c?routes.has(c.id):false,label:(c?.name||f.properties?.name)+(countryLayer?' · '+(value===undefined?'No observation':number(value,1)+' '+countryLayer.unit):'')}}}))},[geography.data,countries,countryLayer?.values,countryLayer?.unit,routes]);
 const siteGeo=useMemo(()=>collection(sites.map(s=>({...s,properties:{...s.properties,label:s.properties.name+' · '+(s.properties.value===null?(s.properties.metric==='Source location'?'Source location':'Quantity not reported'):compact(s.properties.value)+' '+s.properties.unit)}}))),[sites]);
 const current=useRef({props,routeGeo,countryGeo,siteGeo,dark,projection,proportional,detail});
 current.current={props,routeGeo,countryGeo,siteGeo,dark,projection,proportional,detail};
 function fit(m:GLMap){const {props:p,countryGeo:g}=current.current;const bounds=connectionBounds(p.flows);if(bounds){m.fitBounds(bounds,{padding:65,maxZoom:11,duration:duration()});return}const local=p.place==='BC'||p.place==='SSI';if(p.siteView&&p.place!=='WORLD'||local){const f=g.features.find(f=>f.properties?.iso===p.place);if(f){const b=geoBounds(f);if(b.flat().every(Number.isFinite)&&b[0][0]<b[1][0]){m.fitBounds(b,{padding:45,maxZoom:8,duration:duration()});return}}const center=coordinates.get(p.place);if(center){m.easeTo({center,zoom:p.place==='SSI'?9:local?4:3,duration:duration(),pitch:0,bearing:0});return}}m.easeTo({center:[local?-130:15,15],zoom:Math.log2(Math.max(240,Math.min(m.getContainer().clientWidth-30,m.getContainer().clientHeight*1.8))/512),pitch:0,bearing:0,duration:duration()})}
 function update(m:GLMap){
  // Source processing also makes isStyleLoaded() false. Waiting for idle here
  // queued repeated updates and could restart the work we were waiting on.
  if(!styleReady.current)return;const state=current.current,pr=state.props;
  if(styleKind.current==='base')m.setPaintProperty('background','background-color',palette(state.dark).water);
  for(const [id,data] of [['oa-countries',state.countryGeo],['oa-routes',state.routeGeo],['oa-sites',state.siteGeo],['oa-grid',gridGeo]] as const){
   if(appliedData.current.get(id)===data)continue;
   if(m.getSource(id))(m.getSource(id) as GeoJSONSource).setData(data);else m.addSource(id,id==='oa-sites'?{...source(data),cluster:true,clusterRadius:42,clusterMaxZoom:12}:source(data));
   appliedData.current.set(id,data);
  }
  const envLayer=pr.raster,key=envLayer?envLayer.id+'-'+envLayer.date:'';
  if(appliedRaster.current!==key){if(m.getLayer('oa-environment-image'))m.removeLayer('oa-environment-image');if(m.getSource('oa-environment'))m.removeSource('oa-environment');if(envLayer){m.addSource('oa-environment',{type:'raster',tiles:[tileUrl(envLayer)],tileSize:256,maxzoom:envLayer.maxZoom,attribution:'NASA GIBS / MODIS'});m.addLayer({id:'oa-environment-image',source:'oa-environment',type:'raster',paint:{'raster-fade-duration':window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:250,'raster-opacity':1}},m.getLayer('oa-land')?'oa-land':undefined)}appliedRaster.current=key}
  if(pr.shippingDensity&&!m.getSource('oa-shipping'))m.addSource('oa-shipping',{type:'raster',tiles:[new URL(shippingTiles,window.location.origin).href.replaceAll('%7B','{').replaceAll('%7D','}')],tileSize:256,maxzoom:4,attribution:'Shipping: World Bank · CC BY 4.0 · 2015–2021'});
  if(!pr.shippingDensity&&m.getLayer('oa-shipping-image'))m.removeLayer('oa-shipping-image');
  const comparableFlows=pr.flows.length>0&&new Set(pr.flows.map(f=>[f.unit,f.connection?'documented connection':'country report'].join('|'))).size===1;
  const layers=overlayLayers({shippingDensity:pr.shippingDensity,raster:!!pr.raster,dark:state.dark,color:pr.color,place:pr.place,selected:pr.selected,detail:state.detail,proportional:state.proportional&&new Set(pr.sites.map(s=>[s.properties.basis,s.properties.metric,s.properties.unit].join('|'))).size===1,comparableFlows,maxFlow:Math.max(1,...pr.flows.slice(0,200).map(f=>f.amount)),maxSite:pr.sites.reduce((max,s)=>Math.max(max,s.properties.value||0),1),thresholds:pr.countryLayer?.thresholds});
  for(const layer of layers){if(!m.getLayer(layer.id))m.addLayer(layer,layer.id==='oa-shipping-image'&&m.getLayer('oa-borders')?'oa-borders':undefined);else for(const [key,value] of Object.entries(layer.paint||{}))m.setPaintProperty(layer.id,key as never,value as never)}
  if(appliedProjection.current!==state.projection){m.setProjection({type:state.projection});appliedProjection.current=state.projection}
 }
 useEffect(()=>{
  if(!container.current||!geography.data)return;
  let active=true,loaded=false,hoverFrame=0,resizeFrame=0;
  const fallback=(reason:string)=>{if(active){active=false;current.current.props.onFallback(reason)}};
  let m:GLMap;try{configureMapWorker();m=new maplibregl.Map({container:container.current,style:baseStyle(current.current.dark),center:[15,15],zoom:0,minZoom:-2,maxZoom:17,attributionControl:false,renderWorldCopies:false,cooperativeGestures:true});map.current=m}catch(error){console.warn('Interactive map unavailable; using the atlas.',error instanceof Error?error.message:'Graphics unavailable');fallback('Atlas map · 3D graphics are unavailable on this device.');return}
  // Worker/network failures do not always fire a MapLibre error. Never leave
  // visitors on an indefinite loading screen if the map cannot become ready.
  const startupTimer=window.setTimeout(()=>{if(!loaded)fallback('Atlas map · the interactive map could not finish loading.')},12000);
  m.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'<a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a> · <a href="https://maplibre.org/" target="_blank">MapLibre</a>'}),'bottom-left');
  m.on('load',()=>{if(!active)return;loaded=true;window.clearTimeout(startupTimer);fit(m);setReady(true)});
  m.on('style.load',()=>{if(!active)return;styleReady.current=true;appliedData.current.clear();appliedProjection.current='';appliedRaster.current='';update(m)});
  m.on('click',e=>{const layers=['oa-site-points','oa-site-clusters','oa-route-hit','oa-land'].filter(id=>m.getLayer(id));const hits=m.queryRenderedFeatures(e.point,{layers});const hit=hits.find(f=>f.layer.id==='oa-site-points')||hits.find(f=>f.layer.id==='oa-site-clusters')||hits.find(f=>f.layer.id==='oa-route-hit')||hits[0];if(!hit)return;if(hit.layer.id==='oa-site-clusters'){const cluster=hit.properties.cluster_id;(m.getSource('oa-sites') as GeoJSONSource).getClusterExpansionZoom(cluster).then(zoom=>{if(active&&hit.geometry.type==='Point')m.easeTo({center:hit.geometry.coordinates as [number,number],zoom:Math.min(zoom,15),duration:duration()})});return}const p=current.current.props;if(hit.layer.id==='oa-site-points'){const s=p.sites.find(s=>s.properties.id===hit.properties.id);if(s)p.onSite(s)}else if(hit.layer.id==='oa-route-hit'){const f=p.flows.find(f=>f.id===hit.properties.id);if(f)p.onFlow(f)}else if(hit.properties.iso)p.onPlace(hit.properties.iso)});
  m.on('mousemove',e=>{if(hoverFrame||m.isMoving())return;hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;if(!active)return;const layers=['oa-site-points','oa-site-clusters','oa-route-hit','oa-land'].filter(id=>m.getLayer(id));const hits=m.queryRenderedFeatures(e.point,{layers});const h=hits.find(f=>f.layer.id==='oa-site-points')||hits.find(f=>f.layer.id==='oa-site-clusters')||hits.find(f=>f.layer.id==='oa-route-hit')||hits[0];const label=h?.layer.id==='oa-site-clusters'?number(Number(h.properties.point_count),0)+' nearby source records · click to zoom':h?.properties?.label||'';setHover(previous=>previous===label?previous:label);m.getCanvas().style.cursor=h?'pointer':'grab'})});
  m.on('mouseout',()=>setHover(''));
  m.on('error',e=>{
   if(!active)return;
   const sourceId='sourceId' in e?String(e.sourceId):'';
   if(sourceId==='oa-shipping'){setDetailState('Some shipping-density tiles could not load. Port records remain available.');return}
   if(sourceId==='oa-environment'){setRasterError(true);return}
   if(styleKind.current==='detail'&&!sourceId.startsWith('oa-')){setDetail(false);setDetailState('Geographic detail unavailable. Showing the built-in world map.');return}
   fallback('Atlas map · the interactive map could not load.');
  });
  m.on('webglcontextlost',()=>fallback('Atlas map · the graphics connection was interrupted.'));
  const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(active)m.resize()})});observer.observe(container.current);
  return()=>{active=false;cancelAnimationFrame(hoverFrame);cancelAnimationFrame(resizeFrame);window.clearTimeout(startupTimer);observer.disconnect();m.remove();map.current=null;styleReady.current=false;styleKind.current='base';appliedData.current.clear();appliedProjection.current=''};
 },[!!geography.data]);
 useEffect(()=>{if(map.current)update(map.current)},[ready,routeGeo,countryGeo,siteGeo,dark,projection,proportional,selected,color,detail,raster?.id,raster?.date,shippingDensity]);
 useEffect(()=>{if(map.current&&ready){fit(map.current);setHover('')}},[place,siteView,ready,flows.filter(f=>f.connection).map(f=>f.id).join('|')]);
 useEffect(()=>{const m=map.current,points=props.focusCoordinates;if(!m||!ready||!points?.length||points.length>220)return;const lng=points.map(p=>p[0]),lat=points.map(p=>p[1]);if(Math.max(...lng)-Math.min(...lng)>175)return;if(points.length===1){m.easeTo({center:points[0],zoom:Math.max(5,Math.min(m.getZoom(),8)),duration:duration(),pitch:0,bearing:0});return}m.fitBounds([[Math.min(...lng),Math.min(...lat)],[Math.max(...lng),Math.max(...lat)]],{padding:72,maxZoom:8,duration:duration()})},[props.focusKey,ready]);
 useEffect(()=>{setRasterError(false);if(raster)setDetail(false)},[raster?.id,raster?.date]);
 useEffect(()=>{const m=map.current;if(!m||!ready||!selected||!siteView)return;const f=current.current.props.flows.find(f=>f.id===selected&&f.connection);if(f){const bounds=connectionBounds([f]);if(bounds)m.fitBounds(bounds,{padding:70,maxZoom:11,duration:duration()});return}const s=current.current.props.sites.find(s=>s.properties.id===selected);if(s)m.flyTo({center:s.geometry.coordinates,zoom:Math.max(m.getZoom(),10),speed:1.5,curve:1.2,duration:duration(),essential:false})},[selected,ready,siteView]);
 useEffect(()=>{
  const m=map.current;if(!m||!ready)return;const controller=new AbortController();
  if(!detail){
   if(styleKind.current==='detail'){styleReady.current=false;styleKind.current='base';m.setStyle(baseStyle(dark),{diff:false})}
   return;
  }
  setDetailState('Loading geographic detail…');
  const timeout=window.setTimeout(()=>{controller.abort();setDetail(false);setDetailState('Geographic detail unavailable. Showing the built-in world map.')},12000);
  fetch('https://tiles.openfreemap.org/styles/'+(dark?'dark':'liberty'),{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json()}).then((style)=>{if(controller.signal.aborted)return;styleReady.current=false;styleKind.current='detail';m.setStyle(style as StyleSpecification,{diff:false});setDetailState('OpenStreetMap · OpenFreeMap');}).catch(e=>{if(e.name!=='AbortError'){setDetail(false);setDetailState('Geographic detail unavailable. Showing the built-in world map.')}}).finally(()=>window.clearTimeout(timeout));
  return()=>{controller.abort();window.clearTimeout(timeout)};
 },[detail,dark,ready]);
 useEffect(()=>{
  const m=map.current;if(!m||!ready)return;
  const chosen=flows.find(f=>f.id===selected)||flows[0];
  const labels:Array<{name:string;coordinates:[number,number]}>=chosen?.connection?[
   {name:chosen.originLabel,coordinates:chosen.connection.from},{name:chosen.destinationLabel,coordinates:chosen.connection.to}
  ]:chosen&&!siteView&&!countryLayer?[{id:chosen.origin,name:chosen.originLabel},{id:chosen.destination,name:chosen.destinationLabel}].flatMap(l=>{const c=coordinates.get(l.id);return c?[{name:l.name,coordinates:c}]:[]}):place!=='WORLD'&&coordinates.has(place)?[{name:countries.find(c=>c.id===place)?.name||place,coordinates:coordinates.get(place)!}]:[];
  const markers=labels.map(l=>{const el=document.createElement('div');el.className='oa-gl-place-label';el.textContent=l.name;return new maplibregl.Marker({element:el,anchor:'bottom-left',offset:[6,-6]}).setLngLat(l.coordinates).addTo(m)});
  return()=>markers.forEach(marker=>marker.remove());
 },[ready,selected,flows,place,siteView,countryLayer,coordinates,countries]);
 useEffect(()=>{const handler=()=>setExpanded(document.fullscreenElement===frame.current);document.addEventListener('fullscreenchange',handler);return()=>document.removeEventListener('fullscreenchange',handler)},[]);
 const comparable=useMemo(()=>sites.length>0&&sites.some(s=>s.properties.value!==null)&&new Set(sites.map(s=>[s.properties.basis,s.properties.metric,s.properties.unit].join('|'))).size===1,[sites]);
 const contextual=sites.some(s=>s.properties.stage||s.properties.transport),portCount=sites.filter(s=>s.properties.transport).length;
 const count=countryLayer?`${countryLayer.values.size} countries / areas`:siteView?`${(sites.length-portCount-sites.filter(s=>s.properties.source_id==='user-coordinate').length).toLocaleString()} ${flows.some(f=>f.connection)?'mapped locations':'facility records'}${portCount?' + '+portCount.toLocaleString()+' ports':''}`:`${located.length} of ${locatedRoutes.length.toLocaleString()} located connections${locatedRoutes.length>200?(comparableRoutes?' · largest values prioritized':' · source order prioritized'):''}`;
 return <section className={"mw-map oa-gl-map"+(expanded?" is-expanded":"")} ref={frame} aria-label="Interactive geographic map">
  <div className="oa-map-controls"><div className="oa-map-projection" role="group" aria-label="Map projection"><button aria-pressed={projection==='mercator'} onClick={()=>setProjection('mercator')}><MapIcon size={15}/>Flat</button><button aria-pressed={projection==='globe'} onClick={()=>setProjection('globe')}><Globe2 size={15}/>Globe</button></div><label className="oa-map-detail"><input type="checkbox" disabled={!!raster} checked={detail} onChange={e=>{setDetailState('');setDetail(e.target.checked)}}/>Geographic detail</label><button className="oa-atlas-switch" onClick={()=>onFallback()}>Atlas</button></div>
  <a className="mw-map-skip" href={'#map-end-'+mapId}>Skip map controls</a>
  <div className="oa-gl-canvas" ref={container}/>
  <div className="oa-gl-tools"><button aria-label="Zoom in" onClick={()=>map.current?.zoomIn()}><Plus size={18}/></button><button aria-label="Zoom out" onClick={()=>map.current?.zoomOut()}><Minus size={18}/></button><button aria-label="Reset map" onClick={()=>map.current&&fit(map.current)}><RotateCcw size={17}/></button><button aria-label={expanded?'Exit full screen map':'Full screen map'} onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(expanded)setExpanded(false);else await frame.current?.requestFullscreen()}catch{setExpanded(v=>!v)}}}>{expanded?<Minimize size={17}/>:<Maximize size={17}/>}</button></div>
  {!ready&&<p className="oa-gl-status" role="status">{geography.error?'Geography could not load. Records are available below.':'Preparing the map…'}</p>}
  {hover&&<div className="oa-gl-tooltip">{hover}</div>}
  <div className="oa-gl-map-note">{flows.some(f=>f.connection)?'Dashed links join documented endpoints · geometry is schematic':countryLayer?countryLayer.label+' · '+countryLayer.year:sites.length?'Select a point to inspect · select a cluster to zoom':'Select a line to open its record · select a country to focus'}</div>
  {countryLayer?<div className="mw-country-legend"><strong>{countryLayer.unit}</strong>{scale.map((c,i)=><span key={c}><i style={{background:c}}/>{i===0?'Under '+compact(countryLayer.thresholds[0]):i===4?compact(countryLayer.thresholds[3])+'+':compact(countryLayer.thresholds[i-1])+'–'+compact(countryLayer.thresholds[i])}</span>)}<span><i style={{background:palette(dark).land}}/>No observation</span></div>:siteView&&contextual?<div className="mw-map-options"><span>Colors show stages{portCount?' · blue ports scale with monthly calls':''}.</span><span>Nearby records are grouped; zoom for detail.</span></div>:siteView?<div className="mw-map-options"><label><input type="checkbox" disabled={!comparable} checked={proportional&&comparable} onChange={e=>setProportional(e.target.checked)}/>{comparable?'Size points by '+sites[0]?.properties.metric:'Location markers · filter to one measure to scale'}</label><span>{proportional?'Circle area scales with value; minimum size for legibility':'Equal-size location markers'}</span></div>:<div className="mw-map-options"><span>{flows.length&&new Set(flows.map(f=>[f.unit,f.connection?'documented connection':'country report'].join('|'))).size===1?'Thicker line = larger reported quantity in this series':'Equal-width lines · mixed measures cannot be compared by thickness'}</span><span>Connections join country or region anchors, not shipping routes.</span></div>}
  {rasterError&&<p className="mw-raster-warning" role="status">Some NASA imagery could not load. Facility markers and records remain available.</p>}
  {detailState&&<p className="oa-map-detail-status" role="status">{detailState}</p>}
  <div className="mw-map-caption"><span>{count}</span><span>{countryLayer?'Missing observations are not zero':siteView?'Locations and measurements come from the selected source':'Select a record for direction, year and measurement basis'}</span></div><span id={'map-end-'+mapId} tabIndex={-1}/>
 </section>
}
