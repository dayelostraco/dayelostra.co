# dayelostra.co — Operations Runbook

On-call procedures for running and recovering the static portfolio site at `https://dayelostra.co/`.

## Architecture at a glance

```
Browser
  ↓
CloudFront distribution EZ1G9UFZ84YTV
  · cache policy: Managed-UseOriginCacheControlHeaders (83da9c7e-…)
  · response headers policy: dayelostra-co-secure-headers (fdced99f-…)
  · custom origin: S3 website endpoint
  ↓
S3 bucket s3://dayelostra.co (us-east-1, public-read bucket policy)
  · website hosting on, IndexDocument=index.html, ErrorDocument=error.html
```

GitHub Actions deploys on push to `main` via OIDC role `dayelostra-co-deploy`.

## 🚨 Site is down — first 5 minutes

```sh
# 1. is the front door responding?
curl -sIo /dev/null -w "%{http_code}\n" https://dayelostra.co/

# 2. is the origin responding?
curl -sIo /dev/null -w "%{http_code}\n" http://dayelostra.co.s3-website-us-east-1.amazonaws.com/

# 3. is the distribution deployed?
aws cloudfront get-distribution --id EZ1G9UFZ84YTV --query 'Distribution.Status' --output text

# 4. is DNS resolving?
dig +short dayelostra.co
```

**Decision tree:**
| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `000` from CloudFront | DNS / cert / propagation | Check Route 53 `Z2C41G9MQ3K99M`; verify ACM cert valid + attached |
| `403` from CloudFront, `200` from S3 | Bucket policy lost / new objects without ACL | `aws s3api get-bucket-policy --bucket dayelostra.co`; reapply public-read policy |
| `403` from S3 too | Bucket policy or public-access-block changed | Reapply policy: `aws s3api put-bucket-policy --bucket dayelostra.co --policy file://...` |
| `200` but stale content | CloudFront cache | `aws cloudfront create-invalidation --distribution-id EZ1G9UFZ84YTV --paths "/*"` |
| `Status: InProgress` on distribution | Recent config change still propagating (5-15 min) | Wait |

## Roll back to a prior good build

```sh
# find the last good commit
git log --oneline -10

# revert the bad commit (creates a new commit; safer than reset)
git revert <bad-sha>

# push — workflow re-deploys the prior content + invalidates CloudFront
git push origin main

# watch
gh run watch $(gh run list --branch main --limit 1 --json databaseId -q '.[].databaseId') --exit-status
```

If the bad build poisoned S3 with corrupt objects, the next deploy `aws s3 sync --delete` will overwrite them. No manual S3 cleanup needed.

## Deploy failed

```sh
# 1. last 5 runs
gh run list --branch main --limit 5

# 2. failed step output
gh run view <run-id> --log-failed
```

**Common causes:**
- **OIDC role-assume fails** (`Could not assume role`) → trust policy on `dayelostra-co-deploy` got narrowed/broken. Verify with `aws iam get-role --role-name dayelostra-co-deploy --query 'Role.AssumeRolePolicyDocument'`. Trust must allow `repo:dayelostraco/dayelostra.co:ref:refs/heads/main`.
- **S3 access denied** → IAM policy on `dayelostra-co-deploy` got modified. Verify with `aws iam list-role-policies --role-name dayelostra-co-deploy`. Should include `S3AndCloudFrontDeploy` granting `s3:Put/Delete/Get/List` on `dayelostra.co` + `cloudfront:CreateInvalidation` on `EZ1G9UFZ84YTV`.
- **`npm ci` fails** → `package-lock.json` drift. Run locally; if local `npm ci` works, the lockfile is in sync; force-update CI cache via Actions UI.
- **Build step fails** → run `npm run build` locally to reproduce. Most likely a Tailwind class typo or missing asset reference.

## Manual CloudFront cache flush

```sh
aws cloudfront create-invalidation \
  --distribution-id EZ1G9UFZ84YTV \
  --paths "/*"
```

Single-path version when you know exactly what changed:

```sh
aws cloudfront create-invalidation \
  --distribution-id EZ1G9UFZ84YTV \
  --paths "/index.html" "/assets/main-*.css"
```

Limit: 3,000 invalidation paths free per month. Beyond that, $0.005 per path.

## DNS / domain trouble

```sh
# 1. Route 53 hosted zone records
aws route53 list-resource-record-sets --hosted-zone-id Z2C41G9MQ3K99M --query "ResourceRecordSets[?contains(Name, 'dayelostra.co.')]"

# 2. ACM cert status (must be ISSUED + cover all aliased names)
aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?contains(DomainName, 'dayelostra.co')]"

# 3. CloudFront aliases (must match Route 53 records)
aws cloudfront get-distribution --id EZ1G9UFZ84YTV --query 'Distribution.DistributionConfig.Aliases.Items'
```

If DNS resolves but TLS fails: check `aws cloudfront get-distribution --id EZ1G9UFZ84YTV --query 'Distribution.DistributionConfig.ViewerCertificate'` — `ACMCertificateArn` must point at a valid us-east-1 certificate covering all aliases.

## Secret rotation

**OIDC role (preferred path — no secrets to rotate):**
The `dayelostra-co-deploy` IAM role is assumed via short-lived STS tokens. Nothing to rotate; the trust policy itself is the secret.

If you ever need to rotate the role's trust:
```sh
aws iam update-assume-role-policy --role-name dayelostra-co-deploy --policy-document file://trust.json
```

**GitHub repo secrets:**
- `AWS_DEPLOY_ROLE` — the role ARN. Updates only when the role is recreated.
- `CLOUDFRONT_DISTRIBUTION_ID` — `EZ1G9UFZ84YTV`. Updates only on distribution replacement.

To re-set: `printf '%s' '<value>' | gh secret set <NAME> --repo dayelostraco/dayelostra.co`.

## Asset replacement

| Asset | Path | Notes |
| --- | --- | --- |
| Resume | `public/assets/resume/Dayel_Ostraco_Resume_FullStackAI.{pdf,docx}` | Filenames hard-coded in `index.html` — keep names. To regenerate PDF from DOCX: `osascript` → Word → "Save As" → PDF (or open Word, File → Save As → PDF). |
| Portrait | `public/assets/img/bio/dayel-mid.webp` (600×600) | Used in About card. Optional preview at `dayel-preview.webp`. |
| OG / Twitter card | `public/assets/img/og.jpg` (1200×630) | Generate from any photo: `sips -s format jpeg -Z 1200 src.jpg --out og.png && sips -c 630 1200 og.png --out og.jpg`. |
| Brand marks | `public/assets/brands/{glyphon,colophon,vallark,affirmark,sigilark}-mark.svg` | Pull fresh from sibling repo: `cp ~/Development/GitHub/<product>/<product>-branding/marks/<file>.svg public/assets/brands/<product>-mark.svg`. |
| Favicon set | `public/assets/icon/` | Multi-size; if updating, regenerate all (favicon-16/32/96/128/196, apple-touch-icon-57/60/72/76/114/120/144/152, mstile, .ico). |
| Cloudflare beacon | `public/assets/js/beacon.min.js` + SRI hash in `index.html`/`error.html` | Refresh: `curl -sLo public/assets/js/beacon.min.js https://static.cloudflareinsights.com/beacon.min.js && openssl dgst -sha384 -binary public/assets/js/beacon.min.js \| openssl base64 -A`. Update the `integrity="sha384-…"` value in both HTML files. |

## Adding a new section

1. Add `<section id="…">` to `index.html`. Match an existing pattern: corner brackets, glow blob(s), texture layer, watermark span (`/SECTION-NAME`), eyebrow + h2 + content, optional `acc-gold` for gold-tinted treatment.
2. Register the anchor in both nav lists: top nav (around line 67) and mobile sidebar (around line 90).
3. Use `data-reveal` (with optional `data-reveal-delay="ms"`) on elements that fade in on scroll.

## Updating the security headers

The CloudFront Response Headers Policy `dayelostra-co-secure-headers` (id `fdced99f-973d-4a2c-818b-542b22bb2614`) controls HSTS / CSP / Frame / Content-Type / Referrer / Permissions.

To inspect:
```sh
aws cloudfront get-response-headers-policy --id fdced99f-973d-4a2c-818b-542b22bb2614
```

To update CSP (e.g. add a new third-party origin):
```sh
aws cloudfront get-response-headers-policy --id fdced99f-973d-4a2c-818b-542b22bb2614 > /tmp/rhp.json
ETAG=$(jq -r '.ETag' /tmp/rhp.json)
jq '.ResponseHeadersPolicy.ResponseHeadersPolicyConfig' /tmp/rhp.json > /tmp/rhp-cfg.json
# edit /tmp/rhp-cfg.json — find SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy
aws cloudfront update-response-headers-policy --id fdced99f-973d-4a2c-818b-542b22bb2614 --if-match "$ETAG" --response-headers-policy-config file:///tmp/rhp-cfg.json
```

After update, run a CloudFront invalidation if you want the change live immediately for already-cached responses.

## Monitoring + observability

| Signal | Source | Note |
| --- | --- | --- |
| Pageviews / unique visitors | Cloudflare Web Analytics dashboard (token `cb97cb0f5ec24361b6a0b180db7aad61`) | Beacon is self-hosted at `/assets/js/beacon.min.js`. |
| Deploy success/failure | GitHub Actions UI; `gh run list --branch main` | No alerting wired up — visit periodically or add a status check. |
| Bucket access | CloudFront access logs (not currently enabled) | To enable: `aws cloudfront update-distribution` adds a Logging block with an S3 bucket target. |
| Origin 4xx/5xx | CloudWatch metrics on the distribution | Enable via CloudFront monitoring tab; no alarms set today. |
| Cert expiry | ACM auto-renews if DNS validation records persist | Verify Route 53 retains the `_<random>.dayelostra.co.` validation CNAME records. |

No paging is set up today — this is a personal portfolio. If you want SLO-style alerting, add CloudWatch alarms on the distribution (5xx rate, total error rate) and route to SNS → email.

## Common gotchas

- **CloudFront updates are asynchronous.** After `update-distribution` or `update-response-headers-policy`, status will be `InProgress` for 5-15 minutes. The previous config keeps serving until propagation completes.
- **S3 website endpoint vs REST endpoint.** This site uses the website endpoint (`s3-website-us-east-1.amazonaws.com`) so error-document handling works. Don't switch CloudFront's origin to the REST endpoint without also configuring custom error responses.
- **Cache headers from origin are honored** because the cache policy is `UseOriginCacheControlHeaders`. If you change the workflow's `aws s3 sync` `--cache-control` value, browsers will pick up the new TTL on next request after invalidation.
- **The CSP allows `'unsafe-inline'` for styles** because we use `style="background-image:url(...)"` extensively in section backgrounds. Removing that requires moving every inline background to a CSS class.

## Bugs / quirks

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hot-reload doesn't apply CSS variable changes | Vite HMR limitation with `@theme` block | Hard-refresh (cmd+shift+R). |
| Beacon stops sending | Cloudflare changed `beacon.min.js` protocol | Re-fetch + recompute SRI per "Asset replacement" table. |
| Section watermark clips on narrow viewport | CSS `display: none` below `md:` breakpoint | By design — they're hidden on mobile. |

## Contacts

| Service | Account / Identifier |
| --- | --- |
| AWS | account `302654592899`, region `us-east-1` |
| GitHub | `dayelostraco/dayelostra.co` |
| Cloudflare Web Analytics | token `cb97cb0f5ec24361b6a0b180db7aad61` |
| Domain registrar | (whichever has the .co domain — verify in Route 53) |
