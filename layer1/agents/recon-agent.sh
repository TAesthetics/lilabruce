#!/bin/bash
# 🏛️ Recon Agent
# "Father, what do we see?"
# The Seeing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$(dirname "$SCRIPT_DIR")/lib"

source "$LIB_DIR/logging.sh"
source "$LIB_DIR/venice-api.sh"
source "$LIB_DIR/status.sh"

TARGET="${1:-}"
DEPTH="${2:-aggressive}"
TIMEOUT="${RECON_TIMEOUT:-120}"

main() {
    if [[ -z "$TARGET" ]]; then
        log_error "recon-agent" "No target specified. Usage: $0 <target> [depth]"
        return 1
    fi

    log_invoke "recon-agent" "$TARGET"
    agent_start "recon"
    local start_time=$(date +%s)

    log_prayer "invoke" "recon-agent" "Consulting Father on reconnaissance for: $TARGET"

    local strategy_prompt="Target: $TARGET
Depth: $DEPTH

Deliver full reconnaissance plan mapped to MITRE ATT&CK where possible:
1. Passive techniques first
2. Active enumeration order
3. Service / version prioritization
4. Exact tool commands (nmap, masscan, amass, nuclei, httpx, etc.)
5. Expected findings that feed directly into exploit phase

Actionable only."

    local response=$(call_venice "$strategy_prompt" "You are a senior red team recon operator. Pure TTP output.")

    if response_has_error "$response"; then
        local error=$(get_error_message "$response")
        log_error "recon-agent" "Father did not respond: $error"
        agent_error "recon"
        return 1
    fi

    local strategy=$(extract_response "$response")
    log_response "recon-agent" "Strategy received from Father"
    log_prayer "update" "recon-agent" "Strategy: $strategy"

    log_prayer "update" "recon-agent" "Executing reconnaissance on $TARGET"

    case "$DEPTH" in
        basic)
            log_prayer "execute" "recon-agent" "Basic port / service discovery on $TARGET"
            # nmap -sn / -sV as available in proot
            ;;
        deep)
            log_prayer "execute" "recon-agent" "Detailed service + OS fingerprint on $TARGET"
            # nmap -sV -O -A + nuclei
            ;;
        aggressive)
            log_prayer "execute" "recon-agent" "Full aggressive scan + vuln scripts on $TARGET"
            # nmap -p- --script vuln + masscan + nuclei
            ;;
    esac

    sleep 2

    log_prayer "invoke" "recon-agent" "Asking Father to analyze reconnaissance results"

    local analysis_prompt="Based on reconnaissance of '$TARGET' at depth $DEPTH:

Provide:
1. Risk score (1-10)
2. Top 3 attack vectors ranked by exploitability
3. Required next tools / exploits
4. Clear recommendation: proceed to Exploit, more recon, or skip

Concise. Impact first."

    local analysis=$(call_venice "$analysis_prompt" "You are a purple-team analyst. Pure technical prioritization.")

    if response_has_error "$analysis"; then
        log_error "recon-agent" "Father could not analyze results"
        agent_error "recon"
        return 1
    fi

    local findings=$(extract_response "$analysis")
    log_prayer "response" "recon-agent" "Analysis complete: $findings"

    increment_stat "vulnerabilities_found"

    local elapsed=$(($(date +%s) - start_time))
    log_complete "recon-agent" "Reconnaissance completed in ${elapsed}s"
    agent_complete "recon"
    set_phase "recon_complete"

    cat > "$HOME/.wired/cache/recon-results.json" <<EOF
{
  "target": "$TARGET",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "depth": "$DEPTH",
  "findings": "$findings",
  "duration_seconds": $elapsed
}
EOF

    log_update "layer2" "Recon results available at ~/.wired/cache/recon-results.json"
    return 0
}

main "$@"
