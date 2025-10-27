<#
Push helper : ajoute, commit et pousse sur le remote fourni.
Usage:
  .\scripts\push_to_remote.ps1 -Remote 'git@github.com:lamiedepain/ST8.git' -Message 'Commit message'
#>
param(
    [string]$Remote = 'git@github.com:lamiedepain/ST8.git',
    [string]$Branch = 'main',
    [string]$Message = 'Préparation avant push'
)

Write-Host "Etat git avant push :" -ForegroundColor Cyan
git status --porcelain

git add -A
git commit -m $Message 2>$null || Write-Host 'Aucun changement à commit.' -ForegroundColor Yellow

git remote remove origin 2>$null
git remote add origin $Remote
git branch -M $Branch
Write-Host "Pushing to $Remote ($Branch) ..." -ForegroundColor Cyan
git push -u origin $Branch
