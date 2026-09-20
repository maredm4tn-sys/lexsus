@echo off
chcp 65001 >nul
title Lexsus Desktop - Run
cd /d "%~dp0"

echo ========================================================
echo   Starting Lexsus (AI Continuity Bridge) Desktop...
echo ========================================================
echo.
echo Checking environment...

call pnpm tauri dev
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Retrying with npm...
    call npm run tauri dev
)

echo.
pause
