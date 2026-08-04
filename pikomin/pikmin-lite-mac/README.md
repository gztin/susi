# Pikmin Lite Mac

Pikmin Lite 是不依賴 Docker 的本機版。React 網頁已編譯成靜態檔，由同一個 FastAPI 服務提供網頁、API 與 WebSocket。

## 執行需求

- macOS
- Python 3.13
- pymobiledevice3 9.x
- iPhone 已開啟開發者模式

目前電腦已具備 Python 3.13 與 pymobiledevice3，不需要重複安裝。若日後環境缺少套件，可執行：

```bash
python3.13 -m pip install -r requirements.txt
```

## 啟動

```bash
cd /Users/ggt/Documents/GitHub/susi/pikomin/pikmin-lite-mac
./start.sh
```

啟動時會檢查或啟動 `pymobiledevice3 remote tunneld`，可能要求輸入 macOS 管理者密碼。網頁預設網址為：

```text
http://127.0.0.1:5688
```

按 `Control+C` 可同時停止 Pikmin Lite 與由本次腳本啟動的 tunneld。若 tunneld 原本已經執行，腳本不會將它停止。

## 資料位置

地標、路線與明信片快取位於 `app/data/`。這些資料是從原版建立時複製的獨立副本，兩個版本後續不會自動同步。

## 測試啟動

不連接 iPhone、只測試網頁與 API 時，可執行：

```bash
PIKMIN_LITE_SKIP_TUNNEL=1 MOCK_MODE=true ./start.sh
```
