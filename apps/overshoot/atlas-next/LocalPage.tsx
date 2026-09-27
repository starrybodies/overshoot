'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,LocateFixed,MapPin,Search} from 'lucide-react';
import WorldMap from '../world/WorldMap';
import type {Country,SiteFeature,Flow} from '../world/model';
import {facilityKinds,kindLabels,type FacilityPin} from '@/packages/material-world/model';
import type {AtlasState} from './atlasState';
import {AtlasLink} from './AtlasLink';
import {atlasUrl,defaultAtlasState} from './atlasState';
import {number} from './common';
import {findLocalCities,normalizePlace,type LocalCity} from './localCities';
import './local.css';

type Nearby=FacilityPin&{kind:string;distanceKm:number;sourceUrl:string;sourceTitle:string};
type LocalResult={location:{latitude:number;longitude:number;radiusKm:number;country:string|null;countryName:string|null;countryMethod:string;countryBoundary:string};counts:Record<string,number>;matched:number;records:Nearby[];nationalExtraction:null|{year:number;tonnes:number|null;estimated:boolean;source:{title?:string;url?:string}|null};definitions:{nearby:string;extraction:string;river:string};coverage:string};
const noFlows:Flow[]=[];
export default function LocalPage({state,countries,onChange}:{state:AtlasState;countries:Country[];onChange:(patch:Partial<AtlasState>)=>void}){
 const [lat,setLat]=useState(state.localLat),[lon,setLon]=useState(state.localLon);
 const [cityQuery,setCityQuery]=useState(state.localPlace),[cityResults,setCityResults]=useState<LocalCity[]>([]);
 const [cityOpen,setCityOpen]=useState(false),[cityLoading,setCityLoading]=useState(false),[cityError,setCityError]=useState(''),[activeCity,setActiveCity]=useState(0);
 const displayLanguage=typeof navigator==='undefined'?'en':navigator.language||'en';
 const regionNames=useMemo(()=>new Intl.DisplayNames([displayLanguage],{type:'region'}),[displayLanguage]);
 function cityLabel(city:LocalCity){return [city[0],normalizePlace(city[4])===normalizePlace(city[0])?'':city[4],regionNames.of(city[3])||city[3]].filter(Boolean).join(', ')}
 const [data,setData]=useState<LocalResult|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[located,setLocated]=useState(''),[selected,setSelected]=useState('');
 useEffect(()=>{setLat(state.localLat);setLon(state.localLon)},[state.localLat,state.localLon]);
 useEffect(()=>{setCityQuery(state.localPlace)},[state.localPlace]);
 useEffect(()=>{
  if(!cityOpen||normalizePlace(cityQuery).length<2){setCityResults([]);setCityLoading(false);return}
  let active=true;setCityLoading(true);setCityError('');
  const region=typeof navigator==='undefined'?'':navigator.language.split('-')[1]?.toUpperCase()||'';
  const timer=setTimeout(()=>{findLocalCities(cityQuery,region).then(results=>{if(active){setCityResults(results);setActiveCity(0)}}).catch(()=>{if(active){setCityResults([]);setCityError('Live place search is unavailable. Try a nearby town or enter coordinates below.')}}).finally(()=>{if(active)setCityLoading(false)})},350);
  return()=>{active=false;clearTimeout(timer)};
 },[cityQuery,cityOpen]);
 useEffect(()=>{if(cityOpen&&cityResults.length)document.getElementById(`lc-city-option-${activeCity}`)?.scrollIntoView({block:'nearest'})},[activeCity,cityOpen,cityResults]);
 useEffect(()=>{
  if(!state.localLat||!state.localLon)return;
  const controller=new AbortController();setLoading(true);setError('');setData(null);
  const input={latitude:Number(state.localLat),longitude:Number(state.localLon),radiusKm:Number(state.localRadius)};
  fetch('/api/material-world?'+new URLSearchParams({query:'local_context',input:JSON.stringify(input)}),{signal:controller.signal,cache:'no-store'})
   .then(async r=>{const result=await r.json() as LocalResult&{error?:string};if(!r.ok)throw Error(result.error||'Location query failed');return result as LocalResult})
   .then(setData).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Location unavailable')})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[state.localLat,state.localLon,state.localRadius]);
 const points=useMemo<SiteFeature[]>(()=>!data?[]:[{type:'Feature',geometry:{type:'Point',coordinates:[data.location.longitude,data.location.latitude]},properties:{id:'research-point',name:'Selected location',type:'Search centre',country:data.location.country||'WORLD',source_id:'user-coordinate',year:null,value:null,unit:'',metric:'Search point',basis:'location'}},...data.records.map(r=>({type:'Feature' as const,geometry:{type:'Point' as const,coordinates:r.coordinates},properties:{id:r.id,name:r.name,type:r.type,country:r.country,source_id:r.source,year:r.year,value:r.value,unit:r.unit,metric:r.metric,basis:r.basis}}))],[data]);
 const visible=selected?data?.records.find(r=>r.id===selected):null;
 function submit(e:React.FormEvent){e.preventDefault();const a=Number(lat),b=Number(lon);if(!lat.trim()||!lon.trim()||!Number.isFinite(a)||!Number.isFinite(b)||a< -90||a>90||b< -180||b>180){setError('Enter a latitude from −90 to 90 and a longitude from −180 to 180.');return}setSelected('');setCityQuery('');setCityOpen(false);onChange({localLat:a.toFixed(5),localLon:b.toFixed(5),localPlace:''})}
 function selectCity(city:LocalCity){const label=cityLabel(city);setCityQuery(label);setCityOpen(false);setCityResults([]);setLat(city[1].toFixed(5));setLon(city[2].toFixed(5));setLocated('');setSelected('');onChange({localLat:city[1].toFixed(5),localLon:city[2].toFixed(5),localPlace:label})}
 function choose(id:string){const c=countries.find(x=>x.id===id);if(!c?.center)return;setCityQuery('');setCityOpen(false);setSelected('');setLocated('Using the country centre as a starting point. Search for a city to refine this location.');onChange({localLat:c.center[1].toFixed(5),localLon:c.center[0].toFixed(5),localPlace:''})}
 function locate(){if(!navigator.geolocation){setLocated('Location services are unavailable here. Search for a city or enter coordinates.');return}setLocated('Requesting your approximate position…');navigator.geolocation.getCurrentPosition(p=>{setLocated('Showing records near your position.');setCityQuery('');setCityOpen(false);setSelected('');onChange({localLat:p.coords.latitude.toFixed(5),localLon:p.coords.longitude.toFixed(5),localPlace:''})},()=>setLocated('Location access was unavailable. Search for a city or enter coordinates.'),{enableHighAccuracy:false,timeout:12000})}
 return <div className="lc-page">
  <header className="lc-intro"><span className="oa-kicker">LOCAL LENS / WORLDWIDE</span><h1>What happens near here?</h1><p>Search for a city or town to see nearby mines, industry, energy and waste sites on the map. Open each record to inspect its source.</p></header>
  <div className="lc-search">
   <div className="lc-search-title"><MapPin size={19}/><strong>Start with a city or town</strong><span>Select a place to open its map and report.</span></div>
   <div className="lc-place-row">
    <div className="lc-city" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setCityOpen(false)}}>
     <label htmlFor="lc-city-input">City or town</label>
     <div className="lc-city-input"><Search size={18}/><input id="lc-city-input" type="search" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={cityOpen&&normalizePlace(cityQuery).length>=2} aria-controls="lc-city-options" aria-activedescendant={cityOpen&&cityResults.length?`lc-city-option-${activeCity}`:undefined} value={cityQuery} placeholder="Search any city, e.g. Vancouver" onFocus={()=>setCityOpen(true)} onChange={e=>{setCityQuery(e.target.value);setCityOpen(true)}} onKeyDown={e=>{
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setCityOpen(true);setActiveCity(i=>Math.max(0,Math.min(cityResults.length-1,i+(e.key==='ArrowDown'?1:-1))))}
      if(e.key==='Escape')setCityOpen(false);
      if(e.key==='Enter'){e.preventDefault();if(cityOpen&&cityResults[activeCity])selectCity(cityResults[activeCity])}
     }}/></div>
     {cityOpen&&normalizePlace(cityQuery).length>=2&&<div className="lc-city-options" id="lc-city-options" role="listbox" aria-label="Matching cities">
      {cityLoading?<p role="status">Looking up places…</p>:cityError?<p role="alert">{cityError}</p>:cityResults.length?cityResults.map((city,i)=><button type="button" role="option" aria-selected={activeCity===i} id={`lc-city-option-${i}`} key={`${city[0]}-${city[1]}-${city[2]}-${city[3]}`} className={activeCity===i?'active':''} onMouseEnter={()=>setActiveCity(i)} onClick={()=>selectCity(city)}><MapPin size={15}/><span><strong>{city[0]}</strong><small>{cityLabel(city).slice(city[0].length+2)}</small></span></button>):<p>No matching place found. Try a nearby town or use coordinates.</p>}
     </div>}
    </div>
    <label className="lc-radius">Radius<select value={state.localRadius} onChange={e=>onChange({localRadius:e.target.value})}>{[10,25,50,100,250].map(n=><option key={n} value={n}>{n} km</option>)}</select></label>
    <button className="lc-geolocate" type="button" onClick={locate}><LocateFixed size={17}/>Use my position</button>
   </div>
   {state.localPlace&&state.localLat&&state.localLon&&<p className="lc-current"><MapPin size={15}/> Showing records near <strong>{state.localPlace}</strong> · {state.localLat}°, {state.localLon}°</p>}
   <details className="lc-coordinate-entry"><summary>Use coordinates or a country centre</summary><form onSubmit={submit}><div className="lc-fields"><label>Latitude<input type="number" step="any" min="-90" max="90" value={lat} onChange={e=>setLat(e.target.value)} placeholder="−90 to 90" required/></label><label>Longitude<input type="number" step="any" min="-180" max="180" value={lon} onChange={e=>setLon(e.target.value)} placeholder="−180 to 180" required/></label><button className="oa-button" type="submit">Investigate coordinates</button></div></form><label className="lc-country-label">Or begin at a country centre<select value="" onChange={e=>choose(e.target.value)}><option value="">Choose a country…</option>{countries.filter(c=>c.center).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><p>Coordinates also work for places missing from the city index.</p></details>
   {located&&<p role="status" className="lc-status">{located}</p>}
   <p className="lc-attribution">Place names: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> via <a href="https://www.npmjs.com/package/cities.json" target="_blank" rel="noreferrer">cities.json</a> · CC BY 4.0. Missing places are searched on demand through <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon / OpenStreetMap</a>. Salt Spring Island and Ganges points: <a href="https://geonames.nrcan.gc.ca/search-place-names/unique?id=JAYLV" target="_blank" rel="noreferrer">Canadian Geographical Names</a>. A place point anchors a search; it is not a source of material-flow data.</p>
  </div>
  {error&&<p className="lc-error" role="alert">{error}</p>}{loading&&<p className="lc-status" role="status">Searching the retained location records…</p>}
  {data&&<><div className="lc-result-head" id="local-results"><div><span className="oa-kicker">{state.localPlace||data.location.countryName||'SELECTED COORDINATE'} · WITHIN {number(data.location.radiusKm,0)} KM</span><h2>{number(data.matched,0)} nearby source records</h2><p>{data.definitions.nearby} No matches mean no retained records, not no activity.</p></div><span>{data.location.latitude.toFixed(5)}°, {data.location.longitude.toFixed(5)}° · {data.location.countryMethod}</span></div>
   <div className="lc-grid"><div className="lc-map"><WorldMap key={`${state.localLat},${state.localLon}`} flows={noFlows} sites={points} countries={countries} place={data.location.country||'WORLD'} selected={selected||'research-point'} onSite={s=>setSelected(s.properties.id==='research-point'?'':s.properties.id)} onFlow={()=>{}} onPlace={choose} color="#b5653c" siteView/><p>The map shows the 60 nearest source locations. Zoom for detail; the radius is measured from the search coordinate.</p></div><div className="lc-summary"><h3>What the records show</h3><div className="lc-kind-list">{facilityKinds.map(k=><button key={k} onClick={()=>{const first=data.records.find(r=>r.kind===k);if(first)setSelected(first.id)}} disabled={!data.counts[k]}><span>{kindLabels[k]}</span><strong>{number(data.counts[k]||0,0)}</strong></button>)}</div><div className="lc-national"><span>COUNTRY CONTEXT · DIFFERENT GEOGRAPHY</span><h3>{data.location.countryName||'Country not resolved'}</h3>{data.nationalExtraction?<><strong>{data.nationalExtraction.tonnes==null?'Unavailable':number(data.nationalExtraction.tonnes/1e6,1)+' million tonnes'}</strong><p>All materials extracted nationally · {data.nationalExtraction.year}{data.nationalExtraction.estimated?' · source estimate':''}. This is not extraction within the selected radius.</p>{data.nationalExtraction.source?.url&&<a href={data.nationalExtraction.source.url} target="_blank" rel="noreferrer">Original source <ArrowUpRight size={14}/></a>}</>:<p>No national extraction observation matched this coordinate in the retained account.</p>}{data.location.country&&<AtlasLink href={atlasUrl({...defaultAtlasState,view:'places',place:data.location.country})} onNavigate={()=>onChange({view:'places',place:data.location.country!})}>Open country account <ArrowRight size={15}/></AtlasLink>}</div></div></div>
   <section className="lc-records"><div><span className="oa-kicker">NEAREST RETAINED LOCATIONS</span><h2>Inspect a record</h2><p>First 60 by distance · source dates and quantities vary. Select a row to locate its marker.</p></div>{data.records.length?<div className="lc-record-list">{data.records.map(r=><div className={'lc-record'+(selected===r.id?' active':'')} key={r.kind+':'+r.id}><button onClick={()=>setSelected(selected===r.id?'':r.id)}><span><small>{kindLabels[r.kind as keyof typeof kindLabels]} · {r.distanceKm} km · {r.basis}</small><strong>{r.name}</strong><em>{r.type} · {r.year||'year not supplied'}</em></span><ArrowRight size={17}/></button>{visible?.id===r.id&&<div className="lc-record-detail"><p>{r.value==null?'No quantity reported':number(r.value,2)+' '+r.unit+' · '+r.metric}. A point alone does not establish an operating rate or a connection to another site.</p><a href={`/facilities?kind=${r.kind}&place=${r.country}&site=${encodeURIComponent(r.id)}`}>Full source record <ArrowUpRight size={14}/></a><a href={r.sourceUrl} target="_blank" rel="noreferrer">{r.sourceTitle} <ArrowUpRight size={14}/></a></div>}</div>)}</div>:<p className="lc-empty">No source locations within this radius. Increase the radius, or inspect the source coverage by country.</p>}</section>
   <p className="lc-method">{data.definitions.extraction} {data.definitions.river} {data.location.countryBoundary}</p>
  </>}
 </div>
}
