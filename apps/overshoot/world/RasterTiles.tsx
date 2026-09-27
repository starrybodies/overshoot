'use client';
import {useMemo} from 'react';
import type {GeoProjection} from 'd3-geo';
import {tileUrl,type EnvironmentLayer} from '@/packages/material-world/environment';
/** WMTS tiles in the same Web Mercator coordinates as the CPU fallback projection. */
export default function RasterTiles({layer,urlTemplate,maxZoom,projection,zoom,pan,onError}:{layer?:EnvironmentLayer;urlTemplate?:string;maxZoom?:number;projection:GeoProjection;zoom:number;pan:{x:number;y:number};onError:()=>void}){
 const tiles=useMemo(()=>{
  const size=2*Math.PI*projection.scale(),origin=projection([-180,85.0511287798]);if(!origin)return [];
  const z=Math.max(0,Math.min(maxZoom??layer?.maxZoom??4,Math.floor(Math.log2(size*zoom/256)))),n=2**z,s=size/n;
  const x0=Math.max(0,Math.floor(((500+(-500-pan.x)/zoom)-origin[0])/s)),x1=Math.min(n-1,Math.floor(((500+(500-pan.x)/zoom)-origin[0])/s));
  const y0=Math.max(0,Math.floor(((250+(-250-pan.y)/zoom)-origin[1])/s)),y1=Math.min(n-1,Math.floor(((250+(250-pan.y)/zoom)-origin[1])/s));
  const url=urlTemplate||tileUrl(layer!),result=[];
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)result.push({key:`${layer?.id||'shipping'}-${layer?.date||''}-${z}-${x}-${y}`,x:origin[0]+x*s,y:origin[1]+y*s,size:s,url:url.replace('{z}',String(z)).replace('{x}',String(x)).replace('{y}',String(y))});
  return result;
 },[layer,urlTemplate,maxZoom,projection,zoom,pan]);
 return <g pointerEvents="none">{tiles.map(t=><image key={t.key} x={t.x} y={t.y} width={t.size+.2/zoom} height={t.size+.2/zoom} href={t.url} preserveAspectRatio="none" onError={onError}/>)}</g>
}
