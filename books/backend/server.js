const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer-core');
const db = require('./db');
const { fetchJpPrice } = require('./price_scraper');

const app = express();
app.use(cors());
app.use(express.json());

const CHROME_PATH = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// 爬蟲配置 - 使用 pokemondb.net 作為資料來源
const POKEMON_DB_BASE = 'https://pokemondb.net/card';

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

// ---- 代理 TCGdx API（支援多語言）----
app.get('/api/cards', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const params = new URLSearchParams();
    
    // 轉換查詢參數
    if (req.query.name) params.set('name', req.query.name);
    if (req.query.set) params.set('set.id', req.query.set); // TCGdx 使用 set.id
    if (req.query.page) params.set('page', req.query.page);
    if (req.query.pageSize) params.set('pageSize', req.query.pageSize);
    
    const url = `${TCGDX_BASE}/${lang}/cards${params.toString() ? '?' + params : ''}`;
    console.log('Fetching from TCGdx:', url);
    
    const r = await fetch(url);
    if (!r.ok) throw new Error(`TCGdx API error: ${r.status}`);
    
    const cards = await r.json();
    
    // 轉換為相容格式
    const result = {
      data: cards,
      totalCount: cards.length, // TCGdx 不提供總數，使用當前頁面數量
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 250
    };
    
    res.json(result);
  } catch (e) { 
    console.error('Cards API error:', e.message);
    res.status(500).json({ error: e.message }); 
  }
});

app.get('/api/cards/:id', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const r = await fetch(`${TCGDX_BASE}/${lang}/cards/${req.params.id}`);
    if (!r.ok) throw new Error(`TCGdx API error: ${r.status}`);
    
    const card = await r.json();
    res.json({ data: card });
  } catch (e) { 
    console.error('Card detail API error:', e.message);
    res.status(500).json({ error: e.message }); 
  }
});

app.get('/api/sets', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const params = new URLSearchParams();
    
    if (req.query.pageSize) params.set('pageSize', req.query.pageSize);
    
    const url = `${TCGDX_BASE}/${lang}/sets${params.toString() ? '?' + params : ''}`;
    console.log('Fetching sets from TCGdx:', url);
    
    const r = await fetch(url);
    if (!r.ok) throw new Error(`TCGdx API error: ${r.status}`);
    
    let sets = await r.json();
    
    // 如果有 orderBy 參數，進行排序
    if (req.query.orderBy === '-releaseDate') {
      // TCGdx 的系列通常已經按發布日期排序，但我們可以根據 ID 反向排序
      sets = sets.reverse();
    }
    
    const result = {
      data: sets,
      totalCount: sets.length
    };
    
    res.json(result);
  } catch (e) { 
    console.error('Sets API error:', e.message);
    res.status(500).json({ error: e.message }); 
  }
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
app.get('/api/popular-cards', async (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT ptcg_id as id, click_count
      FROM card_stats
      ORDER BY click_count DESC
      LIMIT 10
    `).all();

    // 從 TCGdx 取得卡片詳細資料
    const lang = req.query.lang || 'en';
    const data = [];
    
    for (const row of rows) {
      try {
        const cardRes = await fetch(`${TCGDX_BASE}/${lang}/cards/${row.id}`);
        if (cardRes.ok) {
          const card = await cardRes.json();
          data.push({
            id: row.id,
            name: card.name || '未知卡片',
            image: card.image || null,
            set: { id: card.set?.id },
            clickCount: row.click_count
          });
        }
      } catch (e) {
        console.warn(`無法取得卡片 ${row.id}:`, e.message);
        data.push({
          id: row.id,
          name: '未知卡片',
          image: null,
          set: { id: null },
          clickCount: row.click_count
        });
      }
    }
    
    res.json({ data });
  } catch (e) { 
    console.error('Popular cards error:', e.message);
    res.status(500).json({ error: e.message }); 
  }
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

app.listen(3000, () => console.log('Backend running on :3000'));
