@echo off
setlocal
set "BASE_DIR=%~dp0"
set "VENV_PY=%BASE_DIR%venv\Scripts\python.exe"
set "SERVICE=%BASE_DIR%windows_service.py"

if not exist "%VENV_PY%" (
  echo Missing runtime: %VENV_PY%
  pause
  exit /b 1
)

if not exist "%SERVICE%" (
  echo Missing service launcher: %SERVICE%
  pause
  exit /b 1
)

"%VENV_PY%" "%SERVICE%" stop
pause
endlocal
