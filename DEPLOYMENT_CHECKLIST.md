# 📋 Deployment Checklist

## 🎯 Goal: Deploy UPI Scam Checker on Vercel + Render

### ✅ Step 1: Render Backend Deployment
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Connect repository: `schrodingercats-sudo/upi-scam-checker`
- [ ] Configure settings:
  - **Name**: `upi-scam-checker-backend`
  - **Root Directory**: `render_backend`
  - **Build Command**: `pip install -r requirements_simple.txt`
  - **Start Command**: `gunicorn app:app`
- [ ] Add environment variable: `GOOGLE_GEMINI_API_KEY=your_key_here`
- [ ] Deploy and wait for success
- [ ] Copy your Render URL (e.g., `https://your-app.onrender.com`)

### ✅ Step 2: Vercel Frontend Update
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Select your project: `upi-scam-checker`
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add: `RENDER_BACKEND_URL=https://your-app.onrender.com`
- [ ] Redeploy (should happen automatically)

### ✅ Step 3: Testing
- [ ] Test Fast2SMS message: Should show **SAFE**
- [ ] Test scam message: Should show **SCAM**
- [ ] Test backend health: Visit `/health` endpoint
- [ ] Verify Gemini integration works

### 🎉 Step 4: Success!
Your system is now fully deployed and working!

## 📞 Need Help?
- Check Render logs if backend fails
- Check Vercel logs if frontend fails
- Verify environment variables are set correctly
