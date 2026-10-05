#!/usr/bin/env bash
# ==============================================================================
# Debo VPS Daemon Supervisor
# Manages local microservices that cannot run on edge workers (Docling, Local Daemons)
# and maintains the persistent Cloudflare Tunnel.
# Prefers systemd --user when available, falls back to direct nohup daemonization.
# ==============================================================================
set -euo pipefail

REPO_DIR="/home/kunalkashyap8024/sop/debo"
LOG_DIR="/home/kunalkashyap8024/logs/debo"
PID_DIR="/home/kunalkashyap8024/logs/debo/pids"
CLOUDFLARED="/home/kunalkashyap8024/.local/bin/cloudflared"
CF_CONFIG="/home/kunalkashyap8024/.cloudflared/debo-config.yml"
TUNNEL_ID="a5275ec6-92d6-4c67-b0cc-0cb6f767967e"
PYTHON="/home/kunalkashyap8024/.venvs/debo-docworker/bin/python"

SYSTEMD_UNITS=(
  "debo-docworker.service"
  "debo-web.service"
  "debo-worker.service"
  "debo-mcp.service"
  "debo-tunnel.service"
)

has_systemd() {
  systemctl --user status >/dev/null 2>&1
}

mkdir -p "$LOG_DIR" "$PID_DIR"

start_direct() {
  local name="$1"
  local pidfile="$PID_DIR/${name}.pid"
  local logfile="$LOG_DIR/${name}.log"
  local cmd="$2"

  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    echo "[debo] $name is already running (PID: $(cat "$pidfile"))"
    return 0
  fi

  echo "[debo] Starting $name..."
  nohup setsid bash -c "$cmd" >> "$logfile" 2>&1 &
  local new_pid=$!
  echo "$new_pid" > "$pidfile"
  echo "[debo] Started $name (PID: $new_pid) -> logs at $logfile"
}

stop_direct() {
  local name="$1"
  local pidfile="$PID_DIR/${name}.pid"
  local port="${2:-}"

  if [ -f "$pidfile" ]; then
    local pid
    pid="$(cat "$pidfile")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "[debo] Stopping $name (PID: $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$pidfile"
    echo "[debo] Stopped $name"
  fi

  if [ -n "$port" ]; then
    local port_pid
    port_pid="$(fuser "$port/tcp" 2>/dev/null || true)"
    if [ -n "$port_pid" ]; then
      echo "[debo] Clearing orphan process on port $port (PID: $port_pid)..."
      kill -9 $port_pid 2>/dev/null || true
    fi
  fi
}

start_all() {
  echo "=== Starting Debo VPS Services ==="
  if has_systemd; then
    systemctl --user start "${SYSTEMD_UNITS[@]}"
    systemctl --user status "${SYSTEMD_UNITS[@]}" --no-pager
  else
    start_direct "docworker" \
      "$PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --app-dir $REPO_DIR/apps/document-worker"
    start_direct "web" \
      "PORT=3002 WEB_PORT=3002 bun run $REPO_DIR/apps/web/src/index.ts"
    start_direct "worker" \
      "PORT=8787 bun run $REPO_DIR/apps/worker/src/index.ts"
    start_direct "mcp" \
      "PORT=8082 MCP_PORT=8082 bun run $REPO_DIR/apps/mcp/src/index.ts"
    start_direct "cloudflared" \
      "$CLOUDFLARED tunnel --protocol http2 --config $CF_CONFIG run $TUNNEL_ID"
    echo "=== All services launched ==="
  fi
}

stop_all() {
  echo "=== Stopping Debo VPS Services ==="
  if has_systemd; then
    systemctl --user stop "${SYSTEMD_UNITS[@]}"
  else
    stop_direct "cloudflared"
    stop_direct "mcp" "8082"
    stop_direct "worker" "8787"
    stop_direct "web" "3002"
    stop_direct "docworker" "8005"
  fi
  echo "=== All services stopped ==="
}

status_all() {
  echo "=== Debo Service Status ==="
  if has_systemd; then
    systemctl --user status "${SYSTEMD_UNITS[@]}" --no-pager
  else
    for name in docworker web worker mcp cloudflared; do
      local pidfile="$PID_DIR/${name}.pid"
      if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
        echo -e "[debo] \033[0;32m● RUNNING\033[0m: $name (PID: $(cat "$pidfile"))"
      else
        echo -e "[debo] \033[0;31m○ STOPPED\033[0m: $name"
      fi
    done
  fi
}

case "${1:-status}" in
  start)
    start_all
    ;;
  stop)
    stop_all
    ;;
  restart)
    stop_all
    sleep 2
    start_all
    ;;
  status)
    status_all
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
