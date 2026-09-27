import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';

// This regression only appears in the production bundle: MapLibre's default
// worker URL points beside its original module, not Vite's application chunk.
const root=path.resolve('dist/client');
const entries=await readdir(root,{recursive:true});
const workers=entries.filter(file=>/maplibre-gl-worker-[\w-]+\.js$/.test(file));
assert.ok(workers.length,'The production build must include the MapLibre worker.');
const chunks=entries.filter(file=>/_next\/static\/chunks\/.*\.js$/.test(file));
const code=(await Promise.all(chunks.map(file=>readFile(path.join(root,file),'utf8')))).join('\n');
for(const file of workers){
 assert.ok(code.includes('/'+file),`The map must use the emitted worker URL: /${file}`);
 const worker=await readFile(path.join(root,file),'utf8');
 assert.ok((await stat(path.join(root,file))).size>100000,'The worker must contain the bundled renderer code.');
 assert.ok(!/\bfrom\s*["']\.\//.test(worker),'The worker must not reference an unshipped sibling module.');
}
console.log(`PASS: ${workers.length} MapLibre worker asset(s) shipped and referenced by the production map.`);
