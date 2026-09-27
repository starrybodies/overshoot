'use client';
import { useEffect, useRef, useState } from 'react';
import { annualRate } from '@/packages/overshoot-data/queries';
export default function Counter({annual,year,onSource}:{annual:number|null;year:number;onSource:()=>void}){
 const [value,setValue]=useState(0), accumulated=useRef(0), last=useRef<number|null>(null);
 useEffect(()=>{last.current=performance.now();const tick=()=>{const now=performance.now();if(annual!==null&&last.current!==null)accumulated.current+=(now-last.current)/1000*annualRate(annual,year);last.current=now;setValue(accumulated.current)};const id=window.setInterval(tick,250);return()=>{tick();clearInterval(id)}},[annual,year]);
 return <button className="planet-counter" onClick={onSource} aria-label={`Material extracted during this visit: ${Math.floor(value).toLocaleString()} tonnes. Inspect annual-rate source.`}><span className="counter-title"><span className="counter-dot"/> EXTRACTED WHILE YOU WERE HERE</span><span className="counter-number">{Math.floor(value).toLocaleString('en-US')}<small> t</small></span><span className="counter-note">{annual===null?'Awaiting source data':`Estimated at the ${year} annual rate`} ↗</span></button>
}
