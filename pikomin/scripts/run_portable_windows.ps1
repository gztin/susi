$ErrorActionPreference = "Stop"
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPy = Join-Path $BaseDir "venv\Scripts\python.exe"
$BackendPort = $env:BACKEND_PORT
if ([string]::IsNullOrWhiteSpace($BackendPort)) { $BackendPort = "5679" }
$FrontendPort = $env:FRONTEND_PORT
if ([string]::IsNullOrWhiteSpace($FrontendPort)) { $FrontendPort = "5678" }

if (!(Test-Path $VenvPy)) {
  Write-Host "Missing runtime: $VenvPy"
  exit 1
}

Write-Host "Starting tunnel (TCP)..."
Start-Process -FilePath $VenvPy -ArgumentList "-m pymobiledevice3 remote tunneld --protocol tcp" -WindowStyle Normal

Write-Host "Starting backend..."
Start-Process -FilePath $VenvPy -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port $BackendPort" -WorkingDirectory (Join-Path $BaseDir "backend") -WindowStyle Normal

Write-Host "Starting static frontend server..."
Start-Process -FilePath $VenvPy -ArgumentList "-m http.server $FrontendPort" -WorkingDirectory (Join-Path $BaseDir "frontend\dist") -WindowStyle Normal

Write-Host "Open: http://localhost:$FrontendPort"
