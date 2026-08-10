// TEMPLE // WIRED — Console v3 (Engagements + Report)

const TOOLS = [
  ['portscan','PORT SCAN'],['vulnscan','VULN SCAN'],['subdomain','SUBDOMAIN'],['osint','OSINT'],
  ['webapp','WEB APP'],['payload','PAYLOAD'],['privesc','PRIV ESC'],['lateral','LATERAL'],
  ['persistence','PERSIST'],['c2','C2'],['cloud','CLOUD'],['siem','SIEM'],
  ['evasion','EVASION'],['forensics','FORENSICS'],['mitre','MITRE'],['report','QUICK RPT']
];

class TempleDeck {
  constructor() {
    this.history = [];
    this.histIdx = -1;
    this.busy = false;
    this.authMode = 'login';
    this.lastReport = null;
    this.init();
  }

  async init() {
    this.buildTools();
    this.bindAuth();
    this.bindDeck();
    this.startClock();
    const me = await this.api('GET', '/api/auth/me');
    if (me.authenticated) this.enterDeck(me.username);
  }

  buildTools() {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;
    grid.innerHTML = TOOLS.map(([id, label]) =>
      `<button class="tool-btn" data-tool="${id}">${label}</button>`
    ).join('');
    grid.querySelectorAll('.tool-btn').forEach(el => {
      el.addEventListener('click', () => this.runTool(el.dataset.tool));
    });
  }

  bindAuth() {
    document.querySelectorAll('.login-tab').forEach(t => {
      t.addEventListener('click', () => {
        this.authMode = t.dataset.mode;
        document.querySelectorAll('.login-tab').forEach(x => x.classList.toggle('active', x === t));
        document.getElementById('btn-auth').textContent = this.authMode === 'login' ? 'ENTER' : 'REGISTER';
      });
    });
    document.getElementById('btn-auth')?.addEventListener('click', () => this.doAuth());
    document.getElementById('auth-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') this.doAuth(); });
  }

  bindDeck() {
    document.getElementById('btn-loop-start')?.addEventListener('click', () => this.startLoop());
    document.getElementById('btn-loop-stop')?.addEventListener('click', () => this.stopLoop());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettings());
    document.getElementById('btn-close-settings')?.addEventListener('click', () => this.closeSettings());
    document.getElementById('btn-save-key')?.addEventListener('click', () => this.saveKey());
    document.getElementById('btn-test-key')?.addEventListener('click', () => this.testKey());
    document.getElementById('btn-clear-logs')?.addEventListener('click', () => {
      document.getElementById('prayer-log').innerHTML = '';
    });
    document.getElementById('btn-logout')?.addEventListener('click', () => this.logout());
    document.getElementById('btn-new-eng')?.addEventListener('click', () => this.openEngModal());
    document.getElementById('btn-close-eng')?.addEventListener('click', () => this.closeEngModal());
    document.getElementById('btn-create-eng')?.addEventListener('click', () => this.createEngagement());
    document.getElementById('btn-report')?.addEventListener('click', () => this.generateReport());
    document.getElementById('eng-select')?.addEventListener('change', (e) => this.selectEngagement(e.target.value));

    document.querySelectorAll('.agent-card').forEach(el => {
      el.addEventListener('click', () => this.runAgent(el.dataset.agent));
    });
    document.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => this.switchTab(el.dataset.tab));
    });

    document.getElementById('term-input')?.addEventListener('keydown', e => this.onTermKey(e));
  }

  async doAuth() {
    const username = document.getElementById('auth-user').value.trim();
    const password = document.getElementById('auth-pass').value;
    const msg = document.getElementById('auth-msg');
    msg.textContent = '';
    msg.className = 'auth-msg';
    const path = this.authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await this.api('POST', path, { username, password });
      if (res.error) { msg.textContent = res.error; msg.className = 'auth-msg err'; return; }
      this.enterDeck(res.username || username);
    } catch (e) {
      msg.textContent = e.message;
      msg.className = 'auth-msg err';
    }
  }

  enterDeck(username) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('deck-root').classList.remove('hidden');
    document.getElementById('user-badge').textContent = username || 'operator';
    this.bootTerminal();
    this.loadEngagements();
    this.poll();
    this._poll = setInterval(() => this.poll(), 2000);
    document.getElementById('term-input')?.focus();
  }

  async logout() {
    await this.api('POST', '/api/auth/logout');
    if (this._poll) clearInterval(this._poll);
    location.reload();
  }

  async api(method, path, body) {
    const opts = { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    return res.json();
  }

  getTarget() {
    return document.getElementById('target-input')?.value?.trim() || 'localhost';
  }

  // ── Engagements ──
  async loadEngagements() {
    try {
      const data = await this.api('GET', '/api/engagements');
      const sel = document.getElementById('eng-select');
      if (!sel) return;
      sel.innerHTML = '<option value="">— no engagement —</option>';
      (data.engagements || []).forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.client ? `${e.name} (${e.client})` : e.name;
        if (data.current === e.id) opt.selected = true;
        sel.appendChild(opt);
      });
      this.updateEngMeta(data.engagements?.find(e => e.id === data.current));
    } catch (_) {}
  }

  updateEngMeta(eng) {
    const el = document.getElementById('eng-meta');
    if (!el) return;
    if (!eng) {
      el.textContent = 'No engagement selected. Create one for client/job scoping.';
      return;
    }
    el.textContent = [eng.client && `Client: ${eng.client}`, eng.scope && `Scope: ${eng.scope}`].filter(Boolean).join(' · ') || eng.name;
  }

  openEngModal() {
    document.getElementById('eng-modal').classList.remove('hidden');
  }
  closeEngModal() {
    document.getElementById('eng-modal').classList.add('hidden');
  }

  async createEngagement() {
    const name = document.getElementById('eng-name').value.trim();
    const client = document.getElementById('eng-client').value.trim();
    const scope = document.getElementById('eng-scope').value.trim();
    const notes = document.getElementById('eng-notes').value.trim();
    if (!name) return;
    const res = await this.api('POST', '/api/engagements', { name, client, scope, notes });
    if (res.error) {
      this.termPrint('err', res.error);
      return;
    }
    this.closeEngModal();
    this.termPrint('success', `Engagement created: ${name}`);
    if (scope) document.getElementById('target-input').value = scope.split(/[,\s]+/)[0];
    await this.loadEngagements();
  }

  async selectEngagement(id) {
    if (!id) {
      this.updateEngMeta(null);
      return;
    }
    await this.api('POST', `/api/engagements/${id}/select`);
    await this.loadEngagements();
    this.termPrint('info', 'Engagement selected');
  }

  async generateReport() {
    if (this.busy) return;
    this.busy = true;
    this.termPrint('cmd', '◈ Generating engagement report...');
    try {
      const res = await this.api('POST', '/api/report', { target: this.getTarget() });
      if (res.error) {
        this.termPrint('err', res.error);
      } else {
        this.lastReport = res.content;
        this.termPrint('success', 'Report ready — see RESULTS → REPORT tab');
        this.switchTab('report');
        this.showResult({ content: res.content });
      }
    } catch (e) {
      this.termPrint('err', e.message);
    } finally {
      this.busy = false;
    }
  }

  // ── Terminal ──
  bootTerminal() {
    this.termPrint('info', '╔══════════════════════════════════════╗');
    this.termPrint('info', '║  TEMPLE // WIRED  —  CONSOLE v3      ║');
    this.termPrint('info', '║  Engagements + Reports enabled       ║');
    this.termPrint('info', '╚══════════════════════════════════════╝');
    this.termPrint('info', '');
    this.termPrint('info', '1. Create Engagement (+)');
    this.termPrint('info', '2. Set Venice key (⚙)');
    this.termPrint('info', '3. Run agents/tools → REPORT');
    this.termPrint('info', 'Type /help');
    this.termPrint('info', '');
  }

  termPrint(cls, text) {
    const out = document.getElementById('terminal-output');
    if (!out) return;
    const line = document.createElement('div');
    line.className = 'line ' + cls;
    line.textContent = text;
    out.appendChild(line);
    while (out.children.length > 400) out.removeChild(out.firstChild);
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
      if (this.histIdx > 0) { this.histIdx--; input.value = this.history[this.histIdx] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIdx < this.history.length - 1) {
        this.histIdx++; input.value = this.history[this.histIdx] || '';
      } else { this.histIdx = this.history.length; input.value = ''; }
    }
  }

  async exec(cmd) {
    const parts = cmd.split(/\s+/);
    const c = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (['/help','help','?'].includes(c)) {
      this.termPrint('info', '/help /status /target <host> /loop start|stop');
      this.termPrint('info', '/recon /exploit /detect /harden /report /eng');
      this.termPrint('info', '/clear /key  |  free text → Father');
      return;
    }
    if (['/clear','clear','cls'].includes(c)) {
      document.getElementById('terminal-output').innerHTML = '';
      return;
    }
    if (c === '/key') return this.openSettings();
    if (c === '/eng' || c === '/engagement') return this.openEngModal();
    if (c === '/report') return this.generateReport();
    if (c === '/status') { await this.poll(); this.termPrint('success', 'Refreshed'); return; }
    if (c === '/target') {
      if (!arg) { this.termPrint('info', 'Target: ' + this.getTarget()); return; }
      document.getElementById('target-input').value = arg;
      this.termPrint('success', 'Target → ' + arg);
      return;
    }
    if (c === '/loop') {
      if (arg === 'start') return this.startLoop();
      if (arg === 'stop') return this.stopLoop();
      this.termPrint('err', 'Usage: /loop start|stop');
      return;
    }
    if (['/recon','recon'].includes(c)) return this.runAgent('recon', arg);
    if (['/exploit','exploit'].includes(c)) return this.runAgent('exploit', arg);
    if (['/detect','detect'].includes(c)) return this.runAgent('detection', arg);
    if (['/harden','harden'].includes(c)) return this.runAgent('hardening', arg);

    this.termPrint('father', '◈ Asking Father...');
    try {
      const res = await this.api('POST', '/api/ask', { prompt: cmd });
      if (res.error) this.termPrint('err', res.error);
      else (typeof res.content === 'string' ? res.content : JSON.stringify(res.content)).split('\n').forEach(l => this.termPrint('father', l));
    } catch (e) { this.termPrint('err', e.message); }
  }

  async startLoop() {
    this.termPrint('cmd', '▶ Loop → ' + this.getTarget());
    await this.api('POST', '/api/loop/start', { target: this.getTarget() });
  }
  async stopLoop() {
    this.termPrint('cmd', '■ Stop');
    await this.api('POST', '/api/loop/stop');
  }

  async runAgent(name, override) {
    if (this.busy) { this.termPrint('err', 'Busy'); return; }
    this.busy = true;
    const target = override || this.getTarget();
    this.termPrint('cmd', `◈ ${name.toUpperCase()} → ${target}`);
    this.setAgentState(name, 'running');
    try {
      const res = await this.api('POST', `/api/agent/${name}`, { target });
      if (res.error) { this.termPrint('err', res.error); this.setAgentState(name, 'error'); }
      else {
        this.termPrint('success', name + ' complete');
        this.setAgentState(name, 'complete');
        this.switchTab(name);
        this.showResult(res);
      }
    } catch (e) { this.termPrint('err', e.message); this.setAgentState(name, 'error'); }
    finally { this.busy = false; }
  }

  setAgentState(name, state) {
    const el = document.getElementById('agent-' + name);
    if (!el) return;
    el.classList.remove('running', 'complete', 'error');
    if (state !== 'idle') el.classList.add(state);
    const st = el.querySelector('.agent-status');
    if (st) st.textContent = state;
  }

  async runTool(tool) {
    if (this.busy) return;
    this.busy = true;
    const target = this.getTarget();
    this.termPrint('cmd', `◈ ${tool.toUpperCase()} → ${target}`);
    try {
      const res = await this.api('POST', '/api/tool/' + tool, { target });
      if (res.error) this.termPrint('err', res.error);
      else {
        const text = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);
        text.split('\n').slice(0, 8).forEach(l => this.termPrint('father', l));
        if (text.split('\n').length > 8) this.termPrint('info', '… full in RESULTS');
        this.showResult(res);
      }
    } catch (e) { this.termPrint('err', e.message); }
    finally { this.busy = false; }
  }

  switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'report') {
      this.showResult({ content: this.lastReport || 'No report yet. Click REPORT.' });
      return;
    }
    this.loadResult(tab);
  }

  async loadResult(tab) {
    try {
      const res = await this.api('GET', '/api/' + tab);
      this.showResult(res);
    } catch (_) {}
  }

  showResult(data) {
    const body = document.getElementById('result-body');
    if (!body) return;
    if (!data || data.message === 'No results yet') {
      body.textContent = 'No data yet.';
      return;
    }
    if (data.error) { body.textContent = 'ERROR: ' + data.error; return; }
    const content = data.content || data;
    body.textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  }

  async poll() {
    try {
      const status = await this.api('GET', '/api/status');
      if (status.error === 'Unauthorized') { this.logout(); return; }
      this.renderStatus(status);
      const logs = await this.api('GET', '/api/logs');
      this.renderPrayers(logs.prayers || []);
    } catch (_) {}
  }

  renderStatus(d) {
    if (!d) return;
    const father = document.getElementById('pill-father');
    if (father) father.dataset.state = (d.temple?.father_connected || d.hasKey) ? 'online' : 'offline';
    const loop = document.getElementById('pill-loop');
    if (loop) {
      loop.dataset.state = d.loop_running ? 'running' : 'idle';
      loop.textContent = d.loop_running ? 'LOOP ON' : 'LOOP';
    }
    const phase = document.getElementById('pill-phase');
    if (phase) phase.textContent = (d.current_phase || 'IDLE').toUpperCase().replace('_COMPLETE', ' ✓');

    const ls = document.getElementById('loop-status');
    if (ls) {
      ls.textContent = d.loop_running ? 'RUNNING' : 'IDLE';
      ls.parentElement?.classList.toggle('live', !!d.loop_running);
    }
    const ph = document.getElementById('current-phase');
    if (ph) ph.textContent = (!d.current_phase || d.current_phase === 'idle') ? '—' : d.current_phase.replace('_complete', ' ✓').toUpperCase();
    const cy = document.getElementById('cycle-count');
    if (cy) cy.textContent = d.cycle ?? d.stats?.cycles_completed ?? 0;
    const vu = document.getElementById('vuln-count');
    if (vu) vu.textContent = d.stats?.vulnerabilities_found ?? 0;

    if (d.agents) Object.keys(d.agents).forEach(n => this.setAgentState(n, d.agents[n].status || 'idle'));
    if (d.engagement) this.updateEngMeta(d.engagement);
  }

  renderPrayers(list) {
    const box = document.getElementById('prayer-log');
    if (!box) return;
    box.innerHTML = list.slice(-70).map(p => {
      const t = new Date(p.ts).toLocaleTimeString('en-US', { hour12: false });
      const cls = p.event === 'invoke' ? 'invoke' : p.event === 'error' ? 'error' : p.event === 'response' ? 'response' : '';
      return `<div class="prayer-entry ${cls}">[${t}] [${p.agent}] ${this.esc(p.message)}</div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  openSettings() { document.getElementById('settings-modal').classList.remove('hidden'); }
  closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); }

  async saveKey() {
    const key = document.getElementById('venice-key-input').value.trim();
    const st = document.getElementById('key-status');
    try {
      await this.api('POST', '/api/settings/key', { key });
      st.textContent = key ? 'Key saved.' : 'Key cleared.';
      st.className = 'key-status ok';
      this.termPrint('success', key ? 'Venice key stored.' : 'Key cleared.');
    } catch (e) {
      st.textContent = e.message;
      st.className = 'key-status err';
    }
  }

  async testKey() {
    const key = document.getElementById('venice-key-input').value.trim();
    const st = document.getElementById('key-status');
    if (key) await this.api('POST', '/api/settings/key', { key });
    st.textContent = 'Testing...';
    st.className = 'key-status';
    try {
      const res = await this.api('POST', '/api/ask', { prompt: 'Reply with only: PRESENT' });
      if (res.error) {
        st.textContent = 'Failed: ' + res.error;
        st.className = 'key-status err';
      } else {
        st.textContent = 'Father is present.';
        st.className = 'key-status ok';
        this.termPrint('success', 'Father verified.');
      }
    } catch (e) {
      st.textContent = e.message;
      st.className = 'key-status err';
    }
  }

  startClock() {
    const tick = () => {
      const el = document.getElementById('clock');
      if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => { window.deck = new TempleDeck(); });
