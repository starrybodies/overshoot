// Published artifacts under public/data/vN/ are immutable (README "Project layout", apps/overshoot/BUILD.md).
// Fails when a file that exists at the base revision was modified, deleted or renamed. New files and new vN
// directories pass. Compares the base revision with the working tree, so uncommitted edits are caught too.
// Base: CHECK_BASE (CI sets it), else the merge-base with origin/main, else HEAD.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const tryGit=(...args)=>{try{return git(...args)}catch{return ''}};
const base=process.env.CHECK_BASE||tryGit('merge-base','HEAD','origin/main')||'HEAD';
git('rev-parse','--verify',base+'^{commit}');

// Owner-approved removals only, e.g. a reuse or licence withdrawal. Each entry: {"path":"public/data/...","reason":"..."}.
const exceptions=new Set(JSON.parse(readFileSync(new URL('./published-data-exceptions.json',import.meta.url),'utf8')).map(e=>{if(!e.reason)throw Error('Exception without a reason: '+e.path);return e.path}));
const changed=git('diff','--no-renames','--name-status','--diff-filter=MD',base,'--','public/data').split('\n').filter(Boolean).map(line=>line.split('\t')).filter(([,path])=>/^public\/data\/v\d+\//.test(path)&&!exceptions.has(path));

if(changed.length){
 console.error(`FAIL: ${changed.length} published artifact(s) changed relative to ${base.slice(0,12)}:`);
 for(const [status,path] of changed.slice(0,40))console.error(`  ${status==='M'?'modified':'deleted '} ${path}`);
 if(changed.length>40)console.error(`  ...and ${changed.length-40} more`);
 console.error('Published vN files are immutable. Restore them, put corrected data in a new public/data/vN (one above the highest existing N) and repoint the code. A licence withdrawal by the owner goes in scripts/checks/published-data-exceptions.json with a reason.');
 process.exit(1);
}
console.log(`PASS: no published public/data/vN file modified or deleted relative to ${base.slice(0,12)}.`);
