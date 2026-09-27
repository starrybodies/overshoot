import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {overlayLayers,routeGeometry} from '../../apps/overshoot/world/mapLayers';
const mapRequire=createRequire(import.meta.resolve('maplibre-gl'));
const {validateStyleMin}=mapRequire('@maplibre/maplibre-gl-style-spec');
for(const shippingDensity of [false,true])for(const dark of [false,true])for(const detail of [false,true])for(const proportional of [false,true])for(const thresholds of [undefined,[1e5,1e6,1e7,1e8],[1,10,50,100],[1e4,1e5,1e6,1e7]]){
 const layers=overlayLayers({shippingDensity,dark,detail,proportional,comparableFlows:true,thresholds,color:'#559977',place:'CAN',selected:'sample',maxFlow:2e6,maxSite:1e3});
 const sources=Object.fromEntries(['oa-countries','oa-routes','oa-sites','oa-grid'].map(id=>[id,{type:'geojson',data:{type:'FeatureCollection',features:[]}}]));
 const allSources={...sources,...(shippingDensity?{'oa-shipping':{type:'raster',tiles:['https://example.test/{z}/{x}/{y}.png'],tileSize:256,maxzoom:4}}:{})};
 const errors=validateStyleMin({version:8,sources:allSources,layers});assert.deepEqual(errors,[],JSON.stringify(errors));
}
for(const [a,b] of [[[-123,49],[139,36]],[[179,20],[-179,22]],[[-70,-33],[121,31]],[[0,0],[0,40]]] as Array<[[number,number],[number,number]]>){
 const geometry=routeGeometry(a,b);assert(geometry.coordinates.length>0);
 for(const line of geometry.coordinates)for(let i=0;i<line.length;i++){assert(line[i].every(Number.isFinite));assert(Math.abs(line[i][0])<=180);if(i)assert(Math.abs(line[i][0]-line[i-1][0])<=180)}
 assert(Math.abs(geometry.coordinates[0][0][0]-a[0])<1e-7);assert(Math.abs(geometry.coordinates.at(-1)!.at(-1)![0]-b[0])<1e-7);
}
console.log('PASS: MapLibre layer styles validate across themes, layers and point scaling; Pacific routes split correctly at the date line.');
