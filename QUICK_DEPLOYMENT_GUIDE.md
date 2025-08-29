# 🚀 Quick Deployment Guide - UPI Guard

## Prerequisites Check
First, ensure you have these installed:
- Node.js 18+ (`node --version`)
- Python 3.11+ (`python --version`)
- Git (`git --version`)

## Step 1: Install Dependencies

### Frontend Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd render_backend
pip install -r requirements.txt
cd ..
```

## Step 2: Build the Application
```bash
npm run build
```

## Step 3: Git Operations

### Check Status
```bash
git status
```

### Add and Commit Changes
```bash
git add .
git commit -m "Deploy: Update UPI Guard with latest changes"
```

### Push to GitHub
```bash
git push origin main
```

## Step 4: Deploy Frontend to Vercel

### Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Deploy to Vercel
```bash
vercel --prod --yes
```

## Step 5: Deploy Backend to Render

### Manual Steps:
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository: `schrodingercats-sudo/upi-scam-checker`
5. Configure:
   - **Name**: `upi-scam-checker-backend`
   - **Root Directory**: `render_backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

### Environment Variables in Render:
```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 6: Update Vercel Environment Variables

Once you get your Render URL (e.g., `https://your-app-name.onrender.com`):

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   RENDER_BACKEND_URL=https://your-app-name.onrender.com
   ```

## Step 7: Test Your Deployment

### Test Backend
Visit: `https://your-app-name.onrender.com/health`

### Test Frontend
Visit your Vercel URL and test:
1. Fast2SMS message → Should show **SAFE**
2. Scam message → Should show **SCAM**

## Troubleshooting

### If Vercel deployment fails:
- Check if all dependencies are installed
- Ensure build passes locally
- Check Vercel logs for errors

### If Render deployment fails:
- Verify Python version compatibility
- Check if all files are in `render_backend/` folder
- Review Render build logs

### If backend connection fails:
- Verify environment variables are set correctly
- Check if Render service is running
- Test backend health endpoint

## Quick Commands Summary

```bash
# Complete deployment sequence
npm install
cd render_backend && pip install -r requirements.txt && cd ..
npm run build
git add . && git commit -m "Deploy: Update UPI Guard" && git push origin main
npm install -g vercel
vercel --prod --yes
```

## Support Files
- `RENDER_DEPLOYMENT_GUIDE.md` - Detailed Render setup
- `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed Vercel setup
- `deploy_complete.bat` - Windows batch script
- `deploy_complete.ps1` - PowerShell script

## Current Status
- ✅ Repository: `schrodingercats-sudo/upi-scam-checker`
- ✅ Frontend: Next.js with TypeScript
- ✅ Backend: Python Flask with ML models
- ✅ Database: Ready for integration
- ⏳ Deployment: Ready to deploy
