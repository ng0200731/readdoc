@echo off
echo Testing port detection...

REM Check if port 3000 is available, if not find next available port
powershell -Command "& { $port = 3000; while ((Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue).TcpTestSucceeded) { $port++ }; Write-Host \"Using port: $port\" }" > temp_port.txt 2>nul
set /p START_PORT=<temp_port.txt
del temp_port.txt 2>nul

if "%START_PORT%"=="" set START_PORT=3000

echo Detected available port: %START_PORT%
echo.

REM Show current port usage
echo Current port 3000-3005 usage:
netstat -ano | findstr "300[0-5]"

pause

