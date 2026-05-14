$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'C:\Program Files\nodejs\node.exe'
$psi.Arguments = '"C:\Users\Administrator\Documents\New project\scripts\serve-web.js"'
$psi.WorkingDirectory = 'C:\Users\Administrator\Documents\New project'
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $psi
$null = $process.Start()

Start-Sleep -Seconds 1

if (-not $process.HasExited) {
  $process.StandardOutput.ReadLine() | Out-File -FilePath 'C:\Users\Administrator\Documents\New project\web-static-4174.log' -Encoding utf8
}
