# Exécuter depuis PowerShell dans tools/agent_lapinous.
# Sans option : installe UNIQUEMENT le bilan de 21 h.
# Avec -InstallerCloudinary : installe aussi la synchronisation de 20 h,
# uniquement si aucune autre tâche Cloudinary existante n'est détectée.
param([switch]$InstallerCloudinary)
$ErrorActionPreference = 'Stop'
$Python = (Get-Command py -ErrorAction Stop).Source
$Agent = Join-Path $PSScriptRoot 'agent.py'
$Action = New-ScheduledTaskAction -Execute $Python -Argument ('"{0}" bilan --appliquer' -f $Agent) -WorkingDirectory $PSScriptRoot
$Trigger = New-ScheduledTaskTrigger -Daily -At '21:00'
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Lapinous - Bilan 21h' -Action $Action -Trigger $Trigger -Settings $Settings -Description 'Bilan Git, Trello, Cloudinary, Discord à 21 h' -Force | Out-Null
Write-Host 'Bilan 21 h : tâche installée ou actualisée.'
if ($InstallerCloudinary) {
  $existing = Get-ScheduledTask | Where-Object {
    $_.TaskName -ne 'Lapinous - Cloudinary 20h' -and
    ($_.TaskName -match 'cloudinary|synchronis.*image' -or (($_.Actions | Out-String) -match 'Synchroniser les images|update-images\.mjs|synchronisation_20h'))
  }
  if ($existing) {
    Write-Warning 'Autre tâche de synchronisation détectée. Installation de 20 h refusée pour éviter deux transferts simultanés.'
    $existing | Select-Object TaskName, State | Format-Table
    exit 2
  }
  $Powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
  $Script = Join-Path $PSScriptRoot 'synchronisation_20h.ps1'
  $Action20 = New-ScheduledTaskAction -Execute $Powershell -Argument ('-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $Script) -WorkingDirectory $PSScriptRoot
  $Trigger20 = New-ScheduledTaskTrigger -Daily -At '20:00'
  Register-ScheduledTask -TaskName 'Lapinous - Cloudinary 20h' -Action $Action20 -Trigger $Trigger20 -Settings $Settings -Description 'Cloudinary, sauvegarde et corbeille 7 jours' -Force | Out-Null
  Write-Host 'Cloudinary 20 h : tâche installée.'
} else {
  Write-Host 'Tâche Cloudinary 20 h existante laissée inchangée.'
  Write-Host 'Attention : si elle lance encore le .cmd avec PAUSE, il faut modifier son action pour utiliser synchronisation_20h.ps1.'
}
