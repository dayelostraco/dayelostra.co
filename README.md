# dayelostra.co

Personal site. Static HTML built with Vite + Tailwind v4, deployed to S3 + CloudFront via GitHub Actions on push to `master`.

## Local development

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## File layout

```
/
├─ index.html               # main page (15 sections)
├─ error.html               # 404 page
├─ src/
│  ├─ scripts/main.js       # entry: typewriter + reveal + sidebar
│  └─ styles/main.css       # Tailwind v4 entry with @theme
├─ public/assets/           # static assets passed through to dist/ verbatim
│  ├─ icon/                 # favicons, touch icons, mstile
│  ├─ img/                  # section backgrounds, photos, logos
│  ├─ resume/               # CV downloads (DOCX, PDF)
│  ├─ svg/icons.svg         # icon sprite (referenced via <use href="…#id">)
│  └─ ai/, psd/             # source files (kept for posterity)
├─ vite.config.js
└─ .github/workflows/deploy.yml
```

## Deploy

`.github/workflows/deploy.yml` runs on push to `master` (or via Actions → Run workflow). It builds with Vite, syncs `dist/` to the `dayelostra.co` S3 bucket with a two-tier cache policy, and invalidates the CloudFront distribution.

### Domains

All four domains serve the same content:

| Domain | How |
| --- | --- |
| `dayelostra.co` | CloudFront `EZ1G9UFZ84YTV` → S3 origin `dayelostra.co` |
| `www.dayelostra.co` | same CloudFront distribution (alias) |
| `dayelostraco.com` | S3 redirect bucket → `dayelostra.co` |
| `www.dayelostraco.com` | S3 redirect bucket → `dayelostra.co` |

Only the origin bucket needs content; the redirect buckets are configured at the bucket level and stay as-is.

### Required GitHub repo secrets

| Secret | Value |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | IAM user with S3 PutObject/DeleteObject on `dayelostra.co` and CloudFront CreateInvalidation |
| `AWS_SECRET_ACCESS_KEY` | (paired with above) |
| `CLOUDFRONT_DISTRIBUTION_ID` | `EZ1G9UFZ84YTV` |

### Cache headers

The workflow sets two cache profiles:
- HTML: `max-age=300, must-revalidate` — users pick up new builds within 5 minutes.
- Everything else: `max-age=31536000, immutable` — Vite hashes asset filenames, so they're safe to cache forever.

CloudFront invalidation runs `/*` on each deploy, flushing edge caches immediately.

## Analytics

Cloudflare Web Analytics — beacon token is inlined in `index.html` and `error.html`.
