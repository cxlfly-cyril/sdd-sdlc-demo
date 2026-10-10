import { writeFile, appendFile } from 'node:fs/promises';
import { checkSite } from './site-health.mjs';
import { reconcileIncident } from './monitor-state.mjs';

const site = 'https://cxlfly-cyril.github.io/sdd-sdlc-demo/';
let health = { ok: true };
for (let attempt = 0; attempt < 3; attempt++) {
  try { await checkSite(site); health = { ok: true }; break; }
  catch (error) {
    health = { ok: false, error: error.message };
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
let result = { action: 'dry-run' };
if (process.env.MONITOR_DRY_RUN !== '1') {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (repo !== 'cxlfly-cyril/sdd-sdlc-demo' || !token) throw new Error('Repository or token missing');
  async function api(path, method = 'GET', body) {
    const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`GitHub API ${method} ${path}: HTTP ${response.status}`);
    return response.json();
  }
  result = await reconcileIncident({
    listOpen: async () => {
      const issues = [];
      for (let page = 1; ; page++) {
        const batch = await api(`/issues?state=open&per_page=100&page=${page}`);
        issues.push(...batch);
        if (batch.length < 100) return issues;
      }
    },
    create: body => api('/issues', 'POST', body),
    comment: (number, body) => api(`/issues/${number}/comments`, 'POST', { body }),
    close: number => api(`/issues/${number}`, 'PATCH', { state: 'closed' }),
  }, health, {
    site, time: new Date().toISOString(),
    run: `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  });
}
const report = { site, time: new Date().toISOString(), health, result };
console.log(JSON.stringify(report, null, 2));
await writeFile('monitor-result.json', JSON.stringify(report, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `Pages monitor: **${result.action}**\n\n${site}\n`);
if (!health.ok) process.exitCode = 1;
