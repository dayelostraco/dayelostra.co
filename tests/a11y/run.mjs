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
  '/insights/compliance-is-a-byproduct',
  '/insights/i-have-a-routing-table',
  '/insights/anatomy-of-a-governed-factory',
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const browser = await chromium.launch();
let totalViolations = 0;
try {
  // reducedMotion kills the data-reveal fade-in so axe never samples text
  // mid-animation (a mid-fade sample reads as a color-contrast violation).
  // Motion handling itself is covered by the prefers-reduced-motion CSS.
  const context = await browser.newContext({ reducedMotion: 'reduce' });

  // Block third-party requests. The Cloudflare RUM beacon posts to
  // cloudflareinsights.com and that request never settles here, so waiting on
  // the network would hang on an external host the gate does not care about.
  // The site itself is self-hosted under a strict CSP, so nothing off-origin
  // contributes to the accessibility of the page under test.
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    const local = host === 'localhost' || host === '127.0.0.1' || host.endsWith('dayelostra.co');
    return local ? route.continue() : route.abort();
  });

  const page = await context.newPage();

  for (const path of PAGES) {
    const url = BASE + path;
    // 'load' rather than 'networkidle': networkidle waits for a quiet network,
    // which a page with any long-lived or third-party request never reaches, and
    // Playwright discourages it. Everything axe inspects exists at load; the
    // fonts and images that arrive later do not change the tree it walks.
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
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
