# GitHub & CI/CD Setup Guide

Quick guide to push code to GitHub and set up AWS CodePipeline.

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Repository name: `nfl-post-season` (or your preferred name)
4. Description: "NFL Playoffs Pick 'Em game for family"
5. Choose **Public** or **Private**
6. **Don't** check "Initialize with README" (we have files already)
7. Click **Create repository**

## Step 2: Push Code to GitHub

```bash
cd /Users/justinhanson/prepos/nfl_post_season

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: NFL Post Season Pick 'Em app"

# Rename branch to main
git branch -M main

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git push -u origin main
```

## Step 3: Create GitHub Personal Access Token

1. GitHub → Your profile → **Settings**
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. Name: `aws-codepipeline-nfl-app`
5. Expiration: Your choice (90 days, 1 year, or no expiration)
6. **Scopes**: Check ✅ `repo` (Full control of private repositories)
7. Click **Generate token**
8. **Copy the token immediately** (you won't see it again!)

## Step 4: Get Google OAuth Credentials

If you don't have these yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: 
   - `https://your-cognito-domain.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
   - (You'll get the Cognito domain after deploying, but you can add it later)
7. Copy **Client ID** and **Client Secret**

## Step 5: Configure CodePipeline Terraform

```bash
cd aws-codepipeline
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
github_owner = "YOUR-GITHUB-USERNAME"
github_repo  = "nfl-post-season"  # Your repo name
github_token = "ghp_YOUR_TOKEN_HERE"  # From Step 3

admin_emails = [
  "your-email@gmail.com"  # Your admin email
]

google_client_id     = "YOUR-CLIENT-ID.apps.googleusercontent.com"
google_client_secret = "YOUR-CLIENT-SECRET"

allowed_origins = [
  "http://localhost:5173"  # For local development
  # Add your production domain later
]

aws_region = "us-east-1"  # Or your preferred region
```

## Step 6: Deploy CodePipeline

```bash
# Make sure you're in aws-codepipeline directory
cd aws-codepipeline

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Deploy (type 'yes' when prompted)
terraform apply
```

This will create:
- CodePipeline that monitors your GitHub repo
- CodeBuild projects for building Lambda and deploying Terraform
- S3 bucket for artifacts
- IAM roles and policies
- CloudWatch Log Groups

## Step 7: Test the Pipeline

1. Make a small change to your code (or just push again)
2. Go to AWS Console → **CodePipeline**
3. Find your pipeline (name will be like `nfl-post-season-pipeline`)
4. Watch it run:
   - Source stage (pulls from GitHub)
   - Build stage (builds Lambda functions)
   - Deploy stage (runs Terraform)

## Next Steps After Pipeline is Running

Once CodePipeline is set up, it will automatically:
1. Detect pushes to your `main` branch
2. Build Lambda functions
3. Deploy infrastructure with Terraform

You'll need to configure the main Terraform deployment separately (the CodePipeline will deploy it, but you need to set up the `terraform/terraform.tfvars` file with your values).

## Troubleshooting

- **Pipeline fails on Source stage**: Check GitHub token is valid
- **Build fails**: Check CloudWatch Logs for CodeBuild project
- **Deploy fails**: Check Terraform output in CodeBuild logs

## Useful Commands

```bash
# View pipeline status
aws codepipeline get-pipeline-state --name nfl-post-season-pipeline

# View build logs
aws logs tail /aws/codebuild/nfl-post-season-lambda-build --follow

# Check Terraform outputs (after first deployment)
cd terraform
terraform output
```
