import { readFile } from 'node:fs/promises';

const spec = await readFile('specs/todo.md', 'utf8');
const mapping = await readFile('traceability.md', 'utf8');
const unit = await readFile('tests/tasks.test.ts', 'utf8');
const browser = await readFile('tests/e2e/todo.spec.ts', 'utf8');
const ids = [...spec.matchAll(/^- (AC-\d{3})[：:]/gm)].map(match => match[1]);
const failures = [];
if (!ids.length) failures.push('规格没有验收编号');
if (new Set(ids).size !== ids.length) failures.push('规格包含重复验收编号');
for (const id of ids) {
  const rows = mapping.split('\n').filter(line => line.startsWith(`| ${id} |`));
  if (rows.length !== 1 || rows[0].split('|').slice(2, 5).some(cell => !cell.trim())) {
    failures.push(`${id} 缺少唯一且完整的实现、单元测试和浏览器测试映射`);
  }
  if (!unit.includes(id)) failures.push(`${id} 未在单元测试中引用`);
  if (!browser.includes(id)) failures.push(`${id} 未在浏览器测试中引用`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${ids.length} 条验收标准的追溯结构检查通过。业务语义由测试执行和人工审阅确认。`);
}
