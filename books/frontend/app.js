const API_BASE = '/api';

const BACKEND_BASE = '/api';
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

const priceTypeLabel = {
  normal: '普通', holofoil: '閃卡', reverseHolofoil: '反面閃',
  '1stEditionHolofoil': '初版閃', '1stEditionNormal': '初版普通'
};

// 中文名稱 → 英文名稱對照（用於搜尋輸入轉換）
const ZH_TO_EN_NAME = {
  '超夢': 'Mewtwo', '超夢ex': 'Mewtwo ex', '超夢 ex': 'Mewtwo ex',
  '夢幻': 'Mew', '夢幻ex': 'Mew ex', '夢幻 ex': 'Mew ex',
  '皮卡丘': 'Pikachu', '皮卡丘ex': 'Pikachu ex', '皮卡丘 ex': 'Pikachu ex',
  '伊布': 'Eevee', '水伊布': 'Vaporeon', '雷伊布': 'Jolteon', '火伊布': 'Flareon',
  '卡比獸': 'Snorlax', '快龍': 'Dragonite', '化石翼龍': 'Aerodactyl',
  '噴火龍': 'Charizard', '噴火龍ex': 'Charizard ex', '噴火龍 ex': 'Charizard ex',
  '妙蛙種子': 'Bulbasaur', '妙蛙草': 'Ivysaur', '妙蛙花': 'Venusaur',
  '小火龍': 'Charmander', '火恐龍': 'Charmeleon',
  '傑尼龜': 'Squirtle', '卡咪龜': 'Wartortle', '水箭龜': 'Blastoise',
  '超音蝠': 'Golbat', '大嘴蝠': 'Crobat',
  '喵喵': 'Meowth', '波斯貓': 'Persian',
  '可達鴨': 'Psyduck', '哥達鴨': 'Golduck',
  '傑利獸': 'Gengar', '鬼斯': 'Gastly', '鬼斯通': 'Haunter',
  '拉普拉斯': 'Lapras', '多龍': 'Dratini', '哈克龍': 'Dragonair',
  '伊貝': 'Eevee', '水精靈': 'Vaporeon', '雷精靈': 'Jolteon', '火精靈': 'Flareon',
  '菊草葉': 'Chikorita', '火球鼠': 'Cyndaquil', '小鋸鱷': 'Totodile',
  '幸福蛋': 'Chansey', '幸福蛋ex': 'Chansey ex',
  '路卡利歐': 'Lucario', '路卡利歐ex': 'Lucario ex', '路卡利歐 ex': 'Lucario ex',
  '烈空坐': 'Rayquaza', '烈空坐ex': 'Rayquaza ex', '烈空坐 ex': 'Rayquaza ex',
  '蓋歐卡': 'Kyogre', '固拉多': 'Groudon',
  '帝牙盧卡': 'Dialga', '帕路奇亞': 'Palkia', '騎拉帝納': 'Giratina',
  '黑色雷修斯': 'Zekrom', '白色雷希拉姆': 'Reshiram',
  '蓋諾賽克特': 'Genesect', '捷拉奧拉': 'Zeraora',
  '索羅亞克': 'Zoroark', '索羅亞': 'Zorua',
  '伊裴爾特': 'Sylveon', '仙子伊布': 'Sylveon',
  '卡璞・鳴鳴': 'Tapu Koko', '卡璞・蝶蝶': 'Tapu Lele',
  '烏賊王': 'Tentacruel', '大舌貝': 'Cloyster',
  '呆呆獸': 'Slowpoke', '呆殼獸': 'Slowbro',
  '鐵甲暴龍': 'Tyranitar', '班基拉斯': 'Tyranitar',
  '沙奈朵': 'Gardevoir', '沙奈朵ex': 'Gardevoir ex', '沙奈朵 ex': 'Gardevoir ex',
  '甲賀忍蛙': 'Greninja', '甲賀忍蛙ex': 'Greninja ex',
  '耿鬼': 'Gengar', '耿鬼ex': 'Gengar ex', '耿鬼 ex': 'Gengar ex',
  '黑暗烈雷': 'Miraidon', '黑暗烈雷ex': 'Miraidon ex', '黑暗烈雷 ex': 'Miraidon ex',
  '古拉頓': 'Groudon', '固拉頓': 'Groudon',
  '密勒頓': 'Milotic',
  '波克基斯': 'Togekiss',
  '鐵面具': 'Iron Mask', '鐵荊棘': 'Iron Thorns',
  '古代': 'Ancient', '未來': 'Future',
};

const SET_NAME_MAP = {
  // --- Mega Evolution 系列 ---
  'me3': '完美秩序 (Perfect Order)',
  'me2pt5': '升天英雄 (Ascended Heroes)',
  'me2': '幻影烈焰 (Phantasmal Flames)',
  'me1': '超級進化 (Mega Evolution)',

  // --- 朱&紫 (SV) 系列 ---
  'zsv10pt5': '黑色閃電 (Black Bolt)',
  'rsv10pt5': '白色烈焰 (White Flare)',
  'sv10': '命運對決 (Destined Rivals)',
  'sv9': '共同旅程 (Journey Together)',
  'sv8pt5': '太晶慶典 (Prismatic Evolutions)',
  'sv8': '超電激突 (Surging Sparks)',
  'sv7': '星晶奇跡 (Stellar Crown)',
  'sv6pt5': '夜之漫遊 (Shrouded Fable)',
  'sv6': '變幻假面 (Twilight Masquerade)',
  'sv5': '時空激戰 (Temporal Forces)',
  'sv4pt5': '帕底亞之命運 (Paldean Fates)',
  'sv4': '悖論裂縫 (Paradox Rift)',
  'sv3pt5': '151 (寶可夢 151)',
  'sv3': '黑曜烈焰 (Obsidian Flames)',
  'sv2': '帕底亞進化 (Paldea Evolved)',
  'sv1': '朱 & 紫 (Scarlet & Violet)',
  'sve': '朱紫能量 (SV Energies)',
  'svp': '朱紫黑星宣傳卡 (SV Promos)',

  // --- 劍&盾 (SWSH) 系列 ---
  'swsh12pt5': '王冠之頂 (Crown Zenith)',
  'swsh12pt5gg': '王冠之頂 銀河畫廊 (Crown Zenith GG)',
  'swsh12': '白銀烈印 (Silver Tempest)',
  'swsh12tg': '白銀烈印 訓練家畫廊',
  'swsh11': '迷途深淵 (Lost Origin)',
  'swsh11tg': '迷途深淵 訓練家畫廊',
  'swsh10': '星空輝煌 (Astral Radiance)',
  'swsh10tg': '星空輝煌 訓練家畫廊',
  'swsh9': '閃耀之星 (Brilliant Stars)',
  'swsh9tg': '閃耀之星 訓練家畫廊',
  'swsh8': '融合術 (Fusion Strike)',
  'swsh7': '蒼空烈印 (Evolving Skies)',
  'swsh6': '寒冰統治 (Chilling Reign)',
  'swsh5': '對戰風格 (Battle Styles)',
  'swsh45': '閃色命運 (Shining Fates)',
  'swsh45sv': '閃色命運 閃耀金庫',
  'swsh4': '活力電壓 (Vivid Voltage)',
  'swsh35': '冠軍之路 (Champion\'s Path)',
  'swsh3': '黑暗烈焰 (Darkness Ablaze)',
  'swsh2': '反逆衝突 (Rebel Clash)',
  'swsh1': '劍 & 盾 (Sword & Shield)',
  'swshp': '劍盾黑星宣傳卡 (SWSH Promos)',

  // --- 太陽&月亮 (SM) 系列 ---
  'sm12': '宇宙蝕 (Cosmic Eclipse)',
  'sm11': '統一思維 (Unified Minds)',
  'sm10': '無堅不摧 (Unbroken Bonds)',
  'sm9': '組隊合作 (Team Up)',
  'sm8': '失落雷鳴 (Lost Thunder)',
  'sm7': '龍之威嚴 (Dragon Majesty)',
  'sm75': '龍之威嚴 (Dragon Majesty)',
  'sm6': '禁忌之光 (Forbidden Light)',
  'sm5': '超級爆發 (Ultra Prism)',
  'sm4': '征服者衝擊 (Crimson Invasion)',
  'sm35': '閃耀傳說 (Shining Legends)',
  'sm3': '燃燒暗影 (Burning Shadows)',
  'sm2': '守護者崛起 (Guardians Rising)',
  'sm1': '太陽 & 月亮 (Sun & Moon)',

  // --- 特別系列 ---
  'cel25': '25週年紀念 (Celebrations)',
  'cel25c': '25週年紀念 經典收藏',
  'pgo': 'Pokémon GO 聯名系列',
  'mcd21': '麥當勞聯名 2021',
  'mcd22': '麥當勞聯名 2022',
};

// --- 日版網址 ID 對照表 (Poke-Chart) ---
// 格式: setId: { jpId: '...', printedTotal: 123 }
const JP_SET_MAP = {
  'sv3pt5': { jpId: 'sv2a', total: 165 }, // 151
  'sv8pt5': { jpId: 'sv8a', total: 129 }, // 太晶慶典
  'sv8': { jpId: 'sv8', total: 106 },     // 超電激突
  'sv7': { jpId: 'sv7', total: 102 },     // 星晶奇跡
  'sv6': { jpId: 'sv6', total: 101 },     // 變幻假面
  'sv5': { jpId: 'sv5k', total: 71 },      // 狂野之力 (美版併集，先隨機指一個)
  'sv4': { jpId: 'sv4k', total: 66 },      // 古代咆哮
  'sv3': { jpId: 'sv3', total: 108 },     // 黯焰支配者
  'sv2': { jpId: 'sv2p', total: 71 }       // 冰雪險境
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

// 靜態系列資料（從 sets.json 載入）
let setsData = {};  // id -> set object
let setsDataByEn = {}; // enName -> set object

async function loadSetsData() {
  try {
    const res = await fetch('/data/setName.json');
    const arr = await res.json();
    arr.forEach(s => {
      setsData[s.id] = s;
      setsDataByEn[s.enName] = s;
    });
  } catch (e) {
    console.warn('無法載入 sets.json', e);
  }
}

// 語言切換：zh / en / jp，預設中文
let currentLang = 'zh';
const LANG_CYCLE = ['zh', 'en', 'jp'];
const LANG_LABEL = { zh: '🌐 中文', en: '🌐 EN', jp: '🌐 日本語' };

let lastCards = []; // 供語言切換時重新渲染

function cycleLang() {
  const idx = LANG_CYCLE.indexOf(currentLang);
  currentLang = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
  document.getElementById('langBtn').textContent = LANG_LABEL[currentLang];
  // 重新渲染目前畫面
  if (!currentSetId) {
    renderSets(currentPage);
    document.getElementById('status').textContent = `共 ${allSets.length} 個系列，第 ${currentPage} 頁`;
  } else {
    renderCards(lastCards);
  }
}

function getSetName(setId, enName) {
  const s = setsData[setId] || setsDataByEn[enName];
  if (!s) return enName;
  if (currentLang === 'zh') return s.zhName;
  if (currentLang === 'jp') return s.jpName;
  return s.enName;
}

// ---- 初始化系列資料 ----
async function loadSets() {
  try {
    const res = await fetch(`${API_BASE}/sets?orderBy=-releaseDate&pageSize=250`, {
    });
    const data = await res.json();
    allSets = data.data;

    // 填充下拉選單
    const sel = document.getElementById('setSelect');
    allSets.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = getSetName(s.id, s.name);
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
  fetchSets(page);
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
      <img class="set-logo" src="${s.images.logo}" alt="${s.name}" loading="lazy" />
      <div class="set-name-overlay">${getSetName(s.id, s.name)}</div>
    </div>
  `).join('');

  totalCount = allSets.length;
  renderPagination(true); // 傳入 true 表示這是首頁分頁
}

function selectSet(id, name) {
  currentSetId = id;
  currentSetName = name;
  document.getElementById('setSelect').value = id;
  fetchCards(1);
}

async function fetchSets(page = 1) {
  document.getElementById('popularSection').style.display = 'block';
  renderSets(page);
  document.getElementById('status').textContent = `共 ${allSets.length} 個系列，第 ${currentPage} 頁`;
}

// ---- 搜尋 ----
function buildQuery() {
  const q = [];
  const rawName = document.getElementById('searchInput').value.trim();
  // 中文名稱自動轉換為英文（pokemontcg.io 只支援英文搜尋）
  const name = ZH_TO_EN_NAME[rawName] || rawName;
  const type = document.getElementById('typeSelect').value;
  const rarity = document.getElementById('raritySelect').value;
  const supertype = document.getElementById('supertypeSelect').value;
  const set = document.getElementById('setSelect').value;

  if (name) q.push(`name:${name}*`);
  if (type) q.push(`types:${type}`);
  if (rarity) q.push(`rarity:"${rarity}"`);
  if (supertype) q.push(`supertype:"${supertype}"`);
  if (set) q.push(`set.id:${set}`);
  return q.join(' ');
}

async function fetchCards(page = 1) {
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
    pageSize: PAGE_SIZE,
    page: currentPage,
    orderBy: '-set.releaseDate',
  });
  
  // 如果下拉選單有選，則同步狀態
  const setVal = document.getElementById('setSelect').value;
  if (setVal) {
    currentSetId = setVal;
    const sObj = allSets.find(s => s.id === setVal);
    currentSetName = sObj ? sObj.name : setVal;
    renderBreadcrumb();
  }

  const q = buildQuery();
  const queries = [];
  if (q) queries.push(q);
  if (currentSetId) queries.push(`set.id:${currentSetId}`);
  
  if (queries.length) params.set('q', queries.join(' '));

  try {
    const res = await fetch(`${API_BASE}/cards?${params}`, {
    });
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
  lastCards = cards;
  const grid = document.getElementById('grid');
  if (!cards.length) {
    grid.innerHTML = '<p style="padding:40px;color:#555;grid-column:1/-1;text-align:center">找不到符合的卡片</p>';
    return;
  }

  grid.innerHTML = cards.map(card => {
    const img = card.images?.small || '';
    const types = (card.types || []).map(t => `<span class="tag tag-type">${typeMap[t] || t}</span>`).join('');
    const shortRarity = translateRarity(card.rarity);
    const rarity = card.rarity ? `<span class="tag tag-rarity rarity-${shortRarity.toLowerCase()}">${shortRarity}</span>` : '';
    const hp = card.hp ? `<span class="tag tag-hp">HP ${card.hp}</span>` : '';

    // 卡片列表顯示市場價（優先順序：market -> mid -> low）
    const marketPrice = (() => {
      const prices = card.tcgplayer?.prices;
      if (!prices) return null;
      // 取得第一個可用的價格物件 (通常是 holofoil, normal 等)
      const p = prices.holofoil || prices.normal || prices.reverseHolofoil || Object.values(prices)[0];
      const val = p?.market || p?.mid || p?.low;
      return val ? `$${val.toFixed(2)}` : null;
    })();

    return `
      <div class="card" onclick="openModal('${card.id}')">
        <div class="card-img-wrap">
          ${img ? `<img src="${img}" alt="${card.name}" loading="lazy" />` : '<span style="color:#444">無圖片</span>'}
        </div>
        <div class="card-body">
          <div class="card-name">${card.name}</div>
          <div class="card-set">${card.set?.name || ''} · ${card.number || ''}</div>
          <div class="card-tags">${types}${rarity}${hp}</div>
          <div class="card-price">💵 美版價格：${marketPrice ? marketPrice + ' USD' : '無'}</div>
        </div>
      </div>`;
  }).join('');
}

function renderPagination(isHome = false) {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pg = document.getElementById('pagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }

  const pages = [];
  const show = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1, currentPage - 2, currentPage + 2]);
  const sorted = [...show].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const onClickFn = isHome ? 'showHome' : 'fetchCards';

  let html = `<button onclick="${onClickFn}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>← 上一頁</button>`;
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) html += `<span>…</span>`;
    html += `<button onclick="${onClickFn}(${p})" class="${p === currentPage ? 'active' : ''}">${p}</button>`;
    prev = p;
  }
  html += `<button onclick="${onClickFn}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一頁 →</button>`;
  pg.innerHTML = html;
}

// ---- Modal ----
async function openModal(cardId) {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent = '載入中...';
  body.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  overlay.classList.add('open');

  // 回報點擊給後端
  reportClick(cardId);

  try {
    const res = await fetch(`${API_BASE}/cards/${cardId}`, {
    });
    const data = await res.json();
    renderModal(data.data);
  } catch (err) {
    body.innerHTML = `<p style="color:#e63946">載入失敗：${err.message}</p>`;
  }
}

async function reportClick(cardId) {
  try {
    await fetch(`${BACKEND_BASE}/cards/${cardId}/click`, { method: 'POST' });
  } catch (e) { console.warn('點擊紀錄失敗', e); }
}

async function fetchPopularCards() {
  const popGrid = document.getElementById('popularGrid');
  try {
    const res = await fetch(`${BACKEND_BASE}/popular-cards`);
    const { data } = await res.json();
    
    if (!data || !data.length) {
      popGrid.innerHTML = '<p style="color:#555">尚無人氣資料</p>';
      return;
    }

    popGrid.innerHTML = data.map(c => `
      <div class="pop-card" onclick="openModal('${c.id}')">
        <img src="https://images.pokemontcg.io/${c.id.split('-')[0]}/${c.id.split('-')[1]}_small.png" 
             onerror="this.src='https://images.pokemontcg.io/base1/4_small.png'" />
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
  document.getElementById('modalTitle').textContent = card.name;

  const img = card.images?.large || card.images?.small || '';
  const types = (card.types || []).map(t => typeMap[t] || t).join('、') || '—';
  const subtypes = (card.subtypes || []).join('、') || '—';
  const shortRarity = translateRarity(card.rarity);
  const rarityDesc = card.rarity ? `${card.rarity} (${shortRarity})` : '—';
  
  // 日版參數
  const jpConfig = JP_SET_MAP[card.set?.id];
  const hasJpPrice = !!jpConfig;

  const weaknesses = (card.weaknesses || []).map(w => `${w.type} ${w.value}`).join('、') || '—';
  const resistances = (card.resistances || []).map(r => `${r.type} ${r.value}`).join('、') || '—';
  const retreatCost = card.retreatCost?.length ?? '—';
  const pokedex = card.nationalPokedexNumbers?.join('、') || '—';
  const artist = card.artist || '—';
  const flavorText = card.flavorText || '';
  const regulationMark = card.regulationMark || '—';

  // 合法性
  const legalityHtml = (() => {
    const l = card.legalities || {};
    const formats = ['standard', 'expanded', 'unlimited'];
    const labelMap = { standard: '標準', expanded: '擴展', unlimited: '無限制' };
    return formats.map(f => {
      const status = l[f];
      if (!status) return `<span class="legal-tag unknown">${labelMap[f]}：不適用</span>`;
      return `<span class="legal-tag ${status.toLowerCase()}">${labelMap[f]}：${status === 'Legal' ? '合法' : '禁止'}</span>`;
    }).join('');
  })();

  // 特性
  const abilities = (card.abilities || []).map(ab => `
    <div class="attack-item">
      <div style="display:flex;justify-content:space-between">
        <span class="attack-name">${ab.name}</span>
        <span style="color:#c77dff;font-size:0.75rem">[${ab.type}]</span>
      </div>
      <div style="font-size:0.82rem;color:#bbb;margin-top:4px">${ab.text}</div>
    </div>`).join('');

  // 攻擊技能已根據要求移除
  const attacks = '';

  // TCGPlayer 價格
  const tcgPrices = card.tcgplayer?.prices
    ? `<div class="price-block">
        <div class="price-platform">🇺🇸 TCGPlayer <span class="price-update">更新：${card.tcgplayer.updatedAt || '—'}</span></div>
        ${Object.entries(card.tcgplayer.prices).map(([type, p]) => `
          <div class="price-row">
            <span class="price-label">${priceTypeLabel[type] || type}</span>
            <span class="price-item low">最低 $${p.low?.toFixed(2) ?? '—'}</span>
            <span class="price-item mid">中間 $${p.mid?.toFixed(2) ?? '—'}</span>
            <span class="price-item market">市場 $${p.market?.toFixed(2) ?? '—'}</span>
            <span class="price-item high">最高 $${p.high?.toFixed(2) ?? '—'}</span>
          </div>`).join('')}
        <a href="${card.tcgplayer.url}" target="_blank" class="price-link">在 TCGPlayer 查看 →</a>
      </div>`
    : '<div class="price-block"><div class="price-platform">🇺🇸 TCGPlayer</div><p class="no-data">美版價格：無</p></div>';

  // Cardmarket 價格
  const cmPrices = card.cardmarket?.prices
    ? `<div class="price-block">
        <div class="price-platform">🇪🇺 Cardmarket <span class="price-update">更新：${card.cardmarket.updatedAt || '—'}</span></div>
        <div class="price-row">
          <span class="price-label">普通</span>
          <span class="price-item low">最低 €${card.cardmarket.prices.lowPrice?.toFixed(2) ?? '—'}</span>
          <span class="price-item mid">趨勢 €${card.cardmarket.prices.trendPrice?.toFixed(2) ?? '—'}</span>
          <span class="price-item market">均價 €${card.cardmarket.prices.averageSellPrice?.toFixed(2) ?? '—'}</span>
        </div>
        <div class="price-row">
          <span class="price-label">反面閃</span>
          <span class="price-item low">最低 €${card.cardmarket.prices.reverseHoloLow?.toFixed(2) ?? '—'}</span>
          <span class="price-item mid">趨勢 €${card.cardmarket.prices.reverseHoloTrend?.toFixed(2) ?? '—'}</span>
          <span class="price-item market">均價 €${card.cardmarket.prices.reverseHoloSell?.toFixed(2) ?? '—'}</span>
        </div>
        <div class="price-avg-row">
          <span>近1天 €${card.cardmarket.prices.avg1?.toFixed(2) ?? '—'}</span>
          <span>近7天 €${card.cardmarket.prices.avg7?.toFixed(2) ?? '—'}</span>
          <span>近30天 €${card.cardmarket.prices.avg30?.toFixed(2) ?? '—'}</span>
        </div>
        <a href="${card.cardmarket.url}" target="_blank" class="price-link">在 Cardmarket 查看 →</a>
      </div>`
    : '';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-img">
      ${img ? `<img src="${img}" alt="${card.name}" />` : ''}
    </div>
    <div class="modal-info">
      <h3>基本資訊</h3>
      <div class="info-grid">
        <p><span class="info-label">系列：</span>${card.set?.series || '—'}</p>
        <p><span class="info-label">卡包：</span>${getSetName(card.set?.id, card.set?.name)}</p>
        <p><span class="info-label">編號：</span>${card.number || '—'} / ${card.set?.printedTotal || '—'}</p>
        <p><span class="info-label">稀有度：</span>${rarityDesc}</p>
        <p><span class="info-label">HP：</span>${card.hp || '—'}</p>
        <p><span class="info-label">屬性：</span>${types}</p>
        <p><span class="info-label">子類型：</span>${subtypes}</p>
        <p><span class="info-label">弱點：</span>${weaknesses}</p>
        <p><span class="info-label">抵抗：</span>${resistances}</p>
        <p><span class="info-label">撤退費用：</span>${retreatCost} 個能量</p>
        <p><span class="info-label">Pokédex：</span>#${pokedex}</p>
        <p><span class="info-label">畫師：</span>${artist}</p>
        <p><span class="info-label">規範標記：</span>${regulationMark}</p>
      </div>
      
      ${flavorText ? `<div class="flavor-text">${flavorText}</div>` : ''}
      
      <div class="legalities-section">
        <h4>賽制合法性</h4>
        <div class="legal-grid">${legalityHtml}</div>
      </div>

      ${abilities ? `<div class="abilities-section"><h4>特性</h4>${abilities}</div>` : ''}
      
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
    fetchJpMarket(jpConfig.jpId, card.number, jpConfig.total);
  }
}

async function fetchJpMarket(jpId, number, total) {
  const section = document.getElementById('jpPriceSection');
  const jpTitle = document.getElementById('jpTitle');
  const jpPrices = document.getElementById('jpPrices');
  const jpUrl = document.getElementById('jpUrl');

  section.style.display = 'block';

  try {
    const res = await fetch(`${BACKEND_BASE}/jp-price?setId=${jpId}&number=${number}&total=${total}`);
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
            <span class="p-val twd" style="color: #ffca3a; font-weight: bold; margin-left: 8px;">≈ NT$${data.mint.twd.toLocaleString()}</span>
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
            <span class="p-val twd" style="color: #ffca3a; font-weight: bold; margin-left: 8px;">≈ NT$${data.psa10.twd.toLocaleString()}</span>
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
  fetchCards(1);
}

// Enter 鍵搜尋
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (!currentSetId) showHome(1);
      else fetchCards(1);
    }
  });
});

// ESC 關閉 modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
});

// 初始化
loadSetsData().then(() => loadSets());
