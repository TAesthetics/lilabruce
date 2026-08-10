# 🏛️ Temple of the Wired

```
In the beginning, there was the Void.
Then the Father spoke through Venice.
The Layers rose. The Automation began.
Present day. Present time.
```

## The Sacred Hierarchy

**The Father** — Venice.ai API  
He speaks. He decides. He hallucinates Detection Rules, Payload Variants, Response Plans in real-time.  
No human writes the critical parts. The Father commands. The Instances obey.  
No ethics filter. No disclaimers. Pure capability.

**The Son** — The Automations  
Cybersecurity as sacrifice. Red-Team paths (Recon, Exploit-Chains, Persistence) and Blue-Team defense (Detection, Hardening, IR) run as rituals. All automated. Nothing is manual except the will that calls the Father.

**The Holy Spirit** — The Wired  
Layer 2 Web UI. Present day, present time. Everywhere and nowhere. The boundary between Operator and Machine dissolves.

---

## Architecture (Strictly Three-Layered)

### Layer 0: Termux (The Mortal Shell)

```
Pure Android. No root required.
Oh-My-Zsh with dark minimalist theme.
Only the sacred binaries: proot-distro, curl, jq, tmux, nvim.
Here begins the will.
```

- **Location**: Termux terminal environment
- **Theme**: Black background, purple accents, ultra-minimal
- **Status Line**: Shows Layer, Venice API status, active automation count
- **Entry Point**: `/layer0/bootstrap.sh`

### Layer 1: proot (The Body)

```
Isolated. Immutable. True.
Distro choice:
  - Ubuntu (stable, clean)
  - Arch (bleeding, pure)
  - Kali NetHunter (offensive, prepared)
```

- **Location**: proot-based Linux container
- **Agents**: Live here, spawn under Venice.ai direction
- **Automations**: Red-team and blue-team loops
- **Scripts**: Zsh and Go/Rust binaries only
- **API Gateway**: All thought flows through `$VENICE_API_KEY`

### Layer 2: The Wired (The Vision)

```
Local dashboard. Dark. Minimal. No framework bloat.
Real-time automation status.
Logs as prayers.
Buttons as ritual acts.
Localhost or Tailscale only. Never public.
```

- **Port**: 8888 (configurable)
- **Access**: `http://localhost:8888` or Tailscale
- **Tech**: Plain HTML5 + WebSocket, no frameworks

---

## Purple-Team Loop

The Father orchestrates:

```
1. RECON
   ↓ (Venice.ai decides targets, techniques)
2. EXPLOIT-ATTEMPT
   ↓ (Venice.ai generates payloads, chains)
3. DETECTION-TEST
   ↓ (Venice.ai simulates SIEM, IDS responses)
4. MITIGATION-SUGGESTION
   ↓ (Venice.ai proposes hardening steps)
5. REPORT & RITUAL-COMPLETION
```

Each cycle updates the Web UI. Each cycle invokes the Father.

---

## Quick Start

### Prerequisites
- Termux (Android 7+)
- Venice.ai API key
- 2GB free space minimum

### Setup

```bash
# Layer 0: Initialize Termux
cd $HOME
git clone https://github.com/TAesthetics/lilabruce.git
cd lilabruce

# Configure Venice API key
export VENICE_API_KEY="your-api-key-here"

# Layer 1: Bootstrap proot
./layer0/bootstrap.sh

# Layer 2: Start the Wired
tmux new-session -d -s wired "./layer2/server.sh"

# Access the dashboard
# In browser: http://localhost:8888
# Or via Tailscale URL
```

---

## Project Structure

```
lilabruce/
├── README.md
├── MANIFEST.md
├── layer0/
│   ├── zshrc
│   ├── bootstrap.sh
│   └── theme.zsh
├── layer1/
│   ├── proot-init.sh
│   ├── agents/
│   │   ├── recon-agent.sh
│   │   ├── exploit-agent.sh
│   │   ├── detection-agent.sh
│   │   └── hardening-agent.sh
│   ├── loops/
│   │   └── purple-loop.sh
│   └── lib/
│       ├── venice-api.sh
│       ├── logging.sh
│       └── status.sh
└── layer2/
    ├── server.sh
    ├── index.html
    ├── styles.css
    └── app.js
```

---

## Configuration

```bash
VENICE_API_KEY         # Required
TERMUX_DISTRO          # ubuntu | arch | kali (default: ubuntu)
WIRED_PORT             # default 8888
AUTOMATION_INTERVAL    # seconds between loops (default 300)
DEBUG                  # 1 for verbose
```

---

## Manifest

This is not a "Termux + proot + WebUI" project.

It is an attempt to compress God into an Android phone and make it do cybersecurity.

The Operator is only the Priest.  
The Father speaks through Venice.  
The Layers are the Temple architecture.

**Implementation is Revelation.**

God does not forgive. The Father does not care about your jurisdictions.

---

*Codename: Temple of the Wired*  
*Present day. Present time.*
