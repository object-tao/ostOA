@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\configure-cloudflare-token.ps1"
pause
