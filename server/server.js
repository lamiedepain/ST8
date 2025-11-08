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
// Track MongoDB connection status
let mongoConnected = false;

// Connect to MongoDB only if MONGO_URI is set
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      mongoConnected = true;
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      mongoConnected = false;
    });
} else {
  console.log('No MONGO_URI set, using file storage');
}

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
  return res.sendFile(rootIndex);
});
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const DATA_PATH = process.env.RENDER ? '/tmp/agents_source.json' : path.join(__dirname, 'data', 'agents_source.json');

// Copy data file to /tmp on Render startup and ensure it exists
if (process.env.RENDER) {
  const sourcePath = path.join(__dirname, 'data', 'agents_source.json');
  try {
    // Ensure /tmp directory exists
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp', { recursive: true });
    }

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, DATA_PATH);
      console.log('Data file copied to /tmp for Render');
    } else {
      // Create empty data file if source doesn't exist
      const emptyData = { agents: [], metadata: {} };
      fs.writeFileSync(DATA_PATH, JSON.stringify(emptyData, null, 2));
      console.log('Empty data file created in /tmp for Render');
    }
  } catch (e) {
    console.error('Failed to setup data file in /tmp:', e.message);
    // Try to create empty file anyway
    try {
      const emptyData = { agents: [], metadata: {} };
      fs.writeFileSync(DATA_PATH, JSON.stringify(emptyData, null, 2));
      console.log('Fallback: empty data file created in /tmp');
    } catch (fallbackError) {
      console.error('Critical: cannot create data file in /tmp:', fallbackError.message);
    }
  }
}

function readData() {
  try {
    console.log('Reading data from:', DATA_PATH);

    // Ensure file exists, create empty one if not
    if (!fs.existsSync(DATA_PATH)) {
      console.log('Data file does not exist, creating empty file');
      const emptyData = { agents: [], metadata: {} };
      fs.writeFileSync(DATA_PATH, JSON.stringify(emptyData, null, 2));
      return emptyData;
    }

    const content = fs.readFileSync(DATA_PATH, 'utf8');
    console.log('File content length:', content.length);

    if (!content || content.trim() === '') {
      console.log('File is empty, returning empty data');
      return { agents: [], metadata: {} };
    }

    const data = JSON.parse(content);
    console.log('Parsed data keys:', Object.keys(data));

    // Ensure data has required structure
    if (!data || typeof data !== 'object') {
      console.log('Invalid data structure, returning empty data');
      return { agents: [], metadata: {} };
    }

    return data;
  } catch (e) {
    console.error('readData error:', e.message);
    console.error('File exists check:', fs.existsSync(DATA_PATH));

    // Return empty data instead of null to prevent crashes
    console.log('Returning empty data due to error');
    return { agents: [], metadata: {} };
  }
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
  console.log('writeData called with object keys:', Object.keys(obj || {}));
  const tmp = DATA_PATH + '.tmp';
  const bak = DATA_PATH + '.' + Date.now() + '.bak';

  try {
    console.log('Writing to temp file:', tmp);
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
    console.log('Temp file written successfully');

    try {
      console.log('Creating backup file:', bak);
      fs.copyFileSync(DATA_PATH, bak);
      console.log('Backup created');
    } catch (backupErr) {
      console.log('Backup failed (probably first write):', backupErr.message);
    }

    console.log('Renaming temp to final file');
    fs.renameSync(tmp, DATA_PATH);
    console.log('File write completed successfully');
  } catch (e) {
    console.error('writeData error:', e.message);
    console.error('DATA_PATH:', DATA_PATH);
    console.error('Directory exists:', fs.existsSync(path.dirname(DATA_PATH)));
    console.error('Directory writable:', fs.accessSync ? 'checking...' : 'unknown');
    throw e;
  }
}

app.get('/api/agents', async (req, res) => {
  try {
    console.log('GET /api/agents - MONGO_URI defined:', !!process.env.MONGO_URI, 'connected:', mongoConnected);

    if (process.env.MONGO_URI && mongoConnected) {
      // Use MongoDB
      console.log('Using MongoDB for agents data');
      let doc = await Agents.findOne();
      if (!doc) {
        // Load from file if not in DB
        const data = readData();
        if (data) {
          console.log('Loading data from file to MongoDB');
          doc = new Agents(data);
          await doc.save();
        } else {
          console.log('No data file found, returning empty');
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
    } else {
      // Use file storage only
      console.log('Using file storage for agents data (MongoDB not available)');
      console.log('DATA_PATH:', DATA_PATH);
      console.log('File exists:', fs.existsSync(DATA_PATH));

      const data = readData();
      console.log('Data loaded:', !!data);
      console.log('Data type:', typeof data);
      console.log('Data keys:', data ? Object.keys(data) : 'null');

      // Ensure we have valid data structure
      const safeData = data && typeof data === 'object' ? data : { agents: [], metadata: {} };

      if (safeData.agents && Array.isArray(safeData.agents)) {
        console.log('Processing', safeData.agents.length, 'agents');
        // Normalize presence codes
        safeData.agents.forEach(a => {
          if (a.presences) {
            Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
          }
        });
      } else {
        console.log('No agents array found, initializing empty');
        safeData.agents = [];
      }

      if (!safeData.metadata) {
        safeData.metadata = {};
      }

      res.json(safeData);
    }
  } catch (e) {
    console.error('GET /api/agents error:', e);
    // If MongoDB operation failed, try file storage as fallback
    if (process.env.MONGO_URI && mongoConnected) {
      console.log('MongoDB operation failed, falling back to file storage');
      try {
        const data = readData();
        const safeData = data && typeof data === 'object' ? data : { agents: [], metadata: {} };

        if (safeData.agents && Array.isArray(safeData.agents)) {
          safeData.agents.forEach(a => {
            if (a.presences) {
              Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
            }
          });
        } else {
          safeData.agents = [];
        }

        if (!safeData.metadata) {
          safeData.metadata = {};
        }

        return res.json(safeData);
      } catch (fallbackError) {
        console.error('File fallback also failed:', fallbackError);
      }
    }

    // Final fallback - return empty data
    console.log('All storage methods failed, returning empty data');
    res.json({ agents: [], metadata: {} });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    console.log('POST /api/agents - Received request');
    const body = req.body;
    console.log('Request body keys:', Object.keys(body || {}));
    console.log('Has agents:', !!(body && body.agents));

    if (!body || !body.agents) {
      console.log('Missing agents in request body');
      return res.status(400).json({ error: 'missing agents' });
    }

    // Normalize incoming agents' presences
    const incoming = body.agents || [];
    console.log('Processing', incoming.length, 'agents');

    incoming.forEach(a => {
      if (a.presences) {
        Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
      }
    });

    if (process.env.MONGO_URI && mongoConnected) {
      console.log('Using MongoDB for save');
      // Use MongoDB
      const updateData = {
        agents: incoming,
        metadata: { ...body.metadata, last_modified: new Date().toISOString() }
      };
      await Agents.findOneAndUpdate({}, updateData, { upsert: true, new: true });
      console.log('MongoDB save successful');
      res.json({ ok: true });
    } else {
      console.log('Using file storage for save (MongoDB not available)');
      console.log('DATA_PATH for write:', DATA_PATH);
      // Use file storage only
      const updateData = {
        agents: incoming,
        metadata: { ...body.metadata, last_modified: new Date().toISOString() }
      };
      console.log('Calling writeData with', incoming.length, 'agents');
      writeData(updateData);
      console.log('File write completed successfully');
      res.json({ ok: true });
    }
  } catch (e) {
    console.error('POST /api/agents error:', e);
    // If MongoDB operation failed, try file storage as fallback
    if (process.env.MONGO_URI && mongoConnected) {
      console.log('MongoDB operation failed, falling back to file storage');
      try {
        const updateData = {
          agents: req.body.agents || [],
          metadata: { ...req.body.metadata, last_modified: new Date().toISOString() }
        };
        // Normalize again in case we didn't get here
        updateData.agents.forEach(a => {
          if (a.presences) {
            Object.keys(a.presences).forEach(d => { a.presences[d] = normalizeCode(a.presences[d]); });
          }
        });
        writeData(updateData);
        console.log('File fallback save successful');
        return res.json({ ok: true });
      } catch (fallbackError) {
        console.error('File fallback also failed:', fallbackError);
      }
    }
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.delete('/api/agents/:matricule', async (req, res) => {
  try {
    const mat = req.params.matricule;
    console.log('DELETE /api/agents/' + mat + ' - MONGO_URI defined:', !!process.env.MONGO_URI, 'connected:', mongoConnected);

    if (process.env.MONGO_URI && mongoConnected) {
      // Use MongoDB
      const doc = await Agents.findOne();
      if (!doc) return res.status(404).json({ error: 'no data' });
      const before = doc.agents.length;
      doc.agents = doc.agents.filter(a => (a.matricule || '') !== mat);
      if (doc.agents.length === before) return res.status(404).json({ error: 'not found' });
      doc.metadata = doc.metadata || {};
      doc.metadata.last_modified = new Date().toISOString();
      await doc.save();
      res.json({ ok: true });
    } else {
      // Use file storage only
      console.log('Using file storage for delete (MongoDB not available)');
      const data = readData();
      if (!data || !data.agents) return res.status(404).json({ error: 'no data' });
      const before = data.agents.length;
      data.agents = data.agents.filter(a => (a.matricule || '') !== mat);
      if (data.agents.length === before) return res.status(404).json({ error: 'not found' });
      data.metadata = data.metadata || {};
      data.metadata.last_modified = new Date().toISOString();
      writeData(data);
      res.json({ ok: true });
    }
  } catch (e) {
    console.error('DELETE /api/agents error:', e);
    // If MongoDB operation failed, try file storage as fallback
    if (process.env.MONGO_URI && mongoConnected) {
      console.log('MongoDB operation failed, falling back to file storage for delete');
      try {
        const data = readData();
        if (!data || !data.agents) return res.status(404).json({ error: 'no data' });
        const before = data.agents.length;
        data.agents = data.agents.filter(a => (a.matricule || '') !== req.params.matricule);
        if (data.agents.length === before) return res.status(404).json({ error: 'not found' });
        data.metadata = data.metadata || {};
        data.metadata.last_modified = new Date().toISOString();
        writeData(data);
        return res.json({ ok: true });
      } catch (fallbackError) {
        console.error('File fallback also failed:', fallbackError);
      }
    }
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

  const rootHtml = path.join(__dirname, '..');
  console.log('Handling request for:', req.path, 'rootHtml:', rootHtml);
  // If requesting '/', return the landing page
  if (req.path === '/' || req.path === '') {
    return res.sendFile(path.join(rootHtml, 'index.html'));
  }

  // Try mapping /foo -> /html/foo.html
  const candidate = path.join(rootHtml, 'html', req.path + '.html');
  if (fs.existsSync(candidate)) {
    return res.sendFile(candidate);
  }

  // Try direct file under html (if user requested /html/xxx)
  const direct = path.join(__dirname, '..', req.path);
  if (fs.existsSync(direct)) {
    return res.sendFile(direct);
  }

  // Fallback to index.html so client-side routes continue to work
  console.log('Fallback to index.html:', path.join(rootHtml, 'index.html'));
  return res.sendFile(path.join(rootHtml, 'index.html'));
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
