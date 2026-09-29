'use client';
import {createContext,useContext,useEffect,useState,useRef,type Dispatch,type SetStateAction} from 'react';
import type {TransportSelection} from '@/packages/material-world/maritime';
export const TransportContext=createContext<{state:TransportSelection;update:(patch:Partial<TransportSelection>)=>void}|null>(null);
/** A null map toggle takes the view's default; an explicit choice survives navigation. */
export function useTransportField<K extends keyof TransportSelection>(key:K,initial:NonNullable<TransportSelection[K]>):[NonNullable<TransportSelection[K]>,Dispatch<SetStateAction<NonNullable<TransportSelection[K]>>>]{
 const context=useContext(TransportContext),[local,setLocal]=useState(initial);
 const value=(context?context.state[key]??initial:local) as NonNullable<TransportSelection[K]>;
 const current=useRef({context,value});useEffect(()=>{current.current={context,value}});
 const set:Dispatch<SetStateAction<NonNullable<TransportSelection[K]>>>=update=>{
  const next=typeof update==='function'?update(current.current.value):update;
  if(current.current.context)current.current.context.update({[key]:next});else setLocal(next);
 };
 return [value,set];
}
