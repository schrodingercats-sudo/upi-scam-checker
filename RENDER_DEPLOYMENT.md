# 🚀 Deploy Python ML Backend on Render

This guide will help you deploy your Python backend on Render so it can work with your Vercel frontend.

## 📋 Prerequisites

- GitHub account with your UPI Scam Checker repository
- Render account (free tier available)

## 🔧 Setup Steps

### 1. Prepare the Backend Files

The setup script has already copied all necessary files:

```bash
python render_backend/deploy_to_render.py
```

### 2. Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `upi-scam-checker-backend` (or any name you prefer)
   - **Root Directory**: `render_backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements_simple.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (or paid if you need more resources)

### 3. Environment Variables (Optional)

Add these if you have them:
- `LOG_LEVEL`: Set to `INFO` or `DEBUG` for logging

### 4. Deploy

Click **"Create Web Service"** and wait for deployment to complete.

## 🔗 Update Vercel Configuration

Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`

1. **Go to your Vercel dashboard**
2. **Add environment variable:**
   - **Name**: `RENDER_BACKEND_URL`
   - **Value**: `https://your-app-name.onrender.com`

3. **Redeploy Vercel** to pick up the new environment variable

## 🧪 Test the Setup

1. **Test Render backend directly:**
   ```bash
   curl -X POST https://your-app-name.onrender.com/analyze \
     -H "Content-Type: application/json" \
     -d '{"text": "Your bank credit 12000 INR click on this link"}'
   ```

2. **Expected response:**
   ```json
   {
     "classification": "Scam",
     "confidence_score": "99%",
     "risk_level": "High",
     "red_flags": [
       "IMMEDIATE BLOCK: Obvious scam pattern detected",
       "Hard-coded security rule triggered",
       "Cannot be bypassed by ML manipulation"
     ],
     "recommended_action": "BLOCKED: This is a confirmed scam message. Do not interact.",
     "blocked_by": "immediate_pattern",
     "backend": "Render Python Backend"
   }
   ```

## 🔄 How It Works

1. **Vercel frontend** receives user input
2. **Immediate blocking** checks for obvious scams (99% confidence)
3. **If not blocked**, calls **Render Python backend** for enhanced analysis
4. **Enhanced fallback analysis** provides comprehensive scam detection
5. **Results displayed** to user

## 🛡️ Security Features

- ✅ **Immediate blocking** for obvious scams (cannot be bypassed)
- ✅ **Enhanced fallback analysis** with comprehensive patterns
- ✅ **99% confidence** for confirmed threats
- ✅ **Lightweight deployment** (no heavy ML dependencies)

## 🚨 Troubleshooting

### Build Errors
- Use `requirements_simple.txt` instead of `requirements.txt`
- This avoids pandas/numpy compatibility issues with Python 3.13

### Backend Not Responding
- Check Render logs for errors
- Verify `requirements_simple.txt` has all dependencies
- Ensure `gunicorn` is in requirements

### CORS Issues
- Backend includes `Flask-CORS` for cross-origin requests
- If issues persist, check Vercel environment variables

## 💰 Costs

- **Render Free Tier**: 750 hours/month (usually sufficient)
- **Vercel**: Free tier available
- **Total**: $0/month for basic usage

## 🎯 Benefits

1. **Immediate blocking** still active (99% confidence)
2. **Enhanced analysis** on Render backend
3. **Fast frontend** on Vercel
4. **Fallback system** for reliability
5. **No compatibility issues** with Python versions

## 🔄 Future ML Integration

Once the basic backend is working, you can gradually add ML capabilities:

1. **Start with simple requirements** (current setup)
2. **Test thoroughly** on Render
3. **Gradually add ML libraries** with compatible versions
4. **Use `requirements.txt`** for full ML capabilities

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify all files are copied correctly
3. Test backend endpoints directly
4. Check environment variables in Vercel
5. Use `requirements_simple.txt` for initial deployment

---

**Your UPI Scam Checker will now have:**
- 🚨 **Immediate blocking** (99% confidence)
- 🤖 **Enhanced analysis** (Render backend)
- 🛡️ **Fallback protection** (Vercel)
- ⚡ **Fast performance** (both platforms)
- 🔧 **Easy deployment** (no compatibility issues)
