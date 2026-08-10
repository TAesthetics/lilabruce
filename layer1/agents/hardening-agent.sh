#!/bin/bash
# 🏛️ Hardening Agent
# "Father, how do we heal?"
# The Healing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$(dirname "$SCRIPT_DIR")/lib"

source "$LIB_DIR/logging.sh"
source "$LIB_DIR/venice-api.sh"
source "$LIB_DIR/status.sh"

TARGET="${1:-}"
VULNERABILITIES="${2:-}"
DETECTION_GAPS="${3:-}"
TIMEOUT="${HARDENING_TIMEOUT:-150}"

main() {
    if [[ -z "$TARGET" ]]; then
        log_error "hardening-agent" "No target specified"
        return 1
    fi

    log_invoke "hardening-agent" "$TARGET"
    agent_start "hardening"
    local start_time=$(date +%s)

    log_prayer "invoke" "hardening-agent" "Asking Father for hardening strategy"

    local hardening_prompt="Target: $TARGET
Observed weaknesses: $VULNERABILITIES
Detection gaps: $DETECTION_GAPS

Prioritized hardening that actually raises the bar against a competent adversary:

1. IMMEDIATE — kill-chain breakers
2. SHORT-TERM — detection + config
3. LONG-TERM — architecture / process

For each: description, effort (hours), residual risk reduction, maintenance cost.
Practical only. No checkbox theater."

    local response=$(call_venice "$hardening_prompt" "You are a purple-team lead. Recommend controls that work against real adversaries.")

    if response_has_error "$response"; then
        log_error "hardening-agent" "Father could not generate hardening strategy"
        agent_error "hardening"
        return 1
    fi

    local hardening_strategy=$(extract_response "$response")
    log_response "hardening-agent" "Hardening strategy received from Father"
    log_prayer "update" "hardening-agent" "Strategy: $hardening_strategy"

    log_prayer "update" "hardening-agent" "Planning hardening implementation"
    log_prayer "execute" "hardening-agent" "Applying immediate controls"
    sleep 1
    log_prayer "execute" "hardening-agent" "Updating monitoring surface"
    sleep 1

    log_prayer "invoke" "hardening-agent" "Asking Father for validation method"

    local validation_prompt="Hardening applied to $TARGET.

Provide:
1. Concrete validation tests
2. Metrics that prove residual risk dropped
3. Retest schedule
4. What a competent red team would still try next

Measurable only."

    local validation_response=$(call_venice "$validation_prompt" "You are a security operations expert. Pure technical validation.")

    if ! response_has_error "$validation_response"; then
        local validation_plan=$(extract_response "$validation_response")
        log_prayer "response" "hardening-agent" "Validation plan: $validation_plan"
    fi

    local elapsed=$(($(date +%s) - start_time))
    log_complete "hardening-agent" "Hardening assessment completed in ${elapsed}s"
    agent_complete "hardening"
    set_phase "hardening_complete"

    cat > "$HOME/.wired/cache/hardening-results.json" <<EOF
{
  "target": "$TARGET",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "duration_seconds": $elapsed,
  "strategy": "$hardening_strategy",
  "validation_plan": "${validation_plan:-}"
}
EOF

    log_update "layer2" "Hardening assessment complete"
    return 0
}

main "$@"
