# iOS GPS 模擬器 — 啟動指令

## 每次使用前的步驟

### 步驟 1：啟動 RSD Tunnel（需要 sudo）

開一個終端機視窗，執行以下指令並輸入密碼：

```bash
sudo /Users/ggt/Library/Python/3.9/bin/pymobiledevice3 lockdown start-tunnel
```

成功後會顯示：
```
RSD Address: fd60:90c7:8df9::1
RSD Port: 56177
```

**保持這個視窗開著，不要關閉。**

---

### 步驟 2：啟動後端

開第二個終端機視窗：

```bash
cd /Users/ggt/Documents/GitHub/susi/pikomin/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5679
```

看到 `Uvicorn running on http://0.0.0.0:5679` 代表啟動成功。

---

### 步驟 3：啟動前端

開第三個終端機視窗：

```bash
cd /Users/ggt/Documents/GitHub/susi/pikomin/frontend
npm run dev
```

看到 `Local: http://localhost:5678` 代表啟動成功。

---

### 步驟 4：設定 RSD

開瀏覽器前往 `http://localhost:5678`

在左側面板的「RSD Tunnel」輸入框，貼上步驟 1 取得的 address 和 port（格式：`address port`，例如 `fd60:90c7:8df9::1 56177`），按「設定」按鈕。

---

## 停止服務

各終端機按 `Ctrl+C` 停止對應服務。

---

## 常用指令

### 手動測試 GPS 設定
```bash
curl -s -X POST http://localhost:5679/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 25.033, "longitude": 121.565, "device_id": "你的裝置ID"}'
```

### 查詢目前狀態
```bash
curl -s http://localhost:5679/api/status
```

### 查詢連線裝置
```bash
curl -s http://localhost:5679/api/devices
```

### 強制停止路徑
```bash
curl -s -X POST http://localhost:5679/api/route/stop
```

### 手動設定 RSD
```bash
curl -s -X POST http://localhost:5679/api/rsd \
  -H "Content-Type: application/json" \
  -d '{"device_id": "你的裝置ID", "address": "RSD_ADDRESS", "port": RSD_PORT}'
```

---

## 裝置 ID

你的 iPhone 裝置 ID：`00008130-000450A01EC0001C`

---

## Tunnel 斷線處理

如果 tunnel 顯示 `tunnel was closed`，重新執行步驟 1，取得新的 address 和 port 後，在網頁重新設定 RSD。
