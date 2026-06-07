@echo off
echo ==========================================
echo CivicFix AI - ML Service Setup
echo ==========================================
echo.

cd /d "%~dp0..\ml-service"

if not exist requirements.txt (
    echo ML service is not created yet.
    echo This is normal for Chunk 1.
    pause
    exit /b 0
)

if not exist venv (
    python -m venv venv
)

call venv\Scripts\activate
pip install -r requirements.txt
pause
