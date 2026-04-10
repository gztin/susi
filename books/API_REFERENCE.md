# API 參考文件

## 外部 API

### 1. TCGdx API (主要資料來源)
- **用途**：卡片資料、系列資料、多語言名稱（主要資料來源）
- **Base URL**：`https://api.tcgdx.net/v2`
- **認證**：無需認證（開源免費 API）
- **多語言支援**：en, zh-TW, ja, fr, es, it, pt, de 等
- **使用端點**：
  | 端點 | 說明 |
  |------|------|
  | `GET /v2/{lang}/sets` | 取得系列列表 |
  | `GET /v2/{lang}/cards` | 搜尋卡片，支援 `name`、`set` 等參數 |
  | `GET /v2/{lang}/cards/{id}` | 取得單張卡片詳細資料（含價格）|
- **價格欄位**：
  - `pricing.tcgplayer.{normal,holofoil,reverse}.{lowPrice,midPrice,marketPrice}` — 美版 USD
  - `pricing.cardmarket.{avg,low,trend}` — 歐版 EUR

### 2. exchangerate-api.com
- **用途**：取得即時匯率（USD 為基準）
- **URL**：`https://v6.exchangerate-api.com/v6/58ba6f659ed119cfab3d522b/latest/USD`
- **更新頻率**：每天早上 8 點（cron），啟動時若無快取則立即抓一次
- **使用欄位**：`conversion_rates.JPY`、`conversion_rates.TWD`
- **換算**：`JPY→TWD = TWD / JPY`

### 3. grading.pokeca-chart.com
- **用途**：日版卡片美品價格、PSA10 價格
- **方式**：puppeteer-core 渲染動態頁面（非直接 API）
- **URL 格式**：`https://grading.pokeca-chart.com/{jpSetId}-{number}-{total}/`
- **範例**：`https://grading.pokeca-chart.com/sv2a-205-165/`（ミュウex）
- **抓取欄位**：`#price-table-body tr td[0]`（美品）、`td[1]`（PSA10）
- **需要 Chrome**：`CHROME_PATH` 環境變數或預設 `/Applications/Google Chrome.app/...`

---

## 後端自有 API（`/api/*`，port 3000/3001）

| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/api/cards` | 代理 TCGdx `/cards`，支援多語言 |
| `GET` | `/api/cards/:id` | 代理 TCGdx `/cards/:id`，支援多語言 |
| `GET` | `/api/sets` | 代理 TCGdx `/sets`，支援多語言 |
| `GET` | `/api/jp-price` | 呼叫 puppeteer scraper 抓日版價格，params: `setId`, `number`, `total` |
| `GET` | `/api/rates` | 取得目前匯率快取（USD/JPY/TWD） |
| `GET` | `/api/popular-cards` | 取得點擊次數前 10 名卡片 |
| `POST` | `/api/cards/:id/click` | 紀錄卡片點擊次數 |

---

## 日版系列對照表（JP_SET_MAP）

| 美版 setId | 日版 jpId | 總張數 | 系列名稱 |
|-----------|----------|--------|---------|
| sv3pt5 | sv2a | 165 | 寶可夢 151 |
| sv8pt5 | sv8a | 129 | 太晶慶典 |
| sv8 | sv8 | 106 | 超電激突 |
| sv7 | sv7 | 102 | 星晶奇跡 |
| sv6 | sv6 | 101 | 變幻假面 |
| sv5 | sv5k | 71 | 狂野之力 |
| sv4 | sv4k | 66 | 古代咆哮 |
| sv3 | sv3 | 108 | 黯焰支配者 |
| sv2 | sv2p | 71 | 冰雪險境 |
