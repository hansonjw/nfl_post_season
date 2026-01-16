# Fix Google OAuth "invalid_client" Error

## The Problem
Error 401: invalid_client - "The OAuth client was not found"

This happens when the redirect URIs in Google Cloud Console don't match what Cognito is sending.

## The Solution

You need to add the Cognito callback URL to your Google OAuth client's authorized redirect URIs.

### Step 1: Get the Cognito Callback URL

Your Cognito callback URL is:
```
https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
```

### Step 2: Add to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID: `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1`
4. Click **Edit**
5. Under **Authorized redirect URIs**, add:
   ```
   https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
   ```
6. Also add your local dev URL (if not already there):
   ```
   http://localhost:5173
   ```
7. Click **Save**

### Step 3: Test Again

After saving, try logging in again. The OAuth flow should work now.

## Why This Happens

When you click "Login" in the app:
1. App redirects to Cognito
2. Cognito redirects to Google OAuth
3. Google checks if the redirect URI matches what's configured
4. If it doesn't match → Error 401: invalid_client

The redirect URI that Cognito uses is always:
`https://{cognito-domain}.auth.{region}.amazoncognito.com/oauth2/idpresponse`

This MUST be in your Google OAuth client's authorized redirect URIs list.
