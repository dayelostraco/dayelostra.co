# dayelostra.co — mutable AWS resources captured as code
#
# Scope: only the resources we actively iterate on (IAM OIDC role + trust + inline
# policy, CloudFront Response Headers Policy). Static / set-and-forget resources
# (S3 buckets, Route 53 hosted zone, ACM cert, the CloudFront distribution itself)
# stay manually-managed — they don't churn enough to justify the IaC overhead.
#
# State management: local. Run from this directory; state file is gitignored.
# For multi-operator use, migrate to an S3 backend.
#
# This Terraform is documentation-as-code first, recovery path second.
# It is NOT applied during normal deploys (the GitHub Actions deploy.yml
# only writes to S3 + invalidates CloudFront — it never touches IAM or
# response-headers-policy resources).
#
# Clean URLs (verified 2026-07-12): the distribution's origin is the S3
# WEBSITE endpoint, whose IndexDocument=index.html serves Astro's
# directory-style pages (/insights/<slug>/ -> .../index.html) natively;
# extensionless requests get S3's 302 to the slashed form. If the origin
# ever moves to the REST endpoint, a viewer-request function rewriting
# "/" and extensionless URIs to .../index.html becomes REQUIRED (see
# RUNBOOK.md "Common gotchas").
#
# www redirect (fixed 2026-07-13): CloudFront Function
# `dayelostra-co-www-redirect` (viewer-request, cloudfront-js-2.0) is
# associated with the default cache behavior. It 301s any
# www.dayelostra.co request to https://dayelostra.co + path + query in
# one hop. Source of record: iac/cloudfront/www-redirect-function.js
# (see that file's header for why the old bucket-level redirect was
# broken: http downgrade + /index.html target). Manually managed like
# the distribution itself; not in TF state.

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }
  # Uncomment + populate to use S3 backend instead of local state:
  # backend "s3" {
  #   bucket = "dayelostra.co"
  #   key    = "terraform/state.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = "us-east-1"
}

# ============================================================================
# Locals — single source of truth for repo + distribution identifiers
# ============================================================================

locals {
  github_repo                  = "dayelostraco/dayelostra.co"
  github_branch                = "main"
  cloudfront_distribution_id   = "EZ1G9UFZ84YTV"
  origin_bucket                = "dayelostra.co"
  account_id                   = data.aws_caller_identity.current.account_id
}

data "aws_caller_identity" "current" {}

# ============================================================================
# IAM OIDC provider for GitHub Actions
# Managed as a resource so out-of-band deletion is recovered by `terraform
# apply`. Previously referenced as a data source, which created a silent
# dependency on someone else having created the provider — when it was deleted
# on 2026-05-13, deploys broke with "No OpenIDConnect provider found" until
# the provider was manually recreated.
#
# To import after fresh provisioning, run:
#   terraform import aws_iam_openid_connect_provider.github \
#     arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com
# ============================================================================

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# ============================================================================
# Deploy role — assumed by GitHub Actions via OIDC
# ============================================================================

resource "aws_iam_role" "deploy" {
  name        = "dayelostra-co-deploy"
  description = "GitHub Actions OIDC deploy role for dayelostra.co (main branch only)"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${local.github_repo}:ref:refs/heads/${local.github_branch}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "deploy" {
  name = "S3AndCloudFrontDeploy"
  role = aws_iam_role.deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3DeployToBucket"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
        Resource = "arn:aws:s3:::${local.origin_bucket}/*"
      },
      {
        Sid      = "S3ListBucket"
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = "arn:aws:s3:::${local.origin_bucket}"
      },
      {
        Sid      = "CloudFrontInvalidate"
        Effect   = "Allow"
        Action   = "cloudfront:CreateInvalidation"
        Resource = "arn:aws:cloudfront::${local.account_id}:distribution/${local.cloudfront_distribution_id}"
      },
    ]
  })
}

# ============================================================================
# CloudFront Response Headers Policy
# Carries HSTS, CSP, frame-deny, referrer + permissions policy.
# Attached to the distribution's default cache behavior.
# ============================================================================

resource "aws_cloudfront_response_headers_policy" "secure" {
  name    = "dayelostra-co-secure-headers"
  comment = "HSTS + CSP + clickjacking + content-type + referrer + permissions for dayelostra.co"

  security_headers_config {
    strict_transport_security {
      override                   = true
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
    }
    content_type_options {
      override = true
    }
    frame_options {
      override     = true
      frame_option = "DENY"
    }
    referrer_policy {
      override        = true
      referrer_policy = "strict-origin-when-cross-origin"
    }
    xss_protection {
      override   = true
      protection = false
    }
    content_security_policy {
      override = true
      content_security_policy = join("; ", [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self' https://cloudflareinsights.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ])
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      override = true
    }
  }
}

# ============================================================================
# Outputs — IDs needed by the GitHub Actions workflow secrets / nav docs
# ============================================================================

output "deploy_role_arn" {
  description = "Set this as the AWS_DEPLOY_ROLE GitHub repo secret"
  value       = aws_iam_role.deploy.arn
}

output "response_headers_policy_id" {
  description = "Attach this to the CloudFront distribution's default cache behavior"
  value       = aws_cloudfront_response_headers_policy.secure.id
}
