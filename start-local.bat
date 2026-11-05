@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE=node"
where node.exe >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
  ) else (
    echo Node.js 20 or newer is required. Install Node.js and try again.
    pause
    exit /b 1
  )
)
"%NODE_EXE%" "%~dp0assets\js\server\start-local.js"
if errorlevel 1 pause
endlocal
