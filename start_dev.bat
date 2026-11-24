@echo off
title AegisCrop Dev Server (Backend + Vite Frontend)
color 0B

echo ==============================================================================
echo              AEGISCROP OS - DEVELOPMENT MODE (HOT RELOAD)
echo ==============================================================================
echo.
echo Starting Backend on http://127.0.0.1:8000 ...
cd /d "%~dp0backend"
start "AegisCrop Backend" python run_backend.py

echo Starting Frontend Vite Dev Server on http://localhost:5173 ...
cd /d "%~dp0frontend"
start "AegisCrop Frontend" npm run dev

timeout /t 3 >nul
start http://localhost:5173
echo Dev servers running!
