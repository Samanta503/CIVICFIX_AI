@echo off
echo ==========================================
echo CivicFix AI - Tool Check
echo ==========================================
echo.

echo Checking Node.js...
call node -v

echo.
echo Checking npm...
call npm -v

echo.
echo Checking PHP...
call php -v

echo.
echo Checking Composer...
call composer -V

echo.
echo Checking Python...
call python --version

echo.
echo Checking pip...
call pip --version

echo.
echo Checking MySQL command line...
call mysql --version

echo.
echo ==========================================
echo Tool check completed.
echo ==========================================
pause
