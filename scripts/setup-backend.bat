@echo off
echo ==========================================
echo CivicFix AI - Backend Setup
echo ==========================================
echo.

cd /d "%~dp0..\backend"

if not exist artisan (
    echo Laravel backend is not created yet.
    echo This is normal for Chunk 1.
    echo We will create Laravel in Chunk 2.
    pause
    exit /b 0
)

composer install

if not exist .env (
    copy .env.example .env
)

php artisan key:generate
pause
