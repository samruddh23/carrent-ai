@echo off
echo ========================================================
echo Starting CarRent AI Full Stack System...
echo ========================================================
start "CarRent AI Backend" cmd /k "cd /d "%~dp0backend" && python app.py"
timeout /t 3 /nobreak >nul
start "CarRent AI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo Backend and Frontend launched in dedicated windows!
echo Open your browser at: http://localhost:5173
pause
