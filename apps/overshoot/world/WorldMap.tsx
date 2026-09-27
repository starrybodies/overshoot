'use client';
import {Component,lazy,Suspense,useState,useMemo} from 'react';
import AtlasMap from './AtlasMap';
import type {CountryLayer} from './AtlasMap';
import type {Country,Flow,SiteFeature} from './model';
import './map.css';
import {useMaritimeLayers} from './MaritimeContext';
import EnvironmentalContext from './EnvironmentalContext';
import type {EnvironmentLayer} from '@/packages/material-world/environment';
import {useAppTheme} from '../atlas-next/AppTheme';
export type {CountryLayer};
export type WorldMapProps={transportDefault?:boolean;shippingDensity?:boolean;raster?:EnvironmentLayer;countryLayer?:CountryLayer;focusCoordinates?:[number,number][];focusKey?:string;flows:Flow[];sites:SiteFeature[];countries:Country[];place:string;selected:string;onFlow:(f:Flow)=>void;onSite:(s:SiteFeature)=>void;onPlace:(p:string)=>void;color:string;siteView:boolean};
class MapBoundary extends Component<{children:React.ReactNode;fallback:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
const GeographicMap=lazy(()=>import('./GeographicMap'));
export default function WorldMap(props:WorldMapProps){
 const {dark}=useAppTheme();
 const visibleColor=dark&&/^#[0-9a-f]{6}$/i.test(props.color)?'#'+[1,3,5].map(i=>Math.round(parseInt(props.color.slice(i,i+2),16)*.5+127.5).toString(16).padStart(2,'0')).join(''):props.color;
 const [raster,setRaster]=useState<EnvironmentLayer|undefined>(props.raster);
 const maritime=useMaritimeLayers(props.place,props.transportDefault);
 const mapSites=useMemo(()=>[...props.sites,...maritime.features],[props.sites,maritime.features]);
 const mapProps={...props,raster,color:visibleColor,shippingDensity:maritime.density,sites:mapSites,selected:maritime.selected||props.selected,onSite:(s:SiteFeature)=>{if(s.properties.transport)maritime.onPort(s);else {maritime.clearPort();props.onSite(s)}}};
 const [atlas,setAtlas]=useState(false),[reason,setReason]=useState('');
 return <div className="oa-geography"><EnvironmentalContext layer={raster} onChange={setRaster}/>{maritime.controls}
  {atlas?<><div className="oa-map-fallback">{reason||'Atlas view · works without 3D graphics'}{!reason&&<button onClick={()=>{setAtlas(false);setReason('')}}>Open interactive map</button>}</div><AtlasMap {...mapProps}/></>:<MapBoundary fallback={<><p className="oa-map-fallback">Using the atlas map. All records are available.</p><AtlasMap {...mapProps}/></>}><Suspense fallback={<div className="oa-map-loading" role="status">Loading the interactive map…</div>}><GeographicMap {...mapProps} onFallback={(message='')=>{setReason(message);setAtlas(true)}}/></Suspense></MapBoundary>}
 {maritime.inspector}</div>
}
