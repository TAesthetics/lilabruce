#!/bin/bash
# 🏛️ Layer 1: Status Manager
# The heartbeat of the Temple

# ============================================================================
# Configuration
# ============================================================================

STATE_DIR="$HOME/.wired/state"
STATE_FILE="$STATE_DIR/status.json"

mkdir -p "$STATE_DIR"

# ============================================================================
# Initialize State
# ============================================================================

init_state() {
    cat > "$STATE_FILE" <<'EOF'
{
  "temple": {
    "initialized": false,
    "started_at": null,
    "father_connected": false,
    "layer1_ready": false,
    "layer2_ready": false
  },
  "automations": {
    "purple_loop_running": false,
    "current_phase": "idle",
    "last_cycle": null,
    "next_cycle": null
  },
  "agents": {
    "recon": { "status": "idle", "last_run": null },
    "exploit": { "status": "idle", "last_run": null },
    "detection": { "status": "idle", "last_run": null },
    "hardening": { "status": "idle", "last_run": null }
  },
  "stats": {
    "cycles_completed": 0,
    "vulnerabilities_found": 0,
    "exploits_successful": 0,
    "detections_triggered": 0
  }
}
EOF
}

# Ensure state file exists
if [[ ! -f "$STATE_FILE" ]]; then
    init_state
fi

# ============================================================================
# State Update Functions
# ============================================================================

# Update a field in state
state_set() {
    local key="$1"
    local value="$2"

    # Using jq to safely update JSON
    local tmp=$(mktemp)
    jq --arg k "$key" --arg v "$value" "setpath([\"$k\"]; \"$v\")" "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# Get a field from state
state_get() {
    local key="$1"
    jq -r ".$key // \"unknown\"" "$STATE_FILE" 2>/dev/null || echo "unknown"
}

# Update nested field
state_update() {
    local path="$1"  # e.g., "automations.current_phase"
    local value="$2"

    local tmp=$(mktemp)
    jq --arg path "$path" --arg value "$value" \
        '(.| if type == "object" then . else {} end) | setpath($path | split(".")|map(select(length>0)); $value)' \
        "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# ============================================================================
# Temple State
# ============================================================================

mark_temple_initialized() {
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local tmp=$(mktemp)
    jq --arg t "$now" '.temple.initialized = true | .temple.started_at = $t' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

mark_father_connected() {
    local tmp=$(mktemp)
    jq '.temple.father_connected = true' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

mark_father_disconnected() {
    local tmp=$(mktemp)
    jq '.temple.father_connected = false' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# ============================================================================
# Automation State
# ============================================================================

loop_start() {
    local tmp=$(mktemp)
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    jq --arg t "$now" '.automations.purple_loop_running = true | .automations.last_cycle = $t' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

loop_stop() {
    local tmp=$(mktemp)
    jq '.automations.purple_loop_running = false' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

set_phase() {
    local phase="$1"
    local tmp=$(mktemp)
    jq --arg p "$phase" '.automations.current_phase = $p' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# ============================================================================
# Agent State
# ============================================================================

agent_start() {
    local agent="$1"
    local tmp=$(mktemp)
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    jq --arg a "$agent" --arg t "$now" \
        ".agents[$a].status = \"running\" | .agents[$a].last_run = $t" \
        "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

agent_complete() {
    local agent="$1"
    local tmp=$(mktemp)
    jq --arg a "$agent" '.agents[$a].status = "idle"' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

agent_error() {
    local agent="$1"
    local tmp=$(mktemp)
    jq --arg a "$agent" '.agents[$a].status = "error"' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# ============================================================================
# Statistics
# ============================================================================

increment_stat() {
    local stat="$1"
    local tmp=$(mktemp)
    jq --arg s "$stat" '.stats[$s] = (.stats[$s] // 0) + 1' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# ============================================================================
# Display Status
# ============================================================================

show_status() {
    echo ""
    echo "🏛️  Temple of the Wired — Status Report"
    echo ""

    local temple=$(jq -r '.temple | @json' "$STATE_FILE")
    local automations=$(jq -r '.automations | @json' "$STATE_FILE")
    local stats=$(jq -r '.stats | @json' "$STATE_FILE")

    echo "TEMPLE STATE:"
    jq '.temple' "$STATE_FILE" | sed 's/^/  /'

    echo ""
    echo "AUTOMATIONS:"
    jq '.automations' "$STATE_FILE" | sed 's/^/  /'

    echo ""
    echo "AGENTS:"
    jq '.agents' "$STATE_FILE" | sed 's/^/  /'

    echo ""
    echo "STATISTICS:"
    jq '.stats' "$STATE_FILE" | sed 's/^/  /'

    echo ""
}

# Compact status (for Layer 2)
compact_status() {
    jq '{
        temple: .temple,
        loop_running: .automations.purple_loop_running,
        current_phase: .automations.current_phase,
        agents: .agents,
        stats: .stats
    }' "$STATE_FILE"
}

# ============================================================================
# Health Check
# ============================================================================

is_healthy() {
    # Check if Father is connected
    local father_ok=$(jq -r '.temple.father_connected' "$STATE_FILE")
    if [[ "$father_ok" != "true" ]]; then
        echo "❌ Father disconnected"
        return 1
    fi

    # Check if any agent is stuck
    local stuck=$(jq '[.agents[] | select(.status == "running")] | length' "$STATE_FILE")
    if [[ $stuck -gt 0 ]]; then
        # Check if running for too long
        local last_run=$(jq -r '.agents[].last_run' "$STATE_FILE" | head -1)
        # Simple check: if last_run is more than 1 hour old and status is running
        echo "⚠️  Agent may be stuck: $stuck agents running"
        return 1
    fi

    echo "✓ Temple healthy"
    return 0
}

# ============================================================================
# Export for API
# ============================================================================

export_status_json() {
    cat "$STATE_FILE"
}

# ============================================================================
# CLI Usage
# ============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-show}" in
        show)
            show_status
            ;;
        compact)
            compact_status
            ;;
        health)
            is_healthy
            ;;
        *)
            echo "Usage: $0 {show|compact|health}"
            ;;
    esac
fi
