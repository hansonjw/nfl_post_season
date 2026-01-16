# AWS Resource Naming Convention

## All Resources Use: `nfl_post_season_*`

All AWS resources in this project are now prefixed with `nfl_post_season_` (using underscores).

## Updated Resources

### Bootstrap Layer
- S3 Bucket: `nfl_post_season_terraform_state`
- DynamoDB Table: `nfl_post_season_terraform_state_lock`

### Main Infrastructure
- DynamoDB Tables:
  - `nfl_post_season_players`
  - `nfl_post_season_games`
  - `nfl_post_season_picks`
- Lambda Functions:
  - `nfl_post_season_read_api`
  - `nfl_post_season_admin_api`
- IAM Roles:
  - `nfl_post_season_read_api_lambda_role`
  - `nfl_post_season_admin_api_lambda_role`
- IAM Policies:
  - `nfl_post_season_read_api_lambda_policy`
  - `nfl_post_season_admin_api_lambda_policy`
- API Gateway:
  - `nfl_post_season_api`
  - `nfl_post_season_cognito_authorizer`
- Cognito:
  - User Pool: `nfl_post_season_user_pool`
  - Client: `nfl_post_season_client`
  - Domain: `nfl_post_season-auth` (⚠️ hyphens required by AWS)

### CodePipeline Infrastructure
- CodePipeline: `nfl_post_season_pipeline`
- CodeStar Connection: `nfl_post_season_github_connection`
- CodeBuild Projects:
  - `nfl_post_season_lambda_build`
  - `nfl_post_season_terraform_deploy`
- IAM Roles:
  - `nfl_post_season_codepipeline_role`
  - `nfl_post_season_codebuild_role`
- IAM Policies:
  - `nfl_post_season_codepipeline_policy`
  - `nfl_post_season_codebuild_policy`
- S3 Bucket: `nfl_post_season_codepipeline_artifacts`

## Important Note

**Cognito Domain Exception**: The Cognito User Pool Domain (`nfl_post_season-auth`) uses hyphens because AWS Cognito domains **only allow** lowercase letters, numbers, and hyphens. Underscores are not allowed in domain names.

All other resources use underscores as requested.
