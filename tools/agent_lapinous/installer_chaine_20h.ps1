$ErrorActionPreference = 'Stop'
$taskName = 'Lapinous - Images Cloudinary 20h'
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
$script = Join-Path $PSScriptRoot 'chaine_20h.ps1'
$sync = Join-Path $PSScriptRoot 'synchronisation_20h.ps1'
if (-not (Test-Path $script) -or -not (Test-Path $sync) -or -not (Test-Path (Join-Path $PSScriptRoot 'agent.py'))) {
    throw 'Fichiers manquants : placer les deux nouveaux .ps1 avec synchronisation_20h.ps1 et agent.py.'
}
Write-Host 'Action actuelle :' -ForegroundColor Cyan
$task.Actions | Format-List Execute,Arguments,WorkingDirectory
Write-Host 'ATTENTION : verifier que cette action ne lance pas deja le bilan.' -ForegroundColor Yellow
$answer = Read-Host 'Remplacer cette action par la chaine Cloudinary puis bilan ? (O/N)'
if ($answer -ne 'O') { Write-Host 'Annule. Rien de modifie.'; exit }
$backup = Join-Path $PSScriptRoot ('sauvegarde_tache_20h_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.xml')
Export-ScheduledTask -TaskName $taskName | Set-Content -Path $backup -Encoding Unicode
$exe = (Get-Command powershell.exe -ErrorAction Stop).Source
$action = New-ScheduledTaskAction -Execute $exe -Argument ('-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $script) -WorkingDirectory $PSScriptRoot
$settings = $task.Settings
$settings.WakeToRun = $true
$settings.MultipleInstances = 'IgnoreNew'
Set-ScheduledTask -TaskName $taskName -Action $action -Settings $settings | Out-Null
Write-Host "Tache 20h mise a jour. Sauvegarde : $backup" -ForegroundColor Green
$oldNames = @('Lapinous - Bilan quotidien 21h', 'Lapinous - Bilan 21h')
foreach ($name in $oldNames) {
    $old = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
    if ($old) {
        $response = Read-Host "Desactiver l'ancienne tache '$name' pour eviter les doublons ? (O/N)"
        if ($response -eq 'O') { Disable-ScheduledTask -TaskName $name | Out-Null; Write-Host "Desactivee : $name" }
    }
}
Write-Host 'Ne PAS relancer installer_taches.ps1 : il recreerait le bilan 21h.' -ForegroundColor Yellow
