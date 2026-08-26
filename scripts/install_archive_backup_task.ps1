param(
    [Parameter(Mandatory = $true)]
    [string]$PortalUrl,
    [Parameter(Mandatory = $true)]
    [string]$ArchiveRoot,
    [string]$DeviceId = "battery-workspace",
    [string]$TaskName = "Battery Portal Raw Data Backup"
)

$ErrorActionPreference = "Stop"
if ($PortalUrl -match "[`r`n]" -or $ArchiveRoot -match "[`r`n]" -or $DeviceId -match "[`r`n]") {
    throw "설정값에는 줄바꿈을 넣을 수 없습니다."
}
if ($DeviceId -notmatch "^[A-Za-z0-9._-]{1,80}$") {
    throw "DeviceId는 영문, 숫자, 점, 밑줄, 대시만 사용할 수 있습니다."
}

$agentScript = Join-Path $PSScriptRoot "archive_agent.py"
$projectRoot = Split-Path $PSScriptRoot -Parent
$venvPython = Join-Path $projectRoot ".venv\Scripts\python.exe"
if (Test-Path -LiteralPath $venvPython) {
    $pythonExecutable = (Resolve-Path -LiteralPath $venvPython).Path
} else {
    $pythonExecutable = (Get-Command python.exe -ErrorAction Stop).Source
}

$secureToken = Read-Host "Render의 ARCHIVE_AGENT_TOKEN과 같은 값을 입력하세요" -AsSecureString
$tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try {
    $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer)
}
if ([string]::IsNullOrWhiteSpace($plainToken) -or $plainToken -match "[`r`n]") {
    throw "ARCHIVE_AGENT_TOKEN이 비어 있거나 올바르지 않습니다."
}

$configDirectory = Join-Path $env:LOCALAPPDATA "BatteryPortal"
$configPath = Join-Path $configDirectory "archive-agent.env"
New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $ArchiveRoot -Force | Out-Null
$configLines = @(
    "PORTAL_URL=$($PortalUrl.TrimEnd('/'))"
    "ARCHIVE_AGENT_TOKEN=$plainToken"
    "ARCHIVE_ROOT=$ArchiveRoot"
    "ARCHIVE_DEVICE_ID=$DeviceId"
)
[IO.File]::WriteAllLines($configPath, $configLines, [Text.UTF8Encoding]::new($false))
$plainToken = $null

$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$acl = New-Object Security.AccessControl.FileSecurity
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object Security.AccessControl.FileSystemAccessRule(
    $identity,
    [Security.AccessControl.FileSystemRights]::FullControl,
    [Security.AccessControl.AccessControlType]::Allow
)
$acl.AddAccessRule($rule)
Set-Acl -LiteralPath $configPath -AclObject $acl

$arguments = '"{0}" --config "{1}" --limit 20' -f $agentScript, $configPath
$action = New-ScheduledTaskAction -Execute $pythonExecutable -Argument $arguments
$repeatingTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
$logonTrigger = New-ScheduledTaskTrigger -AtLogOn -User $identity
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger @($repeatingTrigger, $logonTrigger) `
    -Settings $settings `
    -Description "Battery Portal B2 raw artifacts: verified local workspace backup" `
    -Force | Out-Null

Start-ScheduledTask -TaskName $TaskName
Write-Host "자동 백업 작업을 등록했습니다: $TaskName"
Write-Host "백업 폴더: $ArchiveRoot"
Write-Host "설정 파일: $configPath (현재 Windows 사용자만 접근 가능)"
