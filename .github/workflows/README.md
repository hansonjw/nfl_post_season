# CI/CD Pipeline

This repository uses GitHub Actions for continuous integration and deployment.

## Workflow Overview

The pipeline runs on:
- **Push to `main` or `develop` branches**
- **Pull requests to `main`**
- **Manual triggers** (workflow_dispatch)

## Jobs

### 1. Build Lambda Functions
- Builds both `read-api` and `admin-api` Lambda functions
- Creates deployment zip files
- Uploads artifacts for use in deployment

### 2. Frontend Checks
- Installs frontend dependencies
- Runs ESLint
- Type checks TypeScript code

### 3. Terraform Validation
- Validates Terraform syntax
- Checks formatting
- Validates configuration

### 4. Deploy to AWS
- **Only runs on `main` branch pushes**
- Downloads Lambda artifacts
- Deploys infrastructure with Terraform
- Builds frontend application
- Deploys frontend to S3
- Invalidates CloudFront cache
- Outputs API Gateway URL and CloudFront URL

## Required GitHub Secrets

Configure these in your GitHub repository settings (Settings → Secrets and variables → Actions):

### AWS Credentials
- `AWS_ACCESS_KEY_ID` - AWS access key with permissions to deploy
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Application Configuration
- `ADMIN_EMAIL` - Your admin email address (e.g., `your-email@gmail.com`)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (e.g., `https://yourdomain.com,http://localhost:5173`)
- `VITE_API_URL` - (Optional) Frontend API URL. If not set, defaults to production API Gateway URL

## Setting Up Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret above
4. Enter the name and value
5. Click **Add secret**

## AWS IAM Permissions

The AWS credentials need permissions for:
- Lambda (create, update, get functions)
- API Gateway (create, update, deploy APIs)
- DynamoDB (create, update tables)
- Cognito (create, update user pools)
- IAM (create roles and policies)
- CloudWatch Logs (create log groups)
- S3 (put, delete objects in frontend bucket)
- CloudFront (create invalidations)

You can create a policy like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "cognito-idp:*",
        "iam:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Or use a more restrictive policy scoped to your resources.

## Workflow Behavior

### On Pull Requests
- Builds and validates code
- **Does NOT deploy** (safety check)

### On Push to Main
- Builds and validates code
- **Deploys to AWS** automatically

### Manual Trigger
- Can be triggered manually from Actions tab
- Useful for re-deploying or testing

## Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build script permissions

### Terraform Fails
- Verify AWS credentials are correct
- Check Terraform state (may need to initialize)
- Verify all required variables are set

### Deployment Fails
- Check AWS IAM permissions
- Verify Lambda zip files were created
- Check Terraform outputs for errors

## Local Testing

You can test the build process locally:

```bash
# Build Lambda functions
cd lambda
./build.sh

# Validate Terraform
cd ../terraform
terraform init
terraform validate
terraform fmt -check
```


