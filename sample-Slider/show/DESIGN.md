# DESIGN: QR 數位名片系統

## 01 Typography
- **Headings**: "Outfit", sans-serif. 粗體，大字級，具有強烈辨識度。
- **Body**: "Inter", sans-serif. 清晰易讀，適合展示聯絡資訊。
- **Monospace**: "JetBrains Mono" 或系統預設。用於顯示 4 碼序號，強調科技感。

## 02 Color
- **Primary**: `#007AFF` (Vibrant Blue). 在淺色背景下提供更好的可讀性。
- **Background**: `#F9FAFB` (Soft White). 帶有極微量暖色的白色，減少視覺疲勞。
- **Surface**: `rgba(255, 255, 255, 0.7)`. 用於磨砂玻璃效果，底色較淺。
- **Text**: `#111827` (Deep Charcoal). 高對比度文字色。
- **Text-Muted**: `#6B7280`. 用於輔助資訊。

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
