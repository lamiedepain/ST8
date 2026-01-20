# 🔐 Configuration SharePoint OAuth2 - Guide complet

## ⚠️ Important
L'authentification basique (username/password) ne fonctionne **pas** avec SharePoint Online de Bordeaux Métropole.  
Vous devez utiliser **OAuth2 avec Azure AD**.

## 📋 Prérequis
- Accès administrateur Azure AD de Bordeaux Métropole
- Permissions pour créer des App Registrations

---

## 🚀 Étape 1 : Créer une App Registration Azure AD

### 1.1 Accéder au portail Azure
1. Allez sur https://portal.azure.com
2. Connectez-vous avec votre compte Bordeaux Métropole
3. Recherchez **"Azure Active Directory"** dans la barre de recherche

### 1.2 Créer l'application
1. Dans le menu de gauche, cliquez sur **"App registrations"**
2. Cliquez sur **"+ New registration"**
3. Remplissez le formulaire :
   - **Name** : `ST8 Planning App`
   - **Supported account types** : `Accounts in this organizational directory only (Bordeaux Métropole only - Single tenant)`
   - **Redirect URI** : Laissez vide
4. Cliquez sur **"Register"**

### 1.3 Noter les identifiants
Une fois l'app créée, notez ces informations (vous en aurez besoin) :

```
Application (client) ID : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID   : b3dd23de-593f-4d74-bcf9-f035c1a2eb24
```

---

## 🔑 Étape 2 : Créer un Client Secret

1. Dans votre App Registration, allez dans **"Certificates & secrets"**
2. Cliquez sur **"+ New client secret"**
3. Remplissez :
   - **Description** : `ST8 Planning Secret`
   - **Expires** : `24 months` (recommandé)
4. Cliquez sur **"Add"**
5. **⚠️ IMPORTANT** : Copiez immédiatement la **VALUE** du secret (vous ne pourrez plus la voir après)

```
Client Secret Value : xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔐 Étape 3 : Configurer les permissions

1. Dans votre App Registration, allez dans **"API permissions"**
2. Cliquez sur **"+ Add a permission"**
3. Sélectionnez **"Microsoft Graph"**
4. Sélectionnez **"Application permissions"** (pas Delegated)
5. Recherchez et cochez :
   - `Sites.ReadWrite.All` (Lecture/écriture de tous les sites)
   - `Files.ReadWrite.All` (Lecture/écriture de tous les fichiers)
6. Cliquez sur **"Add permissions"**
7. **⚠️ CRUCIAL** : Cliquez sur **"Grant admin consent for Bordeaux Métropole"**
   - Un administrateur doit approuver ces permissions
   - Le statut doit passer à ✅ vert

---

## 📝 Étape 4 : Configurer l'application ST8

### 4.1 Éditer le fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplacez :

```env
# Configuration SharePoint - Authentification Azure AD OAuth2
SHAREPOINT_TENANT_ID=b3dd23de-593f-4d74-bcf9-f035c1a2eb24
SHAREPOINT_CLIENT_ID=VOTRE_APPLICATION_CLIENT_ID_ICI
SHAREPOINT_CLIENT_SECRET=VOTRE_CLIENT_SECRET_VALUE_ICI

# Ces anciennes credentials ne sont plus utilisées
SHAREPOINT_USERNAME=li.goncalves@bordeaux-metropole.fr
SHAREPOINT_PASSWORD=Regiest8-33
```

**Exemple avec de vraies valeurs** (à adapter) :
```env
SHAREPOINT_TENANT_ID=b3dd23de-593f-4d74-bcf9-f035c1a2eb24
SHAREPOINT_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
SHAREPOINT_CLIENT_SECRET=AbC~1234567890_aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

### 4.2 Vérifier la configuration

Le fichier `config.py` contient déjà le bon chemin SharePoint :
```python
SHAREPOINT_FILE_PATH = "/sites/PT-BORDEAUX-MET-DGT/Documents partages/DGEP/HBC/6-ST8/06_RESSOURCES HUMAINES/CONGES/PLANNING CONGES CENTRE VOIRE ESPACE VERTS/2026_PLANNING_CENTRE_ST8.xlsm"
```

---

## ✅ Étape 5 : Tester la connexion

### 5.1 Démarrer l'application
```powershell
python app.py
```

### 5.2 Tester la synchronisation
1. Ouvrez http://localhost:5001 dans votre navigateur
2. Cliquez sur le bouton **"Synchroniser SharePoint"**
3. Vérifiez les logs dans le terminal

### 5.3 Vérifier le statut
Accédez à : http://localhost:5001/api/sharepoint-status

Vous devriez voir :
```json
{
  "configured": true,
  "username": "li.goncalves@bordeaux-metropole.fr",
  "has_password": true,
  "site_url": "https://bdx.sharepoint.com/sites/PT-BORDEAUX-MET-DGT",
  "auto_sync": true
}
```

---

## 🔍 Dépannage

### Erreur : "Échec authentification Azure AD"
- Vérifiez que CLIENT_ID et CLIENT_SECRET sont corrects dans `.env`
- Vérifiez que TENANT_ID est bien `b3dd23de-593f-4d74-bcf9-f035c1a2eb24`
- Redémarrez l'application après modification du `.env`

### Erreur : "403 Forbidden" lors du téléchargement
- Vérifiez que les permissions API ont été **approuvées par l'admin**
- Vérifiez que `Sites.ReadWrite.All` et `Files.ReadWrite.All` sont cochées
- Attendez 5-10 minutes après l'approbation (propagation des permissions)

### Erreur : "404 Not Found"
- Vérifiez que le chemin du fichier dans `config.py` est correct
- Le fichier doit être à : `DGEP/HBC/6-ST8/06_RESSOURCES HUMAINES/CONGES/PLANNING CONGES CENTRE VOIRE ESPACE VERTS/`

### Les logs ne montrent rien
- Arrêtez le serveur avec Ctrl+C
- Relancez avec `python app.py`
- Les logs d'authentification s'affichent au démarrage

---

## 📞 Support

Pour obtenir de l'aide avec Azure AD, contactez :
- **Service IT Bordeaux Métropole**
- Demandez l'accès à Azure Portal
- Demandez les permissions pour créer des App Registrations

---

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- Ne partagez JAMAIS votre `CLIENT_SECRET`
- Ne commitez JAMAIS le fichier `.env` dans Git
- Le `.env` est déjà dans `.gitignore`
- Renouvelez le secret tous les 24 mois
