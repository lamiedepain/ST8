<#
Start server helper : installe les dépendances serveur, démarre le serveur en arrière-plan
et ouvre la page stats dans Edge.
Usage:
  .\scripts\start_server_and_open.ps1
#>
Write-Host "Installation des dépendances du server..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot '..\server')
if (-not (Test-Path 'node_modules')) {
    npm ci
}
else {
    Write-Host 'node_modules existe déjà, skipping npm ci' -ForegroundColor Yellow
}

Write-Host 'Démarrage du serveur (node server.js)...' -ForegroundColor Cyan
$proc = Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

try {
    $r = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/agents' -Method GET -TimeoutSec 5
    Write-Host 'API reachable' -ForegroundColor Green
}
catch {
    Write-Host 'Erreur: l API ne répond pas. Regardez server.log ou la sortie du process.' -ForegroundColor Red
}

Start-Process 'microsoft-edge:http://127.0.0.1:3000/html/stats.html'
Pop-Location
