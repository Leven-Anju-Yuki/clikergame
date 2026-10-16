# À lancer dans PowerShell, depuis tools\agent_lapinous.
$ErrorActionPreference = 'Stop'
$Script = Join-Path $PSScriptRoot 'surveillance_batterie.py'
if (-not (Test-Path $Script)) { throw "Script introuvable : $Script" }
$Python = (Get-Command python -ErrorAction Stop).Source
$Action = New-ScheduledTaskAction -Execute $Python -Argument ('"{0}"' -f $Script) -WorkingDirectory $PSScriptRoot
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 3) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Lapinous - Surveillance batterie' -Action $Action -Trigger $Trigger -Settings $Settings -Description 'Batterie Warrenfall : contrôle adaptatif, alertes Discord uniques à 30/25/20/15 %' -Force | Out-Null
Write-Host 'Surveillance batterie installée. Tâches Cloudinary et bilan inchangées.'
