# Debugging OAuth "Access Blocked" Error

## What to Check

### 1. Verify Google OAuth Client ID Matches

In `terraform/terraform.tfvars`, you have:
```
google_client_id = "600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com"
```

**Verify this EXACTLY matches** what's in Google Cloud Console.

### 2. Verify Redirect URIs in Google Cloud Console

In Google Cloud Console, your OAuth client should have these **Authorized redirect URIs**:

```
https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
http://localhost:5173
```

**Important**: The Cognito URL must be EXACTLY:
- `https://` (not http)
- `nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse`
- No trailing slash
- Case sensitive

### 3. Check for Typos

Common mistakes:
- Missing `https://`
- Wrong domain name
- Wrong region (`us-west-2`)
- Extra spaces or characters
- Missing `/oauth2/idpresponse` path

### 4. Clear Browser Cache

Sometimes Google caches the old configuration:
1. Clear browser cache
2. Try incognito/private window
3. Try a different browser

### 5. Verify Cognito Configuration

Run this to see your Cognito domain:
```bash
cd terraform && terraform output cognito_domain
```

Should output: `nfl-post-season-auth`

### 6. Check the Exact Error Message

What does the error say now? Is it still "invalid_client" or something else?
