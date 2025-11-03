window.APP_CATALOG = window.APP_CATALOG || {};

if (!window.APP_CATALOG.index) {
  window.APP_CATALOG.index = [
    {
      title: 'Pr\u00e9pa chantier',
      abbr: 'PC',
      url: 'prepa.html',
      theme: 'theme-red',
      animationDelay: 0
    },
    {
      title: 'Gestion des agents',
      abbr: 'AG',
      url: 'agents.html',
      theme: 'theme-blue',
      animationDelay: 0.2
    },
    {
      title: 'Planning mensuel',
      abbr: 'PL',
      url: 'planning.html',
      theme: 'theme-green',
      animationDelay: 0.4
    },
    {
      title: 'Planning bihebdo',
      abbr: 'BI',
      url: 'bimensuel.html',
      theme: 'theme-slate',
      animationDelay: 0.6
    },
    {
      title: 'Planification hebdo',
      abbr: 'PH',
      url: 'planification.html',
      theme: 'theme-purple',
      animationDelay: 0.8
    },
    {
      title: '\u00c9l\u00e9ments variables',
      abbr: 'EV',
      url: 'elements.html',
      theme: 'theme-orange',
      animationDelay: 1.0
    },
    {
      title: 'Statistiques annuelles',
      abbr: 'ST',
      url: 'stats.html',
      theme: 'theme-brown',
      animationDelay: 1.2
    },
    {
      title: 'EasyDict',
      abbr: 'ED',
      url: 'easydict.html',
      theme: 'theme-yellow',
      animationDelay: 1.4
    }
  ];
}

// Les autres pages (pr\u00e9pa, planning, etc.) peuvent d\u00e9clarer leurs propres tuiles
// en pla\u00e7ant un fichier JavaScript dans apps/<page>.js pour alimenter APP_CATALOG.
