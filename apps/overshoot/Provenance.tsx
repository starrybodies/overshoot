'use client';
import {lazy,Suspense,useMemo,useState} from 'react';
import {ExternalLink,Database,ArrowUpRight,Search,ChevronLeft} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {Source} from '@/packages/overshoot-data/types';

const EvidenceExplorer=lazy(()=>import('./Records').then(m=>({default:m.EvidenceExplorer})));
const statusLabel={available:'ACQUIRED',partial:'PARTIAL SNAPSHOT',blocked:'ACCESS GAP',catalogued:'CATALOGUED'};
export default function Provenance({sources,selected,onSelect,onClose}:{sources:Source[];selected:string|null;onSelect:(id:string)=>void;onClose:()=>void}){
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all');
 const source=sources.find(s=>s.id===selected);
 const loaded=sources.filter(s=>['available','partial'].includes(s.status)).length;
 const catalogued=sources.filter(s=>s.status==='catalogued').length,blocked=sources.filter(s=>s.status==='blocked').length;
 const visible=useMemo(()=>sources.filter(s=>(filter==='all'||filter==='loaded'&&['available','partial'].includes(s.status)||filter==='catalogued'&&s.status==='catalogued'||filter==='blocked'&&s.status==='blocked')&&[s.title,s.publisher,s.dataset,...(s.topics||[])].join(' ').toLowerCase().includes(search.toLowerCase())),[sources,search,filter]);
 return <Dialog open={selected!==null} onOpenChange={open=>{if(!open)onClose()}}><DialogContent className="source-dialog"><DialogTitle>{source?'Behind the data':selected==='records'?'Country evidence':'The source library'}</DialogTitle><DialogDescription>{source?'The original account, its method, and the limits of this snapshot.':'Primary databases across the material system. Acquired data and remaining gaps are shown separately.'}</DialogDescription>{selected==='records'?<><button className="source-link" onClick={()=>onSelect('all')}><ChevronLeft size={16}/>Source library</button><Suspense fallback={<p>Loading records…</p>}><EvidenceExplorer onSource={onSelect}/></Suspense></>:source?<>
  <button className="source-link" onClick={()=>onSelect('all')}><ChevronLeft size={16}/>All sources</button>
  <div className="source-heading"><span className={`source-status ${source.status}`}>{statusLabel[source.status]}</span><h2>{source.title}</h2><p>{source.publisher} · {source.edition}</p></div>
  <dl className="source-details">
   <div><dt>Dataset</dt><dd>{source.dataset}</dd></div><div><dt>Coverage</dt><dd>{source.coverageYears}<br/>{source.geographicCoverage}</dd></div>
   {source.integration&&<div><dt>In OVERSHOOT</dt><dd>{source.integration}</dd></div>}
   {source.accessNote&&<div><dt>Access & gaps</dt><dd>{source.accessNote}</dd></div>}
   <div><dt>Units</dt><dd>{source.units}</dd></div><div><dt>Method</dt><dd>{source.method}</dd></div><div><dt>Transformations</dt><dd>{source.transformations}</dd></div><div><dt>License</dt><dd>{source.license}</dd></div><div><dt>Retrieved</dt><dd>{source.retrievedAt.slice(0,10)}</dd></div>
   {source.downloadUrls&&source.downloadUrls.length>0&&<div><dt>Data access</dt><dd>{source.downloadUrls.map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer" className="source-link">{source.downloadUrls!.length===1?'Dataset download / API':`Data endpoint ${i+1}`}<ExternalLink size={14}/></a>)}</dd></div>}
  </dl><p className="citation">{source.citation}</p><a className="neu-button primary" href={source.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={16}/></a>
 </>:<>
  <button className="neu-button" onClick={()=>onSelect('records')}>Explore acquired country records <ArrowUpRight size={16}/></button><div className="source-coverage"><span><strong>{loaded}</strong>acquired</span><span><strong>{catalogued}</strong>catalogued</span><span><strong>{blocked}</strong>access gaps</span></div>
  <input className="source-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search materials, publishers, databases…" aria-label="Search source databases"/>
  <div className="source-filters" role="group" aria-label="Source availability">{[['all','All sources'],['loaded','Acquired'],['catalogued','Catalogued'],['blocked','Access gaps']].map(([id,label])=><button key={id} onClick={()=>setFilter(id)} aria-pressed={filter===id}>{label}</button>)}</div>
  <div className="source-list">{visible.map(s=><button key={s.id} onClick={()=>onSelect(s.id)}><span><strong>{s.title}</strong><small>{s.publisher} · {s.coverageYears}</small></span><span className={`source-status ${s.status}`}>{statusLabel[s.status]}</span><ArrowUpRight size={17}/></button>)}{!visible.length&&<p className="source-empty">No databases match this search.</p>}</div>
 </>}</DialogContent></Dialog>;
}
