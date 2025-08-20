@echo off
echo.
echo ========================================
echo   🚀 Vercel Deployment Script
echo   ML-Powered SMS Scam Detection
echo ========================================
echo.

echo 📋 Prerequisites Check:
echo.

REM Check if Git is initialized
if not exist ".git" (
    echo ❌ Git not initialized. Running git init...
    git init
) else (
    echo ✅ Git repository found
)

REM Check if ML model is trained
if not exist "sms_scam_model.pkl" (
    echo ❌ ML model not found. Training model...
    python train_ml_model.py
    if errorlevel 1 (
        echo ❌ Model training failed. Please check errors above.
        pause
        exit /b 1
    )
) else (
    echo ✅ ML model found
)

REM Check if build works
echo.
echo 🔧 Testing build...
npm run build
if errorlevel 1 (
    echo ❌ Build failed. Please fix errors above.
    pause
    exit /b 1
)
echo ✅ Build successful!

echo.
echo 🚀 Ready for Vercel Deployment!
echo ========================================
echo.
echo 📋 Next Steps:
echo.
echo 1. Create GitHub repository:
echo    - Go to https://github.com
echo    - Create new repo: upi-scam-checker
echo    - Make it PUBLIC
echo.
echo 2. Push to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/upi-scam-checker.git
echo    git push -u origin main
echo.
echo 3. Deploy to Vercel:
echo    - Go to https://vercel.com
echo    - Import your GitHub repo
echo    - Click Deploy
echo.
echo 📚 See VERCEL_DEPLOYMENT.md for detailed instructions
echo.
echo 🎯 Your system is ready for production deployment!
echo.

pause
