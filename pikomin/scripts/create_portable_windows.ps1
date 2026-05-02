param(
  [string]$PythonExe = "python",
  [string]$ProjectDir = "",
  [switch]$BuildExe
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ProjectDir)) {
  $ProjectDir = (Resolve-Path "$PSScriptRoot\..").Path
}

$OutDir = Join-Path $ProjectDir "release\pikomin-win-portable"

Write-Host "[1/6] Clean output directory..."
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Write-Host "[2/6] Build frontend..."
Push-Location (Join-Path $ProjectDir "frontend")
$env:VITE_API_URL = "http://localhost:5679"
corepack pnpm build
Pop-Location

Write-Host "[3/6] Copy runtime files..."
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "backend") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "frontend") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "docs") | Out-Null

Copy-Item -Recurse -Force (Join-Path $ProjectDir "backend\app") (Join-Path $OutDir "backend\app")
Copy-Item -Force (Join-Path $ProjectDir "backend\requirements.txt") (Join-Path $OutDir "backend\requirements.txt")
Copy-Item -Recurse -Force (Join-Path $ProjectDir "frontend\dist") (Join-Path $OutDir "frontend\dist")

if (Test-Path (Join-Path $ProjectDir "docs\使用手冊_簡易版.md")) {
  Copy-Item -Force (Join-Path $ProjectDir "docs\使用手冊_簡易版.md") (Join-Path $OutDir "docs\")
}
if (Test-Path (Join-Path $ProjectDir "docs\技術與功能介紹.md")) {
  Copy-Item -Force (Join-Path $ProjectDir "docs\技術與功能介紹.md") (Join-Path $OutDir "docs\")
}
"DOC_VERSION=$((Get-Date).ToString('yyyy-MM-dd_HH-mm-ss'))" | Out-File -Encoding utf8 (Join-Path $OutDir "docs\DOC_VERSION.txt")

Write-Host "[4/6] Create backend virtualenv..."
& $PythonExe -m venv (Join-Path $OutDir "venv")
$VenvPy = Join-Path $OutDir "venv\Scripts\python.exe"
$VenvPip = Join-Path $OutDir "venv\Scripts\pip.exe"

& $VenvPy -m pip install --upgrade pip
& $VenvPip install `
  "fastapi>=0.111.0" `
  "uvicorn[standard]>=0.29.0" `
  "pymobiledevice3>=4.14.0" `
  "httpx>=0.27.0"

Write-Host "[5/6] Create portable launchers..."
Copy-Item -Force (Join-Path $ProjectDir "scripts\run_portable_windows.bat") (Join-Path $OutDir "run.bat")
Copy-Item -Force (Join-Path $ProjectDir "scripts\run_portable_windows.ps1") (Join-Path $OutDir "run.ps1")
Copy-Item -Force (Join-Path $ProjectDir "scripts\windows_launcher.py") (Join-Path $OutDir "windows_launcher.py")

if ($BuildExe) {
  Write-Host "[5.5/6] Build PikominLauncher.exe..."
  & $VenvPip install pyinstaller
  Push-Location $OutDir
  & (Join-Path $OutDir "venv\Scripts\pyinstaller.exe") `
    --onefile `
    --name PikominLauncher `
    windows_launcher.py
  Copy-Item -Force (Join-Path $OutDir "dist\PikominLauncher.exe") (Join-Path $OutDir "PikominLauncher.exe")
  Pop-Location
}

@"
Pikomin Windows Portable
========================

How to run:
1) Open this folder
2) Double-click run.bat

Notes:
- Keep iPhone unlocked while running.
- Requires Apple drivers / iTunes components on Windows for device communication.
"@ | Out-File -Encoding utf8 (Join-Path $OutDir "README.txt")

Write-Host "[6/6] Create zip..."
$ZipPath = Join-Path $ProjectDir "release\pikomin-win-portable.zip"
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Compress-Archive -Path (Join-Path $OutDir "*") -DestinationPath $ZipPath

Write-Host "Done."
Write-Host "Portable folder: $OutDir"
Write-Host "Zip file: $ZipPath"
