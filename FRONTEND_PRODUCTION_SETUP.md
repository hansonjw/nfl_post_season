# Frontend Production Setup

## Environment Variables

Your frontend uses environment variables to configure the API URL. The API client in `src/api/client.ts` reads from `VITE_API_URL`.

### For Production Builds

Create a `.env.production` file in the project root:

```bash
VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod
```

When you run `npm run build`, Vite will use this file automatically.

### For Local Development

By default, the app uses `http://localhost:3001` (your local dev server).

To override, create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:3001
```

Or to test against production locally:

```bash
VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod
```

## Testing the Production API Locally

1. **Create `.env.local`** with the production URL:
   ```bash
   VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Open the app** - it will now use the production API instead of localhost:3001

## Building for Production

1. **Ensure `.env.production` exists** with the production API URL

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **The built files** will be in the `dist/` directory, ready to deploy

## Deploying the Frontend

### Option 1: AWS S3 + CloudFront (Recommended)

1. Create an S3 bucket for static hosting
2. Upload the `dist/` folder contents
3. Enable static website hosting
4. Create a CloudFront distribution
5. (Optional) Configure a custom domain

### Option 2: Vercel

1. Connect your GitHub repository
2. Set environment variable: `VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod`
3. Deploy automatically on push

### Option 3: Netlify

1. Connect your GitHub repository
2. Set environment variable: `VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod`
3. Deploy automatically on push

### Option 4: AWS Amplify

1. Connect your GitHub repository in AWS Amplify Console
2. Add environment variable: `VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod`
3. Auto-deploy on push

## Current API Endpoints

**Base URL:** `https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod`

- `GET /players` - Get all players
- `GET /games` - Get all games  
- `GET /picks` - Get all picks (optional: `?playerId=` or `?gameId=`)
- `GET /scoreboard` - Get player standings

**Admin endpoints** (require Cognito auth - not yet implemented in frontend):
- `POST /players`, `PUT /players/:id`, `DELETE /players/:id`
- `POST /games`, `PUT /games/:id`
- `POST /picks`, `PUT /picks/:id`

## Notes

- `.env.production` is used for production builds
- `.env.local` is used for local development (and overrides `.env.production` locally)
- Both files are gitignored (they won't be committed)
- Vite automatically loads the right file based on the mode
