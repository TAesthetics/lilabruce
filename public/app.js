// ═══════════════════════════════════════════════════
// TEMPLE // WIRED — Netrunner Deck Controller
// ═══════════════════════════════════════════════════

class TempleDeck {
  constructor() {
    this.history = [];
    this.histIdx = -1;
    this.veniceKey = localStorage.getItem('venice_key') || '';
    this.pollMs = 2200;
    this.init();
  }

  init() {
    this.bind();
    this.bootTerminal();
    this.startClock();
    this.poll();
    setInterval(() => this.poll(), this.pollMs);
  }

  // ── BINDINGS ──
  bind() {
    document.getElementById('btn-loop-start')?.addEventListener('click', () => this.startLoop());
    document.getElementById('btn-loop-stop')?.addEventListener('click', () => this.stopLoop());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettings());
    document.getElementById('btn-close-settings')?.addEventListener('click', () => this.closeSettings());
    document.getElementById('btn-save-key')?.addEventListener('click', () => this.saveKey());
    document.getElementById('btn-test-key')?.addEventListener('click', () => this.testKey());
    document.getElementById('btn-clear-logs')?.addEventListener('click', () => this.clearPrayers());

    document.querySelectorAll('.agent-card').forEach(el => {
      el.addEventListener('click', () => this.runAgent(el.dataset.agent));
    });

    document.querySelectorAll('.tool-btn').forEach(el => {
      el.addEventListener('click', () => this.runTool(el.dataset.tool));
    });

    document.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => this.switchTab(el.dataset.tab));
    });

    const term = document.getElementById('term-input');
    term?.addEventListener('keydown', (e) => this.onTermKey(e));
  }

  // ── TERMINAL ──
  bootTerminal() {
    this.termPrint('info', '══════════════════════════════════════');
    this.termPrint('info', '  TEMPLE // WIRED  —  NETRUNNER DECK');
    this.termPrint('info', '  Present day. Present time.');
    this.termPrint('info', '══════════════════════════════════════');
    this.termPrint('info', '');
    this.termPrint('father', 'Father status: ' + (this.veniceKey ? 'KEY LOADED' : 'NO KEY — open settings ⚙'));
    this.termPrint('info', 'Type /help for commands');
    this.termPrint('info', '');
  }

  termPrint(cls, text) {
    const out = document.getElementById('terminal-output');
    if (!out) return;
    const line = document.createElement('div');
    line.className = 'line ' + cls;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  onTermKey(e) {
    const input = e.target;
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (!cmd) return;
      this.history.push(cmd);
      this.histIdx = this.history.length;
      this.termPrint('cmd', 'root@temple:~$ ' + cmd);
      input.value = '';
      this.exec(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.histIdx > 0) {
        this.histIdx--;
        input.value = this.history[this.histIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIdx < this.history.length - 1) {
        this.histIdx++;
        input.value = this.history[this.histIdx] || '';
      } else {
        this.histIdx = this.history.length;
        input.value = '';
      }
    }
  }

  async exec(cmd) {
    const parts = cmd.split(/\s+/);
    const c = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (c === '/help' || c === 'help') {
      this.termPrint('info', 'Commands:');
      this.termPrint('info', '  /help              — this');
      this.termPrint('info', '  /status            — temple status');
      this.termPrint('info', '  /target <host>     — set target');
      this.termPrint('info', '  /recon [target]    — run recon');
      this.termPrint('info', '  /exploit [target]  — run exploit');
      this.termPrint('info', '  /detect [target]   — detection sim');
      this.termPrint('info', '  /harden [target]   — hardening');
      this.termPrint('info', '  /loop start|stop   — purple loop');
      this.termPrint('info', '  /clear             — clear terminal');
      this.termPrint('info', '  /key               — open settings');
      return;
    }
    if (c === '/clear' || c === 'clear') {
      document.getElementById('terminal-output').innerHTML = '';
      return;
    }
    if (c === '/key' || c === 'settings') {
      this.openSettings();
      return;
    }
    if (c === '/status') {
      await this.poll();
      this.termPrint('info', 'Status refreshed — check dashboard');
      return;
    }
    if (c === '/target') {
      if (arg) {
        document.getElementById('target-input').value = arg;
        this.termPrint('info', 'Target set → ' + arg);
      }
      return;
    }
    if (c === '/loop') {
      if (arg === 'start') this.startLoop();
      else if (arg === 'stop') this.stopLoop();
      else this.termPrint('err', 'Usage: /loop start|stop');
      return;
    }
    if (['/recon','recon'].includes(c)) return this.runAgent('recon', arg);
    if (['/exploit','exploit'].includes(c)) return this.runAgent('exploit', arg);
    if (['/detect','detect','/detection'].includes(c)) return this.runAgent('detection', arg);
    if (['/harden','harden','/hardening'].includes(c)) return this.runAgent('hardening', arg);

    // free-form → ask Father
    this.termPrint('father', 'Asking Father...');
    try {
      const res = await this.api('POST', '/api/ask', { prompt: cmd, target: this.getTarget() });
      if (res.error) this.termPrint('err', res.error);
      else this.termPrint('father', typeof res.content === 'string' ? res.content : JSON.stringify(res.content));
    } catch (e) {
      this.termPrint('err', e.message);
    }
  }

  // ── API HELPER ──
  async api(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.veniceKey) headers['X-Venice-Key'] = this.veniceKey;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(path, opts);
    return res.json();
  }

  getTarget() {
    return document.getElementById('target-input')?.value?.trim() || 'localhost';
  }

  // ── LOOP ──
  async startLoop() {
    const target = this.getTarget();
    this.termPrint('cmd', '▶ Starting Purple Loop → ' + target);
    await this.api('POST', '/api/loop/start', { target });
  }

  async stopLoop() {
    this.termPrint('cmd', '■ Stopping loop');
    await this.api('POST', '/api/loop/stop');
  }

  // ── AGENTS ──
  async runAgent(name, overrideTarget) {
    const target = overrideTarget || this.getTarget();
    this.termPrint('cmd', `Invoking ${name}-agent → ${target}`);
    this.setAgentState(name, 'running');
    try {
      const res = await this.api('POST', `/api/agent/${name}`, { target });
      if (res.error) {
        this.termPrint('err', res.error);
        this.setAgentState(name, 'error');
      } else {
        this.termPrint('father', `${name} complete`);
        this.setAgentState(name, 'complete');
        this.switchTab(name);
        this.showResult(res);
      }
    } catch (e) {
      this.termPrint('err', e.message);
      this.setAgentState(name, 'error');
    }
  }

  setAgentState(name, state) {
    const el = document.getElementById('agent-' + name);
    if (!el) return;
    el.classList.remove('running', 'complete', 'error');
    if (state !== 'idle') el.classList.add(state);
    const st = el.querySelector('.agent-status');
    if (st) st.textContent = state;
  }

  // ── TOOLS ──
  async runTool(tool) {
    const target = this.getTarget();
    this.termPrint('cmd', `Tool: ${tool} → ${target}`);
    this.termPrint('father', 'Consulting Father...');
    try {
      const res = await this.api('POST', '/api/tool/' + tool, { target });
      if (res.error) this.termPrint('err', res.error);
      else {
        this.termPrint('father', typeof res.content === 'string' ? res.content.slice(0, 400) + (res.content.length > 400 ? '…' : '') : 'done');
        this.showResult(res);
      }
    } catch (e) {
      this.termPrint('err', e.message);
    }
  }

  // ── RESULTS ──
  switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    this.loadResult(tab);
  }

  async loadResult(tab) {
    try {
      const res = await this.api('GET', '/api/' + tab);
      this.showResult(res);
    } catch (e) {}
  }

  showResult(data) {
    const body = document.getElementById('result-body');
    if (!body) return;
    if (!data || data.message === 'No results yet') {
      body.textContent = 'No data yet.';
      return;
    }
    if (data.error) {
      body.textContent = 'ERROR: ' + data.error;
      return;
    }
    const content = data.content || data;
    body.textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  }

  // ── PRAYERS ──
  async poll() {
    try {
      const status = await this.api('GET', '/api/status');
      this.renderStatus(status);

      const logs = await this.api('GET', '/api/logs');
      this.renderPrayers(logs.prayers || []);
    } catch (e) {}
  }

  renderStatus(d) {
    if (!d) return;

    const father = document.getElementById('pill-father');
    if (father) {
      father.dataset.state = d.temple?.father_connected ? 'online' : 'offline';
      father.textContent = d.temple?.father_connected ? 'FATHER' : 'FATHER ?';
    }

    const loop = document.getElementById('pill-loop');
    if (loop) {
      loop.dataset.state = d.loop_running ? 'running' : 'idle';
      loop.textContent = d.loop_running ? 'LOOP ON' : 'LOOP';
    }

    const phase = document.getElementById('pill-phase');
    if (phase) phase.textContent = (d.current_phase || 'IDLE').toUpperCase();

    const ls = document.getElementById('loop-status');
    if (ls) ls.textContent = d.loop_running ? 'RUNNING' : 'IDLE';

    const ph = document.getElementById('current-phase');
    if (ph) ph.textContent = this.fmtPhase(d.current_phase);

    const cy = document.getElementById('cycle-count');
    if (cy) cy.textContent = d.cycle ?? d.stats?.cycles_completed ?? 0;

    const vu = document.getElementById('vuln-count');
    if (vu) vu.textContent = d.stats?.vulnerabilities_found ?? 0;

    if (d.agents) {
      Object.keys(d.agents).forEach(name => {
        this.setAgentState(name, d.agents[name].status || 'idle');
      });
    }
  }

  fmtPhase(p) {
    if (!p || p === 'idle') return '—';
    return p.replace('_complete', ' ✓').toUpperCase();
  }

  renderPrayers(list) {
    const box = document.getElementById('prayer-log');
    if (!box) return;
    box.innerHTML = list.slice(-60).map(p => {
      const t = new Date(p.ts).toLocaleTimeString('en-US', { hour12: false });
      const cls = p.event === 'invoke' ? 'invoke' : p.event === 'error' ? 'error' : p.event === 'response' ? 'response' : '';
      return `<div class="prayer-entry ${cls}">[${t}] [${p.agent}] ${p.message}</div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  clearPrayers() {
    document.getElementById('prayer-log').innerHTML = '';
  }

  // ── SETTINGS / KEY ──
  openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('venice-key-input').value = this.veniceKey;
  }

  closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
  }

  saveKey() {
    const key = document.getElementById('venice-key-input').value.trim();
    this.veniceKey = key;
    localStorage.setItem('venice_key', key);
    const st = document.getElementById('key-status');
    st.textContent = key ? 'Key saved in browser.' : 'Key cleared.';
    st.className = 'key-status ok';
    this.termPrint('info', key ? 'Venice key stored locally.' : 'Venice key cleared.');
  }

  async testKey() {
    const key = document.getElementById('venice-key-input').value.trim();
    if (!key) {
      document.getElementById('key-status').textContent = 'No key entered.';
      document.getElementById('key-status').className = 'key-status err';
      return;
    }
    this.veniceKey = key;
    localStorage.setItem('venice_key', key);
    const st = document.getElementById('key-status');
    st.textContent = 'Testing...';
    st.className = 'key-status';
    try {
      const res = await this.api('POST', '/api/ask', { prompt: 'Reply with only the word: PRESENT' });
      if (res.error) {
        st.textContent = 'Failed: ' + res.error;
        st.className = 'key-status err';
        this.termPrint('err', 'Father silent: ' + res.error);
      } else {
        st.textContent = 'Father is present.';
        st.className = 'key-status ok';
        this.termPrint('father', 'Father connection verified.');
      }
    } catch (e) {
      st.textContent = e.message;
      st.className = 'key-status err';
    }
  }

  // ── CLOCK ──
  startClock() {
    const tick = () => {
      const el = document.getElementById('clock');
      if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.deck = new TempleDeck();
});
