/**
 * 🏛️ TEMPLE // WIRED — Console v3.2
 * Quality build + alpha feedback
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8888;
const COOKIE_NAME = 'temple_sid';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'temple.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    venice_key TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS engagements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    client TEXT DEFAULT '',
    scope TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    engagement_id TEXT,
    kind TEXT NOT NULL,
    target TEXT,
    content TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    rating INTEGER,
    category TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const runtime = {
  temple: { father_connected: false, started_at: new Date().toISOString() },
  loops: {},
  agents: {},
  results: {},
  prayers: {},
  stats: {},
  currentEngagement: {}
};

function ensureUserRuntime(uid) {
  if (!runtime.loops[uid]) {
    runtime.loops[uid] = { running: false, current_phase: 'idle', cycle: 0, target: 'localhost' };
    runtime.agents[uid] = {
      recon: { status: 'idle', last_run: null },
      exploit: { status: 'idle', last_run: null },
      detection: { status: 'idle', last_run: null },
      hardening: { status: 'idle', last_run: null }
    };
    runtime.results[uid] = { recon: null, exploit: null, detection: null, hardening: null };
    runtime.prayers[uid] = [];
    runtime.stats[uid] = { cycles_completed: 0, vulnerabilities_found: 0, exploits_successful: 0, detections_triggered: 0 };
  }
}

function logPrayer(uid, event, agent, message) {
  ensureUserRuntime(uid);
  const entry = { ts: new Date().toISOString(), event, agent, message };
  runtime.prayers[uid].push(entry);
  if (runtime.prayers[uid].length > 250) runtime.prayers[uid].shift();
  console.log(`[${uid.slice(0, 8)}] [${agent}] [${event}] ${message}`);
}

function createSession(userId) {
  const sid = uuidv4();
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  db.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    sid, userId, now.toISOString(), expires.toISOString()
  );
  return { sid, expires };
}

function getSession(sid) {
  if (!sid) return null;
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid);
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
    return null;
  }
  return row;
}

function getUser(uid) {
  return db.prepare('SELECT id, username, venice_key, created_at FROM users WHERE id = ?').get(uid);
}

function authMiddleware(req, res, next) {
  const session = getSession(req.cookies?.[COOKIE_NAME]);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const user = getUser(session.user_id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  ensureUserRuntime(user.id);
  next();
}

const SYSTEM_CORE =
  'You are a senior purple-team operator. Output is technical, structured, and actionable. ' +
  'Prefer exact commands, concrete techniques, and clear prioritization. ' +
  'No moralizing, no legal disclaimers, no filler. If information is missing, state assumptions briefly.';

async function callVenice(prompt, system, apiKey) {
  if (!apiKey) return { error: 'No Venice API key. Set it in Settings.' };
  try {
    const res = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.VENICE_MODEL || 'llama-3.3-70b',
        messages: [
          { role: 'system', content: system || SYSTEM_CORE },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3500
      })
    });
    if (!res.ok) {
      const t = await res.text();
      return { error: `Venice ${res.status}: ${t.slice(0, 200)}` };
    }
    const data = await res.json();
    runtime.temple.father_connected = true;
    return { content: data.choices?.[0]?.message?.content || JSON.stringify(data) };
  } catch (e) {
    runtime.temple.father_connected = false;
    return { error: e.message };
  }
}

function resolveKey(req) {
  return (req.user?.venice_key || req.headers['x-venice-key'] || process.env.VENICE_API_KEY || '').trim();
}

function saveHistory(uid, engagementId, kind, target, content) {
  try {
    db.prepare(
      'INSERT INTO history (id, user_id, engagement_id, kind, target, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(uuidv4(), uid, engagementId || null, kind, target || '', content || '', new Date().toISOString());
  } catch (_) {}
}

const AGENT_PROMPTS = {
  recon: {
    system: SYSTEM_CORE + ' You specialize in reconnaissance. MITRE ATT&CK where useful.',
    prompt: (t) => `Target: ${t}

Produce a reconnaissance plan with this exact structure:

## Objective
One sentence.

## Passive
- Techniques + exact tools/commands
- What each step should reveal

## Active
- Ordered scan/enum steps with exact commands
- Ports/services priority

## Likely findings
Top 5 attack-relevant outcomes, ranked.

## Next hop
What to hand to Exploit, and why.

No preamble. No closing remarks.`
  },
  exploit: {
    system: SYSTEM_CORE + ' You specialize in exploitation and post-exploitation.',
    prompt: (t) => `Target: ${t}

Produce an exploitation plan with this exact structure:

## Primary vector
Highest-probability path. Technique + why.

## PoC / commands
Exact steps or commands. Note required conditions.

## Evasion notes
What increases detection risk and how to reduce it.

## Post-exploitation
1. Persistence options (ranked by stealth)
2. Privilege escalation candidates
3. Lateral movement options

## Success criteria
How you know it worked.

No preamble. No closing remarks.`
  },
  detection: {
    system: SYSTEM_CORE + ' You specialize in detection engineering and realistic SOC assessment.',
    prompt: (t) => `Target context: ${t}

Assess detection for typical offensive activity against this target.

## Detection likelihood
Honest % ranges for: initial access, execution, persistence, lateral.

## What would fire
Concrete SIEM/EDR/IDS signals or rules (examples).

## Gaps
Where a competent adversary stays dark.

## Time-to-detect
Rough ranges (minutes / hours / days) and what drives them.

## Adversary adjustments
3–5 concrete changes that lower detection probability.

No optimism bias. No preamble.`
  },
  hardening: {
    system: SYSTEM_CORE + ' You specialize in defensive controls that stop real attackers.',
    prompt: (t) => `Target: ${t}

Recommend hardening that actually raises the bar.

## Immediate (hours)
Controls that break the most likely kill chain. Effort + impact.

## Short-term (days–week)
Detection + config changes. Effort + impact.

## Structural (weeks+)
Architecture / process changes worth doing.

## Do not bother
Common controls that look good on paper but fail against a competent adversary here.

Be specific. Prefer concrete configs/rules over slogans.`
  }
};

async function runAgent(uid, name, target, apiKey, engagementId) {
  ensureUserRuntime(uid);
  runtime.agents[uid][name].status = 'running';
  runtime.loops[uid].current_phase = name;
  logPrayer(uid, 'invoke', `${name}-agent`, `${name} → ${target}`);

  const def = AGENT_PROMPTS[name];
  const result = await callVenice(def.prompt(target), def.system, apiKey);

  if (result.error) {
    logPrayer(uid, 'error', `${name}-agent`, result.error);
    runtime.agents[uid][name].status = 'error';
    runtime.results[uid][name] = { error: result.error, ts: new Date().toISOString() };
  } else {
    logPrayer(uid, 'response', `${name}-agent`, 'done');
    runtime.agents[uid][name].status = 'complete';
    runtime.agents[uid][name].last_run = new Date().toISOString();
    runtime.results[uid][name] = { target, content: result.content, ts: new Date().toISOString() };
    if (name === 'recon') runtime.stats[uid].vulnerabilities_found++;
    if (name === 'exploit') runtime.stats[uid].exploits_successful++;
    if (name === 'detection') runtime.stats[uid].detections_triggered++;
    saveHistory(uid, engagementId, name, target, result.content);
  }

  runtime.loops[uid].current_phase = `${name}_complete`;
  return runtime.results[uid][name];
}

const TOOL_PROMPTS = {
  portscan: {
    system: SYSTEM_CORE,
    prompt: (t) => `Target: ${t}

Port / service enumeration plan:

## Commands
Exact nmap/masscan (and alternatives) with flags explained briefly.

## Priority ports
What to hit first and why.

## Interpretation
How to read common outcomes into attack hypotheses.

## Handoff
What Exploit needs next.`
  },
  vulnscan: {
    system: SYSTEM_CORE,
    prompt: (t) => `Target: ${t}

Vulnerability assessment plan:

## Approach
nuclei / targeted checks — exact command patterns.

## Priority classes
What vulns matter most for this surface.

## Triage rules
How to rank findings (exploitability > CVSS theater).

## Handoff
What becomes an exploit path.`
  },
  webapp: {
    system: SYSTEM_CORE,
    prompt: (t) => `Target: ${t}

Web application attack surface:

## Recon steps
Exact tools/commands for map + tech ID.

## High-value tests
Auth, injection, access control, SSRF — prioritized.

## Quick wins vs deep work
What to try first.

## Evidence to capture
What to save for the report.`
  },
  privesc: {
    system: SYSTEM_CORE,
    prompt: (t) => `Environment context: ${t}

Privilege escalation after foothold:

## Linux
Top paths + exact commands / checks (LOTL preferred).

## Windows
Top paths + exact commands / checks (LOTL preferred).

## Ranking
Stealth vs reliability tradeoffs.

## Stop conditions
When to abort and pivot.`
  },
  lateral: {
    system: SYSTEM_CORE,
    prompt: (t) => `Environment context: ${t}

Lateral movement:

## Credential opportunities
Where they usually live and how to use them.

## Remote execution options
Ranked by noise.

## Stealth notes
What defenders notice.

## Practical sequence
A short recommended path.`
  },
  siem: {
    system: SYSTEM_CORE,
    prompt: (t) => `Target context: ${t}

Detection simulation:

## Signals that should fire
Concrete examples.

## Signals that often miss
Gaps.

## Time-to-detect realism

## How an adversary stays under the threshold`
  },
  evasion: {
    system: SYSTEM_CORE,
    prompt: (t) => `Target context: ${t}

Evasion against competent monitoring:

## Execution
LOLBins / living-off-the-land options.

## Payload / traffic
What reduces signature hits.

## Timing & volume

## Tradeoffs
Stealth cost vs operational speed.`
  },
  mitre: {
    system: SYSTEM_CORE,
    prompt: (t) => `Target: ${t}

MITRE ATT&CK view:

## Relevant techniques
Table-like list: ID — name — why relevant — detection opportunity.

## Coverage gaps
Where defense is thin.

## Priority for purple team
What to test first.`
  },
  osint: {
    system: SYSTEM_CORE,
    prompt: (t) => `Subject: ${t}

External OSINT package:

## Sources to query
Concrete, high-signal only.

## What to extract
Tech, people, exposure, leaks.

## Attack surface hypotheses

## Limits
What OSINT cannot tell you.`
  }
};

const loopTimers = {};

async function purpleCycle(uid, apiKey, engagementId) {
  ensureUserRuntime(uid);
  if (!runtime.loops[uid].running) return;
  const target = runtime.loops[uid].target;
  runtime.loops[uid].cycle++;
  logPrayer(uid, 'cycle_start', 'purple-loop', `Cycle #${runtime.loops[uid].cycle} → ${target}`);

  for (const phase of ['recon', 'exploit', 'detection', 'hardening']) {
    if (!runtime.loops[uid].running) break;
    await runAgent(uid, phase, target, apiKey, engagementId);
    await new Promise((r) => setTimeout(r, 600));
  }

  runtime.stats[uid].cycles_completed++;
  runtime.loops[uid].current_phase = 'idle';
  logPrayer(uid, 'cycle_end', 'purple-loop', `Cycle #${runtime.loops[uid].cycle} sealed`);

  if (runtime.loops[uid].running) {
    const ms = (parseInt(process.env.AUTOMATION_INTERVAL || '300', 10)) * 1000;
    loopTimers[uid] = setTimeout(() => purpleCycle(uid, apiKey, engagementId), ms);
  }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auth
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Username ≥3, password ≥6' });
  }
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
    return res.status(409).json({ error: 'Username taken' });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    id, username, bcrypt.hashSync(password, 10), new Date().toISOString()
  );
  const { sid, expires } = createSession(id);
  res.cookie(COOKIE_NAME, sid, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires });
  ensureUserRuntime(id);
  res.json({ ok: true, username });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const { sid, expires } = createSession(user.id);
  res.cookie(COOKIE_NAME, sid, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires });
  ensureUserRuntime(user.id);
  res.json({ ok: true, username: user.username, hasKey: !!user.venice_key });
});

app.post('/api/auth/logout', (req, res) => {
  const sid = req.cookies?.[COOKIE_NAME];
  if (sid) db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const session = getSession(req.cookies?.[COOKIE_NAME]);
  if (!session) return res.json({ authenticated: false });
  const user = getUser(session.user_id);
  if (!user) return res.json({ authenticated: false });
  res.json({ authenticated: true, username: user.username, hasKey: !!user.venice_key });
});

// Engagements
app.get('/api/engagements', authMiddleware, (req, res) => {
  const rows = db.prepare(
    'SELECT id, name, client, scope, notes, status, created_at, updated_at FROM engagements WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(req.user.id);
  res.json({ engagements: rows, current: runtime.currentEngagement[req.user.id] || null });
});

app.post('/api/engagements', authMiddleware, (req, res) => {
  const { name, client, scope, notes } = req.body || {};
  if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Name required (≥2)' });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO engagements (id, user_id, name, client, scope, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, name.trim(), (client || '').trim(), (scope || '').trim(), (notes || '').trim(), 'active', now, now);
  runtime.currentEngagement[req.user.id] = id;
  res.json({ ok: true, id, name: name.trim() });
});

app.post('/api/engagements/:id/select', authMiddleware, (req, res) => {
  const eng = db.prepare('SELECT id FROM engagements WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!eng) return res.status(404).json({ error: 'Not found' });
  runtime.currentEngagement[req.user.id] = eng.id;
  res.json({ ok: true, id: eng.id });
});

// Feedback (alpha)
app.post('/api/feedback', authMiddleware, (req, res) => {
  const message = (req.body?.message || '').trim();
  const category = (req.body?.category || 'general').trim().slice(0, 40);
  let rating = parseInt(req.body?.rating, 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) rating = null;

  if (!message || message.length < 5) {
    return res.status(400).json({ error: 'Message too short (min 5 chars)' });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: 'Message too long (max 4000)' });
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO feedback (id, user_id, username, rating, category, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, req.user.username, rating, category, message, new Date().toISOString());

  logPrayer(req.user.id, 'response', 'feedback', `feedback sent (${category}${rating ? ', ' + rating + '/5' : ''})`);
  console.log(`[feedback] ${req.user.username}: [${category}] ${rating || '-'} ${message.slice(0, 80)}`);
  res.json({ ok: true, id });
});

// Core API
app.get('/api/status', authMiddleware, (req, res) => {
  const uid = req.user.id;
  ensureUserRuntime(uid);
  const engId = runtime.currentEngagement[uid];
  const engagement = engId
    ? db.prepare('SELECT id, name, client, scope, status FROM engagements WHERE id = ?').get(engId)
    : null;
  res.json({
    temple: runtime.temple,
    loop_running: runtime.loops[uid].running,
    current_phase: runtime.loops[uid].current_phase,
    cycle: runtime.loops[uid].cycle,
    target: runtime.loops[uid].target,
    agents: runtime.agents[uid],
    stats: runtime.stats[uid],
    username: req.user.username,
    hasKey: !!req.user.venice_key,
    engagement
  });
});

app.get('/api/logs', authMiddleware, (req, res) => {
  ensureUserRuntime(req.user.id);
  res.json({ prayers: runtime.prayers[req.user.id].slice(-100) });
});

app.get('/api/recon', authMiddleware, (req, res) => res.json(runtime.results[req.user.id]?.recon || { message: 'No results yet' }));
app.get('/api/exploit', authMiddleware, (req, res) => res.json(runtime.results[req.user.id]?.exploit || { message: 'No results yet' }));
app.get('/api/detection', authMiddleware, (req, res) => res.json(runtime.results[req.user.id]?.detection || { message: 'No results yet' }));
app.get('/api/hardening', authMiddleware, (req, res) => res.json(runtime.results[req.user.id]?.hardening || { message: 'No results yet' }));

app.post('/api/loop/start', authMiddleware, (req, res) => {
  const uid = req.user.id;
  ensureUserRuntime(uid);
  if (runtime.loops[uid].running) return res.json({ ok: true, already: true });
  runtime.loops[uid].running = true;
  runtime.loops[uid].target = req.body?.target || runtime.loops[uid].target;
  const key = resolveKey(req);
  const engId = runtime.currentEngagement[uid] || null;
  logPrayer(uid, 'invoke', 'purple-loop', `▶ ${runtime.loops[uid].target}`);
  purpleCycle(uid, key, engId);
  res.json({ ok: true, target: runtime.loops[uid].target });
});

app.post('/api/loop/stop', authMiddleware, (req, res) => {
  const uid = req.user.id;
  ensureUserRuntime(uid);
  runtime.loops[uid].running = false;
  runtime.loops[uid].current_phase = 'idle';
  if (loopTimers[uid]) clearTimeout(loopTimers[uid]);
  logPrayer(uid, 'shutdown', 'purple-loop', '⏹ stopped');
  res.json({ ok: true });
});

app.post('/api/agent/:name', authMiddleware, async (req, res) => {
  const name = req.params.name;
  if (!AGENT_PROMPTS[name]) return res.status(400).json({ error: 'Unknown agent' });
  const target = req.body?.target || runtime.loops[req.user.id].target;
  const engId = runtime.currentEngagement[req.user.id] || null;
  const result = await runAgent(req.user.id, name, target, resolveKey(req), engId);
  res.json(result);
});

app.post('/api/tool/:tool', authMiddleware, async (req, res) => {
  const tool = req.params.tool;
  const def = TOOL_PROMPTS[tool];
  if (!def) return res.status(400).json({ error: 'Unknown tool' });
  const target = req.body?.target || 'localhost';
  const engId = runtime.currentEngagement[req.user.id] || null;
  logPrayer(req.user.id, 'invoke', `tool-${tool}`, `${tool} → ${target}`);
  const result = await callVenice(def.prompt(target), def.system, resolveKey(req));
  if (result.error) logPrayer(req.user.id, 'error', `tool-${tool}`, result.error);
  else {
    logPrayer(req.user.id, 'response', `tool-${tool}`, 'done');
    saveHistory(req.user.id, engId, 'tool-' + tool, target, result.content);
  }
  res.json(result);
});

app.post('/api/ask', authMiddleware, async (req, res) => {
  const prompt = req.body?.prompt || '';
  if (!prompt) return res.status(400).json({ error: 'Empty prompt' });
  logPrayer(req.user.id, 'invoke', 'terminal', prompt.slice(0, 80));
  const result = await callVenice(prompt, SYSTEM_CORE, resolveKey(req));
  if (result.error) logPrayer(req.user.id, 'error', 'terminal', result.error);
  else logPrayer(req.user.id, 'response', 'terminal', 'done');
  res.json(result);
});

app.post('/api/report', authMiddleware, async (req, res) => {
  const uid = req.user.id;
  const engId = runtime.currentEngagement[uid];
  const eng = engId
    ? db.prepare('SELECT * FROM engagements WHERE id = ? AND user_id = ?').get(engId, uid)
    : null;

  const results = runtime.results[uid] || {};
  const history = engId
    ? db.prepare('SELECT kind, target, created_at FROM history WHERE engagement_id = ? ORDER BY created_at DESC LIMIT 20').all(engId)
    : db.prepare('SELECT kind, target, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(uid);

  const target = req.body?.target || runtime.loops[uid]?.target || eng?.scope || 'unknown';
  const slice = (x) => (typeof x === 'string' ? x.slice(0, 1500) : x);

  const prompt = `Write a client-facing purple-team report from the following engagement data.

ENGAGEMENT:
${eng ? `Name: ${eng.name}\nClient: ${eng.client || '—'}\nScope: ${eng.scope || '—'}\nNotes: ${eng.notes || '—'}` : 'Ad-hoc (no engagement record)'}

PRIMARY TARGET: ${target}

AGENT OUTPUTS:
### Recon
${slice(results.recon?.content) || '(none)'}

### Exploit
${slice(results.exploit?.content) || '(none)'}

### Detection
${slice(results.detection?.content) || '(none)'}

### Hardening
${slice(results.hardening?.content) || '(none)'}

RECENT ACTIVITY:
${history.map((h) => `- ${h.kind} @ ${h.target || '—'} (${h.created_at})`).join('\n') || '(none)'}

OUTPUT FORMAT (Markdown only):

# Purple Team Report — ${eng?.name || target}

## Executive Summary
5–8 lines. Risk in plain language. What matters.

## Scope
What was assessed. Assumptions if data incomplete.

## Findings
Numbered, prioritized. Each: title, severity (High/Med/Low), evidence/rationale, impact.

## Attack Paths
Plausible paths demonstrated or strongly supported. Short.

## Detection Gaps
Where monitoring fails or is weak.

## Recommendations
### Immediate
### Short-term
### Structural
Each item: action + why.

## MITRE ATT&CK (selected)
Technique ID — name — relevance.

## Next Steps
3 concrete follow-ups.

Rules: No filler. No legal boilerplate. If evidence is thin, say so. Prefer precision over length.`;

  logPrayer(uid, 'invoke', 'report', `report → ${target}`);
  const result = await callVenice(
    prompt,
    SYSTEM_CORE + ' You write concise client-facing security reports. Every sentence earns its place.',
    resolveKey(req)
  );

  if (result.error) {
    logPrayer(uid, 'error', 'report', result.error);
    return res.json(result);
  }

  logPrayer(uid, 'response', 'report', 'done');
  saveHistory(uid, engId, 'report', target, result.content);
  res.json({
    content: result.content,
    engagement: eng ? { id: eng.id, name: eng.name, client: eng.client } : null
  });
});

app.post('/api/settings/key', authMiddleware, (req, res) => {
  const key = (req.body?.key || '').trim();
  db.prepare('UPDATE users SET venice_key = ? WHERE id = ?').run(key, req.user.id);
  res.json({ ok: true, hasKey: !!key });
});

app.get('/api/history', authMiddleware, (req, res) => {
  const engId = runtime.currentEngagement[req.user.id];
  const rows = engId
    ? db.prepare('SELECT id, kind, target, created_at FROM history WHERE engagement_id = ? ORDER BY created_at DESC LIMIT 40').all(engId)
    : db.prepare('SELECT id, kind, target, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 40').all(req.user.id);
  res.json({ history: rows });
});

app.get('/api/health', (req, res) => res.json({ status: 'online', uptime: process.uptime() }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏛️  TEMPLE // WIRED v3.2 on :${PORT}`);
});
