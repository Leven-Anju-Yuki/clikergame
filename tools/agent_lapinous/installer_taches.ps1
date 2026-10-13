# Exécuter dans PowerShell, tâche de 21h uniquement.
$Agent = Join-Path $PSScriptRoot 'agent.py'
$Python = (Get-Command py -ErrorAction Stop).Source
$Action = New-ScheduledTaskAction -Execute $Python -Argument ('"{0}" bilan --appliquer' -f $Agent) -WorkingDirectory $PSScriptRoot
$Trigger = New-ScheduledTaskTrigger -Daily -At '21:00'
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable
Register-ScheduledTask -TaskName 'Lapinous - Bilan 21h' -Action $Action -Trigger $Trigger -Settings $Settings -Description 'Mise à jour README, A_FAIRE, Trello et rapport Discord' -Force
Write-Host 'Tâche 21h créée / mise à jour. Tâche Cloudinary 20h inchangée.'
