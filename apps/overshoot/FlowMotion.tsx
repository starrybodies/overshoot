'use client';
import {useEffect,useMemo,useRef} from 'react';
import {geoDistance,geoInterpolate,type GeoProjection} from 'd3-geo';
import type {MappedFlow} from './Globe';
import type {Camera} from './camera';
/** Direction only. Mass is encoded by route width, never by a fabricated travel speed. */
export default function FlowMotion({flows,projection,view,paused}:{flows:MappedFlow[];projection:GeoProjection;view:Camera;paused:boolean}){
 const group=useRef<SVGGElement>(null),current=useRef({projection,view});current.current={projection,view};
 const paths=useMemo(()=>flows.map(flow=>geoInterpolate(flow.start,flow.end)),[flows]);
 useEffect(()=>{if(paused)return;const preference=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0;
  const tick=(now:number)=>{if(now-last>32){last=now;const children=group.current?.children;paths.forEach((path,i)=>{const node=children?.[i];if(!node)return;const point=path((now/10000+i*.173)%1),{projection,view}=current.current,xy=projection(point);const visible=xy&&geoDistance(point,[view.longitude,view.latitude])<Math.PI/2;
   node.setAttribute('visibility',visible?'visible':'hidden');if(xy){node.setAttribute('cx',String(xy[0]));node.setAttribute('cy',String(xy[1]))}})}if(!document.hidden&&!preference.matches)frame=requestAnimationFrame(tick)};
  const resume=()=>{cancelAnimationFrame(frame);if(!document.hidden&&!preference.matches)frame=requestAnimationFrame(tick)};resume();document.addEventListener('visibilitychange',resume);preference.addEventListener('change',resume);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);preference.removeEventListener('change',resume)};
 },[paths,paused]);
 return <g ref={group} className="flow-motion" aria-hidden="true" pointerEvents="none">{flows.map((flow,i)=><circle key={`${flow.origin}-${flow.destination}-${i}`} r={Math.max(1.8,flow.width*.65)} fill="#f2f8ff" visibility="hidden"/>)}</g>;
}
