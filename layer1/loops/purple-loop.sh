#!/bin/bash
# 🏛️ Purple Loop
# The Grand Orchestration
# Recon → Exploit → Detection → Hardening → Integration

set -euo pipefail

# Source libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$(dirname "$SCRIPT_DIR")/../lib"
AGENTS_DIR="$(dirname "$SCRIPT_DIR")/../agents"

source "$LIB_DIR/logging.sh"
source "$LIB_DIR/status.sh"

# ============================================================================
# Configuration
# ============================================================================

# Target from environment or default
TARGET="${PURPLE_TARGET:-localhost}"
LOOP_INTERVAL="${AUTOMATION_INTERVAL:-300}"
DEBUG="${DEBUG:-0}"

# ============================================================================
# Initialization
# ============================================================================

init() {
    log_prayer "init" "purple-loop" "🟣 Starting Purple Loop for target: $TARGET"
    mark_temple_initialized
    loop_start
}

# ============================================================================
# Main Purple Loop
# ============================================================================

run_loop() {
    local cycle=1

    while true; do
        local cycle_start=$(date +%s)
        log_prayer "cycle_start" "purple-loop" "Cycle #$cycle starting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

        # ====================================================================
        # Phase 1: RECON
        # ====================================================================
        log_prayer "phase" "purple-loop" "🟣 PHASE 1: RECON — The Seeing"
        set_phase "recon"

        if [[ -x "$AGENTS_DIR/recon-agent.sh" ]]; then
            "$AGENTS_DIR/recon-agent.sh" "$TARGET" "basic" || {
                log_error "purple-loop" "Recon phase failed"
            }
        else
            log_error "purple-loop" "Recon agent not found"
        fi

        # Wait between phases
        sleep 2

        # ====================================================================
        # Phase 2: EXPLOIT
        # ====================================================================
        log_prayer "phase" "purple-loop" "🟣 PHASE 2: EXPLOIT — The Touching"
        set_phase "exploit"

        if [[ -x "$AGENTS_DIR/exploit-agent.sh" ]]; then
            "$AGENTS_DIR/exploit-agent.sh" "$TARGET" "simulated_vulns" || {
                log_error "purple-loop" "Exploit phase failed"
            }
        else
            log_error "purple-loop" "Exploit agent not found"
        fi

        # Wait between phases
        sleep 2

        # ====================================================================
        # Phase 3: DETECTION
        # ====================================================================
        log_prayer "phase" "purple-loop" "🟣 PHASE 3: DETECTION — The Listening"
        set_phase "detection"

        if [[ -x "$AGENTS_DIR/detection-agent.sh" ]]; then
            "$AGENTS_DIR/detection-agent.sh" "$TARGET" "simulated_attack" || {
                log_error "purple-loop" "Detection phase failed"
            }
        else
            log_error "purple-loop" "Detection agent not found"
        fi

        # Wait between phases
        sleep 2

        # ====================================================================
        # Phase 4: HARDENING
        # ====================================================================
        log_prayer "phase" "purple-loop" "🟣 PHASE 4: HARDENING — The Healing"
        set_phase "hardening"

        if [[ -x "$AGENTS_DIR/hardening-agent.sh" ]]; then
            "$AGENTS_DIR/hardening-agent.sh" "$TARGET" "found_vulns" "detection_gaps" || {
                log_error "purple-loop" "Hardening phase failed"
            }
        else
            log_error "purple-loop" "Hardening agent not found"
        fi

        # ====================================================================
        # Phase 5: INTEGRATION & REPORTING
        # ====================================================================
        log_prayer "phase" "purple-loop" "⚪ PHASE 5: INTEGRATION — The Sealing"
        set_phase "integration"

        local cycle_end=$(date +%s)
        local cycle_duration=$((cycle_end - cycle_start))

        # Aggregate results
        if [[ -f "$HOME/.wired/cache/recon-results.json" ]]; then
            log_prayer "update" "purple-loop" "✓ Recon results available"
        fi

        if [[ -f "$HOME/.wired/cache/exploit-results.json" ]]; then
            log_prayer "update" "purple-loop" "✓ Exploit results available"
        fi

        if [[ -f "$HOME/.wired/cache/detection-results.json" ]]; then
            log_prayer "update" "purple-loop" "✓ Detection results available"
        fi

        if [[ -f "$HOME/.wired/cache/hardening-results.json" ]]; then
            log_prayer "update" "purple-loop" "✓ Hardening results available"
        fi

        # Create cycle report
        cat > "$HOME/.wired/cache/cycle-report-${cycle}.json" <<EOF
{
  "cycle": $cycle,
  "target": "$TARGET",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "duration_seconds": $cycle_duration,
  "phases": ["recon", "exploit", "detection", "hardening", "integration"],
  "status": "complete"
}
EOF

        log_prayer "cycle_end" "purple-loop" "✓ Cycle #$cycle complete in ${cycle_duration}s"
        increment_stat "cycles_completed"

        # ====================================================================
        # Wait before next cycle
        # ====================================================================

        log_prayer "wait" "purple-loop" "💤 Sleeping for ${LOOP_INTERVAL}s before next cycle..."

        # Sleep while checking for interruption signals
        local remaining=$LOOP_INTERVAL
        while [[ $remaining -gt 0 ]]; do
            if [[ -f "$HOME/.wired/state/loop-stop" ]]; then
                log_prayer "shutdown" "purple-loop" "⚫ Shutdown signal received. Exiting loop."
                rm -f "$HOME/.wired/state/loop-stop"
                loop_stop
                return 0
            fi

            sleep 5
            remaining=$((remaining - 5))
        done

        cycle=$((cycle + 1))
    done
}

# ============================================================================
# Graceful Shutdown
# ============================================================================

cleanup() {
    log_prayer "shutdown" "purple-loop" "⚫ Purple Loop shutting down gracefully"
    loop_stop
    exit 0
}

trap cleanup SIGINT SIGTERM

# ============================================================================
# Main Entry
# ============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    init
    run_loop
fi
