# GitHub v2 Setup Instructions

## What Changed

We've upgraded from GitHub v1 (OAuth tokens) to GitHub v2 (CodeStar Connections). This is more secure and the recommended approach.

## Important: Manual Step Required

CodeStar Connections require you to authorize the connection in the AWS Console after Terraform creates it. Here's how:

### Step 1: Deploy the Connection

```bash
cd aws-codepipeline
terraform apply
```

This will create the CodeStar Connection, but it will be in "PENDING" status.

### Step 2: Authorize the Connection in AWS Console

1. Go to AWS Console → **Developer Tools** → **Settings** → **Connections**
2. Find the connection: `nfl-post-season-github-connection`
3. Click **Update pending connection**
4. Click **Connect to GitHub**
5. Authorize AWS in GitHub (you'll be redirected to GitHub)
6. Return to AWS Console - the connection should show "Available"

### Step 3: The Pipeline Will Work

Once the connection is "Available", the CodePipeline will automatically work. The pipeline will trigger on pushes to the `main` branch.

## Benefits of v2

- ✅ No need to manage GitHub tokens
- ✅ More secure (uses AWS CodeStar Connections)
- ✅ Recommended by AWS
- ✅ Better integration with AWS services

## Troubleshooting

If the pipeline fails at the Source stage:
1. Check that the CodeStar Connection is "Available" (not "Pending")
2. Verify the connection was authorized in GitHub
3. Check IAM permissions for CodeStar Connections

## Note

The `github_token` variable is kept in the codebase but is no longer used. You can remove it from `terraform.tfvars` if you want, but it won't cause issues if it's there.
