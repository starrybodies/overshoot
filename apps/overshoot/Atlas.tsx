'use client';
import {lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,ArrowUpRight,BookOpen,Check,Compass,Database,Globe2,Minus,Orbit,Pause,Play,Plus,RotateCcw,Share2} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {MATERIALS,SCENES,type ExtractionData,type Source,type Scene} from '@/packages/overshoot-data/types';
import {getExtraction,formatMass} from '@/packages/overshoot-data/queries';
import {decodeExtractionArtifact,type CompactArtifact} from '@/packages/overshoot-data/artifact';
import {useAtlas,decodeState,encodeState,type AtlasState} from './state';
import {Slider} from './Slider';
import {SceneIcon,MaterialIcon} from './Icons';
import Counter from './Counter';
import {fetchArtifact} from './data';
import {AgricultureDetail} from './Records';
import Provenance from './Provenance';
import {SourceButton} from './SourceButton';
import Query from './Query';
import {registerAtlasTools} from './webmcp';
const SceneDetail=lazy(()=>import('./SceneDetail'));
const Globe=lazy(()=>import('./Globe'));

export default function Atlas({initialState={}}:{initialState?:Partial<Omit<AtlasState,'set'>>}){
 const live=useAtlas();
 const [data,setData]=useState<ExtractionData|null>(null),[sources,setSources]=useState<Source[]>([]);
 const [dataError,setDataError]=useState(''),[source,setSource]=useState<string|null>(null),[asking,setAsking]=useState(false);
 const [playing,setPlaying]=useState(false),[copied,setCopied]=useState(false),[shareUrl,setShareUrl]=useState<string|null>(null),[initialized,setInitialized]=useState(false);
 const s=initialized?live:{...live,...initialState};
 const lastScene=useRef<Scene>(initialState.scene||'extraction');
 const scene=SCENES.find(x=>x.id===s.scene)!,sceneIndex=SCENES.indexOf(scene);
 useEffect(()=>{
  void fetchArtifact('geography.json').catch(()=>{});void fetchArtifact('graticule.json').catch(()=>{});
  const initial=decodeState(new URL(location.href));lastScene.current=initial.scene!;s.set(initial);setInitialized(true);
  function restore(){const decoded=decodeState(new URL(location.href));lastScene.current=decoded.scene!;s.set(decoded)}
  window.addEventListener('popstate',restore);
  Promise.all([fetch('/data/v2/extraction.json').then(r=>{if(!r.ok)throw Error('Extraction snapshot is unavailable.');return r.json()}),fetch('/data/v3/sources.json').then(r=>r.json())])
   .then(([d,p])=>{setData(decodeExtractionArtifact(d as CompactArtifact));setSources(p as Source[]);performance.mark('overshoot-data-ready')}).catch(e=>setDataError(e.message));
  return()=>window.removeEventListener('popstate',restore);
 },[]);
 useEffect(()=>{
  if(!initialized)return;const url=encodeState(s);
  if(lastScene.current!==s.scene){history.pushState({},'',url);lastScene.current=s.scene;if(matchMedia('(max-width: 900px)').matches)window.scrollTo({top:0,behavior:'instant'});}
  else history.replaceState({},'',url);
 },[initialized,s.scene,s.year,s.country,s.material,s.mode,s.metric,s.flow,s.commodity,s.destination,s.site,s.longitude,s.latitude,s.zoom,s.secondary,s.wasteStream,s.siteType,s.stockView,s.wasteScope,s.treatmentYear]);
 useEffect(()=>{if(!playing||!data)return;const timer=setInterval(()=>{const idx=data.years.indexOf(useAtlas.getState().year);s.set({year:data.years[(idx+1)%data.years.length]})},1100);return()=>clearInterval(timer)},[playing,data]);
 useEffect(()=>{if(data)return registerAtlasTools(data)},[data]);
 const country=data?.countries.find(c=>c.id===s.country),label=s.country==='WORLD'?'World':country?.name||s.country;
 const result=data?getExtraction(data,s.country,s.material,s.year,s.metric):null;
 const value=result?.status==='available'?formatMass(result.data.value,s.metric):null;
 const worldRow=data?.rows.find(r=>r.country==='WORLD'&&r.year===s.year);
 const composition=useMemo(()=>MATERIALS.map(m=>{const r=data?getExtraction(data,s.country,m.id,s.year):null;return {...m,value:r?.status==='available'?r.data.value:null}}),[data,s.country,s.year]);
 const total=composition.reduce((a,m)=>a+(m.value??0),0),complete=composition.every(m=>m.value!==null),years=data?.years||[1970,2024];
 function selectCountry(id:string,center?:[number,number]){const position=center||data?.countries.find(c=>c.id===id)?.center;s.set({country:id,destination:'WORLD',site:'',treatmentYear:0,...(id==='WORLD'?{longitude:27,latitude:18,zoom:.55}:position?{longitude:position[0],latitude:Math.max(-75,Math.min(75,position[1])),zoom:1.1}:{})})}
 function navigate(id:Scene){s.set({scene:id,...(id==='discard'&&s.wasteStream==='destinations'?{commodity:s.commodity.startsWith('26')||s.commodity.startsWith('27')||['1001','4403'].includes(s.commodity)?'3915':s.commodity,year:2024}: {})});setPlaying(false)}
 async function share(){try{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),2200)}catch{setShareUrl(location.href)}}
 return <main className={`atlas scene-${s.scene} mode-${s.mode}`}>
  <header className="atlas-header">
   <a className="brand" href="/extraction" onClick={e=>{e.preventDefault();navigate('extraction')}} aria-label="OVERSHOOT home"><span className="brand-orbit"/><span>OVERSHOOT<small>GAIA AI · MATERIAL ATLAS</small></span></a>
   <Tabs value={s.mode} onValueChange={v=>s.set({mode:v as 'story'|'explore'})} className="mode-tabs"><TabsList className="neu-segment"><TabsTrigger value="story"><BookOpen size={17}/>Story</TabsTrigger><TabsTrigger value="explore"><Compass size={17}/>Explore</TabsTrigger></TabsList></Tabs>
   <div className="header-actions"><button className="header-source neu" aria-label="Sources" onClick={()=>setSource('all')}><Database size={20}/><span>Sources</span></button><button className="icon-button neu" onClick={share} aria-label={copied?'Link copied':'Copy link to this atlas state'}>{copied?<Check size={19}/>:<Share2 size={19}/>}</button></div>
  </header>
  <div className="topline">
   <div className="country-control neu"><Globe2 size={20}/><Select value={s.country} onValueChange={selectCountry}><SelectTrigger aria-label="Choose your country" className="country-select"><SelectValue placeholder="World"/></SelectTrigger><SelectContent position="popper" className="country-menu"><SelectItem value="WORLD">World</SelectItem>{data?.countries.filter(c=>c.id!=='WORLD').map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
   <span className="atlas-edition">EXTRACTION → TRADE → STOCK → DISCARD → RETURN</span>
   <Counter annual={worldRow?.total??null} year={s.year} onSource={()=>setSource('irp-2026')}/>
  </div>
  <div className="left-story"><section className="narrative" aria-labelledby="scene-heading">
   <div className="scene-kicker"><span className="scene-symbol neu"><SceneIcon scene={scene.id}/></span><span>{scene.roman} / {scene.name}</span></div>
   <h1 id="scene-heading">{scene.heading.split('\n').map((line,i)=><span key={i}>{line}</span>)}</h1>
   <p className="scene-description">{scene.description}</p>
   {s.scene==='extraction'?<>
    <button className="main-measure" onClick={()=>setSource('irp-2026')} aria-label={`Inspect source for ${value?.number??'loading'} ${value?.unit??''}`}><span className="measure-number">{value?.number??'—'}</span><span className="measure-unit">{value?.unit??(dataError?'snapshot unavailable':'loading source data')}<small>{label} · {s.year}{s.year>=2022?' · estimate':''}</small></span></button>
    {result?.status==='unavailable'&&<p className="data-gap">{result.reason}</p>}
    <SourceButton onClick={()=>setSource('irp-2026')} label="UN International Resource Panel"/>
   </>:<Suspense fallback={<p className="data-gap">Loading source data…</p>}><SceneDetail scene={s.scene} country={s.country} year={s.year} onSource={setSource} placement="narrative"/></Suspense>}
  </section>
  {s.scene==='extraction'&&<section className="composition" aria-label="Extraction composition">
   <div className="composition-top"><span>THE MATERIAL MIX</span><button onClick={()=>s.set({material:'all'})} aria-pressed={s.material==='all'}>All materials</button></div>
   <div className="composition-bar" aria-label="Material composition, widths proportional to tonnes">{composition.map(m=><button key={m.id} title={`${m.name}: ${m.value===null?'not reported':formatMass(m.value).number+' '+formatMass(m.value).unit}`} style={{width:`${total>0?(m.value??0)/total*100:25}%`,background:m.color,opacity:s.material==='all'||s.material===m.id?1:.25}} onClick={()=>s.set({material:s.material===m.id?'all':m.id})} aria-label={`Select ${m.name}`}/>)}</div>
   {!complete&&data&&<p className="composition-gap">Only reported classes are shown. This composition contains gaps.</p>}
   <div className="material-list">{composition.map(m=><button key={m.id} className={s.material===m.id?'selected':''} onClick={()=>s.set({material:s.material===m.id?'all':m.id})} aria-pressed={s.material===m.id} style={{'--material':m.color} as React.CSSProperties}><span className="material-icon"><MaterialIcon material={m.id}/></span><span className="material-name">{m.id==='minerals'?'Minerals':m.name}<small>{m.description}</small></span><strong>{m.value!==null&&total>0&&complete?`${(m.value/total*100).toFixed(1)}%`:'—'}</strong></button>)}</div>
  <AgricultureDetail onSource={setSource}/>
  </section>}
  {(s.scene==='flow'||s.scene==='discard'&&['places','destinations'].includes(s.wasteStream))&&<Suspense fallback={null}><SceneDetail scene={s.scene} country={s.country} year={s.year} onSource={setSource} placement="visual"/></Suspense>}
  </div>
  <div className="atlas-space">
   <Suspense fallback={<div className="globe-loading"><Orbit size={44}/><span>Loading the atlas</span></div>}><Globe data={data} onCountry={selectCountry}/></Suspense>
   {s.scene==='extraction'&&<div className="map-legend"><span>{s.metric==='absolute'?'Annual extraction':'Extraction per person'}</span><div><span>Less</span><i style={{background:`linear-gradient(90deg,#25334c,${MATERIALS.find(m=>m.id===s.material)?.color||'#ffd16c'})`}}/><span>More</span></div><small>Nonlinear color scale · no color means no record</small></div>}
   <div className="globe-tools"><button className="icon-button neu" onClick={()=>s.set({zoom:Math.min(4,s.zoom+.35)})} aria-label="Zoom in"><Plus size={19}/></button><button className="icon-button neu" onClick={()=>s.set({zoom:Math.max(-.5,s.zoom-.35)})} aria-label="Zoom out"><Minus size={19}/></button><button className="icon-button neu" onClick={()=>s.set({longitude:27,latitude:18,zoom:.55})} aria-label="Reset globe"><RotateCcw size={18}/></button></div>
  </div>
  {s.scene!=='extraction'&&s.scene!=='flow'&&!(s.scene==='discard'&&['places','destinations'].includes(s.wasteStream))&&<Suspense fallback={null}><SceneDetail scene={s.scene} country={s.country} year={s.year} onSource={setSource} placement="visual"/></Suspense>}
  <div className="bottom-surface">
   <div className="atlas-controls">
    {s.scene==='extraction'?<><div className="history-control"><button className="play-button neu" onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause history':'Play history'}>{playing?<Pause size={20}/>:<Play size={20}/>}</button><div className="timeline"><div className="timeline-heading"><span>THE MATERIAL AGE</span><strong>{s.year}<small>{s.year>=2022?' EST.':''}</small></strong></div><Slider value={[s.year]} min={years[0]} max={years[years.length-1]} step={1} onValueChange={([year])=>{setPlaying(false);s.set({year})}} aria-label="Extraction year" className="year-slider"/><div className="timeline-years">{[1970,1990,2010,2024].map(year=><button key={year} onClick={()=>{s.set({year});setPlaying(false)}}>{year}</button>)}</div></div></div><Tabs value={s.metric} onValueChange={v=>s.set({metric:v as 'absolute'|'percapita'})} className="metric-tabs"><TabsList className="neu-segment"><TabsTrigger value="absolute">Total</TabsTrigger><TabsTrigger value="percapita">Per person</TabsTrigger></TabsList></Tabs></>:<p className="scene-bottom-note">{s.scene==='stock'?'The built environment is the hidden pile.':s.scene==='return'?'Materials stay, move, dissipate—and sometimes return.':s.scene==='discard'?'Different waste streams. Different reference years.':'Follow reported mass across borders.'}</p>}
    <button className="ask-button neu" onClick={()=>setAsking(true)}><Orbit size={23}/><span>Ask the atlas</span><ArrowUpRight size={18}/></button>
   </div>
   <nav className="scene-rail" aria-label="Five movements" onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=(sceneIndex+(e.key==='ArrowRight'?1:4))%5;navigate(SCENES[next].id);(e.currentTarget.children[next] as HTMLButtonElement).focus()}}}>{SCENES.map((item,index)=><button key={item.id} className={s.scene===item.id?'current':''} onClick={()=>navigate(item.id)} aria-current={s.scene===item.id?'step':undefined} aria-label={`0${index+1} ${item.name}`}><span className="rail-icon"><SceneIcon scene={item.id} size={25}/></span><span>{item.name}</span><span className="rail-number">0{index+1}</span></button>)}</nav>
   <footer className="atlas-footer"><span>A GAIA AI PROJECT</span><button onClick={()=>setSource('all')}>Sources & methodology <ArrowUpRight size={14}/></button><span>Natural Earth · UN IRP</span></footer>
  </div>
  {s.mode==='story'&&sceneIndex<4&&<button className="next-scene" onClick={()=>navigate(SCENES[sceneIndex+1].id)} aria-label={`Next scene: ${SCENES[sceneIndex+1].name}`}><span>Continue to {SCENES[sceneIndex+1].name}</span><ArrowRight size={20}/></button>}
  <div className="sr-only" aria-live="polite">{scene.name}. {label}. {s.year}. {s.scene==='extraction'?(result?.status==='available'?`${result.data.value.toLocaleString()} ${result.data.unit}. Source: UN International Resource Panel.`:result?.status==='unavailable'?result.reason:''):scene.description}</div>
  <Dialog open={shareUrl!==null} onOpenChange={open=>{if(!open)setShareUrl(null)}}><DialogContent className="query-dialog"><DialogTitle>Share this atlas view</DialogTitle><DialogDescription>The link preserves your scene, year, country, material and camera.</DialogDescription><input aria-label="Shareable atlas URL" className="share-input" readOnly value={shareUrl||''} onFocus={event=>event.currentTarget.select()}/></DialogContent></Dialog>
  <Provenance sources={sources} selected={source} onSelect={setSource} onClose={()=>setSource(null)}/><Query open={asking} onClose={()=>setAsking(false)} data={data} onSource={setSource}/>{copied&&<div role="status" className="copy-notice">Atlas link copied</div>}
 </main>;
}
