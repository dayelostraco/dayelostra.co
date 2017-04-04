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

## S3 Configuration

TODO:

## CloudFront

TODO: 

## Codeship Configuration
There is a Codeship Deployment Pipeline for all branches that are to be published to an S3 hosted website.

You'll need to configure the following:
* Create a new Deployment Pipeline with the Git branch name you want used.
* Select the `Custom Script` option.
* Add the script in the Deployment Section.
* Edit the script to point to the s3 bucket you want cleared out and for the website files uploaded to. This needs to be done in two places within the script.
* You will need to create an AWS IAM user that has GET, PUT, DELETE policy access to the S3 buckets used for website hosting.
* Add Environment Variables to the Codeship project. You will need to set up variables for AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, CLOUDFRONT_LOCATION_ID.

NOTE: If you want to tweak the Cache-Control headers, you an update the EXP_DATE variable in the script.

## Deployment

Automated CodeShip deployments to the S3 hosted website on all commits to the `master` branch.

CodeShip deployment uses the Development pipeline to run AWS CLI commands

* Clones the latest branch
* Deletes all files contained within the S3 website bucket
* Uploads all all branch files sans .git, .gitignore and README.md
* Sets read access on all files to Public-Read
* Sets the Cache Control header on all files to 30 days out
* Sets AWS CLI mode to allow Preview level features (needed for CloudFront cache invalidation commands)
* Invalidates the CloudFront cache so all new changes are available and re-cached

All that is needed for deployments is for you to commit/push changes to a branch that has Codeship Development pipelines configured and you're done!

```
# Install AWS CLI
pip install awscli

# Codeship clones your project into this directory
cd ~/clone

# Set Expiration Date Session Var to +1 month of current system time
EXP_DATE=$(date --date="+1 month" "+'%Y-%m-%dT%H:%M:%SZ'")

# Delete existing S3 Files
aws s3 rm s3://dayelostra.co --recursive

# Copy cloned files from GitHub to S3 Bucket
# Set each file to Public-Read, expires at the EXP_DATE var and Cache-Control header to 30 days max age
aws s3 mv ~/clone s3://dayelostra.co --exclude '.git/*' --exclude '.gitignore' --exclude 'README.MD' --acl public-read --expires $EXP_DATE --cache-control max-age=604800 --recursive

# Invalidate the CloudFront cache via preview level features
aws configure set preview.cloudfront true  
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_CHARLESTON_ID --paths /* 
```