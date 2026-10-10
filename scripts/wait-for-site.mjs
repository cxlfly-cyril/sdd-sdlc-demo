import { checkSite } from './site-health.mjs';
const site = process.argv[2];
let lastError;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    await checkSite(site);
    console.log(`Site and assets ready: ${site}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 11) await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
throw lastError;
