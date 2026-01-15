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
echo.
echo ========================================
echo   Server will start at: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev

echo.
echo Server stopped.
pause
