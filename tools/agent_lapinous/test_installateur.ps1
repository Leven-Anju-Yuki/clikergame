# Doublures uniquement : aucune commande réelle du Planificateur n'est appelée.
$ErrorActionPreference = 'Stop'
$global:LapinousTestWrites = [System.Collections.Generic.List[object]]::new()
$global:LapinousTestFixtures = @(
    [pscustomobject]@{TaskName='Lapinous - Bilan quotidien 21h';TaskPath='\';Actions='agent.py bilan --appliquer';Settings=[pscustomobject]@{Enabled=$false}},
    [pscustomobject]@{TaskName='Lapinous - Images Cloudinary 20h';TaskPath='\';Actions='run-image-schedule.ps1';Settings=[pscustomobject]@{Enabled=$true}}
)
function Get-TimeZone { [pscustomobject]@{Id='Romance Standard Time'} }
function Get-ScheduledTask { $global:LapinousTestFixtures }
function New-ScheduledTaskAction { param($Execute,$Argument,$WorkingDirectory) [pscustomobject]@{Execute=$Execute;Arguments=$Argument} }
function New-ScheduledTaskTrigger { param([switch]$Daily,$At) [pscustomobject]@{At=$At} }
function New-ScheduledTaskSettingsSet { param([switch]$StartWhenAvailable,$MultipleInstances) [pscustomobject]@{Enabled=$true} }
function Set-ScheduledTask { param($TaskName,$TaskPath,$Action,$Trigger,$Settings) $global:LapinousTestWrites.Add([pscustomobject]@{Type='Set';Name=$TaskName;Enabled=$Settings.Enabled;Hour=$Trigger.At}) }
function Register-ScheduledTask { param($TaskName,$Action,$Trigger,$Settings,$Description) $global:LapinousTestWrites.Add([pscustomobject]@{Type='Register';Name=$TaskName;Enabled=$Settings.Enabled;Hour=$Trigger.At}) }
$installer = Join-Path $PSScriptRoot 'installer_taches.ps1'
& $installer
if ($global:LapinousTestWrites.Count -ne 0) { throw 'La simulation a écrit.' }
& $installer -Appliquer
if ($global:LapinousTestWrites.Count -ne 1 -or $global:LapinousTestWrites[0].Type -ne 'Set' -or $global:LapinousTestWrites[0].Enabled -or $global:LapinousTestWrites[0].Name -ne 'Lapinous - Bilan quotidien 21h') { throw 'Tâche existante non réutilisée ou réactivée.' }
$global:LapinousTestWrites.Clear()
& $installer -Appliquer -InstallerCloudinary
if ($global:LapinousTestWrites.Count -ne 2 -or @($global:LapinousTestWrites | Where-Object Type -eq 'Register').Count -ne 0) { throw 'Doublon créé.' }
if ($global:LapinousTestWrites[0].Hour -ne '21:00' -or $global:LapinousTestWrites[1].Hour -ne '20:00') { throw 'Horaires incorrects.' }
$global:LapinousTestWrites.Clear()
$global:LapinousTestFixtures += [pscustomobject]@{TaskName='Lapinous - Bilan 21h';Actions='agent.py bilan';Settings=[pscustomobject]@{Enabled=$false}}
$refused = $false
try { & $installer -Appliquer } catch { $refused = $true }
if (-not $refused -or $global:LapinousTestWrites.Count) { throw 'Doublons existants non bloqués.' }
$global:LapinousTestFixtures = @()
& $installer -Appliquer
if ($global:LapinousTestWrites.Count -ne 1 -or $global:LapinousTestWrites[0].Type -ne 'Register' -or $global:LapinousTestWrites[0].Enabled) { throw 'Nouvelle tâche activée sans accord.' }
Write-Host '5 scénarios validés : aucune commande réelle du Planificateur appelée.'
$launchers = @((Join-Path $PSScriptRoot '..\run-image-schedule.ps1'), (Join-Path $PSScriptRoot 'chaine_20h.ps1'))
foreach ($launcher in $launchers) {
    $tokens = $null; $errors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path $launcher), [ref]$tokens, [ref]$errors)
    if ($errors.Count) { throw 'Erreur de syntaxe dans le lanceur.' }
    $calls = $ast.FindAll({param($node)
        $node -is [System.Management.Automation.Language.CommandAst] -and
        (($node.CommandElements | ForEach-Object {$_.Extent.Text}) -join ' ') -match 'agent.py|bilan.*--appliquer'
    }, $true)
    if (-not $calls.Count) { throw 'Appel du bilan non retrouve pour verifier son garde.' }
    foreach ($call in $calls) {
        $parent = $call.Parent; $guarded = $false
        while ($null -ne $parent) {
            if ($parent -is [System.Management.Automation.Language.IfStatementAst] -and $parent.Clauses[0].Item1.Extent.Text -eq '$InclureBilan') { $guarded = $true; break }
            $parent = $parent.Parent
        }
        if (-not $guarded) { throw 'Bilan automatique non protege dans le lanceur de 20 h.' }
    }
}
Write-Host '2 lanceurs verifies par analyse syntaxique : aucun bilan sans option explicite.'
