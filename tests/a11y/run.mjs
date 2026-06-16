// Accessibility gate: load the built site and run axe-core (WCAG 2.0/2.1 A + AA).
// Any violation exits non-zero so CI blocks the release. axe covers ~57% of AA
// programmatically; the remaining criteria (resize/reflow/focus order/keyboard)
// are manual spot-checks per docs — this gate catches the automatable majority,
// contrast regressions chief among them.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const URL = process.env.A11Y_URL || 'http://localhost:4173/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  const { violations, passes } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

  if (violations.length > 0) {
    console.error(`\n✗ axe-core found ${violations.length} WCAG A/AA violation(s):\n`);
    for (const v of violations) {
      console.error(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
      console.error(`    ${v.helpUrl}`);
      for (const n of v.nodes.slice(0, 5)) {
        console.error(`      → ${n.target.join(' ')}`);
      }
    }
    console.error('');
    process.exit(1);
  }

  console.log(`✓ axe-core: 0 violations (${passes.length} checks passed) at ${URL}`);
} finally {
  await browser.close();
}
