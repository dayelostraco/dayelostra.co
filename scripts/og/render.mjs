// Render the OG social card (1200x630) from og-template.html using Playwright.
// Fonts are injected as absolute file:// URLs at render time so the template
// resolves them on any machine. Output: public/assets/img/og.jpg (the path the
// page metadata already references). Rerun whenever the hook or palette changes.
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const fontDir = pathToFileURL(join(root, 'public', 'assets', 'fonts')).href;
const templatePath = join(here, 'og-template.html');
const outDir = join(root, 'public', 'assets', 'img');
const outPath = join(outDir, 'og.jpg');

const html = (await readFile(templatePath, 'utf8')).replaceAll('{{FONT_DIR}}', fontDir);
const tmpPath = join(here, '.og-render.html');
await writeFile(tmpPath, html, 'utf8');

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2, // crisp 2x render
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(tmpPath).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await mkdir(outDir, { recursive: true });
  await page.locator('.card').screenshot({ path: outPath, type: 'jpeg', quality: 92 });
  console.log(`✓ OG card rendered → ${outPath}`);
} finally {
  await browser.close();
  await writeFile(tmpPath, '', 'utf8').catch(() => {});
  const { rm } = await import('node:fs/promises');
  await rm(tmpPath, { force: true }).catch(() => {});
}
