#!/bin/bash

PROJECT_DIR="/Users/ggt/Documents/GitHub/susi/pikomin"
PMD3="/Users/ggt/Library/Python/3.9/bin/pymobiledevice3"

echo "🚀 啟動 iOS GPS 模擬器..."

# 開新 Terminal 視窗執行 RSD Tunnel
osascript <<EOF
tell application "Terminal"
    do script "sudo $PMD3 lockdown start-tunnel"
    activate
end tell
EOF

sleep 1

# 開新 Terminal 視窗執行後端
osascript <<EOF
tell application "Terminal"
    do script "cd $PROJECT_DIR/backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5679"
end tell
EOF

sleep 1

# 開新 Terminal 視窗執行前端
osascript <<EOF
tell application "Terminal"
    do script "cd $PROJECT_DIR/frontend && npm run dev"
end tell
EOF

echo ""
echo "✅ 三個服務已啟動"
echo "📌 請在 RSD Tunnel 視窗輸入密碼"
echo "🌐 瀏覽器開啟：http://localhost:5678"
echo ""
open "http://localhost:5678"
