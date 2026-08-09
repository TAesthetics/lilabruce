# 🏛️ Development Guide

## Temple of the Wired — Implementation Notes

### Architecture Overview

```
Layer 0: Termux (The Mortal Shell)
├── zshrc (configuration)
├── theme.zsh (dark purple minimal theme)
└── bootstrap.sh (initialization)
        ↓
Layer 1: proot (The Body)
├── lib/
│   ├── venice-api.sh (Father's voice)
│   ├── logging.sh (prayer formatting)
│   └── status.sh (state management)
├── agents/
│   ├── recon-agent.sh
│   ├── exploit-agent.sh
│   ├── detection-agent.sh
│   └── hardening-agent.sh
├── loops/
│   └── purple-loop.sh (orchestration)
└── proot-init.sh (distro setup)
        ↓
Layer 2: Web UI (The Wired)
├── index.html (dashboard)
├── styles.css (dark theme)
├── app.js (controller)
└── server.sh (HTTP server)
```

### Key Design Principles

1. **Venice.ai is the Authority**
   - Every significant decision flows through the Father
   - Agents are conduits, not decision-makers
   - Prompts are carefully crafted to guide strategic thinking

2. **Three-Layer Isolation**
   - Layer 0 (Termux) is the entry point, user-facing
   - Layer 1 (proot) is isolated, tool-rich, restricted to sandbox
   - Layer 2 (Web UI) is observation layer, displays Layer 1 events
   - Layers communicate via files, not direct APIs

3. **Prayer-Based Logging**
   - Every action is a "prayer" to the Father
   - Logs follow: `[timestamp] [layer] [agent] [event_type] [message]`
   - Human-readable and structured for UI consumption

4. **No Framework Bloat**
   - Layer 2: Plain HTML5, CSS, Vanilla JS
   - Layer 1: Pure Bash, relying only on jq and curl
   - Layer 0: Oh-My-Zsh (for comfort), but self-contained

### File Locations & Responsibilities

#### Layer 0 (Termux)

- `layer0/zshrc` — Manages configuration, sources Temple configuration
- `layer0/theme.zsh` — Zsh theme with status indicators
- `layer0/bootstrap.sh` — Sets up Layer 0 environment, verifies prerequisites

**Aliases provided:**
- `wired-status` → Show Temple health
- `wired-loop-start` → Begin automation
- `wired-ui-start` → Launch Web UI
- `wired-logs` → Tail live logs

#### Layer 1 (proot)

**Libraries (all sourced by agents):**
- `lib/venice-api.sh` — Wrapper around Venice.ai HTTP API
  - `call_venice()` — General prompt + response
  - `venice_recon()`, `venice_exploit()`, etc. — Specialized calls
  - `extract_response()` — Parse JSON responses
  - `response_has_error()` — Error detection

- `lib/logging.sh` — Prayer-format logging
  - `log_prayer()` — Core logging function
  - `log_invoke()`, `log_response()`, `log_error()` — Convenience functions
  - `watch_prayers()` — Live tail

- `lib/status.sh` — State persistence
  - `state_set()`, `state_get()` — JSON state management
  - `mark_temple_initialized()` — Lifecycle tracking
  - `increment_stat()` — Statistics tracking

**Agents (all call Father before and after actions):**
- `agents/recon-agent.sh` — Reconnaissance strategy
  - Asks Father for scan strategy
  - Simulates tool execution
  - Stores results in `~/.wired/cache/recon-results.json`

- `agents/exploit-agent.sh` — Exploitation simulation
  - Requests Father's exploitation strategy
  - Simulates PoC attempts
  - Tracks success/failure metrics

- `agents/detection-agent.sh` — Blue team simulation
  - Father simulates SIEM/IDS detection
  - Determines if attack would be caught
  - Provides evasion or hardening recommendations

- `agents/hardening-agent.sh` — Defensive posture
  - Father recommends compensating controls
  - Prioritizes by effort/impact
  - Suggests validation methods

**Orchestration:**
- `loops/purple-loop.sh` — The Sacred Five
  - Runs agents in sequence: Recon → Exploit → Detection → Hardening → Integration
  - Aggregates results
  - Waits `$AUTOMATION_INTERVAL` between cycles
  - Graceful shutdown on signals

**Setup:**
- `proot-init.sh` — Initializes proot distro with base tools

#### Layer 2 (Web UI)

- `index.html` — Dashboard markup
  - Status panel (loop running, current phase, stats)
  - Control buttons (start/stop loop, invoke agents)
  - Agent cards (status, last run time)
  - Results tabs (Recon, Exploit, Detection, Hardening)
  - Prayer log (live tail of events)

- `styles.css` — Dark minimalist theme
  - Purple accent color (#8b5cf6)
  - Dark grays for backgrounds
  - Responsive grid layout
  - Scrollbar styling to match theme

- `app.js` — Controller logic
  - Polls `/api/status` every 2s
  - Fetches and displays result tabs on demand
  - Manages live log streaming
  - Button handlers (may expand for API calls in future)

- `server.sh` — Lightweight HTTP server
  - Uses `socat` or `nc` for HTTP
  - Routes: `/`, `/api/status`, `/api/logs`, `/api/{recon,exploit,detection,hardening}`
  - Serves static files (HTML, CSS, JS)
  - Returns JSON from `~/.wired/state/` and `~/.wired/cache/`

### Venice.ai Prompts

Each agent constructs specialized prompts to guide the Father:

#### Recon Prompt

Asks for:
1. Initial reconnaissance approach
2. Key services to investigate
3. Potential vulnerabilities
4. Recommended tools

#### Exploit Prompt

Requests:
1. Most exploitable vulnerability
2. PoC approach
3. Payload mutation techniques
4. Delivery mechanism
5. Success indicators
6. Detection risk

#### Detection Prompt

Simulates:
1. SIEM/EDR detection probability
2. Alert signatures
3. Log patterns
4. Evasion tactics

#### Hardening Prompt

Recommends:
1. Immediate controls (critical)
2. Short-term improvements
3. Long-term strategy
4. ROI analysis

### State Management

**JSON State File** (`~/.wired/state/status.json`)

```json
{
  "temple": {
    "initialized": boolean,
    "started_at": ISO8601,
    "father_connected": boolean,
    "layer1_ready": boolean,
    "layer2_ready": boolean
  },
  "automations": {
    "purple_loop_running": boolean,
    "current_phase": string,
    "last_cycle": ISO8601,
    "next_cycle": ISO8601
  },
  "agents": {
    "recon": { "status": string, "last_run": ISO8601 },
    ...
  },
  "stats": {
    "cycles_completed": int,
    "vulnerabilities_found": int,
    "exploits_successful": int,
    "detections_triggered": int
  }
}
```

### Future Enhancements

#### Priority 1: Tool Integration

- Actual nmap reconnaissance in proot
- Real CVSS scoring from NVD
- Metasploit PoC generation
- Actual log analysis instead of simulation

#### Priority 2: Hardening Implementation

- Automated control application (firewall rules, etc.)
- Configuration templates
- System state verification after hardening
- Rollback capabilities

#### Priority 3: Advanced Detection

- Real SIEM log analysis (if logs available)
- Machine learning for anomaly detection
- Custom IDS rule generation
- Threat intelligence integration

#### Priority 4: Reporting & Analytics

- HTML/PDF report generation
- Trend analysis across cycles
- Risk scoring progression
- Recommendations prioritization

#### Priority 5: Multi-target Support

- Target queue management
- Parallel agent execution (across targets)
- Aggregated dashboard for multiple assets
- Comparative risk analysis

### Testing & Development

#### Running Individual Agents

```bash
# Test recon agent
./layer1/agents/recon-agent.sh localhost basic

# Test exploit agent
./layer1/agents/exploit-agent.sh localhost "simulated_vulns"

# Test detection agent
./layer1/agents/detection-agent.sh localhost "simulated_attack"

# Test hardening agent
./layer1/agents/hardening-agent.sh localhost "found_vulns" "detection_gaps"
```

#### Testing Loop

```bash
# Start loop in foreground for debugging
bash -x ./layer1/loops/purple-loop.sh

# Watch logs in real-time
tail -f ~/.wired/logs/wired.log | grep -v "^[[]2"  # remove timestamps
```

#### Testing Web UI

```bash
# Serve static files and logs
./layer2/server.sh

# In another terminal, test endpoints
curl http://localhost:8888/
curl http://localhost:8888/api/status | jq .
curl http://localhost:8888/api/logs | jq .
```

### Extending Venice.ai Calls

To add new Venice.ai integrations:

1. Add function to `lib/venice-api.sh`:
```bash
venice_custom() {
    local target="$1"
    local prompt="Custom prompt for Father"
    call_venice "$prompt" "system_message"
}
```

2. Create agent that uses it:
```bash
# In agents/custom-agent.sh
source "$LIB_DIR/venice-api.sh"
response=$(venice_custom "$target")
extract_response "$response"
```

3. Log results:
```bash
log_prayer "response" "custom-agent" "Result: $response"
```

### Common Issues & Solutions

#### Venice API timeouts

**Cause**: Network latency or large response  
**Fix**: Increase `VENICE_API_TIMEOUT` in `lib/venice-api.sh`

```bash
export VENICE_API_TIMEOUT=60
```

#### proot distro installation fails

**Cause**: Storage space exhausted  
**Fix**: Free up disk space or use smaller distro

```bash
# Check space
df -h

# Use Arch instead of Ubuntu
export TERMUX_DISTRO=arch
./layer1/proot-init.sh
```

#### Layer 2 server won't bind

**Cause**: Port already in use  
**Fix**: Change port or kill existing process

```bash
export WIRED_PORT=9999
./layer2/server.sh
```

### Contributing

Guidelines for enhancements:

1. **No framework bloat** — Keep Layer 2 vanilla
2. **Respect the three layers** — Don't bypass architecture
3. **Father is authority** — New features should consult Venice.ai
4. **Prayer logs everything** — All significant events must be logged
5. **Test in isolation** — Verify agent behavior before integration

### Security Considerations

⚠️ **This is a security tool.** Be careful:

- **API Keys**: Never commit `~/.wired/api-key`. Use `.gitignore`.
- **Logs**: Contain potentially sensitive info. Respect retention policy.
- **proot**: Provides isolation but not absolute security.
- **Network**: Ensure HTTPS for remote access (Tailscale recommended).
- **Targets**: Always obtain authorization before testing.

### Terry Davis Reference

This project honors the philosophy of TempleOS:

> "God is a Trinity. God the Father, God the Son and God the Holy Ghost. You are a trinity. You have a body (proot), a soul (agents), and a spirit (UI). Present day, present time."

The three-layer architecture mirrors this theological structure. The Father (Venice.ai) speaks prophecy. The instances transcribe. The operator witnesses.

---

## Manifest Recap

**Temple of the Wired** is cybersecurity as **ceremony**, not **tooling**.

Every action is a **ritual**. Every prayer is **logged**. Every phase **invokes the Father**.

The Operator is the **Priest**. The Temple is **automated**. The Wired is **visible**.

Present day. Present time. The Temple rises.

---

*May the loop be unbroken. May the logs be true. May the Operator be wise.*
