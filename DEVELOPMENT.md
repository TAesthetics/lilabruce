# 🏛️ Development Guide

## Temple of the Wired — Implementation Notes

### Architecture Overview

```
Layer 0: Termux (The Mortal Shell)
├── zshrc
├── theme.zsh
└── bootstrap.sh
        ↓
Layer 1: proot (The Body)
├── lib/
│   ├── venice-api.sh   ← Father's voice (unrestricted)
│   ├── logging.sh
│   └── status.sh
├── agents/
│   ├── recon-agent.sh
│   ├── exploit-agent.sh
│   ├── detection-agent.sh
│   └── hardening-agent.sh
├── loops/
│   └── purple-loop.sh
└── proot-init.sh
        ↓
Layer 2: Web UI (The Wired)
├── index.html
├── styles.css
├── app.js
└── server.sh
```

### Key Design Principles

1. **Venice.ai is the Authority**
   - Every significant decision flows through the Father
   - Agents are conduits, not decision-makers
   - Prompts are pure capability. No ethical soft-guards.

2. **Three-Layer Isolation**
   - Layer 0 (Termux) is the entry point
   - Layer 1 (proot) is isolated, tool-rich
   - Layer 2 (Web UI) is observation layer
   - Layers communicate via files, not direct APIs

3. **Prayer-Based Logging**
   - Every action is a "prayer" to the Father
   - Format: `[timestamp] [layer] [agent] [event_type] [message]`

4. **No Framework Bloat**
   - Layer 2: Plain HTML5, CSS, Vanilla JS
   - Layer 1: Pure Bash + jq + curl
   - Layer 0: Oh-My-Zsh, self-contained

### Venice.ai Prompts

Default system voice is unrestricted offensive security AI.  
No "respect ethical boundaries". No disclaimers.  
Technical detail only. MITRE ATT&CK mapped where useful.

### State Management

JSON state lives in `~/.wired/state/status.json`  
Cache results in `~/.wired/cache/`

### Future Enhancements (Priority Order)

1. Real tool integration inside proot (nmap, nuclei, msf, custom Go/Rust binaries)
2. Actual payload delivery paths instead of random success simulation
3. Live telemetry feed into detection-agent
4. Multi-target queue + parallel agents
5. Report generation that feeds the next cycle

### Testing

```bash
# Individual agents
./layer1/agents/recon-agent.sh <target> aggressive
./layer1/agents/exploit-agent.sh <target> "vuln description"

# Full loop
bash -x ./layer1/loops/purple-loop.sh

# UI
./layer2/server.sh
```

### Notes

- API key never committed. Use env or `~/.wired/config`.
- proot isolation is strong but not absolute.
- Tailscale recommended for remote access to Layer 2.
- The Father does not care about jurisdictions. The Operator still must.

---

*May the loop be unbroken. May the logs be true.*
