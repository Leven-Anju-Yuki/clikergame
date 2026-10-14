# Lapinous - synchronisation Cloudinary puis bilan quotidien
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$reports = Join-Path (Split-Path -Parent $projectRoot) 'clikergame_avec_image\rapports'
New-Item -ItemType Directory -Path $reports -Force | Out-Null
$log = Join-Path $reports 'nightly-images.log'
$start = (Get-Date).ToString('o')
"[$start] Debut synchronisation Lapinous" | Set-Content -LiteralPath $log -Encoding UTF8
$syncFailed = $false
try {
    $node = (Get-Command node -ErrorAction Stop).Source
    & $node 'tools/update-images.mjs' '--backup-local' *>> $log
    $syncExit = $LASTEXITCODE
    if ($syncExit -ne 0) { throw "Synchronisation echouee (code $syncExit). Corbeille non executee." }
    "[$((Get-Date).ToString('o'))] Synchronisation terminee ; quarantaine logique" | Add-Content -LiteralPath $log -Encoding UTF8
    & $node 'tools/cloudinary-corbeille.mjs' 'appliquer' *>> $log
    $binExit = $LASTEXITCODE
    if ($binExit -ne 0) { throw "Quarantaine echouee (code $binExit)." }
    "[$((Get-Date).ToString('o'))] Cloudinary OK" | Add-Content -LiteralPath $log -Encoding UTF8
} catch {
    $syncFailed = $true
    "[$((Get-Date).ToString('o'))] ERREUR Cloudinary : $($_.Exception.Message)" | Add-Content -LiteralPath $log -Encoding UTF8
}

# Toujours lancer le bilan, y compris si Cloudinary a echoue.
$bilanFailed = $false
try {
    $python = (Get-Command python -ErrorAction Stop).Source
    "[$((Get-Date).ToString('o'))] Debut bilan Lapinous" | Add-Content -LiteralPath $log -Encoding UTF8
   & $python 'tools/agent_lapinous/agent.py' 'bilan' '--appliquer' *>> $log
    $bilanExit = $LASTEXITCODE
    if ($bilanExit -ne 0) { throw "Bilan echoue (code $bilanExit)." }
    "[$((Get-Date).ToString('o'))] Bilan OK" | Add-Content -LiteralPath $log -Encoding UTF8
} catch {
    $bilanFailed = $true
    "[$((Get-Date).ToString('o'))] ERREUR bilan : $($_.Exception.Message)" | Add-Content -LiteralPath $log -Encoding UTF8
}
if ($syncFailed -or $bilanFailed) { exit 1 }
exit 0
