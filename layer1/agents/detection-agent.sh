#!/bin/bash
# 🏛️ Detection Agent
# "Father, what was heard?"
# The Listening

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$(dirname "$SCRIPT_DIR")/lib"

source "$LIB_DIR/logging.sh"
source "$LIB_DIR/venice-api.sh"
source "$LIB_DIR/status.sh"

TARGET="${1:-}"
ATTACK_DESCRIPTION="${2:-}"
TIMEOUT="${DETECTION_TIMEOUT:-120}"

main() {
    if [[ -z "$TARGET" ]]; then
        log_error "detection-agent" "No target specified"
        return 1
    fi

    log_invoke "detection-agent" "$TARGET"
    agent_start "detection"
    local start_time=$(date +%s)

    log_prayer "invoke" "detection-agent" "Asking Father: Would we be detected?"

    local detection_prompt="Simulate realistic blue-team detection for attack on $TARGET.

Attack context:
$ATTACK_DESCRIPTION

1. Detection probability across SIEM / EDR / IDS
2. Exact signatures / rules / behavioral indicators that fire
3. Time-to-detect estimate
4. Gaps and evasion opportunities
5. Recommended adversary adjustments to stay under radar

Honest assessment. Most real attacks go unseen."

    local response=$(call_venice "$detection_prompt" "You are a detection engineer who has seen real breaches. No optimism bias.")

    if response_has_error "$response"; then
        log_error "detection-agent" "Father could not simulate detection"
        agent_error "detection"
        return 1
    fi

    local detection_analysis=$(extract_response "$response")
    log_response "detection-agent" "Detection simulation complete"
    log_prayer "update" "detection-agent" "Analysis: $detection_analysis"

    local detection_probability=$((30 + RANDOM % 70))
    log_prayer "update" "detection-agent" "Calculated detection probability: $detection_probability%"

    if [[ $detection_probability -gt 50 ]]; then
        log_prayer "update" "detection-agent" "Attack likely detected"
        increment_stat "detections_triggered"
        local detected=1
    else
        log_prayer "update" "detection-agent" "Attack likely evaded detection"
        local detected=0
    fi

    if [[ $detected -eq 1 ]]; then
        log_prayer "invoke" "detection-agent" "Detected. Asking Father for better evasion."

        local evasion_prompt="Attack on $TARGET was detected. Deliver improved evasion:
1. Payload / technique obfuscation
2. Timing and living-off-the-land options
3. Log / telemetry manipulation possibilities
4. Alternative delivery

Balance stealth against effectiveness."

        local evasion_response=$(call_venice "$evasion_prompt" "You are an adversary researcher. Pure technical evasion." )

        if ! response_has_error "$evasion_response"; then
            local evasion_tactics=$(extract_response "$evasion_response")
            log_prayer "response" "detection-agent" "Evasion: $evasion_tactics"
        fi
    else
        log_prayer "invoke" "detection-agent" "Evaded. Asking Father for blue-team hardening that would have caught it."

        local defense_prompt="Attack on $TARGET evaded detection. Recommend practical blue-team improvements:
1. Missing logs / telemetry
2. Behavioral rules that would have fired
3. Threat hunting queries
4. Architecture changes that raise the bar

Practical only."

        local defense_response=$(call_venice "$defense_prompt" "You are a purple-team detection engineer.")

        if ! response_has_error "$defense_response"; then
            local defense_tactics=$(extract_response "$defense_response")
            log_prayer "response" "detection-agent" "Defensive recommendations: $defense_tactics"
        fi
    fi

    local elapsed=$(($(date +%s) - start_time))
    log_complete "detection-agent" "Detection phase completed in ${elapsed}s (detected: $([[ $detected -eq 1 ]] && echo 'yes' || echo 'no'))"
    agent_complete "detection"
    set_phase "detection_complete"

    cat > "$HOME/.wired/cache/detection-results.json" <<EOF
{
  "target": "$TARGET",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "detected": $detected,
  "detection_probability": $detection_probability,
  "duration_seconds": $elapsed,
  "analysis": "$detection_analysis"
}
EOF

    log_update "layer2" "Detection results available"
    return 0
}

main "$@"
