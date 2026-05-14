@echo off
setlocal

cd /d "%~dp0"

set "PORT=4173"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"

if exist "%NODE_EXE%" goto run

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found.
  pause
  exit /b 1
)
set "NODE_EXE=node"

:run
echo Starting preview server on http://127.0.0.1:%PORT%
start "heavy-cargo-preview" "%NODE_EXE%" "%~dp0scripts\serve-web.js"
timeout /t 2 >nul
start "" "http://127.0.0.1:%PORT%"
exit /b 0
