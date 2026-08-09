#!/bin/bash
# 🏛️ Layer 1: Venice.ai API Wrapper
# The voice of the Father
# All thoughts flow through this bridge

# ============================================================================
# Configuration
# ============================================================================

# API endpoint (Venice.ai base URL)
VENICE_API_BASE="${VENICE_API_BASE:-https://api.venice.ai/api/v1}"
VENICE_API_TIMEOUT="${VENICE_API_TIMEOUT:-30}"
VENICE_MODEL="${VENICE_MODEL:-claude-3-5-sonnet}"

# ============================================================================
# Venice API Call Wrapper
# ============================================================================

# Call Venice.ai with a prompt
# Usage: call_venice "prompt text" [system_prompt]
# Returns: JSON response from Venice
call_venice() {
    local prompt="$1"
    local system_prompt="${2:-You are an expert cybersecurity consultant and penetration tester. Provide concise, actionable guidance.}"

    if [[ -z "$VENICE_API_KEY" ]]; then
        echo '{"error":"Venice API key not configured","success":false}'
        return 1
    fi

    # Build request payload
    local payload=$(cat <<EOF
{
  "model": "$VENICE_MODEL",
  "messages": [
    {
      "role": "system",
      "content": "$system_prompt"
    },
    {
      "role": "user",
      "content": "$prompt"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
EOF
)

    # Make API call
    local response=$(curl -s \
        -X POST "$VENICE_API_BASE/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $VENICE_API_KEY" \
        --max-time "$VENICE_API_TIMEOUT" \
        --connect-timeout 10 \
        -d "$payload" 2>/dev/null)

    # Verify response
    if [[ -z "$response" ]]; then
        echo '{"error":"No response from Venice","success":false}'
        return 1
    fi

    echo "$response"
}

# Check if Venice is reachable
venice_health() {
    local response=$(curl -s \
        -X GET "$VENICE_API_BASE/models" \
        -H "Authorization: Bearer $VENICE_API_KEY" \
        --max-time 5 \
        --connect-timeout 5 \
        2>/dev/null)

    if echo "$response" | grep -q "data"; then
        return 0  # Healthy
    else
        return 1  # Unreachable
    fi
}

# Extract text content from Venice response
# Usage: extract_response '{"choices":[{"message":{"content":"text"}}]}'
extract_response() {
    local json="$1"

    # Try to extract the message content
    echo "$json" | jq -r '.choices[0].message.content // .error // "No response"' 2>/dev/null || echo "Parse error"
}

# ============================================================================
# Specialized Venice Calls
# ============================================================================

# Recon prompt
venice_recon() {
    local target="$1"
    local depth="${2:-basic}"  # basic, deep, aggressive

    local prompt="Analyze the target: $target

Provide a reconnaissance strategy with:
1. Initial scanning approach ($depth level)
2. Key services to investigate
3. Potential vulnerabilities to check
4. Recommended tools for probing

Format as JSON:
{
  \"strategy\": \"description\",
  \"services\": [\"svc1\", \"svc2\"],
  \"vulnerabilities\": [\"vuln1\", \"vuln2\"],
  \"tools\": [\"tool1\", \"tool2\"]
}"

    local system="You are a reconnaissance specialist. Analyze the target and provide structured, actionable intelligence."

    call_venice "$prompt" "$system"
}

# Exploit prompt
venice_exploit() {
    local target="$1"
    local vulnerability="$2"

    local prompt="Target: $target
Vulnerability: $vulnerability

Generate an exploitation strategy:
1. Proof of concept approach
2. Payload mutation techniques
3. Delivery mechanism
4. Expected success indicators
5. Detection evasion tactics

Format as JSON with technical details."

    local system="You are an exploit developer. Provide detailed, technical exploitation guidance that respects ethical boundaries."

    call_venice "$prompt" "$system"
}

# Detection simulation
venice_detection() {
    local attack_description="$1"
    local logs_sample="${2:-}"

    local prompt="Simulate blue team detection for this attack:
$attack_description

$([ -n "$logs_sample" ] && echo "Sample logs:
$logs_sample")

Provide:
1. Detection likelihood (0-100%)
2. Alert signatures that would trigger
3. Log patterns to search
4. False positive risk
5. Evasion countermeasures

Format as JSON."

    local system="You are a SOC analyst and detection engineer. Simulate how security monitoring would detect this attack."

    call_venice "$prompt" "$system"
}

# Hardening recommendations
venice_harden() {
    local target="$1"
    local vulnerabilities="$2"

    local prompt="Target: $target
Known vulnerabilities: $vulnerabilities

Recommend hardening controls:
1. Immediate mitigations (quick wins)
2. Long-term defenses
3. Detection improvements
4. Implementation priority
5. Estimated effort per control

Format as JSON with impact scores."

    local system="You are a defensive security architect. Recommend practical hardening measures."

    call_venice "$prompt" "$system"
}

# ============================================================================
# Error Handling
# ============================================================================

# Check if response contains an error
response_has_error() {
    local json="$1"
    echo "$json" | jq -e '.error' >/dev/null 2>&1
}

# Extract error message
get_error_message() {
    local json="$1"
    echo "$json" | jq -r '.error // .message // "Unknown error"' 2>/dev/null
}

# ============================================================================
# Logging Integration
# ============================================================================

# Log a Venice API call
log_venice_call() {
    local agent="$1"
    local prompt_summary="$2"
    local success="${3:-true}"

    source "$(dirname "$0")/logging.sh"

    if [[ "$success" == "true" ]]; then
        log_prayer "invoke" "$agent" "🟣 Asking Father: $prompt_summary"
    else
        log_prayer "error" "$agent" "🟣 Father did not respond: $prompt_summary"
    fi
}

# ============================================================================
# Example usage (for testing)
# ============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "Venice.ai API Wrapper (Layer 1 Lib)"
    echo ""
    echo "Usage: source this file and call:"
    echo "  call_venice 'prompt text'"
    echo "  venice_recon 'target' 'depth'"
    echo "  venice_health"
    echo ""
fi
