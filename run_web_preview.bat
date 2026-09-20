@echo off
chcp 65001 >nul
title Lexsus Web UI Preview
cd /d "%~dp0"

echo ========================================================
echo   Starting Vite UI Server at http://localhost:1420 ...
echo ========================================================
echo.

start http://localhost:1420
call pnpm run dev
if %errorlevel% neq 0 (
    call npm run dev
)

pause
