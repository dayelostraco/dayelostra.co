// Reveal gate: [data-reveal] elements are opacity:0 in CSS and only made visible
// by JS adding .is-visible, so any element the observer drops stays permanently
// blank. This test flings the page (instant scroll jumps, as momentum scrolling
// does on iOS) and asserts nothing is left stranded: hidden while already above
// the viewport, where it can never re-enter from the bottom.
//
// Regression test for the mobile blank-section bug: an element that crosses the
// whole viewport between observer ticks is reported isIntersecting:false, and the
// callback used to `continue` past it.
import { chromium } from 'playwright';

const BASE = (process.env.REVEAL_URL || 'http://localhost:4321/').replace(/\/+$/, '');
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Anything whose top has crossed the bottom of the viewport should already be
// revealed: the observer uses a 25% bottom rootMargin, so it pre-triggers before
// an element is even on screen. Still hidden at that point means it was dropped,
// whether it is now on screen (visible blank) or scrolled past above it.
const audit = () => {
  const all = [...document.querySelectorAll('[data-reveal]')];
  const stranded = all.filter(
    (el) =>
      !el.classList.contains('is-visible') &&
      el.getBoundingClientRect().top < window.innerHeight,
  );
  return {
    total: all.length,
    visible: all.filter((el) => el.classList.contains('is-visible')).length,
    stranded: stranded.length,
    samples: stranded.slice(0, 5).map((el) => (el.textContent || '').trim().slice(0, 60)),
  };
};

let failures = 0;
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });

  const height = await page.evaluate(() => document.body.scrollHeight);

  // Fling down the page in jumps several viewports deep, which is what iOS
  // momentum scrolling looks like to the observer: elements cross the entire
  // viewport between two callback ticks. Small, slow jumps do NOT reproduce the
  // bug, so keep these large and the waits short.
  // The page sets scroll-behavior: smooth, which animates through every
  // intermediate position and lets the observer catch everything. iOS momentum
  // scrolling does not: it hands the observer discrete jumps. Force instant
  // scrolling so this test sees what a phone sees.
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

  let worst = { total: 0, visible: 0, stranded: 0, samples: [] };
  for (let y = 0; y < height; y += vp.height * 7) {
    await page.evaluate((to) => window.scrollTo({ top: to, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    // Settle at this position and give the observer a generous window to deliver
    // before judging: anything still hidden here will never be revealed.
    await page.waitForTimeout(600);
    const snap = await page.evaluate(audit);
    if (snap.stranded > worst.stranded) worst = snap;
  }

  const result = worst.total ? worst : await page.evaluate(audit);
  const ok = result.stranded === 0;
  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${vp.name.padEnd(7)} ` +
      `total=${result.total} visible=${result.visible} stranded=${result.stranded}`,
  );
  if (!ok) for (const s of result.samples) console.log(`        stranded: "${s}"`);

  await page.close();
}

await browser.close();

if (failures) {
  console.error(`\nreveal gate: ${failures} viewport(s) left content permanently hidden`);
  process.exit(1);
}
console.log('\nreveal gate: no stranded content');
