@echo off
echo ========================================
echo    ReadDoc - Document Reader ^& Organizer
echo ========================================
echo.

REM Change to the script directory (in case it's run from elsewhere)
cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo Dependencies installed successfully.
echo.

echo Initializing database...
call npm run init-db
if errorlevel 1 (
    echo ERROR: Failed to initialize database.
    pause
    exit /b 1
)

echo Database initialized successfully.
echo.

echo Starting ReadDoc development server...

REM Kill any existing Next.js processes to avoid lock conflicts
echo Stopping any existing Next.js processes...
if exist ".next\dev\lock" (
    echo Removing Next.js lock file...
    del ".next\dev\lock" 2>nul
)
taskkill /f /im node.exe /fi "WINDOWTITLE eq next dev" >nul 2>&1
timeout /t 1 /nobreak >nul

REM Check if port 3000 is available, if not find next available port
echo Detecting available port...
powershell -Command "& { $port = 3000; while ((Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue).TcpTestSucceeded) { $port++ }; Write-Host $port }" > temp_port.txt 2>nul
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
call npm run dev

echo.
echo Server stopped.
pause
