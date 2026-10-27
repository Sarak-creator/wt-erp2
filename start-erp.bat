@echo off
title Pure Water Factory ERP Launcher
cd /d "E:\wt-erp"

echo ========================================================
echo    Pure Water Factory ERP (Ÿ ‚Òš¶Ÿ‘¹€”š·Ÿ»‘Ò’)
echo ========================================================
echo.

netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [INFO] ERP Server is already running on port 3000!
) else (
    echo [INFO] Starting Next.js Dev Server in background...
    start "WT-ERP Server" /min cmd /c "npm run dev"
    echo [INFO] Waiting for server initialization...
    timeout /t 5 /nobreak >nul
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

exit
