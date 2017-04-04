# Introduction
My personal static website based on the [Slides 3.0.5](https://designmodo.com/slides/) framework.

[ ![Codeship Status for dayelostraco/dayelostra.co](https://app.codeship.com/projects/21857230-faee-0134-b168-721cf569a862/status?branch=master)](https://app.codeship.com/projects/211392)

## Static File Structure

```
/
├─ index.html
├─ css/
│  ├─ slides.css
│  └─ custom.css
├─ js/
│  ├─ slides.js
│  ├─ plugins.js
│  └─ custom.js
├─ scss/
│  ├─ colors.scss
│  ├─ dialog.scss
│  ├─ flex.scss
│  ├─ framework.scss
│  ├─ layout.scss
│  ├─ mixins.scss
│  ├─ plumber.scss
│  ├─ reset.scss
│  ├─ slides.scss
│  ├─ typography.scss
│  ├─ userful-classes.scss
│  └─ variables.scss
└─ assets/
   ├─ ai/
   ├─ img/
   ├─ psd/
   ├─ resume/
   └─ svg/
```

## Deployment

Automated CodeShip deployments to the S3 hosted website on all commits to the `master` branch.

CodeShip deployment uses the Test pipeline to run AWS CLI commands.

```
# Install AWS CLI
pip install awscli

# Codeship clones your project into this directory
cd ~/clone

# Set Expiration Date Session Var to +1 month of current system time
EXP_DATE=$(date --date="+1 month" "+'%Y-%m-%dT%H:%M:%SZ'")

# Delete existing S3 Files
aws s3 rm s3://meetdayel.today --recursive

# Copy cloned files from GitHub to S3 Bucket
# Set each file to Public-Read, expires at the EXP_DATE var and Cache-Control header to 30 days max age
aws s3 mv ~/clone s3://www.meetdayel.today --exclude '.git/*' --exclude '.gitignore' --exclude 'README.MD' --acl public-read --expires $EXP_DATE --cache-control max-age=604800 --recursive

# Invalidate the CloudFront cache via preview level features
aws configure set preview.cloudfront true  
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths /* 
```

TODO: Update the script to invalidate the CloudFront cache.

## CloudFront

TODO