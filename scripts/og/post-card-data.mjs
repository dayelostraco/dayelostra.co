/*
 * Pure, dependency-free data helpers for per-post OG card generation.
 * All Playwright / filesystem work lives in render-posts.mjs; everything
 * here is unit-tested in post-card-data.test.mjs (node --test).
 */

/** Astro glob-loader id: path relative to the collection base, minus
 *  extension, with a trailing /index stripped. */
export function deriveSlug(relativePath) {
    const noExt = relativePath.replace(/\.(md|mdx)$/i, '');
    return noExt.replace(/\/index$/i, '');
}

/** "June 8, 2026" — matches the on-page fmtDate (UTC, date-only frontmatter). */
export function formatCardDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });
}

/** Fixed eyebrow for the single-collection, single-author site. */
export function buildEyebrow() {
    return 'DAYELOSTRA.CO · INSIGHTS';
}

function escapeHtml(s) {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/** Wrap `accent` (a substring of `title`) in an accent span; html-escape
 *  every segment. Returns { html, found }. Missing/unmatched accent ->
 *  fully-escaped title, found:false. */
export function applyAccent(title, accent) {
    if (!accent) return { html: escapeHtml(title), found: false };
    const i = title.indexOf(accent);
    if (i === -1) return { html: escapeHtml(title), found: false };
    const before = title.slice(0, i);
    const after = title.slice(i + accent.length);
    const html =
        escapeHtml(before) +
        `<span class="accent">${escapeHtml(accent)}</span>` +
        escapeHtml(after);
    return { html, found: true };
}

/** Footer meta block: fixed byline "Dayel Ostraco" + date(+readTime). */
export function buildMeta({ dateStr, readTime } = {}) {
    const line = readTime ? `${dateStr} · ${readTime}` : dateStr;
    return { author: 'Dayel Ostraco', line };
}

export function ogFileName(slug) {
    return `og-insights-${slug}.png`;
}
