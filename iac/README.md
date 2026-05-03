# dayelostra.co — Infrastructure as Code

Terraform definitions for the **mutable** AWS resources that back the site:

- IAM OIDC deploy role (`dayelostra-co-deploy`) + trust policy + inline policy
- CloudFront Response Headers Policy (`dayelostra-co-secure-headers`) with HSTS / CSP / frame-deny / referrer / permissions

**Not** captured here (intentional): S3 buckets, Route 53 hosted zone, ACM certificate, the CloudFront distribution itself. Those are stable / set-and-forget; capturing them in IaC adds churn without value at this scale.

## Why

This is documentation-as-code first, recovery path second. The GitHub Actions deploy workflow does not touch any of these resources — it only writes objects to S3 and invalidates CloudFront. So if someone clicks the wrong button in the AWS console (or an audit changes a header), `terraform apply` reverts.

## Initial setup (one-time)

The live infrastructure already exists. To start managing it via Terraform without recreating anything, import existing state:

```sh
cd iac/terraform
terraform init

# import each existing resource
terraform import aws_iam_role.deploy dayelostra-co-deploy
terraform import aws_iam_role_policy.deploy dayelostra-co-deploy:S3AndCloudFrontDeploy
terraform import aws_cloudfront_response_headers_policy.secure fdced99f-973d-4a2c-818b-542b22bb2614

# verify no diff
terraform plan
```

If `terraform plan` shows changes, the live config has drifted from this Terraform — review carefully before applying.

## Drift recovery

```sh
cd iac/terraform
terraform plan         # see drift
terraform apply        # restore config to match this Terraform
```

## Modifying the security headers

Edit `main.tf`'s `aws_cloudfront_response_headers_policy.secure` block, then:

```sh
terraform plan
terraform apply
```

CloudFront propagation: 5–15 minutes. To force-flush cached responses immediately after apply:

```sh
aws cloudfront create-invalidation --distribution-id EZ1G9UFZ84YTV --paths "/*"
```

## Modifying deploy permissions

Edit the `aws_iam_role_policy.deploy` block. Apply takes effect on the next GitHub Actions run.

## State

State is local (`terraform.tfstate` gitignored). For collaborative use, uncomment the S3 backend block in `main.tf` and `terraform init -migrate-state`. Migrate target should be a separate state bucket, not `dayelostra.co` itself (mixing IaC state with web content = fragile).

## Resource IDs (snapshot)

| Resource | Identifier |
| --- | --- |
| IAM OIDC role | `arn:aws:iam::302654592899:role/dayelostra-co-deploy` |
| OIDC trust subject | `repo:dayelostraco/dayelostra.co:ref:refs/heads/main` |
| CF response headers policy | `fdced99f-973d-4a2c-818b-542b22bb2614` |
| CF distribution (referenced) | `EZ1G9UFZ84YTV` |
| S3 origin bucket (referenced) | `dayelostra.co` |
| AWS account | `302654592899` (us-east-1) |
