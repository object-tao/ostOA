Set-Location -LiteralPath $PSScriptRoot

Write-Host "Starting OSTOA TMS LAN test server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Please keep this window open while colleagues are testing."
Write-Host "Local:   http://127.0.0.1:5174/"
Write-Host "Network: http://192.168.1.6:5174/"
Write-Host ""

npm.cmd run dev -w apps/web -- --host 0.0.0.0 --port 5174

Write-Host ""
Write-Host "Server stopped or failed to start." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
