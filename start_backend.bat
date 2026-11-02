@echo off
echo ========================================================
echo Starting CarRent AI Flask Backend (Port 5000)...
echo ========================================================
cd /d "%~dp0backend"
python app.py
pause
