# 🚀 Complete Deployment Guide: UPI Scam Checker

## Overview
This guide will help you deploy:
- **Frontend**: Next.js application to Vercel
- **Backend**: Python Flask API to Render

## Prerequisites ✅
- [x] GitHub repository: `schrodingercats-sudo/upi-scam-checker`
- [x] All code fixes pushed to GitHub
- [x] Local build successful (`npm run build`)
- [x] Dependencies resolved (`lucide-react` installed)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import `schrodingercats-sudo/upi-scam-checker`

### Step 2: Configure Project Settings
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```env
GOOGLE_GEMINI_API_KEY=AIzaSyBt4xrmnXm34-uRw5QtWdbQpvcOfIYoc40
OPENROUTER_API_KEY=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
GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyB56S_GzgYvi0n7_auyjgXdLXzN6buiT_w
NODE_ENV=production
```

**Important**: Set these for all environments (Production, Preview, Development)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at: `https://upi-scam-checker.vercel.app`

---

## 🐍 Backend Deployment (Render)

### Step 1: Prepare Backend Files
Your backend is ready in `render_backend/` directory with:
- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `gunicorn.conf.py` - Production server config
- ML models and analysis engine

### Step 2: Create Render Web Service
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect `schrodingercats-sudo/upi-scam-checker`

### Step 3: Configure Render Service
```
Name: upi-scam-backend
Region: Oregon (US West)
Branch: main
Root Directory: render_backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

### Step 4: Set Environment Variables (Render)
In Render Dashboard → Environment:

```env
PYTHON_VERSION=3.9.16
GOOGLE_GEMINI_API_KEY=AIzaSyBt4xrmnXm34-uRw5QtWdbQpvcOfIYoc40
PORT=10000
```

### Step 5: Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your API will be live at: `https://upi-scam-backend.onrender.com`

---

## 🔗 Connect Frontend to Backend

### Update Frontend Configuration
Once your Render backend is deployed, update the frontend:

1. Add backend URL to Vercel environment variables:
```env
NEXT_PUBLIC_BACKEND_URL=https://upi-scam-backend.onrender.com
```

2. Or update API calls in your code to use the Render backend URL.

---

## 🧪 Testing Deployment

### Test Frontend
1. Visit: `https://upi-scam-checker.vercel.app`
2. Try SMS analysis feature
3. Check all components load correctly

### Test Backend
1. Visit: `https://upi-scam-backend.onrender.com/health`
2. Should return JSON with status "healthy"

### Test Integration
1. Use the frontend to analyze a sample SMS
2. Verify it connects to your Render backend
3. Check browser console for any errors

---

## 📝 Quick Commands

### Redeploy Frontend (Vercel)
```bash
# Push any changes to trigger auto-deploy
git add .
git commit -m "Update frontend"
git push
```

### Redeploy Backend (Render)
Render auto-deploys on every push to main branch.

### Local Testing
```bash
# Test frontend locally
npm run dev

# Test backend locally (in render_backend directory)
cd render_backend
python app.py
```

---

## 🚨 Troubleshooting

### Frontend Issues
- **Build fails**: Check Vercel build logs
- **Environment variables**: Ensure all API keys are set
- **CORS errors**: Backend needs proper CORS headers

### Backend Issues
- **Deploy fails**: Check `requirements.txt` compatibility
- **503 errors**: Check Render logs for Python errors
- **Timeout**: Render free tier has some limitations

### Common Fixes
1. **Clear Vercel cache**: Redeploy from dashboard
2. **Render sleep**: Free tier sleeps after inactivity, first request may be slow
3. **API limits**: Monitor your API usage for Gemini/OpenRouter

---

## 🎯 Success URLs

After successful deployment:

- **Frontend**: https://upi-scam-checker.vercel.app
- **Backend**: https://upi-scam-backend.onrender.com
- **Health Check**: https://upi-scam-backend.onrender.com/health

## 📊 Monitoring

### Vercel Analytics
- Enable analytics in Vercel dashboard
- Monitor performance and usage

### Render Metrics
- Check CPU/Memory usage in Render dashboard
- Monitor API response times

---

**🎉 Your UPI Scam Detection System is now live in production!**