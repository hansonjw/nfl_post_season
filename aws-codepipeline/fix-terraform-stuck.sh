#!/bin/bash
# Quick fix for stuck Terraform provider processes

echo "Fixing stuck Terraform processes..."

# Kill stuck provider processes
pkill -9 terraform-provider-aws 2>/dev/null
echo "✓ Killed provider processes"

# Remove lock file
cd "$(dirname "$0")" || exit
rm -f .terraform.tfstate.lock.info
echo "✓ Removed lock file"

# Optional: Clear cache if still having issues
# rm -rf .terraform .terraform.lock.hcl
# terraform init

echo "Done! You can now run terraform commands again."
