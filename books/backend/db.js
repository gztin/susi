const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'poker.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS card_stats (
    ptcg_id      TEXT PRIMARY KEY,
    click_count  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS exchange_rates (
    base       TEXT PRIMARY KEY,
    rates_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

module.exports = db;
