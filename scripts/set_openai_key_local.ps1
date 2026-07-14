param(
  [string]$ApiKey = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvPath = Join-Path $Root ".env"

if (-not $ApiKey) {
  $secure = Read-Host "OpenAI API Key를 입력하세요" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $ApiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

if (-not $ApiKey -or -not $ApiKey.Trim()) {
  throw "OPENAI_API_KEY 값이 비어 있습니다."
}

$lines = @()
if (Test-Path $EnvPath) {
  $lines = Get-Content -LiteralPath $EnvPath -Encoding UTF8 |
    Where-Object { $_ -notmatch "^\s*OPENAI_API_KEY\s*=" -and $_ -notmatch "^\s*OPENAI_MODEL\s*=" -and $_ -notmatch "^\s*OPENAI_REASONING_EFFORT\s*=" }
}

$lines += "OPENAI_API_KEY=$($ApiKey.Trim())"
$lines += "OPENAI_MODEL=gpt-5.5"
$lines += "OPENAI_REASONING_EFFORT=low"

Set-Content -LiteralPath $EnvPath -Encoding UTF8 -Value $lines
Write-Host ".env 파일에 OpenAI 설정을 저장했습니다."
Write-Host "이제 로컬 서버를 재시작하면 실제 AI 요약이 켜집니다."
