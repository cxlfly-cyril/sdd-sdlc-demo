import { it, expect } from 'vitest';
import { validateChanges } from '../scripts/change-policy.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const valid = () => ({request:'弱化删除按钮',kind:'visual',files:['src/style.css'],specs:{action:'unchanged',paths:['specs/todo.md'],reason:'保持删除和键盘行为'},acceptance:['AC-004'],checks:[{command:'布局与键盘检查',outcome:'passed',evidence:'record.md 的验证'}]});
function check(data=valid(),changed=['src/style.css'],notes='实际验证记录') {
 return validateChanges({changed,records:[{path:'changes/006-style/change.json',data,notes}],knownIds:['AC-004']});
}
it('visual request preserves spec with affected acceptance and evidence',()=>expect(check()).toEqual([]));
it('missing new record rejects even a tiny change',()=>expect(validateChanges({changed:['src/style.css'],records:[],knownIds:[]})).not.toEqual([]));
it('unrecorded changed file is rejected',()=>expect(check(valid(),['src/style.css','src/main.ts']).join()).toContain('src/main.ts'));
it('behavior change requires an actual spec update',()=>{const data=valid();data.kind='behavior';expect(check(data).join()).toContain('必须更新规格');data.specs.action='updated';expect(check(data).join()).toContain('没有修改');expect(check(data,['src/style.css','specs/todo.md']).join()).not.toContain('没有修改');});
it('spec edits cannot be declared unchanged',()=>expect(check(valid(),['src/style.css','specs/todo.md']).join()).toContain('却声明无需更新'));
it('unknown acceptance ID is rejected',()=>{const data=valid();data.acceptance=['AC-999'];expect(check(data).join()).toContain('未知验收编号');});
it('bug fix needs regression test modification',()=>{const data=valid();data.kind='bugfix';expect(check(data).join()).toContain('回归测试');});
it('missing or pending verification cannot pass',()=>{const data=valid();data.checks[0].outcome='pending';expect(check(data).join()).toContain('验证命令');});
it('malformed fields produce diagnostics instead of crashing',()=>expect(()=>check({request:'x',kind:'bugfix',files:'invalid',acceptance:null})).not.toThrow());
it('CLI checks untracked edits, refuses old records, and generator creates pending new records',()=>{
 const root=mkdtempSync(join(tmpdir(),'sdd-change-'));
 try {
  mkdirSync(join(root,'scripts'));mkdirSync(join(root,'specs'));mkdirSync(join(root,'src'));mkdirSync(join(root,'changes'));
  for(const file of ['change-policy.mjs','check-change.mjs','new-change.mjs'])cpSync(resolve('scripts',file),join(root,'scripts',file));
  writeFileSync(join(root,'specs/todo.md'),'- AC-004：删除目标任务\n');writeFileSync(join(root,'src/style.css'),'body{}');
  const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git('init');git('add','.');git('-c','user.name=Test','-c','user.email=test@example.test','commit','-m','baseline');git('update-ref','refs/remotes/origin/main','HEAD');
  writeFileSync(join(root,'src/style.css'),'body{color:red}');
  const run=()=>spawnSync(process.execPath,['scripts/check-change.mjs'],{cwd:root,encoding:'utf8'});
  expect(run().status).toBe(1);
  execFileSync(process.execPath,['scripts/new-change.mjs','style'],{cwd:root});
  const dir=join(root,'changes/001-style');expect(run().status).toBe(1);
  writeFileSync(join(dir,'change.json'),JSON.stringify(valid()));writeFileSync(join(dir,'record.md'),'布局已检查');
  expect(run().status).toBe(0);
  writeFileSync(join(root,'src/new.ts'),'export {}');expect(run().stderr).toContain('src/new.ts');rmSync(join(root,'src/new.ts'));
  git('add','.');git('-c','user.name=Test','-c','user.email=test@example.test','commit','-m','style');git('update-ref','refs/remotes/origin/main','HEAD');
  writeFileSync(join(root,'src/style.css'),'body{color:blue}');writeFileSync(join(dir,'record.md'),'追加旧记录');
  expect(run().stderr).toContain('缺少新的');
 }finally{rmSync(root,{recursive:true,force:true});}
});
