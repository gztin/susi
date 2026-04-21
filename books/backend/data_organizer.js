const fs = require('fs').promises;
const path = require('path');

class CardDataOrganizer {
  constructor() {
    this.pokemonTCGAPI = 'https://api.pokemontcg.io/v2';
    this.translations = {
      // Pokemon 名稱翻譯對照表
      pokemon: {
        'Charizard': { ja: 'リザードン', 'zh-TW': '噴火龍' },
        'Blastoise': { ja: 'カメックス', 'zh-TW': '水箭龜' },
        'Venusaur': { ja: 'フシギバナ', 'zh-TW': '妙蛙花' },
        'Pikachu': { ja: 'ピカチュウ', 'zh-TW': '皮卡丘' },
        'Raichu': { ja: 'ライチュウ', 'zh-TW': '雷丘' },
        'Squirtle': { ja: 'ゼニガメ', 'zh-TW': '傑尼龜' },
        'Wartortle': { ja: 'カメール', 'zh-TW': '卡咪龜' },
        'Charmander': { ja: 'ヒトカゲ', 'zh-TW': '小火龍' },
        'Charmeleon': { ja: 'リザード', 'zh-TW': '火恐龍' },
        'Bulbasaur': { ja: 'フシギダネ', 'zh-TW': '妙蛙種子' },
        'Ivysaur': { ja: 'フシギソウ', 'zh-TW': '妙蛙草' },
        // 可以繼續添加更多寶可夢翻譯...
      },
      
      // 系列名稱翻譯
      sets: {
        'Perfect Order': { ja: 'パーフェクトオーダー', 'zh-TW': '完美秩序' },
        'Ascended Heroes': { ja: 'アセンデッドヒーローズ', 'zh-TW': '昇華英雄' },
        'Phantasmal Flames': { ja: 'ファントムフレイム', 'zh-TW': '幻影烈焰' },
        'Mega Evolution': { ja: 'メガシンカ', 'zh-TW': '超級進化' },
        'White Flare': { ja: 'ホワイトフレア', 'zh-TW': '白色閃焰' },
        'Black Bolt': { ja: 'ブラックボルト', 'zh-TW': '黑色雷電' },
        'Destined Rivals': { ja: 'デスティニーライバル', 'zh-TW': '宿命對手' },
        'Journey Together': { ja: 'ジャーニートゥゲザー', 'zh-TW': '共同旅程' },
        'Prismatic Evolutions': { ja: 'プリズマティックエボリューション', 'zh-TW': '稜鏡進化' },
        'Surging Sparks': { ja: 'サージングスパーク', 'zh-TW': '激流火花' },
        'Stellar Crown': { ja: 'ステラークラウン', 'zh-TW': '星辰王冠' },
        'Shrouded Fable': { ja: 'シュラウデッドフェイブル', 'zh-TW': '神秘傳說' },
        'Twilight Masquerade': { ja: 'トワイライトマスカレード', 'zh-TW': '黃昏假面舞會' },
        'Temporal Forces': { ja: 'テンポラルフォース', 'zh-TW': '時空之力' },
        'Paldean Fates': { ja: 'パルデアの運命', 'zh-TW': '帕底亞命運' },
        'Paradox Rift': { ja: 'パラドックスリフト', 'zh-TW': '悖論裂縫' },
        'Obsidian Flames': { ja: 'オブシディアンフレイム', 'zh-TW': '黑曜石烈焰' },
        'Paldea Evolved': { ja: 'パルデア進化', 'zh-TW': '帕底亞進化' },
        'Scarlet & Violet': { ja: 'スカーレット&バイオレット', 'zh-TW': '朱紫' },
        'Crown Zenith': { ja: 'クラウンゼニス', 'zh-TW': '王冠頂點' },
        'Silver Tempest': { ja: 'シルバーテンペスト', 'zh-TW': '銀色風暴' },
        'Lost Origin': { ja: 'ロストオリジン', 'zh-TW': '失落起源' },
        'Pokemon GO': { ja: 'ポケモンGO', 'zh-TW': '寶可夢GO' },
        'Astral Radiance': { ja: 'アストラルレディアンス', 'zh-TW': '星輝光芒' },
        'Brilliant Stars': { ja: 'ブリリアントスター', 'zh-TW': '璀璨星辰' },
        'Fusion Strike': { ja: 'フュージョンストライク', 'zh-TW': '融合突擊' },
        'Evolving Skies': { ja: 'エボルビングスカイ', 'zh-TW': '進化天空' },
        'Chilling Reign': { ja: 'チリングレイン', 'zh-TW': '寒冰統治' },
        'Battle Styles': { ja: 'バトルスタイル', 'zh-TW': '戰鬥風格' },
        // 經典系列
        'Base': { ja: 'ポケットモンスター', 'zh-TW': '基本系列' },
        'Jungle': { ja: 'ポケモンジャングル', 'zh-TW': '叢林' },
        'Fossil': { ja: 'ポケモン化石の秘密', 'zh-TW': '化石' },
        'Team Rocket': { ja: 'ロケット団', 'zh-TW': '火箭隊' },
        'Gym Heroes': { ja: 'ポケモンジム', 'zh-TW': '道館英雄' },
        'Gym Challenge': { ja: 'ポケモンジム拡張パック', 'zh-TW': '道館挑戰' },
        'Neo Genesis': { ja: '金・銀 新世界へ...', 'zh-TW': '新世代' },
        'Neo Discovery': { ja: '金・銀 ポケモンを発見!', 'zh-TW': '新發現' },
        'Neo Revelation': { ja: '金・銀 めざめる超能力', 'zh-TW': '新啟示' },
        'Neo Destiny': { ja: '金・銀 闇、そして光へ...', 'zh-TW': '新命運' }
      },
      
      // 屬性翻譯
      types: {
        'Fire': { ja: '炎', 'zh-TW': '火' },
        'Water': { ja: '水', 'zh-TW': '水' },
        'Grass': { ja: '草', 'zh-TW': '草' },
        'Lightning': { ja: '雷', 'zh-TW': '雷' },
        'Psychic': { ja: '超', 'zh-TW': '超' },
        'Fighting': { ja: '闘', 'zh-TW': '格鬥' },
        'Darkness': { ja: '悪', 'zh-TW': '惡' },
        'Metal': { ja: '鋼', 'zh-TW': '鋼' },
        'Dragon': { ja: 'ドラゴン', 'zh-TW': '龍' },
        'Colorless': { ja: '無', 'zh-TW': '無色' },
        'Fairy': { ja: 'フェアリー', 'zh-TW': '妖精' }
      },
      
      // 稀有度翻譯
      rarity: {
        'Common': { ja: 'コモン', 'zh-TW': '普通' },
        'Uncommon': { ja: 'アンコモン', 'zh-TW': '不常見' },
        'Rare': { ja: 'レア', 'zh-TW': '稀有' },
        'Rare Holo': { ja: 'レアホロ', 'zh-TW': '稀有閃卡' },
        'Promo': { ja: 'プロモ', 'zh-TW': '宣傳卡' }
      },
      
      // 卡片類型翻譯
      supertypes: {
        'Pokémon': { ja: 'ポケモン', 'zh-TW': '寶可夢' },
        'Trainer': { ja: 'トレーナー', 'zh-TW': '訓練家' },
        'Energy': { ja: 'エネルギー', 'zh-TW': '能量' }
      }
    };
  }

  // 獲取所有系列
  async fetchAllSets() {
    try {
      console.log('📡 正在獲取所有系列資料...');
      const response = await fetch(`${this.pokemonTCGAPI}/sets?pageSize=250&orderBy=-releaseDate`);
      const data = await response.json();
      
      console.log(`  找到 ${data.data.length} 個系列`);
      return data.data;
    } catch (error) {
      console.error('❌ 獲取系列失敗:', error.message);
      return [];
    }
  }

  // 獲取指定系列的所有卡片
  async fetchSetCards(setId) {
    try {
      const response = await fetch(`${this.pokemonTCGAPI}/cards?q=set.id:${setId}&pageSize=250`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`❌ 獲取系列 ${setId} 卡片失敗:`, error.message);
      return [];
    }
  }

  // 翻譯卡片名稱
  translateCardName(englishName) {
    const translation = this.translations.pokemon[englishName];
    return {
      en: englishName,
      ja: translation?.ja || englishName,
      'zh-TW': translation?.['zh-TW'] || englishName
    };
  }

  // 翻譯系列名稱
  translateSetName(englishName) {
    const translation = this.translations.sets[englishName];
    return {
      en: englishName,
      ja: translation?.ja || englishName,
      'zh-TW': translation?.['zh-TW'] || englishName
    };
  }

  // 翻譯屬性
  translateTypes(types) {
    return types.map(type => ({
      en: type,
      ja: this.translations.types[type]?.ja || type,
      'zh-TW': this.translations.types[type]?.['zh-TW'] || type
    }));
  }

  // 翻譯稀有度
  translateRarity(rarity) {
    if (!rarity) return { en: '', ja: '', 'zh-TW': '' };
    const translation = this.translations.rarity[rarity];
    return {
      en: rarity,
      ja: translation?.ja || rarity,
      'zh-TW': translation?.['zh-TW'] || rarity
    };
  }

  // 翻譯超級類型
  translateSupertype(supertype) {
    const translation = this.translations.supertypes[supertype];
    return {
      en: supertype,
      ja: translation?.ja || supertype,
      'zh-TW': translation?.['zh-TW'] || supertype
    };
  }

  // 處理單張卡片，添加多語言支援
  processCard(card) {
    return {
      id: card.id,
      name: this.translateCardName(card.name),
      supertype: this.translateSupertype(card.supertype),
      subtypes: card.subtypes || [],
      types: this.translateTypes(card.types || []),
      hp: card.hp,
      rarity: this.translateRarity(card.rarity),
      number: card.number,
      artist: card.artist,
      image: card.images?.large || card.images?.small,
      attacks: card.attacks || [],
      abilities: card.abilities || [],
      weaknesses: card.weaknesses || [],
      resistances: card.resistances || [],
      retreatCost: card.retreatCost || [],
      convertedRetreatCost: card.convertedRetreatCost || 0,
      tcgplayer: card.tcgplayer,
      cardmarket: card.cardmarket
    };
  }

  // 為每個系列創建 JSON 檔案
  async createSetFiles() {
    try {
      const sets = await this.fetchAllSets();
      
      // 創建資料目錄
      const dataDir = path.join(__dirname, '../frontend/data/sets');
      await fs.mkdir(dataDir, { recursive: true });
      
      // 創建系列索引檔案
      const setsIndex = sets.map(set => ({
        id: set.id,
        name: this.translateSetName(set.name),
        series: set.series,
        releaseDate: set.releaseDate,
        cardCount: set.total,
        logo: set.images?.logo,
        symbol: set.images?.symbol
      }));
      
      await fs.writeFile(
        path.join(dataDir, 'index.json'),
        JSON.stringify({
          lastUpdated: new Date().toISOString(),
          totalSets: sets.length,
          sets: setsIndex
        }, null, 2),
        'utf8'
      );
      
      console.log(`✅ 系列索引檔案已創建: ${sets.length} 個系列`);
      
      // 處理每個系列（包含最新30個 + 經典系列）
      const modernSets = sets.slice(0, 30); // 最新30個系列
      const classicSets = sets.filter(set => 
        ['base1', 'base2', 'base3', 'base4', 'base5', 'gym1', 'gym2', 'neo1', 'neo2', 'neo3', 'neo4'].includes(set.id)
      ); // 經典系列
      
      const setsToProcess = [...modernSets, ...classicSets];
      
      for (const set of setsToProcess) {
        console.log(`📝 正在處理系列: ${set.name} (${set.releaseDate})`);
        
        const cards = await this.fetchSetCards(set.id);
        const processedCards = cards.map(card => this.processCard(card));
        
        const setData = {
          lastUpdated: new Date().toISOString(),
          set: {
            id: set.id,
            name: this.translateSetName(set.name),
            series: set.series,
            releaseDate: set.releaseDate,
            cardCount: cards.length,
            logo: set.images?.logo,
            symbol: set.images?.symbol
          },
          cards: processedCards
        };
        
        // 儲存系列檔案
        const fileName = `${set.id}.json`;
        await fs.writeFile(
          path.join(dataDir, fileName),
          JSON.stringify(setData, null, 2),
          'utf8'
        );
        
        console.log(`  ✅ ${set.name}: ${cards.length} 張卡片 -> ${fileName}`);
        
        // 添加延遲避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('');
      console.log('🎉 所有系列檔案創建完成！');
      console.log(`📂 檔案位置: frontend/data/sets/`);
      console.log('');
      console.log('檔案結構:');
      console.log('  - index.json (系列索引)');
      console.log('  - [setId].json (各系列卡片資料)');
      
    } catch (error) {
      console.error('❌ 創建系列檔案失敗:', error);
    }
  }

  async run() {
    console.log('🌍 開始重新組織卡片資料...');
    console.log('📋 將按系列分別創建 JSON 檔案，包含多語言名稱');
    console.log('');
    
    await this.createSetFiles();
  }
}

async function main() {
  const organizer = new CardDataOrganizer();
  await organizer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CardDataOrganizer };