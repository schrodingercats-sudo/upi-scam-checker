@echo off
echo 🚀 Deploying UPI Scam Checker to Vercel...
echo.

echo 📦 Installing Vercel CLI...
npm install -g vercel

echo.
echo 🔧 Deploying to Vercel...
vercel --prod --yes

echo.
echo ✅ Deployment completed!
echo 🌐 Your app is live at: https://upi-checker.vercel.app/
echo.
pause
