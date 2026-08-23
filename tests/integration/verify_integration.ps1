<#
  .SYNOPSIS
    Integration smoke test for the Luna Emotion Companion stack.

  .DESCRIPTION
    Requires the stack to be running (scripts/start-all.ps1). Verifies:
      - All four services are healthy
      - Backend authentication works (login -> JWT)
      - An authenticated request to a protected endpoint succeeds
#>

$ErrorActionPreference = 'Continue'

$be    = 'http://localhost:8000'
$ai    = 'http://localhost:8001'
$comm  = 'http://localhost:8002'
$fe    = 'http://localhost:3000'

$ok = $true
function Check($label, $url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    Write-Output ("OK   " + $label + " -> " + $r.StatusCode)
  } catch {
    $script:ok = $false
    Write-Output ("FAIL " + $label + " -> " + $_.Exception.Message)
  }
}

Write-Output '--- health ---'
Check 'Backend'    ($be + '/health')
Check 'AI'         ($ai + '/health')
Check 'Comm'       ($comm + '/health')
Check 'Frontend'   $fe

Write-Output '--- auth ---'
$body = @{ email = 'qa@example.com'; password = 'secret123' } | ConvertTo-Json
try {
  $r = Invoke-RestMethod -Uri ($be + '/api/v1/auth/login') -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 10
  $token = $r.access_token
  if (-not $token) { throw 'no access_token in response' }
  Write-Output ('OK   Login -> token length ' + $token.Length)

  $hdr = @{ Authorization = ('Bearer ' + $token) }
  $r2 = Invoke-RestMethod -Uri ($be + '/api/v1/emotions/') -Method Get -Headers $hdr -TimeoutSec 10
  Write-Output 'OK   Authenticated GET /api/v1/emotions/'
} catch {
  $ok = $false
  Write-Output ('FAIL auth -> ' + $_.Exception.Message)
}

if ($ok) { Write-Output 'INTEGRATION SMOKE: PASS'; exit 0 } else { Write-Output 'INTEGRATION SMOKE: FAIL'; exit 1 }
