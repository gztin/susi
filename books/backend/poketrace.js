const fetch = require('node-fetch');
const db = require('./db');

const POKETRACE_KEY = process.env.POKETRACE_KEY;
const BASE = 'https://api.poketrace.com/v1';
const headers = { 'X-API-Key': POKETRACE_KEY };

// pokemontcg set ID → PokeTrace set slug 對應表
const SET_SLUG_MAP = {
  'base1':  'base-set',
  'base2':  'jungle',
  'base3':  'fossil',
  'base4':  'base-set-2',
  'base5':  'team-rocket',
  'gym1':   'gym-heroes',
  'gym2':   'gym-challenge',
  'neo1':   'neo-genesis',
  'neo2':   'neo-discovery',
  'neo3':   'neo-revelation',
  'neo4':   'neo-destiny',
  // 新系列通常 pokemontcg ID 就是 PokeTrace slug（用 - 分隔）
};

function toPoketraceSlug(setId) {
  if (SET_SLUG_MAP[setId]) return SET_SLUG_MAP[setId];
  // 嘗試直接用 setId（新系列通常一致）
  return setId;
}

// 查單張卡的 PokeTrace 價格（by ptrace_id，從 DB 取）
function getPriceFromDb(ptcgId) {
  const row = db.prepare('SELECT * FROM price_cache WHERE ptcg_id = ?').get(ptcgId);
  if (!row || !row.prices_json) return null;
  return JSON.parse(row.prices_json);
}

// 同步整個系列：先從 pokemontcg 拿卡片清單，再用名稱+系列去 PokeTrace 比對
async function syncSetPrices(setId, setName, ptcgCards) {
  console.log(`[sync] 開始同步 ${setName} (${setId})，共 ${ptcgCards.length} 張`);

  let synced = 0;
  const upsert = db.prepare(`
    INSERT INTO price_cache (ptcg_id, ptrace_id, tcgplayer_id, set_id, name, prices_json, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(ptcg_id) DO UPDATE SET
      ptrace_id=excluded.ptrace_id,
      tcgplayer_id=excluded.tcgplayer_id,
      prices_json=excluded.prices_json,
      synced_at=excluded.synced_at
  `);

  // PokeTrace 用 set slug 批次抓
  const ptraceMap = new Map(); // key: cardNumber, value: poketrace data
  let cursor = null;
  const slug = toPoketraceSlug(setId);

  do {
    const url = new URL(`${BASE}/cards`);
    url.searchParams.set('set', slug);
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      console.warn(`[sync] PokeTrace 查詢失敗: ${res.status}`);
      break;
    }
    const body = await res.json();
    for (const card of body.data || []) {
      if (card.cardNumber) ptraceMap.set(card.cardNumber, card);
      // 也用數字部分建索引，方便比對
      if (card.cardNumber) {
        const numOnly = card.cardNumber.split('/')[0].replace(/^0+/, '') || '0';
        ptraceMap.set(numOnly, card);
      }
    }
    cursor = body.pagination?.nextCursor || null;
  } while (cursor);

  console.log(`[sync] PokeTrace 回傳 ${ptraceMap.size} 筆`);

  // 對應 pokemontcg 卡片
  // pokemontcg number: "1", PokeTrace cardNumber: "001/102" → 取 / 前補零比對
  const syncAll = db.transaction(() => {
    for (const card of ptcgCards) {
      const cardNum = card.number;
      const numOnly = cardNum.replace(/^0+/, '') || '0';
      const ptrace = ptraceMap.get(cardNum) || ptraceMap.get(numOnly);

      upsert.run(
        card.id,
        ptrace?.id || null,
        ptrace?.refs?.tcgplayerId || null,
        setId,
        card.name,
        ptrace ? JSON.stringify(ptrace.prices || {}) : null,
        Date.now()
      );
      if (ptrace) synced++;
    }
  });
  syncAll();

  db.prepare(`
    INSERT INTO sync_log (set_id, set_name, total, synced_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(set_id) DO UPDATE SET set_name=excluded.set_name, total=excluded.total, synced_at=excluded.synced_at
  `).run(setId, setName, synced, Date.now());

  console.log(`[sync] ${setName} 完成，對應 ${synced}/${ptcgCards.length} 張`);
  return synced;
}

module.exports = { getPriceFromDb, syncSetPrices };
