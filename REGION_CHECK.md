# AWS Region Configuration Check ✅

## Current Status

### ✅ CodePipeline Configuration (`aws-codepipeline/`)
- **terraform.tfvars**: `aws_region = "us-west-2"` ✅
- **main.tf**: Uses `var.aws_region` ✅
- **Result**: **All CodePipeline resources will use us-west-2**

### ⚠️ Main Infrastructure Configuration (`terraform/`)
- **variables.tf**: Default is `"us-east-1"` ⚠️
- **terraform.tfvars**: **DOES NOT EXIST** ⚠️
- **Result**: **Will use us-east-1 if you don't create terraform.tfvars**

## The Issue

Your CodePipeline is set for **us-west-2**, but your main infrastructure defaults to **us-east-1**. 

If you deploy the main infrastructure separately, it will deploy to **us-east-1**, not **us-west-2**!

## Solution

Create `terraform/terraform.tfvars` with:

```hcl
aws_region = "us-west-2"
project_name = "nfl-post-season"

admin_emails = [
  "hansonjw@gmail.com"
]

google_client_id     = "YOUR-GOOGLE-CLIENT-ID"
google_client_secret = "YOUR-GOOGLE-CLIENT-SECRET"

allowed_origins = [
  "http://localhost:5173"
]
```

## Quick Fix

Run this to create the file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Then edit it and set aws_region = "us-west-2"
```

## Summary

- ✅ **CodePipeline**: us-west-2 (correct)
- ⚠️ **Main Infrastructure**: Will default to us-east-1 (needs terraform.tfvars)
- 🔧 **Action Needed**: Create `terraform/terraform.tfvars` with `aws_region = "us-west-2"`
