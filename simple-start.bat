@echo off
echo ========================================
echo    ReadDoc - Simple Start
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

echo Starting ReadDoc development server on port 3003...
echo.
echo ========================================
echo   Server will start at: http://localhost:3003
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

REM Force a specific port to avoid conflicts
set PORT=3003
npm run dev
