# Astro 6 to 7 Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**STATUS: COMPLETE.** Executed 2026-09-03 in PR #56 (merged as `3a7d5be`), deployed and verified live. `npm audit` went from 5 findings to 0. Follow-ons: #57 (missing `@types`, `astro check` 2 errors to 0) and #58 (`astro check` wired in as a CI gate). The two stale postcss Dependabot alerts were dismissed as inaccurate on the same day, leaving zero open alerts.

**Outcome against the risk forecast.** Both predicted risks landed clean: the Rust compiler accepted every `.astro` file with no errors, and Sätteri rendered all seven essays with no content change, including `anatomy-of-a-governed-factory`. Verification held at 14 of 14 pages DOM-identical and 22 of 22 screenshots pixel-identical (maxdelta 0), with `llms.txt`, RSS and both sitemaps byte-identical.

**Two findings the plan did not predict:**

1. **Vite 8 raised the default CSS baseline past Safari 18**, dropping `-webkit-backdrop-filter` from the three `.backdrop-blur*` rules. That would have flattened every `.glass` panel on iOS 17 and older with all five gates still green. Fixed by pinning `vite.build.cssTarget` in `astro.config.mjs`. **That pin is load-bearing: removing it as apparent cruft silently regresses older Safari.**
2. **A raw ampersand in screen-reader text.** `anatomy-of-a-governed-factory` had `POA&M` unescaped in an SVG `<desc>`; Astro 6 escaped it for us and Sätteri correctly passes authored HTML through as written. Escaped at the source.

**Two deviations from the plan as written, both narrowing scope:**

- **Both `overrides` were removed**, not just the vite one. Vite 8 resolves postcss 8.5.26 natively, so the whole block was legacy.
- **Tailwind was held at 4.3.2**, not bumped to 4.3.3. Task 2 called for the bump on the assumption it was needed for Vite 8; it was not, since 4.3.2 already peers `vite ^8`. Two CSS deltas this plan would have attributed to Tailwind persisted with it pinned, so they were Vite 8's minifier all along.

**Task 1's harness was kept**, not deleted, at `tests/parity/snapshot.mjs` (`npm run parity:shots`). It was the only check that caught finding 1, and no existing gate would have.

**Goal:** Move dayelostra.co from `astro@^6.4.8` to `astro@^7.3.1`, clearing the three build-time advisories npm can only resolve through the major (`astro` XSS x3 high, `sharp`/libvips x4 high, `esbuild` low), with **byte-level confidence that no rendered page changed**.

**Why now:** the advisories are the trigger, not the urgency. Real exposure is low: `sharp` and `esbuild` never reach a visitor, and the three Astro XSS advisories need attacker-controlled data flowing into spread attributes or `transition:*` directives, which a statically generated single-author site does not have. This is hygiene work with a real verification burden, not an incident.

**How the advisories actually clear:**

| Advisory | Resolution in Astro 7.3.1 | Verified |
|---|---|---|
| `astro` <=7.0.9, 3x XSS (high) | 7.3.1 is above the range | `npm view astro version` = 7.3.1 |
| `sharp` <0.35.0, 4x libvips CVE (high) | Astro 7 moves sharp to `optionalDependencies: ^0.35.4` | `npm view astro@7.3.1 optionalDependencies` |
| `esbuild` 0.27.3-0.28.0 (low) | Astro 7 depends on `esbuild ^0.28.0`, which resolves to 0.28.2, above the range | `npm view esbuild version` = 0.28.2 |

**Architecture:** no architectural change. Static output, S3 + CloudFront, same integrations. This is a dependency major with a compiler swap and a Markdown-engine swap underneath it, so the work is almost entirely verification.

## What does NOT apply to this repo

Confirmed against the v7 breaking-change list. Do not spend time on these, but do re-confirm each in Task 3 rather than trusting this table:

| v7 breaking change | Status here |
|---|---|
| `compressHTML` default `true` → `'jsx'` | **Already safe.** `astro.config.mjs` explicitly sets `compressHTML: true`, which is exactly the documented way to keep v6 whitespace behavior. Do not remove it. |
| Experimental flags promoted (`logger`, `queuedRendering`, `rustCompiler`, `advancedRouting`, `cache`, `routeRules`) | No `experimental` block in the config. |
| `src/fetch.ts` now reserved for advanced routing | No such file. Closest is `src/pages/llms.txt.ts`, unaffected. |
| `@astrojs/db` removed | Not used. |
| `astro:transitions` internal APIs removed | No view transitions anywhere in `src/` (grepped for `astro:transitions`, `ClientRouter`, `transition:`, `before-swap`, `astro:page-load`). |
| `getContainerRenderer()` import path moved | No framework integrations (no React/Preact/Svelte/Vue/Solid/MDX). |
| Integration majors | `@astrojs/rss` 4.0.19 and `@astrojs/sitemap` 3.7.4 are current with no Astro peer constraint; `@astrojs/check` 0.9.10 peers `typescript ^5 || ^6` and the repo is on `^6.0.3`. No major bumps needed. |

## Global Constraints

- No em-dashes in user-visible copy, markdown content, commit messages, or meta descriptions. Code comments exempt.
- No AI attribution trailers in commits.
- **Visual and textual parity is the acceptance bar.** Every rendered page must be identical to the pre-upgrade baseline except for changes explicitly accepted in Task 4 or Task 6 and recorded in this plan.
- CSP is enforced at CloudFront (`script-src 'self'`, `style-src` allows `'unsafe-inline'`): no inline `<script>` tags, no CDN assets, do NOT enable Astro `security.csp`.
- Palette unchanged: cyan `--color-accent`, pink signature `#ff06b5` used scarcely. Never Accelera blue `#00adef`.
- Existing gates all stay green and are non-negotiable: `npm run build`, `npm run a11y:test` (0 violations across 11 pages), `npm run reveal:test` (0 stranded), `npm run links:check` (41/41), `npm test` (9/9).
- Work stays on branch `chore/astro-7`. Commit after each task.
- Node >= 22.12.0 (Astro 7 `engines`). CI currently pins `node-version: '22'` in both workflows, which resolves to latest 22.x and satisfies this, but see Task 2.

---

### Task 1: Build the parity harness before touching a dependency

This is the task that makes the rest of the upgrade safe. Do not skip it or reorder it.

**Files:**
- Create: `scripts/parity/snapshot.mjs` (throwaway, not committed to `main`)

**Steps:**
- [x] On `main` at the current HEAD, run `npm ci && npm run build`, then copy `dist/` to `/tmp/baseline-dist/`.
- [x] Write `scripts/parity/snapshot.mjs`: for each of the 11 built pages, load it in Playwright at 1440x1200 and 390x844, force `[data-reveal]` elements visible (`document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-visible'))`), and write a full-page PNG to a target directory. Reuse the pattern already proven in `tests/reveal/run.mjs`.
- [x] Capture baseline screenshots to `/tmp/baseline-shots/`.
- [x] Record the baseline advisory state: `npm audit --json > /tmp/baseline-audit.json`.

**Verification:** `/tmp/baseline-dist/` contains 11 HTML pages, `/tmp/baseline-shots/` contains 22 PNGs, and both are readable. Do not proceed without them.

---

### Task 2: Dependency bump and lockfile

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `.github/workflows/a11y.yml`, `.github/workflows/deploy.yml`

**Steps:**
- [x] `npx @astrojs/upgrade` (the documented path), or `npm i astro@^7.3.1` if the codemod misbehaves on a repo this small.
- [x] **Remove the `vite: "^7.3.3"` override from `package.json`.** Astro 7 depends on `vite ^8.0.13`; leaving a `^7` override pinned will either fail resolution or silently hold Vite back and break the build. This is the single most likely cause of a confusing failure in this upgrade.
- [x] Re-evaluate the `postcss: "^8.5.18"` override. It exists to force a patched postcss under Vite 7. Check what Vite 8 resolves on its own (`npm ls postcss --all`) and drop the override if it is redundant, or raise it to `^8.5.23` if still needed. Whatever the outcome, the resolved version must stay above 8.5.22 (GHSA-fxqj-rqcc-2cmp).
- [x] Bump `@tailwindcss/vite` and `tailwindcss` to `^4.3.3`. Confirmed to peer `vite ^5.2.0 || ^6 || ^7 || ^8`, so it is Vite 8 ready.
- [x] Bump `@astrojs/check` to `^0.9.10`.
- [x] Pin CI to `node-version: '22.12'` or higher in both workflows so a future minor-22 image cannot drop below Astro 7's floor.
- [x] Add `"engines": { "node": ">=22.12.0" }` to `package.json` so the constraint is stated where a reader will find it.

**Verification:** `npm ls astro vite sharp esbuild postcss --all` shows astro 7.3.x, vite 8.x, sharp >=0.35.4, esbuild >=0.28.1, postcss >8.5.22. `npm audit` no longer reports `astro`, `sharp`, or `esbuild`.

---

### Task 3: Re-confirm the config against the v7 breaking-change list

Do not trust the "does not apply" table above. Re-derive it.

**Files:**
- Modify (only if a change is genuinely required): `astro.config.mjs`

**Steps:**
- [x] Walk the v7 upgrade guide top to bottom against `astro.config.mjs` and record each item as applies/does-not-apply in the PR body.
- [x] Confirm `compressHTML: true` survived the codemod. If `npx @astrojs/upgrade` stripped or rewrote it, put it back: dropping it silently changes whitespace between inline elements site-wide, which is the highest-blast-radius invisible change in this upgrade.
- [x] Confirm the `redirects` block still emits meta-refresh stubs for the three renamed essay slugs under static output. These are live SEO redirects, so a silent behavior change here costs real traffic.
- [x] Confirm the `sitemap()` integration's `filter` and `serialize` hooks still fire, including the `insightsLastmod` map read from frontmatter at config time via `gray-matter`.

**Verification:** the built `dist/sitemap-0.xml` still carries `lastmod` on all seven essay URLs and still excludes `/error`. The three redirect stubs exist in `dist/`.

---

### Task 4: Markdown engine swap (Sätteri): the real risk

Astro 7 replaces remark/rehype with **Sätteri** (`@astrojs/markdown-satteri`, a hard dependency) and demotes `@astrojs/markdown-remark` to an optional peer. The repo configures **no** remark or rehype plugins, so nothing breaks at the config level, but the Markdown of seven published essays is now rendered by a different engine.

**Risk is concentrated, not spread.** Measured across the seven essays: zero tables, zero footnotes, 4 code fences total (2 in `command-allow-list`, 2 in `govern-the-agent-cli`), a handful of blockquotes, and typographic apostrophes throughout (13 in `agents-are-accounts`, 9 in `swap-the-model-keep-the-ato`, 7 in `command-allow-list`). The outlier is **`anatomy-of-a-governed-factory`, which has 156 lines of inline HTML in Markdown.** That one essay is where a Markdown-engine swap will bite if it bites anywhere.

**Steps:**
- [x] Build and diff every essay's rendered article body against `/tmp/baseline-dist/`. Expect and scrutinize: smart-quote and apostrophe handling, code-fence wrapper markup and language classes, blockquote nesting, heading id/anchor generation (the essay template may rely on generated ids), and inline-HTML passthrough.
- [x] Give `anatomy-of-a-governed-factory` a line-by-line read in the browser against the baseline screenshot, not just a text diff.
- [x] Verify `render(post)` from `astro:content` still returns a usable `Content` component in `src/pages/insights/[...slug].astro:17`, and that `<Image>` from `astro:assets` still optimizes `heroImage` in both `[...slug].astro:156` and `insights/index.astro:67`.
- [x] Check the RSS feed. `src/pages/insights/rss.xml.ts` renders full article text with its own `markdown-it` parser (a devDependency, untouched by this upgrade), so the feed and the site can now disagree about the same essay's HTML. Diff one essay's feed body against its page body and decide whether that divergence is acceptable or whether the feed should move onto Astro's renderer.
- [x] **Decision point.** If Sätteri's output diverges in a way that degrades any essay, install `@astrojs/markdown-remark@^7.3.0` and set `markdown: { processor: unified() }` to keep the v6 pipeline. Record the decision and the evidence in the PR body either way. Accepting Sätteri is preferred if the output holds, since it is the maintained default.

**Verification:** every essay body is either byte-identical to baseline or its diff is explicitly enumerated and accepted in the PR body.

---

### Task 5: Rust compiler HTML strictness

The Rust compiler is now the only compiler and it is stricter: unclosed tags are errors rather than silently accepted, and invalid HTML nesting is no longer auto-corrected.

`src/pages/index.astro` is roughly 1,070 lines of hand-authored markup with deep nesting and many decorative empty elements (`<span class="cf-tl">` corner brackets, glow blobs, watermarks). This is exactly the shape of file that relied on v6's tolerance without anyone noticing.

**Files:**
- Modify: `src/pages/index.astro`, and any of `src/pages/accessibility.astro`, `src/pages/error.astro`, `src/pages/insights/index.astro`, `src/pages/insights/[...slug].astro`, `src/layouts/Layout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro` that the compiler rejects

**Steps:**
- [x] Build and fix every compiler error. These are loud and cheap.
- [x] Then hunt the silent class: nesting the old compiler auto-corrected. Specifically look for block-level elements inside `<p>` (a `<div>` or `<ul>` inside a paragraph is the classic case, and the missions and endorsements sections mix `<p>` with flex containers), and for `<span>` wrapping block content.
- [x] Diff the built HTML structure against baseline for every page, not just the ones that errored. A nesting auto-correction that v6 applied and v7 does not will show up as a changed DOM tree with no error at all.
- [x] Re-run `npm run reveal:test`. It counts 102 `[data-reveal]` elements and asserts 0 stranded, so it is a genuine tripwire for DOM restructuring.

**Verification:** build succeeds with no compiler warnings, `reveal:test` reports 102/102 desktop and 0 stranded on both viewports, and page DOM structure matches baseline.

---

### Task 6: Vite 8, Tailwind v4, and CSS output

**Steps:**
- [x] Confirm `inlineStylesheets: 'always'` still inlines the stylesheet into every page. This is a deliberate performance choice documented in the config, and the CloudFront CSP allows `'unsafe-inline'` for `style-src` specifically to permit it. If Vite 8 changes inlining behavior, the site keeps working but loses the optimization silently.
- [x] Expect and accept cosmetic CSS serialization differences from the new compiler: named colors may emit as hex (`rebeccapurple` → `#639`) and `url()` values may gain or lose quotes. Confirm each diff is cosmetic by comparing computed styles in the browser, not by reading the CSS text.
- [x] Re-run the a11y gate. It exercises real contrast ratios across 11 pages, so it will catch any color that changed in substance rather than in serialization.
- [x] Confirm the Playwright OG card renderers still work: `npm run og:render` and `npm run og:render:posts`. These run against a local HTML template rather than the Astro build, so they should be unaffected, but `og.jpg` and the per-post cards are load-bearing for social sharing.
- [x] Confirm the `postbuild` step still relocates the 404 page: `scripts/fix-error-page.mjs` moves `dist/error/index.html` to `dist/error.html`, which CloudFront depends on.

**Verification:** all five gates green, screenshots match baseline at both viewports, OG cards regenerate byte-comparably, `dist/error.html` exists.

---

### Task 7: Full verification sweep and PR

**Steps:**
- [x] Run the complete gate set and paste the actual output into the PR body: `npm run build`, `npm run a11y:test`, `npm run reveal:test`, `npm run links:check`, `npm test`.
- [x] Diff `dist/` against `/tmp/baseline-dist/` and diff the screenshot set against `/tmp/baseline-shots/`. Enumerate every remaining difference in the PR body with a one-line justification each. An unexplained diff blocks the merge.
- [x] Run `npm audit` and confirm `astro`, `sharp`, and `esbuild` are gone. Note anything new that Vite 8 dragged in.
- [x] Open the PR against `main`, linked to its issue.
- [x] Delete `scripts/parity/snapshot.mjs` before merging, or move it under `tests/` as a permanent visual-regression harness if it proved useful enough to keep. Do not leave a throwaway script in the repo root.

---

### Task 8: Post-merge deploy verification

**Steps:**
- [x] Confirm the Deploy workflow succeeds on `main`.
- [x] Verify live: hero renders, `/insights/` lists all seven essays, one essay body reads correctly end to end, `/llms.txt` is intact, the three legacy essay redirects still land, `/error.html` serves, and the resume PDF still downloads.
- [x] Confirm GitHub's Dependabot alert list reflects the new lockfile.

---

## Effort and sequencing

Roughly **4 to 6 hours** of focused work, and the distribution is lopsided: Tasks 2, 3, and 6 are mechanical and fast, while **Tasks 4 and 5 carry nearly all the risk and most of the time.** Task 1 is short but everything downstream depends on it.

Do it in one sitting rather than across days. The parity harness in Task 1 is throwaway and lives in `/tmp`, so a stale baseline is worse than no baseline.

## Rollback

Single squashed commit on `main`, revertable in one step. Nothing in this upgrade touches infrastructure, content, or the CloudFront distribution, so a revert plus a redeploy restores the prior site exactly. The advisories return with it, which is an acceptable position to hold given the exposure analysis at the top of this document.
