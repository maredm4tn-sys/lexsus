@echo off
chcp 65001 >nul
title Lexsus Desktop - Build Production Installer
cd /d "%~dp0"

echo ========================================================
echo   Building Lexsus Production Executable / Installer...
echo ========================================================
echo.

call pnpm tauri build
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Retrying build with npm...
    call npm run tauri build
)

echo.
echo ========================================================
echo   Build finished!
echo   Executables are located in: src-tauri\target\release\
echo ========================================================
echo.
pause
