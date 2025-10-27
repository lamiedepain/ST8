# ST8 — Planning & Statistiques

[![CI](https://github.com/lamiedepain/ST8/actions/workflows/ci.yml/badge.svg)](https://github.com/lamiedepain/ST8/actions/workflows/ci.yml)

Ce dépôt contient une application front-end statique (HTML/CSS/JS) pour gérer un planning interne et un petit serveur Node.js pour persister `agents_source.json`.

But de ce commit : préparer le code local pour être poussé vers https://github.com/lamiedepain/ST8.git

Fichiers importants :
- `html/` : pages statiques (planning, bihebdo, stats, etc.)
- `js/` : scripts front-end
- `css/` : styles
- `data/agents_source.json` : base de données source
- `server/` : serveur Node.js (API GET/POST /api/agents)

Comment préparer et pousser (PowerShell) :

```powershell
cd 'C:\Users\Gonçalves\Desktop\v2'
# vérifier l'état
git status
# ajouter tous les fichiers pertinents
git add -A
git commit -m "Prepare repository for lamiedepain/ST8"
# définir le remote (optionnel) et pousser
git remote add origin git@github.com:lamiedepain/ST8.git
git push -u origin main
```

Voir `scripts/prepare_repo.ps1` pour un assistant PowerShell.

Licence : MIT (peut être changée si nécessaire)
