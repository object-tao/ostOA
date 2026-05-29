@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-cloudflare.ps1"
pause
