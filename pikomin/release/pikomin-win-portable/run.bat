@echo off
setlocal
set "BASE_DIR=%~dp0"
set "VENV_PY=%BASE_DIR%venv\Scripts\python.exe"
set "PMD3_EXE=%BASE_DIR%venv\Scripts\pymobiledevice3.exe"
set "LOG_DIR=%BASE_DIR%logs"
if "%BACKEND_PORT%"=="" set "BACKEND_PORT=5679"
set "FRONTEND_DIST_DIR=%BASE_DIR%frontend\dist"
set "HOST_BRIDGE_URL="
set "PMD3_PATH=%PMD3_EXE%"

net session >nul 2>&1
if not "%errorlevel%"=="0" (
  echo Pikomin needs administrator privileges to start the iOS tunnel.
  echo A Windows permission prompt will open now.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
  exit /b
)

if not exist "%VENV_PY%" (
  echo Missing runtime: %VENV_PY%
  pause
  exit /b 1
)

if not exist "%PMD3_EXE%" (
  echo Missing pymobiledevice3 runtime: %PMD3_EXE%
  pause
  exit /b 1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo Starting tunnel...
start "Pikomin Tunnel" /min cmd /c ""%VENV_PY%" -m pymobiledevice3 remote tunneld --protocol tcp > "%LOG_DIR%\tunneld.log" 2> "%LOG_DIR%\tunneld.err.log""

echo Starting app server...
start "Pikomin App" /min cmd /c "cd /d "%BASE_DIR%backend" && set "FRONTEND_DIST_DIR=%FRONTEND_DIST_DIR%" && set "HOST_BRIDGE_URL=" && set "PMD3_PATH=%PMD3_PATH%" && "%VENV_PY%" -m uvicorn app.main:app --host 0.0.0.0 --port %BACKEND_PORT% > "%LOG_DIR%\backend.log" 2> "%LOG_DIR%\backend.err.log""

echo Waiting for app server...
ping -n 8 127.0.0.1 > nul

echo Opening http://localhost:%BACKEND_PORT%
start "" "http://localhost:%BACKEND_PORT%"

echo.
echo Pikomin is starting.
echo Logs are in: %LOG_DIR%
echo If the browser says it cannot connect, wait a few seconds and refresh.
echo You can close this window.
endlocal
