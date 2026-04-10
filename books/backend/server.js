const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');
const db = require('./db');
const { getPriceFromDb, syncSetPrices } = require('./poketrace');
const { fetchJpPrice } = require('./price_scraper');

const app = express();
app.use(cors());
app.use(express.json());

const PTCG_KEY = process.env.POKEMONTCG_KEY;
const PTCG_BASE = 'https://api.pokemontcg.io/v2';
const ptcgHeaders = { 'X-Api-Key': PTCG_KEY };

const EXCHANGE_API = 'https://v6.exchangerate-api.com/v6/58ba6f659ed119cfab3d522b/latest/USD';

// ---- 匯率工具 ----
function getCachedRates() {
  const row = db.prepare('SELECT rates_json, updated_at FROM exchange_rates WHERE base = ?').get('USD');
  if (!row) return null;
  return { rates: JSON.parse(row.rates_json), updatedAt: row.updated_at };
}

async function refreshRates() {
  try {
    const r = await fetch(EXCHANGE_API);
    const data = await r.json();
    if (data.result !== 'success') throw new Error('API error: ' + data['error-type']);
    const rates = data.conversion_rates;
    db.prepare(`
      INSERT INTO exchange_rates (base, rates_json, updated_at)
      VALUES ('USD', ?, ?)
      ON CONFLICT(base) DO UPDATE SET rates_json = excluded.rates_json, updated_at = excluded.updated_at
    `).run(JSON.stringify(rates), Date.now());
    console.log('[rates] 匯率更新完成 JPY:', rates.JPY, 'TWD:', rates.TWD);
    return rates;
  } catch (e) {
    console.error('[rates] 更新失敗:', e.message);
    return null;
  }
}

// 取得 JPY→TWD 匯率（USD/JPY 與 USD/TWD 換算）
function getJpyToTwd() {
  const cached = getCachedRates();
  if (!cached) return 0.21; // fallback
  const { JPY, TWD } = cached.rates;
  return Math.round((TWD / JPY) * 10000) / 10000;
}

// 啟動時若無快取則立即抓一次
if (!getCachedRates()) {
  refreshRates();
}

// ---- 代理 pokemontcg.io（帶後端 key，前端不暴露）----
app.get('/api/cards', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const r = await fetch(`${PTCG_BASE}/cards?${params}`, { headers: ptcgHeaders });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/cards/:id', async (req, res) => {
  try {
    const r = await fetch(`${PTCG_BASE}/cards/${req.params.id}`, { headers: ptcgHeaders });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/sets', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const r = await fetch(`${PTCG_BASE}/sets?${params}`, { headers: ptcgHeaders });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---- 從 DB 取價格（前端打這個，不打外部 API）----
app.get('/api/price/:ptcgId', (req, res) => {
  const prices = getPriceFromDb(req.params.ptcgId);
  if (!prices) return res.status(404).json({ error: 'not found' });
  res.json({ prices });
});

// ---- 手動觸發同步某系列 ----
app.post('/api/admin/sync-set', async (req, res) => {
  const { setId } = req.body;
  if (!setId) return res.status(400).json({ error: 'setId required' });

  try {
    // 先從 pokemontcg 抓該系列所有卡片
    let allCards = [], page = 1;
    while (true) {
      const r = await fetch(
        `${PTCG_BASE}/cards?q=set.id:${setId}&pageSize=250&page=${page}`,
        { headers: ptcgHeaders }
      );
      const body = await r.json();
      allCards = allCards.concat(body.data || []);
      if (allCards.length >= body.totalCount) break;
      page++;
    }

    const setInfo = allCards[0]?.set || { name: setId };
    const count = await syncSetPrices(setId, setInfo.name, allCards);
    res.json({ synced: count, total: allCards.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Sync 狀態 ----
app.get('/api/admin/sync-status', (req, res) => {
  const logs = db.prepare('SELECT * FROM sync_log ORDER BY synced_at DESC').all();
  const total = db.prepare('SELECT COUNT(*) as c FROM price_cache WHERE prices_json IS NOT NULL').get();
  res.json({ logs, totalWithPrices: total.c });
});

// ---- 點擊追蹤：紀錄卡片被點閱次數 ----
app.post('/api/cards/:id/click', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`
      INSERT INTO card_stats (ptcg_id, click_count)
      VALUES (?, 1)
      ON CONFLICT(ptcg_id) DO UPDATE SET click_count = click_count + 1
    `).run(id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---- 取得前 10 名熱門卡片 ----
app.get('/api/popular-cards', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.ptcg_id as id, s.click_count, p.name, p.prices_json, p.set_id
      FROM card_stats s
      LEFT JOIN price_cache p ON s.ptcg_id = p.ptcg_id
      ORDER BY s.click_count DESC
      LIMIT 10
    `).all();

    const data = rows.map(r => ({
      id: r.id,
      name: r.name || '未知卡片',
      set: { id: r.set_id },
      clickCount: r.click_count
    }));
    res.json({ data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---- 抓取日版價格 (Scraper Proxy) ----
app.get('/api/jp-price', async (req, res) => {
  const { setId, number, total } = req.query;
  if (!setId || !number || !total) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const jpyToTwd = getJpyToTwd();
    const data = await fetchJpPrice(setId, number, total, jpyToTwd);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- 取得目前匯率快取 ----
app.get('/api/rates', (req, res) => {
  const cached = getCachedRates();
  if (!cached) return res.status(404).json({ error: 'no rates cached yet' });
  const { JPY, TWD } = cached.rates;
  res.json({
    usdToJpy: JPY,
    usdToTwd: TWD,
    jpyToTwd: Math.round((TWD / JPY) * 10000) / 10000,
    updatedAt: new Date(cached.updatedAt).toISOString(),
  });
});

// ---- Cron：每天早上 8 點更新匯率 ----
cron.schedule('0 8 * * *', () => {
  console.log('[cron] 更新匯率...');
  refreshRates();
});

// ---- Cron：每天凌晨 2 點更新最近 5 個系列 ----
cron.schedule('0 2 * * *', async () => {
  console.log('[cron] 開始每日價格更新...');
  try {
    const r = await fetch(`${PTCG_BASE}/sets?orderBy=-releaseDate&pageSize=5`, { headers: ptcgHeaders });
    const { data: sets } = await r.json();

    for (const set of sets) {
      // 抓該系列所有卡片
      let allCards = [], page = 1;
      while (true) {
        const cr = await fetch(
          `${PTCG_BASE}/cards?q=set.id:${set.id}&pageSize=250&page=${page}`,
          { headers: ptcgHeaders }
        );
        const body = await cr.json();
        allCards = allCards.concat(body.data || []);
        if (allCards.length >= body.totalCount) break;
        page++;
      }
      await syncSetPrices(set.id, set.name, allCards);

      // 避免打太快
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (e) {
    console.error('[cron] 更新失敗:', e.message);
  }
});

app.listen(3000, () => console.log('Backend running on :3000'));
