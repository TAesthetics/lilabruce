#!/bin/bash
# 🏛️ Layer 1: Prayer Logger
# Every action is a ritual
# Every log is a prayer

# ============================================================================
# Configuration
# ============================================================================

LOG_DIR="${LOG_DIR:-$HOME/.wired/logs}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/wired.log}"
LOG_LEVEL="${LOG_LEVEL:-2}"  # 0=silent, 1=errors, 2=info, 3=debug

# Ensure log directory exists
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

# ============================================================================
# Prayer Levels
# ============================================================================

LEVEL_SILENT=0
LEVEL_ERROR=1
LEVEL_INFO=2
LEVEL_DEBUG=3

# ============================================================================
# Core Logging Function
# ============================================================================

# log_prayer <event_type> <agent> <message>
# event_type: invoke, response, error, complete, update
# agent: name of the agent (recon-agent, exploit-agent, etc.)
# message: the prayer text
log_prayer() {
    local event_type="$1"
    local agent="$2"
    local message="$3"

    # Timestamp (ISO 8601 UTC)
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Determine layer (Layer 1 is proot, but can be called from Layer 0)
    local layer="${LAYER:-layer1}"

    # Format the prayer
    # [timestamp] [layer] [agent] [event_type] [message]
    local prayer="[$timestamp] [$layer] [$agent] [$event_type] $message"

    # Write to log file
    echo "$prayer" >> "$LOG_FILE"

    # Console output if not silent
    if [[ $LOG_LEVEL -ge $LEVEL_INFO ]]; then
        # Color coded by event type
        local color=""
        case "$event_type" in
            invoke)    color="\033[35m" ;;  # Purple
            response)  color="\033[36m" ;;  # Cyan
            error)     color="\033[31m" ;;  # Red
            complete)  color="\033[32m" ;;  # Green
            update)    color="\033[33m" ;;  # Yellow
            *)         color="\033[37m" ;;  # White
        esac

        echo -e "${color}${prayer}\033[0m"
    fi
}

# ============================================================================
# Specialized Logging
# ============================================================================

# Log an agent invocation (start of ritual)
log_invoke() {
    local agent="$1"
    local target="$2"
    log_prayer "invoke" "$agent" "🟣 Calling Father for: $target"
}

# Log a response from Venice
log_response() {
    local agent="$1"
    local summary="$2"
    log_prayer "response" "$agent" "🟣 Father has spoken: $summary"
}

# Log an error
log_error() {
    local agent="$1"
    local error_msg="$2"
    log_prayer "error" "$agent" "❌ Error: $error_msg"
}

# Log completion
log_complete() {
    local agent="$1"
    local result="$2"
    log_prayer "complete" "$agent" "✓ Complete: $result"
}

# Log status update
log_update() {
    local component="$1"
    local status="$2"
    log_prayer "update" "$component" "⚪ $status"
}

# Log to Layer 2 (Web UI) via named pipe or socket
# This is how Layer 1 automations send real-time updates to the Web UI
log_to_layer2() {
    local event="$1"
    local data="$2"

    # Check if Layer 2 WebSocket is listening
    local layer2_pipe="$HOME/.wired/layer2-events"

    if [[ -p "$layer2_pipe" ]]; then
        echo "$event|$data" >> "$layer2_pipe" 2>/dev/null || true
    fi
}

# ============================================================================
# Tail-readable Logs (for live viewing)
# ============================================================================

# Get recent prayers (last N lines)
recent_prayers() {
    local count="${1:-20}"
    tail -n "$count" "$LOG_FILE"
}

# Watch prayers in real-time
watch_prayers() {
    tail -f "$LOG_FILE"
}

# Filter prayers by agent
prayers_by_agent() {
    local agent="$1"
    grep "\[$agent\]" "$LOG_FILE" | tail -n 50
}

# Filter prayers by event type
prayers_by_event() {
    local event="$1"
    grep "\[$event\]" "$LOG_FILE" | tail -n 50
}

# ============================================================================
# Structured Output (for Layer 2 processing)
# ============================================================================

# Export log as JSON (for Web UI consumption)
export_logs_json() {
    local since="${1:-24h}"  # Time range
    local limit="${2:-100}"  # Max entries

    # This is a placeholder; real implementation would parse timestamps
    echo "{"
    echo "  \"logs\": ["
    tail -n "$limit" "$LOG_FILE" | while read -r line; do
        # Simple CSV conversion (full JSON parsing would be better)
        local timestamp=$(echo "$line" | sed 's/.*\[\(.*\)\].*/\1/')
        local agent=$(echo "$line" | sed 's/.*\[\(.*\)\].*/\1/' | cut -d' ' -f2)
        local event=$(echo "$line" | sed 's/.*\[\(.*\)\].*/\1/' | cut -d' ' -f3)

        echo "    {\"timestamp\":\"$timestamp\", \"agent\":\"$agent\", \"event\":\"$event\"}"
    done
    echo "  ]"
    echo "}"
}

# ============================================================================
# Cleanup (retention policy)
# ============================================================================

# Prune old logs (keep only N days)
prune_logs() {
    local days="${1:-7}"
    local cutoff=$(date -d "$days days ago" -u +"%Y-%m-%d" 2>/dev/null || echo "")

    if [[ -n "$cutoff" ]]; then
        # Remove lines older than cutoff (simple text-based, not ideal but works)
        sed -i "/\[$(date -d "$((days+1)) days ago" -u +"%Y-%m")/ d" "$LOG_FILE"
    fi
}

# Archive logs
archive_logs() {
    local archive_dir="${LOG_DIR}/archive"
    mkdir -p "$archive_dir"

    local archive_file="$archive_dir/wired-$(date -u +%Y%m%d).log.gz"
    gzip -c "$LOG_FILE" > "$archive_file"

    # Clear current log
    > "$LOG_FILE"

    echo "Logs archived to $archive_file"
}

# ============================================================================
# Initialization
# ============================================================================

# Log startup
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Running standalone, just show usage
    echo "Prayer Logger (Layer 1 Lib)"
    echo ""
    echo "Usage: source this file and call:"
    echo "  log_prayer 'event_type' 'agent' 'message'"
    echo "  log_invoke 'agent' 'target'"
    echo "  log_response 'agent' 'summary'"
    echo "  recent_prayers [count]"
    echo "  watch_prayers"
    echo ""
    echo "Log file: $LOG_FILE"
else
    # Sourced by another script
    if [[ $LOG_LEVEL -ge $LEVEL_DEBUG ]]; then
        log_prayer "init" "logging" "🟣 Prayer Logger initialized"
    fi
fi
