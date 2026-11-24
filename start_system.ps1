# AegisCrop OS - Enterprise Launch Script (PowerShell)
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "          AEGISCROP OS - ENTERPRISE SMART IRRIGATION SYSTEM" -ForegroundColor White
Write-Host "              Precision Agronomic IoT Control & ML Engine" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Launching Enterprise Platform on http://127.0.0.1:8000 ..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\backend"

Start-Process "http://127.0.0.1:8000"
python run_backend.py
