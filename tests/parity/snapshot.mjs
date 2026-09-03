/**
 * Visual-parity harness. Screenshots every built page at two viewports with
 * reveal animations and the headline cycler frozen, so a dependency upgrade
 * cannot change a rendered page without the diff showing it.
 *
 * Two-build workflow:
 *   git stash && npm ci && npm run build && npx astro preview --port 4321 &
 *   node tests/parity/snapshot.mjs /tmp/baseline-shots
 *   git stash pop && npm install && npm run build && npx astro preview --port 4321 &
 *   node tests/parity/snapshot.mjs /tmp/new-shots
 * then compare the two directories pixel-wise.
 *
 * Written for the Astro 6 to 7 upgrade, where it caught a dropped
 * -webkit-backdrop-filter that no other gate would have seen.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node scripts/parity/snapshot.mjs <outDir>');
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['home', '/'],
  ['accessibility', '/accessibility'],
  ['error', '/error.html'],
  ['insights-index', '/insights'],
  ['essay-agents-are-accounts', '/insights/agents-are-accounts'],
  ['essay-anatomy-of-a-governed-factory', '/insights/anatomy-of-a-governed-factory'],
  ['essay-command-allow-list', '/insights/command-allow-list'],
  ['essay-compliance-is-a-byproduct', '/insights/compliance-is-a-byproduct'],
  ['essay-govern-the-agent-cli', '/insights/govern-the-agent-cli'],
  ['essay-i-have-a-routing-table', '/insights/i-have-a-routing-table'],
  ['essay-swap-the-model-keep-the-ato', '/insights/swap-the-model-keep-the-ato'],
];

const VIEWPORTS = [['desktop', 1440, 1200], ['mobile', 390, 844]];

const browser = await chromium.launch();
for (const [vpName, width, height] of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width, height } });
  for (const [name, path] of PAGES) {
    await page.goto(`http://localhost:4321${path}`, { waitUntil: 'load' });
    // Freeze the reveal system and any looping text so shots are deterministic.
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.evaluate(() => {
      document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible'));
      const sub = document.getElementById('subhead');
      if (sub) sub.textContent = 'FROZEN';
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${name}.${vpName}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`parity: ${PAGES.length * VIEWPORTS.length} screenshots -> ${OUT}`);
