# dayelostra.co

Personal portfolio for Dayel Ostraco — Full Stack AI Engineer & Secure Systems Architect. Astro 6 static site with Tailwind v4, deployed to AWS S3 + CloudFront via GitHub Actions on push to `main`.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/ (gitignored)
npm run preview  # preview the production build (http://localhost:4321)
npm run check    # astro check (type + template diagnostics)
```

## File layout

```
/
├─ src/
│  ├─ pages/
│  │  ├─ index.astro        # main page (11 sections)
│  │  ├─ accessibility.astro # accessibility statement
│  │  └─ error.astro        # 404 page (emitted to dist/error.html by postbuild)
│  ├─ layouts/
│  │  └─ Layout.astro       # shared <head> (meta/OG/favicons/fonts/JSON-LD) + body shell
│  ├─ components/
│  │  ├─ Navbar.astro       # desktop nav + mobile sidebar (home vs deep-link modes)
│  │  └─ Footer.astro       # footer + accessibility link
│  ├─ scripts/
│  │  ├─ main.js            # entry — wires the four modules below on DOMContentLoaded
│  │  ├─ cycler.js          # rotating subhead in hero
│  │  ├─ reveal.js          # IntersectionObserver-driven scroll reveals
│  │  ├─ sidebar.js         # mobile menu w/ focus trap, ESC, aria-expanded
│  │  └─ typewriter.js      # terminal-style $ caption
│  └─ styles/main.css       # Tailwind v4 entry with @theme tokens
├─ public/assets/           # passthrough to dist/ verbatim (Astro publicDir)
│  ├─ brands/               # 9 product brand SVGs (glyphon, colophon, vallark, affirmark, sigilark, +mascots)
│  ├─ icon/                 # favicons, touch icons, mstile
│  ├─ img/
│  │  ├─ bg/                # section bg textures (concrete, sectors-watch, nebula, PCB macro, break-sea, operations)
│  │  ├─ bio/               # portrait (dayel-mid.webp, dayel-preview.webp)
│  │  ├─ og.jpg             # OG / Twitter card preview image
│  │  └─ error.png          # 404 background
│  ├─ resume/               # CV downloads (DOCX + PDF)
│  ├─ svg/icons.svg         # icon sprite (use href="…#id" everywhere)
│  └─ robots.txt            # crawler allow-all
├─ astro.config.mjs
├─ scripts/fix-error-page.mjs # postbuild: dist/error/index.html -> dist/error.html
├─ LICENSE                  # All rights reserved
└─ .github/workflows/deploy.yml
```

## Sections (in order)

`#top` Hero · `#about` About · `#services` Services (3 tiers) · `#lab` Air-Gapped AI Lab · `#glyphon` Flagship · `#products` Product family · `#missions` Recent missions · `#stack` Stack · `#certs` Certifications · `#resume` Resume + Press · `#connect` Connect.

## Deploy

`.github/workflows/deploy.yml` runs on push to `main` (and `workflow_dispatch`). Steps: checkout → npm ci → npm run build → AWS auth → sync `dist/` to S3 → invalidate CloudFront `/*`.

### Domains

| Domain | Status | How |
| --- | --- | --- |
| `dayelostra.co` | live | CloudFront `EZ1G9UFZ84YTV` → S3 origin `dayelostra.co` |
| `www.dayelostra.co` | live | same CloudFront distribution (alias) |
| `dayelostraco.com` | redirect | resolves to CloudFront edge; redirect bucket → `dayelostra.co` |
| `www.dayelostraco.com` | redirect | same |

### Required GitHub repo secrets

| Secret | Value |
| --- | --- |
| `AWS_DEPLOY_ROLE` | ARN of the IAM role assumed via OIDC: `arn:aws:iam::302654592899:role/dayelostra-co-deploy`. The role's trust policy is scoped to this repo + `refs/heads/main` only. |
| `CLOUDFRONT_DISTRIBUTION_ID` | `EZ1G9UFZ84YTV` |

Auth uses GitHub Actions OIDC, not long-lived AWS access keys. The workflow exchanges a short-lived OIDC token for STS credentials at run time. Nothing to rotate.

### AWS infrastructure reference

| Resource | Identifier |
| --- | --- |
| Origin S3 bucket | `s3://dayelostra.co` (us-east-1, public-read bucket policy) |
| Redirect S3 buckets | `s3://www.dayelostra.co`, `s3://dayelostraco.com`, `s3://www.dayelostraco.com` |
| CloudFront distribution | `EZ1G9UFZ84YTV` |
| CloudFront cache policy | Managed `UseOriginCacheControlHeaders` (`83da9c7e-f89d-4fab-a63d-7e88639e58f6`) |
| Route 53 hosted zone | `Z2C41G9MQ3K99M` (`dayelostra.co.`) |
| ACM certificate | wildcard cert covering `dayelostra.co` + `www.dayelostra.co` |

### Cache headers

The workflow sets two profiles:
- HTML: `max-age=300, must-revalidate` — users pick up new builds within 5 minutes.
- Hashed assets: `max-age=31536000, immutable` — Astro hashes filenames under `_astro/`, safe to cache forever.

CloudFront invalidation runs `/*` on each deploy, flushing edge caches immediately.

## Runbook

**Deploy failed?** Check `gh run list --branch main --limit 5` and `gh run view <id> --log-failed`. Common causes: AWS credential expiry, S3 / CloudFront permission drift.

**Roll back?** `git revert <bad-sha> && git push origin main`. The workflow re-runs and CloudFront invalidates `/*` so the prior build is live within ~30 seconds.

**Manual CloudFront invalidation?** `aws cloudfront create-invalidation --distribution-id EZ1G9UFZ84YTV --paths "/*"`.

**Domain down?** Check (1) Route 53 records resolve to CloudFront aliases, (2) ACM cert is valid + attached to the distribution, (3) `aws cloudfront get-distribution --id EZ1G9UFZ84YTV --query 'Distribution.Status'` returns `Deployed`.

## Design tokens

CSS custom properties live in `src/styles/main.css` `@theme` block:

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#0a0e2a` | base navy |
| `--color-surface` | `#0f1f3a` | elevated surfaces (cards) |
| `--color-accent` | `#00adef` | Accelera Blue — primary accent |
| `--color-accent-deep` | `#004069` | deeper accent for gradients |
| `--color-gold` | `#c1a066` | SigilArk Gold — second accent |
| `--color-text` | `#ebe5d5` | parchment cream — body text |

Per-section accent shift via the `.acc-gold` class — it shadows `--color-accent` inside its scope, so every Tailwind utility (`text-accent`, `bg-accent`, `ring-accent`, etc.) auto-shifts to gold in that subtree without per-element class swapping.

## Adding a new section

1. Add a `<section id="…">` to `src/pages/index.astro`. Match the existing pattern: corners brackets, glow blob(s), texture layer (dot-grid / grain / scanlines / diagonal-lines), section watermark span (`/SECTION-NAME`), eyebrow + h2 + content.
2. Add `acc-gold` to the section if it should lean gold instead of blue.
3. Register the anchor in the `links` array in `src/components/Navbar.astro`: it drives both the desktop nav and the mobile sidebar.
4. Use `data-reveal` (and optional `data-reveal-delay="ms"`) on elements you want to fade in on scroll.

## Asset replacement

- **Resume:** drop new files at `public/assets/resume/Dayel_Ostraco_Resume_FullStackAI.{docx,pdf}` (filenames are hard-coded in `src/pages/index.astro` so keep these names).
- **Portrait:** `public/assets/img/bio/dayel-mid.webp` (used in About card).
- **OG / Twitter card image:** `public/assets/img/og.jpg` (1200×630).
- **Brand marks:** `public/assets/brands/{glyphon,colophon,vallark,affirmark,sigilark}-mark.svg`. To pull a fresh version from a sibling repo: `cp ~/Development/GitHub/<product>/<product>-branding/marks/<file>.svg public/assets/brands/<product>-mark.svg`.
- **Favicons:** `public/assets/icon/`.

## Analytics

Cloudflare Web Analytics. The beacon `<script>` (with its `data-cf-beacon` token) lives in `src/layouts/Layout.astro`, so it ships on every page. The token is a public site identifier (not a secret).

## Accessibility

Targets WCAG 2.1 AA + Section 508. Notable measures: skip link, `:focus-visible` outline on all interactive elements, `prefers-reduced-motion` neutralizes all animations + transitions, ≥44×44 touch targets on mobile sidebar, `role="dialog"` + `aria-modal` + focus trap on the sidebar, `aria-hidden` on all decorative layers, `aria-live="polite"` on the cycling subhead, `<noscript>` fallback for reveal animations, `rel="noopener noreferrer"` on external links.
