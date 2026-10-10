const site = new URL(process.argv[2]);
if (!['http:', 'https:'].includes(site.protocol)) throw new Error('Expected HTTP site URL');
let lastError;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    const response = await fetch(site, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    if (!response.ok) throw new Error(`Page HTTP ${response.status}`);
    const html = await response.text();
    if (!html.includes('今日清单')) throw new Error('Expected application title missing');
    const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
    if (assets.length < 2) throw new Error('Built JavaScript and CSS missing');
    for (const asset of assets) {
      const result = await fetch(new URL(asset, site), { signal: AbortSignal.timeout(10000) });
      if (!result.ok) throw new Error(`Asset HTTP ${result.status}: ${asset}`);
      if ((result.headers.get('content-type') || '').includes('text/html')) throw new Error(`Asset returned HTML: ${asset}`);
    }
    console.log(`Site and assets ready: ${site}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 11) await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
throw lastError;
