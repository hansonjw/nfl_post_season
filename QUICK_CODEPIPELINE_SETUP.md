# Quick CodePipeline Setup Guide

## Your Repository Details
- **GitHub Owner**: `hansonjw`
- **Repository Name**: `nfl_post_season`
- **Default Branch**: `main`

## Step 1: Create GitHub Token

1. Click your **profile picture** (top right) → **Settings**
   - **NOT** the repository Settings tab - this is your user profile settings
   
2. Scroll down the left sidebar, click **Developer settings**

3. Click **Personal access tokens** → **Tokens (classic)**

4. Click **Generate new token (classic)**

5. Configure:
   - **Note**: `aws-codepipeline-nfl-app`
   - **Expiration**: Your choice (90 days, 1 year, or no expiration)
   - **Scopes**: Check ✅ `repo` (Full control of private repositories)
   
6. Click **Generate token**

7. **Copy the token immediately** (you won't see it again!)
   - It starts with `ghp_`

## Step 2: Configure CodePipeline

```bash
cd aws-codepipeline
cp terraform.tfvars.example terraform.tfvars
```

Edit `aws-codepipeline/terraform.tfvars`:

```hcl
github_owner = "hansonjw"
github_repo  = "nfl_post_season"
github_token = "ghp_YOUR_TOKEN_HERE"  # Paste your token from Step 1

admin_emails = [
  "your-email@gmail.com"  # Your email
]

google_client_id     = "YOUR-CLIENT-ID.apps.googleusercontent.com"
google_client_secret = "YOUR-CLIENT-SECRET"

allowed_origins = [
  "http://localhost:5173"
]

aws_region = "us-east-1"
```

## Step 3: Deploy

```bash
cd aws-codepipeline
terraform init
terraform plan
terraform apply
```

Type `yes` when prompted.

## Step 4: Verify

1. Go to AWS Console → **CodePipeline**
2. You should see: `nfl-post-season-pipeline`
3. Make a small change and push to `main` branch
4. Watch the pipeline run automatically!
