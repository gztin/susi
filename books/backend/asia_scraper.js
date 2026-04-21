/**
 * asia.pokemon-card.com 繁體中文卡牌資料爬蟲
 * 按系列爬取，每個系列存成獨立 JSON 檔案
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const TW_BASE = 'https://asia.pokemon-card.com/tw';
const OUTPUT_DIR = path.join(__dirname, '../frontend/data/sets_tw');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject)
      .setTimeout(15000, function() { this.destroy(); reject(new Error('Timeout')); });
  });
}

function httpPost(url, postData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': `${TW_BASE}/card-search/`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, function() { this.destroy(); reject(new Error('Timeout')); });
    req.write(postData);
    req.end();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 解析搜尋頁面的所有系列
function parseSets(html) {
  const sets = [];
  const regex = /href="\/tw\/card-search\/list\/\?expansionCodes=([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="series">([^<]+)<\/span>[\s\S]*?class="expansionTitle">\s*([^\n<]+)\s*[\s\S]*?datetime="([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    sets.push({
      code: m[1],
      image: m[2],
      series: m[3].trim(),
      name: m[4].trim().replace(/&amp;/g, '&'),
      releaseDate: m[5]
    });
  }
  return sets;
}

// 解析卡片列表頁，取得卡片 ID 和總頁數
function parseCardListPage(html) {
  const ids = [];
  const idRegex = /href="\/tw\/card-search\/detail\/(\d+)\/"/g;
  let m;
  while ((m = idRegex.exec(html)) !== null) ids.push(m[1]);

  const totalMatch = html.match(/共\s*(\d+)\s*頁/);
  const totalPages = totalMatch ? parseInt(totalMatch[1]) : 1;

  return { ids: [...new Set(ids)], totalPages };
}

// 解析卡片詳細頁面
function parseCardDetail(html, cardId) {
  const nameMatch = html.match(/class="pageHeader cardDetail"[^>]*>[\s\S]*?<\/span>\s*([\s\S]*?)\s*<\/h1>/);
  const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  const imgMatch = html.match(/class="cardImage"[\s\S]*?<img src="([^"]+)"/);
  const image = imgMatch ? imgMatch[1] : '';

  const typeMatch = html.match(/class="type"[^>]*>屬性<\/span>\s*<img src="[^"]*\/energy\/([^.]+)\.png"/);
  const type = typeMatch ? typeMatch[1] : '';

  const rarityMatch = html.match(/<span class="alpha">\s*([A-Z]+)\s*<\/span>/);
  const rarity = rarityMatch ? rarityMatch[1].trim() : '';

  const collectorMatch = html.match(/<span class="collectorNumber">\s*([\d\/]+)\s*<\/span>/);
  const collectorNumber = collectorMatch ? collectorMatch[1].trim() : '';

  const evolveMatch = html.match(/class="evolveMarker"[^>]*>\s*([\s\S]*?)\s*<\/span>/);
  const evolveStage = evolveMatch ? evolveMatch[1].trim() : '';

  const dexMatch = html.match(/No\.(\d+)/);
  const dexNumber = dexMatch ? dexMatch[1] : '';

  const artistMatch = html.match(/class="illustrator"[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  return { id: cardId, name, image, type, rarity, collectorNumber, evolveStage, dexNumber, artist };
}

// 爬取單一系列的所有卡片
async function scrapeSet(setCode) {
  const allIds = [];

  const firstRes = await httpPost(`${TW_BASE}/card-search/list/`, `expansionCodes=${setCode}&page=1`);
  const { ids: firstIds, totalPages } = parseCardListPage(firstRes.body);
  allIds.push(...firstIds);
  console.log(`   共 ${totalPages} 頁`);

  for (let page = 2; page <= totalPages; page++) {
    await delay(600);
    const res = await httpPost(`${TW_BASE}/card-search/list/`, `expansionCodes=${setCode}&page=${page}`);
    const { ids } = parseCardListPage(res.body);
    allIds.push(...ids);
    process.stdout.write(`\r   頁面進度: ${page}/${totalPages}`);
  }
  if (totalPages > 1) console.log();
  console.log(`   找到 ${allIds.length} 張卡片 ID`);

  const cards = [];
  for (let i = 0; i < allIds.length; i++) {
    const id = allIds[i];
    process.stdout.write(`\r   卡片進度: ${i + 1}/${allIds.length}`);
    try {
      const res = await httpGet(`${TW_BASE}/card-search/detail/${id}/`);
      if (res.status === 200) {
        const card = parseCardDetail(res.body, id);
        if (card.name) cards.push(card);
      }
    } catch (e) {
      console.error(`\n   ❌ 卡片 ${id} 失敗:`, e.message);
    }
    await delay(400);
  }
  console.log(`\n   ✅ 成功爬取 ${cards.length} 張卡片`);
  return cards;
}

// 主程序
async function main() {
  console.log('🚀 開始爬取 asia.pokemon-card.com/tw\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const res = await httpGet(`${TW_BASE}/card-search/`);
  const sets = parseSets(res.body);
  console.log(`📋 找到 ${sets.length} 個系列`);

  // 儲存系列索引
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify({ lastUpdated: new Date().toISOString(), sets }, null, 2)
  );
  console.log(`✅ 系列索引已儲存`);

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    console.log(`\n[${i + 1}/${sets.length}] ${set.name} (${set.code})`);

    const outPath = path.join(OUTPUT_DIR, `${set.code}.json`);
    try {
      await fs.access(outPath);
      console.log(`   ⏭️  已存在，跳過`);
      continue;
    } catch {}

    try {
      const cards = await scrapeSet(set.code);
      await fs.writeFile(outPath, JSON.stringify({ ...set, totalCards: cards.length, cards }, null, 2));
      console.log(`   💾 已儲存: ${set.code}.json`);
    } catch (e) {
      console.error(`   ❌ 系列 ${set.code} 失敗:`, e.message);
    }

    await delay(1000);
  }

  console.log('\n🎉 全部完成！');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseSets, scrapeSet, parseCardDetail };
