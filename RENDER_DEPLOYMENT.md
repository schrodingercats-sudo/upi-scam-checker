# 🚀 Deploy Python ML Backend on Render

This guide will help you deploy your Python ML models on Render so they can work with your Vercel frontend.

## 📋 Prerequisites

- GitHub account with your UPI Scam Checker repository
- Render account (free tier available)

## 🔧 Setup Steps

### 1. Prepare the Backend Files

Run the setup script to copy all necessary files:

```bash
python render_backend/deploy_to_render.py
```

This will create a `render_backend` directory with all required files.

### 2. Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `upi-scam-checker-backend` (or any name you prefer)
   - **Root Directory**: `render_backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (or paid if you need more resources)

### 3. Environment Variables (Optional)

Add these if you have them:
- `GEMINI_API_KEY`: Your Gemini API key for enhanced analysis
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
     "recommended_action": "BLOCKED: This is a confirmed scam message. Do not interact."
   }
   ```

## 🔄 How It Works

1. **Vercel frontend** receives user input
2. **Immediate blocking** checks for obvious scams (99% confidence)
3. **If not blocked**, calls **Render Python backend** for ML analysis
4. **If backend fails**, uses **fallback analysis** on Vercel
5. **Results displayed** to user

## 🛡️ Security Features

- ✅ **Immediate blocking** for obvious scams (cannot be bypassed)
- ✅ **ML-powered analysis** via Python backend
- ✅ **Fallback system** if backend is down
- ✅ **99% confidence** for confirmed threats

## 🚨 Troubleshooting

### Backend Not Responding
- Check Render logs for errors
- Verify `requirements.txt` has all dependencies
- Ensure `gunicorn` is in requirements

### Import Errors
- Verify all `engine/` files are copied to `render_backend/`
- Check Python version compatibility
- Ensure ML model files (`.pkl`, `.json`) are present

### CORS Issues
- Backend includes `Flask-CORS` for cross-origin requests
- If issues persist, check Vercel environment variables

## 💰 Costs

- **Render Free Tier**: 750 hours/month (usually sufficient)
- **Vercel**: Free tier available
- **Total**: $0/month for basic usage

## 🎯 Benefits

1. **Keep your ML models** working
2. **Immediate blocking** still active
3. **Scalable backend** on Render
4. **Fast frontend** on Vercel
5. **Fallback system** for reliability

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify all files are copied correctly
3. Test backend endpoints directly
4. Check environment variables in Vercel

---

**Your UPI Scam Checker will now have:**
- 🚨 **Immediate blocking** (99% confidence)
- 🤖 **ML-powered analysis** (Python backend)
- 🛡️ **Fallback protection** (Vercel)
- ⚡ **Fast performance** (both platforms)
