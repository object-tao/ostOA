@echo off
cd /d "%~dp0"
echo Starting OSTOA TMS LAN test server...
echo.
echo Please keep this window open while colleagues are testing.
echo Local:   http://127.0.0.1:8088/
echo.
npm.cmd run dev -w apps/web -- --host 0.0.0.0 --port 5174
echo.
echo Server stopped or failed to start.
pause
