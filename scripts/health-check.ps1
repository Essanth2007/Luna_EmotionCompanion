<#
  .SYNOPSIS
    Health-check the Luna Emotion Companion stack.

  .DESCRIPTION
    Verifies that each service is reachable:
      http://localhost:8000/health   (Backend)
      http://localhost:8001/health   (AI)
      http://localhost:8002/health   (Communication)
      http://localhost:3000/         (Frontend / Next.js)
#>

$ErrorActionPreference = 'Continue'

$endpoints = @(
  'http://localhost:8000/health',
  'http://localhost:8001/health',
  'http://localhost:8002/health',
  'http://localhost:3000/'
)

$allOk = $true
foreach ($url in $endpoints) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    Write-Output ("OK   " + $url + " -> " + $r.StatusCode)
  } catch {
    $allOk = $false
    Write-Output ("FAIL " + $url + " -> " + $_.Exception.Message)
  }
}

if ($allOk) {
  Write-Output ''
  Write-Output 'HEALTH CHECK: PASS'
  exit 0
} else {
  Write-Output ''
  Write-Output 'HEALTH CHECK: FAIL'
  exit 1
}
