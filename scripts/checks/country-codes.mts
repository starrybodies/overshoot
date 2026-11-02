import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {handleMcpRequest} from '../../packages/material-world/mcp';
import {runQuery,knownCountries,isoCodeFor,type AssetReader} from '../../packages/material-world/query';
const read:AssetReader=async<T,>(path:string)=>{const b=await readFile(new URL('../../public'+path,import.meta.url));return JSON.parse((b[0]===31&&b[1]===139?gunzipSync(b):b).toString()) as T};
const known=await knownCountries(read);

// A well-formed but unknown code is an error that names the likely ISO code, not an empty "matched 0".
for(const [name,input,likely] of [['facilities',{country:'GER',kind:'energy'},'DEU'],['trade',{country:'NED'},'NLD'],['waste_history',{series:'eu-municipal-gen-kg-hab',countries:['DEU','SUI']},'CHE'],['energy',{country:'KSA',measure:'crude-production'},'SAU'],['research_path',{material:'glass',place:'GER'},'DEU'],['coverage',{country:'XYZ'},null]] as const)
 await assert.rejects(runQuery(name,input,read),e=>e instanceof Error&&e.message.startsWith('Unknown country code')&&(!likely||e.message.includes(likely)),`${name} ${JSON.stringify(input)}`);
const mcp=await handleMcpRequest(new Request('https://overshoot.gaiaai.xyz/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'facilities',arguments:{country:'GER',kind:'energy',limit:1}}})}),read);
const call=(await mcp.json() as {result:{isError:boolean;content:Array<{text:string}>}}).result;
assert.equal(call.isError,true);assert.match(call.content[0].text,/DEU \(Germany\)/);

// Valid codes, including the non-ISO codes the data uses, still work.
assert((await runQuery('facilities',{country:'DEU',kind:'energy',limit:1},read)).matched as number>0);
assert((await runQuery('facilities',{country:'ZNC',kind:'mining',limit:1},read)).matched as number>0);
for(const country of ['WORLD','UNASSIGNED','CHI','UKN'])await runQuery('waste_catalog',{country:country==='UNASSIGNED'?'WORLD':country},read);
await runQuery('research_path',{material:'glass',place:'BC'},read);
await assert.rejects(runQuery('material_accounts',{country:'CHI'},read),/Unknown country\./,'material_accounts keeps its own directory check');

// Every code in the catalogs the query tools read is accepted, and every suggestion is itself valid.
const codes=new Set<string>();
const walk=(x:unknown):void=>{if(Array.isArray(x)){x.forEach(walk);return}if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){if(['country','reporter','partner','origin','destination'].includes(k)&&typeof v==='string'&&/^[A-Z]{3}$/.test(v))codes.add(v);if(k==='countries'&&v&&typeof v==='object'&&!Array.isArray(v))Object.keys(v).filter(c=>/^[A-Z]{3}$/.test(c)).forEach(c=>codes.add(c));walk(v)}};
for(const path of ['/data/v15/facilities/catalog.json','/data/v16/maritime/ports.json','/data/v15/trade.json','/data/v16/oil-imports.json','/data/v13/energy/catalog.json','/data/v18/waste/catalog.json','/data/v18/waste/city-collection.json','/data/v18/waste/comparison.json','/data/v12/waste-index.json','/data/v35/cement-country.json','/data/v35/steel-country.json','/data/v39/usgs-minerals-2025.json','/data/v30/coal-paths.json','/data/v28/connections.json','/data/v16/journeys/copper.json','/data/v16/journeys/fuels.json'])walk(await read(path));
const rejected=[...codes].filter(c=>!known.has(c));
assert.deepEqual(rejected,[],`codes used by the data but rejected by the query layer: ${rejected.join(', ')}`);
for(const [wrong,iso] of Object.entries(isoCodeFor)){assert(!known.has(wrong),`${wrong} is a valid code and must not be rewritten`);assert(known.has(iso),`${iso} is not a known code`)}
console.log(`PASS: unknown country codes rejected with ISO suggestions (also over MCP); ${codes.size} codes used by the query data all accepted; ${Object.keys(isoCodeFor).length} suggestions valid.`);
