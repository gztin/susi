---
name: page-editor-rules
description: 網頁編輯器的頁面規範與元件規則。當用戶在操作或修改這個編輯器時使用此 skill，確保所有改動符合既定規範。
inclusion: auto
---

# 網頁編輯器規範

## 頁面結構規則

### 主標題（必填，唯一）
- 每個頁面**必須有且只有一個**主標題
- 主標題**預設存在**，頁面載入時自動加入，不需要用戶手動新增
- 主標題**固定在最上方**，不可被拖曳移動到其他位置
- 其他元件不可拖曳到主標題之前
- 重置編輯器後，主標題必須**自動重新加入**
- 右側元件面板的主標題按鈕保持 disabled 狀態（因為已預設存在）

### 元件順序
- 主標題永遠在第一位
- 其他元件（副標題、內文、圖片、圖片群組、檔案下載、折文、表格）可自由拖曳排序

---

## 元件清單

| 元件 | HTML 結構 | 說明 |
|------|-----------|------|
| 主標題 | `<h5 class="tit"><span>文字</span></h5>` | 唯一，預設存在 |
| 副標題 | `<div class="subT">文字</div>` | 可多個 |
| 內文 | `<p>文字</p>`（CKEditor 輸出） | 富文字編輯 |
| 圖片 | `<img>` | 單張，寬度 740px |
| 圖片群組 | `<div class="img-group-grid">` | 2 或 3 欄並排 |
| 檔案下載 | `<table class="file-table">` | 含下載連結 |
| 折文 | `<details><summary>` | 折疊展開 |
| 表格 | `<table class="environmental">` | 可新增/刪除列 |

---

## CSS 規範

### 主標題
```css
h5.tit {
  font-size: 20px;
  margin: 0 0 20px;
  color: #bb9157;
  border-left: 4px solid #bb9157;
  padding-left: 10px;
}
```

### 表格（environmental）
```css
table.environmental {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #eaeaea;
}
table.environmental th {
  background: #f7f7f5;
  border-bottom: 2px solid #c8a96e;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
}
table.environmental td {
  border-bottom: 1px solid #e8e8e0;
  padding: 12px 16px;
  vertical-align: middle;
}
```

### 檔案下載表格
```css
table.file-table {
  /* 同 environmental 樣式 */
}
```

---

## 預覽頁面規範

- 預覽內容包在 `<div class="inner_box">` 內
- `inner_box` 寬度 780px，白底，淺灰框線
- 預覽時移除所有編輯器 UI（移除按鈕、操作控制列、input 欄位）
- 圖片寬度 740px
- 清單（ul/ol）`padding-left: 1.5em`

---

## 防呆規則

發佈或預覽前需驗證：
- 所有 contenteditable 欄位不可為空
- CKEditor 內文不可為空
- 圖片元件必須已上傳圖片
