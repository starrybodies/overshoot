// Runs every offline check in scripts/checks and fails if any fails. `pnpm check` calls this after the
// typecheck and unit tests. Checks that need a build (map-worker) or the network (live-parity) run separately.
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const dir=fileURLToPath(new URL('.',import.meta.url));
const separate=new Set(['run.mjs','map-worker.mjs','live-parity.mts']);
const checks=readdirSync(dir).filter(f=>/\.m[jt]s$/.test(f)&&!separate.has(f)).sort();
const failed=[];
for(const file of checks){
 const started=performance.now();
 const result=spawnSync(process.execPath,[...(file.endsWith('.mts')?['--import','tsx']:[]),dir+file],{encoding:'utf8',timeout:180_000});
 const seconds=((performance.now()-started)/1000).toFixed(1),output=(result.stdout+result.stderr).trim();
 if(result.status===0){console.log(`ok   ${file} (${seconds}s) ${output.split('\n').filter(l=>/^(PASS|SKIP)/.test(l)).map(l=>l.slice(0,110)).join(' | ')}`);continue}
 failed.push(file);
 console.log(`FAIL ${file} (${seconds}s)\n${output.split('\n').slice(-25).join('\n')}`);
}
console.log(failed.length?`\n${failed.length} of ${checks.length} checks failed: ${failed.join(', ')}`:`\nAll ${checks.length} checks passed.`);
process.exit(failed.length?1:0);
