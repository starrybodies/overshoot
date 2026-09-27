import {flushSync} from 'react-dom';

let activeTransition:ViewTransition|undefined;
export function moveToView(update:()=>void,scroll=false){
 const commit=()=>{flushSync(update);if(scroll)window.scrollTo({top:0,behavior:'instant'})};
 if(!document.startViewTransition||window.matchMedia('(prefers-reduced-motion: reduce)').matches){commit();return}
 activeTransition?.skipTransition();
 activeTransition=document.startViewTransition(commit);
 activeTransition.finished.catch(()=>{});
}
