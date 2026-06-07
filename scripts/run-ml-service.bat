@echo off
echo ==========================================
echo CivicFix AI - Running ML Service
echo ==========================================
echo.

cd /d "%~dp0..\ml-service"

if not exist app\main.py (
    echo ERROR: FastAPI ML service is not created yet.
    echo We will create it in a later chunk.
    pause
    exit /b 1
)

if not exist venv (
    echo Python virtual environment not found.
    echo Run setup-ml-service.bat first.
    pause
    exit /b 1
)

call venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
pause
