# OAuth Client Not Found - Troubleshooting

## What We Know

✅ **client_id is correct**: `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com`
✅ **redirect_uri is correct**: `https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse`

❌ **Google says**: "The OAuth client was not found"

## This Means

Since both values are correct but Google can't find the client, the issue is likely:

### 1. Wrong Google Cloud Project

The OAuth client might be in a **different Google Cloud project** than the one you're currently viewing.

**To check:**
1. Look at the project selector at the top of Google Cloud Console
2. Make sure you're in the project where you created the OAuth client
3. If you have multiple projects, check each one

### 2. Client Was Deleted

The OAuth client might have been accidentally deleted.

**To check:**
1. Go to: APIs & Services > Credentials
2. Look for "OAuth 2.0 Client IDs"
3. Does the client with ID `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1` exist?

### 3. Client ID Typo (Unlikely but Possible)

Even though it looks correct, there might be a subtle typo.

**To check:**
1. In Google Cloud Console, copy the Client ID
2. Compare it character-by-character with: `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1.apps.googleusercontent.com`
3. Pay special attention to:
   - `ll9clmetcikn27d2mgvoqd9vqvrib9i1` (the random part)
   - Make sure there are no extra spaces or characters

## Solution

**Most likely**: You're looking at the wrong Google Cloud project.

1. Check ALL your Google Cloud projects
2. Find the one that has the OAuth client with ID `600692485164-ll9clmetcikn27d2mgvoqd9vrib9i1`
3. Make sure that project is selected when you check the redirect URIs

## Alternative: Create a New OAuth Client

If you can't find the client, you can create a new one:

1. Go to: APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
2. Application type: Web application
3. Name: "NFL Post Season Web Client"
4. Authorized redirect URIs: `https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse`
5. Copy the new Client ID and Client Secret
6. Update `terraform/terraform.tfvars` with the new values
7. Run `terraform apply` to update Cognito
