#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3.13}"
PORT="${PIKMIN_LITE_PORT:-5688}"
FRONTEND_URL="http://127.0.0.1:${PORT}"
TUNNELD_URL="${TUNNELD_URL:-http://127.0.0.1:49151}"
BACKEND_LOG="$(mktemp -t pikmin-lite-backend.XXXXXX.log)"
TUNNEL_LOG="$(mktemp -t pikmin-lite-tunnel.XXXXXX.log)"
BACKEND_PID=""
TUNNEL_PID=""

cleanup() {
  local code=$?
  trap - EXIT INT TERM
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$TUNNEL_PID" ]] && kill -0 "$TUNNEL_PID" 2>/dev/null; then
    sudo kill "$TUNNEL_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  if [[ $code -ne 0 && $code -ne 130 && $code -ne 143 ]]; then
    echo "Pikmin Lite 已停止，請檢查記錄："
    echo "  服務：$BACKEND_LOG"
    echo "  Tunnel：$TUNNEL_LOG"
  fi
  exit "$code"
}
trap cleanup EXIT INT TERM

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "找不到 $PYTHON_BIN，請先安裝 Python 3.13。"
  exit 1
fi

PYTHON_VERSION="$("$PYTHON_BIN" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
if [[ "$PYTHON_VERSION" != "3.13" ]]; then
  echo "Pikmin Lite 需要 Python 3.13，目前是 $PYTHON_VERSION。"
  exit 1
fi

if ! "$PYTHON_BIN" -c 'import fastapi, httpx, pymobiledevice3, uvicorn' >/dev/null 2>&1; then
  echo "缺少必要的 Python 套件，請執行："
  echo "  $PYTHON_BIN -m pip install -r $PROJECT_DIR/requirements.txt"
  exit 1
fi

if [[ ! -f "$PROJECT_DIR/web/index.html" ]]; then
  echo "找不到編譯後網頁：$PROJECT_DIR/web/index.html"
  exit 1
fi

if [[ -n "${PMD3:-}" ]]; then
  PMD3_BIN="$PMD3"
elif command -v pyenv >/dev/null 2>&1; then
  PMD3_BIN="$(pyenv which pymobiledevice3 2>/dev/null || true)"
else
  PMD3_BIN="$(command -v pymobiledevice3 || true)"
fi
if [[ "${PIKMIN_LITE_SKIP_TUNNEL:-0}" == "1" ]]; then
  echo "略過自動啟動 tunneld。"
elif curl -fsS "$TUNNELD_URL" >/dev/null 2>&1; then
  echo "沿用目前執行中的 tunneld。"
else
  if [[ -z "$PMD3_BIN" ]]; then
    echo "找不到 pymobiledevice3 指令。"
    exit 1
  fi
  echo "啟動 iPhone tunnel，macOS 可能要求管理者密碼。"
  sudo -v
  sudo "$PMD3_BIN" remote tunneld --protocol tcp >"$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!

  for _ in $(seq 1 25); do
    if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
      echo "tunneld 啟動失敗：$TUNNEL_LOG"
      exit 1
    fi
    if curl -fsS "$TUNNELD_URL" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! curl -fsS "$TUNNELD_URL" >/dev/null 2>&1; then
    echo "無法連線到 tunneld：$TUNNELD_URL"
    exit 1
  fi
fi

echo "啟動 Pikmin Lite：$FRONTEND_URL"
(
  cd "$PROJECT_DIR"
  PYTHONDONTWRITEBYTECODE=1 \
  FRONTEND_DIST_DIR="$PROJECT_DIR/web" \
  PMD3_PATH="$PMD3_BIN" \
  "$PYTHON_BIN" -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT"
) >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

for _ in $(seq 1 30); do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Pikmin Lite 啟動失敗：$BACKEND_LOG"
    exit 1
  fi
  if curl -fsS "$FRONTEND_URL/api/tunnel/status" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS "$FRONTEND_URL/api/tunnel/status" >/dev/null 2>&1; then
  echo "Pikmin Lite 未能在指定時間內啟動：$BACKEND_LOG"
  exit 1
fi

echo "Pikmin Lite 已啟動：$FRONTEND_URL"
echo "按 Control+C 可停止服務。"
if [[ "${PIKMIN_LITE_NO_BROWSER:-0}" != "1" ]] && command -v open >/dev/null 2>&1; then
  open "$FRONTEND_URL"
fi

wait "$BACKEND_PID"
