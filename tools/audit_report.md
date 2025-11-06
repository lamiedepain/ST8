Audit report - ST8 (v2)

Date: 2025-11-06

Résumé rapide
------------
- Objectif: repérer occurrences du FAB inline, pages sans `data-include`, doublons de scripts et incohérences de liens (/html/ vs racine).
- Action effectuée: centralisation du FAB dans `includes/fab.html` et remplacement des blocs inline dans 17 fichiers (root + `html/` copies). Ces changements ont été commités et poussés (commit: "chore(ui): centralise FAB into includes and replace inline instances").

Fichiers où le FAB inline a été trouvé et remplacé
-------------------------------------------------
Root:
- index.html
- stats.html
- prepa.html
- planning.html
- elements.html
- easydict.html
- bimensuel.html
- agents.html

Copies sous `html/`:
- html/index.html
- html/stats.html
- html/prepa.html
- html/planning.html
- html/easydict.html
- html/elements.html
- html/bihebdo.html
- html/agents.html

Fichiers modifiés
-----------------
- includes/fab.html (nouveau)
- Les fichiers listés ci-dessus ont été modifiés pour remplacer le bloc FAB inline par `<div data-include="fab"></div>`.

Pages utilisant les includes `header`/`footer`
--------------------------------------------
La majorité des pages utilisent déjà `data-include="header"` et `data-include="footer"`. Exemples:
- `stats.html`, `prepa.html`, `planning.html`, `index.html`, `html/*`.

Doublons / structure des scripts
--------------------------------
- Pattern observé: les pages racine incluent `js/include-partials.js`, `js/apps-data.js`, `js/script.js` (chemins relatifs). Les copies sous `html/` incluent les mêmes scripts mais en remontant `../js/...`.
- Aucun fichier n'avait plusieurs inclusions du même script dans un même document (pas de duplication intra-fichier détectée). C'est acceptable pour un site statique ; l'étape suivante peut être de centraliser un seul bundle si souhaité.

Liens absolus vs relatifs (/html/)
----------------------------------
- Mélange observé: certaines pages (surtout les copies `html/*` et `index.html` root) utilisent des liens absolus commençant par `/html/...` tandis que d'autres utilisent des liens relatifs `planning.html`, `agents.html`, etc.
- Conséquence: comportement variant selon la page courant (les liens relatifs pointent vers la même arborescence que la page courante). Le loader `js/include-partials.js` contient une fonction `normalizeRootHtmlLinks()` qui rewrite les liens commençant par `/name.html` vers `/html/name.html` — donc il tente de normaliser les liens absolus racine.

Recommandations / prochaines étapes
-----------------------------------
1) Choisir une stratégie canonique pour les pages:
   - Option A (recommandé): standardiser sur les pages sous `html/` comme contenu canonique (conserver `index.html` à la racine comme point d'entrée). Avantage: organisation claire, `/html/` héberge les pages accessibles directement.
   - Option B: garder les pages à la racine et supprimer les copies dans `html/`.

2) Après choix de la stratégie, exécuter automatiquement:
   - Mise à jour des hrefs (script CSS/JS paths) pour être cohérents.
   - Supprimer les copies/redondances inutiles (ou garder `html/` copies et supprimer les root si on choisit A).
   - Valider visuellement chaque page et le loader des partials.

3) QA/Clean:
   - Rechercher et supprimer scripts non utilisés.
   - Regrouper JavaScript (optionnel) pour simplifier les includes.
   - Lancer un test de déploiement sur Render (push + vérifier build logs si besoin).

Notes techniques
----------------
- Le loader de partials (`js/include-partials.js`) charge `/includes/<name>.html` (chemin absolu). `includes/fab.html` a été créé en conséquence.
- L'utilisation de liens relatifs dans `includes/fab.html` permet de fonctionner au mieux depuis n'importe quelle page (la résolution est relative à la page courante). Si vous préférez que le FAB pointe toujours sur les pages sous `/html/`, on peut mettre des href absolus `/html/xxx.html`.

Actions réalisées (commits)
--------------------------
- Commit: "chore(ui): centralise FAB into includes and replace inline instances" (17 fichiers modifiés, includes/fab.html ajouté)

Fichiers restants à auditer manuellement
---------------------------------------
- `scripts/` et `server/` — vérifier si des pages utilisent encore des chemins non standards.
- Les images et assets ayant des chemins absolus.

Proposition immédiate
---------------------
Je peux maintenant:
- A) Appliquer la stratégie A (déplacer/normaliser tout sous `html/` et corriger hrefs), ou
- B) Appliquer la stratégie B (centraliser tout à la racine et enlever `html/`), ou
- C) Générer un patch listant toutes les remplacements de liens (sans les appliquer) pour revue.

Demandez-moi laquelle des options vous préférez et je l'applique automatiquement.
