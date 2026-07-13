// Postbuild: relocate the built 404 page to dist/error.html.
//
// Astro (build.format: 'directory') emits src/pages/error.astro as
// dist/error/index.html. The S3 static-website ErrorDocument is configured
// as `error.html` at the bucket root (see RUNBOOK.md), so CloudFront serves
// /error.html for any 404. This moves the file to that path and removes the
// now-empty dist/error/ directory.
import { rename, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const src = `${dist}error/index.html`;
const dest = `${dist}error.html`;

try {
  await access(src);
} catch {
  console.error(`fix-error-page: expected ${src} not found; did the error page build?`);
  process.exit(1);
}

await rename(src, dest);
await rm(`${dist}error`, { recursive: true, force: true });
console.log('fix-error-page: dist/error/index.html -> dist/error.html');
