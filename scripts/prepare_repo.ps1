<#
Script d'aide pour préparer le dépôt local avant de le pousser vers
https://github.com/lamiedepain/ST8.git

Usage (PowerShell):
    .\scripts\prepare_repo.ps1 -RemoteUrl 'git@github.com:lamiedepain/ST8.git'

Ce script n'exécute pas d'actions destructrices automatiquement; il affiche
les étapes recommandées et peut initialiser le remote si demandé par l'option.
#>

param(
    [string]$RemoteUrl = 'git@github.com:lamiedepain/ST8.git',
    [switch]$SetRemote
)

Write-Host "Préparation du dépôt pour : $RemoteUrl`n" -ForegroundColor Cyan

Write-Host "1) Vérifier l'état git local..." -ForegroundColor Yellow
git status --porcelain

Write-Host "`n2) Fichiers ignorés (exemples):" -ForegroundColor Yellow
Get-Content .gitignore | Select-Object -First 40

if ($SetRemote) {
    Write-Host "`n3) Ajout du remote 'origin' -> $RemoteUrl" -ForegroundColor Green
    git remote remove origin 2>$null
    git remote add origin $RemoteUrl
    Write-Host "Remote 'origin' défini. Vérifiez avec 'git remote -v'" -ForegroundColor Green
}
else {
    Write-Host "`n(Exécutez avec -SetRemote pour définir le remote origin automatiquement.)" -ForegroundColor DarkYellow
}

Write-Host "`nÉtapes recommandées :" -ForegroundColor Cyan
Write-Host " - Vérifier les changements : git add -A && git commit -m 'Prepare repo'" -ForegroundColor Gray
Write-Host " - Pousser sur la branche principale : git push -u origin main" -ForegroundColor Gray

Write-Host "
Script terminé." -ForegroundColor Cyan