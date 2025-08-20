@echo off
echo.
echo ========================================
echo   ML-Powered SMS Scam Detection System
echo ========================================
echo.
echo Starting complete ML system setup...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not available
    echo Please ensure pip is installed with Python
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Install Python dependencies
echo 🔧 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

echo ✅ Python dependencies installed
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    echo Please ensure npm is installed with Node.js
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install Node.js dependencies
echo 🔧 Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo ✅ Node.js dependencies installed
echo.

REM Run ML system setup
echo 🚀 Setting up ML system...
python setup_ml_system.py
if errorlevel 1 (
    echo ❌ ML system setup failed
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo 🎉 ML System Setup Completed Successfully!
echo.

REM Start development server
echo 🌐 Starting development server...
echo.
echo Your ML-powered SMS scam detection system is now running!
echo Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
