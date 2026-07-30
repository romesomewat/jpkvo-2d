@echo off
set PORT=8765
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "" /B python -m http.server %PORT% --bind 127.0.0.1
  timeout /t 2 >nul
  start "" http://127.0.0.1:%PORT%/index.html
) else (
  start "" "%~dp0index.html"
)
