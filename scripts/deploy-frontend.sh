#!/bin/bash
# Deploy frontend to S3 and invalidate CloudFront cache

set -e

# Get bucket name and distribution ID from Terraform outputs
BUCKET_NAME=$(cd terraform && terraform output -raw frontend_bucket_name 2>/dev/null || echo "")
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo "Error: Could not get bucket name or distribution ID from Terraform"
  echo "Make sure you've run 'terraform apply' in the terraform directory"
  exit 1
fi

echo "Building frontend..."
npm run build

echo "Deploying to S3 bucket: $BUCKET_NAME"
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*"

echo "✅ Deployment complete!"
echo "Frontend URL: https://$(cd terraform && terraform output -raw cloudfront_domain_name)"
