# ST8 PRO

Interface de gestion du service territorial Bordeaux Maritime / Bastide N° 8.

## Fonctionnalités

- **Gestion des agents** - Gérer les informations des agents du service
- **Planning** - Planification mensuelle, bihebdomadaire et hebdomadaire
- **Préparation chantier** - Préparer les chantiers
- **Statistiques** - Visualiser les statistiques annuelles
- **EasyDict** - Outil de dictée facilité
- **Éléments variables** - Gérer les éléments configurables

## Caractéristiques techniques

### Accessibilité (WCAG 2.1)
- Navigation au clavier complète
- Support des lecteurs d'écran avec ARIA labels
- Indicateurs de focus visibles
- Contenu sémantique HTML5

### Progressive Web App (PWA)
- Installation sur mobile et desktop
- Fonctionnement hors ligne via Service Worker
- Mode standalone
- Icônes adaptatives

### Performance
- CSS optimisé avec `will-change` et `contain`
- Cache intelligent pour les ressources statiques
- Chargement asynchrone des modules
- Animations fluides avec transforms GPU

### Responsive Design
- Navigation adaptative mobile/desktop
- Menu hamburger animé
- Layouts flexibles
- Support multi-écrans

## Développement

### Structure
```
/
├── css/              # Feuilles de style
├── js/               # Scripts JavaScript
├── includes/         # Partials HTML (header, footer)
├── assets/           # Images et icônes
├── data/             # Données JSON
├── server/           # Backend Node.js
└── *.html            # Pages de l'application
```

### Lancer le serveur

```bash
cd server
npm install
npm start
```

Le serveur démarre sur le port 3000 par défaut.

## Licence

MIT
