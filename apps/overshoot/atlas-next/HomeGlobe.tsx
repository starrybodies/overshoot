'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {geoDistance,geoGraticule,geoOrthographic,geoPath} from 'd3-geo';
import {Pause,Play,RotateCcw} from 'lucide-react';
import type {FeatureCollection} from 'geojson';
import {useMaterialArtifact} from '../material-data';
import type {Country,Flow} from '../world/model';

const grid=geoGraticule().step([30,30])();
export default function HomeGlobe({flows,countries,label}:{flows:Flow[];countries:Country[];label:string}){
 const geography=useMaterialArtifact<FeatureCollection>('/data/v2/geography.json');
 const root=useRef<HTMLDivElement>(null);
 const drag=useRef<{x:number;y:number;rotation:[number,number]}|null>(null);
 const [rotation,setRotation]=useState<[number,number]>([25,-18]);
 const [playing,setPlaying]=useState(false),[visible,setVisible]=useState(true),[reduced,setReduced]=useState(false),[held,setHeld]=useState(false);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{setReduced(media.matches);setPlaying(!media.matches)};update();
  media.addEventListener('change',update);
  const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.1});
  if(root.current)observer.observe(root.current);
  return()=>{media.removeEventListener('change',update);observer.disconnect()};
 },[]);
 useEffect(()=>{
  if(!playing||!visible||reduced||held)return;
  let frame=0,last=0;
  const tick=(time:number)=>{if(time-last>=50){const delta=Math.min(time-last,80);last=time;if(!document.hidden)setRotation(([longitude,latitude])=>[(longitude+delta*.003)%360,latitude])}frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[playing,visible,reduced,held]);
 const projection=useMemo(()=>geoOrthographic().translate([300,290]).scale(248).rotate(rotation).clipAngle(90),[rotation]);
 const path=useMemo(()=>geoPath(projection),[projection]);
 const countryIds=useMemo(()=>new Map(countries.map(c=>[c.numeric,c.id])),[countries]);
 const coordinates=useMemo(()=>new Map(countries.filter(c=>c.center).map(c=>[c.id,c.center!])),[countries]);
 const connections=useMemo(()=>flows.filter(f=>coordinates.has(f.origin)&&coordinates.has(f.destination)).slice(0,20),[flows,coordinates]);
 const connected=useMemo(()=>new Set(connections.flatMap(f=>[f.origin,f.destination])),[connections]);
 const anchors=[...connected].flatMap(id=>{const c=coordinates.get(id);if(!c||geoDistance(c,[-rotation[0],-rotation[1]])>=Math.PI/2)return [];const point=projection(c);return point?[{id,point}]:[]});
 return <div className="oa-home-globe" ref={root}>
  <svg viewBox="0 0 600 580" role="img" tabIndex={0} aria-label={`${label}: 20 largest available trade connections. Use arrow keys to rotate the globe.`}
   onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();setPlaying(false);setRotation(([x,y])=>[x+(e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0),Math.max(-75,Math.min(75,y+(e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0)))])}}
   onPointerDown={e=>{setPlaying(false);drag.current={x:e.clientX,y:e.clientY,rotation};e.currentTarget.setPointerCapture(e.pointerId)}}
   onPointerMove={e=>{const d=drag.current;if(!d)return;const scale=600/e.currentTarget.getBoundingClientRect().width;setRotation([d.rotation[0]+(e.clientX-d.x)*scale*.3,Math.max(-75,Math.min(75,d.rotation[1]-(e.clientY-d.y)*scale*.3))])}}
   onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
   onMouseEnter={()=>setHeld(true)} onMouseLeave={()=>setHeld(false)} onFocus={()=>setHeld(true)} onBlur={()=>setHeld(false)}>
   <desc>Natural Earth country boundaries. Curves connect country centres, not shipping routes. Only the largest 20 available records are shown.</desc>
   <path className="oa-home-ocean" d={path({type:'Sphere'})||''}/>
   <path className="oa-home-graticule" d={path(grid)||''}/>
   {geography.data?.features.map((feature,index)=><path key={index} className={'oa-home-land'+(connected.has(countryIds.get(String(feature.properties?.numeric))||'')?' is-connected':'')} d={path(feature)||''}/>)}
   <g className="oa-home-flow-set" key={label}>{connections.map(flow=><path key={flow.id} className="oa-home-flow" d={path({type:'LineString',coordinates:[coordinates.get(flow.origin)!,coordinates.get(flow.destination)!]})||''} style={{strokeWidth:.7+2*Math.sqrt(flow.amount/(connections[0]?.amount||1))}}/>)}</g>
   {anchors.map(({id,point})=><circle key={id} className="oa-home-anchor" cx={point[0]} cy={point[1]} r={3.1}/>)}
  </svg>
  {geography.error&&<p className="oa-home-map-error">The globe could not load. Open the material to see its records.</p>}
  <div className="oa-home-globe-controls"><span>Drag to rotate</span><button aria-label={playing?'Pause globe rotation':'Start globe rotation'} aria-pressed={playing} disabled={reduced} onClick={()=>setPlaying(v=>!v)} title={reduced?'Rotation is off to respect reduced motion':playing?'Pause rotation':'Start rotation'}>{playing?<Pause size={15}/>:<Play size={15}/>}</button><button aria-label="Reset globe position" onClick={()=>{setRotation([25,-18]);setPlaying(false)}}><RotateCcw size={15}/></button></div>
 </div>;
}
