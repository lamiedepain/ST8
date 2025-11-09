# ST8

Application de gestion territoriale pour la planification et le suivi des agents.

## Installation

1. Installer les dépendances du serveur :
```bash
cd server
npm install
```

## Configuration

### Stockage des données

L'application supporte deux modes de stockage :

#### Mode fichier (par défaut)
Les données sont stockées dans `server/data/agents_source.json`. Aucune configuration supplémentaire n'est nécessaire.

#### Mode MongoDB
Pour utiliser MongoDB au lieu du stockage fichier :

1. Créer une base de données MongoDB (locale ou cloud comme MongoDB Atlas)
2. Définir la variable d'environnement `MONGO_URI` :

```bash
export MONGO_URI="mongodb://localhost:27017/st8"
# ou pour MongoDB Atlas :
export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/st8"
```

3. Démarrer le serveur :
```bash
cd server
npm start
```

Le serveur basculera automatiquement vers MongoDB si `MONGO_URI` est défini. En cas d'échec de connexion MongoDB, il reviendra au stockage fichier.

## Démarrage

```bash
cd server
npm start
```

Le serveur démarre sur le port 3000 par défaut (configurable via `PORT` environment variable).

## Endpoints API

- `GET /api/agents` - Récupérer tous les agents
- `POST /api/agents` - Sauvegarder les agents
- `DELETE /api/agents/:matricule` - Supprimer un agent
- `GET /health` - Vérifier le statut du serveur

## Gestion des sauvegardes

Le serveur crée automatiquement des fichiers de sauvegarde lors de chaque modification des données dans `server/data/`. Un script de gestion des sauvegardes est disponible :

```bash
# Lister les sauvegardes disponibles
./backup.sh list

# Restaurer depuis une sauvegarde
./backup.sh restore server/data/agents_source.json.TIMESTAMP.bak

# Nettoyer les anciennes sauvegardes (garde les 10 dernières)
./backup.sh clean
```

## Fonctionnalités

- Gestion des agents et leurs compétences
- Planification mensuelle et hebdomadaire
- Statistiques de présence
- Interface de préparation des plannings
- Gestion des éléments et matériels