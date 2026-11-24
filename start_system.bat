@echo off
title AegisCrop Enterprise - Smart Irrigation Platform
color 0A

echo ==============================================================================
echo           AEGISCROP OS - ENTERPRISE SMART IRRIGATION SYSTEM
echo               Precision Agronomic IoT Control & ML Engine
echo ==============================================================================
echo.
echo Starting FastAPI Backend + Production Frontend on http://127.0.0.1:8000 ...
echo.
echo [1/2] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo [2/2] Launching AegisCrop Core Engine...
cd /d "%~dp0backend"
start http://127.0.0.1:8000
python run_backend.py

pause
