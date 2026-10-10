import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { validateChanges } from './change-policy.mjs';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const base = process.env.BASE_SHA || git('merge-base', 'origin/main', 'HEAD');
// Include local edits and untracked files, so the Agent can check before committing.
const changed = [...new Set((git('diff', '--name-only', '--no-renames', base) + '\n' + git('ls-files', '--others', '--exclude-standard')).split('\n').filter(Boolean))];
const records = [];
const failures = [];
for (const path of changed.filter(file => /^changes\/[^/]+\/change\.json$/.test(file))) {
  let existsAtBase = false;
  try { git('cat-file', '-e', `${base}:${path}`); existsAtBase = true; } catch {}
  if (existsAtBase) continue; // Historical records do not authorize a new change.
  try {
    const data = JSON.parse(await readFile(path, 'utf8'));
    if (!data || typeof data !== 'object') throw new Error('Expected JSON object');
    if (Array.isArray(data.specs?.paths)) {
      for (const spec of data.specs.paths) {
        if (typeof spec !== 'string' || !/^specs\/[^.][^\n]*\.md$/.test(spec)) throw new Error('Invalid specification path');
        await readFile(spec, 'utf8');
      }
    }
    const notes = await readFile(path.replace('change.json', 'record.md'), 'utf8');
    records.push({ path, data, notes });
  } catch (error) { failures.push(`${path}: ${error.message}`); }
}
const knownIds = [];
for (const file of await readdir('specs')) {
  if (file.endsWith('.md')) {
    const text = await readFile(`specs/${file}`, 'utf8');
    knownIds.push(...[...text.matchAll(/^- ([A-Z]+-\d{3})[：:]/gm)].map(match => match[1]));
  }
}
failures.push(...validateChanges({ changed, records, knownIds }));
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`变更记录检查通过：${changed.length} 个修改文件，${records.length} 个新记录。语义与证据真实性仍需审阅。`);
