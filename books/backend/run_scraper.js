#!/usr/bin/env node

const { MultiLanguageCardScraper } = require('./card_scraper');

async function main() {
  console.log('🚀 開始爬取多語言寶可夢卡片資料...');
  console.log('🌍 支援語言: 英文 (EN) | 日文 (JA) | 繁體中文 (ZH-TW)');
  console.log('📊 資料來源: Pokemon TCG API + 官方網站');
  console.log('📁 輸出格式: JSON (按語言和屬性分類)');
  console.log('');

  const scraper = new MultiLanguageCardScraper();
  
  try {
    await scraper.init();
    console.log('✅ 瀏覽器初始化完成');
    
    await scraper.scrapeMultiLanguageData();
    console.log('✅ 多語言資料爬取完成');
    
    await scraper.saveData();
    console.log('✅ 資料儲存完成');
    
    console.log('');
    console.log('🎉 所有操作完成！');
    console.log('📂 資料檔案位置:');
    console.log('  - 英文: frontend/data/pokemonEN.json');
    console.log('  - 日文: frontend/data/pokemonJP.json');
    console.log('  - 繁中: frontend/data/pokemonTW.json');
    console.log('');
    console.log('現在你可以重新啟動 Docker 服務來使用新資料：');
    console.log('  docker-compose restart');
    
  } catch (error) {
    console.error('❌ 執行過程中發生錯誤:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}