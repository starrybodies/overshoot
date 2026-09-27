'use client';
import {useEffect,useState} from 'react';
const cache=new Map<string,Promise<unknown>>();
let loadArtifact:(path:string)=>Promise<Response>=(path)=>fetch(path);
export function configureMaterialArtifactLoader(loader:(path:string)=>Promise<Response>){loadArtifact=loader;cache.clear()}
export function materialArtifact<T>(path:string):Promise<T>{let found=cache.get(path);if(!found){found=loadArtifact(path).then(async r=>{if(!r.ok)throw new Error('This snapshot could not be loaded. Please try again.');const bytes=new Uint8Array(await r.arrayBuffer());const data=bytes[0]===31&&bytes[1]===139?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text():new TextDecoder().decode(bytes);return JSON.parse(data)});cache.set(path,found);if(cache.size>14){const oldest=cache.keys().next().value;if(oldest)cache.delete(oldest)}found.catch(()=>cache.delete(path))}return found as Promise<T>}
export function useMaterialArtifact<T>(path:string|null){const [state,setState]=useState<{path:string|null;data:T|null;error:string}>({path:null,data:null,error:''});useEffect(()=>{if(!path)return;let active=true;materialArtifact<T>(path).then(data=>{if(active)setState({path,data,error:''})},e=>{if(active)setState({path,data:null,error:String(e.message)})});return()=>{active=false}},[path]);return state.path===path?state:{path,data:null,error:''}}
