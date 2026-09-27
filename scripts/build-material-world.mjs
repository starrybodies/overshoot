import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync,gunzipSync} from 'node:zlib';
import {build} from 'vite';
import react from '@vitejs/plugin-react';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const target=resolve(process.argv[2]||resolve(root,'outputs/Overshoot-Reimagined.html'));
const bundleDir=resolve(root,'outputs/material-world-bundle');
await build({configFile:false,root,publicDir:false,plugins:[react()],resolve:{alias:{'@':root}},define:{'process.env.NODE_ENV':'"production"'},build:{outDir:bundleDir,emptyOutDir:true,lib:{entry:resolve(root,'apps/overshoot/world/standalone.tsx'),formats:['iife'],name:'OvershootMaterialWorld',fileName:()=> 'review.js',cssFileName:'review'},cssCodeSplit:false,reportCompressedSize:false}});
const paths=['/data/v2/countries.json','/data/v2/geography.json','/data/v2/trade.json','/data/v2/mining-sites.geojson','/data/v2/landfill-sites.geojson','/data/v6/country-codes.json','/data/v8/copper-world.json'];
for(const folder of ['bc','copper'])for(const file of await readdir(resolve(root,'public/data/v6',folder)))if(/\.json(?:\.gz)?$/.test(file))paths.push(`/data/v6/${folder}/${file}`);
const resources={};
for(const path of paths){const bytes=await readFile(resolve(root,'public'+path));resources[path]=(bytes[0]===31&&bytes[1]===139?bytes:gzipSync(bytes)).toString('base64')}
const css=await readFile(resolve(bundleDir,'review.css'),'utf8');
const js=await readFile(resolve(bundleDir,'review.js'),'utf8');
await mkdir(dirname(target),{recursive:true});
await writeFile(target,`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>OVERSHOOT — Reimagined review</title><style>${css.replaceAll('</style','<\\/style')}</style></head><body><div id="root"></div><script id="overshoot-resources" type="application/json">${JSON.stringify(resources)}</script><script>${js.replaceAll('</script','<\\/script')}</script></body></html>`);
// Validate embedded resources without altering source records.
for(const [path,encoded] of Object.entries(resources))JSON.parse(gunzipSync(Buffer.from(encoded,'base64')).toString());
console.log(`Created ${target} with ${paths.length} self-contained data snapshots.`);
