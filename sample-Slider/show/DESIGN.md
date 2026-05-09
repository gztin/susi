# DESIGN: QR 數位名片系統

## 01 Typography
- **Headings**: "Outfit", sans-serif. 粗體，大字級，具有強烈辨識度。
- **Body**: "Inter", sans-serif. 清晰易讀，適合展示聯絡資訊。
- **Monospace**: "JetBrains Mono" 或系統預設。用於顯示 4 碼序號，強調科技感。

## 02 Color
- **Primary**: `#00D1FF` (Electric Blue). 用於主要按鈕與強調色。
- **Background**: `#0A0A0B` (Deep Charcoal). 極深灰色，比純黑更有質感。
- **Surface**: `rgba(255, 255, 255, 0.05)`. 用於磨砂玻璃效果的容器背景。
- **Text**: `#F8F9FA` (High Contrast White).

## 03 Elevation & Spatial
- **Grid**: 採用 8px 網格系統。
- **Radius**: 大圓角 (16px - 24px)，符合現代行動裝置審美。
- **Glassmorphism**: 容器使用 `backdrop-filter: blur(12px)` 與極細的白色邊框 (1px, 0.1 alpha)。

## 04 Motion
- **Entry**: 元素進入時使用平滑的 `fade-in-up` 動畫。
- **Hover/Touch**: 縮放 (1.02x) 與陰影增強反饋。
- **Scan Effect**: 掃描時出現橫向掃過的光束動畫。

## 05 Components
- **Identity Card**: 懸浮感的磨砂卡片，包含頭像與基本資料。
- **Dynamic QR**: 居中顯示的 QR Code，邊緣帶有呼吸感的發光效果。
- **Friend Row**: 簡約的列表列，左側頭像，右側操作按鈕。

## 06 Interactions
- **One-Tap Scan**: 底部固定位置的圓形掃描按鈕。
- **Edit in Place**: 直接點擊個人資料欄位即可編輯。
