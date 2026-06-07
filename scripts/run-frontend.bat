@echo off
echo ==========================================
echo CivicFix AI - Running Frontend
echo ==========================================
echo.

cd /d "%~dp0..\frontend"

if not exist package.json (
    echo ERROR: package.json not found in frontend folder.
    pause
    exit /b 1
)

echo Starting Next.js frontend...
echo URL: http://localhost:3000
echo.

call npm run dev
pause
