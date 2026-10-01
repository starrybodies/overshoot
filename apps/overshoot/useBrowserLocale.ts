import {useSyncExternalStore} from 'react';

const subscribe=()=>()=>{};

// Server and hydration render use 'en'; the browser language applies right after.
export function useBrowserLocale(){
 return useSyncExternalStore(subscribe,()=>navigator.language||'en',()=>'en');
}
