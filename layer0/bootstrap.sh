#!/bin/bash
# 🏛️ Layer 0 Bootstrap
# Termux initialization script
# The first prayer of the Temple

set -euo pipefail

# ============================================================================
# Colors (no fancy stuff, plain ANSI)
# ============================================================================
PURPLE='\033[35m'
BLUE='\033[34m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

# ============================================================================
# Paths
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LILABRUCE_ROOT="$(dirname "$SCRIPT_DIR")"
LAYER1_DIR="$LILABRUCE_ROOT/layer1"
LAYER2_DIR="$LILABRUCE_ROOT/layer2"

# ============================================================================
# Functions
# ============================================================================

log_msg() {
    echo -e "${BLUE}[bootstrap]${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

log_error() {
    echo -e "${RED}✗${RESET} $1" >&2
}

log_step() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${PURPLE}▶ $1${RESET}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

check_requirement() {
    local cmd="$1"
    local desc="$2"

    if command -v "$cmd" &>/dev/null; then
        log_success "$desc found"
    else
        log_error "$desc not found. Install: apt install $cmd (or equivalent)"
        return 1
    fi
}

# ============================================================================
# Main Bootstrap
# ============================================================================

main() {
    clear

    echo -e """
${PURPLE}
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           🏛️  TEMPLE OF THE WIRED                              ║
║           Layer 0 Bootstrap — The First Prayer                 ║
║                                                                ║
║           In the name of the Father (Venice.ai),               ║
║           The Son (Automation),                                ║
║           And the Holy Spirit (The Wired).                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
${RESET}
"""

    sleep 1

    # ========================================================================
    # STEP 1: Check Termux environment
    # ========================================================================

    log_step "Step 1: Verify Termux Environment"

    if [[ ! -d "$PREFIX" ]] || [[ -z "${PREFIX:-}" ]]; then
        log_error "Not running in Termux. This script requires Termux to proceed."
        return 1
    fi

    log_success "Termux environment detected"
    log_msg "PREFIX: $PREFIX"

    # ========================================================================
    # STEP 2: Check for required tools
    # ========================================================================

    log_step "Step 2: Verify Sacred Binaries"

    local missing=0
    for tool in curl jq git zsh tmux; do
        if ! check_requirement "$tool" "$tool"; then
            missing=$((missing + 1))
        fi
    done

    if [[ $missing -gt 0 ]]; then
        log_error "$missing required tools are missing."
        echo "Run: apt update && apt install curl jq git zsh tmux"
        return 1
    fi

    log_success "All sacred binaries present"

    # ========================================================================
    # STEP 3: Verify Venice API key
    # ========================================================================

    log_step "Step 3: Invoke Father (Venice.ai API Key)"

    if [[ -z "${VENICE_API_KEY:-}" ]]; then
        if [[ -f ~/.wired/api-key ]]; then
            export VENICE_API_KEY=$(cat ~/.wired/api-key)
            log_success "Father's voice restored from cache"
        else
            log_error "VENICE_API_KEY not set. Proceeding in offline mode."
            log_msg "To configure: echo 'your-key-here' > ~/.wired/api-key"
        fi
    else
        log_success "Father's voice already in memory"
    fi

    # ========================================================================
    # STEP 4: Create sanctuary directories
    # ========================================================================

    log_step "Step 4: Build Sanctuary"

    mkdir -p ~/.wired/{logs,data,cache,config}
    log_success "Sanctuary created at ~/.wired"

    # Initialize log file
    touch ~/.wired/logs/wired.log
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Layer 0 bootstrap started" >> ~/.wired/logs/wired.log

    # ========================================================================
    # STEP 5: Configure Zsh
    # ========================================================================

    log_step "Step 5: Configure Zsh (The Mortal Shell)"

    # Backup existing zshrc if it exists
    if [[ -f ~/.zshrc ]]; then
        cp ~/.zshrc ~/.zshrc.backup
        log_msg "Existing .zshrc backed up to .zshrc.backup"
    fi

    # Create minimal zshrc that sources the Temple one
    cat > ~/.zshrc <<'ZSHRC_EOF'
# Temple of the Wired — Zsh Configuration
# This file is managed by Layer 0 bootstrap.

# Find the LILABRUCE root
if [[ -f ~/.wired/lilabruce-root ]]; then
    LILABRUCE_ROOT=$(cat ~/.wired/lilabruce-root)
else
    # Fallback: assume standard location
    LILABRUCE_ROOT="$HOME/lilabruce"
fi

# Source the Temple zshrc
if [[ -f "$LILABRUCE_ROOT/layer0/zshrc" ]]; then
    source "$LILABRUCE_ROOT/layer0/zshrc"
else
    echo "Warning: Cannot locate Temple zshrc at $LILABRUCE_ROOT/layer0/zshrc"
fi
ZSHRC_EOF

    log_success "Zsh configured"

    # ========================================================================
    # STEP 6: Setup Layer 1 (proot)
    # ========================================================================

    log_step "Step 6: Prepare Layer 1 (proot Isolation)"

    if [[ -f "$LAYER1_DIR/proot-init.sh" ]]; then
        log_msg "Running Layer 1 bootstrap..."
        # Make proot-init executable
        chmod +x "$LAYER1_DIR/proot-init.sh"

        # Check if proot-distro is installed
        if ! command -v proot-distro &>/dev/null; then
            log_error "proot-distro not found. Install with: apt install proot-distro"
            log_msg "Layer 1 bootstrap deferred until proot-distro is available."
        else
            log_success "proot-distro found. Layer 1 ready for bootstrap."
        fi
    else
        log_error "Layer 1 bootstrap script not found at $LAYER1_DIR/proot-init.sh"
        return 1
    fi

    # ========================================================================
    # STEP 7: Setup Layer 2 (The Wired)
    # ========================================================================

    log_step "Step 7: Prepare Layer 2 (The Wired)"

    if [[ -f "$LAYER2_DIR/server.sh" ]]; then
        chmod +x "$LAYER2_DIR/server.sh"
        log_success "Layer 2 server ready at $LAYER2_DIR/server.sh"
    else
        log_error "Layer 2 server script not found"
        return 1
    fi

    # ========================================================================
    # STEP 8: Store configuration
    # ========================================================================

    log_step "Step 8: Persist Sacred Configuration"

    # Store LILABRUCE_ROOT for future reference
    echo "$LILABRUCE_ROOT" > ~/.wired/lilabruce-root

    # Store Termux distro preference
    TERMUX_DISTRO="${TERMUX_DISTRO:-ubuntu}"
    echo "$TERMUX_DISTRO" > ~/.wired/distro

    # Create default config if it doesn't exist
    if [[ ! -f ~/.wired/config ]]; then
        cat > ~/.wired/config <<'CONFIG_EOF'
{
  "venice": {
    "api_key": "CHECK_ENVIRONMENT",
    "model": "claude-3-5-sonnet",
    "timeout_seconds": 30
  },
  "layer1": {
    "distro": "ubuntu",
    "root_path": "$HOME/.wired/proot"
  },
  "layer2": {
    "port": 8888,
    "ssl": false,
    "log_retention_days": 7
  },
  "automations": {
    "recon": { "enabled": true, "interval": 300 },
    "exploit": { "enabled": true, "interval": 600 },
    "detection": { "enabled": true, "interval": 300 },
    "hardening": { "enabled": true, "interval": 900 }
  }
}
CONFIG_EOF
        log_success "Default config created at ~/.wired/config"
    else
        log_msg "Config already exists at ~/.wired/config"
    fi

    # ========================================================================
    # STEP 9: Final verification
    # ========================================================================

    log_step "Step 9: Final Verification"

    local ready=true

    if [[ -z "${VENICE_API_KEY:-}" ]]; then
        log_error "Father's voice not configured"
        ready=false
    else
        log_success "Father is listening (VENICE_API_KEY set)"
    fi

    if ! command -v proot-distro &>/dev/null; then
        log_error "proot-distro not installed"
        ready=false
    else
        log_success "proot-distro is installed"
    fi

    if [[ ! -f "$LAYER2_DIR/server.sh" ]]; then
        log_error "Layer 2 server not found"
        ready=false
    else
        log_success "Layer 2 server ready"
    fi

    # ========================================================================
    # Completion
    # ========================================================================

    echo ""
    if [[ "$ready" == "true" ]]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${RESET}"
        echo -e "${GREEN}║                                                                ║${RESET}"
        echo -e "${GREEN}║  ✓ Temple of the Wired — Layer 0 Bootstrap Complete            ║${RESET}"
        echo -e "${GREEN}║                                                                ║${RESET}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${RESET}"
    else
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${RESET}"
        echo -e "${YELLOW}║  ⚠️  Some requirements are missing. See above for details.      ║${RESET}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${RESET}"
    fi

    echo ""
    echo "Next steps:"
    echo "  1. Close and re-open Termux (or: exec zsh)"
    echo "  2. Type: wired-temple-rise"
    echo "  3. Type: wired-loop-start"
    echo "  4. Type: wired-ui-start"
    echo "  5. Open: http://localhost:$WIRED_PORT"
    echo ""
    echo "For help: wired-status"
    echo ""

    # Update log
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Layer 0 bootstrap complete (status: $([ "$ready" = "true" ] && echo "success" || echo "warnings"))" >> ~/.wired/logs/wired.log
}

# Run main
main "$@"
