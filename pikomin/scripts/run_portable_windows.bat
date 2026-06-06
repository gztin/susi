@echo off
setlocal
set "BASE_DIR=%~dp0"
set "RUNTIME_PY=%BASE_DIR%python\python.exe"
set "RUNTIME_PYW=%BASE_DIR%python\pythonw.exe"
set "SERVICE=%BASE_DIR%windows_service.py"

if not exist "%RUNTIME_PY%" (
  echo Missing bundled Python runtime: %RUNTIME_PY%
  pause
  exit /b 1
)

if not exist "%SERVICE%" (
  echo Missing service launcher: %SERVICE%
  pause
  exit /b 1
)

if exist "%RUNTIME_PYW%" (
  set "LAUNCH_PY=%RUNTIME_PYW%"
) else (
  set "LAUNCH_PY=%RUNTIME_PY%"
)

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Start-Process -FilePath '%LAUNCH_PY%' -ArgumentList @('%SERVICE%') -WorkingDirectory '%BASE_DIR%' -Verb RunAs -WindowStyle Hidden"
endlocal
