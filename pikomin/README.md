# iOS GPS 模擬器

在電腦上透過網頁介面，即時控制 iPhone 的 GPS 位置。支援單點傳送與路徑自動行走。

---

## 安裝需求

| 項目 | 版本 |
|------|------|
| Python | 3.11+ |
| Node.js | 18+ |
| pymobiledevice3 | 4.14+ |

安裝 pymobiledevice3：

```bash
pip install pymobiledevice3
```

---

## iPhone 設定

1. 前往「設定 → 隱私權與安全性 → 開發者模式」，開啟開發者模式
2. 重新啟動 iPhone 並確認開啟
3. 透過 USB 連接 iPhone 到電腦，點選「信任此電腦」

---

## 啟動方式

### 方式一：單一終端機啟動（推薦）

```bash
chmod +x start.sh
./start.sh
```

`start.sh` 會在同一個終端機自動完成：
1. 啟動 RSD tunnel（可能要求輸入 sudo 密碼）
2. 從 tunnel 輸出擷取 `RSD_ADDRESS/RSD_PORT`
3. 啟動 backend（5679）與 frontend（5678）

按 `Ctrl+C` 會一次停止全部服務，並保留 tunnel/backend/frontend 的 log 檔路徑。

### 方式二：手動啟動（除錯用）

```bash
# 後端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 前端（另開終端機）
cd frontend
npm install
npm run dev
```

開啟瀏覽器前往 http://localhost:3000

---

## 使用說明

### 單點模式

在地圖上點擊任意位置，iPhone 的 GPS 會立即跳至該座標。

### 路徑模式

1. 切換至「路徑」頁籤
2. 在地圖上依序點擊多個路徑點
3. 設定移動速度（公尺/秒）
4. 點擊「開始」，iPhone 會沿路徑自動移動
5. 點擊「停止」可隨時中斷

### 停止模擬

點擊「停止模擬」按鈕，iPhone 恢復顯示真實 GPS 位置。

---

## 常見問題

**Q：出現 "RSD tunnel not available" 錯誤**
請確認已執行 `sudo pymobiledevice3 lockdown start-tunnel` 並正確設定 `RSD_ADDRESS` / `RSD_PORT`。

**Q：iPhone 未被偵測到**
確認 USB 連接正常、已點選「信任此電腦」，並已開啟開發者模式。

**Q：開發測試不想連接實體裝置**
設定環境變數 `MOCK_MODE=true` 啟動後端，系統會使用虛擬裝置回應所有操作。
