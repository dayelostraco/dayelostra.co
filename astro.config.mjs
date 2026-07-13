// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
