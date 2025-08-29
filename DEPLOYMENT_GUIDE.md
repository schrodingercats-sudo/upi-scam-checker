# UPI Scam Checker - Complete Deployment Guide

## 🚀 Quick Start Deployment

Your UPI Scam Checker is now ready for deployment! Follow these steps to deploy to Vercel (frontend) and Render (backend).

### 📋 Prerequisites

- ✅ GitHub repository: `https://github.com/schrodingercats-sudo/upi-scam-checker.git`
- ✅ Vercel account ([sign up](https://vercel.com))
- ✅ Render account ([sign up](https://render.com))
- ✅ API keys (see Environment Variables section)

---

## 🎯 Step 1: Deploy Frontend to Vercel

### Option A: Direct GitHub Integration (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Select "Import Git Repository"
   - Choose your GitHub account
   - Select `upi-scam-checker` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Set Environment Variables**
   ```
   GOOGLE_GEMINI_API_KEY=your_actual_gemini_key
   GOOGLE_SAFE_BROWSING_API_KEY=your_actual_safe_browsing_key
   OPENROUTER_API_KEY=your_actual_openrouter_key
   BLAND_API_URL=https://api.bland.ai/v1/calls
   BLAND_API_KEY=your_actual_bland_key
   NODE_ENV=production
   NEXT_PUBLIC_BACKEND_URL=https://your-render-backend-url.onrender.com
   ```
   
   > ⚠️ **Important**: Set `NEXT_PUBLIC_BACKEND_URL` after deploying backend to Render

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Get your Vercel URL (e.g., `https://upi-scam-checker.vercel.app`)

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🔧 Step 2: Deploy Backend to Render

### Deploy Python Backend

1. **Go to Render Dashboard**
   - Visit [render.com/dashboard](https://render.com/dashboard)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select `upi-scam-checker` repository

3. **Configure Service**
   ```
   Name: upi-scam-checker-backend
   Runtime: Python 3
   Region: US East (Ohio) or closest to your users
   Branch: main
   Root Directory: render_backend
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

4. **Set Environment Variables**
   ```
   GOOGLE_GEMINI_API_KEY=your_actual_gemini_key
   GOOGLE_SAFE_BROWSING_API_KEY=your_actual_safe_browsing_key
   OPENROUTER_API_KEY=your_actual_openrouter_key
   FLASK_ENV=production
   ```

5. **Advanced Settings**
   - **Instance Type**: Free tier is sufficient for testing
   - **Auto-Deploy**: Yes (recommended)

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Get your Render URL (e.g., `https://upi-scam-checker-backend.onrender.com`)

---

## 🔗 Step 3: Link Frontend and Backend

### Update Frontend Environment Variables

1. **In Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Update `NEXT_PUBLIC_BACKEND_URL` with your Render backend URL
   - Redeploy the frontend

2. **Alternative: Update and Push**
   ```bash
   # Update .env.example with actual Render URL
   # Then redeploy Vercel (auto-deploy on push)
   git add .
   git commit -m "update: Set production backend URL"
   git push origin main
   ```

---

## 🧪 Step 4: Test Deployment

### Test Backend
```bash
curl https://your-render-backend-url.onrender.com/health
# Expected: {"status": "healthy"}
```

### Test Frontend
1. Visit your Vercel URL
2. Try the SMS analysis feature
3. Check browser console for any errors
4. Verify API calls to backend are working

---

## 🔒 Environment Variables Reference

### Frontend (Vercel)
```env
GOOGLE_GEMINI_API_KEY=your_key_here
GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
BLAND_API_URL=https://api.bland.ai/v1/calls
BLAND_API_KEY=your_key_here
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### Backend (Render)
```env
GOOGLE_GEMINI_API_KEY=your_key_here
GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
FLASK_ENV=production
```

---

## 🎯 Quick Deployment Commands

```bash
# If you need to make changes and redeploy
git add .
git commit -m "feat: your changes"
git push origin main

# Both Vercel and Render will auto-deploy from GitHub
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Failed on Vercel**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Backend Not Responding**
   - Check Render logs
   - Verify environment variables are set
   - Ensure requirements.txt has all dependencies

3. **CORS Errors**
   - Verify backend URL in frontend env vars
   - Check CORS configuration in backend

4. **API Key Issues**
   - Verify all API keys are correctly set
   - Check for extra spaces or quotes in env vars

### Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Create an issue in your repository

---

## 🎉 Success!

Your UPI Scam Checker is now live:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

The application includes:
- ✅ AI-powered SMS analysis
- ✅ URL scam detection
- ✅ Multiple AI fallback systems
- ✅ Complaint generation
- ✅ Real-time analysis

### Next Steps
1. Share your deployment URL
2. Monitor usage and performance
3. Consider upgrading to paid plans for production use
4. Set up monitoring and alerts

---

**Happy Deploying! 🚀**