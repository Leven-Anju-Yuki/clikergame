# Ce script sert à ENREGISTRER la tâche : il n’a pas besoin de rester ouvert.
# Windows conserve ensuite l’horaire dans son Planificateur de tâches.
# Chaîne : Windows à 20 h -> run-image-schedule.ps1 -> update-images.mjs.
# La commande Node vérifie les nouvelles images avant de contacter Cloudinary.
$ErrorActionPreference = 'Stop'
# Remonte de tools/ vers la racine du projet pour trouver les JSON et .env.
$projectRoot = Split-Path -Parent $PSScriptRoot
# La tâche utilise ton compte et fonctionne quand ta session est ouverte.
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$runner = Join-Path $PSScriptRoot 'run-image-schedule.ps1'
$powershellExecutable = Join-Path $PSHOME 'powershell.exe'
# ACTION : le fichier que Windows doit lancer. Hidden évite une fenêtre de console.
$action = New-ScheduledTaskAction -Execute $powershellExecutable -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $runner + '"') -WorkingDirectory $projectRoot
# HORAIRE : cette ligne signifie « tous les jours, à 20:00 », heure Windows du poste.
# Le poste est configuré sur le fuseau de Paris ; changer cette ligne seul ne suffit pas :
# il faut réexécuter ce script pour mettre à jour la tâche déjà enregistrée dans Windows.
$trigger = New-ScheduledTaskTrigger -Daily -At '20:00'
# Pas de mot de passe stocké ni de droits administrateur : session utilisateur courante.
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited
# Ignore un second lancement si le précédent tourne encore. Limite : une heure.
# Le lancement sur batterie est autorisé. Aucun rattrapage au démarrage n’est activé.
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
# ENREGISTRE la tâche dans Windows. Force remplace la configuration de même nom.
Register-ScheduledTask -TaskName 'Lapinous - Images Cloudinary 20h' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Select-Object TaskName, State
# Affiche la prochaine exécution calculée par Windows pour vérifier l’installation.
Get-ScheduledTaskInfo -TaskName 'Lapinous - Images Cloudinary 20h' | Select-Object NextRunTime
