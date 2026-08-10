// 🏛️ Temple of the Wired — UI Controller (Railway)
// Present day. Present time.

class TempleController {
  constructor() {
    this.update_interval = 2500;
    this.log_lines = [];
    this.max_logs = 120;
    this.init();
  }

  init() {
    this.setup_event_listeners();
    this.start_polling();
    this.load_initial_state();
  }

  setup_event_listeners() {
    document.getElementById('btn-loop-start')?.addEventListener('click', () => this.start_loop());
    document.getElementById('btn-loop-stop')?.addEventListener('click', () => this.stop_loop());
    document.getElementById('btn-refresh')?.addEventListener('click', () => this.refresh_status());
    document.getElementById('btn-clear-logs')?.addEventListener('click', () => this.clear_logs());

    document.getElementById('btn-recon')?.addEventListener('click', () => this.invoke_agent('recon'));
    document.getElementById('btn-exploit')?.addEventListener('click', () => this.invoke_agent('exploit'));
    document.getElementById('btn-detect')?.addEventListener('click', () => this.invoke_agent('detection'));
    document.getElementById('btn-harden')?.addEventListener('click', () => this.invoke_agent('hardening'));

    document.querySelectorAll('.tab-btn-mobile').forEach(btn => {
      btn.addEventListener('click', (e) => this.switch_tab(e.target.dataset.tab));
    });
  }

  getTarget() {
    return document.getElementById('target-input')?.value?.trim() || 'localhost';
  }

  async start_loop() {
    const target = this.getTarget();
    this.log_prayer('invoke', 'ui', `▶ Starting Purple Loop on ${target}`);
    try {
      await fetch('/api/loop/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      this.update_loop_status('Running');
    } catch (e) {
      this.log_prayer('error', 'ui', e.message);
    }
  }

  async stop_loop() {
    this.log_prayer('invoke', 'ui', '⏹ Stopping Purple Loop');
    try {
      await fetch('/api/loop/stop', { method: 'POST' });
      this.update_loop_status('Idle');
    } catch (e) {
      this.log_prayer('error', 'ui', e.message);
    }
  }

  async invoke_agent(name) {
    const target = this.getTarget();
    this.log_prayer('invoke', 'ui', `🟣 Invoking ${name}-agent on ${target}`);
    try {
      const res = await fetch(`/api/agent/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      this.log_prayer('response', 'ui', `${name} complete`);
      this.load_tab_results(name);
    } catch (e) {
      this.log_prayer('error', 'ui', e.message);
    }
  }

  async refresh_status() {
    await this.fetch_status();
    await this.fetch_logs();
    this.log_prayer('update', 'ui', '⟳ Status refreshed');
  }

  async fetch_status() {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('status failed');
      const data = await res.json();
      this.update_status_display(data);
    } catch (e) {
      console.error(e);
    }
  }

  update_status_display(data) {
    if (!data) return;

    // Father light
    const fatherDot = document.getElementById('father-dot');
    if (fatherDot) {
      fatherDot.textContent = data.temple?.father_connected ? '🟣' : '⚫';
    }

    // Loop light + status
    const loopDot = document.getElementById('loop-dot');
    if (loopDot) {
      loopDot.textContent = data.loop_running ? '🟢' : '⚫';
    }
    this.update_loop_status(data.loop_running ? 'Running' : 'Idle');

    if (data.current_phase) {
      const el = document.getElementById('current-phase');
      if (el) el.textContent = this.format_phase(data.current_phase);
    }

    if (data.agents) {
      ['recon', 'exploit', 'detection', 'hardening'].forEach(name => {
        this.update_agent_display(name, data.agents[name]);
      });
    }
  }

  update_loop_status(status) {
    const el = document.getElementById('loop-status');
    if (el) el.textContent = status;
  }

  update_agent_display(name, agent) {
    const el = document.getElementById(`agent-${name}`);
    if (!el) return;
    const statusEl = el.querySelector('.agent-mini-status');
    const dotEl = el.querySelector('.agent-dot');
    if (statusEl) statusEl.textContent = agent?.status || 'idle';
    if (dotEl) {
      if (agent?.status === 'running') dotEl.textContent = '🟣';
      else if (agent?.status === 'complete') dotEl.textContent = '🟢';
      else if (agent?.status === 'error') dotEl.textContent = '🔴';
      else dotEl.textContent = '⚫';
    }
  }

  switch_tab(tab) {
    document.querySelectorAll('.result-content.mobile').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn-mobile').forEach(b => b.classList.remove('active'));
    const selected = document.getElementById(`${tab}-results`);
    if (selected) selected.classList.remove('hidden');
    document.querySelectorAll(`[data-tab="${tab}"]`).forEach(b => b.classList.add('active'));
    this.load_tab_results(tab);
  }

  async load_tab_results(tab) {
    const el = document.getElementById(`${tab}-results`);
    if (!el) return;
    try {
      const res = await fetch(`/api/${tab}`);
      const data = await res.json();
      if (data?.content) {
        el.textContent = typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2);
      } else if (data?.error) {
        el.textContent = `Error: ${data.error}`;
      } else {
        el.textContent = JSON.stringify(data, null, 2);
      }
    } catch (e) {
      el.textContent = 'Failed to load';
    }
  }

  async fetch_logs() {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.prayers) {
        this.log_lines = data.prayers.map(p => {
          const t = new Date(p.ts).toLocaleTimeString('en-US', { hour12: false });
          return `[${t}] [${p.agent}] [${p.event}] ${p.message}`;
        });
        this.render_logs();
      }
    } catch (e) {}
  }

  log_prayer(event, agent, message) {
    const t = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.log_lines.push(`[${t}] [${agent}] [${event}] ${message}`);
    if (this.log_lines.length > this.max_logs) this.log_lines.shift();
    this.render_logs();
  }

  render_logs() {
    const container = document.getElementById('log-container');
    if (!container) return;
    container.innerHTML = this.log_lines.map(line => {
      let cls = '';
      if (line.includes('[error]')) cls = 'error';
      else if (line.includes('[invoke]')) cls = 'invoke';
      return `<div class="log-entry ${cls}">${this.escape(line)}</div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  clear_logs() {
    this.log_lines = [];
    this.render_logs();
    this.log_prayer('action', 'ui', '🗑 Logs cleared');
  }

  start_polling() {
    setInterval(() => {
      this.fetch_status();
      this.fetch_logs();
    }, this.update_interval);
  }

  load_initial_state() {
    this.log_prayer('init', 'ui', '🏛️ The Wired is online');
    this.fetch_status();
    this.fetch_logs();
  }

  format_phase(phase) {
    const map = {
      idle: '⚫ Idle',
      recon: '🔍 Recon',
      recon_complete: '✓ Recon',
      exploit: '⚔️ Exploit',
      exploit_complete: '✓ Exploit',
      detection: '🔔 Detect',
      detection_complete: '✓ Detect',
      hardening: '🛡️ Harden',
      hardening_complete: '✓ Harden'
    };
    return map[phase] || phase;
  }

  escape(text) {
    return text.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.temple = new TempleController();
});
