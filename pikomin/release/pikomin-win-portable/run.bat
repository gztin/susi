@echo off
setlocal
set "BASE_DIR=%~dp0"
set "VENV_PY=%BASE_DIR%venv\Scripts\python.exe"
set "VENV_PYW=%BASE_DIR%venv\Scripts\pythonw.exe"
set "RUNTIME_PY=%BASE_DIR%python\python.exe"
set "RUNTIME_PYW=%BASE_DIR%python\pythonw.exe"
set "SERVICE=%BASE_DIR%windows_service.py"

if exist "%VENV_PY%" (
  set "PYTHON_EXE=%VENV_PY%"
  set "PYTHONW_EXE=%VENV_PYW%"
) else (
  set "PYTHON_EXE=%RUNTIME_PY%"
  set "PYTHONW_EXE=%RUNTIME_PYW%"
)

if not exist "%PYTHON_EXE%" (
  echo Missing runtime: %PYTHON_EXE%
  pause
  exit /b 1
)

if not exist "%SERVICE%" (
  echo Missing service launcher: %SERVICE%
  pause
  exit /b 1
)

if exist "%PYTHONW_EXE%" (
  set "LAUNCH_PY=%PYTHONW_EXE%"
) else (
  set "LAUNCH_PY=%PYTHON_EXE%"
)

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Start-Process -FilePath '%LAUNCH_PY%' -ArgumentList @('%SERVICE%') -WorkingDirectory '%BASE_DIR%' -Verb RunAs -WindowStyle Hidden"
endlocal
