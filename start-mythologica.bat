@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\@google\genai" (
  echo Installing dependencies for the first run...
  call npm install
)

start "Mythologica Server" cmd /k "cd /d "%~dp0" && npm start"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/"
