<#
  .SYNOPSIS
    Start the full Luna Emotion Companion stack (AI + Backend + Communication + Frontend).

  .DESCRIPTION
    Launches PostgreSQL (via Docker), the Emotion AI Service (:8001), the Backend
    API (:8000), the Communication Service (:8002) and the Next.js Frontend (:3000).
    Each service runs in its own detached process and logs to a *.log file.

    All paths are resolved relative to this script (PSScriptRoot) so the stack can be
    launched from any machine / directory without hard-coded absolute paths.
#>

$ErrorActionPreference = 'Continue'

# Resolve the integrated project root relative to this script.
# This script lives in <root>/scripts, so the repo root is the parent.
$Root = Split-Path $PSScriptRoot -Parent

# Module locations (relative to the integrated monorepo root).
$AI = Join-Path $Root 'services/ai/emotion-ai-service'
$BE = Join-Path $Root 'services/backend/backend'
$CO = Join-Path $Root 'services/communication'
$FE = Join-Path $Root 'frontend'

# Keep TensorFlow quieter / faster on CPU
$env:TF_ENABLE_ONEDNN_OPTS = 0
$env:TF_CPP_MIN_LOG_LEVEL  = 3

# Share the integration secret with every spawned service/worker.
# python-dotenv does NOT override variables already present in the environment,
# and the uvicorn worker processes are launched in a context where the modules'
# own .env may not be resolved -- so export SECRET_KEY/ALGORITHM explicitly from
# the backend .env. This keeps Backend <-> Communication JWT auth consistent.
$beEnvPath = Join-Path $BE '.env'
if (Test-Path $beEnvPath) {
  $envLines = Get-Content $beEnvPath
  $sec = ($envLines | Where-Object { $_ -match '^SECRET_KEY=' } | Select-Object -First 1)
  $alg = ($envLines | Where-Object { $_ -match '^ALGORITHM=' } | Select-Object -First 1)
  if ($sec) { $env:SECRET_KEY = $sec.Split('=', 2)[1].Trim() }
  if ($alg) { $env:ALGORITHM = $alg.Split('=', 2)[1].Trim() }
}

function Start-Svc($name, $venv, $dir, $module, $port, $log) {
  $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  if ($conn) {
    $pid = $conn[0].OwningProcess
    Write-Output "[$name] already running on :$port (pid $pid)"
    return
  }
  Start-Process -FilePath (Join-Path $venv 'Scripts\python.exe') `
    -ArgumentList '-m', 'uvicorn', $module, '--host', '0.0.0.0', '--port', $port `
    -WorkingDirectory $dir `
    -RedirectStandardOutput ($log + '.out') -RedirectStandardError ($log + '.err') `
    -WindowStyle Hidden
  Write-Output "[$name] starting on :$port (logs: $log.out / $log.err)"
}

# PostgreSQL (Docker)
$pg = docker ps --filter 'name=luna-postgres' --format '{{.Names}}' 2>$null
if (-not $pg) {
  Write-Output '[postgres] container not running -- starting it...'
  docker start luna-postgres 2>$null
  if (-not $?) {
    docker run -d --name luna-postgres -p 5432:5432 `
      -e POSTGRES_DB=luna -e POSTGRES_USER=luna -e POSTGRES_PASSWORD=luna `
      -v luna_pgdata:/var/lib/postgresql/data postgres:16-alpine
  }
  Start-Sleep -Seconds 6
}

# Services
Start-Svc 'AI'       (Join-Path $AI '.venv-ai')      $AI 'main:app'     8001 (Join-Path $AI 'ai')
Start-Svc 'Backend'  (Join-Path $BE '.venv-backend') $BE 'app.main:app' 8000 (Join-Path $BE 'backend')
Start-Svc 'Comm'     (Join-Path $CO '.venv-comm')    $CO 'communication.main:app' 8002 (Join-Path $CO 'comm')

# Frontend (Next.js dev)
# Launch through cmd so that `npm` (npm.cmd / npm.ps1) resolves via PATH on
# any machine instead of relying on Start-Process locating a bare executable.
$feconn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $feconn) {
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev' `
    -WorkingDirectory $FE -RedirectStandardOutput (Join-Path $FE 'fe.out') -RedirectStandardError (Join-Path $FE 'fe.err') `
    -WindowStyle Hidden
  Write-Output "[Frontend] starting on :3000 (logs: $FE\fe.out / $FE\fe.err)"
} else {
  Write-Output ('[Frontend] already running on :3000 (pid ' + $feconn[0].OwningProcess + ')')
}

Write-Output ''
Write-Output 'Stack launched. Open http://localhost:3000 in your browser.'
Write-Output '  Frontend  :3000   Backend :8000/api/v1   AI :8001   Communication :8002'
Write-Output '  First AI start downloads the wav2vec2 model (~once).'
