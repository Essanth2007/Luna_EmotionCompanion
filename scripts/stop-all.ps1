<#
  .SYNOPSIS
    Stop the Luna Emotion Companion stack (AI + Backend + Communication + Frontend).

  .DESCRIPTION
    Kills the uvicorn worker processes for the AI (:8001), Backend (:8000) and
    Communication (:8002) services, plus the Next.js Frontend (:3000) dev server.
    PostgreSQL (Docker) is left running so data is preserved between sessions.
#>

$ErrorActionPreference = 'Continue'

# uvicorn workers
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | ForEach-Object {
  if ($_.CommandLine -match 'uvicorn') {
    Write-Output ("[stop] killing uvicorn pid " + $_.ProcessId + " : " + $_.CommandLine)
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

# Next.js dev server (node)
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
  if ($_.CommandLine -match 'next' -or $_.CommandLine -match 'next-server') {
    Write-Output ("[stop] killing frontend pid " + $_.ProcessId)
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

# Fallback: free the known ports if anything is still bound.
foreach ($p in @(8000, 8001, 8002, 3000)) {
  $c = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
  if ($c) {
    Stop-Process -Id $c[0].OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Write-Output 'Stack stopped (PostgreSQL left running).'
