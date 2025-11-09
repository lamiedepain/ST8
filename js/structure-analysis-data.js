// Structure analysis data for ST8 PRO application
window.ST8_STRUCTURE = {
  architecture: {
    title: 'Architecture',
    icon: 'layers',
    items: [
      { label: 'Type', value: 'Progressive Web App (PWA)' },
      { label: 'Frontend', value: 'HTML5, CSS3, JavaScript (ES6+)' },
      { label: 'Backend', value: 'Node.js + Express' },
      { label: 'Base de données', value: 'MongoDB (Mongoose)' },
      { label: 'Stockage local', value: 'LocalStorage, Service Worker Cache' },
      { label: 'Pattern', value: 'Module Pattern, Component-based' }
    ]
  },
  pages: {
    title: 'Pages',
    icon: 'file',
    items: [
      { label: 'index.html', value: 'Page d\'accueil avec grille d\'applications' },
      { label: 'agents.html', value: 'Gestion des agents du service' },
      { label: 'planning.html', value: 'Planning mensuel des équipes' },
      { label: 'bihebdo.html', value: 'Planning bihebdomadaire' },
      { label: 'planification.html', value: 'Planification hebdomadaire' },
      { label: 'prepa.html', value: 'Préparation de chantier' },
      { label: 'stats.html', value: 'Statistiques annuelles' },
      { label: 'elements.html', value: 'Éléments variables' },
      { label: 'easydict.html', value: 'Outil de dictée facilité' },
      { label: 'structure-analysis.html', value: 'Analyse de la structure (cette page)' }
    ]
  },
  dataModel: {
    title: 'Modèle de données',
    icon: 'database',
    items: [
      { label: 'Agents', value: 'Collection MongoDB des agents (nom, grade, affectation)' },
      { label: 'Planning', value: 'Plannings mensuels et hebdomadaires' },
      { label: 'Quartiers', value: 'Données géographiques des quartiers' },
      { label: 'Statistiques', value: 'Métriques et indicateurs de performance' },
      { label: 'Éléments variables', value: 'Configuration dynamique des éléments' },
      { label: 'Cache local', value: 'Service Worker cache pour mode hors ligne' }
    ]
  },
  scripts: {
    title: 'Scripts',
    icon: 'code',
    items: [
      { label: 'script.js', value: 'Script principal (navigation, thèmes, état)' },
      { label: 'apps-data.js', value: 'Catalogue des applications et tuiles' },
      { label: 'include-partials.js', value: 'Inclusion de composants HTML (header, footer)' },
      { label: 'api-sync.js', value: 'Synchronisation avec l\'API backend' },
      { label: 'notify.js', value: 'Système de notifications' },
      { label: 'weekend-utils.js', value: 'Utilitaires de gestion des week-ends' },
      { label: 'sw.js', value: 'Service Worker pour PWA et cache' },
      { label: 'structure-analysis.js', value: 'Logique de cette page d\'analyse' }
    ]
  },
  styles: {
    title: 'Styles',
    icon: 'palette',
    items: [
      { label: 'style.css', value: 'Styles principaux, thèmes, responsive' },
      { label: 'system.css', value: 'Styles système et utilitaires' },
      { label: 'theme.css', value: 'Variables de thèmes' },
      { label: 'agents.css', value: 'Styles spécifiques à la page agents' },
      { label: 'structure-analysis.css', value: 'Styles pour cette page' },
      { label: 'Variables CSS', value: '--color, --color-dark, --bg-surface, --text-primary' }
    ]
  },
  features: {
    title: 'Fonctionnalités',
    icon: 'star',
    items: [
      { label: 'PWA', value: 'Installation mobile/desktop, mode hors ligne' },
      { label: 'Accessibilité', value: 'WCAG 2.1, navigation clavier, ARIA labels' },
      { label: 'Thèmes', value: '9 thèmes de couleur + mode sombre' },
      { label: 'Responsive', value: 'Adaptation mobile/tablette/desktop' },
      { label: 'Performance', value: 'Cache intelligent, lazy loading' },
      { label: 'Navigation', value: 'Menu hamburger, breadcrumbs, transitions fluides' },
      { label: 'Synchronisation', value: 'API REST pour persistence MongoDB' },
      { label: 'Notifications', value: 'Système de notifications utilisateur' }
    ]
  },
  techStack: {
    title: 'Stack technique',
    icon: 'layers',
    items: [
      { label: 'Frontend', value: 'HTML5, CSS3 (Grid, Flexbox), JavaScript ES6+' },
      { label: 'Backend', value: 'Node.js v18+, Express 4.18' },
      { label: 'Base de données', value: 'MongoDB 8.0, Mongoose ODM' },
      { label: 'APIs', value: 'REST (Express Router), CORS enabled' },
      { label: 'PWA', value: 'Service Worker, Web App Manifest' },
      { label: 'Outils', value: 'Git, npm, VS Code' },
      { label: 'Hébergement', value: 'Compatible tout serveur HTTP statique' },
      { label: 'Performance', value: 'CSS contain, will-change, GPU transforms' }
    ]
  }
};
