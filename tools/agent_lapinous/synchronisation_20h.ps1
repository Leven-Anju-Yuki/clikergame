# Lanceur non interactif pour le Planificateur Windows. N'exécute pas le .cmd avec pause.
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$LogDir = Join-Path $Root '.cloudinary-local\logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir ((Get-Date -Format 'yyyy-MM-dd_HHmmss') + '_20h.log')
Set-Location $Root
"Démarrage : $(Get-Date -Format o)" | Out-File -FilePath $Log -Encoding utf8
& node 'tools/update-images.mjs' '--backup-local' *>> $Log
$Code = $LASTEXITCODE
"Fin : $(Get-Date -Format o) ; code : $Code" | Out-File -FilePath $Log -Encoding utf8 -Append
exit $Code
