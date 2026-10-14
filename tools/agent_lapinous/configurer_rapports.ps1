$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$BackupFolder = Join-Path (Split-Path $Root -Parent) 'clikergame_avec_image'
New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
$Agent = Join-Path $PSScriptRoot 'agent.py'
if (-not (Test-Path $Agent)) { throw "agent.py introuvable : $Agent" }
$content = Get-Content -Raw -Encoding UTF8 $Agent
$pattern = '(?m)^REPORTS\s*=\s*HERE\s*/\s*[\x27\x22]rapports[\x27\x22]\s*$'
$replacement = "REPORTS = ROOT.parent / 'clikergame_avec_image'"
if ($content -match $pattern) {
    $backup = "$Agent.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $Agent $backup
    $updated = [regex]::Replace($content, $pattern, $replacement)
    [System.IO.File]::WriteAllText($Agent, $updated, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Rapports de agent.py diriges vers : $BackupFolder" -ForegroundColor Green
    Write-Host "Sauvegarde du script : $backup"
} elseif ($content.Contains($replacement)) {
    Write-Host 'agent.py est deja configure.' -ForegroundColor Green
} else {
    throw "Ligne REPORTS non reconnue dans agent.py. Aucun changement effectue."
}
Write-Host "Journaux de la chaine : $BackupFolder"
