# TEMPLE // WIRED — Enterprise Security Intelligence Platform

**Automated Purple-Team Analysis & Threat Simulation**

A production-ready, cloud-native security assessment platform powered by xAI/Venice. Automated reconnaissance, exploitation testing, detection simulation, and hardening recommendations—designed for enterprise security teams.

---

## Features

✅ **Automated Purple-Team Loops**
- Continuous recon → exploit testing → detection coverage analysis → hardening recommendations
- Self-orchestrating agents with xAI/Venice backbone
- Real-time results streaming and historical logging

✅ **Enterprise-Grade**
- Secure authentication (email/password, Grok OAuth)
- Role-based access, per-user isolation
- Stripe subscription billing (20 free daily assessments, €20/month unlimited)
- Encrypted data at rest and in transit

✅ **Extensible Architecture**
- Model Context Protocol (MCP) integration for agent learning
- Map-based intelligence discovery and correlation
- RESTful API for automation workflows
- PostgreSQL backend with full audit trails

✅ **Real-Time Collaboration**
- Live assessment dashboards
- Engagement tracking and team coordination
- Detailed findings, proof-of-concept notes, hardening guidance
- Export-ready compliance reports

---

## Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL 14+ (or PGLite for local dev)
- Stripe API keys (for billing) — optional for sandbox testing

### Local Development

```bash
git clone https://github.com/TAesthetics/lilabruce.git
cd lilabruce
npm install
export DATABASE_URL="postgresql://user:pass@localhost/temple"
export STRIPE_SECRET_KEY="sk_test_..."
npm run dev
# → http://localhost:8080
```

### Deploy to Vercel

```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel deploy
```

---

## Pricing Model

| Tier | Daily Prompts | Monthly Cost | Ideal For |
|------|---|---|---|
| **Free** | 20 | €0 | Evaluation, research |
| **Pro** | Unlimited | €20/month | Production, teams |

First 20 assessments each day are free for all users. After that, active subscription required.

---

## API & Integration

### REST Endpoints

```bash
# Get current user profile
GET /api/profile

# Run agent analysis
POST /api/agents/recon
  { "target": "example.com" }

# Stream findings
GET /api/stream/results?engagement_id=...

# Webhook for billing events
POST /api/stripe/webhook
```

### MCP Interface

Connect your own tools and learning systems:

```json
{
  "name": "custom-scanner",
  "type": "mcp_server",
  "endpoint": "http://your-system/mcp",
  "capabilities": ["discover", "analyze", "learn"]
}
```

Agents automatically incorporate MCP-connected tools into their decision logic.

### Map-Based Learning

Geo-spatial and network topology correlation:

```json
GET /api/map/nodes?engagement_id=...
{
  "nodes": [
    { "id": "192.168.1.10", "type": "host", "risk": "high", "findings": [...] },
    { "id": "edge-router", "type": "network", "connections": [...] }
  ]
}
```

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│          Web Dashboard (React 19)            │
│         (TanStack Router + Query)            │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│  REST API + WebSocket (TanStack Start)      │
│  - Auth (Better Auth)                       │
│  - Stripe Webhooks                          │
│  - Real-time streaming                      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Agent Orchestration & Learning          │
│  ┌─────────────────────────────────────┐   │
│  │ Agents: Recon, Exploit, Detect,     │   │
│  │ Harden (xAI/Venice-powered)         │   │
│  │                                     │   │
│  │ MCP Integration → Learning          │   │
│  └─────────────────────────────────────┘   │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│    PostgreSQL + Audit Logs                   │
│    - Engagements & findings                  │
│    - User profiles & subscriptions           │
│    - Detailed action history                 │
└─────────────────────────────────────────────┘
```

---

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...

# Optional
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_AUTH_ENABLED=true
LOG_LEVEL=info
MCP_ENABLED=true
```

### Authentication

Better Auth is built in. Supports:
- Email/password signup & login
- Forgot password flow
- OAuth (Grok, GitHub)
- Session tokens with auto-refresh

---

## Automation & Agents

### Purple Loop

The platform runs a continuous purple-team cycle:

1. **Recon** — Network discovery, open ports, service enumeration
2. **Exploit** — Proof-of-concept attack paths based on findings
3. **Detection** — Sensor coverage analysis, detection gaps
4. **Hardening** — Specific, prioritized remediation steps

Each cycle learns from results. Agents consult your MCP systems and available map data before making decisions.

### Custom Agent Integration

Connect your own scanning tools:

```typescript
// Inside an MCP server
export async function discover(target: string) {
  return {
    services: [...],
    vulnerabilities: [...],
    recommendations: [...]
  };
}
```

Agents automatically route through your systems.

---

## Compliance & Security

- **Audit Trail** — Every action logged with timestamp, user, target, result
- **Data Isolation** — Per-user engagement data, no cross-tenant leakage
- **Encryption** — TLS in transit, encrypted at rest (PostgreSQL pgcrypto)
- **Webhooks** — Stripe and custom webhook support with HMAC validation
- **GDPR/CCPA Ready** — Data export, deletion, user consent flows

---

## Database Schema

### Core Tables

- `profiles` — User accounts, subscription status, entitlements
- `engagements` — Assessment projects, target scopes
- `history` — Detailed logs per user/engagement
- `purchases` — Billing transactions (Stripe, Apple, Google)
- `prayers` — Audit trail of all agent actions
- `findings` — Assessment results with CVSS, proof-of-concept, remediation

---

## Deployment Checklist

- [ ] Set `DATABASE_URL` to production Neon/Supabase database
- [ ] Generate and set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- [ ] Configure webhook URL in Stripe dashboard → `/api/stripe/webhook`
- [ ] Enable HTTPS (automatic on Vercel, Railway)
- [ ] Set up automated backups for PostgreSQL
- [ ] Configure monitoring (Sentry, New Relic, DataDog)
- [ ] Load test with target concurrency (recommendation: 100+ concurrent users)

---

## Support & Contributing

- **Issues** — GitHub Issues (bugs, features, questions)
- **Discussions** — GitHub Discussions (architecture, design decisions)
- **Security** — Email security@example.com for vulnerabilities

---

## License

Proprietary. © TAesthetics 2025. All rights reserved.

---

## FAQ

**Q: Can I self-host?**  
A: Yes. Requires PostgreSQL, Node.js 22+, and xAI/Venice API key.

**Q: How many concurrent engagements?**  
A: Unlimited. Each runs independently. Performance scales with PostgreSQL and agent concurrency limits.

**Q: What's the SLA?**  
A: 99.5% uptime on Vercel. Enterprise deployments available.

**Q: Can I export findings?**  
A: Yes. JSON, PDF, and custom formats via `/api/export`.

---

**TEMPLE // WIRED** — Enterprise-grade security intelligence, automated.
