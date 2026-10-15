# Orchestration unique. Les tests remplacent les deux opérations par des doublures.
function Invoke-LapinousSteps {
    param([scriptblock]$Execute, [scriptblock]$Journal)
    $state = [ordered]@{startedAt=(Get-Date).ToString('o');syncExit=1;bilanExit=1;errors=@()}
    try {
        & $Journal 'SYNC debut'
        $state.syncExit = [int](& $Execute 'sync' $null)
        if ($state.syncExit -ne 0) { $state.errors += "Synchronisation echouee (code $($state.syncExit))." }
    } catch { $state.syncExit=1; $state.errors += "Synchronisation interrompue : $($_.Exception.Message)" }
    finally {
        $state.syncFinishedAt=(Get-Date).ToString('o')
        & $Journal "SYNC fin : code $($state.syncExit)"
        # Le bilan est tenté même si Node manque, lève une exception ou renvoie un échec.
        try {
            & $Journal 'BILAN debut'
            $state.bilanExit = [int](& $Execute 'bilan' $state)
            if ($state.bilanExit -ne 0) { $state.errors += "Bilan ou notification en echec (code $($state.bilanExit))." }
        } catch { $state.bilanExit=1; $state.errors += "Bilan interrompu : $($_.Exception.Message)" }
        & $Journal "BILAN fin : code $($state.bilanExit)"
    }
    $state.finishedAt=(Get-Date).ToString('o')
    return [pscustomobject]$state
}

function Start-LapinousChain {
    param([string]$ProjectRoot, [switch]$AppliquerChaine)
    Set-Location -LiteralPath $ProjectRoot
    $agent=Join-Path $ProjectRoot 'tools\agent_lapinous\agent.py'
    if (-not $AppliquerChaine) {
        Write-Host 'SIMULATION : synchronisation et quarantaine non executees ; aucune notification ni modification Trello.'
        Write-Host 'Plan : synchronisation 20 h Europe/Paris -> bilan immediat, meme en cas d echec -> Discord.'
        & python -B $agent bilan
        return $LASTEXITCODE
    }
    $folder=Join-Path $ProjectRoot '.cloudinary-local\logs'
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $lock=$null
    try { $lock=[IO.File]::Open((Join-Path $folder 'chaine.lock'),'OpenOrCreate','ReadWrite','None') }
    catch { Write-Warning 'Chaine deja en cours ou verrou inaccessible : aucune seconde execution.'; return 1 }
    try {
        $log=Join-Path $folder ((Get-Date -Format 'yyyy-MM-dd_HHmmss_fff')+'_chaine.log')
        $journal={param($line) $line | Add-Content -LiteralPath $log -Encoding UTF8}.GetNewClosure()
        $execute={
            param($phase,$context)
            $previous=$ErrorActionPreference
            try {
                $ErrorActionPreference='Continue'
                if ($phase -eq 'sync') {
                    $exe=(Get-Command node -ErrorAction Stop).Source
                    & $exe 'tools/update-images.mjs' '--backup-local' 2>&1 | ForEach-Object { $_.ToString() | Add-Content -LiteralPath $log -Encoding UTF8 }
                } else {
                    $exe=(Get-Command python -ErrorAction Stop).Source
                    $encoded=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(($context | ConvertTo-Json -Depth 5 -Compress)))
                    & $exe -B $agent bilan --appliquer --chaine-base64 $encoded 2>&1 | ForEach-Object { $_.ToString() | Add-Content -LiteralPath $log -Encoding UTF8 }
                }
                return $LASTEXITCODE
            } finally { $ErrorActionPreference=$previous }
        }.GetNewClosure()
        $result=Invoke-LapinousSteps -Execute $execute -Journal $journal
        $result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $folder 'derniere-chaine.json') -Encoding UTF8
        foreach ($errorText in $result.errors) { & $journal $errorText }
        if ($result.syncExit -ne 0 -or $result.bilanExit -ne 0) { return 1 }
        return 0
    } finally { $lock.Dispose() }
}
