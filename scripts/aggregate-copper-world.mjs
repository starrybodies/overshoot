import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const folder=resolve(root,'public/data/v6/copper');
const output={flows:[],estimated_flows:[]};
for(const file of (await readdir(folder)).filter(f=>f.endsWith('.json.gz')).sort()){
 const data=JSON.parse(gunzipSync(await readFile(resolve(folder,file))).toString());
 for(const field of Object.keys(output))output[field].push(...(data[field]||[]).filter(r=>r.reported_flow==='X'));
}
await mkdir(resolve(root,'public/data/v8'),{recursive:true});
await writeFile(resolve(root,'public/data/v8/copper-world.json'),JSON.stringify(output));
console.log(`Aggregated ${output.flows.length} reported and ${output.estimated_flows.length} source-estimated export records; import ledgers remain separate.`);
