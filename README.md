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

# Delete existing S3 Files
aws s3 rm s3://meetdayel.today --recursive

# Copy cloned files from GitHub to S3 Bucket and give the Public Read access
aws s3 mv ~/clone s3://meetdayel.today --exclude '.git/*' --acl public-read --recursive
```

TODO: Update the script to invalidate the CloudFront cache.

## CloudFront

TODO