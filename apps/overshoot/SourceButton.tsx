'use client';
import {Database,ArrowUpRight} from 'lucide-react';
export function SourceButton({onClick,label='Inspect source'}:{onClick:()=>void;label?:string}){return <button className="source-link" onClick={onClick}><Database size={14}/>{label}<ArrowUpRight size={14}/></button>}
