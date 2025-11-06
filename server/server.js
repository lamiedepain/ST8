const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// Serve static files from the project root so pages under /html are available
app.use(express.static(path.join(__dirname, '..')));

const rootHtml = path.join(__dirname, '..');

// MongoDB connection states
const MONGOOSE_CONNECTED = 1;

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/st8';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will continue running without database connection.');
    console.log('File-based fallback will be used for data storage.');
  });

// Schema for agents data
const agentsSchema = new mongoose.Schema({
  agents: { type: Array, default: [] },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

const Agents = mongoose.model('Agents', agentsSchema);

// Map requests for '/name.html' to '/html/name.html' when appropriate
app.use((req, res, next) => {
  try {
    if (req.method !== 'GET') return next();
    if (!req.path || !req.path.endsWith('.html')) return next();
    // basename includes the .html
    const name = path.basename(req.path);
    const candidate = path.join(__dirname, '..', 'html', name);
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  } catch (e) {
    // ignore and continue
  }
  return next();
});
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

app.get('/api/agents', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTED) {
      // Fallback to file-based storage
      const data = readData();
      if (data) {
        // Normalize presence codes
        if (Array.isArray(data.agents)) {
          data.agents.forEach(a => {
            if (a.presences) {
              Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
            }
          });
        }
        return res.json(data);
      }
      return res.json({ agents: [], metadata: {} });
    }
    
    let doc = await Agents.findOne();
    if (!doc) {
      // Load from file if not in DB
      const data = readData();
      if (data) {
        doc = new Agents(data);
        await doc.save();
      } else {
        return res.json({ agents: [], metadata: {} });
      }
    }
    // Normalize presence codes
    if (Array.isArray(doc.agents)) {
      doc.agents.forEach(a => {
        if (a.presences) {
          Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
        }
      });
    }
    res.json(doc.toObject());
  } catch (e) {
    console.error('GET /api/agents error:', e);
    // Fallback to file on error
    try {
      const data = readData();
      if (data) return res.json(data);
    } catch (fileErr) {
      console.error('File fallback error:', fileErr);
    }
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.agents) return res.status(400).json({ error: 'missing agents' });
    // Normalize incoming agents' presences
    const incoming = body.agents || [];
    incoming.forEach(a => {
      if (a.presences) {
        Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
      }
    });
    const updateData = {
      agents: incoming,
      metadata: { ...body.metadata, last_modified: new Date().toISOString() }
    };
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTED) {
      // Fallback to file-based storage
      writeData(updateData);
      return res.json({ ok: true });
    }
    
    await Agents.findOneAndUpdate({}, updateData, { upsert: true, new: true });
    // Also write to file as backup
    writeData(updateData);
    res.json({ ok: true });
  } catch (e) {
    console.error('POST /api/agents error:', e);
    // Try file fallback on error
    try {
      const body = req.body;
      if (body && body.agents) {
        writeData({
          agents: body.agents,
          metadata: { ...body.metadata, last_modified: new Date().toISOString() }
        });
        return res.json({ ok: true });
      }
    } catch (fileErr) {
      console.error('File fallback error:', fileErr);
    }
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/agents/:matricule', async (req, res) => {
  try {
    const mat = req.params.matricule;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTED) {
      // Fallback to file-based storage
      const data = readData();
      if (!data) return res.status(404).json({ error: 'no data' });
      const before = (data.agents || []).length;
      data.agents = (data.agents || []).filter(a => (a.matricule || '') !== mat);
      if (data.agents.length === before) return res.status(404).json({ error: 'not found' });
      data.metadata = data.metadata || {};
      data.metadata.last_modified = new Date().toISOString();
      writeData(data);
      return res.json({ ok: true });
    }
    
    const doc = await Agents.findOne();
    if (!doc) return res.status(404).json({ error: 'no data' });
    const before = doc.agents.length;
    doc.agents = doc.agents.filter(a => (a.matricule || '') !== mat);
    if (doc.agents.length === before) return res.status(404).json({ error: 'not found' });
    doc.metadata = doc.metadata || {};
    doc.metadata.last_modified = new Date().toISOString();
    await doc.save();
    // Also write to file as backup
    writeData({ agents: doc.agents, metadata: doc.metadata });
    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/agents error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Health endpoint for quick checks (Render health check can use this)
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Serve html files for friendly routes (e.g. /agents -> /html/agents.html)
// Only apply to non-API GET requests. Static middleware will handle existing files first.
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path && req.path.startsWith('/api')) return next();
  
  // Skip static assets (js, css, images, etc.) - let them 404 naturally
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') return next();

  const rootHtml = path.join(__dirname, '..', 'html');
  // If requesting '/', return the landing page
  if (req.path === '/' || req.path === '') {
    const rootIndex = path.join(__dirname, '..', 'index.html');
    if (fs.existsSync(rootIndex)) return res.sendFile(rootIndex);
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

  // For HTML requests that don't match, return 404 instead of index.html
  // This prevents serving index.html for missing resources
  return res.status(404).type('text/plain').send('Page not found');
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log('ST8 server running on', port));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
