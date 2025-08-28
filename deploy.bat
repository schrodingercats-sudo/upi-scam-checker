@echo off
setlocal EnableDelayedExpansion

echo.
echo ========================================
echo    UPI Guard Deployment Setup
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

:: Check if Git is initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    echo [SUCCESS] Git repository initialized
)

:: Install frontend dependencies
echo [INFO] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed

:: Install backend dependencies
echo [INFO] Installing backend dependencies...
cd render_backend
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Backend dependencies installed

:: Create environment file if it doesn't exist
if not exist ".env.local" (
    echo [INFO] Creating environment file...
    copy .env.example .env.local
    echo [WARNING] Please edit .env.local with your API keys before deployment
)

:: Run linting
echo [INFO] Running code quality checks...
call npm run lint
if errorlevel 1 (
    echo [WARNING] Code quality checks failed, but continuing...
) else (
    echo [SUCCESS] Code quality checks passed
)

:: Build the application
echo [INFO] Building application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [SUCCESS] Application built successfully

echo.
echo ========================================
echo    Deployment Setup Completed!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env.local with your API keys
echo 2. Commit changes: git add . ^&^& git commit -m "Initial commit"
echo 3. Push to GitHub: git remote add origin ^<your-repo-url^> ^&^& git push -u origin main
echo 4. Deploy to Vercel: Visit https://vercel.com and import your GitHub repository
echo 5. Deploy backend to Render: Visit https://render.com and create a new web service
echo.
echo For detailed instructions, see DEPLOYMENT_README.md
echo.
pause