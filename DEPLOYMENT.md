# 🚀 Deployment Guide - UPI Scam Checker v3.0.0

## 📋 Overview
This guide will help you deploy the UPI Scam Checker to:
- **Frontend**: Vercel (https://upi-checker.vercel.app/)
- **Backend**: Render (for Python ML services)

## 🎯 Quick Deployment

### 1. GitHub Repository ✅
- **Repository**: https://github.com/schrodingercats-sudo/upi-scam-checker
- **Status**: ✅ Already pushed and ready

### 2. Vercel Frontend Deployment

#### Option A: Automatic Deployment (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `schrodingercats-sudo/upi-scam-checker`
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
6. Click "Deploy"

#### Option B: CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod --yes
```

### 3. Render Backend Deployment (Optional)

For enhanced ML capabilities, deploy the Python backend:

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `upi-scam-checker-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements_advanced.txt`
   - **Start Command**: `python engine/test_advanced_system.py`
   - **Plan**: Free

## 🔧 Environment Variables

### Required for Vercel:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Optional for Enhanced Features:
```env
TRUECALLER_API_KEY=your_truecaller_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
GOOGLE_SAFE_BROWSING_API_KEY=your_google_api_key
```

## 📊 Deployment Status

### ✅ Completed:
- [x] GitHub repository setup
- [x] Code pushed to main branch
- [x] Vercel configuration created
- [x] Environment variables documented

### 🔄 Next Steps:
1. Deploy to Vercel using the dashboard
2. Configure environment variables
3. Test the live application
4. Set up custom domain (optional)

## 🌐 Live URLs

- **Production**: https://upi-checker.vercel.app/
- **GitHub**: https://github.com/schrodingercats-sudo/upi-scam-checker
- **Vercel Dashboard**: https://vercel.com/dashboard

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version (18+ required)
   - Ensure all dependencies are installed
   - Verify TypeScript compilation

2. **API Errors**:
   - Verify environment variables are set
   - Check API key validity
   - Monitor Vercel function logs

3. **ML System Issues**:
   - Python dependencies may need to be installed
   - Consider using Render for Python backend

## 📈 Monitoring

### Vercel Analytics:
- Function execution times
- API response times
- Error rates
- User traffic

### Performance Metrics:
- Page load times
- API response times
- ML analysis accuracy
- User engagement

## 🔄 Continuous Deployment

The repository is set up for automatic deployments:
- Push to `main` branch → Automatic Vercel deployment
- Environment variables are preserved
- Zero-downtime deployments

## 📞 Support

For deployment issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test locally with `npm run dev`
4. Check GitHub Actions (if configured)

---

**🎯 Your UPI Scam Checker v3.0.0 is ready for production deployment!**
