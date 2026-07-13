import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    deriveSlug,
    formatCardDate,
    buildEyebrow,
    applyAccent,
    buildMeta,
    ogFileName,
} from './post-card-data.mjs';

test('deriveSlug strips extension and trailing /index', () => {
    assert.equal(deriveSlug('boundary-doesnt-move/index.md'), 'boundary-doesnt-move');
    assert.equal(deriveSlug('foo.md'), 'foo');
    assert.equal(deriveSlug('a/b/index.mdx'), 'a/b');
});

test('formatCardDate renders en-US long date in UTC', () => {
    assert.equal(formatCardDate('2026-06-08'), 'June 8, 2026');
    assert.equal(formatCardDate(new Date('2025-12-15T00:00:00Z')), 'December 15, 2025');
});

test('buildEyebrow is the fixed site + section label', () => {
    assert.equal(buildEyebrow(), 'DAYELOSTRA.CO · INSIGHTS');
});

test('applyAccent wraps the substring and html-escapes', () => {
    const r = applyAccent('Agents. The Boundary Hasn\'t Moved.', 'The Boundary Hasn\'t Moved.');
    assert.equal(r.found, true);
    assert.equal(
        r.html,
        'Agents. <span class="accent">The Boundary Hasn&#39;t Moved.</span>',
    );
});

test('applyAccent escapes html when no accent given', () => {
    const r = applyAccent('A & B <x>', undefined);
    assert.equal(r.found, false);
    assert.equal(r.html, 'A &amp; B &lt;x&gt;');
});

test('applyAccent falls back to all-white when substring not found', () => {
    const r = applyAccent('Hello world', 'nope');
    assert.equal(r.found, false);
    assert.equal(r.html, 'Hello world');
});

test('buildMeta includes fixed byline + date + readTime', () => {
    assert.deepEqual(
        buildMeta({ dateStr: 'June 8, 2026', readTime: '3 min read' }),
        { author: 'Dayel Ostraco', line: 'June 8, 2026 · 3 min read' },
    );
});

test('buildMeta without readTime omits the separator', () => {
    assert.deepEqual(
        buildMeta({ dateStr: 'June 8, 2026' }),
        { author: 'Dayel Ostraco', line: 'June 8, 2026' },
    );
});

test('ogFileName composes the insights og convention', () => {
    assert.equal(ogFileName('boundary-doesnt-move'), 'og-insights-boundary-doesnt-move.png');
});
