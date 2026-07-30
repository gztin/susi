---
name: yunata_style
description: Yunata 網頁編輯器的樣式規範。包含所有元件的 CSS 標準值，修改任何樣式前必須參考此文件。
inclusion: auto
---

# Yunata 樣式規範

## 字體

- 主字體：`'Noto Sans TC', 'Microsoft JhengHei', sans-serif`
- 標題字體：`'Noto Serif TC', serif`
- 內文預設字體大小：`14px`
- 內文行高：`1.8`
- 內文文字顏色：`#4c4c4c`

---

## 主標題 `h5.tit`

```css
h5.tit {
  font-size: 20px;
  margin: 0 0 20px;
  color: #bb9157;
  border-left: 4px solid #bb9157;
  padding-left: 10px;
  font-family: 'Noto Serif TC', serif;
  font-weight: 500;
  letter-spacing: 0.04em;
}
```

---

## 表格 `table.environmental`

```css
table.environmental {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid oklch(88% 0.025 80);
}
table.environmental th {
  background: #f8f8f8;
  border-bottom: 2px solid #c8a96e;
  border-top: 1px solid oklch(88% 0.03 80);
  border-right: 1px solid oklch(88% 0.025 80);
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #4c4c4c;
  font-family: 'Noto Serif TC', serif;
  letter-spacing: 0.03em;
}
table.environmental td {
  border-bottom: 1px solid oklch(90% 0.02 80);
  border-right: 1px solid oklch(88% 0.025 80);
  padding: 12px 16px;
  vertical-align: middle;
  color: oklch(35% 0.02 80);
}
table.environmental th:last-child,
table.environmental td:last-child { border-right: none; }
table.environmental tr:last-child td { border-bottom: none; }
```

---

## 檔案下載表格 `table.file-table`

```css
table.file-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid oklch(88% 0.025 80);
}
table.file-table th {
  background: #f8f8f8;
  border-bottom: 2px solid #c8a96e;
  border-top: 1px solid oklch(88% 0.03 80);
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #4c4c4c;
  font-family: 'Noto Serif TC', serif;
  letter-spacing: 0.03em;
}
table.file-table td {
  border-bottom: 1px solid oklch(90% 0.02 80);
  padding: 12px 16px;
  vertical-align: middle;
  color: oklch(35% 0.02 80);
}
table.file-table tr:last-child td { border-bottom: none; }
```

- 下載按鈕圖示：`img/icon_downLoad.png`，寬高 20px

---

## 色彩系統

| 用途 | 色值 |
|------|------|
| 主標題色 | `#bb9157` |
| 表格 th 背景 | `#f8f8f8` |
| 表格 th 文字 | `#4c4c4c` |
| 表格金色底線 | `#c8a96e` |
| 表格框線 | `oklch(88% 0.025 80)` |
| 內文文字 | `#4c4c4c` |
| 頁面背景 | `oklch(93% 0.02 80)` |
| 編輯區背景 | `oklch(99% 0.005 80)` |
