[CmdletBinding()]
param(
    [int]$Port = 4174,
    [int]$StartupTimeoutSeconds = 25
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$baseUrl = "http://localhost:$Port"

function Get-PortalHealth {
    param([string]$Url)

    try {
        # Cold local starts can take several seconds while Python imports parsers.
        $health = Invoke-RestMethod -Uri "$Url/api/health" -TimeoutSec 10 -ErrorAction Stop
        if ($health.ok -eq $true) {
            return $health
        }
    }
    catch {
        return $null
    }

    return $null
}

function Write-Ready {
    param($Health)

    $version = if ($Health.version) { $Health.version } else { "unknown" }
    Write-Output "PORTAL_READY=$baseUrl"
    Write-Output "PORTAL_VERSION=$version"
}

$existingHealth = Get-PortalHealth -Url $baseUrl
if ($null -ne $existingHealth) {
    Write-Ready -Health $existingHealth
    exit 0
}

# Never terminate an unknown process that happens to own the selected port.
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
if ($null -ne $listener) {
    throw "Port $Port is already in use by another process. It was not stopped. Check $baseUrl in the browser or choose a different port."
}

$pythonCandidates = @(
    (Join-Path $root ".venv\\Scripts\\python.exe"),
    (Join-Path $env:USERPROFILE ".cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe")
)
$python = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $python) {
    $systemPython = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($systemPython) {
        $python = $systemPython.Source
    }
}
if (-not $python) {
    throw "Python was not found. Install Python or create the project .venv before starting the portal."
}

$previousPort = $env:PORT
$env:PORT = "$Port"
try {
    $process = Start-Process -FilePath $python -ArgumentList "start_local_server.py" -WorkingDirectory $root -WindowStyle Hidden -PassThru
}
finally {
    $env:PORT = $previousPort
}

$deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
do {
    Start-Sleep -Milliseconds 500
    $health = Get-PortalHealth -Url $baseUrl
    if ($null -ne $health) {
        Write-Ready -Health $health
        exit 0
    }
} while ((Get-Date) -lt $deadline)

throw "Battery Data Portal did not become healthy within $StartupTimeoutSeconds seconds. Check $root\\fastapi.err.log (PID $($process.Id))."
