const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 資料庫初始化
const db = new Database('./poker.db');

// 初始化資料庫表格
db.exec(`
  CREATE TABLE IF NOT EXISTS card_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ptcg_id TEXT UNIQUE,
    click_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 全域變數儲存系列索引和快取
let setsIndex = null;
let setCache = new Map();

// 載入系列索引
async function loadSetsIndex() {
  try {
    const indexPath = path.join(__dirname, 'data/sets/index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    setsIndex = JSON.parse(data);
    console.log(`✅ 載入系列索引: ${setsIndex.totalSets} 個系列`);
    return true;
  } catch (error) {
    console.error('❌ 載入系列索引失敗:', error.message);
    return false;
  }
}

// 載入指定系列的卡片資料
async function loadSetData(setId) {
  try {
    if (setCache.has(setId)) {
      return setCache.get(setId);
    }
    
    const setPath = path.join(__dirname, `data/sets/${setId}.json`);
    const data = await fs.readFile(setPath, 'utf8');
    const setData = JSON.parse(data);
    
    // 快取資料
    setCache.set(setId, setData);
    
    return setData;
  } catch (error) {
    console.error(`❌ 載入系列 ${setId} 失敗:`, error.message);
    return null;
  }
}

// 根據語言提取對應的文字
function getLocalizedText(textObj, lang) {
  if (typeof textObj === 'string') return textObj;
  if (typeof textObj === 'object' && textObj !== null) {
    return textObj[lang] || textObj['en'] || textObj;
  }
  return textObj;
}

// 將卡片資料本地化為指定語言
function localizeCard(card, lang) {
  return {
    ...card,
    name: getLocalizedText(card.name, lang),
    supertype: getLocalizedText(card.supertype, lang),
    types: card.types.map(type => getLocalizedText(type, lang)),
    rarity: getLocalizedText(card.rarity, lang)
  };
}

// 將系列資料本地化為指定語言
function localizeSet(set, lang) {
  return {
    ...set,
    name: getLocalizedText(set.name, lang)
  };
}

// API 路由

// 獲取系列列表
app.get('/api/sets', async (req, res) => {
  try {
    if (!setsIndex) {
      const loaded = await loadSetsIndex();
      if (!loaded) {
        return res.status(500).json({ error: '無法載入系列資料' });
      }
    }

    const lang = req.query.lang || 'en';
    const pageSize = parseInt(req.query.pageSize) || 50;
    const page = parseInt(req.query.page) || 1;
    
    // 本地化系列名稱
    const localizedSets = setsIndex.sets.map(set => localizeSet(set, lang));
    
    // 分頁處理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedSets = localizedSets.slice(startIndex, endIndex);

    res.json({
      data: pagedSets,
      totalCount: localizedSets.length,
      page: page,
      pageSize: pageSize,
      language: lang
    });

  } catch (error) {
    console.error('Sets API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 獲取卡片列表
app.get('/api/cards', async (req, res) => {
  try {
    if (!setsIndex) {
      const loaded = await loadSetsIndex();
      if (!loaded) {
        return res.status(500).json({ error: '無法載入系列資料' });
      }
    }

    const lang = req.query.lang || 'en';
    const pageSize = parseInt(req.query.pageSize) || 20;
    const page = parseInt(req.query.page) || 1;
    const setId = req.query.set;
    const nameQuery = req.query.name;

    let allCards = [];

    if (setId) {
      // 獲取指定系列的卡片
      const setData = await loadSetData(setId);
      if (setData) {
        allCards = setData.cards.map(card => localizeCard(card, lang));
      }
    } else {
      // 獲取所有系列的卡片（限制前 10 個系列避免過多資料）
      const setsToLoad = setsIndex.sets.slice(0, 10);
      
      for (const set of setsToLoad) {
        const setData = await loadSetData(set.id);
        if (setData) {
          const localizedCards = setData.cards.map(card => localizeCard(card, lang));
          allCards.push(...localizedCards);
        }
      }
    }

    // 名稱搜尋過濾
    if (nameQuery) {
      const query = nameQuery.toLowerCase();
      allCards = allCards.filter(card => 
        card.name.toLowerCase().includes(query)
      );
    }

    // 分頁處理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedCards = allCards.slice(startIndex, endIndex);

    res.json({
      data: pagedCards,
      totalCount: allCards.length,
      page: page,
      pageSize: pageSize,
      language: lang
    });

  } catch (error) {
    console.error('Cards API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 獲取單張卡片詳細資料
app.get('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.query.lang || 'en';

    // 在所有系列中搜尋卡片
    for (const set of setsIndex.sets) {
      const setData = await loadSetData(set.id);
      if (setData) {
        const card = setData.cards.find(c => c.id === id);
        if (card) {
          const localizedCard = localizeCard(card, lang);
          return res.json({ data: localizedCard });
        }
      }
    }

    res.status(404).json({ error: 'Card not found' });

  } catch (error) {
    console.error('Card detail API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 點擊追蹤：紀錄卡片被點閱次數
app.post('/api/cards/:id/click', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      INSERT INTO card_stats (ptcg_id, click_count)
      VALUES (?, 1)
      ON CONFLICT(ptcg_id) DO UPDATE SET
        click_count = click_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 獲取人氣卡片
app.get('/api/popular-cards', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    
    const rows = db.prepare(`
      SELECT ptcg_id, click_count 
      FROM card_stats 
      ORDER BY click_count DESC 
      LIMIT 10
    `).all();
    
    const popularCards = [];
    
    for (const row of rows) {
      // 在所有系列中搜尋卡片
      for (const set of setsIndex.sets.slice(0, 10)) {
        const setData = await loadSetData(set.id);
        if (setData) {
          const card = setData.cards.find(c => c.id === row.ptcg_id);
          if (card) {
            const localizedCard = localizeCard(card, lang);
            popularCards.push({
              ...localizedCard,
              clickCount: row.click_count
            });
            break;
          }
        }
      }
    }
    
    res.json({ data: popularCards });
    
  } catch (error) {
    console.error('Popular cards API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 日版價格 API（保持原有功能）
app.get('/api/jp-price', async (req, res) => {
  try {
    const { setId, number, total } = req.query;
    
    // 模擬日版價格資料
    const mockData = {
      title: `${setId} No.${number}`,
      url: `https://pokeca-chart.com/card/${setId}-${number}`,
      mint: {
        jpy: Math.floor(Math.random() * 5000) + 500,
        twd: Math.floor(Math.random() * 1500) + 150
      },
      psa10: {
        jpy: Math.floor(Math.random() * 15000) + 2000,
        twd: Math.floor(Math.random() * 4500) + 600
      }
    };
    
    res.json(mockData);
  } catch (error) {
    console.error('JP price API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 啟動服務器
app.listen(PORT, async () => {
  console.log(`🚀 後端服務器運行在 http://localhost:${PORT}`);
  
  // 預載系列索引
  await loadSetsIndex();
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  try {
    db.close();
    console.log('✅ 資料庫連接已關閉');
  } catch (err) {
    console.error('關閉資料庫時發生錯誤:', err.message);
  }
  process.exit(0);
});