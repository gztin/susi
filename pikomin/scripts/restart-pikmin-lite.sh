#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/ggt/Documents/GitHub/susi/pikomin/pikmin-lite-mac"
PORT="${PIKMIN_LITE_PORT:-5688}"
SCREEN_NAME="${PIKMIN_LITE_SCREEN_NAME:-pikmin-lite}"
PYTHON_BIN="${PYTHON_BIN:-/Users/ggt/.pyenv/versions/3.13.13/bin/python}"
PMD3_BIN="${PMD3_PATH:-/Users/ggt/.pyenv/versions/3.13.13/bin/pymobiledevice3}"
LOG_FILE="${PIKMIN_LITE_RESTART_LOG:-/tmp/pikmin-lite-restart.log}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$*" >> "$LOG_FILE"
}

log "Restart requested"

screen -S "$SCREEN_NAME" -X quit >/dev/null 2>&1 || true

while IFS= read -r pid; do
  if [[ -n "$pid" ]]; then
    log "Stopping process on port ${PORT}: ${pid}"
    kill "$pid" >/dev/null 2>&1 || true
  fi
done < <(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)

sleep 1

cd "$PROJECT_DIR"
screen -dmS "$SCREEN_NAME" \
  /usr/bin/env \
  PYTHONDONTWRITEBYTECODE=1 \
  FRONTEND_DIST_DIR="$PROJECT_DIR/web" \
  PMD3_PATH="$PMD3_BIN" \
  "$PYTHON_BIN" -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT"

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/tunnel/status" >/dev/null 2>&1; then
    log "Pikmin Lite restarted on http://127.0.0.1:${PORT}"
    exit 0
  fi
  sleep 1
done

log "Pikmin Lite did not become ready on http://127.0.0.1:${PORT}"
exit 1
