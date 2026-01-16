# Create New OAuth Client (If Current One Doesn't Exist)

## Steps to Create New OAuth Client

### 1. Create the Client

1. Go to: **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: "NFL Post Season"
   - User support email: your email
   - Developer contact: your email
   - Click Save and Continue
   - Scopes: Add `email`, `profile`, `openid`
   - Test users: Add `hansonjw@gmail.com`
   - Click Save and Continue
   - Click Back to Dashboard

4. Now create the OAuth client:
   - Application type: **Web application**
   - Name: **NFL Post Season Web Client**
   - Authorized redirect URIs: Click **+ ADD URI** and add:
     ```
     https://nfl-post-season-auth.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
     ```
   - Click **CREATE**

5. **Copy the Client ID and Client Secret** (you'll need these)

### 2. Update Terraform Configuration

1. Open `terraform/terraform.tfvars`
2. Update these lines with your NEW values:
   ```hcl
   google_client_id = "YOUR-NEW-CLIENT-ID.apps.googleusercontent.com"
   google_client_secret = "YOUR-NEW-CLIENT-SECRET"
   ```

### 3. Update Cognito

Run Terraform to update the Cognito identity provider:

```bash
cd terraform
terraform apply
```

This will update the Cognito configuration with the new Google OAuth client.

### 4. Test

1. Wait 2-3 minutes after terraform apply completes
2. Try logging in again
3. It should work now!
