import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {runQuery,type AssetReader} from '../../packages/material-world/query';

const root=new URL('../../',import.meta.url);
const read:AssetReader=async<T,>(path:string)=>JSON.parse(await readFile(new URL('public'+path,root),'utf8')) as T;
type Row={country:string;plants:number;cementMtpa?:number;capacityMtpa?:number|null;bofMtpa?:number|null;eafMtpa?:number|null};
type Table={rows:Row[];world:Row;sourceTables:Record<string,{sha256:string}>};
for(const [material,file,count] of [['concrete','cement-country.json',171],['steel','steel-country.json',84]] as const){
 const table=await read<Table>('/data/v35/'+file);
 assert.equal(table.rows.length,count);
 assert.equal(new Set(table.rows.map(r=>r.country)).size,count);
 assert(table.rows.every(r=>r.country!=='WORLD'&&r.plants>=0));
 for(const [id,meta] of Object.entries(table.sourceTables)){
  const filename={cementCapacity:'operating-capacity.csv',cementPlants:'operating-plants.csv',steelCapacity:'steel-operating-capacity.csv',steelPlants:'steel-operating-plants.csv'}[id as 'cementCapacity'];
  assert.equal(createHash('sha256').update(await readFile(new URL('../../packages/overshoot-data/release35/raw/'+filename,import.meta.url))).digest('hex'),meta.sha256);
 }
 const usa=await runQuery('industrial_capacity',{material,country:'USA'},read);
 assert.equal(usa.matched,1);
 assert.equal((usa.rows as Row[])[0].country,'USA');
 const world=await runQuery('industrial_capacity',{material,country:'WORLD',limit:2,offset:0},read);
 assert.equal(world.matched,count);assert.equal((world.rows as Row[]).length,2);
 assert.deepEqual(world.world,table.world);
}
const steel=await read<Table>('/data/v35/steel-country.json');
assert.equal(steel.world.capacityMtpa,2228.713);
assert.equal(steel.world.plants,970);
assert(steel.rows.some(r=>r.capacityMtpa===null&&r.plants>0));
const cement=await read<Table>('/data/v35/cement-country.json');
assert.equal(cement.world.cementMtpa,5651.9);
assert.equal(cement.world.plants,3455);
assert.equal(cement.rows.find(r=>r.country==='CAN')?.cementMtpa,22.1);
await assert.rejects(runQuery('industrial_capacity',{material:'glass'},read));
console.log('PASS: GEM raw hashes, country mapping, independent world totals, null capacity, bounded industrial-capacity queries.');
