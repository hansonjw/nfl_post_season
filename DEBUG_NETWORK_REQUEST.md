# Debug OAuth Network Request

## Steps to Debug

1. **In Chrome DevTools Network tab:**
   - Find the request to `/o/oauth2/v2/auth` (should show 302 status)
   - Click on it to see details

2. **Check the Request URL:**
   - Click on the "Headers" tab
   - Look at the "Query String Parameters" section
   - Find `client_id` - this is what Cognito is sending to Google
   - Find `redirect_uri` - this is the redirect URI Cognito is using

3. **Compare with Google Cloud Console:**
   - The `client_id` should match your OAuth client ID exactly
   - The `redirect_uri` should match one of your Authorized redirect URIs exactly

## What to Look For

### client_id
Should be: `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com`

If it's different, that's the problem!

### redirect_uri
Should be: `https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse`

Common issues:
- Missing `https://`
- Wrong region (not `us-west-2`)
- Wrong path (not `/oauth2/idpresponse`)
- URL encoded differently

## If They Match

If both values match what's in Google Cloud Console, then:
1. Make sure you clicked "Save" in Google Cloud Console
2. Wait 5 minutes for changes to propagate
3. Clear browser cache and try again
4. Check if you're in the correct Google Cloud project
