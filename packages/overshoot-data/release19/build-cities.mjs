// Rebuild with: node packages/overshoot-data/release19/build-cities.mjs
// Source: cities.json 1.1.64, derived from the GeoNames cities1000 gazetteer.
// The original package archive and its CC BY 4.0 license are retained in raw/.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const here=dirname(fileURLToPath(import.meta.url));
const archive=resolve(here,'raw/cities.json-1.1.64.tgz');
const output=resolve(here,'../../../public/data/v19/cities');
const unpack=(filename)=>JSON.parse(execFileSync('tar',['-xOf',archive,`package/${filename}`],{maxBuffer:40*1024*1024}).toString());
const cities=unpack('cities.json');
const regions=new Map(unpack('admin1.json').map(region=>[region.code,region.name]));
const fold=(s)=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const bucket=(s)=>s.codePointAt(0)<128?s[0]:'u-'+(s.codePointAt(0)>>>8).toString(16).padStart(2,'0');
const shards=new Map();
const canonical=new Map();
function index(name,entry){
 const words=fold(name).split(' ');
 for(const word of new Set([words[0],...words.slice(1).filter(word=>word.length>2)])){
  const key=bucket(word);
  if(!shards.has(key))shards.set(key,[]);
  shards.get(key).push(entry);
 }
}
for(const city of cities){
 const name=fold(city.name);
 if(!name)continue;
 const region=regions.get(`${city.country}.${city.admin1}`)||'';
 const entry=[city.name,+city.lat,+city.lng,city.country,region];
 canonical.set(`${city.country}|${name}`,entry);
 index(city.name,entry);
}
// A few widely used alternate names absent from this edition of cities1000.
// They point to coordinates already in the source; no location is invented.
for(const [alias,source,country] of [
 ['Ulaanbaatar','Ulan Bator','MN'],['Kiev','Kyiv','UA'],['Saigon','Ho Chi Minh City','VN'],
 ['Rangoon','Yangon','MM'],['Bangalore','Bengaluru','IN'],['Bombay','Mumbai','IN'],
 ['Calcutta','Kolkata','IN'],['Madras','Chennai','IN'],['Peking','Beijing','CN'],
]){
 const match=canonical.get(`${country}|${fold(source)}`);
 if(!match)throw new Error(`Missing source coordinate for ${alias}`);
 index(alias,[alias,...match.slice(1)]);
}
mkdirSync(output,{recursive:true});
for(const [name,entries] of shards){
 entries.sort((a,b)=>a[0].localeCompare(b[0],'en')||a[3].localeCompare(b[3]));
 writeFileSync(resolve(output,`${name}.json`),JSON.stringify(entries));
}
writeFileSync(resolve(output,'provenance.json'),JSON.stringify({source:'GeoNames Gazetteer through cities.json',package:'cities.json@1.1.64',archiveSha256:createHash('sha256').update(readFileSync(archive)).digest('hex'),license:'CC BY 4.0',url:'https://www.geonames.org/',packageUrl:'https://www.npmjs.com/package/cities.json',cities:cities.length,shards:shards.size,note:'Populated places with at least 1,000 inhabitants or administrative seats in the upstream cities1000 index; not every settlement or address. Nine common alternate names are resolved to matching source coordinates.'}));
console.log(`${cities.length} cities in ${shards.size} searchable shards`);
