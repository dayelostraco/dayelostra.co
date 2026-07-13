// Accessibility gate: load each built page and run axe-core (WCAG 2.0/2.1 A + AA).
// Any violation exits non-zero so CI blocks the release. axe covers ~57% of AA
// programmatically; the remaining criteria (resize/reflow/focus order/keyboard)
// are manual spot-checks per docs. This gate catches the automatable majority,
// contrast regressions chief among them.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = (process.env.A11Y_URL || 'http://localhost:4321/').replace(/\/+$/, '');
const PAGES = [
  '/',
  '/accessibility',
  '/error.html',
  '/insights',
  '/insights/agents-are-accounts',
  '/insights/govern-the-agent-cli',
  '/insights/command-allow-list',
  '/insights/swap-the-model-keep-the-ato',
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const browser = await chromium.launch();
let totalViolations = 0;
try {
  // reducedMotion kills the data-reveal fade-in so axe never samples text
  // mid-animation (a mid-fade sample reads as a color-contrast violation).
  // Motion handling itself is covered by the prefers-reduced-motion CSS.
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();

  for (const path of PAGES) {
    const url = BASE + path;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const { violations, passes } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

    if (violations.length > 0) {
      totalViolations += violations.length;
      console.error(`\n✗ ${url} — ${violations.length} WCAG A/AA violation(s):`);
      for (const v of violations) {
        console.error(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
        console.error(`    ${v.helpUrl}`);
        for (const n of v.nodes.slice(0, 5)) console.error(`      → ${n.target.join(' ')}`);
      }
    } else {
      console.log(`✓ ${url} — 0 violations (${passes.length} checks passed)`);
    }
  }
} finally {
  await browser.close();
}

if (totalViolations > 0) process.exit(1);
