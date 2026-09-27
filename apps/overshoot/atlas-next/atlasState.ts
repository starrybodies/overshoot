import {defaultTransportSelection,type TransportSelection} from '@/packages/material-world/maritime';
import placeDirectory from '@/public/data/v11/countries.json';
import {profileById} from './data';
import type {SiteKind} from './FacilitiesPage';
import type {ProductionSelection} from '@/packages/material-world/production';
import type {EnergySelection} from './EnergyMap';
import type {MaterialLayer} from './MaterialGeography';

export type AtlasView='home'|'materials'|'places'|'trade'|'facilities'|'waste'|'local'|'about'|'data';
export type AtlasState=EnergySelection&ProductionSelection&TransportSelection&{localLat:string;localLon:string;localPlace:string;localRadius:string;network:string;journeyLayers:string;layer:MaterialLayer;dataset:'commodity'|'controlled';view:AtlasView;material:string;place:string;form:string;product:string;direction:'in'|'out';kind:SiteKind;site:string;siteQuery:string;siteRegion:string;siteType:string;siteBasis:string;siteSource:string;siteSort:'name'|'quantity';placeView:'materials'|'waste';wastePlace:string;accountYear:string;wasteTab:'compare'|'trends'|'cities'|'records';wasteMetric:string;wasteSeries:string;compare:string;wasteQuery:string;wasteLevel:'country'|'city';wasteYear:string;wasteFrom:string;wasteTo:string};
export const defaultAtlasState:AtlasState={...defaultTransportSelection,localLat:'',localLon:'',localPlace:'',localRadius:'50',network:'',journeyLayers:'',productionItem:'',productionYear:'2024',energyMeasure:'crude-production',energyPeriod:'',energyRegion:'all',layer:'',dataset:'commodity',view:'home',material:'paper',place:'WORLD',form:'4707',product:'',direction:'out',kind:'wastewater',site:'',siteQuery:'',siteRegion:'',siteType:'',siteBasis:'',siteSource:'',siteSort:'name',placeView:'materials',wastePlace:'',accountYear:'2024',wasteTab:'compare',wasteMetric:'perPerson',wasteSeries:'eu-municipal-gen-kg-hab',compare:'',wasteQuery:'',wasteLevel:'country',wasteYear:'latest',wasteFrom:'',wasteTo:''};
const views:AtlasView[]=['home','materials','places','trade','facilities','waste','local','about','data'];

export function readAtlasState(location:{pathname:string;search:string},initial:Partial<AtlasState>={}):AtlasState{
 const base={...defaultAtlasState,...initial};
 const q=new URLSearchParams(location.search);
 const path=location.pathname.replace(/^\/|\/$/g,'') as AtlasView;
 const requestedView=q.get('view') as AtlasView;
 const view=views.includes(requestedView)?requestedView:views.includes(path)?path:location.pathname==='/'?(q.has('material')||q.has('form')||q.has('commodity')?'materials':'home'):base.view;
 const p=profileById(q.get('material')||base.material);
 const rawPlace=(q.get('place')||q.get('country')||base.place).toUpperCase();
 const place=rawPlace==='KOS'?'XKX':placeDirectory.find(c=>c.alpha2===rawPlace)?.id||rawPlace;
 const product=/^\d{6}:[A-Z/]+$/.test(q.get('product')||'')?q.get('product')!:'';
 const requested=q.get('form')||q.get('commodity')||(p.id===base.material?base.form:p.codes[0])||'';
 const form=product?product.slice(0,4):p.codes.includes(requested)?requested:p.codes[0]||'';
 return {...base,view,material:p.id,form,product,
  localLat:/^-?\d{1,2}(?:\.\d{1,6})?$/.test(q.get('lat')||'')&&Math.abs(Number(q.get('lat')))<=90?q.get('lat')!:'',
  localLon:/^-?\d{1,3}(?:\.\d{1,6})?$/.test(q.get('lon')||'')&&Math.abs(Number(q.get('lon')))<=180?q.get('lon')!:'',
  localPlace:(q.get('city')||'').slice(0,160),
  localRadius:['10','25','50','100','250'].includes(q.get('radius')||'')?q.get('radius')!:'50',
  wasteTab:['compare','trends','cities','records'].includes(q.get('wasteTab')||'')?q.get('wasteTab') as AtlasState['wasteTab']:'compare',
  wasteMetric:/^[A-Za-z_0-9]{1,80}$/.test(q.get('metric')||'')?q.get('metric')!:'perPerson',
  wasteSeries:/^[a-z0-9-]{1,120}$/.test(q.get('series')||'')?q.get('series')!:'eu-municipal-gen-kg-hab',
  compare:[...new Set((q.get('compare')||'').split(',').filter(s=>/^[A-Z]{3}(?:-[A-Za-z0-9_-]{1,50})?$/.test(s)))].slice(0,4).join(','),
  wasteFrom:/^(19|20)\d{2}$/.test(q.get('fromYear')||'')?q.get('fromYear')!:'',wasteTo:/^(19|20)\d{2}$/.test(q.get('toYear')||'')&&Number(q.get('toYear'))>=Number(q.get('fromYear')||0)?q.get('toYear')!:'',
  wasteQuery:(q.get('wq')||'').slice(0,120),wasteLevel:q.get('level')==='city'?'city':'country',
  wasteYear:q.get('wasteYear')==='all'||/^(19|20)\d{2}$/.test(q.get('wasteYear')||'')?q.get('wasteYear')!:'latest',
  mapPorts:q.get('ports')==='1'?true:q.get('ports')==='0'?false:null,mapShipping:q.get('shipping')==='1'?true:q.get('shipping')==='0'?false:null,
  portMonth:/^20\d{2}-(0[1-9]|1[0-2])$/.test(q.get('portMonth')||'')?q.get('portMonth')!:'',portVessel:['all','tanker','container','dry_bulk','general_cargo','roro'].includes(q.get('vessel')||'')?q.get('vessel') as AtlasState['portVessel']:'all',
  portId:/^[A-Za-z0-9_-]{1,64}$/.test(q.get('port')||'')?q.get('port')!:'',portsWorldwide:q.get('portsWorld')==='1',
  productionItem:/^\d{1,8}$/.test(q.get('item')||'')?q.get('item')!:'',productionYear:/^\d{4}$/.test(q.get('productionYear')||'')&&Number(q.get('productionYear'))>=1970&&Number(q.get('productionYear'))<=2024?q.get('productionYear')!:'2024',
  energyMeasure:/^[a-z-]{3,48}$/.test(q.get('energy')||'')?q.get('energy')!:base.energyMeasure,
  energyPeriod:/^(19|20)\d{2}(-(?:0[1-9]|1[0-2]))?$/.test(q.get('period')||'')?q.get('period')!:base.energyPeriod,
  energyRegion:['all','middle-east','Africa','Americas','Asia','Europe','Oceania'].includes(q.get('region')||'')?q.get('region')!:base.energyRegion,
  placeView:q.get('lens')==='waste'?'waste':base.placeView,
  wastePlace:/^[A-Z]{3}(?:-[A-Za-z0-9_-]{1,20})?$/.test(q.get('wastePlace')||'')?q.get('wastePlace')!:base.wastePlace,
  accountYear:/^\d{4}$/.test(q.get('year')||'')&&Number(q.get('year'))>=1970&&Number(q.get('year'))<=2024?q.get('year')!:base.accountYear,
  place:(['WORLD','BC','SSI'].includes(place)||['UNASSIGNED','ZNC'].includes(place)&&view==='facilities')||placeDirectory.some(c=>c.id===place)?place:base.place,
  network:/^[a-z0-9-]{1,80}$/.test(q.get('network')||'')?q.get('network')!:'',
  journeyLayers:(q.get('stages')||'').split(',').filter(s=>['none','extraction','refining','manufacturing','use','recovery','disposal','ocean'].includes(s)).join(','),
  layer:['connections','journey','trade','waste','extraction','production','sites','minerals'].includes(q.get('layer')||'')?q.get('layer') as MaterialLayer:base.layer,
  dataset:q.get('dataset')==='controlled'?'controlled':base.dataset,
  direction:place!=='WORLD'&&(q.get('direction')==='in'||q.get('direction')==='M')?'in':'out',
  siteQuery:(q.get('q')||'').slice(0,120),siteRegion:(q.get('siteRegion')||'').slice(0,80),siteType:(q.get('type')||'').slice(0,120),siteSource:(q.get('source')||'').slice(0,100),siteBasis:['reported','modeled','estimated','capacity','unspecified','location','mapped'].includes(q.get('basis')||'')?q.get('basis')!:'',siteSort:q.get('sort')==='quantity'?'quantity':'name',
  site:/^[A-Za-z0-9_.-]{1,150}$/.test(q.get('site')||'')?q.get('site')!:'',
  kind:['documented','mining','landfill','wastewater','river','energy','power','industry'].includes(q.get('kind')||'')?q.get('kind') as SiteKind:base.kind
 };
}

export function atlasUrl(state:AtlasState):string{
 if(state.view==='home')return '/';
 if(state.view==='about'||state.view==='data')return '/'+state.view;
 const q=new URLSearchParams();
 if(state.view==='local'){if(state.localLat&&state.localLon){q.set('lat',state.localLat);q.set('lon',state.localLon);if(state.localPlace)q.set('city',state.localPlace)}if(state.localRadius!=='50')q.set('radius',state.localRadius);return '/local'+(q.size?'?'+q.toString():'')}
 if(state.view==='waste'){
  if(state.place!=='WORLD')q.set('place',state.place);
  if(state.wasteTab!=='compare')q.set('wasteTab',state.wasteTab);
  if(state.wasteMetric!=='perPerson')q.set('metric',state.wasteMetric);
  if(state.wasteSeries!=='eu-municipal-gen-kg-hab')q.set('series',state.wasteSeries);
  if(state.compare)q.set('compare',state.compare);
  if(state.wasteQuery)q.set('wq',state.wasteQuery);
  if(state.wasteLevel!=='country')q.set('level',state.wasteLevel);
  if(state.wasteFrom)q.set('fromYear',state.wasteFrom);if(state.wasteTo)q.set('toYear',state.wasteTo);
  if(state.wasteYear!=='latest')q.set('wasteYear',state.wasteYear);
  return '/waste'+(q.size?'?'+q.toString():'');
 }
 if(state.mapPorts!==null)q.set('ports',state.mapPorts?'1':'0');if(state.mapShipping!==null)q.set('shipping',state.mapShipping?'1':'0');
 if(state.portMonth)q.set('portMonth',state.portMonth);if(state.portVessel!=='all')q.set('vessel',state.portVessel);if(state.portId)q.set('port',state.portId);if(state.portsWorldwide)q.set('portsWorld','1');
 if((state.view==='materials'||state.view==='trade')&&state.material!==defaultAtlasState.material)q.set('material',state.material);
 if(state.place!=='WORLD')q.set('place',state.place);
 if((state.view==='materials'||state.view==='trade')&&state.form&&state.form!==profileById(state.material).codes[0])q.set('form',state.form);
 if(state.view==='trade'&&state.product)q.set('product',state.product);
 if(state.productionItem)q.set('item',state.productionItem);if(state.productionYear!=='2024')q.set('productionYear',state.productionYear);
 if(state.layer)q.set('layer',state.layer);
 if(state.network)q.set('network',state.network);
 if(state.journeyLayers)q.set('stages',state.journeyLayers);
 if(state.energyMeasure!=='crude-production')q.set('energy',state.energyMeasure);
 if(state.energyPeriod)q.set('period',state.energyPeriod);
 if(state.energyRegion!=='all')q.set('region',state.energyRegion);
 if(state.dataset!=='commodity')q.set('dataset',state.dataset);
 if(state.direction==='in'&&state.place!=='WORLD')q.set('direction','in');
 if(state.kind!=='wastewater')q.set('kind',state.kind);
 if(state.view==='facilities'){if(state.site)q.set('site',state.site);if(state.siteQuery)q.set('q',state.siteQuery);if(state.siteRegion)q.set('siteRegion',state.siteRegion);if(state.siteType)q.set('type',state.siteType);if(state.siteBasis)q.set('basis',state.siteBasis);if(state.siteSource)q.set('source',state.siteSource);if(state.siteSort==='quantity')q.set('sort','quantity')}
 if(state.placeView==='waste')q.set('lens','waste');
 if(state.wastePlace)q.set('wastePlace',state.wastePlace);
 if(state.accountYear!=='2024')q.set('year',state.accountYear);
 return '/'+state.view+(q.size?'?'+q.toString():'');
}
