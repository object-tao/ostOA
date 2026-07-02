Set-Location -LiteralPath $PSScriptRoot

Write-Host "Starting OSTOA TMS LAN test server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Please keep this window open while colleagues are testing."
Write-Host "Local:   http://127.0.0.1:5174/"
Write-Host "Network: http://192.168.1.6:5174/"
Write-Host ""

function Test-LocalPort {
  param([int]$Port)
  try {
    $client = New-Object Net.Sockets.TcpClient
    $async = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connected = $async.AsyncWaitHandle.WaitOne(500)
    if ($connected) {
      $client.EndConnect($async)
    }
    $client.Close()
    return $connected
  } catch {
    return $false
  }
}

if (Test-LocalPort 8787) {
  Write-Host "API already running: http://127.0.0.1:8787/" -ForegroundColor Green
} else {
  Write-Host "Starting API: http://127.0.0.1:8787/" -ForegroundColor Cyan
  Start-Process -FilePath powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$PSScriptRoot`"; npm.cmd run dev -w apps/api"
  ) -WindowStyle Hidden
  Start-Sleep -Seconds 5
}

npm.cmd run dev -w apps/web -- --host 0.0.0.0 --port 5174

Write-Host ""
Write-Host "Server stopped or failed to start." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
