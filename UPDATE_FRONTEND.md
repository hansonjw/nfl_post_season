# Quick Guide: Update Frontend to Use Production API

## ✅ Already Done

I've created `.env.production` with your production API URL. This file is automatically used when you build for production.

## 🧪 Test It Locally (Optional)

To test the production API from your local dev server:

1. **Create `.env.local`** (this overrides the default for local dev):
   ```bash
   VITE_API_URL=https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod
   ```

2. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C), then:
   npm run dev
   ```

3. **Open the app** - it will now connect to the production API instead of localhost:3001

## 📦 Build for Production

When you're ready to build:

```bash
npm run build
```

The built files in `dist/` will automatically use the production API URL from `.env.production`.

## 🚀 Deploy the Frontend

After building, deploy the `dist/` folder to:
- **Vercel/Netlify**: Connect GitHub repo, set `VITE_API_URL` env var, auto-deploy
- **AWS S3 + CloudFront**: Upload `dist/` contents to S3, enable static hosting
- **AWS Amplify**: Connect GitHub repo, set env var, auto-deploy

## 📝 Current Setup

- **Local dev**: Uses `http://localhost:3001` (your local server)
- **Production build**: Uses `https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod` (from `.env.production`)

The frontend will automatically use the right API URL based on how you're running it!
