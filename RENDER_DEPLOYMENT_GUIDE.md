# 🚀 Render Backend Deployment Guide

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

## Step 2: Deploy Backend Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `schrodingercats-sudo/upi-scam-checker`
3. Configure the service:

### Basic Settings:
- **Name**: `upi-scam-checker-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `render_backend`

### Build & Deploy Settings:
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements_simple.txt`
- **Start Command**: `gunicorn app:app`

### Environment Variables:
Add these environment variables:
```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 3: Get Your Render URL
After deployment, you'll get a URL like:
`https://your-app-name.onrender.com`

## Step 4: Test Your Backend
Visit: `https://your-app-name.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "features": ["ML Model", "Rule-Based Analysis", "Gemini 2-Step Verification"],
  "message": "UPI Scam Checker Backend is running"
}
```

## Troubleshooting:
- If build fails, check the logs in Render dashboard
- Make sure all files are in the `render_backend/` folder
- Verify Python version compatibility

## Next Step:
Once Render is working, update your Vercel frontend with the Render URL!
