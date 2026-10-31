// Stop hook: before a turn that changed code or data may end, `pnpm check` must pass.
// Bounded loop: blocks at most twice per session with the failing output, then lets the turn end with a
// warning so the failure is reported instead of retried forever. Skips when nothing relevant changed
// since the last passing run. Set OVERSHOOT_SKIP_STOP_CHECK=1 to turn it off for a session.
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';

let input='';for await(const chunk of process.stdin)input+=chunk;
const {session_id:session='session'}=JSON.parse(input||'{}');
const root=process.env.CLAUDE_PROJECT_DIR||process.cwd();
const git=(...args)=>{try{return execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:1<<28})}catch{return ''}};
const say=message=>{console.log(JSON.stringify({systemMessage:message}));process.exit(0)};
if(process.env.OVERSHOOT_SKIP_STOP_CHECK==='1')process.exit(0);

const relevant=/^(app|apps|packages|public\/data|scripts|lib|components|hooks|sites\/more-water)\/|^(package\.json|pnpm-lock\.yaml|tsconfig\.json|eslint-suppressions\.json)$/;
const base=git('merge-base','HEAD','origin/main').trim()||'HEAD';
const untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(f=>relevant.test(f));
const changed=[...git('diff','--name-only',base).split('\n').filter(f=>relevant.test(f)),...untracked];
if(!changed.length)process.exit(0);
if(!existsSync(join(root,'node_modules/.bin/tsx')))say('pnpm check was skipped: dependencies are not installed (pnpm install --frozen-lockfile).');

const gitDir=join(root,git('rev-parse','--git-dir').trim()||'.git');
const passFile=join(gitDir,'overshoot-check-pass'),attemptsFile=join(gitDir,`overshoot-check-attempts-${session.replace(/[^\w-]/g,'')}`);
const hash=createHash('sha256').update(git('rev-parse','HEAD')+git('diff',base));
for(const f of untracked)hash.update(f).update(readFileSync(join(root,f)));
const fingerprint=hash.digest('hex');
if(existsSync(passFile)&&readFileSync(passFile,'utf8')===fingerprint)process.exit(0);

const run=spawnSync('pnpm',['-s','check'],{cwd:root,encoding:'utf8',timeout:270_000,maxBuffer:1<<26});
if(run.error)say(`pnpm check could not run: ${run.error.message}`);
if(run.status===0){writeFileSync(passFile,fingerprint);rmSync(attemptsFile,{force:true});process.exit(0)}
const attempts=existsSync(attemptsFile)?Number(readFileSync(attemptsFile,'utf8')):0;
if(attempts>=2){rmSync(attemptsFile,{force:true});say('pnpm check is still failing after 2 repair attempts. Report the failing check and its output to the user instead of retrying.')}
writeFileSync(attemptsFile,String(attempts+1));
const output=(run.stdout+run.stderr).trim().split('\n').slice(-40).join('\n');
console.log(JSON.stringify({decision:'block',reason:`pnpm check failed (repair attempt ${attempts+1} of 2). Fix the cause. Change an expected value in a check only when your diff explains why, and say so.\n\n${output}`}));
