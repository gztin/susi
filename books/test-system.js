const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testSystem() {
  console.log('🧪 測試完整系統...\n');

  try {
    // 測試 1: 系列列表
    console.log('📦 測試系列列表 API...');
    const setsRes = await fetch(`${API_BASE}/sets?lang=zh-TW`);
    if (!setsRes.ok) throw new Error(`HTTP ${setsRes.status}`);
    const setsData = await setsRes.json();
    console.log(`✅ 成功取得 ${setsData.data.length} 個系列`);
    console.log(`   第一個系列: ${setsData.data[0]?.name} (${setsData.data[0]?.id})`);

    // 測試 2: 卡片搜尋
    console.log('\n🔍 測試卡片搜尋 API...');
    const cardsRes = await fetch(`${API_BASE}/cards?lang=zh-TW&name=pikachu&pageSize=5`);
    if (!cardsRes.ok) throw new Error(`HTTP ${cardsRes.status}`);
    const cardsData = await cardsRes.json();
    console.log(`✅ 成功搜尋到 ${cardsData.data.length} 張皮卡丘卡片`);
    if (cardsData.data[0]) {
      console.log(`   第一張卡片: ${cardsData.data[0].name} (${cardsData.data[0].id})`);
    }

    // 測試 3: 單張卡片詳細資料
    if (cardsData.data[0]) {
      console.log('\n🃏 測試卡片詳細資料 API...');
      const cardRes = await fetch(`${API_BASE}/cards/${cardsData.data[0].id}?lang=zh-TW`);
      if (!cardRes.ok) throw new Error(`HTTP ${cardRes.status}`);
      const cardData = await cardRes.json();
      console.log(`✅ 成功取得卡片: ${cardData.data.name}`);
      console.log(`   HP: ${cardData.data.hp || 'N/A'}`);
      console.log(`   類型: ${cardData.data.types?.join(', ') || 'N/A'}`);
      console.log(`   有價格資料: ${!!cardData.data.pricing}`);
    }

    // 測試 4: 匯率 API
    console.log('\n💱 測試匯率 API...');
    const ratesRes = await fetch(`${API_BASE}/rates`);
    if (ratesRes.ok) {
      const ratesData = await ratesRes.json();
      console.log(`✅ 匯率資料: JPY→TWD = ${ratesData.jpyToTwd}`);
    } else {
      console.log('⚠️  匯率資料尚未快取，這是正常的');
    }

    // 測試 5: 人氣卡片 API
    console.log('\n🔥 測試人氣卡片 API...');
    const popularRes = await fetch(`${API_BASE}/popular-cards?lang=zh-TW`);
    if (!popularRes.ok) throw new Error(`HTTP ${popularRes.status}`);
    const popularData = await popularRes.json();
    console.log(`✅ 成功取得 ${popularData.data.length} 張人氣卡片`);

    console.log('\n🎉 所有 API 測試通過！');
    console.log('\n📝 系統摘要:');
    console.log(`   - 資料來源: TCGdx API (多語言支援)`);
    console.log(`   - 支援語言: 中文、英文、日文`);
    console.log(`   - 價格來源: TCGPlayer (美版)、Cardmarket (歐版)、Pokeca Chart (日版)`);
    console.log(`   - 無需 API Key，完全免費使用`);

  } catch (error) {
    console.error('❌ 系統測試失敗:', error.message);
    console.log('\n💡 請確認:');
    console.log('   1. 後端服務是否在 port 3001 運行');
    console.log('   2. 網路連線是否正常');
    console.log('   3. TCGdx API 是否可用');
  }
}

testSystem();