# Publishing an Insights essay

The authoring contract for `/insights`. Everything here is enforced either by the Zod schema in `src/content.config.ts` or by the verify gate below; this doc explains the intent behind the rules.

## Where posts live

One directory per post: `src/content/insights/<slug>/index.md`. The directory name IS the URL slug (`/insights/<slug>/`), so choose it deliberately; renaming later means adding a redirect (see "Renaming a slug"). Co-locate a hero image in the same directory if the post has one.

## Frontmatter contract

```yaml
---
title: "Least Privilege Is a List, Not a Prompt."        # required. The editorial H1 and OG-card headline.
seoTitle: "Least Privilege Is a List: Command Allow-Lists for AI Agents"
                          # optional. The <title> tag only. Pattern: "Editorial line: keyword clause".
                          # Falls back to title. Write it for how the audience searches, not how you talk.
date: 2026-07-07          # required. Publish date, date-only, treated as UTC midnight.
updated: 2026-08-01       # optional. Set on substantive edits; feeds BlogPosting dateModified + sitemap lastmod.
summary: "One to two sentences, 60-280 chars."           # required. Card text, meta description, RSS description.
tags: [ai, agents, federal]                              # optional. Rendered as pills; feeds BlogPosting keywords.
series:                   # optional. Posts sharing a name get a "Part N of M" badge and
  name: "Agent Governance"  # ordered prev/next navigation (replaces recency-based Read next).
  part: 3                 # M is computed from the collection; publishing part 4 updates all siblings.
readTime: "6 min read"    # optional, manual. No auto-computation; eyeball ~200 wpm.
heroImage: ./hero.webp    # optional, relative path in the post dir.
heroImageAlt: "..."       # required if heroImage is set (a11y gate will catch it).
draft: true               # default false. Drafts render in `npm run dev` only; excluded from prod build, RSS, OG.
ogImage: /assets/img/...  # optional override; default is the generated per-post card.
ogAccent: "Not a Prompt." # optional. MUST be an exact substring of title; rendered in vivid cyan on the OG card.
bodyWatermark: "/LEASTPRIV"  # optional. Ambient mono watermark behind the body. Defaults to /ESSAY.
---
```

## Voice and style rules

- First-person practitioner voice. This is a personal site; "I keep seeing" beats "organizations should."
- **No em-dashes** anywhere in content, titles, or summaries. Use periods, colons, commas, or parentheses. (Code blocks and code comments are exempt.)
- Put one plain **definition sentence** near the top: a single crisp sentence an answer engine can quote verbatim. The essay's thesis, stripped of rhetoric.
- Cross-link related essays with root-relative **trailing-slash** URLs: `[text](/insights/other-slug/)`.
- Do not reuse titles, slugs, or opening paragraphs from essays published on accelerasolutions.com. The two sites deliberately publish sibling essays, not mirrors (see docs/reviews/2026-07-13-seo-specialist-review.md, finding B).

## What happens automatically

- **Listing, homepage section, Read next, sitemap, RSS** all derive from the collection; no registration step.
- **OG card**: `npm run og:render:posts` renders `public/assets/img/og/og-insights-<slug>.png` (2400x1260) per non-draft post. Runs in CI before every build; PNGs are gitignored. It fails the build loudly on a render error or zero posts. `ogAccent` colors that substring of the title.
- **BlogPosting JSON-LD** is emitted per article with author/sameAs, dates, keywords.
- **Code blocks** render in a single pinned high-contrast treatment (see `.article-prose pre.astro-code` in `src/styles/main.css`); per-token Shiki colors are deliberately overridden.

## Local workflow

```sh
npm run dev              # drafts visible at /insights (dev only)
npm run build            # prod build; drafts excluded
npm run og:render:posts  # regenerate OG cards locally to eyeball yours
npm run a11y:test        # axe-core gate (build + `npx astro preview --port 4321` first)
npm test                 # OG card-data unit tests
```

The full pre-publish gate: `npm run check && npm run build && npm run og:render:posts && npm run a11y:test && npm test`.

## Review gates for essays

Every essay (and any external bylined submission: public comments, framework
contributions, op-eds) passes two review stages before publish, both run as
adversarial persona reviews with findings triaged and fixed before deploy:

1. **Substance review.** One or two personas drawn from the essay's actual
   audience (e.g. ATO engineer, GS-15 program executive, framework
   maintainer). They attack claims: process accuracy, overclaims,
   self-serving reads, missing beats.
2. **Editor review.** A single editor persona attacks the writing, not the
   claims: flab, buried ledes, unclear antecedents, register drift, grammar,
   AND cross-corpus repetition (constructions or aphorisms reused from
   already-published essays on either site; the sibling-essay structure makes
   repeated tics visible to anyone reading both). Also verifies the standing
   style rules: no em-dashes, definition sentence present, summary within
   60-280 chars.

Repo docs, commit messages, and issue text do not need these gates.

Publishing = flip `draft: false` (or remove it), commit, push to `main`. The deploy workflow renders OG cards, builds, runs the blocking accessibility gate, syncs S3, and invalidates CloudFront.

**On substantive revisions:** set (or bump) `updated:` in the frontmatter. It feeds the sitemap's `lastmod` and the article's `dateModified` schema, and freshness signals only work if the field gets used. Copyedits do not need it; anything that changes an argument, adds a section, or would make a returning reader notice does.

## Renaming a slug

Rename the directory, update any cross-links in other essays, and add the old route to `redirects` in `astro.config.mjs` so the old URL emits a redirect stub (meta-refresh + canonical to the new URL). Update `tests/a11y/run.mjs` if the renamed post is in its PAGES list.

## Adding a hero image

Drop the image in the post directory, reference it as `heroImage: ./name.webp` with `heroImageAlt`. Astro optimizes it at build; the article template renders it straddling the dark/light boundary.
