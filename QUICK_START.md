# 🚀 Guide de démarrage rapide - ST88 Planning

## ✅ État du système

Tous les fichiers sont créés et les dépendances sont installées !

## 📋 Étapes suivantes

### 1. Configurer les credentials SharePoint

Éditez le fichier `.env` et remplacez par vos vraies credentials :

```env
SHAREPOINT_USERNAME=votre.email@bordeaux-metropole.fr
SHAREPOINT_PASSWORD=votre_vrai_mot_de_passe
```

### 2. Copier le fichier Excel (optionnel)

Si vous avez déjà le fichier Excel local, copiez-le :

```powershell
Copy-Item "2026_PLANNING_CENTRE_ST8 .xlsm" "2026_PLANNING_CENTRE_ST8.xlsm"
```

**OU** le fichier sera téléchargé automatiquement depuis SharePoint au démarrage.

### 3. Lancer l'application

```powershell
python app.py
```

L'application démarre sur : **http://localhost:5001**

### 4. Accéder aux pages

- **Accueil** : http://localhost:5001/
- **Planning** : http://localhost:5001/planning
- **Agents** : http://localhost:5001/agents

## 🔧 Fonctionnalités implémentées

✅ **Synchronisation SharePoint automatique**
- Téléchargement au démarrage
- Upload des modifications
- Rafraîchissement manuel

✅ **Gestion des agents**
- Liste complète avec recherche
- Ajout/modification/suppression
- Synchronisation avec Excel

✅ **Planning hebdomadaire**
- Sélection par semaine ISO
- Filtrage par groupe
- Génération des disponibilités
- Formation d'équipes automatique

✅ **Sauvegarde automatique**
- Backup avant chaque modification
- Conservation des 50 derniers backups
- Restauration possible

## 📁 Structure créée

```
ST8/
├── app.py                      ✅ Application Flask (19 endpoints)
├── config.py                   ✅ Configuration SharePoint
├── utils.py                    ✅ Fonctions SharePoint + Excel
├── requirements.txt            ✅ Dépendances
├── .env                        ✅ Variables d'environnement
├── .env.example                ✅ Exemple config
├── .gitignore                  ✅ Fichiers à ignorer
├── README.md                   ✅ Documentation
├── validate_system.py          ✅ Script de validation
├── templates/
│   ├── base.html              ✅ Template de base
│   ├── index.html             ✅ Page d'accueil
│   ├── planning.html          ✅ Page planning
│   └── agents.html            ✅ Page agents
└── backups/                    ✅ Dossier sauvegardes
```

## ⚙️ Configuration SharePoint

Le fichier `config.py` contient :

- **URL SharePoint** : https://bdx.sharepoint.com/sites/PT-BORDEAUX-MET-DGT
- **Synchronisation auto** : Activée (désactiver si nécessaire)
- **Authentification** : NTLM (user/password)

## 🔍 Validation du système

Pour vérifier que tout fonctionne :

```powershell
python validate_system.py
```

## 📞 En cas de problème

### Le fichier Excel ne se télécharge pas

1. Vérifiez vos credentials dans `.env`
2. Vérifiez votre accès au SharePoint
3. Copiez manuellement le fichier Excel si nécessaire

### Erreur de module Python

```powershell
pip install -r requirements.txt
```

### L'application ne démarre pas

Vérifiez que le port 5001 n'est pas déjà utilisé :

```powershell
netstat -ano | findstr :5001
```

## 🎯 Prochaines étapes

1. **Tester la synchronisation SharePoint** avec vos vraies credentials
2. **Vérifier la structure du fichier Excel** (feuille 'config', colonnes...)
3. **Tester les endpoints API** avec les vraies données
4. **Personnaliser les groupes** dans `config.py` si nécessaire

## 📚 Documentation complète

Consultez `README.md` pour la documentation détaillée.

---

**Système prêt à l'emploi ! 🎉**

Il ne reste plus qu'à configurer les credentials SharePoint et lancer l'application.
