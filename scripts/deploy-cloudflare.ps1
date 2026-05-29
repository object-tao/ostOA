param(
  [switch]$SkipMigration,
  [switch]$SkipApi,
  [switch]$SkipWeb
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $env:CLOUDFLARE_API_TOKEN) {
  $userToken = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "User")
  if ($userToken) {
    $env:CLOUDFLARE_API_TOKEN = $userToken
  }
}

if (-not $env:CLOUDFLARE_API_TOKEN) {
  throw "CLOUDFLARE_API_TOKEN was not found. Run: powershell -ExecutionPolicy Bypass -File scripts/configure-cloudflare-token.ps1"
}

Write-Host "Building API..." -ForegroundColor Cyan
npm.cmd run build -w apps/api

Write-Host "Building Web..." -ForegroundColor Cyan
npm.cmd run build -w apps/web

if (-not $SkipMigration) {
  Write-Host "Applying remote D1 migrations..." -ForegroundColor Cyan
  npm.cmd run db:migrate:remote -w apps/api
}

if (-not $SkipApi) {
  Write-Host "Deploying API Worker..." -ForegroundColor Cyan
  npx.cmd wrangler deploy --config apps/api/wrangler.toml --keep-vars
}

if (-not $SkipWeb) {
  Write-Host "Deploying Web Pages..." -ForegroundColor Cyan
  npx.cmd wrangler pages deploy apps/web/dist --project-name=ostoa-web
}

Write-Host "Cloudflare deployment completed." -ForegroundColor Green
