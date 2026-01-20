# 🏠 Mode Local - Guide d'utilisation

## ℹ️ Configuration actuelle

L'application ST8 Planning fonctionne en **MODE LOCAL UNIQUEMENT**.  
La synchronisation automatique SharePoint est **désactivée**.

---

## ✅ Comment ça fonctionne

### Fichier Excel utilisé
```
C:\Users\Gonçalves\Desktop\ST8\2026_PLANNING_CENTRE_ST8.xlsm
```

### Flux de travail
1. **Modifier le planning** dans l'application web (http://localhost:5001)
2. **Sauvegardes automatiques** créées dans `backups/`
3. **Synchronisation manuelle** avec SharePoint si nécessaire

---

## 📥 Synchroniser depuis SharePoint (manuel)

### Option 1 : Télécharger depuis le navigateur
1. Ouvrez SharePoint dans votre navigateur :
   ```
   https://bdx.sharepoint.com/sites/PT-BORDEAUX-MET-DGT/
   ```
2. Naviguez vers :
   ```
   Documents partages > DGEP > HBC > 6-ST8 > 06_RESSOURCES HUMAINES > 
   CONGES > PLANNING CONGES CENTRE VOIRE ESPACE VERTS
   ```
3. Téléchargez `2026_PLANNING_CENTRE_ST8.xlsm`
4. Remplacez le fichier dans `C:\Users\Gonçalves\Desktop\ST8\`

### Option 2 : Utiliser OneDrive
Si le dossier SharePoint est synchronisé avec OneDrive :
1. Copiez le fichier depuis OneDrive
2. Collez dans `C:\Users\Gonçalves\Desktop\ST8\`

---

## 📤 Envoyer vers SharePoint (manuel)

### Option 1 : Upload via navigateur
1. Ouvrez SharePoint
2. Allez dans le dossier du planning
3. Cliquez sur **"Upload"** ou glissez-déposez le fichier
4. Remplacez l'ancien fichier

### Option 2 : OneDrive Sync
1. Copiez le fichier local
2. Collez dans le dossier OneDrive synchronisé
3. La synchro se fait automatiquement

---

## 🔄 Sauvegarde automatique

L'application crée **automatiquement** des backups avant chaque modification :

### Emplacement
```
C:\Users\Gonçalves\Desktop\ST8\backups\
```

### Format
```
backup_YYYYMMDD_HHMMSS.xlsm
```

Exemple : `backup_20260118_142557.xlsm`

### Restaurer un backup
1. Arrêtez l'application
2. Copiez le fichier de backup souhaité
3. Renommez-le en `2026_PLANNING_CENTRE_ST8.xlsm`
4. Remplacez le fichier principal
5. Relancez l'application

---

## 🚀 Démarrage de l'application

```powershell
cd C:\Users\Gonçalves\Desktop\ST8
python app.py
```

Accédez ensuite à : **http://localhost:5001**

---

## 📋 Fonctionnalités disponibles

✅ **Gestion des agents**
- Ajouter/modifier/supprimer des agents
- Voir les certifications et qualifications
- Visualiser les anniversaires et visites médicales

✅ **Planning**
- Voir les disponibilités des agents
- Marquer les congés (CP, RTT, AT, Maladie, etc.)
- Rechercher par date

✅ **Formation d'équipes**
- Générer automatiquement des équipes
- Filtrer par compétences
- Voir la composition optimale

✅ **Sauvegarde**
- Backups automatiques avant chaque modification
- Maximum 50 backups conservés
- Restauration facile

---

## ⚠️ Important

### Fichier toujours ouvert
Ne laissez **jamais** le fichier Excel ouvert dans Excel pendant que l'application web tourne.  
Cela bloquerait les modifications.

### Partage avec l'équipe
Pour partager vos modifications :
1. Uploadez le fichier sur SharePoint
2. Informez vos collègues de télécharger la nouvelle version

### Travail collaboratif
Si plusieurs personnes doivent modifier le planning :
- Coordonnez-vous pour éviter les conflits
- Uploadez régulièrement sur SharePoint
- Téléchargez avant de commencer à travailler

---

## 🆘 Problèmes courants

### "Le fichier est verrouillé"
➡️ Fermez Excel si le fichier est ouvert

### "Fichier introuvable"
➡️ Vérifiez que `2026_PLANNING_CENTRE_ST8.xlsm` existe dans `C:\Users\Gonçalves\Desktop\ST8\`

### "Erreur de lecture"
➡️ Le fichier est peut-être corrompu, restaurez un backup

### Les modifications ne s'affichent pas
➡️ Rafraîchissez la page web (F5)

---

## 📞 Support

Pour toute question sur l'utilisation, consultez :
- [README.md](README.md) - Documentation complète
- [QUICK_START.md](QUICK_START.md) - Guide de démarrage
- [COMMANDS.md](COMMANDS.md) - Commandes disponibles
