// Stop hook: before a turn that changed code or data may end, `pnpm check` must pass.
// Bounded loop: blocks at most twice in a row with the failing output, then warns the user and stays quiet
// until the files change again, so a failure is reported instead of retried forever. Skips when nothing but
// docs, .github or .claude changed, and when the tree is unchanged since the last pass or the last warning.
// Set OVERSHOOT_SKIP_STOP_CHECK=1 to turn it off for a session.
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

const skip=/^(\.github|\.claude)\/|^[^/]+\.md$/;
const base=git('merge-base','HEAD','origin/main').trim()||git('merge-base','HEAD','main').trim()||'HEAD';
const untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(f=>f&&!skip.test(f));
const changed=[...git('diff','--name-only',base).split('\n').filter(f=>f&&!skip.test(f)),...untracked];
if(!changed.length)process.exit(0);
if(!existsSync(join(root,'node_modules/.bin/tsx')))say('pnpm check was skipped: dependencies are not installed (pnpm install --frozen-lockfile).');

const gitDir=git('rev-parse','--absolute-git-dir').trim();
if(!gitDir)process.exit(0);
const sid=session.replace(/[^\w-]/g,'');
const passFile=join(gitDir,'overshoot-check-pass'),attemptsFile=join(gitDir,`overshoot-check-attempts-${sid}`),warnedFile=join(gitDir,`overshoot-check-warned-${sid}`);
const hash=createHash('sha256').update(git('rev-parse','HEAD')+git('diff',base));
for(const f of untracked)hash.update(f).update(readFileSync(join(root,f)));
const fingerprint=hash.digest('hex');
const same=file=>existsSync(file)&&readFileSync(file,'utf8')===fingerprint;
if(same(passFile)){rmSync(attemptsFile,{force:true});rmSync(warnedFile,{force:true});process.exit(0)}
if(same(warnedFile))process.exit(0);

const run=spawnSync('pnpm',['-s','check'],{cwd:root,encoding:'utf8',timeout:270_000,maxBuffer:1<<26});
if(run.error)say(`pnpm check could not run: ${run.error.message}`);
if(run.status===0){writeFileSync(passFile,fingerprint);rmSync(attemptsFile,{force:true});rmSync(warnedFile,{force:true});process.exit(0)}
const output=(run.stdout+run.stderr).trim().split('\n');
const attempts=existsSync(attemptsFile)?Number(readFileSync(attemptsFile,'utf8')):0;
if(attempts>=2){
 rmSync(attemptsFile,{force:true});writeFileSync(warnedFile,fingerprint);
 say(`pnpm check still fails after 2 automatic repair attempts:\n${output.slice(-8).join('\n')}`);
}
writeFileSync(attemptsFile,String(attempts+1));
const last=attempts+1===2?' This is the last automatic attempt: after fixing, run `pnpm check` yourself, and if it still fails, stop editing and report the failing check and its output to the user.':'';
console.log(JSON.stringify({decision:'block',reason:`pnpm check failed (repair attempt ${attempts+1} of 2). Fix the cause. Change an expected value in a check only when your diff explains why, and say so.${last}\n\n${output.slice(-40).join('\n')}`}));
