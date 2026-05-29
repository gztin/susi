#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
BRIDGE_HOST="${BRIDGE_HOST:-127.0.0.1}"
BRIDGE_PORT="${BRIDGE_PORT:-5680}"
BRIDGE_PID_FILE="${BRIDGE_PID_FILE:-/tmp/pikomin-host-bridge.pid}"
BRIDGE_LOG_FILE="${BRIDGE_LOG_FILE:-/tmp/pikomin-host-bridge.log}"
BRIDGE_SCREEN_NAME="${BRIDGE_SCREEN_NAME:-pikomin-host-bridge}"

bridge_url="http://${BRIDGE_HOST}:${BRIDGE_PORT}/docs"

is_bridge_healthy() {
  curl -fsS "${bridge_url}" >/dev/null 2>&1
}

is_screen_running() {
  local screen_name="$1"
  local output
  output="$(screen -list 2>/dev/null || true)"
  grep -q "${screen_name}" <<<"${output}"
}

cleanup_stale_pid() {
  if [[ -f "${BRIDGE_PID_FILE}" ]]; then
    local pid
    pid="$(cat "${BRIDGE_PID_FILE}")"
    if [[ "${pid}" == screen:* ]]; then
      local screen_name="${pid#screen:}"
      if is_screen_running "${screen_name}"; then
        return
      fi
      rm -f "${BRIDGE_PID_FILE}"
      return
    fi
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      return
    fi
    rm -f "${BRIDGE_PID_FILE}"
  fi
}

start_bridge() {
  cleanup_stale_pid

  if is_bridge_healthy; then
    echo "Host bridge already running: ${bridge_url}"
    return
  fi

  echo "Starting host bridge on ${BRIDGE_HOST}:${BRIDGE_PORT}..."
  if command -v screen >/dev/null 2>&1; then
    screen -S "${BRIDGE_SCREEN_NAME}" -X quit >/dev/null 2>&1 || true
    (
      cd "${PROJECT_DIR}"
      screen -dmS "${BRIDGE_SCREEN_NAME}" "${PYTHON_BIN}" -m uvicorn scripts.host_location_bridge:app --host "${BRIDGE_HOST}" --port "${BRIDGE_PORT}"
    )
    echo "screen:${BRIDGE_SCREEN_NAME}" > "${BRIDGE_PID_FILE}"
  else
    (
      cd "${PROJECT_DIR}"
      nohup "${PYTHON_BIN}" -m uvicorn scripts.host_location_bridge:app --host "${BRIDGE_HOST}" --port "${BRIDGE_PORT}"
    ) >"${BRIDGE_LOG_FILE}" 2>&1 &
    local pid=$!
    echo "${pid}" > "${BRIDGE_PID_FILE}"
  fi

  for _ in $(seq 1 20); do
    if is_bridge_healthy; then
      echo "Host bridge ready: ${bridge_url}"
      return
    fi
    if [[ -f "${BRIDGE_PID_FILE}" ]] && [[ "$(cat "${BRIDGE_PID_FILE}")" == screen:* ]]; then
      local screen_name
      screen_name="$(cat "${BRIDGE_PID_FILE}")"
      screen_name="${screen_name#screen:}"
      if ! is_screen_running "${screen_name}"; then
        echo "Host bridge exited early. Check log: ${BRIDGE_LOG_FILE}"
        tail -n 120 "${BRIDGE_LOG_FILE}" || true
        exit 1
      fi
    elif ! kill -0 "${pid}" 2>/dev/null; then
      echo "Host bridge exited early. Check log: ${BRIDGE_LOG_FILE}"
      tail -n 120 "${BRIDGE_LOG_FILE}" || true
      exit 1
    fi
    sleep 1
  done

  echo "Host bridge did not become ready in time. Check log: ${BRIDGE_LOG_FILE}"
  exit 1
}

stop_bridge() {
  cleanup_stale_pid
  if [[ ! -f "${BRIDGE_PID_FILE}" ]]; then
    echo "Host bridge is not managed by this script."
    return
  fi

  local pid
  pid="$(cat "${BRIDGE_PID_FILE}")"
  if [[ "${pid}" == screen:* ]]; then
    local screen_name="${pid#screen:}"
    echo "Stopping host bridge screen session (${screen_name})..."
    screen -S "${screen_name}" -X quit >/dev/null 2>&1 || true
    rm -f "${BRIDGE_PID_FILE}"
    return
  fi
  if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
    echo "Stopping host bridge (pid=${pid})..."
    kill "${pid}" 2>/dev/null || true
  fi
  rm -f "${BRIDGE_PID_FILE}"
}

show_status() {
  if is_bridge_healthy; then
    echo "Host bridge: running (${bridge_url})"
  else
    echo "Host bridge: stopped"
  fi
  (
    cd "${PROJECT_DIR}"
    docker compose ps
  )
}

show_logs() {
  echo "== Host bridge log =="
  tail -n 80 "${BRIDGE_LOG_FILE}" 2>/dev/null || echo "(no host bridge log yet)"
  echo ""
  echo "== Docker compose logs =="
  (
    cd "${PROJECT_DIR}"
    docker compose logs --tail=80
  )
}

command="${1:-up}"
shift || true

case "${command}" in
  up)
    start_bridge
    (
      cd "${PROJECT_DIR}"
      docker compose up -d "$@"
    )
    ;;
  down)
    (
      cd "${PROJECT_DIR}"
      docker compose down "$@"
    )
    stop_bridge
    ;;
  restart)
    stop_bridge
    start_bridge
    (
      cd "${PROJECT_DIR}"
      docker compose up -d --force-recreate "$@"
    )
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  *)
    echo "Usage: $0 {up|down|restart|status|logs} [docker-compose-args...]"
    exit 1
    ;;
esac
