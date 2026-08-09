#!/usr/bin/env bash
# =============================================================================
# Mission Barisal — start-all.sh
# One-line starter for ALL local Mission Barisal services.
#
# Runs every server DETACHED (nohup + disown + PID files) so closing the
# terminal does NOT kill the processes — the exact failure mode that used to
# kill 3001/3002/3100 (and the Engine) whenever the terminal closed.
#
# ⚠ Windows: run this from Git Bash (MSYS2), NOT PowerShell/cmd.
#
# Usage:
#   ./scripts/start-all.sh            # start Engine only (MCP optional now)
#   ./scripts/start-all.sh --mcp      # ALSO start External MCP + combined (3001/3002/3100)
#   ./scripts/start-all.sh status     # show running services + MCP socket/port
#   ./scripts/start-all.sh stop       # stop everything (alias for stop-all.sh)
#
# Restart flow (syllabus): stop old process → start new → the new port wins
# and the Extension picks it up (response pattern stays identical).
# =============================================================================
set -euo pipefail

# ── Windows locations (Git Bash compatible — forward slashes) ──
# Engine = this workspace's sarver/ folder (api.js + start.js)
# External MCP = Desktop folder (start.js → 3001/3002, combined.js → 3100)
ENGINE_DIR="${ENGINE_DIR:-C:/Users/sahon/orebab/2/sarver}"
MCP_DIR="${MCP_DIR:-C:/Users/sahon/Desktop/External MCP}"
BRIDGE_PORT=9999  # HTTP bridge (Caddy replacement) — editors connect HERE
LOG_ROOT="${HOME}/.missionbarisal/logs"
PID_ROOT="${HOME}/.missionbarisal/pids"
UDS_PATH="$(node -e 'console.log(require("os").tmpdir())')/zombiecoder/mcp.sock"
UDS_TCP_PORT=5001  # Engine MCP TCP fallback on Windows = PORT (5000) + 1

mkdir -p "${LOG_ROOT}" "${PID_ROOT}"

C_GREEN='\033[0;32m'; C_YELLOW='\033[1;33m'; C_CYAN='\033[0;36m'; C_RED='\033[0;31m'; C_NC='\033[0m'

ok()   { echo -e "${C_GREEN}✔${C_NC} $*"; }
warn() { echo -e "${C_YELLOW}⚠${C_NC} $*"; }
info() { echo -e "${C_CYAN}›${C_NC} $*"; }
err()  { echo -e "${C_RED}✘${C_NC} $*"; }

is_windows() { # Git Bash / MSYS2 / Cygwin detection
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) return 0 ;;
    *) return 1 ;;
  esac
}

is_running() { # $1 = pid file
  [[ -f "$1" ]] && kill -0 "$(cat "$1" 2>/dev/null)" 2>/dev/null
}

# Find the PID listening on a TCP port (Windows: netstat, Linux: ss)
# Git Bash note: Windows pids differ from MSYS pids — netstat gives the real one.
port_pid() { # $1 = port
  local port="$1"
  if is_windows; then
    netstat -ano 2>/dev/null | awk -v p=":${port}" '($1 ~ /TCP/) && ($2 ~ p"$") && ($4 == "LISTENING") { print $5; exit }'
  else
    ss -ltnp 2>/dev/null | grep -E "[:.]${port} " | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2
  fi
}

# Engine "running" = pid file alive OR port 5000 occupied by anything
# (covers untracked engines started outside this script — stale PID trap)
engine_running() {
  if is_running "${PID_ROOT}/engine.pid"; then
    return 0
  fi
  [[ -n "$(port_pid 5000)" ]]
}

# Bridge "running" = pid file alive OR port 9999 occupied by anything
bridge_running() {
  if is_running "${PID_ROOT}/bridge.pid"; then
    return 0
  fi
  [[ -n "$(port_pid ${BRIDGE_PORT})" ]]
}

# Effective PID for display — pid file if alive, else the real port owner
service_pid() { # $1 = pid file, $2 = port
  if is_running "$1"; then
    cat "$1" 2>/dev/null
  else
    port_pid "$2"
  fi
}

# MCP socket check — UDS file on Linux/Mac, TCP loopback 5001 on Windows
check_mcp_socket() {
  if is_windows; then
    node -e "const s=require('net').connect(${UDS_TCP_PORT},'127.0.0.1');s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1))" 2>/dev/null
  else
    [[ -S "${UDS_PATH}" ]]
  fi
}

start_engine() {
  if engine_running; then
    local pid="$(cat "${PID_ROOT}/engine.pid" 2>/dev/null)"
    if [[ -z "${pid}" ]] || ! kill -0 "${pid}" 2>/dev/null; then
      # Stale pid file (or untracked engine) — adopt the port owner's real pid
      pid="$(port_pid 5000)"
      echo "${pid}" > "${PID_ROOT}/engine.pid"
    fi
    ok "Engine already running (PID ${pid}) — http://localhost:9999"
    return
  fi
  (
    cd "${ENGINE_DIR}"
    nohup node start.js >> "${LOG_ROOT}/engine.log" 2>&1 &
    echo $! > "${PID_ROOT}/engine.pid"
  )
  disown 2>/dev/null || true
  sleep 1.5
  if is_running "${PID_ROOT}/engine.pid" || [[ -n "$(port_pid 5000)" ]]; then
    ok "Engine started (PID $(cat "${PID_ROOT}/engine.pid")) — http://localhost:9999"
    if is_windows; then
      info "MCP TCP fallback: 127.0.0.1:${UDS_TCP_PORT} (Windows — no UDS socket)"
    else
      info "UDS socket: ${UDS_PATH}"
    fi
  else
    err "Engine failed to start — check ${LOG_ROOT}/engine.log"
    rm -f "${PID_ROOT}/engine.pid"  # don't leave a stale pid behind
    return 1
  fi
}

# HTTP bridge (Caddy replacement) — port 9999 → engine 5000.
# Editors connect to http://localhost:9999 (see doc/Server-Sent Events.md).
start_bridge() {
  if bridge_running; then
    local pid="$(cat "${PID_ROOT}/bridge.pid" 2>/dev/null)"
    if [[ -z "${pid}" ]] || ! kill -0 "${pid}" 2>/dev/null; then
      # Stale pid file (or untracked bridge) — adopt the port owner's real pid
      pid="$(port_pid ${BRIDGE_PORT})"
      echo "${pid}" > "${PID_ROOT}/bridge.pid"
    fi
    ok "Bridge already running (PID ${pid}) — http://localhost:${BRIDGE_PORT}"
    return
  fi
  (
    cd "${ENGINE_DIR}"
    nohup node bridge.js >> "${LOG_ROOT}/bridge.log" 2>&1 &
    echo $! > "${PID_ROOT}/bridge.pid"
  )
  disown 2>/dev/null || true
  sleep 1
  if is_running "${PID_ROOT}/bridge.pid" || [[ -n "$(port_pid ${BRIDGE_PORT})" ]]; then
    ok "Bridge started (PID $(cat "${PID_ROOT}/bridge.pid")) — http://localhost:${BRIDGE_PORT} → engine :5000"
  else
    err "Bridge failed to start — check ${LOG_ROOT}/bridge.log"
    rm -f "${PID_ROOT}/bridge.pid"
    return 1
  fi
}

start_mcp() {
  if is_running "${PID_ROOT}/mcp.pid"; then
    ok "External MCP already running (PID $(cat "${PID_ROOT}/mcp.pid"))"
  else
    (
      cd "${MCP_DIR}"
      nohup node start.js >> "${LOG_ROOT}/mcp.log" 2>&1 &
      echo $! > "${PID_ROOT}/mcp.pid"
    )
    disown 2>/dev/null || true
    ok "External MCP started (3001 facebook-ads + 3002 public-api, PID $(cat "${PID_ROOT}/mcp.pid"))"
  fi
  if is_running "${PID_ROOT}/combined.pid"; then
    ok "Combined gateway already running (PID $(cat "${PID_ROOT}/combined.pid"))"
  else
    (
      cd "${MCP_DIR}"
      nohup node combined.js >> "${LOG_ROOT}/combined.log" 2>&1 &
      echo $! > "${PID_ROOT}/combined.pid"
    )
    disown 2>/dev/null || true
    ok "Combined gateway started on 3100 (PID $(cat "${PID_ROOT}/combined.pid"))"
  fi
}

show_status() {
  info "Mission Barisal services:"
  local e_pid="$(service_pid "${PID_ROOT}/engine.pid" 5000)"
  local b_pid="$(service_pid "${PID_ROOT}/bridge.pid" ${BRIDGE_PORT})"
  if [[ -n "${e_pid}" ]]; then ok "Engine  (port 5000)  PID ${e_pid}"; else warn "Engine  (port 5000)  STOPPED"; fi
  if [[ -n "${b_pid}" ]]; then ok "Bridge  (port ${BRIDGE_PORT})  PID ${b_pid}"; else warn "Bridge  (port ${BRIDGE_PORT})  STOPPED"; fi
  is_running "${PID_ROOT}/mcp.pid"     && ok  "MCP     (3001/3002) PID $(cat "${PID_ROOT}/mcp.pid")"    || warn "MCP     (3001/3002) STOPPED (optional)"
  is_running "${PID_ROOT}/combined.pid" && ok "Combined (3100)     PID $(cat "${PID_ROOT}/combined.pid")" || warn "Combined (3100)     STOPPED (optional)"
  if check_mcp_socket; then
    if is_windows; then
      ok "MCP socket listening (TCP 127.0.0.1:${UDS_TCP_PORT})"
    else
      ok "UDS socket present: ${UDS_PATH}"
    fi
  else
    if is_windows; then
      warn "MCP socket NOT listening (TCP 127.0.0.1:${UDS_TCP_PORT}) — Engine not listening?"
    else
      warn "UDS socket NOT present: ${UDS_PATH} (Engine not listening?)"
    fi
  fi
}

stop_all() {
  for name in engine bridge combined mcp; do
    if is_running "${PID_ROOT}/${name}.pid"; then
      kill "$(cat "${PID_ROOT}/${name}.pid")" 2>/dev/null && ok "Stopped ${name} (PID $(cat "${PID_ROOT}/${name}.pid"))"
      rm -f "${PID_ROOT}/${name}.pid"
    fi
  done
  warn "All Mission Barisal services stopped."
}

case "${1:-}" in
  --mcp)  start_engine; start_bridge; start_mcp; show_status ;;
  status) show_status ;;
  stop)   stop_all ;;
  *)      start_engine; start_bridge; show_status ;;
esac
