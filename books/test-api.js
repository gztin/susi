// 簡單的 API 測試腳本
const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 開始測試 API...\n');

  // 測試 1: 取得系列列表
  try {
    console.log('📦 測試系列列表...');
    const setsRes = await fetch(`${API_BASE}/sets?pageSize=5`);
    const setsData = await setsRes.json();
    console.log(`✅ 成功取得 ${setsData.data.length} 個系列`);
    console.log(`   第一個系列: ${setsData.data[0]?.name}\n`);
  } catch (error) {
    console.log(`❌ 系列列表測試失敗: ${error.message}\n`);
  }

  // 測試 2: 搜尋卡片
  try {
    console.log('🔍 測試卡片搜尋...');
    const cardsRes = await fetch(`${API_BASE}/cards?q=name:Pikachu&pageSize=3`);
    const cardsData = await cardsRes.json();
    console.log(`✅ 成功搜尋到 ${cardsData.totalCount} 張皮卡丘卡片`);
    console.log(`   顯示前 ${cardsData.data.length} 張\n`);
  } catch (error) {
    console.log(`❌ 卡片搜尋測試失敗: ${error.message}\n`);
  }

  // 測試 3: 取得匯率
  try {
    console.log('💱 測試匯率資料...');
    const ratesRes = await fetch(`${API_BASE}/rates`);
    if (ratesRes.ok) {
      const ratesData = await ratesRes.json();
      console.log(`✅ 匯率資料: JPY→TWD = ${ratesData.jpyToTwd}`);
    } else {
      console.log('⚠️  匯率資料尚未快取，這是正常的');
    }
  } catch (error) {
    console.log(`❌ 匯率測試失敗: ${error.message}`);
  }

  console.log('\n🎉 API 測試完成！');
}

// 如果是 Node.js 環境
if (typeof require !== 'undefined') {
  const fetch = require('node-fetch');
  testAPI();
}