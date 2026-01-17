# Local Development with Write Access

This guide explains how to enable write/edit API endpoints for local development.

## Overview

By default, the production API Gateway has write/edit endpoints (POST, PUT, DELETE) **disabled** for security. This makes the frontend read-only in production.

For local development, you can temporarily enable these endpoints to test admin functionality.

## Quick Start

### Enable Write Endpoints

```bash
# Run the helper script
./scripts/enable-write-endpoints.sh

# Apply Terraform changes
cd terraform
terraform plan
terraform apply
```

This will:
- Add `enable_write_endpoints = true` to `terraform/terraform.tfvars`
- Enable POST, PUT, DELETE endpoints in API Gateway
- Allow your local frontend to create/edit/delete players, games, and picks

### Disable Write Endpoints (Production Mode)

```bash
# Run the helper script
./scripts/disable-write-endpoints.sh

# Apply Terraform changes
cd terraform
terraform plan
terraform apply
```

This will:
- Remove `enable_write_endpoints` from `terraform/terraform.tfvars`
- Disable POST, PUT, DELETE endpoints in API Gateway
- Make the frontend read-only again

## Manual Method

You can also manually edit `terraform/terraform.tfvars`:

```hcl
# Enable write endpoints for local development
enable_write_endpoints = true
```

Then run `terraform apply` as usual.

## Important Notes

⚠️ **Security Warning:**
- Only enable write endpoints for local development
- **Never** enable write endpoints in production
- Always disable them before pushing to the main branch (CI/CD will deploy)
- The helper scripts require manual confirmation to prevent accidental changes

⚠️ **CI/CD:**
- The GitHub Actions workflow does **not** enable write endpoints
- Production deployments are always read-only
- You must manually enable/disable for local testing

## How It Works

The Terraform configuration uses a variable `enable_write_endpoints` (default: `false`) to conditionally create API Gateway methods:

- When `false` (production): Only GET endpoints exist → Read-only frontend
- When `true` (local dev): GET, POST, PUT, DELETE endpoints exist → Full admin access

The frontend code already supports all operations - it just needs the API endpoints to be enabled.

## Troubleshooting

**Write operations fail in local frontend:**
- Make sure you've run `terraform apply` after enabling write endpoints
- Check that `enable_write_endpoints = true` is in `terraform.tfvars`
- Verify the API Gateway deployment completed successfully
- Check browser console for CORS or network errors

**Can't disable write endpoints:**
- Manually edit `terraform.tfvars` and remove `enable_write_endpoints = true`
- Run `terraform apply` to remove the endpoints