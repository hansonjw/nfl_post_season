#!/bin/bash
# Script to enable write endpoints for local development
# This temporarily enables POST, PUT, DELETE endpoints in API Gateway

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

echo "⚠️  WARNING: This will enable write/edit endpoints in API Gateway."
echo "⚠️  Only use this for local development!"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

cd "$TERRAFORM_DIR"

# Create or update terraform.tfvars with enable_write_endpoints = true
if [ -f terraform.tfvars ]; then
  # Remove existing enable_write_endpoints if present
  sed -i.bak '/^enable_write_endpoints/d' terraform.tfvars
  rm -f terraform.tfvars.bak
fi

echo "" >> terraform.tfvars
echo "# Enable write endpoints for local development" >> terraform.tfvars
echo "enable_write_endpoints = true" >> terraform.tfvars

echo ""
echo "✓ Updated terraform.tfvars"
echo ""
echo "Now run:"
echo "  cd terraform"
echo "  terraform plan"
echo "  terraform apply"
echo ""
echo "After you're done, disable write endpoints with:"
echo "  ./scripts/disable-write-endpoints.sh"