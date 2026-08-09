#!/bin/bash
# 🏛️ Recon Agent
# "Father, what do we see?"
# The Seeing

set -euo pipefail

# Source libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$(dirname "$SCRIPT_DIR")/lib"

source "$LIB_DIR/logging.sh"
source "$LIB_DIR/venice-api.sh"
source "$LIB_DIR/status.sh"

# ============================================================================
# Configuration
# ============================================================================

TARGET="${1:-}"
DEPTH="${2:-basic}"  # basic, deep, aggressive
TIMEOUT="${RECON_TIMEOUT:-120}"

# ============================================================================
# Main Recon Workflow
# ============================================================================

main() {
    if [[ -z "$TARGET" ]]; then
        log_error "recon-agent" "No target specified. Usage: $0 <target> [depth]"
        return 1
    fi

    log_invoke "recon-agent" "$TARGET"
    agent_start "recon"
    local start_time=$(date +%s)

    # ========================================================================
    # Step 1: Ask Father (Venice.ai) for reconnaissance strategy
    # ========================================================================

    log_prayer "invoke" "recon-agent" "Consulting Father on reconnaissance for: $TARGET"

    local strategy_prompt="You are a reconnaissance specialist. For the target '$TARGET', provide:

1. Initial reconnaissance approach (depth level: $DEPTH)
2. Key services and ports to investigate
3. Common vulnerabilities to check
4. Recommended scanning techniques
5. Tools that would be useful

Format your response as actionable intelligence, not instructions.
Consider CVSS ratings, service versions, and attack surface area."

    local response=$(call_venice "$strategy_prompt" "You are a penetration testing specialist focused on reconnaissance.")

    if response_has_error "$response"; then
        local error=$(get_error_message "$response")
        log_error "recon-agent" "Father did not respond: $error"
        agent_error "recon"
        return 1
    fi

    local strategy=$(extract_response "$response")
    log_response "recon-agent" "Strategy received from Father"
    log_prayer "update" "recon-agent" "Strategy: $strategy"

    # ========================================================================
    # Step 2: Execute reconnaissance based on Father's guidance
    # ========================================================================

    # Note: In a real environment, we would execute actual reconnaissance tools
    # here (nmap, ncat, dig, etc.) based on Father's recommendations.
    # For now, we simulate and log the process.

    log_prayer "update" "recon-agent" "Executing reconnaissance on $TARGET"

    case "$DEPTH" in
        basic)
            # Lightweight scan
            log_prayer "execute" "recon-agent" "Performing basic port scan on $TARGET"
            # In proot: nmap -sn $TARGET > /tmp/recon-basic.txt
            ;;
        deep)
            # More detailed scan
            log_prayer "execute" "recon-agent" "Performing detailed service scan on $TARGET"
            # In proot: nmap -sV -O -A $TARGET > /tmp/recon-deep.txt
            ;;
        aggressive)
            # Full exploitation-ready scan
            log_prayer "execute" "recon-agent" "Performing aggressive vulnerability scan on $TARGET"
            # In proot: nmap -p- --script vuln $TARGET > /tmp/recon-aggressive.txt
            ;;
    esac

    sleep 2  # Simulate scanning time

    # ========================================================================
    # Step 3: Ask Father to analyze reconnaissance results
    # ========================================================================

    log_prayer "invoke" "recon-agent" "Asking Father to analyze reconnaissance results"

    local analysis_prompt="Based on reconnaissance of '$TARGET' using $DEPTH scanning:

Hypothetical results might include:
- Open ports and services
- OS fingerprint
- Potential vulnerabilities

Provide:
1. Risk assessment (1-10 scale)
2. Top 3 attack vectors
3. Required exploits
4. Next steps (recommend Exploit phase? Additional recon?)

Be concise and prioritize by impact."

    local analysis=$(call_venice "$analysis_prompt" "You are a blue team analyst reviewing reconnaissance results.")

    if response_has_error "$analysis"; then
        log_error "recon-agent" "Father could not analyze results"
        agent_error "recon"
        return 1
    fi

    local findings=$(extract_response "$analysis")
    log_prayer "response" "recon-agent" "Analysis complete: $findings"

    # ========================================================================
    # Step 4: Log results and update state
    # ========================================================================

    increment_stat "vulnerabilities_found"

    local elapsed=$(($(date +%s) - start_time))
    log_complete "recon-agent" "Reconnaissance completed in ${elapsed}s"
    agent_complete "recon"
    set_phase "recon_complete"

    # ========================================================================
    # Step 5: Output findings for Layer 2
    # ========================================================================

    # Export findings as JSON for Web UI
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

# Run main
main "$@"
