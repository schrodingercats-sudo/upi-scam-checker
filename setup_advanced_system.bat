@echo off
echo ========================================
echo Advanced UPI Fraud Detection System Setup
echo ========================================
echo.

echo Installing Python dependencies...
pip install -r requirements_advanced.txt

echo.
echo Testing the advanced system...
cd engine
python test_advanced_system.py

echo.
echo Setup completed! 
echo You can now use the advanced ML system in your UPI Guard app.
pause
