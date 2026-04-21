const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());

// 全域變數
let setsIndex = null;

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

// 根據語言提取對應的文字
function getLocalizedText(textObj, lang) {
  if (typeof textObj === 'string') return textObj;
  if (typeof textObj === 'object' && textObj !== null) {
    return textObj[lang] || textObj['en'] || textObj;
  }
  return textObj;
}

// 寶可夢名稱翻譯字典
const pokemonTranslations = {
  'Spinarak': { ja: 'イトマル', 'zh-TW': '圓絲蛛' },
  'Ariados': { ja: 'アリアドス', 'zh-TW': '阿利多斯' },
  'Shaymin': { ja: 'シェイミ', 'zh-TW': '謝米' },
  'Snivy': { ja: 'ツタージャ', 'zh-TW': '藤藤蛇' },
  'Servine': { ja: 'ジャノビー', 'zh-TW': '青藤蛇' },
  'Serperior': { ja: 'ジャローダ', 'zh-TW': '君主蛇' },
  'Scatterbug': { ja: 'コフキムシ', 'zh-TW': '粉蝶蟲' },
  'Spewpa': { ja: 'コフーライ', 'zh-TW': '粉蝶蛹' },
  'Vivillon': { ja: 'ビビヨン', 'zh-TW': '彩粉蝶' },
  'Bounsweet': { ja: 'アマカジ', 'zh-TW': '甜竹竹' },
  'Steenee': { ja: 'アママイコ', 'zh-TW': '甜舞妮' },
  'Tsareena': { ja: 'アマージョ', 'zh-TW': '甜冷美后' },
  'Grookey': { ja: 'サルノリ', 'zh-TW': '敲音猴' },
  'Thwackey': { ja: 'バチンキー', 'zh-TW': '啪咚猴' },
  'Rillaboom': { ja: 'ゴリランダー', 'zh-TW': '轟擂金剛猩' },
  'Charizard': { ja: 'リザードン', 'zh-TW': '噴火龍' },
  'Blastoise': { ja: 'カメックス', 'zh-TW': '水箭龜' },
  'Venusaur': { ja: 'フシギバナ', 'zh-TW': '妙蛙花' },
  'Pikachu': { ja: 'ピカチュウ', 'zh-TW': '皮卡丘' },
  'Raichu': { ja: 'ライチュウ', 'zh-TW': '雷丘' },
  'Bulbasaur': { ja: 'フシギダネ', 'zh-TW': '妙蛙種子' },
  'Ivysaur': { ja: 'フシギソウ', 'zh-TW': '妙蛙草' },
  'Charmander': { ja: 'ヒトカゲ', 'zh-TW': '小火龍' },
  'Charmeleon': { ja: 'リザード', 'zh-TW': '火恐龍' },
  'Squirtle': { ja: 'ゼニガメ', 'zh-TW': '傑尼龜' },
  'Wartortle': { ja: 'カメール', 'zh-TW': '卡咪龜' },
  'Dustox': { ja: 'ドクケイル', 'zh-TW': '毒粉蛾' },
  'Grubbin': { ja: 'アゴジムシ', 'zh-TW': '強顎雞母蟲' },
  'Charjabug': { ja: 'デンヂムシ', 'zh-TW': '蟲電寶' },
  'Vikavolt': { ja: 'クワガノン', 'zh-TW': '鍬農炮蟲' },
  
  // 添加更多寶可夢翻譯
  'Gloom': { ja: 'クサイハナ', 'zh-TW': '臭臭花' },
  'Vileplume': { ja: 'ラフレシア', 'zh-TW': '霸王花' },
  'Oddish': { ja: 'ナゾノクサ', 'zh-TW': '走路草' },
  'Bellsprout': { ja: 'マダツボミ', 'zh-TW': '喇叭芽' },
  'Weepinbell': { ja: 'ウツドン', 'zh-TW': '口呆花' },
  'Victreebel': { ja: 'ウツボット', 'zh-TW': '大食花' },
  'Tangela': { ja: 'モンジャラ', 'zh-TW': '蔓藤怪' },
  'Clefairy': { ja: 'ピッピ', 'zh-TW': '皮皮' },
  'Clefable': { ja: 'ピクシー', 'zh-TW': '皮可西' },
  'Exeggcute': { ja: 'タマタマ', 'zh-TW': '蛋蛋' },
  'Exeggutor': { ja: 'ナッシー', 'zh-TW': '椰蛋樹' },
  'Paras': { ja: 'パラス', 'zh-TW': '派拉斯' },
  'Parasect': { ja: 'パラセクト', 'zh-TW': '派拉斯特' },
  'Moltres': { ja: 'ファイヤー', 'zh-TW': '火焰鳥' },
  
  // 訓練家卡片翻譯
  "Erika's Gloom": { ja: 'エリカのクサイハナ', 'zh-TW': '艾莉卡的臭臭花' },
  "Erika's Vileplume": { ja: 'エリカのラフレシア', 'zh-TW': '艾莉卡的霸王花' },
  "Erika's Vileplume ex": { ja: 'エリカのラフレシアex', 'zh-TW': '艾莉卡的霸王花ex' },
  "Erika's Weepinbell": { ja: 'エリカのウツドン', 'zh-TW': '艾莉卡的口呆花' },
  "Erika's Oddish": { ja: 'エリカのナゾノクサ', 'zh-TW': '艾莉卡的走路草' },
  "Erika's Victreebel": { ja: 'エリカのウツボット', 'zh-TW': '艾莉卡的大食花' },
  "Erika's Bellsprout": { ja: 'エリカのマダツボミ', 'zh-TW': '艾莉卡的喇叭芽' },
  "Erika's Tangela": { ja: 'エリカのモンジャラ', 'zh-TW': '艾莉卡的蔓藤怪' },
  "Erika's Venusaur": { ja: 'エリカのフシギバナ', 'zh-TW': '艾莉卡的妙蛙花' },
  "Erika's Bulbasaur": { ja: 'エリカのフシギダネ', 'zh-TW': '艾莉卡的妙蛙種子' },
  "Erika's Ivysaur": { ja: 'エリカのフシギソウ', 'zh-TW': '艾莉卡的妙蛙草' },
  "Erika's Clefairy": { ja: 'エリカのピッピ', 'zh-TW': '艾莉卡的皮皮' },
  "Erika's Clefable": { ja: 'エリカのピクシー', 'zh-TW': '艾莉卡的皮可西' },
  "Erika's Exeggcute": { ja: 'エリカのタマタマ', 'zh-TW': '艾莉卡的蛋蛋' },
  "Erika's Exeggutor": { ja: 'エリカのナッシー', 'zh-TW': '艾莉卡的椰蛋樹' },
  "Erika's Paras": { ja: 'エリカのパラス', 'zh-TW': '艾莉卡的派拉斯' },
  "Erika's Parasect": { ja: 'エリカのパラセクト', 'zh-TW': '艾莉卡的派拉斯特' },
  "Erika's Perfume": { ja: 'エリカの香水', 'zh-TW': '艾莉卡的香水' },
  "Erika's Kindness": { ja: 'エリカのやさしさ', 'zh-TW': '艾莉卡的溫柔' },
  "Erika's Maids": { ja: 'エリカのメイド', 'zh-TW': '艾莉卡的女僕' },
  "Blaine's Moltres": { ja: 'カツラのファイヤー', 'zh-TW': '夏伯的火焰鳥' },
  "Brock's Onix": { ja: 'タケシのイワーク', 'zh-TW': '小剛的大岩蛇' },
  "Misty's Psyduck": { ja: 'カスミのコダック', 'zh-TW': '小霞的可達鴨' },
  "Lt. Surge's Pikachu": { ja: 'マチスのピカチュウ', 'zh-TW': '馬志士的皮卡丘' }
};

// 攻擊名稱翻譯字典
const attackTranslations = {
  'Gooey Thread': { ja: 'ねばねばいと', 'zh-TW': '黏絲' },
  'Poison Ring': { ja: 'どくのわ', 'zh-TW': '毒環' },
  'Send Flowers': { ja: 'はなをおくる', 'zh-TW': '送花' },
  'Leaf Step': { ja: 'リーフステップ', 'zh-TW': '葉子步伐' },
  'Reckless Charge': { ja: 'むこうみずなとっしん', 'zh-TW': '魯莽衝撞' },
  'Solar Cutter': { ja: 'ソーラーカッター', 'zh-TW': '太陽切割' },
  'Fire Spin': { ja: 'かえんほうしゃ', 'zh-TW': '火焰旋渦' },
  'Flamethrower': { ja: 'かえんほうしゃ', 'zh-TW': '噴射火焰' },
  'Thunderbolt': { ja: '10まんボルト', 'zh-TW': '十萬伏特' },
  'Water Gun': { ja: 'みずでっぽう', 'zh-TW': '水槍' },
  'Vine Whip': { ja: 'つるのムチ', 'zh-TW': '藤鞭' },
  'Lunar Power': { ja: 'ルナパワー', 'zh-TW': '月亮之力' },
  'Moon Kick': { ja: 'ムーンキック', 'zh-TW': '月亮踢' },
  'Poison Spray': { ja: 'どくスプレー', 'zh-TW': '毒噴霧' }
};

// 能量類型翻譯字典
const energyTranslations = {
  'Grass': { ja: '草', 'zh-TW': '草' },
  'Fire': { ja: '炎', 'zh-TW': '火' },
  'Water': { ja: '水', 'zh-TW': '水' },
  'Lightning': { ja: '雷', 'zh-TW': '雷' },
  'Psychic': { ja: '超', 'zh-TW': '超' },
  'Fighting': { ja: '闘', 'zh-TW': '格鬥' },
  'Darkness': { ja: '悪', 'zh-TW': '惡' },
  'Metal': { ja: '鋼', 'zh-TW': '鋼' },
  'Dragon': { ja: 'ドラゴン', 'zh-TW': '龍' },
  'Colorless': { ja: '無', 'zh-TW': '無色' },
  'Fairy': { ja: 'フェアリー', 'zh-TW': '妖精' }
};

// 常見攻擊描述翻譯
const attackTextTranslations = {
  "During your opponent's next turn, the Defending Pokémon can't retreat.": {
    ja: "相手の次の番、バトル場のポケモンは逃げられない。",
    'zh-TW': "在對手的下個回合，防禦方的寶可夢無法撤退。"
  },
  "Your opponent's Active Pokémon is now Poisoned.": {
    ja: "相手のバトルポケモンをどくにする。",
    'zh-TW': "對手的戰鬥寶可夢陷入中毒狀態。"
  },
  "Search your deck for an Energy card and attach it to 1 of your Benched Grass Pokémon.": {
    ja: "山札からエネルギーカードを1枚選び、ベンチの草ポケモン1匹につける。",
    'zh-TW': "從牌組中選擇1張能量卡，附加到備戰區的1隻草屬性寶可夢身上。"
  },
  "Then, shuffle your deck.": {
    ja: "その後、山札を切る。",
    'zh-TW': "然後洗牌。"
  },
  "This Pokémon also does 10 damage to itself.": {
    ja: "このポケモンにも10ダメージ。",
    'zh-TW': "這隻寶可夢也受到10點傷害。"
  }
};

// 翻譯寶可夢名稱
function translatePokemonName(englishName, lang) {
  const translation = pokemonTranslations[englishName];
  if (translation && translation[lang]) {
    return translation[lang];
  }
  return englishName;
}

// 翻譯攻擊名稱
function translateAttackName(englishName, lang) {
  const translation = attackTranslations[englishName];
  if (translation && translation[lang]) {
    return translation[lang];
  }
  return englishName;
}

// 翻譯能量類型
function translateEnergyType(englishType, lang) {
  const translation = energyTranslations[englishType];
  if (translation && translation[lang]) {
    return translation[lang];
  }
  return englishType;
}

// 翻譯攻擊描述
function translateAttackText(englishText, lang) {
  if (!englishText) return englishText;
  
  let translatedText = englishText;
  
  // 逐一替換已知的翻譯片段
  Object.entries(attackTextTranslations).forEach(([english, translations]) => {
    if (translations[lang] && translatedText.includes(english)) {
      translatedText = translatedText.replace(english, translations[lang]);
    }
  });
  
  return translatedText;
}

// 載入指定系列的卡片資料
async function loadSetData(setId) {
  try {
    const setPath = path.join(__dirname, `data/sets/${setId}.json`);
    const data = await fs.readFile(setPath, 'utf8');
    const setData = JSON.parse(data);
    
    // 將系列資訊添加到每張卡片中
    if (setData.cards) {
      setData.cards = setData.cards.map(card => ({
        ...card,
        set: setData.set // 添加系列資訊到每張卡片
      }));
    }
    
    return setData;
  } catch (error) {
    console.error(`❌ 載入系列 ${setId} 失敗:`, error.message);
    return null;
  }
}

// 將卡片資料本地化為指定語言
function localizeCard(card, lang) {
  // 處理卡片名稱 - 強制檢查並應用翻譯
  let cardName = getLocalizedText(card.name, lang);
  const englishName = getLocalizedText(card.name, 'en');
  
  // 直接檢查翻譯字典並應用
  if (pokemonTranslations[englishName]) {
    const translation = pokemonTranslations[englishName][lang];
    if (translation) {
      cardName = translation;
    }
  }
  
  // 翻譯攻擊
  const localizedAttacks = card.attacks ? card.attacks.map(attack => {
    let attackName = getLocalizedText(attack.name, lang);
    const englishAttackName = getLocalizedText(attack.name, 'en');
    if (attackName === englishAttackName && attackTranslations[englishAttackName] && attackTranslations[englishAttackName][lang]) {
      attackName = attackTranslations[englishAttackName][lang];
    }
    
    let attackText = getLocalizedText(attack.text, lang);
    const englishAttackText = getLocalizedText(attack.text, 'en');
    if (attackText === englishAttackText && attackTextTranslations[englishAttackText] && attackTextTranslations[englishAttackText][lang]) {
      attackText = attackTextTranslations[englishAttackText][lang];
    }
    
    return {
      ...attack,
      name: attackName,
      cost: attack.cost ? attack.cost.map(energy => {
        const localizedEnergy = getLocalizedText(energy, lang);
        return localizedEnergy === energy && energyTranslations[energy] && energyTranslations[energy][lang] 
          ? energyTranslations[energy][lang] 
          : localizedEnergy;
      }) : [],
      text: attackText,
      damage: attack.damage || '',
      convertedEnergyCost: attack.convertedEnergyCost || 0
    };
  }) : [];
  
  // 翻譯特性
  const localizedAbilities = card.abilities ? card.abilities.map(ability => {
    let abilityName = getLocalizedText(ability.name, lang);
    let abilityText = getLocalizedText(ability.text, lang);
    
    return {
      ...ability,
      name: abilityName,
      text: abilityText,
      type: ability.type || ''
    };
  }) : [];
  
  // 翻譯弱點和抗性
  const localizedWeaknesses = card.weaknesses ? card.weaknesses.map(weakness => {
    const localizedType = getLocalizedText(weakness.type, lang);
    return {
      ...weakness,
      type: localizedType === weakness.type && energyTranslations[weakness.type] && energyTranslations[weakness.type][lang]
        ? energyTranslations[weakness.type][lang]
        : localizedType
    };
  }) : [];
  
  const localizedResistances = card.resistances ? card.resistances.map(resistance => {
    const localizedType = getLocalizedText(resistance.type, lang);
    return {
      ...resistance,
      type: localizedType === resistance.type && energyTranslations[resistance.type] && energyTranslations[resistance.type][lang]
        ? energyTranslations[resistance.type][lang]
        : localizedType
    };
  }) : [];
  
  // 翻譯撤退消耗
  const localizedRetreatCost = card.retreatCost ? card.retreatCost.map(energy => {
    const localizedEnergy = getLocalizedText(energy, lang);
    return localizedEnergy === energy && energyTranslations[energy] && energyTranslations[energy][lang]
      ? energyTranslations[energy][lang]
      : localizedEnergy;
  }) : [];
  
  // 處理系列資訊
  const localizedSet = card.set ? {
    id: card.set.id || '',
    name: card.set.name ? getLocalizedText(card.set.name, lang) : '',
    series: card.set.series || '',
    releaseDate: card.set.releaseDate || ''
  } : null;
  
  return {
    ...card,
    name: cardName,
    supertype: getLocalizedText(card.supertype, lang),
    subtypes: card.subtypes || [],
    types: card.types ? card.types.map(type => getLocalizedText(type, lang)) : [],
    rarity: getLocalizedText(card.rarity, lang),
    hp: card.hp || '',
    number: card.number || '',
    artist: card.artist || '',
    image: card.image || '',
    set: localizedSet,
    attacks: localizedAttacks,
    abilities: localizedAbilities,
    weaknesses: localizedWeaknesses,
    resistances: localizedResistances,
    retreatCost: localizedRetreatCost,
    convertedRetreatCost: card.convertedRetreatCost || 0,
    tcgplayer: card.tcgplayer,
    cardmarket: card.cardmarket
  };
}

// 簡單的測試路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API 正常運作', timestamp: new Date().toISOString() });
});

// 獲取系列列表
app.get('/api/sets', async (req, res) => {
  try {
    console.log('收到系列請求:', req.query);
    
    if (!setsIndex) {
      console.log('載入系列索引...');
      const loaded = await loadSetsIndex();
      if (!loaded) {
        return res.status(500).json({ error: '無法載入系列資料' });
      }
    }

    const lang = req.query.lang || 'en';
    const pageSize = parseInt(req.query.pageSize) || 5;
    const page = parseInt(req.query.page) || 1;
    
    console.log(`處理請求: lang=${lang}, pageSize=${pageSize}, page=${page}`);
    
    // 簡化處理：只取前幾個系列
    const sets = setsIndex.sets.slice(0, pageSize);
    
    // 本地化系列名稱
    const localizedSets = sets.map(set => ({
      id: set.id,
      name: getLocalizedText(set.name, lang),
      series: set.series,
      releaseDate: set.releaseDate,
      cardCount: set.cardCount,
      logo: set.logo,
      symbol: set.symbol
    }));

    console.log(`回傳 ${localizedSets.length} 個系列`);

    res.json({
      data: localizedSets,
      totalCount: setsIndex.totalSets,
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
    console.log('收到卡片請求:', req.query);
    
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
      // 獲取前 5 個最新系列 + 所有經典系列的卡片
      const modernSets = setsIndex.sets.slice(0, 5);
      const classicSets = setsIndex.sets.filter(set => 
        ['base1', 'base2', 'base3', 'base4', 'base5', 'gym1', 'gym2', 'neo1', 'neo2', 'neo3', 'neo4'].includes(set.id)
      );
      const setsToLoad = [...modernSets, ...classicSets];
      
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

    console.log(`回傳 ${pagedCards.length} 張卡片`);

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
    
    console.log(`收到卡片詳細請求: ${id}, 語言: ${lang}`);

    if (!setsIndex) {
      const loaded = await loadSetsIndex();
      if (!loaded) {
        return res.status(500).json({ error: '無法載入系列資料' });
      }
    }

    // 在所有系列中搜尋卡片
    for (const set of setsIndex.sets) {
      const setData = await loadSetData(set.id);
      if (setData) {
        const card = setData.cards.find(c => c.id === id);
        if (card) {
          const localizedCard = localizeCard(card, lang);
          console.log(`找到卡片: ${localizedCard.name}`);
          return res.json({ data: localizedCard });
        }
      }
    }

    console.log(`卡片 ${id} 未找到`);
    res.status(404).json({ error: 'Card not found' });

  } catch (error) {
    console.error('Card detail API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 獲取人氣卡片（簡化版）
app.get('/api/popular-cards', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    
    // 簡化：返回第一個系列的前 5 張卡片作為人氣卡片
    if (setsIndex && setsIndex.sets.length > 0) {
      const firstSet = setsIndex.sets[0];
      const setData = await loadSetData(firstSet.id);
      
      if (setData && setData.cards.length > 0) {
        const popularCards = setData.cards.slice(0, 5).map(card => ({
          ...localizeCard(card, lang),
          clickCount: Math.floor(Math.random() * 100) + 1
        }));
        
        return res.json({ data: popularCards });
      }
    }
    
    res.json({ data: [] });
    
  } catch (error) {
    console.error('Popular cards API error:', error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, async () => {
  console.log(`🚀 簡化後端服務器運行在 http://localhost:${PORT}`);
  
  // 預載系列索引
  await loadSetsIndex();
});