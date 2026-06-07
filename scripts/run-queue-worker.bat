@echo off
echo ==========================================
echo CivicFix AI - Running Laravel Queue Worker
echo ==========================================
echo.

cd /d "%~dp0..\backend"

if not exist artisan (
    echo ERROR: Laravel backend is not created yet.
    echo We will create it in Chunk 2.
    pause
    exit /b 1
)

php artisan queue:work
pause
