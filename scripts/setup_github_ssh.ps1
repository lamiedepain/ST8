<#
Automatisation basique pour générer une clé SSH ed25519 et l'ajouter à l'agent.
Exécuter en PowerShell (préférer 'Exécuter en tant qu'administrateur' si OpenSSH doit être installé).

Usage :
  .\scripts\setup_github_ssh.ps1 -Email 'ton.email@exemple.com'

Le script :
 - génère une clé si elle n'existe pas (~/.ssh/id_ed25519)
 - tente d'ajouter la clé à l'agent ssh (démarre l'agent si possible)
 - copie la clé publique dans le presse-papiers
 - affiche la clé publique et les instructions pour l'ajouter à GitHub
#>

param(
    [string]$Email = "$env:USERNAME@localhost"
)

$sshDir = Join-Path $env:USERPROFILE ".ssh"
if (-not (Test-Path $sshDir)) { New-Item -ItemType Directory -Path $sshDir | Out-Null }

$keyPath = Join-Path $sshDir 'id_ed25519'
if (Test-Path $keyPath) {
    Write-Host "Une clé existe déjà : $keyPath" -ForegroundColor Yellow
}
else {
    Write-Host "Génération d'une clé ed25519 pour $Email..." -ForegroundColor Cyan
    ssh-keygen -t ed25519 -C $Email -f $keyPath -N "" | Out-Null
    Write-Host "Clé générée : $keyPath" -ForegroundColor Green
}

# Try to start the ssh-agent service if available
try {
    $svc = Get-Service -Name ssh-agent -ErrorAction Stop
    if ($svc.Status -ne 'Running') {
        Write-Host 'Démarrage du service ssh-agent...' -ForegroundColor Cyan
        Start-Service ssh-agent -ErrorAction Stop
    }
}
catch {
    Write-Host 'Service ssh-agent non disponible ou non démarrable (continuation en mode local)...' -ForegroundColor Yellow
}

# Try to add the key to the agent
try {
    ssh-add $keyPath | Out-Null
    Write-Host 'Clé ajoutée à l agent SSH.' -ForegroundColor Green
}
catch {
    Write-Host "Impossible d'ajouter la clé automatiquement : $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Vous pouvez lancer 'ssh-add $keyPath' manuellement après avoir démarré l'agent." -ForegroundColor Yellow
}

# Copy public key to clipboard
$pub = "$keyPath.pub"
if (Test-Path $pub) {
    Get-Content $pub | Set-Clipboard
    Write-Host "La clé publique a été copiée dans le presse-papiers. Collez-la dans GitHub > Settings > SSH and GPG keys." -ForegroundColor Green
    Write-Host "Si vous préférez, voici la clé publique :`n" -ForegroundColor Cyan
    Get-Content $pub | Write-Host
}
else {
    Write-Host "Clé publique introuvable : $pub" -ForegroundColor Red
}

Write-Host "Terminé." -ForegroundColor Cyan