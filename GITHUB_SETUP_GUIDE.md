# GitHub Repository Setup Guide

This guide will help you set up and upload your UPI Guard project to GitHub, then deploy it to Vercel (frontend) and Render (backend).

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
```

### 1.2 Add all files to Git
```bash
git add .
```

### 1.3 Make your initial commit
```bash
git commit -m "Initial commit: UPI Guard SMS scam detection system

- Advanced ML-powered SMS scam detection
- Multi-AI analysis with DeepSeek and Gemini
- URL/link phishing detection
- Phone number reputation checking
- Call audio analysis capabilities
- DLT sender ID verification
- Privacy-first design with local analysis
- Cybercrime complaint generation
- Next.js frontend with TypeScript
- Flask backend with scikit-learn models"
```

## Step 2: Create GitHub Repository

### 2.1 Create Repository on GitHub
1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (green button)
3. Repository name: `upi-guard` (or your preferred name)
4. Description: `AI-powered UPI scam detection system with SMS analysis, link verification, and fraud prevention`
5. Set to **Public** (recommended for deployment)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### 2.2 Connect and Push to GitHub
```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/upi-guard.git

# Verify the remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Repository Settings

### 3.1 Add Repository Description
1. Go to your repository on GitHub
2. Click the gear icon next to "About"
3. Add description: `AI-powered UPI scam detection system with SMS analysis, link verification, and fraud prevention`
4. Add topics/tags: `scam-detection`, `ai`, `machine-learning`, `nextjs`, `typescript`, `cybersecurity`, `upi`, `fraud-prevention`
5. Add website URL (after deployment)

### 3.2 Create Repository Secrets (for CI/CD)
1. Go to repository Settings → Secrets and variables → Actions
2. Add these secrets:
   - `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key
   - `OPENROUTER_API_KEY`: Your OpenRouter API key

## Step 4: Deploy to Vercel (Frontend)

### 4.1 Connect Vercel to GitHub
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository (`upi-guard`)
4. Vercel will auto-detect Next.js configuration

### 4.2 Configure Environment Variables
In Vercel project settings, add:
```
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
OPENROUTER_API_KEY=your_actual_openrouter_key_here
NEXTAUTH_SECRET=generate_random_secret_string
BACKEND_URL=https://your-render-backend.onrender.com
```

### 4.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your frontend will be available at: `https://your-project.vercel.app`

## Step 5: Deploy to Render (Backend)

### 5.1 Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up/login with GitHub

### 5.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `upi-guard-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r render_backend/requirements.txt`
   - **Start Command**: `cd render_backend && gunicorn app:app`
   - **Instance Type**: Free tier (for testing)

### 5.3 Environment Variables
Add these in Render:
```
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
PYTHON_VERSION=3.11.0
```

### 5.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (takes 5-10 minutes)
3. Your backend will be available at: `https://your-service.onrender.com`

## Step 6: Update Frontend Configuration

### 6.1 Update Vercel Environment Variables
1. Go back to Vercel project settings
2. Update `BACKEND_URL` with your actual Render URL:
   ```
   BACKEND_URL=https://your-actual-render-url.onrender.com
   ```
3. Redeploy the frontend

## Step 7: Test Your Deployment

### 7.1 Test Frontend
1. Visit your Vercel URL
2. Try the SMS analysis feature
3. Check that all components load correctly

### 7.2 Test Backend
1. Visit `https://your-render-backend.onrender.com/health`
2. Should return JSON with status information

### 7.3 Test Integration
1. Try analyzing an SMS message
2. Verify that frontend calls backend successfully

## Step 8: Optional Enhancements

### 8.1 Custom Domain (Vercel)
1. In Vercel project settings → Domains
2. Add your custom domain
3. Configure DNS settings

### 8.2 Monitoring
1. Enable Vercel Analytics
2. Set up Render monitoring
3. Configure error tracking

### 8.3 CI/CD Pipeline
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## Troubleshooting

### Common Issues

1. **Build Failed on Vercel**
   - Check package.json dependencies
   - Verify TypeScript errors are fixed
   - Check build logs in Vercel dashboard

2. **Backend Not Starting on Render**
   - Verify requirements.txt has all dependencies
   - Check Python version compatibility
   - Review Render logs

3. **API Integration Issues**
   - Verify BACKEND_URL is correct
   - Check CORS settings
   - Ensure environment variables are set

4. **API Key Errors**
   - Double-check API keys are valid
   - Verify environment variable names
   - Check API quotas/limits

### Getting Help

1. Check deployment logs in Vercel/Render dashboards
2. Test APIs individually using tools like Postman
3. Review browser console for frontend errors
4. Check GitHub Issues for common problems

## Security Checklist

- [ ] Environment variables are set in deployment platforms (not in code)
- [ ] API keys are kept secret and not committed to Git
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (automatic with Vercel/Render)
- [ ] No sensitive data in client-side code

## Final Notes

- Frontend deployments on Vercel are instant with automatic previews
- Backend on Render may take a few minutes to start (free tier)
- Both platforms offer automatic deployments on Git push
- Monitor usage to stay within free tier limits
- Consider upgrading plans for production use

Your UPI Guard system is now live and ready to protect users from SMS scams! 🛡️