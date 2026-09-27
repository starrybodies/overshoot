import React from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/syne';
import '@/app/globals.css';
import {configureMaterialArtifactLoader} from '../material-data';
import MaterialWorld from './MaterialWorld';

// The review export contains the same dated records as the hosted interface.
const resources:Record<string,string>=JSON.parse(document.getElementById('overshoot-resources')!.textContent!);
configureMaterialArtifactLoader(async path=>{
 const encoded=resources[path];
 if(!encoded)return new Response('This snapshot is not included.',{status:404});
 const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
 return new Response(bytes);
});
createRoot(document.getElementById('root')!).render(<React.StrictMode><MaterialWorld offline/></React.StrictMode>);
