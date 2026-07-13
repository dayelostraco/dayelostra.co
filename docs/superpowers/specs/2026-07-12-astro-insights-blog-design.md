# Astro Migration + Insights Blog — Design Spec

Date: 2026-07-12
Status: Approved by Dayel (verbal, session "dayelostra.co")

## Goal

Add blogging capability to dayelostra.co using the same framework as
accelerasolutions.com (`accelera/accelera-web`), and publish personal-voice
reworks of the three agent-governance essays currently on Accelera Insights.

## Decisions (user-confirmed)

- **Architecture:** migrate the whole site from Vite 8 static HTML to
  **Astro 6** (static output), matching accelera-web.
- **Route/label:** `/insights`, nav label "Insights".
- **Content strategy:** rework the three essays into first-person personal
  voice (Accelera company framing stripped, federal/NIST substance kept).
  Pages are self-canonical. Original publish dates kept.
- **Deploy:** autonomous, authorized to deploy to production AWS.

## 1. Framework migration (Vite → Astro 6)

- Astro 6, `output: 'static'`, `site: 'https://dayelostra.co'`.
- Tailwind CSS v4 via `@tailwindcss/vite` plugin; existing
  `src/styles/main.css` `@theme` tokens, utilities, and section-ground
  rhythm move over unchanged.
- `inlineStylesheets: 'always'` to preserve current inlined-CSS behavior
  (replaces the custom `inlineCss` Vite plugin).
- Self-hosted fonts stay as-is in `public/assets/fonts/` with preloads.
- Decompose `index.html` into:
  - `src/layouts/Layout.astro` — head, SEO/OG/Twitter meta, favicons,
    theme-color, JSON-LD (Person), font preloads. Props for per-page
    title/description/canonical/OG overrides (article pages pass
    `ogType="article"` and a per-post OG image).
  - `src/components/Navbar.astro` + `src/components/Sidebar.astro` (or
    combined) — current nav markup, now shared across pages, with an
    added "Insights" link. On non-index pages, section anchors link to
    `/#section`.
  - `src/components/Footer.astro`.
  - `src/pages/index.astro` — the portfolio sections, markup unchanged.
  - `src/pages/accessibility.astro`, `src/pages/error.astro`.
- Vanilla JS (`src/scripts/*.js`: sidebar focus trap, nav scroll, reveal)
  carries over, loaded as module scripts (`script-src 'self'` CSP-safe;
  no inline scripts).
- Visual output must be pixel-equivalent. Existing Playwright + axe-core
  a11y tests keep passing.

## 2. Blog framework (ported from accelera-web)

- `src/content.config.ts`: `insights` collection, glob loader over
  `src/content/insights/**/*.{md,mdx}`, Zod schema:
  `title`, `date` (UTC), `summary` (60–280), `tags?`, `readTime?`
  (manual string), `heroImage?`/`heroImageAlt?`, `draft` (default false,
  excluded in prod), `ogImage?`, `ogAccent?`, `bodyWatermark?`.
  **No `author` field / no authors registry** — single-author site;
  byline (Dayel Ostraco + LinkedIn) hardcoded in the article template.
- `src/pages/insights/index.astro` — listing: card grid (date, readTime,
  title, summary, tag pills), RSS link, empty state.
- `src/pages/insights/[...slug].astro` — article page: dark hero (tags,
  title, summary, byline, date, readTime), prose band with editorial
  ornaments (drop cap, numbered H2 eyebrows via CSS counters, stylized
  ordered lists, lead-paragraph accent rule, body watermark), "Read next"
  (other posts, newest-first, max 2), back link.
- `src/pages/insights/rss.xml.ts` — `@astrojs/rss`, drafts excluded.
- `@astrojs/sitemap` integration; update `public/robots.txt` (currently
  says "no sitemap needed") to reference the sitemap.
- Article styling re-skinned from Accelera blue to the site's two-tier
  palette: cyan workhorse (`--color-accent` #0e7490 / `--color-accent-vivid`
  #39d7ff on dark) + scarce pink signature (#ff06b5). Respect existing
  contrast rules (vivid cyan only on dark grounds / large text).
- Code blocks: keep accelera's single high-contrast Shiki treatment
  (CSP strips per-token inline styles here too).

## 3. Per-post OG cards

- Port `scripts/og/render-posts.mjs`, `og-post.html`, `post-card-data.mjs`
  (+ its unit tests), rebranded to dayelostra.co's dark ground with cyan
  accent and pink signature, consistent with the existing site OG card.
- Output `public/assets/img/og/og-insights-<slug>.png` (2400×1260),
  gitignored, regenerated in CI before build. Fail loud on render error
  or zero posts. Existing site-level `og:render` script stays.
- Simplify author handling (no registry lookup).

## 4. Content: three reworked essays

Slugs and dates preserved from the originals:

| Slug | Title (original) | Date |
|---|---|---|
| `boundary-doesnt-move` | Agents Are Just Identities. The Boundary Hasn't Moved. | 2026-06-08 |
| `cli-is-the-new-api` | The CLI Is the New API. Govern It Like One. | 2026-06-23 |
| `least-privilege-is-a-list` | The Agent Can't Run That Command. That's Least Privilege. | 2026-07-07 |

Rework rules:
- First-person practitioner voice; strip "we at Accelera" / company
  positioning; keep the federal/DoD/NIST 800-53 substance (that IS the
  personal positioning).
- Cross-links between the trilogy point at `dayelostra.co/insights/...`.
- No em-dashes anywhere in the content (user writing-style rule).
- Greg Dyer's essay is NOT ported.

## 5. Deploy + infra

- `.github/workflows/deploy.yml`: add Playwright chromium install +
  `npm run og:render:posts`, build via `astro build`; S3 sync +
  CloudFront invalidation unchanged (HTML 300s cache, hashed assets
  immutable — Astro's `_astro/` hashed assets fit the existing rule;
  sync patterns adjusted as needed).
- **Clean URLs:** Astro emits `insights/<slug>/index.html`; the S3 REST
  origin doesn't resolve subdirectory index documents. Add a CloudFront
  Function (viewer-request) rewriting `/insights/<slug>/` and other
  directory URIs to `.../index.html`. Applied to production directly
  (authorized) and documented in `iac/terraform/` + RUNBOOK.
- CSP stays at the CloudFront response-headers policy; verify Astro
  output complies (no inline scripts; inline styles already allowed).
  Do not adopt Astro's per-page CSP meta.
- a11y workflow updated for the Astro build/preview.

## Out of scope

Tag archive pages, `news` collection, featured posts, comments,
analytics changes, canonical/cross-link changes on accelerasolutions.com.

## Success criteria

- `astro build` succeeds; site visually equivalent to current production.
- `/insights` lists 3 posts; each article renders with editorial styling,
  correct meta/OG/canonical, generated OG card.
- RSS valid at `/insights/rss.xml`; sitemap present; robots.txt updated.
- a11y tests pass across index + insights pages.
- Production serves clean URLs for `/insights/...` after deploy.
