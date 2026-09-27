import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
const root=process.cwd(),out=path.join(root,'public/data/v9');
fs.mkdirSync(out,{recursive:true});
for(const file of ['treatment-latest.json','weee-treatment-latest.json']){
 fs.copyFileSync(path.join(root,'packages/overshoot-data/expanded/destinations/normalized',file),path.join(out,file));
}
const dir=path.join(root,'public/data/v6/bc'),products=new Map();
for(const file of fs.readdirSync(dir).filter(f=>/^\d{2}\.json\.gz$/.test(f))){
 for(const row of JSON.parse(gunzipSync(fs.readFileSync(path.join(dir,file))))){
  if(!products.has(row.hs6))products.set(row.hs6,{hs6:row.hs6,commodity:row.commodity,valueCAD:0,destinations:{},units:{}});
  const p=products.get(row.hs6);
  p.valueCAD+=row.valueCAD;
  p.destinations[row.destinationLabel]=(p.destinations[row.destinationLabel]||0)+row.valueCAD;
  p.units[row.unit]=(p.units[row.unit]||0)+row.quantity;
 }
}
const result={year:2024,basis:'Domestic exports from the province of production; rankings by reported Canadian-dollar value. Product quantities retain their own native units.',products:[...products.values()].sort((a,b)=>b.valueCAD-a.valueCAD)};
fs.writeFileSync(path.join(out,'bc-export-basket.json'),JSON.stringify(result));
console.log('Published '+products.size+' BC commodity summaries and the unchanged national treatment snapshots.');
