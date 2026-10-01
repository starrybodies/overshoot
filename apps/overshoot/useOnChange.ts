import {useState} from 'react';

// Runs `reset` during render on mount and whenever any dep changes, so state derived from props is
// reset before paint without an effect-driven extra render.
export function useOnChange(deps:readonly unknown[],reset:()=>void){
 const [prev,setPrev]=useState<readonly unknown[]|null>(null);
 if(!prev||prev.length!==deps.length||prev.some((d,i)=>!Object.is(d,deps[i]))){setPrev(deps);reset()}
}
