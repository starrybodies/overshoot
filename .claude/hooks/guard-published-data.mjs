// PreToolUse hook for Edit/Write/MultiEdit/NotebookEdit: deny edits to a public/data/vN file that is
// already published (exists on origin/main, or on HEAD when origin/main is unknown). New files are allowed.
// The model can recommend a change to published data; it cannot make one. scripts/checks/published-data.mjs
// and CI enforce the same rule for every other way of writing a file.
import {execFileSync} from 'node:child_process';
import {relative,resolve} from 'node:path';

let input='';for await(const chunk of process.stdin)input+=chunk;
const {tool_input:tool={},cwd}=JSON.parse(input||'{}');
const target=tool.file_path||tool.notebook_path;
if(!target)process.exit(0);
const root=process.env.CLAUDE_PROJECT_DIR||cwd||process.cwd();
const path=relative(root,resolve(cwd||root,target)).split('\\').join('/');
if(!/^public\/data\/v\d+\//.test(path))process.exit(0);
const published=ref=>{try{execFileSync('git',['cat-file','-e',`${ref}:${path}`],{cwd:root,stdio:'ignore'});return true}catch{return false}};
const hasOrigin=(()=>{try{execFileSync('git',['rev-parse','--verify','origin/main'],{cwd:root,stdio:'ignore'});return true}catch{return false}})();
if(!published(hasOrigin?'origin/main':'HEAD'))process.exit(0);
console.log(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'deny',permissionDecisionReason:`${path} is a published artifact and immutable. Put corrected data in a new public/data/vN and repoint the code, following packages/overshoot-data/RELEASING.md (production already uses vN numbers above the repo's). Only the owner removes published files, for a licence withdrawal.`}}));
