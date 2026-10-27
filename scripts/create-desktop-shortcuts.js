const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const desktopPath = path.join(os.homedir(), 'Desktop');
const rootDir = path.resolve(__dirname, '..');
const iconPath = path.join(rootDir, 'public', 'favicon.ico');

console.log('Target Desktop:', desktopPath);

// 1. Create .url file (standard Windows Internet Shortcut)
const urlContent = `[InternetShortcut]
URL=http://localhost:3000
IconIndex=0
IconFile=${iconPath}
`;

const urlFilePath = path.join(desktopPath, 'Water Factory ERP.url');
fs.writeFileSync(urlFilePath, urlContent, 'utf-8');
console.log('Created:', urlFilePath);

// 2. Create launcher batch file in project directory
const batContent = `@echo off
title Pure Water Factory ERP Launcher
cd /d "${rootDir}"

echo ========================================================
echo    Pure Water Factory ERP (សហគ្រាសទឹកបរិសុទ្ធ)
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

if exist "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --app=http://localhost:3000
) else if exist "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

exit
`;

const batFilePath = path.join(rootDir, 'start-erp.bat');
fs.writeFileSync(batFilePath, batContent, 'ascii');
console.log('Created:', batFilePath);

// 3. Create Windows .lnk shortcuts using VBScript
const vbsScript = `
Set WshShell = CreateObject("WScript.Shell")

' Standalone Chrome/Edge App Shortcut
Dim chromePath, edgePath, browserPath
chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"

Set fso = CreateObject("Scripting.FileSystemObject")
If fso.FileExists(chromePath) Then
    browserPath = chromePath
ElseIf fso.FileExists(edgePath) Then
    browserPath = edgePath
Else
    browserPath = "${batFilePath.replace(/\\/g, '\\\\')}"
End If

' Shortcut 1: Direct App Window
Set scApp = WshShell.CreateShortcut("${path.join(desktopPath, 'Water-ERP.lnk').replace(/\\/g, '\\\\')}")
If browserPath = chromePath Or browserPath = edgePath Then
    scApp.TargetPath = browserPath
    scApp.Arguments = "--app=http://localhost:3000"
Else
    scApp.TargetPath = browserPath
End If
scApp.Description = "Pure Water Factory ERP & POS"
scApp.WorkingDirectory = "${rootDir.replace(/\\/g, '\\\\')}"
scApp.IconLocation = "${iconPath.replace(/\\/g, '\\\\')},0"
scApp.Save

' Shortcut 2: One-click Start & Open Launcher
Set scLaunch = WshShell.CreateShortcut("${path.join(desktopPath, 'Start-Water-ERP.lnk').replace(/\\/g, '\\\\')}")
scLaunch.TargetPath = "${batFilePath.replace(/\\/g, '\\\\')}"
scLaunch.Description = "Start Pure Water Factory ERP Server and App"
scLaunch.WorkingDirectory = "${rootDir.replace(/\\/g, '\\\\')}"
scLaunch.IconLocation = "${iconPath.replace(/\\/g, '\\\\')},0"
scLaunch.WindowStyle = 7
scLaunch.Save

WScript.Echo "LNK shortcuts created successfully!"
`;

const vbsPath = path.join(rootDir, 'scratch', 'make-shortcuts.vbs');
if (!fs.existsSync(path.join(rootDir, 'scratch'))) {
  fs.mkdirSync(path.join(rootDir, 'scratch'), { recursive: true });
}
fs.writeFileSync(vbsPath, vbsScript, 'utf-8');

try {
  execSync(`cscript //nologo "${vbsPath}"`, { stdio: 'inherit' });
  console.log('All desktop shortcuts created successfully!');
} catch (err) {
  console.error('Failed to run VBScript:', err.message);
}
