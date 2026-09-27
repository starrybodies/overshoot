import {env} from 'cloudflare:workers';
import type {AssetReader} from './query';

/** Each record chunk is at most 2,000 rows. Do not cache full country tables in Worker memory. */
export function assetReader(request:Request):AssetReader{
  const origin=new URL(request.url).origin;
  return async <T>(path:string):Promise<T>=>{
    if(!/^\/data\/v\d+\/[A-Za-z0-9_./-]+\.json$/.test(path)||path.includes('..'))throw Error('Invalid data path.');
    const assets=(env as unknown as {ASSETS:Fetcher}).ASSETS;
    const response=await assets.fetch(new Request(origin+path));
    if(!response.ok)throw Error('This record is not available in the retained snapshot.');
    const bytes=new Uint8Array(await response.arrayBuffer());
    const text=bytes[0]===31&&bytes[1]===139?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text():new TextDecoder().decode(bytes);
    return JSON.parse(text) as T;
  };
}
