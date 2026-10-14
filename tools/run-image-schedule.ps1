# Lapinous - tache Windows existante de 20 h
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$state = Join-Path $projectRoot '.cloudinary-local'
New-Item -ItemType Directory -Path $state -Force | Out-Null
$node = (Get-Command node -ErrorAction Stop).Source
$log = Join-Path $state 'nightly-images.log'
$start = (Get-Date).ToString('o')
"[$start] Debut synchronisation Lapinous" | Set-Content -LiteralPath $log -Encoding UTF8
try {
    & $node 'tools/update-images.mjs' '--backup-local' *>> $log
    $syncExit = $LASTEXITCODE
    if ($syncExit -ne 0) { throw "Synchronisation echouee (code $syncExit). Corbeille non executee." }
    "[$((Get-Date).ToString('o'))] Synchronisation terminee ; quarantaine logique" | Add-Content -LiteralPath $log -Encoding UTF8
    & $node 'tools/cloudinary-corbeille.mjs' 'appliquer' *>> $log
    $binExit = $LASTEXITCODE
    if ($binExit -ne 0) { throw "Quarantaine echouee (code $binExit)." }
    "[$((Get-Date).ToString('o'))] OK" | Add-Content -LiteralPath $log -Encoding UTF8
    exit 0
} catch {
    "[$((Get-Date).ToString('o'))] ERREUR : $($_.Exception.Message)" | Add-Content -LiteralPath $log -Encoding UTF8
    exit 1
}
