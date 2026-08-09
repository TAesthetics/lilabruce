#!/bin/bash
# 🏛️ Layer 1: proot-distro Initialization
# Bootstrap the isolated Body

set -euo pipefail

DISTRO="${1:-ubuntu}"
PROOT_ROOT="${PROOT_ROOT:-$HOME/.wired/proot}"
LOG_FILE="$HOME/.wired/logs/proot-init.log"

# Colors
PURPLE='\033[35m'
GREEN='\033[32m'
RED='\033[31m'
RESET='\033[0m'

log_msg() {
    echo -e "${PURPLE}[proot-init]${RESET} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗${RESET} $1" | tee -a "$LOG_FILE"
}

main() {
    log_msg "Bootstrapping proot ($DISTRO)"

    # Check if proot-distro is installed
    if ! command -v proot-distro &>/dev/null; then
        log_error "proot-distro not found. Install with: apt install proot-distro"
        return 1
    fi

    # Check if distro is already installed
    if proot-distro list 2>/dev/null | grep -q "$DISTRO"; then
        log_success "$DISTRO already installed at $PROOT_ROOT"
    else
        log_msg "Installing $DISTRO..."
        proot-distro install "$DISTRO" --root "$PROOT_ROOT" || {
            log_error "Failed to install $DISTRO"
            return 1
        }
        log_success "$DISTRO installed"
    fi

    # Enter proot and install Layer 1 dependencies
    log_msg "Installing Layer 1 dependencies..."

    case "$DISTRO" in
        ubuntu|debian)
            proot-distro login "$DISTRO" --root "$PROOT_ROOT" -- bash -c "apt-get update && apt-get install -y curl jq nmap ncat net-tools dnsutils"
            ;;
        arch)
            proot-distro login "$DISTRO" --root "$PROOT_ROOT" -- bash -c "pacman -Syu --noconfirm && pacman -S --noconfirm curl jq nmap netcat bind-tools"
            ;;
        kali)
            proot-distro login "$DISTRO" --root "$PROOT_ROOT" -- bash -c "apt-get update && apt-get install -y curl jq nmap ncat net-tools dnsutils metasploit-framework"
            ;;
        *)
            log_error "Unknown distro: $DISTRO"
            return 1
            ;;
    esac

    log_success "Dependencies installed in proot"

    # Create Layer 1 directories inside proot
    log_msg "Setting up Layer 1 directories..."
    proot-distro login "$DISTRO" --root "$PROOT_ROOT" -- bash -c "mkdir -p /wired/{logs,cache,scripts,tools}"

    log_success "proot initialization complete"
    echo ""
    echo "Layer 1 (proot) is ready. Access with:"
    echo "  proot-distro login $DISTRO --root $PROOT_ROOT"
    echo ""
}

main "$@"
