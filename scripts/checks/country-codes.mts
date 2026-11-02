import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {handleMcpRequest} from '../../packages/material-world/mcp';
import {runQuery,knownCountries,isoCodeFor,type AssetReader} from '../../packages/material-world/query';
const read:AssetReader=async<T,>(path:string)=>{const b=await readFile(new URL('../../public'+path,import.meta.url));return JSON.parse((b[0]===31&&b[1]===139?gunzipSync(b):b).toString()) as T};
const known=await knownCountries(read);

// A well-formed but unknown code is an error that names the likely ISO code, not an empty "matched 0".
for(const [name,input,likely] of [['facilities',{country:'GER',kind:'energy'},'DEU'],['trade',{country:'NED'},'NLD'],['waste_history',{series:'eu-municipal-gen-kg-hab',countries:['DEU','SUI']},'CHE'],['energy',{country:'KSA',measure:'crude-production'},'SAU'],['research_path',{material:'glass',place:'GER'},'DEU'],['coverage',{country:'XYZ'},null],['mineral_production',{series:'copper-mine',country:'CHI'},'CHL'],['trade',{country:'CHI'},'CHL'],['facilities',{country:'CHI',kind:'mining'},'CHL']] as const)
 await assert.rejects(runQuery(name,input,read),e=>e instanceof Error&&e.message.startsWith('Unknown country code')&&(!likely||e.message.includes(likely)),`${name} ${JSON.stringify(input)}`);
const mcp=await handleMcpRequest(new Request('https://overshoot.gaiaai.xyz/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'facilities',arguments:{country:'GER',kind:'energy',limit:1}}})}),read);
const call=(await mcp.json() as {result:{isError:boolean;content:Array<{text:string}>}}).result;
assert.equal(call.isError,true);assert.match(call.content[0].text,/DEU \(Germany\)/);

// Valid codes, including the non-ISO codes the data uses, still work with the tools that have data for them.
assert((await runQuery('facilities',{country:'DEU',kind:'energy',limit:1},read)).matched as number>0);
assert((await runQuery('facilities',{country:'ZNC',kind:'mining',limit:1},read)).matched as number>0);
assert((await runQuery('facilities',{country:'UNASSIGNED',kind:'river',limit:1},read)).matched as number>0);
assert((await runQuery('waste_compare',{country:'CHI'},read)).matched as number>0,'CHI is the Channel Islands in waste_compare');
const reads:string[]=[];await runQuery('waste_catalog',{country:'WORLD'},p=>{reads.push(p);return read(p)});
assert(!reads.includes('/data/v11/countries.json'),'WORLD needs no country-directory read');
await runQuery('research_path',{material:'glass',place:'BC'},read);
await assert.rejects(runQuery('material_accounts',{country:'ZNC'},read),/Unknown country\./,'material_accounts keeps its own directory check');

// Every code in the data the query tools read is accepted, and every suggestion is itself valid.
const collect=(x:unknown,codes:Set<string>):void=>{if(Array.isArray(x)){x.forEach(v=>collect(v,codes));return}if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){if(['country','reporter','partner','origin','destination'].includes(k)&&typeof v==='string'&&/^(?:[A-Z]{3}|UNASSIGNED)$/.test(v))codes.add(v);if(k==='countries'&&v&&typeof v==='object'&&!Array.isArray(v))Object.keys(v).filter(c=>/^(?:[A-Z]{3}|UNASSIGNED)$/.test(c)).forEach(c=>codes.add(c));collect(v,codes)}};
const energy=await read<{measures:Array<{id:string}>}>('/data/v13/energy/catalog.json'),waste=await read<{series:Array<{path:string}>}>('/data/v18/waste/catalog.json');
const journeys=(await readdir(new URL('../../public/data/v16/journeys/',import.meta.url))).filter(f=>f.endsWith('.json')&&!f.startsWith('layer-')).map(f=>'/data/v16/journeys/'+f);
const paths=['/data/v15/facilities/catalog.json','/data/v16/maritime/ports.json','/data/v15/trade.json','/data/v16/oil-imports.json','/data/v13/energy/catalog.json',...energy.measures.map(m=>`/data/v13/energy/${m.id}.json`),'/data/v18/waste/catalog.json',...waste.series.map(s=>s.path),'/data/v18/waste/city-collection.json','/data/v35/cement-country.json','/data/v35/steel-country.json','/data/v39/usgs-minerals-2025.json','/data/v30/coal-paths.json','/data/v28/connections.json',...journeys];
const codes=new Set<string>();for(const path of paths)collect(await read(path),codes);
const rejected=[...codes].filter(c=>!known.has(c));
assert.deepEqual(rejected,[],`codes used by the data but rejected by the query layer: ${rejected.join(', ')}`);
// World Bank waste place records (waste_compare, and the waste tool's own place ids) include CHI, the Channel Islands.
const compareCodes=new Set<string>();for(const path of ['/data/v18/waste/comparison.json','/data/v12/waste-index.json'])collect(await read(path),compareCodes);
const compareKnown=await knownCountries(read,'waste_compare'),compareRejected=[...compareCodes].filter(c=>!compareKnown.has(c));
assert.deepEqual(compareRejected,[],`waste_compare codes rejected: ${compareRejected.join(', ')}`);
for(const [wrong,iso] of Object.entries(isoCodeFor)){assert(!known.has(wrong),`${wrong} is a valid code and must not be rewritten`);assert(known.has(iso),`${iso} is not a known code`)}
console.log(`PASS: unknown country codes rejected with ISO suggestions (also over MCP; CHI suggests CHL outside waste_compare); ${codes.size} codes in ${paths.length} files the tools read all accepted; ${Object.keys(isoCodeFor).length} suggestions valid.`);
