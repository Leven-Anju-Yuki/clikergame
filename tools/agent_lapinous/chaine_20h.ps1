# Compatibilite : tous les lanceurs utilisent exactement la meme chaine.
param([switch]$AppliquerChaine)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'chaine_commune.ps1')
exit (Start-LapinousChain -ProjectRoot (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) -AppliquerChaine:$AppliquerChaine)
