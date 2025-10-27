Minimal server for ST8 planner

This project includes a lightweight Express server to persist `data/agents_source.json`.

Install & run (requires Node.js):

1. Open a terminal in `server` folder

```powershell
cd server
npm install
npm start
```

2. The server listens on port 3000 by default. The frontend (static files) can be served with any static server (python -m http.server 8000) and will call `/api/agents` endpoints on the same host (so use a proxy or run frontend on same origin).

API:
- GET /api/agents -> returns full JSON file
- POST /api/agents -> body { agents: [...] } replaces `agents` array and writes `data/agents_source.json`
- DELETE /api/agents/:matricule -> removes agent with matching matricule and writes file

Notes:
- This is a minimal implementation with file-based persistence and simple backups (`agents_source.json.<timestamp>.bak`).
- In production, run behind HTTPS and add authentication.
