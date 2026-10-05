#!/usr/bin/env bash
# ==============================================================================
# Debo VPS Daemon Supervisor
# Manages local microservices that cannot run on edge workers (Docling, Local Daemons)
# and maintains the persistent Cloudflare Tunnel.
# ==============================================================================
set -euo pipefail

REPO_DIR="/home/kunalkashyap8024/sop/debo"
LOG_DIR="/home/kunalkashyap8024/logs/debo"
PID_DIR="/home/kunalkashyap8024/logs/debo/pids"
CLOUDFLARED="/home/kunalkashyap8024/.local/bin/cloudflared"
CF_CONFIG="/home/kunalkashyap8024/.cloudflared/config.yml"
TUNNEL_ID="a5275ec6-92d6-4c67-b0cc-0cb6f767967e"
PYTHON="/home/kunalkashyap8024/.venvs/debo-docworker/bin/python"

mkdir -p "$LOG_DIR" "$PID_DIR"

start_service() {
  local name="$1"
  local pidfile="$PID_DIR/${name}.pid"
  local logfile="$LOG_DIR/${name}.log"
  local cmd="$2"

  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    echo "[debo] $name is already running (PID: $(cat "$pidfile"))"
    return 0
  fi

  echo "[debo] Starting $name..."
  nohup bash -c "$cmd" >> "$logfile" 2>&1 &
  local new_pid=$!
  echo "$new_pid" > "$pidfile"
  echo "[debo] Started $name (PID: $new_pid) -> logs at $logfile"
}

stop_service() {
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

status_service() {
  local name="$1"
  local pidfile="$PID_DIR/${name}.pid"
  local port="$2"

  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    local pid
    pid="$(cat "$pidfile")"
    echo -e "[debo] \033[0;32m● RUNNING\033[0m: $name (PID: $pid, Port: $port)"
  else
    echo -e "[debo] \033[0;31m○ STOPPED\033[0m: $name (Port: $port)"
  fi
}

start_all() {
  echo "=== Starting Debo VPS Services ==="

  # 1. Document Worker (Python Docling + FastAPI, Port 8005)
  start_service "docworker" \
    "$PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --app-dir $REPO_DIR/apps/document-worker"

  # 2. Debo Web (Bun App, Port 3002)
  start_service "web" \
    "PORT=3002 WEB_PORT=3002 bun run $REPO_DIR/apps/web/src/index.ts"

  # 3. Debo Workflow Worker (Bun Worker, Port 8787)
  start_service "worker" \
    "PORT=8787 bun run $REPO_DIR/apps/worker/src/index.ts"

  # 4. Debo MCP Server (Bun MCP, Port 8082)
  start_service "mcp" \
    "PORT=8082 MCP_PORT=8082 bun run $REPO_DIR/apps/mcp/src/index.ts"

  # 5. Cloudflare Tunnel (Tunnel a5275ec6-92d6-4c67-b0cc-0cb6f767967e)
  start_service "cloudflared" \
    "$CLOUDFLARED tunnel --protocol http2 --config $CF_CONFIG run $TUNNEL_ID"

  echo "=== All services launched ==="
  sleep 2
  status_all
}

stop_all() {
  echo "=== Stopping Debo VPS Services ==="
  stop_service "cloudflared"
  stop_service "mcp" "8082"
  stop_service "worker" "8787"
  stop_service "web" "3002"
  stop_service "docworker" "8005"
  echo "=== All services stopped ==="
}

status_all() {
  echo "=== Debo Service Status ==="
  status_service "docworker" "8005"
  status_service "web" "3002"
  status_service "worker" "8787"
  status_service "mcp" "8082"
  status_service "cloudflared" "Argo Tunnel $TUNNEL_ID"
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
