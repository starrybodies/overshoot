import catalog from '@/public/data/v14/environment.json';
export type EnvironmentLayer=typeof catalog.layers[number]&{date:string};
export const environmentCatalog=catalog;
export function environmentLayer(id:string,date?:string):EnvironmentLayer|undefined{
 const layer=catalog.layers.find(l=>l.id===id);if(!layer)return undefined;
 let chosen=date||layer.defaultDate||'default';
 if(layer.defaultDate){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(chosen)||chosen<layer.minDate!||chosen>layer.maxDate!)throw Error('Date is outside the verified layer range.');
  if(Number.isNaN(Date.parse(chosen))||new Date(chosen).toISOString().slice(0,10)!==chosen)throw Error('Invalid calendar date.');
  if(layer.frequency==='Monthly')chosen=chosen.slice(0,7)+'-01';
  if(!layer.availableRanges.some(range=>{const [start,end=start]=range.split('/');return chosen>=start&&chosen<=end}))throw Error('No image is listed for this date in the verified source catalog.');
 }else chosen='default';
 return {...layer,date:chosen};
}
export function tileUrl(layer:EnvironmentLayer){return layer.tileTemplate.replace('{date}',layer.date)}
export function environmentImage(layer:EnvironmentLayer,bbox:[number,number,number,number]){
 const p=new URLSearchParams({SERVICE:'WMS',REQUEST:'GetMap',VERSION:'1.1.1',LAYERS:layer.identifier,STYLES:'',FORMAT:'image/png',TRANSPARENT:'TRUE',SRS:'EPSG:4326',BBOX:bbox.join(','),WIDTH:'1024',HEIGHT:'512'});
 if(layer.date!=='default')p.set('TIME',layer.date);
 return 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?'+p;
}
