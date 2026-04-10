# 改版記錄

## 2026-04-10

### 新增功能

**日版行情抓取**
- 使用 puppeteer-core 渲染 grading.pokeca-chart.com，動態抓取美品價格與 PSA10 價格
- 支援日幣顯示，並自動換算台幣（小數點後一位四捨五入）

**即時匯率**
- 串接 exchangerate-api.com，以 USD 為基準取得 JPY / TWD 匯率
- 每天早上 8 點自動更新，啟動時若無快取則立即抓取一次
- 新增 `GET /api/rates` 端點供前端查詢目前匯率

**系列靜態資料 JSON（sets.json）**
- 建立 `frontend/sets.json`，收錄 46 個系列的英文、日文、中文名稱及發售日期
- 前端啟動時優先讀取 JSON，不再每次打 API 取系列名稱
- 語言切換按鈕（🌐）可在中文 / EN / 日本語 三種顯示模式間循環切換

**中文搜尋支援**
- 新增 `ZH_TO_EN_NAME` 對照表，輸入中文名稱（如「超夢 ex」）自動轉換為英文再送出查詢

**稀有度標籤**
- 新增 `RARITY_MAP` 與 `translateRarity`，卡片列表顯示縮寫稀有度標籤（C / U / R / RR / SAR 等），並套用對應顏色

### 後端架構調整

- `backend/db.js`：新增 `exchange_rates` 資料表儲存匯率快取
- `backend/price_scraper.js`：改用 puppeteer-core 取代舊版 regex 抓取，支援動態渲染頁面
- `backend/server.js`：新增匯率相關路由與 cron job
- `backend/Dockerfile`：改用 `node:20-slim` + 安裝 Chromium，支援 puppeteer 在 Docker 內執行

### 文件

- 新增 `API_REFERENCE.md`：記錄所有外部 API 與後端自有 API 端點
- 新增 `CHANGELOG.md`：本文件

### 其他

- 下拉選單系列名稱改為純中文，移除括號內的英文系列名
- 前端 port 改為 1234
- `frontend/app.js` 與根目錄 `app.js` 保持同步，差異僅在 API 路徑（`/api` vs `http://localhost:3001/api`）
