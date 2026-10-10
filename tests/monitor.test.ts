import { it, expect, vi } from 'vitest';
import { checkSite } from '../scripts/site-health.mjs';
import { MARKER, reconcileIncident } from '../scripts/monitor-state.mjs';
const evidence = { site: 'https://example.test/demo/', time: '2026-10-10', run: 'https://example.test/run' };
function fakeApi(issues = []) {
  return { listOpen: vi.fn(async () => issues), create: vi.fn(async () => ({number: 7})), comment: vi.fn(async () => {}), close: vi.fn(async () => {}) };
}
it('MON-001 verifies page and both assets at repository subpath', async () => {
  const request = vi.fn(async (url) => new Response(String(url).endsWith('/demo/') ? '<title>今日清单</title><script src="/demo/app.js"></script><link href="/demo/app.css">' : 'asset', {headers:{'Content-Type':'text/plain'}}));
  await checkSite(evidence.site, request);
  expect(request.mock.calls.map(call => String(call[0]))).toEqual([evidence.site, 'https://example.test/demo/app.js', 'https://example.test/demo/app.css']);
});
it.each(['404', 'missing-title', 'missing-css', 'asset-404', 'asset-html', 'network'])('MON-001 rejects failure %s', async mode => {
  const request = async url => {
    if (mode === 'network') throw new Error('network');
    if (String(url).endsWith('/demo/')) return new Response(`${mode === 'missing-title' ? '' : '今日清单'}<script src="/demo/app.js"></script>${mode === 'missing-css' ? '' : '<link href="/demo/app.css">'}`, {status:mode === '404' ? 404 : 200});
    return new Response('asset', {status:mode === 'asset-404' ? 404 : 200, headers:{'Content-Type':mode === 'asset-html' ? 'text/html' : 'text/plain'}});
  };
  await expect(checkSite(evidence.site, request)).rejects.toThrow();
});
it('MON-002 opens one issue with failure evidence', async () => {
  const api = fakeApi(); await reconcileIncident(api, {ok:false,error:'HTTP 404'}, evidence);
  expect(api.create).toHaveBeenCalledTimes(1); expect(api.create.mock.calls[0][0].body).toContain(evidence.run);
});
it('MON-003 repeated failure stays quiet and does not duplicate', async () => {
  const api = fakeApi([{number:7,body:MARKER}]);
  expect((await reconcileIncident(api,{ok:false,error:'HTTP 404'},evidence)).action).toBe('ongoing');
  expect(api.create).not.toHaveBeenCalled(); expect(api.comment).not.toHaveBeenCalled(); expect(api.close).not.toHaveBeenCalled();
});
it('MON-004 recovery records evidence and closes only monitor incidents', async () => {
  const api = fakeApi([{number:7,body:MARKER},{number:8,body:'ordinary issue'},{number:9,body:MARKER,pull_request:{}}]);
  await reconcileIncident(api,{ok:true},evidence);
  expect(api.comment).toHaveBeenCalledWith(7,expect.stringContaining(evidence.run)); expect(api.close).toHaveBeenCalledExactlyOnceWith(7);
});
it('healthy state with no incident produces no issue or comment', async () => {
  const api = fakeApi(); await reconcileIncident(api,{ok:true},evidence);
  expect(api.create).not.toHaveBeenCalled(); expect(api.comment).not.toHaveBeenCalled();
});
it('GitHub API errors surface rather than claiming recovery', async () => {
  const api = fakeApi([{number:7,body:MARKER}]); api.comment.mockRejectedValue(new Error('API unavailable'));
  await expect(reconcileIncident(api,{ok:true},evidence)).rejects.toThrow('API unavailable'); expect(api.close).not.toHaveBeenCalled();
});
