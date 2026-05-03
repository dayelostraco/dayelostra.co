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

| Domain | Status | How |
| --- | --- | --- |
| `dayelostra.co` | live | CloudFront `EZ1G9UFZ84YTV` → S3 origin `dayelostra.co` |
| `www.dayelostra.co` | live | same CloudFront distribution (alias) |
| `dayelostraco.com` | not pointed | redirect bucket exists but no Route 53 zone or external DNS |
| `www.dayelostraco.com` | not pointed | same |

The `.com` redirect buckets exist in S3 but DNS isn't currently pointing the `.com` domains at them. To re-enable: register/renew `dayelostraco.com`, create a Route 53 hosted zone, and add ALIAS records to the redirect buckets' website endpoints.

### Bucket access

The `dayelostra.co` bucket has a public-read bucket policy (`s3:GetObject` for `*`); CloudFront fetches via the S3 website endpoint as a custom HTTP origin. No per-object ACLs are needed.

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
