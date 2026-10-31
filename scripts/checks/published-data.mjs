// Published artifacts under public/data/vN/ are immutable (README "Project layout", apps/overshoot/BUILD.md).
// Fails when a file that exists at the base revision was modified, deleted, renamed or changed type. New files
// and new vN directories pass. Compares the base revision with the working tree, so uncommitted edits count.
// Base: CHECK_BASE (CI sets it), else the merge-base with origin/main or local main.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<28});
const tryGit=(...args)=>{try{return git(...args).trim()}catch{return ''}};
const commit=ref=>ref&&!/^0+$/.test(ref)&&tryGit('rev-parse','--verify','--quiet',ref+'^{commit}');
let base=commit(process.env.CHECK_BASE),note='';
if(process.env.CHECK_BASE&&!base){
 // A force-push or a new branch: the pushed-over commit is not in this clone. Check the newest commit instead.
 base=commit('HEAD^')||'HEAD';note=` (CHECK_BASE ${process.env.CHECK_BASE.slice(0,12)} is not in this clone; compared with ${base==='HEAD'?'HEAD':'HEAD^'})`;
}
base||=commit(tryGit('merge-base','HEAD','origin/main'))||commit(tryGit('merge-base','HEAD','main'));
if(!base){base='HEAD';note=' (no origin/main or main: only uncommitted changes were compared)'}

// Owner-approved removals only, e.g. a reuse or licence withdrawal. Each entry: {"path":"public/data/...","reason":"..."}.
const exceptions=new Set(JSON.parse(readFileSync(new URL('./published-data-exceptions.json',import.meta.url),'utf8')).map(e=>{if(!e.reason)throw Error('Exception without a reason: '+e.path);return e.path}));
const fields=git('diff','-z','--no-renames','--name-status','--diff-filter=DMT',base,'--','public/data').split('\0');
const changed=[];
for(let i=0;i+1<fields.length;i+=2)if(/^public\/data\/v\d+\//.test(fields[i+1])&&!exceptions.has(fields[i+1]))changed.push([fields[i],fields[i+1]]);

if(changed.length){
 console.error(`FAIL: ${changed.length} published artifact(s) changed relative to ${base.slice(0,12)}${note}:`);
 for(const [status,path] of changed.slice(0,40))console.error(`  ${{M:'modified',D:'deleted',T:'type changed'}[status]} ${path}`);
 if(changed.length>40)console.error(`  ...and ${changed.length-40} more`);
 console.error('Published vN files are immutable. Restore them and put corrected data in a new public/data/vN; see packages/overshoot-data/RELEASING.md (run `pnpm check:live` first: production may already use higher vN numbers). A licence withdrawal by the owner goes in scripts/checks/published-data-exceptions.json with a reason.');
 process.exit(1);
}
console.log(`${note.includes('only uncommitted')?'SKIP: committed changes not checked'+note+'; ':''}PASS: no published public/data/vN file modified or deleted relative to ${base.slice(0,12)}${note.includes('only uncommitted')?'':note}.`);
