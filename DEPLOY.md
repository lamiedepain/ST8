DEPLOY to Render (Web Service) — ST8

This document describes the recommended Render configuration to run the Express server and serve both the static pages and the API (`/api/agents`).

Recommended (run Node as a Web Service — keeps /api/agents working):

1) Create a new service on Render
   - New -> Web Service
   - Connect your GitHub repo `lamiedepain/ST8`, branch `main`.

2) Important fields
   - Name: whatever you want (e.g. `st8`)
   - Root Directory: `server`  <-- important: this ensures Render runs `npm install` inside `server/` where package.json lives
   - Build Command: (leave empty; Render will run `npm install` in the root directory you selected)
   - Start Command: `npm start`
   - Auto Deploy: ON (optional)
   - Health Check Path: `/health`  (we added this endpoint to help Render verify the app is healthy)

3) If you prefer not to use Root Directory in Render, use these commands instead:
   - Build Command: `npm --prefix server install`
   - Start Command: `npm --prefix server start`

4) After creating the service
   - Open the Live Logs in Render while the first deploy runs. If the process fails, check whether npm is installing in the correct directory.
   - If `GET /` returns 404 on the public URL but `GET /html/index.html` works, double-check that Node is actually running (check logs) and that the Start Command runs the `server/server.js` process.

Static Site option (only if you don't need the API)

- If you want only the front-end and no Express API, create a Static Site on Render:
  - Publish directory: `/` (repo root)
  - Render will serve `index.html` from the repo root.
  - WARNING: `/api/agents` will not work in this mode.

Testing / smoke checks

- Health:
  curl -i https://<your-app>.onrender.com/health

- Pages:
  curl -i https://<your-app>.onrender.com/
  curl -i https://<your-app>.onrender.com/html/planification.html
  curl -i https://<your-app>.onrender.com/html/prepa.html

- API:
  curl -i https://<your-app>.onrender.com/api/agents

Notes

- The `server` folder contains `package.json` and `server.js`. Render must run Node in that folder or run `npm --prefix server` commands.
- The `/health` endpoint returns JSON with current server time and ok=true.
- The code uses relative client-side API paths (`/api/agents`) so the app works behind the same origin when Node is running.

If you want, I can also add a tiny systemd-like restart instruction or a GitHub Actions workflow to trigger deployments, but Render auto-deploy on push to `main` is usually sufficient.
