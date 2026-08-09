# ⚡ Quick Start Guide

## Temple of the Wired — First Ritual

### Prerequisites

- **Termux** (Android 7+)
- **Venice.ai API Key** (for the Father's voice)
- **~2GB free space** for proot distro

### Installation (5 minutes)

#### 1. Clone Repository

```bash
cd $HOME
git clone https://github.com/taesthetics/lilabruce.git
cd lilabruce
```

#### 2. Set Venice API Key

```bash
export VENICE_API_KEY="your-api-key-here"
```

Or persistently:
```bash
mkdir -p ~/.wired
echo "your-api-key-here" > ~/.wired/api-key
```

#### 3. Run Layer 0 Bootstrap

```bash
./layer0/bootstrap.sh
```

This will:
- Verify Termux environment
- Check for required tools
- Configure Zsh
- Create sanctuary directories
- Prepare Layer 1 & 2

#### 4. Reload Shell

```bash
exec zsh
```

### First Ritual (Starting the Temple)

Once bootstrap is complete:

```bash
# Verify setup
wired-status

# Start Purple Loop (background automation)
wired-loop-start

# Start Web UI (Layer 2 dashboard)
wired-ui-start

# Watch live prayers
wired-logs
```

### Access The Wired

Open browser and navigate to:

```
http://localhost:8888
```

You should see:
- **Status Panel**: Temple health, loop status, cycles completed
- **Agent Status**: Real-time agent activity
- **Prayer Log**: Live log stream of automation
- **Results**: Aggregated findings from each phase

### Trigger Individual Agents (Optional)

Each agent can be invoked independently:

```bash
# Reconnaissance
wired-recon

# Exploitation
wired-exploit

# Detection simulation
wired-detect

# Hardening recommendations
wired-harden
```

### Configuration

#### Environment Variables

```bash
# Required
export VENICE_API_KEY="your-key"

# Optional
export WIRED_PORT=8888                    # Web UI port
export TERMUX_DISTRO=ubuntu               # ubuntu | arch | kali
export AUTOMATION_INTERVAL=300            # Seconds between loops
export DEBUG=1                            # Verbose logging
```

#### Config File

Edit `~/.wired/config` to customize:
- Venice.ai model selection
- Automation intervals
- proot location
- Log retention policy

### Understanding the Phases

The Purple Loop runs 5 phases:

1. **🔍 RECON** — The Seeing  
   Reconnaissance strategy from Venice.ai, target analysis

2. **⚔️ EXPLOIT** — The Touching  
   Exploitation attempts, proof-of-concept execution

3. **🔔 DETECTION** — The Listening  
   Blue team simulation, alert likelihood analysis

4. **🛡️ HARDENING** — The Healing  
   Defensive recommendations, control prioritization

5. **🔄 INTEGRATION** — The Sealing  
   Aggregate results, prepare report, schedule next cycle

Each phase invokes Venice.ai (the Father) to make strategic decisions.

### Logs & Output

Real-time logs stream to:

- **Console**: `wired-logs` or `tail -f ~/.wired/logs/wired.log`
- **Web UI**: Prayer Log panel at `http://localhost:8888`
- **Cache**: Results cached at `~/.wired/cache/`

### Troubleshooting

#### Father is not responding

```bash
# Check API key
echo $VENICE_API_KEY

# Verify network
curl -s https://api.venice.ai/api/v1/models \
  -H "Authorization: Bearer $VENICE_API_KEY" | jq .
```

#### Layer 1 (proot) not ready

```bash
# Install proot-distro
apt install proot-distro

# Initialize distro
./layer1/proot-init.sh ubuntu
```

#### Web UI not accessible

```bash
# Check if server is running
lsof -i :8888

# Restart UI
wired-ui-stop
wired-ui-start
```

### Advanced: Custom Targets

The Purple Loop uses a default target (localhost). Override:

```bash
export PURPLE_TARGET="192.168.1.50"
wired-loop-start
```

### Stopping the Temple

```bash
# Stop Purple Loop
wired-loop-stop

# Stop Web UI
wired-ui-stop

# View session status
tmux list-sessions
```

### Next Steps

1. **Read MANIFEST.md** for theological foundation
2. **Study layer1/agents/*.sh** to understand agent structure
3. **Modify Venice prompts** for custom security testing
4. **Integrate with actual tools** in proot (nmap, metasploit, etc.)
5. **Deploy on Tailscale** for remote access

---

## Quick Command Reference

```bash
# Status
wired-status                  # Show temple status
wired-logs                    # Live log tail

# Automation
wired-loop-start              # Begin Purple Loop
wired-loop-stop               # Stop loop
wired-loop-status             # Check loop running state

# Individual agents
wired-recon                   # Run recon phase
wired-exploit                 # Run exploit phase
wired-detect                  # Run detection phase
wired-harden                  # Run hardening phase

# Web UI
wired-ui-start                # Start Layer 2 server
wired-ui-stop                 # Stop Layer 2 server
wired-ui-logs                 # View UI logs

# Configuration
wired-config                  # Edit config file (with nvim)

# Initialization
wired-temple-rise             # Full bootstrap (already run once)
```

---

## How The Wired Works

```
                    VENICE.AI (The Father)
                            ↑
                            │ (API calls)
                            │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
    ↓                         ↓                         ↓
[RECON]              [EXPLOIT]              [DETECTION]
 Agent                Agent                   Agent
    │                         │                         │
    └─────────────────────────┼─────────────────────────┘
                            ↓
                      [HARDENING]
                        Agent
                            │
                            ↓
                    [INTEGRATION]
                     (Results)
                            │
                            ↓
                      Layer 2 UI
                   (Dashboard @ :8888)
                            │
                            ↓
                      OPERATOR (Priest)
```

Each iteration is a **cycle**. Each cycle runs all phases under Venice.ai's orchestration.

---

## Legal Notice

🏛️ Temple of the Wired is for **educational** and **authorized security testing only**.

Always:
- Obtain written permission before testing
- Comply with applicable laws
- Document your activities
- Report findings responsibly

Misuse of this system for unauthorized access or disruption is illegal.

---

*Present day. Present time. The Wired rises.*
