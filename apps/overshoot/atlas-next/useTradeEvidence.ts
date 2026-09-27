'use client';
import {useMemo} from 'react';
import {selectTradeEvidence,tradeBasis} from '@/packages/material-world/trade';
import {useMaterialArtifact} from '../material-data';
import {normalizeTrade,type Country,type Flow,type TradeRecord} from '../world/model';
import type {BCObservation,Product} from '../material-model';
import type {Profile} from './data';
export type TradeCatalog={source:Record<string,string>;products:Product[];year:number;recordCount:number};
type Options={profile:Profile;place:string;form:string;productKey?:string;direction:'in'|'out';countries:Country[];estimates?:boolean;measure?:'quantity'|'value';allProducts?:boolean};
/** One reporting and unit policy for the material map and full trade ledger. */
export function useTradeEvidence({profile,place,form,productKey='',direction,countries,estimates=false,measure='quantity',allProducts=false}:Options){
 const bc=place==='BC'||place==='SSI',world=place==='WORLD';
 const names=useMemo(()=>new Map(countries.map(c=>[c.id,c.name])),[countries]);
 const catalog=useMaterialArtifact<TradeCatalog>(bc?'/data/v6/bc/catalog.json.gz':null);
 const codes=useMaterialArtifact<Record<string,string>>(bc?'/data/v6/country-codes.json':null);
 const options=useMemo(()=>(catalog.data?.products||[]).filter(p=>allProducts||!!form&&p.hs6.startsWith(form)),[catalog.data,allProducts,form]);
 const product=options.find(p=>p.hs6+':'+p.unit===productKey)||options.find(p=>['KGM','TNE'].includes(p.unit))||options[0];
 const bcData=useMaterialArtifact<BCObservation[]>(bc&&product?'/data/v6/bc/'+product.hs6.slice(0,2)+'.json.gz':null);
 const copperCatalog=useMaterialArtifact<{reporters:string[]}>(profile.id==='copper'&&!bc?'/data/v6/copper/catalog.json':null);
 const copperSupported=world||!!copperCatalog.data?.reporters.includes(place);
 const copper=useMaterialArtifact<{flows:TradeRecord[];estimated_flows:TradeRecord[]}>(profile.id==='copper'&&!bc&&copperSupported?(world?'/data/v8/copper-world.json':'/data/v6/copper/'+place+'.json.gz'):null);
 const generic=useMaterialArtifact<{flows:TradeRecord[];reporters:string[];coverage_note:string}>(!bc?'/data/v15/trade.json':null);
 const oil=useMaterialArtifact<{flows:TradeRecord[];reporters:string[]}>(!bc&&['2709','2710'].includes(form)?'/data/v16/oil-imports.json':null);
 const flows=useMemo(()=>{
  if(bc){if(direction==='in')return [];return (bcData.data||[]).filter(r=>r.hs6===product?.hs6&&r.unit===product?.unit).map(r=>{
   const amount=measure==='value'?r.valueCAD:r.unit==='KGM'?r.quantity/1000:r.quantity;
   const unit=measure==='value'?'C$ · reported value':r.unit==='KGM'?(r.quantityBasis.includes('contained metal')?'tonnes · contained metal':'tonnes · source quantity'):r.unit==='TNE'?'tonnes':r.unitLabel;
   return{id:r.id,origin:'BC',destination:codes.data?.[r.destination]||r.destination,originLabel:'British Columbia',destinationLabel:r.destinationLabel,amount,unit,year:r.year,estimated:false,basis:measure==='value'?'Reported domestic export value in Canadian dollars.':r.quantityBasis,sourceUrl:catalog.data?.source.url||'https://www150.statcan.gc.ca/',record:r as unknown as Record<string,unknown>} as Flow;
  }).sort((a,b)=>b.amount-a.amount)}
  const extra=selectTradeEvidence(generic.data?.flows||[],oil.data?.flows||[],place,direction,form);
  const specialist=[...(copper.data?.flows||[]),...(estimates?copper.data?.estimated_flows||[]:[])].filter(r=>r.commodity===form&&(world?r.reported_flow==='X':r.reporter===place&&r.reported_flow===(direction==='out'?'X':'M')));
  // Never merge an import declaration with an export declaration for the same flow.
  const rows=profile.id!=='copper'?extra:!world&&direction==='in'&&copperSupported?specialist:[...new Map([...extra,...specialist].map(r=>[[r.origin,r.destination,r.commodity,r.year,r.reporter,r.reported_flow,r.hs_revision].join('|'),r])).values()];
  return rows.map(r=>normalizeTrade(r,names)).sort((a,b)=>b.amount-a.amount);
 },[bc,direction,bcData.data,product,codes.data,catalog.data,measure,profile.id,copper.data,copperSupported,estimates,form,world,place,generic.data,oil.data,names]);
 const loading=!!oil.path&&!oil.data&&!oil.error|| (bc?(!catalog.data||!codes.data||!!product&&!bcData.data):!generic.data||profile.id==='copper'&&(!copperCatalog.data||copperSupported&&!copper.data));
 const error=catalog.error||codes.error||bcData.error||copperCatalog.error||copper.error||generic.error||oil.error;
 const quality=useMaterialArtifact<{notes:{origin:string;destination:string;commodity:string;exporter_reported_tonnes:number;importer_reported_tonnes:number}[]}>(profile.id==='copper'&&!bc?'/data/v2/trade-quality.json':null);
 const disagreement=quality.data?.notes.find(n=>n.commodity===form&&flows.some(f=>f.origin===n.origin&&f.destination===n.destination));
 const reportingBasis=bc?'provincial':tradeBasis(flows.map(f=>f.record as unknown as TradeRecord),direction,place);
 const reporterCount=new Set([...(generic.data?.reporters||[]),...(profile.id==='copper'?copperCatalog.data?.reporters||[]:[])]).size;
 return {flows,loading,error,catalog,options,product,names,bc,world,disagreement,reportingBasis,reporterCount};
}
