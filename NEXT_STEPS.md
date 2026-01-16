# Next Steps - Getting Your App Running

## ✅ What's Done

1. ✅ Bootstrap infrastructure (S3 + DynamoDB for Terraform state)
2. ✅ Main infrastructure (Lambda, API Gateway, DynamoDB tables, Cognito)
3. ✅ CodePipeline infrastructure (CI/CD with GitHub v2)
4. ✅ GitHub CodeStar Connection authorized

## 🎯 Immediate Next Steps

### 1. Seed the Database

Your DynamoDB tables are empty. You have a few options:

#### Option A: Use the Admin UI (Recommended)
1. Start your local dev server: `npm run dev` (or `bun run dev`)
2. Open http://localhost:5173
3. Click "Admin Players" tab
4. Add players manually
5. Click "Admin Games" tab
6. Add games and picks manually

#### Option B: Use AWS CLI to Seed Directly
```bash
# Install AWS CLI if needed, then:
aws dynamodb put-item \
  --table-name nfl_post_season_players \
  --item '{"id":{"S":"1"},"name":{"S":"John Doe","color":{"S":"#FF5733"}}' \
  --region us-west-2
```

#### Option C: Use the Admin API (Requires Auth)
You'll need to authenticate with Cognito first. See step 2 below.

### 2. Test the API

Test your endpoints:
```bash
# Public endpoints (should work)
curl https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod/players
curl https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod/games
curl https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod/scoreboard

# Admin endpoints (require Cognito auth)
# You'll need to authenticate first - see Cognito setup below
```

### 3. Set Up Cognito Authentication (For Admin Features)

1. **Get your Cognito details:**
   ```bash
   cd terraform
   terraform output
   ```

2. **Update your frontend to use Cognito:**
   - Cognito Domain: `nfl-post-season-auth`
   - Cognito Client ID: `4nqlq379m9tp1m55379rgetooc`
   - Cognito User Pool ID: `us-west-2_nmjm2LSoI`

3. **Add Cognito to your frontend:**
   - Install AWS Amplify or Cognito SDK
   - Configure with the values above
   - Add authentication to admin API calls

### 4. Update Frontend to Use Production API

Create a `.env.production` file:
```bash
VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod
```

Or update `src/api/client.ts` to use the production URL by default in production builds.

### 5. Test CodePipeline

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Test pipeline"
   git push
   ```

2. **Check CodePipeline:**
   - Go to AWS Console → CodePipeline
   - Find `nfl_post_season_pipeline`
   - Watch it run automatically

3. **Verify deployment:**
   - Check Lambda functions are updated
   - Test API endpoints again

### 6. Deploy Frontend (Optional)

You'll want to host your frontend somewhere. Options:

#### Option A: S3 + CloudFront (Recommended)
- Create S3 bucket for static hosting
- Set up CloudFront distribution
- Configure custom domain (optional)

#### Option B: Vercel/Netlify
- Connect your GitHub repo
- Set environment variables
- Deploy automatically

#### Option C: AWS Amplify
- Use AWS Amplify Console
- Connect GitHub repo
- Auto-deploy on push

## 🔍 Troubleshooting

### API Returns "Internal server error"
- Check CloudWatch logs for Lambda functions
- Verify DynamoDB tables exist
- Check IAM permissions

### CodePipeline Fails
- Check CodeBuild logs
- Verify buildspec files are correct
- Check S3 bucket permissions

### Authentication Issues
- Verify Cognito domain is accessible
- Check Google OAuth credentials
- Verify callback URLs match

## 📝 Useful Commands

```bash
# View Terraform outputs
cd terraform && terraform output

# View CodePipeline status
aws codepipeline get-pipeline-state --name nfl_post_season_pipeline --region us-west-2

# Check Lambda logs
aws logs tail /aws/lambda/nfl_post_season_read_api --follow --region us-west-2

# Test API
curl https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod/players
```

## 🎉 You're Almost There!

Once you:
1. Seed the database
2. Test the API
3. Update frontend to use production API
4. Test CodePipeline

Your app will be fully deployed and automated! 🚀
