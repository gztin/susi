const fs = require('fs').promises;
const path = require('path');

// 屬性對應表
const TYPE_MAP = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Grass': 'Grass',
  'Lightning': 'Lightning',
  'Psychic': 'Psychic',
  'Fighting': 'Fighting',
  'Darkness': 'Darkness',
  'Metal': 'Metal',
  'Dragon': 'Dragon',
  'Colorless': 'Colorless',
  'Fairy': 'Fairy'
};

class PokemonCardScraper {
  constructor() {
    this.data = {
      lastUpdated: new Date().toISOString(),
      language: 'en',
      cards: {}
    };
    
    // 初始化屬性分類
    Object.keys(TYPE_MAP).forEach(type => {
      this.data.cards[type] = {};
    });
  }

  // 從 Pokemon TCG API 獲取最新英文資料
  async scrapePokemonTCGAPI() {
    console.log('📡 正在從 Pokemon TCG API 獲取最新資料...');
    
    try {
      // 按發布日期降序獲取系列（最新的在前面）
      const setsResponse = await fetch('https://api.pokemontcg.io/v2/sets?pageSize=250&orderBy=-releaseDate');
      const setsData = await setsResponse.json();
      
      console.log(`  找到 ${setsData.data.length} 個系列`);
      
      // 爬取最新的 30 個系列（包含 2024-2026 年的系列）
      for (const set of setsData.data.slice(0, 30)) {
        console.log(`  正在爬取系列: ${set.name} (${set.releaseDate})`);
        await this.scrapeSetCards(set.id, set.name);
        
        // 添加延遲避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error('❌ Pokemon TCG API 爬取失敗:', error.message);
    }
  }

  async scrapeSetCards(setId, setName) {
    try {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=250`);
      const data = await response.json();
      
      console.log(`    - ${setName}: ${data.data.length} 張卡片`);
      
      for (const card of data.data) {
        this.processCard(card, setName);
      }
      
    } catch (error) {
      console.error(`❌ 爬取系列 ${setName} 失敗:`, error.message);
    }
  }

  processCard(card, setName) {
    // 確定卡片屬性
    const cardType = card.types && card.types.length > 0 ? card.types[0] : 'Colorless';
    
    // 確保系列存在
    if (!this.data.cards[cardType][setName]) {
      this.data.cards[cardType][setName] = [];
    }
    
    // 處理卡片資料
    const processedCard = {
      id: card.id,
      name: card.name,
      supertype: card.supertype,
      subtypes: card.subtypes || [],
      types: card.types || [],
      hp: card.hp,
      rarity: card.rarity,
      number: card.number,
      artist: card.artist,
      image: card.images?.large || card.images?.small,
      set: {
        id: card.set.id,
        name: card.set.name,
        series: card.set.series,
        releaseDate: card.set.releaseDate
      },
      attacks: card.attacks || [],
      abilities: card.abilities || [],
      weaknesses: card.weaknesses || [],
      resistances: card.resistances || [],
      retreatCost: card.retreatCost || [],
      convertedRetreatCost: card.convertedRetreatCost || 0,
      tcgplayer: card.tcgplayer,
      cardmarket: card.cardmarket
    };
    
    this.data.cards[cardType][setName].push(processedCard);
  }

  async saveData() {
    try {
      const filePath = path.join(__dirname, '../frontend/data/pokemonEN.json');
      await fs.writeFile(filePath, JSON.stringify(this.data, null, 2), 'utf8');
      
      // 統計
      const stats = this.generateStats();
      console.log('✅ 英文資料爬取完成:');
      console.log(`   總卡片數: ${stats.totalCards}`);
      console.log(`   檔案位置: ${filePath}`);
      
      return stats;
    } catch (error) {
      console.error('❌ 儲存資料失敗:', error.message);
      return null;
    }
  }

  generateStats() {
    let totalCards = 0;
    const typeStats = {};
    
    Object.entries(this.data.cards).forEach(([type, typeData]) => {
      let typeCount = 0;
      Object.values(typeData).forEach(setCards => {
        typeCount += setCards.length;
      });
      typeStats[type] = typeCount;
      totalCards += typeCount;
    });
    
    return { totalCards, typeStats };
  }

  async run() {
    console.log('🌍 開始爬取最新寶可夢卡片資料...');
    
    try {
      await this.scrapePokemonTCGAPI();
      const stats = await this.saveData();
      
      if (stats) {
        console.log('');
        console.log('📊 各屬性卡片數:');
        Object.entries(stats.typeStats).forEach(([type, count]) => {
          console.log(`  ${type}: ${count} 張`);
        });
        console.log('');
        console.log('🎉 英文資料爬取完成！');
        console.log('');
        console.log('下一步：執行翻譯系統生成多語言版本');
        console.log('  node translation_scraper.js');
      }
      
    } catch (error) {
      console.error('❌ 爬取過程中發生錯誤:', error);
    }
  }
}

async function main() {
  const scraper = new PokemonCardScraper();
  await scraper.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PokemonCardScraper };