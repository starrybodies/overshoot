import type {LayerSpecification,ExpressionSpecification} from 'maplibre-gl';
import type {MultiLineString} from 'geojson';
import {geoInterpolate} from 'd3-geo';
import {mapTheme,mode,rampColors} from './mapTheme';
export function palette(dark:boolean){return mapTheme[mode(dark)]}
// Split at the date line, so a Pacific connection does not cross the whole flat map.
export function routeGeometry(a:[number,number],b:[number,number]):MultiLineString{
 const interpolate=geoInterpolate(a,b),segments:Array<Array<[number,number]>>=[];let line:Array<[number,number]>=[];
 for(let i=0;i<=64;i++){
  const point=interpolate(i/64) as [number,number];
  const previous=line.at(-1);
  if(previous&&Math.abs(point[0]-previous[0])>180){const boundary=previous[0]>0?180:-180;const unwrapped=point[0]+(previous[0]>0?360:-360);const t=(boundary-previous[0])/(unwrapped-previous[0]);const latitude=previous[1]+t*(point[1]-previous[1]);line.push([boundary,latitude]);segments.push(line);line=[[-boundary,latitude]]}
  line.push(point);
 }
 if(line.length>1)segments.push(line);return {type:'MultiLineString',coordinates:segments};
}
type LayerOptions={shippingDensity?:boolean;raster?:boolean;dark:boolean;color:string;place:string;selected:string;detail:boolean;proportional:boolean;comparableFlows:boolean;maxFlow:number;maxSite:number;thresholds?:number[]};
export function overlayLayers(o:LayerOptions):LayerSpecification[]{
 const p=palette(o.dark),colors=rampColors(o.dark,(o.thresholds?.length||0)+1),ramp=['step',['get','value'],colors[0],...(o.thresholds||[]).flatMap((t,i)=>[t,colors[i+1]])] as ExpressionSpecification;
 return [
  {id:'oa-land',type:'fill',source:'oa-countries',paint:{'fill-color':o.thresholds?['case',['==',['get','value'],null],p.noData,ramp]:['case',['==',['get','iso'],o.place],p.place,['get','connected'],p.route,p.land],'fill-opacity':o.raster?(o.thresholds?.72:.06):o.detail?(o.thresholds?.75:.12):1}},
  ...(o.shippingDensity?[{id:'oa-shipping-image',type:'raster',source:'oa-shipping',paint:{'raster-opacity':['interpolate',['linear'],['zoom'],0,.72,3,.6,5,.35],'raster-fade-duration':200}} as LayerSpecification]:[]),
  {id:'oa-borders',type:'line',source:'oa-countries',paint:{'line-color':['case',['==',['get','iso'],o.place],o.dark?'#edd294':'#965535',p.line],'line-width':['case',['==',['get','iso'],o.place],2,.6]}},
  {id:'oa-grid-lines',type:'line',source:'oa-grid',paint:{'line-color':p.line,'line-opacity':o.detail?0:.18,'line-width':.5}},
  {id:'oa-route-hit',type:'line',source:'oa-routes',paint:{'line-color':'rgba(0,0,0,0)','line-width':16}},
  {id:'oa-route-lines',type:'line',source:'oa-routes',paint:{'line-color':o.color,'line-width':o.comparableFlows?['case',['==',['get','connection'],true],2.5,['+',1,['*',5,['sqrt',['/',['get','amount'],Math.max(1,o.maxFlow)]]]]]:2.5,'line-opacity':o.selected?['case',['==',['get','id'],o.selected],1,.24]:.68,'line-opacity-transition':{duration:350},'line-width-transition':{duration:450}}},
  {id:'oa-connection-dashes',type:'line',source:'oa-routes',filter:['==',['get','connection'],true],paint:{'line-color':p.water,'line-width':3,'line-dasharray':[1.5,2],'line-opacity':.65}},
  {id:'oa-route-estimates',type:'line',source:'oa-routes',filter:['==',['get','estimated'],true],paint:{'line-color':p.water,'line-width':1,'line-dasharray':[2,2]}},
  {id:'oa-site-clusters',type:'circle',source:'oa-sites',filter:['has','point_count'],paint:{'circle-color':o.color,'circle-radius':['step',['get','point_count'],10,20,15,100,20,1000,27],'circle-opacity':.7,'circle-stroke-color':p.water,'circle-stroke-width':2,'circle-radius-transition':{duration:400},'circle-opacity-transition':{duration:350}}},
  {id:'oa-site-points',type:'circle',source:'oa-sites',filter:['!', ['has','point_count']],paint:{'circle-color':o.proportional?['case',['==',['get','value'],null],'rgba(0,0,0,0)',['==',['get','id'],o.selected],p.selected,['coalesce',['get','stageColor'],o.color]]:['case',['==',['get','id'],o.selected],p.selected,['coalesce',['get','stageColor'],o.color]],'circle-radius':o.proportional?['+',3,['*',12,['sqrt',['/',['coalesce',['get','value'],0],Math.max(1,o.maxSite)]]]]:[ 'coalesce',['get','mapRadius'],5],'circle-stroke-width':1,'circle-stroke-color':o.dark?'#b4ccb0':'#fff','circle-opacity':o.selected?['case',['==',['get','id'],o.selected],1,.55]:.85,'circle-radius-transition':{duration:450},'circle-color-transition':{duration:350},'circle-opacity-transition':{duration:350}}}
 ];
}
