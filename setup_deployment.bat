@echo off
cls

echo.
echo 🚀 UPI Scam Checker - Environment Setup
echo =========================================
echo.

REM Check if .env exists
if exist ".env" (
    echo ✅ Found existing .env file
    echo 📝 Please update the following environment variables:
) else (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul 2>&1
    echo ✅ Created .env file
)

echo.
echo 🔑 Required Environment Variables:
echo.
echo 1. GOOGLE_GEMINI_API_KEY
echo    Get from: https://makersuite.google.com/app/apikey
echo.
echo 2. GOOGLE_SAFE_BROWSING_API_KEY
echo    Get from: https://developers.google.com/safe-browsing/v4/get-started
echo.
echo 3. OPENROUTER_API_KEY (for DeepSeek)
echo    Get from: https://openrouter.ai/keys
echo.
echo 4. BLAND_API_KEY (for call analysis)
echo    Get from: https://www.bland.ai/
echo.

echo 🔧 Deployment URLs:
echo ===================
echo.
echo Frontend (Vercel): https://vercel.com/new
echo Backend (Render):  https://render.com/create
echo.

echo 📚 Full deployment guide: DEPLOYMENT_GUIDE.md
echo.
echo 🎯 Quick Deploy Commands:
echo =========================
echo.
echo # Deploy to Vercel (frontend)
echo npx vercel --prod
echo.
echo # Push to trigger auto-deploy
echo git add .
echo git commit -m "update: configure for production"
echo git push origin main
echo.

echo ✨ Setup complete! Check DEPLOYMENT_GUIDE.md for detailed instructions.
echo.
pause