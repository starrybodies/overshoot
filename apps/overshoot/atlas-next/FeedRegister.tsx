'use client';
import {ArrowRight,ArrowUpRight,Download} from 'lucide-react';
import {useMaterialArtifact} from '../material-data';
import {ErrorState,Loading} from './common';
import type {AtlasState} from './atlasState';
type Feed={id:string;title:string;topic:string;status:string;url:string;method:string;coverage:string;refresh:string;rights:string;limitations:string;repo?:string;downloadUrl?:string;metadataUrl?:string;termsUrl?:string;destination?:Partial<AtlasState>};
export default function FeedRegister({query,onGo}:{query:string;onGo:(v:Partial<AtlasState>)=>void}){
 const data=useMaterialArtifact<{reviewedAt:string;refreshMode:string;statusLabels:Record<string,string>;feeds:Feed[]}>('/data/v16/feeds.json');
 if(data.error)return <ErrorState message={data.error}/>;
 if(!data.data)return <Loading/>;
 const feeds=data.data.feeds.filter(f=>[f.title,f.topic,f.method,f.coverage,f.status].join(' ').toLowerCase().includes(query.toLowerCase()));
 return <section className="oa-feed-guide"><h3>Feeds & remaining gaps</h3><p>{data.data.feeds.length} priority sources, with acquisition methods, repositories and reuse notes. “Access checked” means a source endpoint or its documentation was reached; it does not mean its records are in this app.</p><p className="oa-small">Reviewed {data.data.reviewedAt}. {data.data.refreshMode}</p><a className="oa-text-link" href="/data/v16/source-guide.md" download><Download size={15}/>Download the source & method register</a>
 {feeds.map(f=><details key={f.id} className="oa-source-detail"><summary><strong>{f.title}</strong><small>{f.topic}</small><span className={'oa-feed-status '+f.status}>{data.data!.statusLabels[f.status]}</span></summary><div><p>{f.coverage}</p><p><b>Acquisition:</b> {f.method}</p><p><b>Refresh method:</b> {f.refresh}</p><p><b>Reuse:</b> {f.rights}</p><p><b>Limits:</b> {f.limitations}</p><div className="oa-feed-links"><a className="oa-text-link" href={f.url} target="_blank" rel="noreferrer">Publisher<ArrowUpRight size={14}/></a>{f.repo&&<a className="oa-text-link" href={f.repo} target="_blank" rel="noreferrer">Repository<ArrowUpRight size={14}/></a>}{f.downloadUrl&&<a className="oa-text-link" href={f.downloadUrl} target="_blank" rel="noreferrer">Source download<ArrowUpRight size={14}/></a>}{f.metadataUrl&&<a className="oa-text-link" href={f.metadataUrl} target="_blank" rel="noreferrer">Documentation<ArrowUpRight size={14}/></a>}{f.termsUrl&&<a className="oa-text-link" href={f.termsUrl} target="_blank" rel="noreferrer">Reuse terms<ArrowUpRight size={14}/></a>}</div>{f.destination&&<button className="oa-button outline" onClick={()=>onGo(f.destination!)}>Open the imported records<ArrowRight size={15}/></button>}</div></details>)}
 {!feeds.length&&<p className="oa-small">No priority feed matches this search.</p>}</section>;
}
