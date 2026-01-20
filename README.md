# ST88 Planning - Application Web Flask

Application web pour la gestion du planning et des équipes du service ST8 avec synchronisation automatique depuis SharePoint.

## 🚀 Fonctionnalités

- ✅ **Synchronisation SharePoint** : Téléchargement automatique du fichier depuis SharePoint
- ✅ **Gestion des agents** : Ajout, modification, suppression d'agents
- ✅ **Planning hebdomadaire** : Visualisation et génération des disponibilités
- ✅ **Formation d'équipes** : Génération automatique par compétences
- ✅ **Sauvegarde automatique** : Backups horodatés avant chaque modification
- ✅ **Interface moderne** : Design responsive avec Bootstrap 5

## 📋 Prérequis

- Python 3.8+ 
- Accès au SharePoint de Bordeaux Métropole
- Credentials SharePoint (user/password ou OAuth2)

## 🔧 Installation

### 1. Cloner ou télécharger le projet

```bash
cd ST8
```

### 2. Créer un environnement virtuel

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### 3. Installer les dépendances

```powershell
pip install -r requirements.txt
```

### 4. Configurer les credentials SharePoint

Éditez le fichier `.env` et renseignez vos credentials :

```env
SHAREPOINT_USERNAME=votre.email@bordeaux-metropole.fr
SHAREPOINT_PASSWORD=votre_mot_de_passe
```

### 5. Lancer l'application

```powershell
python app.py
```

L'application sera accessible sur : **http://localhost:5001**

## 📂 Structure du projet

```
ST8/
├── app.py                          # Application Flask principale
├── config.py                       # Configuration centralisée
├── utils.py                        # Fonctions utilitaires
├── requirements.txt                # Dépendances Python
├── .env                           # Variables d'environnement (credentials)
├── .env.example                   # Exemple de configuration
├── .gitignore                     # Fichiers à ignorer par Git
├── templates/                     # Templates HTML
│   ├── base.html                 # Template de base
│   ├── index.html                # Page d'accueil
│   ├── planning.html             # Page planning
│   └── agents.html               # Page agents
└── backups/                       # Sauvegardes automatiques (créé automatiquement)
```

## 🌐 Utilisation

### Page d'accueil (`/`)
- Vue d'ensemble du système
- Statistiques (agents, mois, backups)
- Accès rapide aux fonctionnalités
- Bouton de synchronisation SharePoint

### Gestion des agents (`/agents`)
- Liste complète des agents
- Recherche par nom, prénom, matricule
- Ajout de nouveaux agents
- Modification et suppression

### Planning hebdomadaire (`/planning`)
- Sélection de la semaine (format ISO)
- Filtrage par groupe
- Génération des disponibilités
- Formation automatique des équipes
- Export possible

## 🔌 API Endpoints

### SharePoint
- `POST /api/sync-sharepoint` - Synchroniser depuis SharePoint
- `POST /api/upload-sharepoint` - Uploader vers SharePoint

### Agents
- `GET /api/agents` - Liste des agents
- `POST /api/agents` - Ajouter un agent
- `PUT /api/agents/<index>` - Modifier un agent
- `DELETE /api/agents/<index>` - Supprimer un agent

### Planning
- `GET /api/months` - Liste des mois disponibles
- `GET /api/planning-data/<year>/<month>` - Données planning
- `PUT /api/planning-data/<year>/<month>` - Mettre à jour planning

### Génération
- `POST /api/generate-week` - Générer disponibilités semaine
- `POST /api/generate-teams` - Générer équipes

### Fichiers
- `GET /api/files` - Liste fichiers et backups
- `GET /api/download-excel` - Télécharger fichier Excel
- `POST /api/reload-excel` - Recharger métadonnées
- `GET /api/backups` - Liste backups
- `POST /api/restore-backup` - Restaurer backup

## ⚙️ Configuration

### config.py

Paramètres principaux :

```python
# SharePoint
SHAREPOINT_SITE_URL = "https://bdx.sharepoint.com/sites/PT-BORDEAUX-MET-DGT"
AUTO_SYNC_ENABLED = True
SYNC_INTERVAL_MINUTES = 30

# Excel
EXCEL_FILE = '2026_PLANNING_CENTRE_ST8.xlsm'
PLANNING_DAYS_START_COL = 4  # Colonne D = jour 1

# Backups
MAX_BACKUPS = 50
```

### Variables d'environnement (.env)

```env
SHAREPOINT_USERNAME=votre.email@bordeaux-metropole.fr
SHAREPOINT_PASSWORD=votre_mot_de_passe
SECRET_KEY=votre-cle-secrete-unique
FLASK_DEBUG=True
```

## 🔒 Sécurité

- Les credentials SharePoint sont stockés dans `.env` (ignoré par Git)
- Ne jamais commiter le fichier `.env`
- Utiliser une `SECRET_KEY` unique en production
- Désactiver `FLASK_DEBUG` en production

## 🐛 Dépannage

### Erreur "Fichier Excel introuvable"
- Vérifiez que la synchronisation SharePoint est activée
- Vérifiez vos credentials dans `.env`
- Téléchargez manuellement le fichier si nécessaire

### Erreur "Credentials SharePoint manquants"
- Éditez le fichier `.env` 
- Renseignez `SHAREPOINT_USERNAME` et `SHAREPOINT_PASSWORD`
- Redémarrez l'application

### Erreur de connexion SharePoint
- Vérifiez votre connexion internet
- Vérifiez que vous avez accès au SharePoint
- Vérifiez l'URL SharePoint dans `config.py`

## 📝 Notes

- Le fichier Excel est téléchargé automatiquement au démarrage si `AUTO_SYNC_ENABLED = True`
- Un backup est créé avant chaque modification
- Les anciens backups sont supprimés automatiquement (garde les 50 plus récents)
- Le fichier Excel local sert de cache entre les synchronisations

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console Flask pour les messages d'erreur
2. Consultez les logs
3. Testez les endpoints API manuellement

## 📜 Licence

© 2026 Bordeaux Métropole - Service ST8

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Python** : 3.8+  
**Flask** : 3.0.0
