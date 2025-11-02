const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// Serve static files from the project root so pages under /html are available
app.use(express.static(path.join(__dirname, '..')));
// Ensure root URL serves the main app landing page (index is under /html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const DATA_PATH = path.join(__dirname, '..', 'data', 'agents_source.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch (e) { return null; }
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
  res.json(data);
});

app.post('/api/agents', (req, res) => {
  const body = req.body;
  if (!body || !body.agents) return res.status(400).json({ error: 'missing agents' });
  const data = readData() || {};
  data.agents = body.agents;
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('ST8 server running on', port));
