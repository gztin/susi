// API 配置
const API_BASE = '/api';

// 語言設定
let currentLang = 'en'; // 預設英文
const LANG_OPTIONS = { 'en': 'English', 'ja': '日本語' };

// 快取資料
let pokemonCache = new Map();
let setCache = new Map();

const PAGE_SIZE = 15;
let currentPage = 1;
let totalCount = 0;
let currentSetId = null;
let currentSetName = '';
let allSets = [];

const typeMap = {
  Fire: '🔥 火', Water: '💧 水', Grass: '🌿 草',
  Lightning: '⚡ 電', Psychic: '🔮 超能', Fighting: '👊 格鬥',
  Darkness: '🌑 惡', Metal: '⚙️ 鋼', Dragon: '🐉 龍', Colorless: '⭐ 無色'
};

const RARITY_MAP = {
  'Common': 'C',
  'Uncommon': 'U',
  'Rare': 'R',
  'Rare Holo': 'R',
  'Rare Holo ex': 'RR',
  'Rare Holo GX': 'RR',
  'Double Rare': 'RR',
  'Triple Rare': 'RRR',
  'Rare Holo V': 'RR',
  'Rare Holo VMAX': 'RRR',
  'Rare Holo VSTAR': 'RRR',
  'Illustration Rare': 'AR',
  'Special Illustration Rare': 'SAR',
  'Rare Ultra': 'SR',
  'Rare Secret': 'UR',
  'Hyper Rare': 'UR',
  'Rare Rainbow': 'HR',
  'ACE SPEC Rare': 'ACE',
  'Promo': 'PROMO'
};

function translateRarity(rarity) {
  if (!rarity) return '無';
  return RARITY_MAP[rarity] || rarity;
}

// 日版系列對照表
const JP_SET_MAP = {
  'sv3pt5': { jpId: 'sv2a', total: 165 }, // 151
  'sv8pt5': { jpId: 'sv8a', total: 129 }, // 太晶慶典
  'sv8': { jpId: 'sv8', total: 106 },     // 超電激突
  'sv7': { jpId: 'sv7', total: 102 },     // 星晶奇跡
  'sv6': { jpId: 'sv6', total: 101 },     // 變幻假面
  'sv5': { jpId: 'sv5k', total: 71 },      // 狂野之力
  'sv4': { jpId: 'sv4k', total: 66 },      // 古代咆哮
  'sv3': { jpId: 'sv3', total: 108 },     // 黯焰支配者
  'sv2': { jpId: 'sv2p', total: 71 }       // 冰雪險境
};

// API 呼叫函數
async function fetchCards(query = '', pageSize = 20, page = 1) {
    try {
        const params = new URLSearchParams({
            lang: currentLang,
            page: page.toString(),
            pageSize: pageSize.toString()
        });
        
        if (query) params.set('name', query);
        
        const response = await fetch(`${API_BASE}/cards?${params}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error('抓取卡片資料失敗:', error);
        return { data: [], totalCount: 0 };
    }
}

async function fetchSets(pageSize = 250) {
    try {
        const params = new URLSearchParams({
            lang: currentLang,
            orderBy: '-releaseDate',
            pageSize: pageSize.toString()
        });
        
        const response = await fetch(`${API_BASE}/sets?${params}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        
        // 快取系列資料
        result.data.forEach(set => {
            setCache.set(set.id, set);
        });
        
        return result;
    } catch (error) {
        console.error('抓取系列資料失敗:', error);
        return { data: [] };
    }
}

async function fetchCardById(cardId) {
    try {
        if (pokemonCache.has(cardId)) {
            return pokemonCache.get(cardId);
        }
        
        const response = await fetch(`${API_BASE}/cards/${cardId}?lang=${currentLang}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        pokemonCache.set(cardId, result.data);
        
        return result.data;
    } catch (error) {
        console.error('抓取卡片詳細資料失敗:', error);
        return null;
    }
}

// 根據卡片名稱取得顯示名稱（TCGdx 已經提供多語言）
function getPokemonName(name) {
  return name || '未知卡片';
}

function changeLang(newLang) {
  if (currentLang === newLang) return;
  
  currentLang = newLang;
  
  // 清除快取，重新載入資料
  pokemonCache.clear();
  setCache.clear();
  
  // 重新渲染目前畫面
  if (!currentSetId) {
    loadSets().then(() => renderSets(currentPage));
  } else {
    fetchCardsForDisplay(1);
  }
  
  // 若 modal 開著也更新
  const overlay = document.getElementById('modalOverlay');
  if (overlay.classList.contains('open') && lastModalCard) {
    openModal(lastModalCard.id);
  }
}

function getSetName(setId, fallbackName) {
  const s = setCache.get(setId);
  return s ? s.name : fallbackName || setId;
}

// ---- 初始化系列資料 ----
async function loadSets() {
  try {
    const data = await fetchSets();
    allSets = data.data;

    // 填充下拉選單
    const sel = document.getElementById('setSelect');
    sel.innerHTML = '<option value="">所有系列</option>'; // 清空現有選項
    
    allSets.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
    sel.value = ''; // 確保不自動選中任何系列

    // 預設顯示系列列表 (首頁)
    showHome();
  } catch (e) {
    console.warn('無法載入系列', e);
    // 如果 API 失敗，也要嘗試顯示人氣卡片
    showHome();
  }
}

function showHome(page = 1) {
  currentSetId = null;
  currentSetName = '';
  document.getElementById('setSelect').value = '';
  renderBreadcrumb();
  fetchSetsForDisplay(page);
  fetchPopularCards();
}

function renderBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  if (!currentSetId) {
    bc.innerHTML = '<span>🏠 首頁</span>';
    return;
  }
  bc.innerHTML = `
    <a onclick="showHome()">🏠 首頁</a>
    <span class="sep">/</span>
    <span>${currentSetName}</span>
  `;
}

// 渲染系列列表 (卡盒) - 支援本機分頁
function renderSets(page = 1) {
  currentPage = page;
  const grid = document.getElementById('grid');
  
  if (!allSets.length) {
    grid.innerHTML = '<p class="no-data">載入中...</p>';
    return;
  }

  // 取得分頁數據
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pagedSets = allSets.slice(start, end);

  grid.innerHTML = pagedSets.map(s => `
    <div class="card set-card" onclick="selectSet('${s.id}', '${s.name}')">
      <img class="set-logo" 
           src="${s.logo || 'https://via.placeholder.com/300x200/16213e/f4a261?text=' + encodeURIComponent(s.name)}" 
           alt="${s.name}" 
           loading="lazy" 
           onerror="this.src='https://via.placeholder.com/300x200/16213e/f4a261?text=' + encodeURIComponent('${s.name}')" />
      <div class="set-name-overlay">${s.name}</div>
    </div>
  `).join('');

  totalCount = allSets.length;
  renderPagination(true); // 傳入 true 表示這是首頁分頁
}

function selectSet(id, name) {
  currentSetId = id;
  currentSetName = name;
  document.getElementById('setSelect').value = id;
  fetchCardsForDisplay(1);
}

async function fetchSetsForDisplay(page = 1) {
  document.getElementById('popularSection').style.display = 'block';
  renderSets(page);
  document.getElementById('status').textContent = `共 ${allSets.length} 個系列，第 ${currentPage} 頁`;
}

// ---- 搜尋 ----
function buildQuery() {
  const name = document.getElementById('searchInput').value.trim();
  return name;
}

async function fetchCardsForDisplay(page = 1) {
  currentPage = page;
  const grid = document.getElementById('grid');
  const status = document.getElementById('status');
  const popular = document.getElementById('popularSection');

  // 進入系列後隱藏人氣區塊與更新麵包屑
  popular.style.display = 'none';
  renderBreadcrumb();

  grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  status.textContent = '載入中...';

  const params = new URLSearchParams({
    lang: currentLang,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });
  
  // 如果下拉選單有選，則同步狀態
  const setVal = document.getElementById('setSelect').value;
  if (setVal) {
    currentSetId = setVal;
    const sObj = allSets.find(s => s.id === setVal);
    currentSetName = sObj ? sObj.name : setVal;
    renderBreadcrumb();
    params.set('set', setVal);
  }

  const query = buildQuery();
  if (query) params.set('name', query);

  try {
    const res = await fetch(`${API_BASE}/cards?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    totalCount = data.totalCount;
    renderCards(data.data);
    renderPagination();
    status.textContent = `找到 ${totalCount.toLocaleString()} 張卡片，第 ${currentPage} 頁`;
  } catch (err) {
    grid.innerHTML = '';
    status.textContent = `載入失敗：${err.message}`;
  }
}

function renderCards(cards) {
  const grid = document.getElementById('grid');
  if (!cards.length) {
    grid.innerHTML = '<p style="padding:40px;color:#555;grid-column:1/-1;text-align:center">找不到符合的卡片</p>';
    return;
  }

  grid.innerHTML = cards.map(card => {
    const img = card.image || 'https://via.placeholder.com/200x280/16213e/f4a261?text=No+Image';
    const types = (card.types || []).map(t => `<span class="tag tag-type">${typeMap[t] || t}</span>`).join('');
    const shortRarity = translateRarity(card.rarity);
    const rarity = card.rarity ? `<span class="tag tag-rarity rarity-${shortRarity.toLowerCase()}">${shortRarity}</span>` : '';
    const hp = card.hp ? `<span class="tag tag-hp">HP ${card.hp}</span>` : '';

    return `
      <div class="card" onclick="openModal('${card.id}')">
        <div class="card-img-wrap">
          <img src="${img}" alt="${card.name}" loading="lazy" 
               onerror="this.src='https://via.placeholder.com/200x280/16213e/f4a261?text=No+Image'" />
        </div>
        <div class="card-body">
          <div class="card-name">${getPokemonName(card.name)}</div>
          <div class="card-set">${card.set?.name || ''} · ${card.localId || ''}</div>
          <div class="card-tags">${types}${rarity}${hp}</div>
        </div>
      </div>`;
  }).join('');
}

function renderPagination(isHome = false) {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pg = document.getElementById('pagination');
  const pgTop = document.getElementById('paginationTop');
  if (totalPages <= 1) { pg.innerHTML = ''; pgTop.innerHTML = ''; return; }

  const show = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1, currentPage - 2, currentPage + 2]);
  const sorted = [...show].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const onClickFn = isHome ? 'showHome' : 'fetchCardsForDisplay';

  let html = `<button onclick="${onClickFn}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>← 上一頁</button>`;
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) html += `<span>…</span>`;
    html += `<button onclick="${onClickFn}(${p})" class="${p === currentPage ? 'active' : ''}">${p}</button>`;
    prev = p;
  }
  html += `<button onclick="${onClickFn}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一頁 →</button>`;
  pg.innerHTML = html;
  pgTop.innerHTML = html;
}

// ---- Modal ----
let lastModalCard = null;

async function openModal(cardId) {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent = '載入中...';
  body.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  overlay.classList.add('open');

  // 回報點擊給後端
  reportClick(cardId);

  try {
    const card = await fetchCardById(cardId);
    if (card) {
      renderModal(card);
    } else {
      body.innerHTML = '<p style="color:#e63946">載入失敗：找不到卡片資料</p>';
    }
  } catch (err) {
    body.innerHTML = `<p style="color:#e63946">載入失敗：${err.message}</p>`;
  }
}

async function reportClick(cardId) {
  try {
    await fetch(`${API_BASE}/cards/${cardId}/click`, { method: 'POST' });
  } catch (e) { console.warn('點擊紀錄失敗', e); }
}

async function fetchPopularCards() {
  const popGrid = document.getElementById('popularGrid');
  try {
    const res = await fetch(`${API_BASE}/popular-cards?lang=${currentLang}`);
    const { data } = await res.json();
    
    if (!data || !data.length) {
      popGrid.innerHTML = '<p style="color:#555">尚無人氣資料</p>';
      return;
    }

    popGrid.innerHTML = data.map(c => `
      <div class="pop-card" onclick="openModal('${c.id}')">
        <img src="${c.image || 'https://via.placeholder.com/40x56/16213e/f4a261?text=?'}" 
             onerror="this.src='https://via.placeholder.com/40x56/16213e/f4a261?text=?'" />
        <div class="pop-info">
          <div class="pop-name">${c.name}</div>
          <div class="pop-clicks">🔥 ${c.clickCount} 次查看</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.warn('無法載入人氣卡牌', e);
  }
}

function renderModal(card) {
  lastModalCard = card;
  document.getElementById('modalTitle').textContent = getPokemonName(card.name);

  const img = card.image || 'https://via.placeholder.com/210x294/16213e/f4a261?text=No+Image';
  const shortRarity = translateRarity(card.rarity);
  
  // 日版參數
  const jpConfig = JP_SET_MAP[card.set?.id];
  const hasJpPrice = !!jpConfig;

  // TCGPlayer 價格
  const tcgPrices = card.pricing?.tcgplayer
    ? `<div class="price-block">
        <div class="price-platform">🇺🇸 TCGPlayer <span class="price-update">更新：${new Date(card.pricing.tcgplayer.updated).toLocaleDateString() || '—'}</span></div>
        ${Object.entries(card.pricing.tcgplayer).filter(([key]) => key !== 'updated' && key !== 'unit').map(([type, p]) => `
          <div class="price-row">
            <span class="price-label">${type}</span>
            <span class="price-item low">最低 ${p.lowPrice?.toFixed(2) ?? '—'} USD</span>
            <span class="price-item mid">中間 ${p.midPrice?.toFixed(2) ?? '—'} USD</span>
            <span class="price-item market">市場 ${p.marketPrice?.toFixed(2) ?? '—'} USD</span>
          </div>`).join('')}
      </div>`
    : '<div class="price-block"><div class="price-platform">🇺🇸 TCGPlayer</div><p class="no-data">美版價格：無</p></div>';

  // Cardmarket 價格
  const cmPrices = card.pricing?.cardmarket
    ? `<div class="price-block">
        <div class="price-platform">🇪🇺 Cardmarket <span class="price-update">更新：${new Date(card.pricing.cardmarket.updated).toLocaleDateString() || '—'}</span></div>
        <div class="price-row">
          <span class="price-label">普通</span>
          <span class="price-item low">最低 €${card.pricing.cardmarket.low?.toFixed(2) ?? '—'}</span>
          <span class="price-item mid">趨勢 €${card.pricing.cardmarket.trend?.toFixed(2) ?? '—'}</span>
          <span class="price-item market">均價 €${card.pricing.cardmarket.avg?.toFixed(2) ?? '—'}</span>
        </div>
      </div>`
    : '';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-img">
      <img src="${img}" alt="${card.name}" 
           onerror="this.src='https://via.placeholder.com/210x294/16213e/f4a261?text=No+Image'" />
    </div>
    <div class="modal-info">
      <h3>基本資訊</h3>
      <div class="info-grid">
        <p><span class="info-label">系列：</span>${card.set?.name || '—'}</p>
        <p><span class="info-label">編號：</span>${card.localId || '—'} / ${card.set?.cardCount?.total || '—'}</p>
        <p><span class="info-label">稀有度：</span><span class="tag tag-rarity rarity-${shortRarity.toLowerCase()}">${shortRarity}</span></p>
        <p><span class="info-label">HP：</span>${card.hp || '—'}</p>
      </div>
      
      <div class="market-section">
        <h4>市場價格</h4>
        ${tcgPrices}
        ${cmPrices}
        
        <!-- 日版行情區塊 -->
        <div id="jpPriceSection" class="market-box jp-market" style="display: none; padding: 12px; border-radius: 8px;">
          <div class="market-header" style="margin-bottom: 8px;">
            <span class="flag">🇯🇵</span> <strong style="color:#ee6c4d">日版行情 (pokeca-chart)</strong>
          </div>
          <div class="jp-info">
            <p id="jpTitle" class="jp-card-name" style="margin-bottom: 8px; font-weight: bold;">載入中...</p>
            <div id="jpPrices" class="price-list">
              <!-- 動態插入 -->
            </div>
          </div>
          <a id="jpUrl" href="#" target="_blank" class="price-link" style="margin-top: 8px; display: inline-block;">在 Pokeca Chart 查看 →</a>
        </div>
      </div>
    </div>
  `;

  // 如果有日版對照，則抓取
  if (hasJpPrice) {
    fetchJpMarket(jpConfig.jpId, card.localId, jpConfig.total);
  }
}

async function fetchJpMarket(jpId, number, total) {
  const section = document.getElementById('jpPriceSection');
  const jpTitle = document.getElementById('jpTitle');
  const jpPrices = document.getElementById('jpPrices');
  const jpUrl = document.getElementById('jpUrl');

  section.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE}/jp-price?setId=${jpId}&number=${number}&total=${total}`);
    if (!res.ok) throw new Error('抓取失敗');
    const data = await res.json();

    jpTitle.textContent = data.title;
    jpUrl.href = data.url;

    let pricesHtml = '';
    if (data.mint && data.mint.jpy) {
      pricesHtml += `
        <div class="price-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="p-label" style="color: #999;">美品價格</span>
          <div style="text-align: right;">
            <span class="p-val jpy" style="color: #ccc; font-size: 0.85rem;">¥${data.mint.jpy.toLocaleString()}</span>
            <span class="p-val twd" style="color: #ffca3a; font-weight: bold; margin-left: 8px;">≈ NT${data.mint.twd.toLocaleString()}</span>
          </div>
        </div>
      `;
    }
    if (data.psa10 && data.psa10.jpy) {
      pricesHtml += `
        <div class="price-item" style="display: flex; justify-content: space-between; align-items: center;">
          <span class="p-label" style="color: #999;">PSA10</span>
          <div style="text-align: right;">
            <span class="p-val jpy" style="color: #ccc; font-size: 0.85rem;">¥${data.psa10.jpy.toLocaleString()}</span>
            <span class="p-val twd" style="color: #ffca3a; font-weight: bold; margin-left: 8px;">≈ NT${data.psa10.twd.toLocaleString()}</span>
          </div>
        </div>
      `;
    }

    if (!pricesHtml) pricesHtml = '<p class="no-data">暫無價格紀錄</p>';
    jpPrices.innerHTML = pricesHtml;

  } catch (err) {
    jpTitle.textContent = '暫無日版價格資料';
    jpPrices.innerHTML = '';
  }
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function resetSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeSelect').value = '';
  document.getElementById('raritySelect').value = '';
  document.getElementById('supertypeSelect').value = '';
  document.getElementById('setSelect').value = '';
  fetchCardsForDisplay(1);
}

// Enter 鍵搜尋
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (!currentSetId) showHome(1);
      else fetchCardsForDisplay(1);
    }
  });
});

// ESC 關閉 modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
});

// 初始化
loadSets();