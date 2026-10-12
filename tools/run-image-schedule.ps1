# Windows lance CE fichier à 20 h : il exécute la synchronisation une seule fois.
$ErrorActionPreference = 'Stop'
# Se place dans le projet, même si Windows démarre la tâche depuis un autre dossier.
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
# Le journal reste local : ce dossier est ignoré par Git.
New-Item -ItemType Directory -Path '.cloudinary-local' -Force | Out-Null
# Trouve Node installé sur le poste.
$nodeExecutable = (Get-Command node -ErrorAction Stop).Source
# & lance Node. --backup-local demande le déplacement des images après transfert vérifié.
# *> enregistre la sortie et les erreurs dans le journal du dernier lancement.
# update-images.mjs n’appelle pas Cloudinary si aucune nouvelle image utilisée n’est présente.
& $nodeExecutable 'tools/update-images.mjs' '--backup-local' *> '.cloudinary-local/nightly-images.log'
# Renvoie à Windows le code de résultat de Node : 0 = réussite, autre valeur = échec.
exit $LASTEXITCODE
