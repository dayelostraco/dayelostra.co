# Astro Migration + Insights Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate dayelostra.co from Vite static HTML to Astro 6 and add an `/insights` blog (same framework as accelera-web) with three reworked essays, per-post OG cards, RSS, sitemap, and production deploy.

**Architecture:** Whole-site Astro 6 static build. The existing `index.html` decomposes into a shared `Layout.astro` + `Navbar/Footer` components and page files; blog posts are markdown in an `insights` Content Collection rendered by listing/article pages; a Playwright script renders one OG PNG per post at build time. Deploy stays S3 + CloudFront; a CloudFront Function adds clean-URL rewriting.

**Tech Stack:** Astro ^6, Tailwind CSS v4 (`@tailwindcss/vite`), `@astrojs/rss`, `@astrojs/sitemap`, Playwright, gray-matter, TypeScript (content config only).

**Reference implementation:** `/Users/dayelostraco/Development/GitHub/accelera/accelera-web` (read-only). Where a step says "port `<file>`", read that file from accelera-web and adapt per the stated rules. Do NOT modify accelera-web.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-12-astro-insights-blog-design.md` — read it before starting any task.
- Site URL: `https://dayelostra.co` (no www in canonical).
- Visual parity: the migrated portfolio page must render identically to current production (`index.html` markup preserved verbatim inside Astro pages; only head/nav/footer factored out).
- Palette: cyan workhorse `--color-accent` #0e7490 / `--color-accent-vivid` #39d7ff (vivid only on dark grounds or large text), pink signature #ff06b5 (scarce). Never replace with Accelera blue #00adef.
- No em-dashes (—) in any user-visible copy, markdown content, commit messages, or meta descriptions. Code comments exempt.
- No AI attribution trailers in commits.
- CSP is enforced at CloudFront (`script-src 'self'`; `style-src` allows `'unsafe-inline'`): no inline `<script>` tags, no external CDN assets. Do NOT enable Astro `security.csp`.
- Single author: Dayel Ostraco. No authors registry, no author frontmatter field.
- Node >= 22.
- Commit after each task; work stays on branch `feat/astro-insights-blog`.

---

### Task 1: Astro scaffold + site migration (pixel parity)

**Files:**
- Modify: `package.json` (deps + scripts), `.gitignore` (add `.astro/`)
- Create: `astro.config.mjs`, `tsconfig.json`
- Create: `src/layouts/Layout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro`
- Create: `src/pages/index.astro`, `src/pages/accessibility.astro`, `src/pages/error.astro`
- Delete: `vite.config.js`, root `index.html`, `accessibility.html`, `error.html`
- Keep unchanged: `src/styles/main.css`, `src/scripts/*.js`, `public/**`

**Interfaces:**
- Produces: `Layout.astro` with props `{ title: string; description: string; canonical?: string; ogType?: 'website' | 'article'; ogImage?: string; ogImageAlt?: string; }` (defaults: ogType 'website', ogImage '/assets/img/og.jpg', canonical derived from `Astro.url` + `Astro.site`). Slot for page body. Renders the full current `<head>` (meta, favicons, font preloads, theme-color) and includes JSON-LD Person block only when a boolean prop `jsonLd` (default false; index passes true) is set.
- Produces: `Navbar.astro` with prop `{ home?: boolean }`. When `home` is false, anchor links become `/#lab` etc., and the nav includes a new "Insights" link (`/insights`) in BOTH desktop nav and mobile sidebar. When `home` is true, same links plus "Insights".

- [ ] **Step 1: Install Astro deps, update scripts**

```bash
npm install astro@^6 @astrojs/rss @astrojs/sitemap
npm install -D @astrojs/check typescript gray-matter tsx
```

In `package.json` scripts, replace vite entries:

```json
"dev": "astro dev",
"build": "astro build",
"preview": "astro preview",
"check": "astro check"
```

Keep `a11y:test` and `og:render` as-is. Add `.astro/` to `.gitignore`.

- [ ] **Step 2: Create `astro.config.mjs`**

```js
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
```

Note: NO `security.csp` (CloudFront owns CSP), NO astro-icon (site uses inline SVG already). `tsconfig.json`: copy accelera-web's, which extends `astro/tsconfigs/strict`.

- [ ] **Step 3: Decompose `index.html` into Layout/Navbar/Footer/pages**

Mechanical split, markup verbatim:
- `<head>` content (lines ~1-116) → `Layout.astro`, with title/description/OG fields driven by props. Preserve favicon set, font preloads, theme-color, Twitter/OG tags. Canonical: `new URL(Astro.url.pathname, Astro.site)`.
- Both `<nav>` blocks (desktop `aria-label="Primary"` + `data-sidebar` mobile) → `Navbar.astro`. Add "Insights" link to both lists (before "Connect"). Non-home pages use `/#anchor` forms.
- Footer markup → `Footer.astro`.
- Everything inside `<main id="main-content">` → `src/pages/index.astro` body (verbatim), wrapped in `<Layout jsonLd={true} ...><Navbar home={true} /> ... <Footer /></Layout>`.
- `accessibility.html`, `error.html` → same treatment (they currently duplicate head/nav; use the shared components, `home={false}`).
- Script loading: current pages load `/src/scripts/main.js` etc. In Astro, import them in a `<script>` tag per page: `<script src="../scripts/main.js"></script>` (Astro bundles them; emitted as external hashed JS, CSP-safe). Verify `error.html` special constraints (it is served by CloudFront as the error page; keep it self-contained).
- `src/styles/main.css`: import once in `Layout.astro` frontmatter (`import '../styles/main.css';`).

- [ ] **Step 4: Build and compare**

```bash
npm run build
```

Expected: `dist/index.html`, `dist/accessibility/index.html`, `dist/error/index.html` (see note), `dist/sitemap-index.xml`. IMPORTANT: `error.html` must be emitted at `dist/error.html` for the existing CloudFront error-page config. Easiest: name the page `src/pages/error.astro` and set `build.format: 'directory'` exceptions are not per-page, so instead verify what CloudFront expects (check `iac/terraform/main.tf` / RUNBOOK — it references `/error.html`). If needed, add a tiny postbuild copy in package.json: `"postbuild": "node scripts/fix-error-page.mjs"` that moves `dist/error/index.html` to `dist/error.html`. Same consideration for `accessibility.html` links: search repo + README for hardcoded `/accessibility.html` references and update to `/accessibility`.

Visual check: `npm run preview`, then screenshot `/` and diff against production https://dayelostra.co visually (use Playwright screenshots at 1440px and 390px widths). Fonts, section rhythm, nav scroll, sidebar, reveal animations must work. Check browser console for errors.

- [ ] **Step 5: Run a11y tests**

`tests/a11y/run.mjs` targets the built site; read it and update its page list / server bootstrapping for Astro's `dist/` layout (it may already just serve `dist/`). Run: `npm run build && npm run a11y:test`. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: migrate site from Vite static HTML to Astro 6"
```

---

### Task 2: Insights content collection + pages + RSS + sitemap/robots

**Files:**
- Create: `src/content.config.ts`
- Create: `src/pages/insights/index.astro`, `src/pages/insights/[...slug].astro`, `src/pages/insights/rss.xml.ts`
- Create: `src/content/insights/hello-test/index.md` (draft placeholder, deleted in Task 4)
- Modify: `src/styles/main.css` (append `.article-prose` block), `public/robots.txt`

**Interfaces:**
- Consumes: `Layout.astro` + `Navbar.astro` + `Footer.astro` props from Task 1.
- Produces: collection `insights` with schema fields `title, date, summary, tags?, readTime?, heroImage?, heroImageAlt?, draft, ogImage?, ogAccent?, bodyWatermark?` (NO author field). Article route `/insights/<slug>`. OG image convention `/assets/img/og/og-insights-<slug>.png` (consumed by Task 3).

- [ ] **Step 1: Port `src/content.config.ts`** from accelera-web: keep only the `insights` collection, delete `news`, delete the author enum/import entirely.

- [ ] **Step 2: Port the pages.** From accelera-web `src/pages/insights/index.astro`, `[...slug].astro`, `rss.xml.ts`, adapting:
  - Wrap in this repo's `Layout`/`Navbar`/`Footer` instead of accelera's.
  - Remove author machinery: byline is hardcoded "Dayel Ostraco" linking to `https://www.linkedin.com/in/dayelostraco` (verify handle in `index.astro` footer/connect section and reuse it).
  - Listing hero copy: eyebrow "Insights", heading and subheading in Dayel's voice (e.g. "Field notes on agents, identity, and shipping inside the federal boundary."). No "Accelera Solutions" strings anywhere. No em-dashes.
  - RSS: title "Dayel Ostraco · Insights", site from `context.site`, author string "Dayel Ostraco".
  - Replace accelera brand token classes (`accelera-blue` etc.) with this site's tokens (`accent`, `accent-vivid`, `signature`) respecting the contrast rules; dark hero uses the `.section-dark` treatment from `main.css`.
  - "Read next": port as-is (recency, slice(0,2), hidden when <2 posts).
- [ ] **Step 3: Port `.article-prose` CSS** from accelera-web `src/styles/global.css` into `src/styles/main.css`: drop cap, numbered H2 eyebrows, ordered-list numerals, lead accent rule, H2 gradient accent, Shiki `pre.astro-code` single-treatment override (keep: CloudFront CSP strips per-token styles here too). Re-color: accents cyan on light, `#39d7ff` on dark; the one permitted pink note is the drop cap or selection, matching existing site usage (pick drop cap in `--color-signature`).
- [ ] **Step 4: Placeholder post** `src/content/insights/hello-test/index.md` with full frontmatter (`draft: true`) and body exercising H2s, ol, code block, links. Verify in `npm run dev`: listing shows it (dev shows drafts), article renders ornaments, RSS at `/insights/rss.xml` excludes it, prod build (`npm run build`) excludes it and emits `/insights/` empty state.
- [ ] **Step 5: robots.txt** — replace the "no sitemap needed" comment with `Sitemap: https://dayelostra.co/sitemap-index.xml`.
- [ ] **Step 6: Build + a11y test pass, then commit** `feat: add insights blog framework (collection, pages, RSS, sitemap)`.

---

### Task 3: Per-post OG card pipeline

**Files:**
- Create: `scripts/og/render-posts.mjs`, `scripts/og/og-post.html`, `scripts/og/post-card-data.mjs`, `scripts/og/post-card-data.test.mjs`
- Modify: `package.json` (add `"og:render:posts": "node scripts/og/render-posts.mjs"`, `"test": "node --test scripts/og/"`), `.gitignore` (add `public/assets/img/og/og-insights-*.png`)

**Interfaces:**
- Consumes: markdown files under `src/content/insights/`; OG filename convention from Task 2 (`og-insights-<slug>.png`).
- Produces: `public/assets/img/og/og-insights-<slug>.png` (2400×1260) per non-draft post.

- [ ] **Step 1: Port the three og scripts + template** from accelera-web `scripts/og/`. Adaptations: only the `insights` collection (drop `news`); drop the author-registry lookup (meta line = formatted date + readTime; byline fixed "Dayel Ostraco"); plain `node` not `tsx` (no TS import remains). Rebrand `og-post.html` to this site's card language: near-black ground, Geist + IBM Plex Mono, cyan `#39d7ff` accent for `ogAccent` substring, scarce pink `#ff06b5` detail, matching `scripts/og/og-template.html` (read it for the existing brand card). Eyebrow: `DAYELOSTRA.CO · INSIGHTS`.
- [ ] **Step 2: Port unit tests** (`post-card-data.test.mjs`), update expectations to new eyebrow/meta rules. Run `node --test scripts/og/`. Expected: PASS.
- [ ] **Step 3: Render against the Task 2 placeholder post** with `draft: true` temporarily flipped false: `npm run og:render:posts` → PNG appears, correct size; flip back. Fail-loud behaviors preserved (nonzero exit on zero posts / render error).
- [ ] **Step 4: Commit** `feat: per-post OG card generation for insights`.

---

### Task 4: The three essays (personal-voice rework)

**Files:**
- Create: `src/content/insights/boundary-doesnt-move/index.md`, `src/content/insights/cli-is-the-new-api/index.md`, `src/content/insights/least-privilege-is-a-list/index.md`
- Delete: `src/content/insights/hello-test/`

**Interfaces:**
- Consumes: schema from Task 2. Sources: accelera-web `src/content/insights/<same-slug>/index.md`.

NOTE: content voice work is done by the MAIN session (not a code subagent). Rules recap: first-person practitioner voice; strip "we at Accelera", company positioning, and colleague references; keep federal/DoD/NIST 800-53 substance and the argumentative structure; cross-links point to `/insights/<slug>` (same slugs, now on this site); keep original dates, titles may be kept verbatim; `summary` 60-280 chars; keep `ogAccent` + `bodyWatermark` values; recompute `readTime` if length changes materially; NO em-dashes (the originals contain them; replace per grammar).

- [ ] Step 1: Rework and write all three posts (frontmatter without `author`).
- [ ] Step 2: `npm run build` — three articles emitted; verify cross-links resolve, listing order (least-privilege newest first), "Read next" appears.
- [ ] Step 3: `npm run og:render:posts` — three PNGs render; spot-check one visually.
- [ ] Step 4: `npm run a11y:test` including an article page (add `/insights/boundary-doesnt-move` to the test page list).
- [ ] Step 5: Commit `content: add three insights essays on agent governance`.

---

### Task 5: CI workflows

**Files:**
- Modify: `.github/workflows/deploy.yml`, `.github/workflows/a11y.yml`

- [ ] **Step 1: deploy.yml** — after `npm ci`, insert:

```yaml
      - name: Install Playwright chromium
        run: npx playwright install --with-deps chromium

      - name: Render per-post OG cards
        run: npm run og:render:posts
```

before `npm run build`. S3 sync steps stay; confirm the hashed-assets step's `--exclude "*.html"` + HTML step's `--include "*.html"` still partition Astro output correctly (they do: `_astro/*` hashed, HTML short-cache). Add `--exclude "*.xml"`/include xml with short cache for `sitemap-index.xml` + `rss.xml`:

```yaml
      - name: Sync XML feeds (short cache)
        run: |
          aws s3 cp ./dist s3://dayelostra.co --recursive \
            --exclude "*" --include "*.xml" \
            --cache-control "public, max-age=300, must-revalidate"
```

and add `--exclude "*.xml"` to the immutable sync so feeds aren't cached for a year.
- [ ] **Step 2: a11y.yml** — mirror build-step changes (Playwright install + og render if the a11y run builds the site).
- [ ] **Step 3: Commit** `ci: build Astro site and render OG cards on deploy`.

---

### Task 6: Clean URLs on CloudFront + infra docs (MAIN session, AWS-authorized)

**Files:**
- Create: `iac/terraform/cloudfront-function-rewrite.js` (source of record)
- Modify: `iac/terraform/main.tf` (documented resource), `RUNBOOK.md`

- [ ] **Step 1: Author the viewer-request function** (standard directory-index rewrite):

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
```

- [ ] **Step 2: Deploy to production** (memory file `dayelostra-co-aws.md` has account/distribution/role details; distribution `EZ1G9UFZ84YTV`): `aws cloudfront create-function` (runtime `cloudfront-js-2.0`), `publish`, then update the distribution's default cache behavior `FunctionAssociations` (viewer-request) via `get-distribution-config` / `update-distribution`. Verify with `curl -I https://dayelostra.co/insights/` AFTER the site deploy (Task 7) returns 200.
- [ ] **Step 3: Document** in `main.tf` (matching existing documentation-only style) + RUNBOOK. Commit `infra: CloudFront viewer-request function for directory index rewrite`.

---

### Task 7: Final verification, PR, deploy, smoke test (MAIN session)

- [ ] Step 1: Full local gate: `npm run check && npm run build && npm run og:render:posts && npm run a11y:test && node --test scripts/og/`.
- [ ] Step 2: Playwright screenshots of `/`, `/insights`, one article at desktop+mobile; eyeball for regressions.
- [ ] Step 3: Push branch, open PR (body per repo convention), merge to main (authorized). Deploy workflow runs.
- [ ] Step 4: Post-deploy smoke: `curl -I` on `/`, `/insights/`, `/insights/least-privilege-is-a-list/`, `/insights/rss.xml`, `/sitemap-index.xml`; verify OG image URL 200; verify error page still configured; spot-check live pages in Playwright.
- [ ] Step 5: Update README (stack section mentions Vite; now Astro) if stale. Commit any doc fixes.
