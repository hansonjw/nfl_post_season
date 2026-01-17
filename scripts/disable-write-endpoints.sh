#!/bin/bash
# Script to disable write endpoints (production mode)
# This disables POST, PUT, DELETE endpoints in API Gateway

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

cd "$TERRAFORM_DIR"

# Remove enable_write_endpoints from terraform.tfvars if present
if [ -f terraform.tfvars ]; then
  sed -i.bak '/^enable_write_endpoints/d' terraform.tfvars
  rm -f terraform.tfvars.bak
  echo "✓ Removed enable_write_endpoints from terraform.tfvars"
else
  echo "⚠️  terraform.tfvars not found"
  exit 1
fi

echo ""
echo "Now run:"
echo "  cd terraform"
echo "  terraform plan"
echo "  terraform apply"
echo ""
echo "This will disable write/edit endpoints in API Gateway."