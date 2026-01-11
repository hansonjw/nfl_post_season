# Terraform Infrastructure

This directory contains Terraform configuration for deploying the NFL Post Season Pick 'Em infrastructure to AWS.

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** installed (>= 1.0)
3. **Google OAuth Credentials** - You'll need to create a Google OAuth application:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs (Cognito will provide this after creation)

## Setup

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars`** with your values:
   - `admin_emails`: Your Google account email(s)
   - `google_client_id`: From Google Cloud Console
   - `google_client_secret`: From Google Cloud Console
   - `allowed_origins`: Your frontend domain(s)

3. **Build Lambda functions** (required before first deploy):
   ```bash
   cd lambda/shared
   npm install
   npm run build

   cd ../read-api
   npm install
   npm run build

   cd ../admin-api
   npm install
   npm run build
   ```

4. **Initialize Terraform:**
   ```bash
   terraform init
   ```

5. **Plan the deployment:**
   ```bash
   terraform plan
   ```

6. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## Important Notes

- **Lambda Builds**: You must rebuild Lambda functions before each `terraform apply` if you've made code changes. Terraform uses the zip file hash to detect changes.

- **Cognito Domain**: After first deployment, you'll need to update your Google OAuth redirect URIs with the Cognito domain URL (output after `terraform apply`).

- **API Gateway Paths**: The API will be available at the URL shown in the `api_gateway_url` output. All endpoints are under `/prod/` (e.g., `/prod/players`, `/prod/games`).

## Outputs

After deployment, Terraform will output:
- `api_gateway_url` - Base URL for the API
- `cognito_user_pool_id` - Cognito User Pool ID
- `cognito_client_id` - Cognito Client ID (for frontend auth)
- `cognito_domain` - Cognito domain for OAuth redirects
- `dynamodb_tables` - Table names

## Updating Lambda Functions

When you update Lambda code:

1. Rebuild the functions:
   ```bash
   cd lambda/read-api && npm run build
   cd ../admin-api && npm run build
   ```

2. Apply Terraform:
   ```bash
   terraform apply
   ```

## Cost Estimate

This setup should stay within AWS Free Tier for:
- DynamoDB: 25GB storage, 2.5M read/write units/month
- Lambda: 1M requests, 400K GB-seconds/month
- API Gateway: 1M requests/month

For a family pick 'em game, you should easily stay within free tier limits.

