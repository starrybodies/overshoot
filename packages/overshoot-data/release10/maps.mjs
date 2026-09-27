import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {feature} from 'topojson-client';
import {geoArea} from 'd3-geo';
const root=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(root,'../../..');
const out=path.join(repo,'public/data/v10');
const topology=JSON.parse(fs.readFileSync(path.join(repo,'node_modules/world-atlas/countries-50m.json'),'utf8'));
const world=feature(topology,topology.objects.countries);
for(const f of world.features)f.properties.numeric=f.id;
fs.writeFileSync(path.join(out,'geography.json'),JSON.stringify(world));
// Douglas-Peucker simplification in geographic degrees for display only.
// No areas, distances or quantities are calculated from simplified geometry.
function simplify(points,tolerance=.008){
 if(points.length<5)return points;
 const keep=new Set([0,points.length-1]),queue=[[0,points.length-1]];
 while(queue.length){const [a,b]=queue.pop();let max=tolerance*tolerance,index=-1;const [x,y]=points[a],[bx,by]=points[b],dx=bx-x,dy=by-y;
  for(let i=a+1;i<b;i++){const [px,py]=points[i],t=dx||dy?Math.max(0,Math.min(1,((px-x)*dx+(py-y)*dy)/(dx*dx+dy*dy))):0;const distance=(px-x-t*dx)**2+(py-y-t*dy)**2;if(distance>max){max=distance;index=i;}}
  if(index>=0){keep.add(index);queue.push([a,index],[index,b]);}
 }
 const result=[...keep].sort((a,b)=>a-b).map(i=>points[i].map(n=>+n.toFixed(5)));
 return result.length>=4?result:points.filter((_,i)=>i===0||i===Math.floor(points.length/3)||i===Math.floor(points.length*2/3)||i===points.length-1).map(p=>p.map(n=>+n.toFixed(5)));
}
const districts=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'raw/bc-districts.geojson.gz'))));
const aliases={'Metro Vancouver':'Metro-Vancouver','Columbia Shuswap':'Columbia-Shuswap','Comox Valley':'Comox-Strathcona','Strathcona':'Comox-Strathcona'};
for(const f of districts.features){const name=f.properties.REGIONAL_DISTRICT_NAME;f.properties={name,district:aliases[name]||name};const g=f.geometry;g.coordinates=g.type==='MultiPolygon'?g.coordinates.map(p=>p.map(r=>simplify(r))):g.coordinates.map(r=>simplify(r));}
// Road-aligned regional district layer excludes Northern Rockies municipality
// and unincorporated Stikine. Never invent a polygon for either.
// WFS uses RFC 7946 counterclockwise exterior rings. D3 spherical paths
// need clockwise exteriors for regions smaller than a hemisphere.
for(const f of districts.features){const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];for(const polygon of polys){if(geoArea({type:'Polygon',coordinates:polygon})>2*Math.PI)for(const ring of polygon)ring.reverse();}}
delete districts.crs;
fs.writeFileSync(path.join(out,'bc-districts.json'),JSON.stringify(districts));
console.log('Maps:',world.features.length,'country geometries,',districts.features.length,'district geometries');
