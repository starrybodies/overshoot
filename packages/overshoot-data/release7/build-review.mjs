import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const output=process.argv[2];
if(!output||!path.isAbsolute(output))throw new Error('Pass an absolute output HTML path');
const temp=await mkdtemp(path.join(os.tmpdir(),'overshoot-review-'));
try{
 await build({configFile:false,root,plugins:[react()],resolve:{alias:{'@':root}},define:{'process.env.NODE_ENV':'"production"'},build:{outDir:temp,emptyOutDir:true,cssCodeSplit:false,lib:{entry:path.join(root,'apps/overshoot/journey/standalone.tsx'),name:'OvershootReview',formats:['iife'],fileName:()=> 'journey.js',cssFileName:'journey'},minify:true}});
 const js=(await readFile(path.join(temp,'journey.js'),'utf8')).replaceAll('</script','<\\/script');
 const css=(await readFile(path.join(temp,'journey.css'),'utf8')).replaceAll('</style','<\\/style');
 await writeFile(output,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>OVERSHOOT · Follow waste</title><style>html,body{margin:0;padding:0;background:#101d2b}button,input{font:inherit}button{border:0}svg{vertical-align:middle}*{box-sizing:border-box}${css}</style></head><body><div id="root"></div><noscript>This interactive review needs JavaScript enabled. All records and sources are embedded in the file.</noscript><script>${js}</script></body></html>`);
 console.log(`Review saved: ${output}`);
}finally{await rm(temp,{recursive:true,force:true})}
