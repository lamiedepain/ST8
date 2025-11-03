ST8 — local notes

But rapide pour dev local

Structure
- index.html (root) : landing page
- html/ : application pages (planning, agents, stats, prepa, bihebdo, ...)
- css/ : styles; legacy CSS moved to css/legacy/
- js/ : client scripts
- includes/ : header/footer partials injected by js/include-partials.js
- data/ : data files (agents_source.json). Old backups moved to data/backups/
- server/ : minimal Node server providing /api/agents endpoints (start with `npm start`)

Run locally
1. Start server (optional, required for saving changes):
   cd server
   npm install
   npm start
   # Server listens on PORT env or 3000 by default

2. Open in browser:
   http://localhost:3000/

Notes
- The site uses client-side includes via `js/include-partials.js`. Pages include header/footer with `<div data-include="header"></div>`.
- If you deploy statically (GitHub Pages), writing/saving agents will not work — you need the Node API or a replacement (serverless/BaaS).
