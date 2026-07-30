# Changelog

## v2.0.0 - 2026-03-27

### 新增
- 圖片群組元件：支援 2 欄 / 3 欄並排上傳，可新增或移除圖片格
- 右側元件面板改為 `position: fixed` 浮動，隨頁面滾動保持可見
- CKEditor 加入 h5、h6 格式選項
- CKEditor 內文預設字體 14px、行高 1.8、文字色 #4c4c4c
- 建立 `.kiro/skills/yunata_style.md` 樣式規範文件
- 建立 `.kiro/skills/page-editor-rules.md` 頁面規範文件

### 修改
- 整體視覺風格改為 luxury/refined 調性，引入 Noto Serif TC + Noto Sans TC
- 背景色改為暖米色 `oklch(93% 0.02 80)`，移除原本藍色背景
- 所有按鈕改為透明底 + 細邊框，hover 才填色
- 移除所有圓角，改用直角邊框
- 主標題樣式：`h5.tit`，金色左邊線，右側延伸淡色橫線
- 表格（environmental / file-table）th 背景 `#f8f8f8`、文字色 `#4c4c4c`、框線 `#e0d9ce`
- 表格 tr hover 時 td 文字變金色 `#c8a96e`
- 檔案下載表格加上完整框線
- 下載按鈕改為 `img/icon_downLoad.png` 圖示
- 預覽頁面包在 `inner_box`（780px，淺灰框線）
- 清單 `ul/ol` 加上 `padding-left: 1.5em` 修正縮排
- 重置編輯器後自動重新加入主標題
- 右側面板移出 `editor-wrapper`，改為固定浮動

---

## v1.2.0 - 2026-03-27

### 修改
- CKEditor 從 4.22.1 full 升級至 4.25.1-lts standard，修正安全性警告並精簡工具列

---

## v1.1.0 - 2026-03-27

### 新增
- 整合 CKEditor 4 至內文區塊，支援富文字編輯工具列
- 預覽頁面時正確輸出 CKEditor 的 HTML 內容

### 修改
- 內文區塊由 `contenteditable div` 改為 CKEditor textarea 初始化
- 拖曳排序時自動儲存並重建所有 CKEditor instance
- 移除區塊時同步銷毀對應 CKEditor instance

---

## v1.0.0 - 2026-03-27

### 新增
- 左側編輯區，支援拖曳排序虛線區塊
- 右側元件面板，包含：標題、副標題、內文、圖片、檔案下載
- 每個區塊右上角關閉按鈕可移除
- 上方工具列快速加入各類區塊
- 圖片區塊支援本地檔案選擇與預覽
- 折文區塊（`<details>` 折疊效果）
- 底部重置、預覽頁面、發佈上架按鈕
