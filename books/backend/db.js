const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'poker.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS price_cache (
    ptcg_id      TEXT PRIMARY KEY,
    ptrace_id    TEXT,
    tcgplayer_id TEXT,
    set_id       TEXT,
    name         TEXT,
    prices_json  TEXT,
    synced_at    INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_set_id   ON price_cache(set_id);
  CREATE INDEX IF NOT EXISTS idx_tcg_id   ON price_cache(tcgplayer_id);
  CREATE INDEX IF NOT EXISTS idx_ptrace_id ON price_cache(ptrace_id);

  CREATE TABLE IF NOT EXISTS sync_log (
    set_id     TEXT PRIMARY KEY,
    set_name   TEXT,
    total      INTEGER,
    synced_at  INTEGER
  );

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
