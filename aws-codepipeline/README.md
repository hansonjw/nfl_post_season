# AWS CodePipeline Setup

This directory contains Terraform configuration for setting up CI/CD using AWS CodePipeline instead of GitHub Actions.

## Overview

AWS CodePipeline provides:
- Native AWS integration
- No GitHub Actions minutes usage
- Secrets stored in AWS Secrets Manager
- Full AWS ecosystem integration

## Architecture

```
GitHub Repository
    ↓
CodePipeline (Source Stage)
    ↓
CodeBuild (Build Stage)
    ├── Build Lambda Functions
    └── Create Deployment Artifacts
    ↓
CodeBuild (Deploy Stage)
    └── Terraform Apply
    ↓
AWS Infrastructure (Lambda, API Gateway, DynamoDB, etc.)
```

## Setup

### 1. Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `aws-codepipeline`
4. Scopes: Check `repo` (full control of private repositories)
5. Generate token and copy it

### 2. Store Secrets in AWS Secrets Manager

```bash
# Store Google OAuth credentials
aws secretsmanager create-secret \
  --name nfl-post-season/google-client-id \
  --secret-string "your-client-id"

aws secretsmanager create-secret \
  --name nfl-post-season/google-client-secret \
  --secret-string "your-client-secret"
```

Or use the AWS Console:
1. Go to AWS Secrets Manager
2. Create secret → "Other type of secret"
3. Store your credentials

### 3. Deploy CodePipeline Infrastructure

```bash
cd aws-codepipeline

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
github_owner = "your-github-username"
github_repo = "nfl-post-season"
github_token = "your-github-token"
admin_emails = ["your-email@gmail.com"]
google_client_id = "your-client-id"  # Or reference Secrets Manager
google_client_secret = "your-client-secret"  # Or reference Secrets Manager
allowed_origins = ["https://yourdomain.com", "http://localhost:5173"]
EOF

terraform init
terraform plan
terraform apply
```

### 4. Update CodeBuild to Use Secrets Manager

Edit `codepipeline.tf` to reference Secrets Manager ARNs instead of variables:

```hcl
environment_variable {
  name  = "GOOGLE_CLIENT_ID"
  value = "arn:aws:secretsmanager:region:account:secret:name"
  type  = "SECRETS_MANAGER"
}
```

## How It Works

### Source Stage
- Monitors your GitHub repository
- Triggers on push to `main` branch
- Downloads source code

### Build Stage
- Runs `buildspec-lambda.yml`
- Builds both Lambda functions
- Creates zip artifacts
- Passes artifacts to Deploy stage

### Deploy Stage
- Runs `buildspec-terraform.yml`
- Initializes Terraform
- Creates `terraform.tfvars` from environment variables
- Runs `terraform apply`

## Advantages Over GitHub Actions

1. **No GitHub Actions minutes** - Free AWS CodeBuild minutes (100/month free tier)
2. **AWS Secrets Manager** - Better secret management
3. **Native AWS integration** - Easier to integrate with other AWS services
4. **Cost** - Pay only for build time (first 100 minutes/month free)

## Disadvantages

1. **More complex setup** - Requires more AWS resources
2. **Less intuitive UI** - GitHub Actions UI is generally better
3. **GitHub token management** - Need to manage GitHub tokens
4. **Less community support** - Fewer examples online

## Monitoring

- View pipeline in AWS Console → CodePipeline
- Check build logs in CodeBuild
- CloudWatch Logs for detailed logs

## Cost

- **CodePipeline**: First pipeline free, then $1/month
- **CodeBuild**: 100 minutes/month free, then $0.005/minute
- **S3 Artifacts**: Minimal storage costs

For typical usage, should stay within free tier.

## Troubleshooting

### Pipeline not triggering
- Check GitHub token has `repo` scope
- Verify webhook is created (CodePipeline creates this automatically)
- Check CodePipeline execution history

### Build fails
- Check CodeBuild logs
- Verify buildspec files are correct
- Check IAM permissions

### Terraform fails
- Check Terraform logs in CodeBuild
- Verify secrets are accessible
- Check IAM permissions for Terraform

## Recommendation

**Use GitHub Actions if:**
- You want simpler setup
- You prefer GitHub's UI
- You want more community examples
- You're comfortable with GitHub secrets

**Use AWS CodePipeline if:**
- You want everything in AWS
- You need AWS Secrets Manager integration
- You want to avoid GitHub Actions minutes
- You're building a larger AWS-native system

For this project, **GitHub Actions is probably simpler**, but CodePipeline is a valid option if you prefer AWS-native solutions.


