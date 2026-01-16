# Create Admin User for Password Authentication

## Quick Setup

After Terraform has been applied, create your admin user:

### Option 1: AWS Console (Recommended)

1. Go to: https://console.aws.amazon.com/cognito/
2. Select region: **us-west-2**
3. Click **User pools** > Find **nfl_post_season_user_pool**
4. Click **Users** tab
5. Click **Create user**
6. Fill in:
   - **Username**: `hansonjw@gmail.com` (or your email)
   - **Email**: `hansonjw@gmail.com`
   - **Temporary password**: Must meet requirements:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
     - Example: `TempPass123!`
   - Uncheck **"Send an invitation email"** (or leave checked)
7. Click **Create user**

### Option 2: AWS CLI

```bash
aws cognito-idp admin-create-user \
  --user-pool-id us-west-2_nmjm2LSoI \
  --username hansonjw@gmail.com \
  --user-attributes Name=email,Value=hansonjw@gmail.com \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region us-west-2
```

## Test Login

1. Start your dev server: `npm run dev`
2. Click **"Admin Login"** button
3. Enter:
   - Email: `hansonjw@gmail.com`
   - Password: Your temporary password (e.g., `TempPass123!`)
4. On first login, you'll be prompted to change your password
5. After changing password, you'll be logged in!

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Symbols are optional

## Notes

- You can create multiple admin users
- Each user can change their password after first login
- No email verification required (can be enabled later if needed)
- All admin functionality works the same as before
