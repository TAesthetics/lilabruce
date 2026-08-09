#!/bin/bash
# 🏛️ Layer 2: Web UI Server
# "The Wired" - Localhost Dashboard
# Present day, present time

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

PORT="${WIRED_PORT:-8888}"
HOST="${WIRED_HOST:-127.0.0.1}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$HOME/.wired/logs/wired-ui.log"
STATE_FILE="$HOME/.wired/state/status.json"

# Ensure directories exist
mkdir -p "$HOME/.wired/logs" "$HOME/.wired/state" "$HOME/.wired/cache"
touch "$LOG_FILE"

# ============================================================================
# Logging
# ============================================================================

log_msg() {
    local msg="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] [UI] $msg" | tee -a "$LOG_FILE"
}

log_error() {
    local msg="$1"
    echo "ERROR: $msg" | tee -a "$LOG_FILE"
}

# ============================================================================
# Simple HTTP Server (using netcat or socat)
# ============================================================================

# Check for available server tools
if command -v socat &>/dev/null; then
    USE_SOCAT=1
elif command -v nc &>/dev/null; then
    USE_SOCAT=0
else
    log_error "Neither socat nor nc found. Install one of them."
    exit 1
fi

# ============================================================================
# HTTP Handler
# ============================================================================

handle_request() {
    local request="$1"

    # Parse request line
    local method=$(echo "$request" | head -1 | awk '{print $1}')
    local path=$(echo "$request" | head -1 | awk '{print $2}')

    # Simple routing
    case "$path" in
        /)
            serve_html "index.html"
            ;;
        /api/status)
            serve_status_json
            ;;
        /api/logs)
            serve_logs_json
            ;;
        /api/recon)
            serve_cache_file "recon-results.json"
            ;;
        /api/exploit)
            serve_cache_file "exploit-results.json"
            ;;
        /api/detection)
            serve_cache_file "detection-results.json"
            ;;
        /api/hardening)
            serve_cache_file "hardening-results.json"
            ;;
        /styles.css)
            serve_static "styles.css" "text/css"
            ;;
        /app.js)
            serve_static "app.js" "application/javascript"
            ;;
        *)
            serve_404
            ;;
    esac
}

# Serve HTML file with HTTP headers
serve_html() {
    local file="$1"

    if [[ -f "$ROOT_DIR/$file" ]]; then
        local content=$(cat "$ROOT_DIR/$file")
        local length=${#content}

        echo -ne "HTTP/1.1 200 OK\r\n"
        echo -ne "Content-Type: text/html\r\n"
        echo -ne "Content-Length: $length\r\n"
        echo -ne "Connection: close\r\n"
        echo -ne "\r\n"
        echo -ne "$content"
    else
        serve_404
    fi
}

# Serve static file
serve_static() {
    local file="$1"
    local mime="$2"

    if [[ -f "$ROOT_DIR/$file" ]]; then
        local content=$(cat "$ROOT_DIR/$file")
        local length=${#content}

        echo -ne "HTTP/1.1 200 OK\r\n"
        echo -ne "Content-Type: $mime\r\n"
        echo -ne "Content-Length: $length\r\n"
        echo -ne "Connection: close\r\n"
        echo -ne "\r\n"
        echo -ne "$content"
    else
        serve_404
    fi
}

# Serve JSON status
serve_status_json() {
    if [[ -f "$STATE_FILE" ]]; then
        local content=$(cat "$STATE_FILE")
    else
        local content='{"error":"Status file not found"}'
    fi

    local length=${#content}

    echo -ne "HTTP/1.1 200 OK\r\n"
    echo -ne "Content-Type: application/json\r\n"
    echo -ne "Content-Length: $length\r\n"
    echo -ne "Connection: close\r\n"
    echo -ne "Access-Control-Allow-Origin: *\r\n"
    echo -ne "\r\n"
    echo -ne "$content"
}

# Serve cache file
serve_cache_file() {
    local file="$1"

    if [[ -f "$HOME/.wired/cache/$file" ]]; then
        local content=$(cat "$HOME/.wired/cache/$file")
        local length=${#content}

        echo -ne "HTTP/1.1 200 OK\r\n"
        echo -ne "Content-Type: application/json\r\n"
        echo -ne "Content-Length: $length\r\n"
        echo -ne "Connection: close\r\n"
        echo -ne "Access-Control-Allow-Origin: *\r\n"
        echo -ne "\r\n"
        echo -ne "$content"
    else
        serve_404
    fi
}

# Serve logs as JSON
serve_logs_json() {
    if [[ -f "$HOME/.wired/logs/wired.log" ]]; then
        local logs=$(tail -n 50 "$HOME/.wired/logs/wired.log" | jq -Rs '{"logs": .}' 2>/dev/null || echo '{"logs":""}')
        local length=${#logs}

        echo -ne "HTTP/1.1 200 OK\r\n"
        echo -ne "Content-Type: application/json\r\n"
        echo -ne "Content-Length: $length\r\n"
        echo -ne "Connection: close\r\n"
        echo -ne "Access-Control-Allow-Origin: *\r\n"
        echo -ne "\r\n"
        echo -ne "$logs"
    else
        local content='{"logs":""}'
        local length=${#content}

        echo -ne "HTTP/1.1 200 OK\r\n"
        echo -ne "Content-Type: application/json\r\n"
        echo -ne "Content-Length: $length\r\n"
        echo -ne "Connection: close\r\n"
        echo -ne "Access-Control-Allow-Origin: *\r\n"
        echo -ne "\r\n"
        echo -ne "$content"
    fi
}

# 404 Not Found
serve_404() {
    local content="Not Found"
    local length=${#content}

    echo -ne "HTTP/1.1 404 Not Found\r\n"
    echo -ne "Content-Type: text/plain\r\n"
    echo -ne "Content-Length: $length\r\n"
    echo -ne "Connection: close\r\n"
    echo -ne "\r\n"
    echo -ne "$content"
}

# ============================================================================
# Main Server Loop
# ============================================================================

start_server() {
    log_msg "🏛️  The Wired is rising on $HOST:$PORT"

    if [[ $USE_SOCAT -eq 1 ]]; then
        # socat method
        socat TCP-LISTEN:$PORT,reuseaddr,fork SYSTEM:"$0 handle_request"
    else
        # netcat method (simple)
        while true; do
            nc -l -p $PORT -q 1 | while read -r line; do
                handle_request "$line"
            done
        done
    fi
}

# ============================================================================
# Entry Point
# ============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ "${1:-}" == "handle_request" ]]; then
        # Called from netcat, read request from stdin
        local full_request=""
        while IFS= read -r -t 0.1 line || true; do
            if [[ -z "$line" ]]; then
                break
            fi
            full_request="$full_request$line"$'\n'
        done

        handle_request "$full_request"
    else
        # Start server
        start_server
    fi
fi
