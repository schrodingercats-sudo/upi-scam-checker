# UPI Guard - SMS Scam Detection System

A comprehensive AI-powered system to detect UPI scams, suspicious links, and fraudulent SMS messages using advanced ML models, DeepSeek AI, and Google Gemini.

## Features

- **Real-time SMS Analysis** - Advanced ML models with 100K+ trained samples
- **Multi-AI Verification** - DeepSeek-R1 + Google Gemini AI analysis
- **URL/Link Detection** - Phishing and suspicious link detection
- **Call Audio Analysis** - Voice scam detection capabilities
- **Phone Number Tracking** - Spam score and reputation checking
- **DLT Sender ID Analysis** - Indian DLT (Distributed Ledger Technology) compliance checking
- **Privacy-First Design** - On-device analysis by default
- **Complaint Generation** - Automatic cybercrime complaint generation

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Iconify React** - Icon library

### Backend
- **Flask** - Python web framework
- **scikit-learn** - Machine learning models
- **Google Gemini API** - AI-powered analysis
- **DeepSeek API** - Advanced reasoning capabilities
- **pandas & numpy** - Data processing

## Deployment Guide

### Prerequisites

1. **API Keys Required:**
   - Google Gemini API key
   - OpenRouter API key (for DeepSeek)

2. **Accounts Needed:**
   - GitHub account
   - Vercel account
   - Render account

### 1. Deploy to GitHub

```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit: UPI Guard scam detection system"

# Create GitHub repository and push
git remote add origin https://github.com/your-username/upi-guard.git
git branch -M main
git push -u origin main
```

### 2. Deploy Frontend to Vercel

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   ```
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   BACKEND_URL=https://your-render-backend.onrender.com
   ```

3. **Deploy:**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your frontend will be available at: `https://your-project.vercel.app`

### 3. Deploy Backend to Render

1. **Create Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   ```
   Runtime: Python 3
   Build Command: pip install -r render_backend/requirements.txt
   Start Command: cd render_backend && gunicorn app:app
   ```

3. **Environment Variables:**
   ```
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
   PYTHON_VERSION=3.11.0
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Backend will be available at: `https://your-service.onrender.com`

### 4. Update Frontend Configuration

After backend deployment, update Vercel environment variables:
```
BACKEND_URL=https://your-actual-render-url.onrender.com
```

## API Endpoints

### Frontend API Routes
- `POST /api/analyze-sms` - Comprehensive SMS analysis
- `POST /api/analyze-url` - URL/link analysis
- `POST /api/analyze-call` - Call audio analysis
- `GET /api/phone` - Phone number tracking
- `GET /api/health` - Health check

### Backend API Routes
- `GET /health` - Backend health check
- `POST /analyze` - SMS analysis with ML models

## Getting Started (Development)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/upi-guard.git
cd upi-guard
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
pip install -r render_backend/requirements.txt
```

### 3. Set Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 4. Start Development Servers
```bash
# Frontend (Port 3000)
npm run dev

# Backend (Port 5000)
cd render_backend
python app.py
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Environment Variables

### Required
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API key
- `OPENROUTER_API_KEY` - OpenRouter API key for DeepSeek

### Optional
- `BACKEND_URL` - Backend service URL (production)
- `NODE_ENV` - Environment (development/production)

## File Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── try/              # Demo page
│   └── layout.tsx        # Root layout
├── components/            # Shared components
├── engine/               # ML analysis engine
├── render_backend/       # Python Flask backend
│   ├── engine/          # Backend ML engine
│   ├── app.py           # Flask application
│   └── requirements.txt # Python dependencies
├── lib/                  # Utility functions
├── public/              # Static assets
├── vercel.json          # Vercel configuration
└── package.json         # Node.js dependencies
```

## Security Features

1. **Privacy-First Design** - Analysis runs locally by default
2. **No SMS Permissions** - No READ_SMS permission required
3. **DLT Compliance** - Indian telecom regulation compliance
4. **Multi-Layer Analysis** - ML + Rule-based + AI verification
5. **Safe Fallbacks** - Graceful degradation when APIs fail

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@upiguard.com

## Disclaimer

This tool is for educational and security awareness purposes. Always verify suspicious messages through official channels and report scams to appropriate authorities.