import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

/**
 * Inline the built CSS into every emitted HTML file and remove the original
 * <link rel="stylesheet"> + the CSS chunk from the bundle.
 *
 * Why: the stylesheet (~8 KB gzipped) was the last render-blocking request on
 * the critical path. With only two HTML pages and low repeat-visit rate, the
 * separate-cacheability trade-off doesn't matter; cutting the round-trip does.
 * CSP already allows 'unsafe-inline' style-src for our inline bg-image styles,
 * so an inline <style> block is policy-compatible.
 */
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      const cssChunks = Object.values(bundle).filter((f) => f.fileName.endsWith('.css') && f.type === 'asset');
      if (cssChunks.length === 0) return;
      const css = cssChunks.map((c) => c.source.toString()).join('\n');
      const htmlFiles = Object.values(bundle).filter((f) => f.fileName.endsWith('.html'));
      for (const html of htmlFiles) {
        html.source = html.source.replace(
          /<link\s+rel="stylesheet"[^>]*href="[^"]*\.css"[^>]*>/g,
          `<style>${css}</style>`,
        );
      }
      // Drop the now-orphan CSS chunks so they don't ship to S3
      for (const c of cssChunks) delete bundle[c.fileName];
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), inlineCss()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        error: resolve(import.meta.dirname, 'error.html'),
        accessibility: resolve(import.meta.dirname, 'accessibility.html'),
      },
    },
  },
});
