import { readdir, mkdir, writeFile } from 'node:fs/promises';
const slug = process.argv[2];
if (!/^[a-z][a-z0-9-]{1,60}$/.test(slug || '')) throw new Error('Usage: npm run change:new -- short-name');
const numbers = (await readdir('changes')).map(name => Number(name.match(/^(\d+)-/)?.[1] || 0));
const id = String(Math.max(0, ...numbers) + 1).padStart(3, '0');
const directory = `changes/${id}-${slug}`;
await mkdir(directory); // Refuse collisions; preserve historical records.
await writeFile(`${directory}/change.json`, JSON.stringify({
  request: '', kind: 'visual', files: [],
  specs: { action: 'unchanged', paths: ['specs/todo.md'], reason: '' },
  acceptance: [], checks: [],
}, null, 2) + '\n');
await writeFile(`${directory}/record.md`, '# 变更记录\n\n## 意图与规格影响\n\n由 Agent 填写需求、判断原因和必要的产品决定。\n\n## 实现与验证\n\n由 Agent 记录方案、实际命令、结果及未执行项。\n');
console.log(`已创建 ${directory}。由 Agent 填写；空字段会被 CI 拦截。`);
