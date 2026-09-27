'use client';
import {ArrowUpRight} from 'lucide-react';
import {useMaterialArtifact} from '../material-data';
import {compact} from './common';
import type {EnergyCatalog} from './EnergyMap';
type Coverage=Record<string,Record<string,{period:string;value:number}>>;
export default function CountryEnergy({place,onOpen}:{place:string;onOpen:(measure:string)=>void}){
 const data=useMaterialArtifact<Coverage>('/data/v13/energy/coverage.json');
 const catalog=useMaterialArtifact<EnergyCatalog>('/data/v13/energy/catalog.json');
 const records=data.data?.[place];
 const measures=['crude-production','gas-production','coal-production'];
 if(!records||!catalog.data)return null;
 return <section className="oa-energy-country" id="place-energy"><span className="oa-kicker">FUELS · EIA INTERNATIONAL ENERGY STATISTICS</span><h2>Oil, natural gas & coal</h2><div className="oa-energy-country-grid">{measures.map(id=>{const record=records[id],measure=catalog.data!.measures.find(m=>m.id===id)!;return <button key={id} onClick={()=>onOpen(id)}><span>{measure.name}</span><strong>{record?compact(record.value):'No value'}</strong><small>{measure.unit}{record?' · '+record.period:''} <ArrowUpRight size={13} style={{display:'inline'}}/></small></button>})}</div><p className="oa-small">Latest available year for each measure. Crude oil includes lease condensate; natural gas uses dry-gas volume. Open a measure for history, country comparisons and the original record.</p></section>;
}
