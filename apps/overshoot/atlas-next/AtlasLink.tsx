'use client';
import type {AnchorHTMLAttributes} from 'react';

// Native navigation works before hydration and for modified/new-tab clicks.
// Ordinary clicks keep the atlas context and its page transition.
export function AtlasLink({onNavigate,...props}:Omit<AnchorHTMLAttributes<HTMLAnchorElement>,'onClick'>&{href:string;onNavigate:()=>void}){
 return <a {...props} onClick={event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||props.target&&props.target!=='_self')return;
  event.preventDefault();onNavigate();
 }}/>;
}
