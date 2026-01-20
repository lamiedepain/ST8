#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
COMMANDES UTILES - ST88 Planning
Guide de référence rapide pour les commandes courantes
"""

COMMANDS = """
════════════════════════════════════════════════════════════════════
ST88 PLANNING - COMMANDES UTILES
════════════════════════════════════════════════════════════════════

📦 INSTALLATION
────────────────────────────────────────────────────────────────────

1. Créer environnement virtuel:
   python -m venv .venv
   .venv\\Scripts\\activate

2. Installer dépendances:
   pip install -r requirements.txt

3. Valider système:
   python validate_system.py


🚀 DÉMARRAGE
────────────────────────────────────────────────────────────────────

Lancer l'application:
   python app.py

Accéder à l'application:
   http://localhost:5001


🧪 TESTS
────────────────────────────────────────────────────────────────────

Valider le système:
   python validate_system.py

Tester les endpoints API:
   python test_api.py

Vérifier configuration:
   python config.py


🔧 MAINTENANCE
────────────────────────────────────────────────────────────────────

Lister fichiers Excel:
   python -c "from utils import list_excel_files; print(list_excel_files())"

Lister backups:
   python -c "from utils import list_backups; print(list_backups())"

Créer backup manuel:
   python -c "from utils import create_backup; create_backup()"

Synchroniser depuis SharePoint:
   python -c "from utils import download_from_sharepoint; download_from_sharepoint()"


📊 EXCEL
────────────────────────────────────────────────────────────────────

Charger workbook:
   python -c "from utils import load_workbook; wb = load_workbook(); print(wb.sheetnames)"

Valider structure:
   python -c "from utils import validate_excel_structure; print(validate_excel_structure())"


🌐 API ENDPOINTS
────────────────────────────────────────────────────────────────────

SHAREPOINT:
  POST   /api/sync-sharepoint          Synchroniser depuis SharePoint
  POST   /api/upload-sharepoint        Upload vers SharePoint

AGENTS:
  GET    /api/agents                   Liste agents
  POST   /api/agents                   Ajouter agent
  PUT    /api/agents/<index>           Modifier agent
  DELETE /api/agents/<index>           Supprimer agent

PLANNING:
  GET    /api/months                   Liste mois
  GET    /api/planning-data/<y>/<m>    Données planning
  PUT    /api/planning-data/<y>/<m>    Mettre à jour planning

GÉNÉRATION:
  POST   /api/generate-week            Générer disponibilités
  POST   /api/generate-teams           Générer équipes

FICHIERS:
  GET    /api/files                    Liste fichiers/backups
  GET    /api/download-excel           Télécharger Excel
  POST   /api/reload-excel             Recharger métadonnées
  GET    /api/backups                  Liste backups
  POST   /api/restore-backup           Restaurer backup


💻 EXEMPLES CURL
────────────────────────────────────────────────────────────────────

# Liste agents
curl http://localhost:5001/api/agents

# Ajouter agent
curl -X POST http://localhost:5001/api/agents \\
  -H "Content-Type: application/json" \\
  -d "{\\"matricule\\": \\"12345\\", \\"nom\\": \\"DUPONT\\", \\"prenom\\": \\"Jean\\"}"

# Générer disponibilités semaine
curl -X POST http://localhost:5001/api/generate-week \\
  -H "Content-Type: application/json" \\
  -d "{\\"week\\": \\"2026-W01\\", \\"group\\": \\"all\\", \\"slots\\": 2}"

# Synchroniser SharePoint
curl -X POST http://localhost:5001/api/sync-sharepoint


🐍 EXEMPLES PYTHON
────────────────────────────────────────────────────────────────────

# Charger agents
import requests
r = requests.get('http://localhost:5001/api/agents')
agents = r.json()['agents']
print(f"Agents: {len(agents)}")

# Ajouter agent
data = {
    'matricule': '12345',
    'nom': 'DUPONT',
    'prenom': 'Jean'
}
r = requests.post('http://localhost:5001/api/agents', json=data)
print(r.json())

# Générer disponibilités
data = {
    'week': '2026-W01',
    'group': 'voirie',
    'slots': 2
}
r = requests.post('http://localhost:5001/api/generate-week', json=data)
dispo = r.json()['disponibilites']
print(f"Jours: {len(dispo)}")


⚙️ CONFIGURATION
────────────────────────────────────────────────────────────────────

Fichier .env (credentials):
  SHAREPOINT_USERNAME=email@bordeaux-metropole.fr
  SHAREPOINT_PASSWORD=mot_de_passe
  SECRET_KEY=cle-secrete-unique

Fichier config.py (paramètres):
  EXCEL_FILE                  Nom fichier Excel
  SHAREPOINT_SITE_URL         URL SharePoint
  AUTO_SYNC_ENABLED           Sync auto (True/False)
  PLANNING_DAYS_START_COL     Colonne jour 1 (4 = D)
  PLANNING_AGENTS_START_ROW   Ligne agents (11)
  MAX_BACKUPS                 Nombre max backups (50)


🔍 DÉPANNAGE
────────────────────────────────────────────────────────────────────

Port 5001 déjà utilisé:
  netstat -ano | findstr :5001
  # Tuer le processus ou changer le port dans config.py

Erreur module Python:
  pip install --upgrade -r requirements.txt

Fichier Excel corrompu:
  # Restaurer depuis backup
  python -c "from utils import restore_backup; restore_backup('backup_YYYYMMDD_HHMMSS.xlsm')"

Synchronisation SharePoint échouée:
  # Vérifier credentials dans .env
  # Vérifier accès au SharePoint
  # Copier fichier manuellement si nécessaire


📚 DOCUMENTATION
────────────────────────────────────────────────────────────────────

README.md              Documentation principale
QUICK_START.md         Guide démarrage rapide
.env.example           Exemple configuration
validate_system.py     Script validation
test_api.py            Script test API


════════════════════════════════════════════════════════════════════
"""

if __name__ == '__main__':
    print(COMMANDS)
