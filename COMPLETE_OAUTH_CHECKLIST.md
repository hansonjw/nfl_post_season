# Complete OAuth Troubleshooting Checklist

## Step 1: OAuth Consent Screen (CRITICAL!)

Go to: **APIs & Services** > **OAuth consent screen**

### Must Have:
- ✅ **Publishing status**: Should be "Testing" or "In production"
- ✅ **Test users**: Your email `hansonjw@gmail.com` MUST be added as a test user
  - If in "Testing" mode, ONLY test users can log in
  - Click "ADD USERS" and add your email

### If Not Configured:
1. Fill out the required fields (App name, User support email, etc.)
2. Add your email as a test user
3. Save

## Step 2: Authorized Redirect URIs

Go to: **APIs & Services** > **Credentials** > Your OAuth Client

### Must Have EXACTLY:
```
https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
http://localhost:5173
```

### Verify:
- ✅ Starts with `https://` (not `http://`)
- ✅ Full path: `/oauth2/idpresponse` (not truncated)
- ✅ No trailing slash
- ✅ No extra spaces
- ✅ Region is `us-west-2`

## Step 3: Authorized Domains

Go to: **APIs & Services** > **OAuth consent screen** > **Authorized domains**

### Add if not present:
```
amazoncognito.com
```

## Step 4: Client ID Verification

In Google Cloud Console, your Client ID should be:
```
600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com
```

In your `terraform/terraform.tfvars`, it should match exactly.

## Step 5: Clear Cache & Test

1. **Clear browser cache** or use **incognito mode**
2. **Wait 2-3 minutes** after making changes in Google Cloud Console
3. **Open browser console** (F12) to see detailed errors
4. **Try logging in again**

## Step 6: Check Browser Console

When you click "Login", check the browser console (F12) for:
- Any JavaScript errors
- Network errors
- Detailed error messages

## Most Common Issue

**If your OAuth consent screen is in "Testing" mode, you MUST add your email as a test user!**

This is the #1 cause of "Access blocked" errors.
