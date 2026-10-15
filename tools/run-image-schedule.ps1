# Point d entree conserve pour la tache Windows existante. Simulation avant remise en service.
param([switch]$AppliquerChaine)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'agent_lapinous\chaine_commune.ps1')
exit (Start-LapinousChain -ProjectRoot (Split-Path -Parent $PSScriptRoot) -AppliquerChaine:$AppliquerChaine)
