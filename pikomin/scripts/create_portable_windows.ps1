param(
  [string]$PythonExe = "python",
  [string]$ProjectDir = "",
  [string]$NodeExe = "",
  [switch]$BuildExe
)

$ErrorActionPreference = "Stop"

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
  }
}

if ([string]::IsNullOrWhiteSpace($ProjectDir)) {
  $ProjectDir = (Resolve-Path "$PSScriptRoot\..").Path
}

$OutDir = Join-Path $ProjectDir "release\pikomin-win-portable"

Write-Host "[1/6] Clean output directory..."
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Write-Host "[2/6] Build frontend..."
Push-Location (Join-Path $ProjectDir "frontend")
$env:VITE_API_URL = ""
$NpmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
$Npm = Get-Command npm -ErrorAction SilentlyContinue
function Invoke-NodeBuild {
  if ([string]::IsNullOrWhiteSpace($NodeExe)) {
    $NodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($NodeCmd) { $NodeExe = $NodeCmd.Source }
  }
  if ([string]::IsNullOrWhiteSpace($NodeExe) -or !(Test-Path $NodeExe)) {
    throw "Node.js/npm not found. Pass -NodeExe C:\path\to\node.exe or install Node.js."
  }
  Invoke-Native $NodeExe ".\node_modules\typescript\bin\tsc" -p ".\tsconfig.json"
  Invoke-Native $NodeExe ".\node_modules\vite\bin\vite.js" build
}

try {
  if (-not [string]::IsNullOrWhiteSpace($NodeExe)) {
    Invoke-NodeBuild
  } elseif ($NpmCmd) {
    Invoke-Native $NpmCmd.Source run build
  } elseif ($Npm) {
    Invoke-Native $Npm.Source run build
  } else {
    Invoke-NodeBuild
  }
} catch {
  Write-Host "npm build unavailable, falling back to direct node build..."
  Invoke-NodeBuild
}
Pop-Location

Write-Host "[3/6] Copy runtime files..."
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "backend") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "frontend") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "docs") | Out-Null

Copy-Item -Recurse -Force (Join-Path $ProjectDir "backend\app") (Join-Path $OutDir "backend\app")
Copy-Item -Force (Join-Path $ProjectDir "backend\requirements.txt") (Join-Path $OutDir "backend\requirements.txt")
Copy-Item -Recurse -Force (Join-Path $ProjectDir "frontend\dist") (Join-Path $OutDir "frontend\dist")
Copy-Item -Force (Join-Path $ProjectDir "docs\*.md") (Join-Path $OutDir "docs\") -ErrorAction SilentlyContinue
"DOC_VERSION=$((Get-Date).ToString('yyyy-MM-dd_HH-mm-ss'))" | Out-File -Encoding utf8 (Join-Path $OutDir "docs\DOC_VERSION.txt")

Write-Host "[4/6] Create backend virtualenv..."
Invoke-Native $PythonExe -m venv (Join-Path $OutDir "venv")
$VenvPy = Join-Path $OutDir "venv\Scripts\python.exe"
$VenvPip = Join-Path $OutDir "venv\Scripts\pip.exe"

Invoke-Native $VenvPy -m pip install --upgrade pip
Invoke-Native $VenvPip install `
  "fastapi>=0.111.0" `
  "uvicorn[standard]>=0.29.0" `
  "pymobiledevice3>=4.14.0" `
  "httpx>=0.27.0"

Write-Host "[5/6] Create portable launchers..."
Copy-Item -Force (Join-Path $ProjectDir "scripts\run_portable_windows.bat") (Join-Path $OutDir "run.bat")
Copy-Item -Force (Join-Path $ProjectDir "scripts\run_portable_windows.ps1") (Join-Path $OutDir "run.ps1")
Copy-Item -Force (Join-Path $ProjectDir "scripts\stop_portable_windows.bat") (Join-Path $OutDir "stop.bat")
Copy-Item -Force (Join-Path $ProjectDir "scripts\windows_launcher.py") (Join-Path $OutDir "windows_launcher.py")
Copy-Item -Force (Join-Path $ProjectDir "scripts\windows_service.py") (Join-Path $OutDir "windows_service.py")

if ($BuildExe) {
  Write-Host "[5.5/6] Build PikominLauncher.exe..."
  Invoke-Native $VenvPip install pyinstaller
  Push-Location $OutDir
  Invoke-Native (Join-Path $OutDir "venv\Scripts\pyinstaller.exe") `
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
3) Allow the Windows administrator permission prompt

Notes:
- Keep iPhone unlocked while running.
- Requires Apple drivers / iTunes components on Windows for device communication.
- Administrator permission is required to start pymobiledevice3 tunneld.
- The app opens at http://localhost:5679.
- run.bat starts tunneld and the app server in the background.
- Double-click stop.bat to stop Pikomin.
"@ | Out-File -Encoding utf8 (Join-Path $OutDir "README.txt")

Write-Host "[6/6] Create zip..."
$ZipPath = Join-Path $ProjectDir "release\pikomin-win-portable.zip"
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Compress-Archive -Path (Join-Path $OutDir "*") -DestinationPath $ZipPath

Write-Host "Done."
Write-Host "Portable folder: $OutDir"
Write-Host "Zip file: $ZipPath"
