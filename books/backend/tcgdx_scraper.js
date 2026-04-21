const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// TCGdx API 基礎 URL
const API_BASE = 'https://api.tcgdex.net/v2';

// 支援的語言
const LANGUAGES = {
  'en': 'English',
  'ja': 'Japanese', 
  'zh-TW': 'Traditional Chinese'
};

// HTTP 請求函數
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        } catch (error) {
          reject(new Error(`JSON 解析失敗: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// 延遲函數，避免 API 限制
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 獲取系列列表
async function fetchSets(lang = 'en') {
  try {
    console.log(`📋 獲取 ${LANGUAGES[lang]} 系列列表...`);
    
    const sets = await httpGet(`${API_BASE}/${lang}/sets`);
    console.log(`✅ 獲取到 ${sets.length} 個系列 (${lang})`);
    
    return sets;
  } catch (error) {
    console.error(`❌ 獲取系列失敗 (${lang}):`, error.message);
    return [];
  }
}

// 獲取單個系列的卡片
async function fetchSetCards(setId, lang = 'en') {
  try {
    console.log(`🃏 獲取系列 ${setId} 的卡片 (${lang})...`);
    
    const setData = await httpGet(`${API_BASE}/${lang}/sets/${setId}`);
    console.log(`✅ 獲取到 ${setData.cards?.length || 0} 張卡片 (${setId} - ${lang})`);
    
    return setData;
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`⚠️  系列 ${setId} 在 ${lang} 中不存在`);
      return null;
    }
    console.error(`❌ 獲取系列 ${setId} 失敗 (${lang}):`, error.message);
    return null;
  }
}

// 建立多語言卡片對照表
async function createMultiLanguageData() {
  console.log('🚀 開始建立多語言卡片資料...\n');
  
  // 1. 獲取英文系列列表作為基準
  const englishSets = await fetchSets('en');
  if (!englishSets.length) {
    console.error('❌ 無法獲取英文系列列表，終止程序');
    return;
  }
  
  // 2. 選擇要處理的系列（最新的 20 個系列 + 經典系列）
  const modernSets = englishSets.slice(0, 20);
  const classicSetIds = ['base1', 'base2', 'base3', 'gym1', 'gym2', 'neo1', 'neo2', 'neo3', 'neo4'];
  const classicSets = englishSets.filter(set => classicSetIds.includes(set.id));
  const targetSets = [...modernSets, ...classicSets];
  
  console.log(`🎯 將處理 ${targetSets.length} 個系列`);
  console.log('現代系列:', modernSets.map(s => s.id).join(', '));
  console.log('經典系列:', classicSets.map(s => s.id).join(', '));
  console.log('');
  
  // 3. 建立多語言資料結構
  const multiLanguageData = {
    lastUpdated: new Date().toISOString(),
    totalSets: targetSets.length,
    languages: Object.keys(LANGUAGES),
    sets: {}
  };
  
  // 4. 處理每個系列
  for (let i = 0; i < targetSets.length; i++) {
    const set = targetSets[i];
    console.log(`\n📦 處理系列 ${i + 1}/${targetSets.length}: ${set.id} (${set.name})`);
    
    const setData = {
      id: set.id,
      names: {},
      series: set.series || '',
      releaseDate: set.releaseDate || '',
      cardCount: set.cardCount || { total: 0, official: 0 },
      logo: set.logo || '',
      symbol: set.symbol || '',
      cards: {}
    };
    
    // 5. 獲取每種語言的資料
    for (const lang of Object.keys(LANGUAGES)) {
      console.log(`  🌐 獲取 ${LANGUAGES[lang]} 資料...`);
      
      const langSetData = await fetchSetCards(set.id, lang);
      await delay(500); // 避免 API 限制
      
      if (langSetData) {
        // 儲存系列名稱
        setData.names[lang] = langSetData.name || set.name;
        
        // 處理卡片資料
        if (langSetData.cards && langSetData.cards.length > 0) {
          langSetData.cards.forEach(card => {
            const cardId = card.id;
            
            // 初始化卡片資料結構
            if (!setData.cards[cardId]) {
              setData.cards[cardId] = {
                id: cardId,
                localId: card.localId || '',
                number: card.localId || '',
                names: {},
                category: card.category || '',
                supertype: {},
                subtypes: card.subtypes || [],
                types: {},
                hp: card.hp || '',
                rarity: {},
                artist: card.artist || '',
                image: card.image || '',
                attacks: {},
                abilities: {},
                weaknesses: card.weaknesses || [],
                resistances: card.resistances || [],
                retreatCost: card.retreatCost || [],
                convertedRetreatCost: card.convertedRetreatCost || 0
              };
            }
            
            // 儲存多語言資料
            const cardData = setData.cards[cardId];
            cardData.names[lang] = card.name || '';
            
            // 處理 supertype
            if (card.supertype) {
              cardData.supertype[lang] = card.supertype;
            }
            
            // 處理 types
            if (card.types && card.types.length > 0) {
              cardData.types[lang] = card.types;
            }
            
            // 處理 rarity
            if (card.rarity) {
              cardData.rarity[lang] = card.rarity;
            }
            
            // 處理攻擊
            if (card.attacks && card.attacks.length > 0) {
              cardData.attacks[lang] = card.attacks.map(attack => ({
                name: attack.name || '',
                cost: attack.cost || [],
                convertedEnergyCost: attack.convertedEnergyCost || 0,
                damage: attack.damage || '',
                text: attack.text || ''
              }));
            }
            
            // 處理特性
            if (card.abilities && card.abilities.length > 0) {
              cardData.abilities[lang] = card.abilities.map(ability => ({
                name: ability.name || '',
                text: ability.text || '',
                type: ability.type || ''
              }));
            }
          });
        }
      } else {
        console.log(`  ⚠️  ${LANGUAGES[lang]} 資料不可用`);
        setData.names[lang] = set.name; // 使用英文名稱作為備用
      }
    }
    
    multiLanguageData.sets[set.id] = setData;
    console.log(`  ✅ 系列 ${set.id} 處理完成`);
  }
  
  // 6. 儲存資料
  console.log('\n💾 儲存資料...');
  
  // 儲存完整的多語言資料
  const fullDataPath = path.join(__dirname, '../frontend/data/tcgdx_multilang.json');
  await fs.writeFile(fullDataPath, JSON.stringify(multiLanguageData, null, 2), 'utf8');
  console.log(`✅ 完整資料已儲存: ${fullDataPath}`);
  
  // 7. 建立各語言的獨立檔案
  for (const lang of Object.keys(LANGUAGES)) {
    console.log(`📝 建立 ${LANGUAGES[lang]} 獨立檔案...`);
    
    const langData = {
      lastUpdated: multiLanguageData.lastUpdated,
      language: lang,
      languageName: LANGUAGES[lang],
      totalSets: multiLanguageData.totalSets,
      sets: {}
    };
    
    // 轉換為單語言格式
    Object.entries(multiLanguageData.sets).forEach(([setId, setData]) => {
      langData.sets[setId] = {
        id: setData.id,
        name: setData.names[lang] || setData.names['en'] || setId,
        series: setData.series,
        releaseDate: setData.releaseDate,
        cardCount: setData.cardCount,
        logo: setData.logo,
        symbol: setData.symbol,
        cards: []
      };
      
      // 轉換卡片資料
      Object.values(setData.cards).forEach(card => {
        const langCard = {
          id: card.id,
          localId: card.localId,
          number: card.number,
          name: card.names[lang] || card.names['en'] || '',
          category: card.category,
          supertype: card.supertype[lang] || card.supertype['en'] || '',
          subtypes: card.subtypes,
          types: card.types[lang] || card.types['en'] || [],
          hp: card.hp,
          rarity: card.rarity[lang] || card.rarity['en'] || '',
          artist: card.artist,
          image: card.image,
          attacks: card.attacks[lang] || card.attacks['en'] || [],
          abilities: card.abilities[lang] || card.abilities['en'] || [],
          weaknesses: card.weaknesses,
          resistances: card.resistances,
          retreatCost: card.retreatCost,
          convertedRetreatCost: card.convertedRetreatCost
        };
        
        langData.sets[setId].cards.push(langCard);
      });
    });
    
    // 儲存單語言檔案
    const langFileName = lang === 'zh-TW' ? 'tcgdx_chinese.json' : 
                         lang === 'ja' ? 'tcgdx_japanese.json' : 
                         'tcgdx_english.json';
    const langFilePath = path.join(__dirname, '../frontend/data', langFileName);
    await fs.writeFile(langFilePath, JSON.stringify(langData, null, 2), 'utf8');
    console.log(`✅ ${LANGUAGES[lang]} 檔案已儲存: ${langFilePath}`);
  }
  
  // 8. 建立系列索引檔案
  console.log('📋 建立系列索引...');
  const setsIndex = {
    lastUpdated: multiLanguageData.lastUpdated,
    totalSets: multiLanguageData.totalSets,
    sets: Object.values(multiLanguageData.sets).map(set => ({
      id: set.id,
      name: set.names,
      series: set.series,
      releaseDate: set.releaseDate,
      cardCount: set.cardCount,
      logo: set.logo,
      symbol: set.symbol
    }))
  };
  
  const indexPath = path.join(__dirname, '../frontend/data/tcgdx_sets_index.json');
  await fs.writeFile(indexPath, JSON.stringify(setsIndex, null, 2), 'utf8');
  console.log(`✅ 系列索引已儲存: ${indexPath}`);
  
  console.log('\n🎉 多語言資料建立完成！');
  console.log(`📊 統計資訊:`);
  console.log(`   - 處理系列數: ${multiLanguageData.totalSets}`);
  console.log(`   - 支援語言: ${Object.values(LANGUAGES).join(', ')}`);
  console.log(`   - 總卡片數: ${Object.values(multiLanguageData.sets).reduce((total, set) => total + Object.keys(set.cards).length, 0)}`);
}

// 主程序
async function main() {
  try {
    await createMultiLanguageData();
  } catch (error) {
    console.error('❌ 程序執行失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此檔案
if (require.main === module) {
  main();
}

module.exports = {
  fetchSets,
  fetchSetCards,
  createMultiLanguageData
};