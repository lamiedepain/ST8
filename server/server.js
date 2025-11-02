const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// Serve static files from the project root so pages under /html are available
app.use(express.static(path.join(__dirname, '..')));
// Quick redirect middleware for friendly routes when a matching HTML exists
// This helps when the host serves static files or the URL is requested directly
// (e.g. GET /agents -> redirect to /html/agents.html)
app.use((req, res, next) => {
  try {
    if (req.method !== 'GET') return next();
    if (req.path === '/' || req.path === '') return next();
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/html') || req.path.startsWith('/assets')) return next();

    const rel = req.path.replace(/^\/+/, ''); // remove leading slash
    if (!rel) return next();
    const candidate = path.join(__dirname, '..', 'html', rel + '.html');
    if (fs.existsSync(candidate)) {
      // Redirect to the canonical /html/... page so static hosts will serve it
      return res.redirect(302, '/html/' + rel + '.html');
    }
  } catch (e) {
    // any error, continue to next handler
  }
  return next();
});

// Ensure root URL serves the main app landing page (index is under /html)
app.get('/', (req, res) => {
  // Prefer root-level index.html if present (we may have moved the homepage to repo root)
  const rootIndex = path.join(__dirname, '..', 'index.html');
  if (fs.existsSync(rootIndex)) return res.sendFile(rootIndex);
  // Fallback to the html/ index if root index is not present
  return res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const DATA_PATH = path.join(__dirname, '..', 'data', 'agents_source.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch (e) { return null; }
}

// normalize status codes server-side to canonical forms (similar to client)
function normalizeCode(code) {
  if (!code) return '';
  let k = String(code).trim().toUpperCase();
  k = k.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (k === 'PREVISIONELLE' || k === 'PREVISIONNEL' || k === 'PREVISION' || k === 'PREV' || k === 'PR') return 'PREV';
  if (k === 'ASTH' || k === 'AST-H') return 'ASTH';
  if (k === 'ASTS' || k === 'AST-S') return 'ASTS';
  return k;
}

function writeData(obj) {
  const tmp = DATA_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
  const bak = DATA_PATH + '.' + Date.now() + '.bak';
  try { fs.copyFileSync(DATA_PATH, bak); } catch (e) { }
  fs.renameSync(tmp, DATA_PATH);
}

app.get('/api/agents', (req, res) => {
  const data = readData(); if (!data) return res.status(500).json({ error: 'cannot read data' });
  // Normalize presence codes before sending
  if (Array.isArray(data.agents)) {
    data.agents.forEach(a => {
      if (a.presences) {
        Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
      }
    });
  }
  res.json(data);
});

app.post('/api/agents', (req, res) => {
  const body = req.body;
  if (!body || !body.agents) return res.status(400).json({ error: 'missing agents' });
  // normalize incoming agents' presences to canonical codes before writing
  const incoming = body.agents || [];
  incoming.forEach(a => {
    if (a.presences) {
      Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
    }
  });
  const data = readData() || {};
  data.agents = incoming;
  data.metadata = data.metadata || {};
  data.metadata.last_modified = new Date().toISOString();
  try { writeData(data); return res.json({ ok: true }); } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.delete('/api/agents/:matricule', (req, res) => {
  const mat = req.params.matricule;
  const data = readData(); if (!data) return res.status(500).json({ error: 'cannot read data' });
  const before = data.agents.length;
  data.agents = data.agents.filter(a => (a.matricule || '') !== mat);
  if (data.agents.length === before) return res.status(404).json({ error: 'not found' });
  data.metadata = data.metadata || {};
  data.metadata.last_modified = new Date().toISOString();
  try { writeData(data); return res.json({ ok: true }); } catch (e) { return res.status(500).json({ error: e.message }); }
});

// Serve html files for friendly routes (e.g. /agents -> /html/agents.html)
// Only apply to non-API GET requests. Static middleware will handle existing files first.
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path && req.path.startsWith('/api')) return next();

  const rootHtml = path.join(__dirname, '..', 'html');
  // If requesting '/', return the landing page
  if (req.path === '/' || req.path === '') {
    return res.sendFile(path.join(rootHtml, 'index.html'));
  }

  // Try mapping /foo -> /html/foo.html
  const candidate = path.join(rootHtml, req.path + '.html');
  if (fs.existsSync(candidate)) {
    return res.sendFile(candidate);
  }

  // Try direct file under html (if user requested /html/xxx)
  const direct = path.join(__dirname, '..', req.path);
  if (fs.existsSync(direct)) {
    return res.sendFile(direct);
  }

  // Fallback to index.html so client-side routes continue to work
  return res.sendFile(path.join(rootHtml, 'index.html'));
});

// Health endpoint for quick checks (Render health check can use this)
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('ST8 server running on', port));
