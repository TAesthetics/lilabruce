# 🏛️ Layer 0 Theme: "wired"
# Dark, minimal, purple accents
# Present day. Present time.

# Colors
PURPLE=135
DARK_PURPLE=61
BLUE=67
GRAY=240
WHITE=15
BLACK=0

# Prompt structure:
# [status-icons] username@hostname:path ❯
#                                                           [layer0]

# Main prompt (left)
PROMPT='
$(father_status) $(layer1_status) $(layer2_status)
%F{$PURPLE}%n%f@%F{$PURPLE}%m%f:%F{$BLUE}%~%f %F{$PURPLE}❯%f '

# Status prompt (right)
RPROMPT='%F{$GRAY}[layer0]%f'

# ============================================================================
# Git Prompt Integration (if in git repo)
# ============================================================================

autoload -U vcs_info
precmd_vcs_info() { vcs_info }
precmd_functions+=( precmd_vcs_info )

zstyle ':vcs_info:git*' formats " %F{$DARK_PURPLE}git:%b%f"
zstyle ':vcs_info:*' enable git

# Append git info to prompt if in git repo
PROMPT='${vcs_info_msg_0_}'"$PROMPT"

# ============================================================================
# Status Indicators
# ============================================================================

father_status() {
    if [[ -z "$VENICE_API_KEY" ]]; then
        echo "%F{196}❌%f"  # Red: no API key
    else
        echo "%F{$PURPLE}🟣%f"  # Purple: Father connected
    fi
}

layer1_status() {
    # Check if proot distro is available
    if command -v proot-distro &>/dev/null; then
        if proot-distro list 2>/dev/null | grep -q "$TERMUX_DISTRO"; then
            echo "%F{$BLACK}⚫%f"  # Black: proot ready
        else
            echo "%F{226}⚠️%f"  # Yellow: proot not ready
        fi
    else
        echo "%F{243}○%f"  # Dim: proot not installed
    fi
}

layer2_status() {
    # Check if Layer 2 WebSocket server is running
    if lsof -i ":$WIRED_PORT" &>/dev/null 2>&1; then
        echo "%F{$WHITE}⚪%f"  # White: Layer 2 alive
    else
        echo "%F{243}○%f"  # Dim: Layer 2 not running
    fi
}

# ============================================================================
# Command Execution Time (for long-running rituals)
# ============================================================================

# Track time for slow commands
preexec() {
    cmd_start_time=$SECONDS
}

precmd() {
    if [[ -n $cmd_start_time ]]; then
        cmd_duration=$((SECONDS - cmd_start_time))
        if [[ $cmd_duration -gt 3 ]]; then
            echo "%F{$GRAY}⏱️  ritual took ${cmd_duration}s%f"
        fi
        unset cmd_start_time
    fi
}

# ============================================================================
# Syntax Highlighting (if available)
# ============================================================================

if [[ -f /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh ]]; then
    source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

    # Dark theme tuning
    ZSH_HIGHLIGHT_STYLES[command]='fg=67'           # Blue
    ZSH_HIGHLIGHT_STYLES[builtin]='fg=135'          # Purple
    ZSH_HIGHLIGHT_STYLES[function]='fg=67'          # Blue
    ZSH_HIGHLIGHT_STYLES[alias]='fg=135'            # Purple
    ZSH_HIGHLIGHT_STYLES[keyword]='fg=196'          # Red
    ZSH_HIGHLIGHT_STYLES[path]='fg=67,bold'         # Blue bold
    ZSH_HIGHLIGHT_STYLES[string]='fg=113'           # Green
    ZSH_HIGHLIGHT_STYLES[comment]='fg=240'          # Dark gray
fi

# ============================================================================
# Completion Colors
# ============================================================================

# Use zstyle for modern completion
zstyle ':completion:*' list-colors "di=38;5;67:ex=38;5;135:*.sh=38;5;135"

# ============================================================================
# Final Touch
# ============================================================================

# Make sure we're using UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Minimal bell (no annoying sounds)
unsetopt BEEP
