# Final Google OAuth Verification Checklist

## Critical Steps to Verify

### 1. Verify Client ID Matches EXACTLY

**In Google Cloud Console:**
- Go to: APIs & Services > Credentials
- Find your OAuth 2.0 Client ID
- The Client ID should be: `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com`

**In your terraform.tfvars:**
- Should match exactly: `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com`

**⚠️ Check for typos!** Even one character difference will cause this error.

### 2. Verify Redirect URI is EXACTLY Correct

**In Google Cloud Console > OAuth Client > Authorized redirect URIs:**

Must have EXACTLY this (copy-paste it):
```
https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
```

**Checklist:**
- ✅ Starts with `https://` (not `http://`)
- ✅ No trailing slash
- ✅ No extra spaces before or after
- ✅ Region is `us-west-2` (not `us-east-1` or anything else)
- ✅ Path is `/oauth2/idpresponse` (not `/oauth2/idp` or anything else)
- ✅ Domain is `nfl-post-season-auth.auth.us-west-2.amazoncognito.com`

### 3. Verify OAuth Consent Screen

**Go to: APIs & Services > OAuth consent screen**

- ✅ Publishing status: "Testing" or "In production"
- ✅ Your email `hansonjw@gmail.com` is in the "Test users" list (if in Testing mode)
- ✅ App name and other required fields are filled out

### 4. Verify You're Using the Correct Google Cloud Project

Make sure you're looking at the **same Google Cloud project** that has the OAuth client:
- Check the project selector at the top of Google Cloud Console
- The OAuth client should be in "My First Project" (or whatever project you created it in)

### 5. Common Mistakes

❌ **Wrong project** - OAuth client is in a different Google Cloud project
❌ **Client ID typo** - One character off in the client ID
❌ **Redirect URI typo** - Missing `https://`, wrong region, wrong path
❌ **Not saved** - Made changes but didn't click "Save" in Google Cloud Console
❌ **Cached** - Browser is using old cached configuration

### 6. Try This

1. **Double-check the redirect URI** - Copy it from here and paste it directly into Google Cloud Console:
   ```
   https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
   ```

2. **Verify the Client ID** - In Google Cloud Console, copy the Client ID and compare character-by-character with what's in terraform.tfvars

3. **Clear browser cache** - Use incognito mode or clear cache

4. **Wait 5 minutes** - Google sometimes takes a few minutes to propagate changes

5. **Check the browser console** - Open F12 and look for any additional error messages

### 7. If Still Not Working

Check the browser's Network tab (F12 > Network) when you click "Admin Login" and look for the OAuth request. The error details might show what redirect URI is actually being sent.
