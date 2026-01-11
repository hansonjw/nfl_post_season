# Lambda Functions

This directory contains the Lambda functions for the NFL Post Season Pick 'Em API.

## Structure

- `shared/` - Shared types, utilities, and DynamoDB client
- `read-api/` - Public read-only API (no authentication)
- `admin-api/` - Admin write API (requires Cognito authentication)

## Building

Before deploying with Terraform, you need to build the Lambda functions:

```bash
# Build shared code first
cd shared
npm install
npm run build

# Build read-api
cd ../read-api
npm install
npm run build

# Build admin-api
cd ../admin-api
npm install
npm run build
```

The build process will:
1. Compile TypeScript to JavaScript
2. Create a zip file in `dist/index.zip` that includes the compiled code

## Deployment

The Terraform configuration expects the zip files to be at:
- `lambda/read-api/dist/index.zip`
- `lambda/admin-api/dist/index.zip`

Make sure to build both functions before running `terraform apply`.

## Environment Variables

The Lambda functions use the following environment variables (set by Terraform):

**read-api:**
- `PLAYERS_TABLE` - DynamoDB table name for players
- `GAMES_TABLE` - DynamoDB table name for games
- `PICKS_TABLE` - DynamoDB table name for picks

**admin-api:**
- `PLAYERS_TABLE` - DynamoDB table name for players
- `GAMES_TABLE` - DynamoDB table name for games
- `PICKS_TABLE` - DynamoDB table name for picks
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

