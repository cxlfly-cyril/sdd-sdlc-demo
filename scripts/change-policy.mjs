const kinds = new Set(['visual', 'interaction', 'behavior', 'bugfix', 'infrastructure', 'documentation']);
const meaningful = value => typeof value === 'string' && value.trim().length > 0;
const paths = value => Array.isArray(value) && value.every(meaningful);
export function validateChanges({ changed, records, knownIds }) {
  const errors = [];
  if (!changed.length) return errors;
  if (!records.length) return ['本次修改缺少新的 changes/<编号-名称>/change.json 和 record.md；由 Agent 自动创建。'];
  const covered = new Set();
  for (const { path, data, notes } of records) {
    const fail = message => errors.push(`${path}: ${message}`);
    if (!meaningful(data.request)) fail('缺少用户需求');
    if (!kinds.has(data.kind)) fail('变更分类无效');
    if (!meaningful(notes)) fail('缺少非空 record.md');
    if (!paths(data.files) || !data.files.length) fail('缺少修改文件范围');
    else for (const file of data.files) {
      if (!changed.includes(file)) fail(`声明文件未修改：${file}`);
      covered.add(file);
    }
    const spec = data.specs;
    if (!spec || !['updated', 'unchanged'].includes(spec.action) || !paths(spec.paths) || !spec.paths.length || !meaningful(spec.reason)) {
      fail('缺少规格影响判断、规格路径或原因');
    } else {
      if (spec.paths.some(file => !/^specs\/[^.][^\n]*\.md$/.test(file))) fail('规格路径必须位于 specs/');
      const updated = spec.paths.some(file => changed.includes(file));
      if (spec.action === 'updated' && !updated) fail('声明更新规格，但相关规格没有修改');
      if (spec.action === 'unchanged' && updated) fail('规格已修改，却声明无需更新');
      if (data.kind === 'behavior' && spec.action !== 'updated') fail('预期行为变化必须更新规格');
    }
    if (!paths(data.acceptance)) fail('缺少验收编号列表');
    else {
      if ((['visual', 'interaction', 'behavior', 'bugfix'].includes(data.kind) || (Array.isArray(data.files) && data.files.some(file => typeof file === 'string' && (file.startsWith('src/') || file === 'index.html')))) && !data.acceptance.length) fail('产品修改必须识别受影响的验收编号');
      for (const id of data.acceptance) if (!knownIds.includes(id)) fail(`未知验收编号：${id}`);
    }
    if (data.kind === 'bugfix' && !(Array.isArray(data.files) && data.files.some(file => typeof file === 'string' && file.startsWith('tests/')))) fail('缺陷修复缺少回归测试修改');
    if (!Array.isArray(data.checks) || !data.checks.length || data.checks.some(check =>
      !meaningful(check.command) || check.outcome !== 'passed' || !meaningful(check.evidence))) fail('缺少已执行并通过的验证命令和证据');
  }
  for (const file of changed.filter(file => !file.startsWith('changes/'))) {
    if (!covered.has(file)) errors.push(`修改文件未被变更记录覆盖：${file}`);
  }
  return errors;
}
