# Terraform Bootstrap - State Management Infrastructure

This is the "bootstrap" layer that solves the chicken-and-egg problem of Terraform state management.

## The Problem

To use remote state (S3 backend), you need:
- S3 bucket (for storing state)
- DynamoDB table (for state locking)

But to create these with Terraform, you need... Terraform state! 🐔🥚

## The Solution

This bootstrap layer:
1. Uses **local state** (no backend needed)
2. Creates the S3 bucket and DynamoDB table
3. Outputs the backend configuration
4. Then other Terraform configs can use S3 backend

## Setup

### 1. Configure

```bash
cd terraform-bootstrap
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` if needed (defaults should work).

### 2. Deploy

```bash
terraform init
terraform plan
terraform apply
```

This creates:
- S3 bucket: `nfl-post-season-terraform-state`
- DynamoDB table: `nfl-post-season-terraform-state-lock`

### 3. Use the Outputs

After deployment, Terraform will output the backend configuration. You'll add this to:
- `terraform/main.tf` (for main infrastructure)
- `aws-codepipeline/main.tf` (for CodePipeline infrastructure)

## Important Notes

- **Run this ONCE** - it creates the state storage infrastructure
- **Uses local state** - this is the only Terraform config that should use local state
- **Don't delete this** - it manages critical infrastructure
- **Outputs are important** - use them to configure other Terraform backends

## After Bootstrap

Once this is deployed, update the other Terraform configs to use S3 backend (see outputs).
