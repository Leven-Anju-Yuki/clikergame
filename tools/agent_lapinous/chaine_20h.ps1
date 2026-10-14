$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Logs = Join-Path (Split-Path $Root -Parent) 'clikergame_avec_image'
New-Item -ItemType Directory -Force -Path $Logs | Out-Null
$Log = Join-Path $Logs ((Get-Date -Format 'yyyy-MM-dd_HHmmss') + '_chaine.log')
$Lock = Join-Path $Logs 'chaine_20h.lock'
$lockStream = $null
try {
    try { $lockStream = [System.IO.File]::Open($Lock, 'OpenOrCreate', 'ReadWrite', 'None') }
    catch { Write-Warning 'Chaine deja en cours. Aucun doublon.'; exit 0 }
    Set-Location $Root
    "DEBUT $(Get-Date -Format o)" | Out-File $Log -Encoding utf8
    $sync = Join-Path $PSScriptRoot 'synchronisation_20h.ps1'
    if (-not (Test-Path $sync)) { throw "Synchronisation introuvable : $sync" }
    "SYNC debut" | Out-File $Log -Append -Encoding utf8
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $sync *>> $Log
    $syncCode = $LASTEXITCODE
    "SYNC fin : code $syncCode" | Out-File $Log -Append -Encoding utf8
    $agent = Join-Path $PSScriptRoot 'agent.py'
    if (-not (Test-Path $agent)) { throw "Agent introuvable : $agent" }
    "BILAN debut" | Out-File $Log -Append -Encoding utf8
    & python $agent bilan --appliquer *>> $Log
    $bilanCode = $LASTEXITCODE
    "BILAN fin : code $bilanCode" | Out-File $Log -Append -Encoding utf8
    if ($syncCode -ne 0 -or $bilanCode -ne 0) { exit 1 }
    exit 0
} catch {
    "ERREUR : $_" | Out-File $Log -Append -Encoding utf8
    Write-Error $_
    exit 1
} finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
