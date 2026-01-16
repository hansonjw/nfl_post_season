# Switching to Password Authentication

## What Changed

We've switched from Google OAuth to simple username/password authentication using AWS Cognito.

## Changes Made

### 1. Terraform (Cognito)
- ✅ Removed Google OAuth identity provider
- ✅ Removed OAuth domain
- ✅ Updated Cognito client to use username/password authentication
- ✅ Added password policy (min 8 chars, requires uppercase, lowercase, numbers)

### 2. Frontend
- ✅ Updated Amplify config to remove OAuth
- ✅ Updated AuthContext to use `signIn()` instead of `signInWithRedirect()`
- ✅ Created LoginForm component for username/password entry
- ✅ Updated App.tsx to show login form when clicking "Admin Login"

## Next Steps

### 1. Deploy Updated Cognito Configuration

```bash
cd terraform
terraform apply
```

This will:
- Remove the Google OAuth provider
- Update the Cognito client to use password authentication
- Remove the OAuth domain (no longer needed)

### 2. Create Admin User

After Terraform applies, you'll need to create an admin user in Cognito:

**Option A: AWS Console**
1. Go to: AWS Console > Cognito > User Pools
2. Find: `nfl_post_season_user_pool`
3. Click "Users" tab
4. Click "Create user"
5. Enter email: `hansonjw@gmail.com` (or your admin email)
6. Set temporary password
7. Uncheck "Send an invitation" (or check it to send email)
8. Click "Create user"
9. User will need to change password on first login

**Option B: AWS CLI**
```bash
aws cognito-idp admin-create-user \
  --user-pool-id us-west-2_nmjm2LSoI \
  --username hansonjw@gmail.com \
  --user-attributes Name=email,Value=hansonjw@gmail.com \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS
```

### 3. Test Login

1. Start your dev server: `npm run dev`
2. Click "Admin Login"
3. Enter email and password
4. If first login, you'll be prompted to change password

## Benefits

- ✅ No Google OAuth configuration needed
- ✅ Simpler setup
- ✅ Full control over users
- ✅ No external dependencies
- ✅ Works immediately

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Notes

- You can create multiple admin users in Cognito
- Users can change their password after first login
- No email verification required (can be added later if needed)
- All admin functionality remains the same
