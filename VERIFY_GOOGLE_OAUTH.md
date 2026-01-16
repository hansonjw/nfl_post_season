# Step-by-Step: Verify Google OAuth Configuration

## Step 1: Check Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit** (pencil icon)

## Step 2: Verify Client ID Matches

**In Google Cloud Console**, your Client ID should be:
```
600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com
```

**In your terraform.tfvars**, it should be:
```
google_client_id = "600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com"
```

These MUST match exactly.

## Step 3: Verify Authorized Redirect URIs

In Google Cloud Console, under **Authorized redirect URIs**, you should have:

```
https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
```

**Copy-paste this EXACTLY** - no spaces, no trailing slash, must be `https://`

## Step 4: Save and Wait

1. Click **Save** in Google Cloud Console
2. Wait 1-2 minutes for changes to propagate
3. Clear browser cache or use incognito mode
4. Try logging in again

## Step 5: Check for Other Issues

If still not working, check:
- Is the OAuth consent screen configured?
- Is the Google+ API enabled?
- Are you using the correct Google account?

## Common Mistakes

❌ `http://nfl-post-season-auth...` (should be https)
❌ `https://nfl-post-season-auth.../` (trailing slash)
❌ `https://nfl-post-season-auth.../oauth2/idpresponse ` (trailing space)
❌ Wrong region (should be us-west-2)
❌ Client ID doesn't match

✅ `https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse`
