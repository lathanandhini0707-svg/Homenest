const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = Number(process.env.PORT || 3000);

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(
  path.join(DATA_DIR, 'homenest.sqlite')
);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS app_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

app.use(
  express.json({
    limit: '50mb'
  })
);

/* Serve HomeNest website */
app.use(
  express.static(ROOT, {
    index: 'homenest.html'
  })
);

/* Database queries */
const getRow = db.prepare(`
  SELECT
    payload,
    updated_at AS updatedAt
  FROM app_data
  WHERE id = 1
`);

const putRow = db.prepare(`
  INSERT INTO app_data (
    id,
    payload,
    updated_at
  )
  VALUES (1, ?, ?)

  ON CONFLICT(id)
  DO UPDATE SET
    payload = excluded.payload,
    updated_at = excluded.updated_at
`);


/* ---------------------------------
   BACKEND HEALTH CHECK
---------------------------------- */

app.get('/api/health', (_req, res) => {

  res.json({
    ok: true,
    service: 'HomeNest backend',
    database: 'SQLite'
  });

});


/* ---------------------------------
   GET HOMENEST DATA
---------------------------------- */

app.get('/api/data', (_req, res) => {

  const row = getRow.get();

  if (!row) {

    return res.status(404).json({
      error: 'No HomeNest data stored yet'
    });

  }

  let data;

  try {

    data = JSON.parse(row.payload);

  } catch (error) {

    return res.status(500).json({
      error: 'Stored HomeNest data is invalid'
    });

  }

  res.json({
    data,
    updatedAt: row.updatedAt
  });

});


/* ---------------------------------
   SAVE / UPDATE HOMENEST DATA
---------------------------------- */

app.put('/api/data', (req, res) => {

  if (
    !req.body ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body)
  ) {

    return res.status(400).json({
      error: 'HomeNest data must be a JSON object'
    });

  }

  const now = new Date().toISOString();

  const payload = JSON.stringify(req.body);

  putRow.run(
    payload,
    now
  );

  res.json({
    ok: true,
    updatedAt: now,
    bytes: Buffer.byteLength(payload)
  });

});


/* ---------------------------------
   DOWNLOAD BACKUP
---------------------------------- */

app.get('/api/backup', (_req, res) => {

  const row = getRow.get();

  if (!row) {

    return res.status(404).json({
      error: 'No HomeNest data stored yet'
    });

  }

  res.setHeader(
    'Content-Type',
    'application/json'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="homenest-backup.json"'
  );

  res.send(row.payload);

});


/* ---------------------------------
   START SERVER
---------------------------------- */

app.listen(PORT, () => {

  console.log(
    `HomeNest running at http://localhost:${PORT}`
  );

  console.log(
    `Database: ${path.join(
      DATA_DIR,
      'homenest.sqlite'
    )}`
  );

});
