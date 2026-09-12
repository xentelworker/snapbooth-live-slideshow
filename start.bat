@echo off
setlocal
cd /d "%~dp0"
title SnapBooth Live Slideshow

echo.
echo ========================================
echo   SnapBooth Live Slideshow
 echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install the current Node.js LTS from https://nodejs.org/
  echo Then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First run: installing required packages...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)

start "" "http://127.0.0.1:8787"
node server.js

pause
