// Per-post OG card generator. Enumerates the Insights content collection,
// renders one 2400x1260 PNG per non-draft post through scripts/og/og-post.html
// (Playwright), and writes them to public/assets/img/og/og-insights-<slug>.png.
//
// Run via `npm run og:render:posts`. Generated PNGs are gitignored; production
// regenerates them on every deploy (zero-touch). Fails loud (exit 1, via an
// uncaught throw) on any render error or a zero-post run so a broken og:image
// never ships.
import { readdirSync, statSync } from 'node:fs';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative } from 'node:path';
import matter from 'gray-matter';
import { chromium } from 'playwright';
import {
    deriveSlug, formatCardDate, applyAccent,
    buildMeta, ogFileName,
} from './post-card-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const templatePath = join(__dirname, 'og-post.html');
const fontDir = pathToFileURL(join(repoRoot, 'public', 'assets', 'fonts')).href;
const ogOutputDir = join(repoRoot, 'public', 'assets', 'img', 'og');
const contentBase = join(repoRoot, 'src', 'content', 'insights');

/** Recursively collect *.md / *.mdx files under a directory. */
function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (/\.(md|mdx)$/i.test(entry)) out.push(full);
    }
    return out;
}

/** Read every non-draft Insights post into a render descriptor. */
function loadPosts() {
    return walk(contentBase).flatMap((file) => {
        const slug = deriveSlug(relative(contentBase, file).split(/[\\/]/).join('/'));
        const { data } = matter.read(file);
        if (data.draft === true) return [];

        const dateStr = formatCardDate(data.date);
        const { html, found } = applyAccent(String(data.title), data.ogAccent);
        if (data.ogAccent && !found) {
            console.warn(`  ! ogAccent not found in title for insights/${slug} — rendering all-white`);
        }
        const meta = buildMeta({ dateStr, readTime: data.readTime });

        return [{ slug, titleHtml: html, meta, output: ogFileName(slug) }];
    });
}

const posts = loadPosts();
if (posts.length === 0) throw new Error('No posts found to render — refusing to produce zero OG cards.');

const html = (await readFile(templatePath, 'utf8')).replaceAll('{{FONT_DIR}}', fontDir);
const tmpPath = join(__dirname, '.og-post-render.html');
await writeFile(tmpPath, html, 'utf8');
const templateUrl = pathToFileURL(tmpPath).href;

const browser = await chromium.launch();
try {
    /* 2x DPR -> 2400x1260 output; survives LinkedIn/Facebook proxy
     * re-encode crisp. Matches scripts/og/render.mjs. */
    const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
    await mkdir(ogOutputDir, { recursive: true });
    for (const post of posts) {
        const page = await context.newPage();
        await page.goto(templateUrl, { waitUntil: 'networkidle' });
        await page.evaluate(({ titleHtml, meta }) => {
            document.getElementById('title').innerHTML = titleHtml;
            document.getElementById('meta-line').textContent = meta.line;
        }, post);
        await page.evaluate(() => document.fonts.ready);
        const size = await page.evaluate(() => window.__fit());
        if (size <= 40) console.warn(`  ! title hit the size floor for insights/${post.slug}`);
        await page.screenshot({ path: join(ogOutputDir, post.output), type: 'png' });
        await page.close();
        console.log(`✓ ${post.output} (title ${size}px)`);
    }
} finally {
    await browser.close();
    await rm(tmpPath, { force: true }).catch(() => {});
}
console.log(`Generated ${posts.length} post OG card(s).`);
