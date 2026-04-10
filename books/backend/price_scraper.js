const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/**
 * 從 grading.pokeca-chart.com 抓取日版價格（puppeteer 渲染動態內容）
 * @param {string} setId  日版系列 ID，例如 sv2a
 * @param {string} number 卡號，例如 205
 * @param {string} total  系列總張數，例如 165
 * @param {number} jpyToTwd 日幣→台幣匯率（由 server 傳入）
 */
async function fetchJpPrice(setId, number, total, jpyToTwd = 0.21) {
  const url = `https://grading.pokeca-chart.com/${setId}-${number}-${total}/`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // 等待價格表格填入（JS 動態渲染）
    await page.waitForSelector('#price-table-body tr', { timeout: 15000 })
      .catch(() => {}); // 若無資料也繼續

    const data = await page.evaluate(() => {
      // 標題
      const h1 = document.querySelector('h1.entry-title');
      const title = h1
        ? h1.textContent.replace(/\[.*?\]/g, '').trim()
        : '未知日版名稱';

      // 美品 / PSA10 價格（第一列）
      const rows = document.querySelectorAll('#price-table-body tr');
      let mintRaw = null, psa10Raw = null;
      if (rows.length > 0) {
        const cells = rows[0].querySelectorAll('td');
        mintRaw  = cells[0] ? cells[0].textContent.trim() : null;
        psa10Raw = cells[1] ? cells[1].textContent.trim() : null;
      }
      return { title, mintRaw, psa10Raw };
    });

    // 解析 "36,499円" → 36499
    const parseJpy = (str) => {
      if (!str) return null;
      const n = parseInt(str.replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? null : n;
    };

    const mintJpy  = parseJpy(data.mintRaw);
    const psa10Jpy = parseJpy(data.psa10Raw);

    const toTwd = (jpy) =>
      jpy != null ? Math.round(jpy * jpyToTwd * 10) / 10 : null;

    return {
      title:  data.title,
      url,
      mint:  { jpy: mintJpy,  twd: toTwd(mintJpy) },
      psa10: { jpy: psa10Jpy, twd: toTwd(psa10Jpy) },
    };
  } finally {
    await browser.close();
  }
}

module.exports = { fetchJpPrice };
