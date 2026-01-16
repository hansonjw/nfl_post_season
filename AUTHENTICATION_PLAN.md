# Authentication Implementation Plan

## Current State
- ✅ Cognito User Pool configured with Google OAuth
- ✅ API Gateway admin endpoints require Cognito auth
- ❌ Frontend has no authentication
- ❌ Admin pages are publicly accessible
- ❌ Admin API calls don't include auth tokens

## What Needs to Be Done

### 1. Install AWS Amplify Auth Library
```bash
npm install aws-amplify @aws-amplify/ui-react
```

### 2. Configure Amplify in Frontend
- Set up Amplify configuration with Cognito details
- Configure Google OAuth redirect

### 3. Create Auth Context/Provider
- Manage authentication state
- Provide login/logout functions
- Store and refresh tokens

### 4. Protect Admin Pages
- Check if user is authenticated
- Redirect to login if not
- Show login button in header

### 5. Update API Client
- Include JWT token in Authorization header for admin requests
- Handle 401 errors (unauthorized) gracefully

### 6. Add Login/Logout UI
- Login button in header
- User info display
- Logout button

## Implementation Steps

1. **Install dependencies**
2. **Create auth configuration file** with Cognito details
3. **Create AuthContext** for managing auth state
4. **Add login/logout UI** to App.tsx
5. **Protect admin routes** - check auth before rendering
6. **Update API client** - add Authorization header
7. **Test with production API**

## Cognito Details (from Terraform outputs)
- User Pool ID: `us-west-2_nmjm2LSoI`
- Client ID: `4nqlq379m9tp1m55379rgetooc`
- Domain: `nfl-post-season-auth`
- Region: `us-west-2`

## Notes
- Local dev server doesn't require auth (works fine for local development)
- Production API requires auth for admin endpoints
- Google OAuth will redirect to Cognito hosted UI
- After login, user gets JWT token to use for API calls
