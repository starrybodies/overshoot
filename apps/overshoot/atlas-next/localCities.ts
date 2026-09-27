export type LocalCity=[name:string,latitude:number,longitude:number,country:string,region:string];
const cache=new Map<string,LocalCity[]>();
const pending=new Map<string,Promise<LocalCity[]>>();
const remoteCache=new Map<string,LocalCity[]>();
// Official Canadian Geographical Names points. The island point is an area centre,
// while Ganges is a community point; neither represents an address or shipment.
const additionalPlaces:LocalCity[]=[
 ['Salt Spring Island',48.81389,-123.49722,'CA','British Columbia'],
 ['Saltspring Island',48.81389,-123.49722,'CA','British Columbia'],
 ['Ganges',48.85,-123.5,'CA','British Columbia'],
];

export function normalizePlace(value:string){
 return value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}

async function findAdditionalPlace(query:string):Promise<LocalCity[]>{
 if(query.length<4)return [];
 if(remoteCache.has(query))return remoteCache.get(query)!;
 const url=new URL('https://photon.komoot.io/api/');
 url.searchParams.set('q',query);url.searchParams.set('limit','8');
 const response=await fetch(url,{signal:AbortSignal.timeout(5500)});
 if(!response.ok)throw new Error('Live place search is unavailable.');
 const result=await response.json() as {features?:Array<{geometry?:{coordinates?:number[]};properties?:Record<string,unknown>}>};
 const places:LocalCity[]=[];
 for(const feature of result.features||[]){
  const p=feature.properties||{},coordinates=feature.geometry?.coordinates;
  if(!['city','town','village','hamlet','locality','island'].includes(String(p.type||'')))continue;
  if(!Array.isArray(coordinates)||!Number.isFinite(coordinates[0])||!Number.isFinite(coordinates[1])||Math.abs(coordinates[0])>180||Math.abs(coordinates[1])>90)continue;
  const name=String(p.name||''),country=String(p.countrycode||'').toUpperCase();
  if(!name||!/^[A-Z]{2}$/.test(country))continue;
  places.push([name,coordinates[1],coordinates[0],country,String(p.state||'')]);
 }
 remoteCache.set(query,places);
 return places;
}

function shardFor(query:string){
 const point=query.codePointAt(0)!;
 return point<128?query[0]:'u-'+(point>>>8).toString(16).padStart(2,'0');
}

export async function findLocalCities(input:string,localeCountry=''){
 const query=normalizePlace(input.split(',')[0]);
 if(query.length<2)return [];
 const shard=shardFor(query);
 let cities=cache.get(shard);
 if(!cities){
  let request=pending.get(shard);
  if(!request){
   request=fetch(`/data/v19/cities/${shard}.json`).then(async response=>{
    if(response.status===404)return [];
    if(!response.ok)throw new Error('Place search is temporarily unavailable.');
    const entries=await response.json() as LocalCity[];
    cache.set(shard,entries);
    return entries;
   }).finally(()=>pending.delete(shard));
   pending.set(shard,request);
  }
  cities=await request;
 }
 const matches:LocalCity[]=[];
 const seen=new Set<string>();
 for(const city of [...additionalPlaces,...cities]){
  const name=normalizePlace(city[0]);
  if(!name.startsWith(query)&&!name.split(' ').some(word=>word.startsWith(query)))continue;
  const key=`${city[0]}|${city[1]}|${city[2]}|${city[3]}`;
  if(seen.has(key))continue;
  seen.add(key);
  matches.push(city);
 }
 matches.sort((a,b)=>{
  const score=(city:LocalCity)=>{const name=normalizePlace(city[0]);return name===query?0:name.startsWith(query)?1:2};
  return score(a)-score(b)||Number(b[3]===localeCountry)-Number(a[3]===localeCountry)||a[0].localeCompare(b[0])||a[3].localeCompare(b[3]);
 });
 if(matches.length)return matches.slice(0,12);
 return findAdditionalPlace(input.trim().slice(0,120));
}
