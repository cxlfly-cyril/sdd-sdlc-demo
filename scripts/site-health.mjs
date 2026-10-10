export async function checkSite(url, request = fetch) {
  const site = new URL(url);
  if (!['http:', 'https:'].includes(site.protocol)) throw new Error('Expected HTTP site URL');
  const response = await request(site, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) throw new Error(`Page HTTP ${response.status}`);
  const html = await response.text();
  if (!html.includes('今日清单')) throw new Error('Expected application title missing');
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  if (!assets.some(asset => asset.endsWith('.js')) || !assets.some(asset => asset.endsWith('.css'))) {
    throw new Error('Built JavaScript and CSS missing');
  }
  for (const asset of assets) {
    const result = await request(new URL(asset, site), { signal: AbortSignal.timeout(10000) });
    if (!result.ok) throw new Error(`Asset HTTP ${result.status}: ${asset}`);
    if ((result.headers.get('content-type') || '').includes('text/html')) throw new Error(`Asset returned HTML: ${asset}`);
  }
}
