# 寶可夢卡牌瀏覽器

一個基於 Web 的寶可夢卡牌瀏覽和價格查詢系統，支援美版、歐版和日版價格查詢。

## 功能特色

- 🔍 **智能搜尋**: 支援中文名稱自動轉換英文搜尋
- 🌐 **多語言**: 中文/英文/日文介面切換
- 💰 **多市場價格**: 美版 TCGPlayer、歐版 Cardmarket、日版 Pokeca Chart
- 📊 **即時匯率**: 自動更新 JPY→TWD 匯率
- 🔥 **熱門追蹤**: 記錄卡片點擊次數，顯示熱門卡片
- 📱 **響應式設計**: 支援桌面和行動裝置

## 快速開始

### 使用 Docker (推薦)

```bash
# 啟動服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

服務啟動後：
- 前端: http://localhost:1234
- 後端 API: http://localhost:3001

### 手動啟動

#### 後端
```bash
cd backend
npm install
npm start
```

#### 前端
```bash
cd frontend
# 使用任何靜態檔案伺服器，例如:
python -m http.server 8080
# 或
npx serve .
```

## API 端點

### 卡片相關
- `GET /api/cards` - 搜尋卡片
- `GET /api/cards/:id` - 取得單張卡片詳細資料
- `GET /api/sets` - 取得系列列表
- `POST /api/cards/:id/click` - 記錄卡片點擊

### 價格相關
- `GET /api/price/:ptcgId` - 從資料庫取得價格快取
- `GET /api/jp-price` - 即時抓取日版價格 (Puppeteer)
- `GET /api/rates` - 取得目前匯率

### 管理功能
- `POST /api/admin/sync-set` - 手動同步系列價格
- `GET /api/admin/sync-status` - 查看同步狀態
- `GET /api/popular-cards` - 取得熱門卡片

## 系統架構

```
Frontend (Nginx) → Backend (Express.js) → External APIs
                                      ↓
                                   SQLite DB
```

### 外部 API
- **TCGdx**: 卡片基本資料和多語言名稱（主要資料來源）
- **exchangerate-api.com**: 即時匯率
- **grading.pokeca-chart.com**: 日版價格 (Puppeteer 爬蟲)

## 資料同步

系統會自動執行以下排程：
- **每天 08:00**: 更新匯率
- **每天 02:00**: 更新最近 5 個系列的價格

手動同步：
```bash
# 同步特定系列
curl -X POST http://localhost:3001/api/admin/sync-set \
  -H "Content-Type: application/json" \
  -d '{"setId": "sv3pt5"}'
```

## 環境變數

```bash
# 可選
DB_PATH=/path/to/database.db
CHROME_PATH=/path/to/chrome
```

## 開發

### 測試 API
```bash
node test-api.js
```

### 資料庫結構
- `price_cache`: 價格快取
- `sync_log`: 同步記錄
- `card_stats`: 卡片點擊統計
- `exchange_rates`: 匯率快取

## 注意事項

1. **日版價格抓取**: 需要 Chrome/Chromium 瀏覽器
2. **API 限制**: 請遵守各 API 服務的使用限制
3. **資料更新**: 首次啟動需要時間建立快取

## 故障排除

### 常見問題

**Q: 日版價格無法顯示**
A: 檢查 Chrome 路徑設定和網路連線

**Q: API 回應 404**
A: 確認後端服務正常運行，檢查 nginx 代理設定

**Q: 搜尋無結果**
A: 嘗試使用英文名稱，或檢查 API Key 是否有效

### 日誌查看
```bash
# Docker 環境
docker-compose logs backend
docker-compose logs frontend

# 手動啟動
# 後端日誌會直接顯示在終端
```

## 授權

本專案僅供學習和個人使用。請遵守相關 API 服務的使用條款。