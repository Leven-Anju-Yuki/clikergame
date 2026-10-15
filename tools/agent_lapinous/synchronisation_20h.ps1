# Ancien point d entree : delegation, jamais une synchronisation independante.
param([switch]$AppliquerChaine)
& (Join-Path $PSScriptRoot 'chaine_20h.ps1') -AppliquerChaine:$AppliquerChaine
exit $LASTEXITCODE
