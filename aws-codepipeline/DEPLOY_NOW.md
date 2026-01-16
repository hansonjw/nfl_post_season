# Ready to Deploy CodePipeline!

## Next Command

Run this to deploy:

```bash
cd aws-codepipeline
terraform apply
```

When prompted, type: `yes`

## What Happens

1. **Creates AWS resources** (~2-3 minutes)
   - CodePipeline
   - CodeBuild projects
   - S3 buckets
   - IAM roles

2. **Sets up GitHub webhook** (automatically)

3. **Pipeline will trigger** (on your next push to `main`)

## After Deployment

1. Go to AWS Console → **CodePipeline**
2. You should see: `nfl-post-season-pipeline`
3. Make a small change and push to GitHub
4. Watch the pipeline run automatically!
