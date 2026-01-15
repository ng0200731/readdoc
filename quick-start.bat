@echo off
echo ========================================
echo    ReadDoc - Quick Start
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

echo Starting ReadDoc development server...
echo.
echo ========================================
echo   Server will start at: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev

echo.
echo Server stopped.
pause
