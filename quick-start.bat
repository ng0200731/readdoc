@echo off
echo ========================================
echo    ReadDoc - Quick Start
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

echo Starting ReadDoc development server...

REM Check if port 3000 is available, if not find next available port
powershell -Command "& { $port = 3000; while ((Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue).TcpTestSucceeded) { $port++ }; Write-Host \"Using port: $port\" }" > temp_port.txt 2>nul
set /p START_PORT=<temp_port.txt
del temp_port.txt 2>nul

if "%START_PORT%"=="" set START_PORT=3000

echo.
echo ========================================
echo   Server starting at: http://localhost:%START_PORT%
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

REM Set PORT environment variable to force Next.js to use our chosen port
set PORT=%START_PORT%
npm run dev

echo.
echo Server stopped.
pause
