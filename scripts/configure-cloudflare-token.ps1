param(
  [string]$Token
)

$ErrorActionPreference = "Stop"

if (-not $Token) {
  $secureToken = Read-Host "Enter Cloudflare API Token (input is hidden)" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
  try {
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

if (-not $Token -or $Token.Trim().Length -lt 20) {
  throw "Cloudflare API Token looks invalid. Please run this script again."
}

[Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", $Token.Trim(), "User")
$env:CLOUDFLARE_API_TOKEN = $Token.Trim()

Write-Host "Cloudflare API Token saved to the current Windows user environment." -ForegroundColor Green
Write-Host "New PowerShell/Codex sessions can read it automatically. Current shell is also updated." -ForegroundColor Green
