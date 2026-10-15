# Alias de l installateur unique ; simulation sans -Appliquer.
param([switch]$Appliquer)
& (Join-Path $PSScriptRoot 'installer_taches.ps1') -Appliquer:$Appliquer
