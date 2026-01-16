# GitHub + AWS CodePipeline Setup Guide

Quick guide to set up CI/CD with GitHub and AWS CodePipeline.

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub → Your profile → **Settings**
2. Click **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Name: `aws-codepipeline-nfl-app`
5. Expiration: Choose your preference (90 days, 1 year, or no expiration)
6. **Scopes**: Check ✅ `repo` (Full control of private repositories)
   - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
7. Click **Generate token**
8. **Copy the token immediately** (you won't see it again!)

## Step 2: Get Google OAuth Credentials (if needed)

If you don't have these yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: 
   - `https://your-cognito-domain.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
   - (You'll get the Cognito domain after deploying, but you can add it later)
7. Copy **Client ID** and **Client Secret**

## Step 3: Configure CodePipeline Terraform

```bash
cd aws-codepipeline
cp terraform.tfvars.example terraform.tfvars
```

Edit `aws-codepipeline/terraform.tfvars`:
```hcl
github_owner = "YOUR-GITHUB-USERNAME"
github_repo  = "nfl-post-season"  # Your repo name
github_token = "ghp_YOUR_TOKEN_HERE"  # From Step 1

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

**Important**: Don't commit `terraform.tfvars` - it contains secrets! It's already in `.gitignore`.

## Step 4: Deploy CodePipeline Infrastructure

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
- ✅ CodePipeline (monitors GitHub)
- ✅ 2 CodeBuild projects (build + deploy)
- ✅ S3 bucket for artifacts
- ✅ IAM roles and policies
- ✅ GitHub webhook (automatically created by CodePipeline)

**Time**: ~2-3 minutes

## Step 5: Verify Setup

1. **Check CodePipeline**:
   - Go to AWS Console → **CodePipeline**
   - You should see your pipeline: `nfl-post-season-pipeline`
   - It should show "Source" stage (may have already triggered from your initial push)

2. **Check CodeBuild Projects**:
   - Go to AWS Console → **CodeBuild**
   - You should see 2 projects:
     - `nfl-post-season-lambda-build`
     - `nfl-post-season-terraform-deploy`

3. **Check S3 Bucket**:
   - Go to AWS Console → **S3**
   - You should see: `nfl-post-season-codepipeline-artifacts`

4. **Test the Pipeline**:
   - Make a small change to your code
   - Commit and push to `main` branch:
     ```bash
     git add .
     git commit -m "Test CodePipeline"
     git push origin main
     ```
   - Go back to CodePipeline console
   - You should see the pipeline start automatically!

## Step 6: First Deployment

The pipeline will:
1. **Source Stage**: Pull code from GitHub
2. **Build Stage**: Build Lambda functions (runs `buildspec-lambda.yml`)
3. **Deploy Stage**: Run Terraform to deploy infrastructure (runs `buildspec-terraform.yml`)

**Note**: The Deploy stage will fail the first time because it needs Terraform variables. You'll need to set up the main Terraform configuration separately (in the `terraform/` directory).

## Step 7: Configure Main Terraform (for infrastructure deployment)

The CodePipeline will deploy your infrastructure, but you need to set up the Terraform variables first:

```bash
cd ../terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform/terraform.tfvars` with the same values as CodePipeline:
```hcl
admin_emails = ["your-email@gmail.com"]

google_client_id     = "YOUR-CLIENT-ID.apps.googleusercontent.com"
google_client_secret = "YOUR-CLIENT-SECRET"

allowed_origins = [
  "http://localhost:5173"
]
```

The CodePipeline will use these values from environment variables (set in `codepipeline.tf`).

## How It Works

### Source Stage
- CodePipeline monitors your GitHub repository
- Triggers automatically on push to `main` branch
- Downloads source code
- Stores in S3 artifact bucket

### Build Stage
- CodeBuild runs `buildspec-lambda.yml`
- Builds both Lambda functions (`read-api` and `admin-api`)
- Creates zip artifacts
- Passes artifacts to Deploy stage

### Deploy Stage
- CodeBuild runs `buildspec-terraform.yml`
- Initializes Terraform
- Creates `terraform.tfvars` from environment variables
- Runs `terraform apply`
- Deploys/updates Lambda functions, API Gateway, DynamoDB, Cognito, etc.

## Monitoring

- **View pipeline status**: AWS Console → CodePipeline
- **View build logs**: Click on any stage → "View logs"
- **CloudWatch Logs**: `/aws/codebuild/nfl-post-season-lambda-build` and `/aws/codebuild/nfl-post-season-terraform-deploy`

## Troubleshooting

### Pipeline fails on Source stage
- Check GitHub token has `repo` scope
- Verify repository name and owner are correct
- Check GitHub webhook was created (CodePipeline creates this automatically)

### Build fails
- Check CodeBuild logs in CloudWatch
- Verify `buildspec-lambda.yml` is correct
- Check IAM permissions

### Deploy fails
- Check Terraform logs in CodeBuild
- Verify environment variables are set correctly
- Check IAM permissions for Terraform deployment

## Cost

- **CodePipeline**: First pipeline free, then $1/month
- **CodeBuild**: 100 minutes/month free, then $0.005/minute
- **S3 Artifacts**: Very cheap (~$0.023/GB/month)

For typical usage, should stay within free tier.

## Next Steps

After the pipeline is set up and running:
1. Monitor the first deployment
2. Check that Lambda functions are deployed correctly
3. Test the API endpoints
4. Set up frontend hosting (S3 + CloudFront or similar)
