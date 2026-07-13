// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

// slug -> lastmod (updated ?? date) for sitemap entries. Read straight
// from frontmatter because astro:content isn't importable in config.
const insightsLastmod = new Map(
  readdirSync('./src/content/insights', { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`./src/content/insights/${d.name}/index.md`))
    .map((d) => {
      const { data } = matter(readFileSync(`./src/content/insights/${d.name}/index.md`, 'utf8'));
      return [d.name, new Date(data.updated ?? data.date)];
    }),
);

export default defineConfig({
  site: 'https://dayelostra.co',
  output: 'static',
  build: {
    format: 'directory',
    // CSS was inlined under Vite too (see git history of vite.config.js):
    // it removes the render-blocking stylesheet round-trip. CloudFront CSP
    // already allows 'unsafe-inline' style-src.
    inlineStylesheets: 'always',
  },
  trailingSlash: 'ignore',
  compressHTML: true,
  // The essays launched under slugs shared with their accelerasolutions.com
  // siblings; renamed 2026-07-13 to differentiate the two sites (SEO review
  // finding B). Static output emits meta-refresh stub pages at the old URLs.
  redirects: {
    '/insights/boundary-doesnt-move': '/insights/agents-are-accounts/',
    '/insights/cli-is-the-new-api': '/insights/govern-the-agent-cli/',
    '/insights/least-privilege-is-a-list': '/insights/command-allow-list/',
  },
  // Exclude the 404 page: it is noindex and is relocated to
  // dist/error.html by the postbuild step, so /error/ is a dead URL.
  integrations: [sitemap({
    filter: (page) => !page.includes('/error'),
    serialize(item) {
      const m = new URL(item.url).pathname.match(/^\/insights\/([^/]+)\/$/);
      const lastmod = m && insightsLastmod.get(m[1]);
      return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
    },
  })],
  vite: { plugins: [tailwindcss()] },
});
