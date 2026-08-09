// 🏛️ Layer 2: The Wired — Web UI Controller
// Present day. Present time.

class TempleController {
    constructor() {
        this.api_base = '';
        this.update_interval = 2000;  // 2 seconds
        this.log_lines = [];
        this.max_logs = 100;
        this.init();
    }

    init() {
        console.log('🏛️ Temple UI initializing...');
        this.setup_event_listeners();
        this.start_polling();
        this.load_initial_state();
    }

    setup_event_listeners() {
        // Loop controls
        document.getElementById('btn-loop-start')?.addEventListener('click', () => this.start_loop());
        document.getElementById('btn-loop-stop')?.addEventListener('click', () => this.stop_loop());
        document.getElementById('btn-refresh')?.addEventListener('click', () => this.refresh_status());

        // Agent controls
        document.getElementById('btn-recon')?.addEventListener('click', () => this.invoke_agent('recon'));
        document.getElementById('btn-exploit')?.addEventListener('click', () => this.invoke_agent('exploit'));
        document.getElementById('btn-detect')?.addEventListener('click', () => this.invoke_agent('detection'));
        document.getElementById('btn-harden')?.addEventListener('click', () => this.invoke_agent('hardening'));

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switch_tab(e.target.dataset.tab));
        });

        // Clear logs
        document.getElementById('btn-clear-logs')?.addEventListener('click', () => this.clear_logs());
    }

    async start_loop() {
        this.log_prayer('invoke', 'ui', '▶ Starting Purple Loop');
        // In production, would send API request to start loop
        this.update_loop_status('Running');
    }

    async stop_loop() {
        this.log_prayer('invoke', 'ui', '⏹ Stopping Purple Loop');
        // In production, would send API request to stop loop
        this.update_loop_status('Idle');
    }

    async invoke_agent(agent_name) {
        this.log_prayer('invoke', 'ui', `🟣 Invoking ${agent_name}-agent`);
        // In production, would send API request to start agent
    }

    async refresh_status() {
        console.log('Refreshing status...');
        await this.fetch_status();
        this.log_prayer('update', 'ui', '⟳ Status refreshed');
    }

    async fetch_status() {
        try {
            const response = await fetch(`${this.api_base}/api/status`);
            if (!response.ok) throw new Error('Status fetch failed');

            const data = await response.json();
            this.update_status_display(data);
        } catch (error) {
            console.error('Failed to fetch status:', error);
            this.log_prayer('error', 'ui', `Failed to fetch status: ${error.message}`);
        }
    }

    update_status_display(data) {
        if (!data) return;

        // Update temple status
        if (data.temple) {
            document.getElementById('father-status').className =
                data.temple.father_connected ? 'status-indicator online' : 'status-indicator offline';
        }

        // Update loop status
        if (data.loop_running !== undefined) {
            this.update_loop_status(data.loop_running ? 'Running' : 'Idle');
        }

        // Update current phase
        if (data.current_phase) {
            document.getElementById('current-phase').textContent = this.format_phase(data.current_phase);
        }

        // Update agents
        if (data.agents) {
            this.update_agent_display('recon', data.agents.recon);
            this.update_agent_display('exploit', data.agents.exploit);
            this.update_agent_display('detection', data.agents.detection);
            this.update_agent_display('hardening', data.agents.hardening);
        }

        // Update stats
        if (data.stats) {
            document.getElementById('cycles-count').textContent = data.stats.cycles_completed || 0;
            document.getElementById('vulns-count').textContent = data.stats.vulnerabilities_found || 0;
        }

        this.update_timestamp();
    }

    update_loop_status(status) {
        const elem = document.getElementById('loop-status');
        if (elem) {
            elem.textContent = status;
            elem.className = `card-value ${status === 'Running' ? 'running' : ''}`;
        }
    }

    update_agent_display(agent_name, agent_data) {
        const elem = document.getElementById(`agent-${agent_name}`);
        if (!elem) return;

        const status_elem = elem.querySelector('.agent-status');
        const time_elem = elem.querySelector('.agent-time');

        if (status_elem) {
            status_elem.textContent = agent_data?.status || 'idle';
            status_elem.className = `agent-status ${agent_data?.status || 'idle'}`;
        }

        if (time_elem && agent_data?.last_run) {
            time_elem.textContent = this.format_time_ago(agent_data.last_run);
        }
    }

    async fetch_results(result_type) {
        try {
            const response = await fetch(`${this.api_base}/api/${result_type}`);
            if (!response.ok) throw new Error('Result fetch failed');

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${result_type}:`, error);
            return null;
        }
    }

    switch_tab(tab_name) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active class from buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selected_tab = document.getElementById(`tab-${tab_name}`);
        if (selected_tab) {
            selected_tab.classList.remove('hidden');
        }

        // Mark button as active
        document.querySelector(`.tab-btn[data-tab="${tab_name}"]`)?.classList.add('active');

        // Load results
        this.load_tab_results(tab_name);
    }

    async load_tab_results(tab_name) {
        const content_elem = document.getElementById(`${tab_name}-results`);
        if (!content_elem) return;

        const data = await this.fetch_results(tab_name);
        if (data) {
            content_elem.textContent = JSON.stringify(data, null, 2);
        }
    }

    async fetch_logs() {
        try {
            const response = await fetch(`${this.api_base}/api/logs`);
            if (!response.ok) throw new Error('Logs fetch failed');

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return null;
        }
    }

    log_prayer(event_type, agent, message) {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const log_entry = `[${timestamp}] [${agent}] [${event_type}] ${message}`;

        this.log_lines.push(log_entry);
        if (this.log_lines.length > this.max_logs) {
            this.log_lines.shift();
        }

        this.render_logs();
        console.log(log_entry);
    }

    render_logs() {
        const container = document.getElementById('log-container');
        if (!container) return;

        container.innerHTML = this.log_lines
            .map(line => {
                const classes = [];
                if (line.includes('[error]')) classes.push('error');
                if (line.includes('[invoke]')) classes.push('invoke');
                if (line.includes('[response]')) classes.push('response');

                return `<div class="log-entry ${classes.join(' ')}">${this.escape_html(line)}</div>`;
            })
            .join('');

        // Auto-scroll to bottom
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
        const phases = {
            'idle': '⚫ Idle',
            'recon': '🔍 Reconnaissance',
            'recon_complete': '✓ Recon Complete',
            'exploit': '⚔️ Exploitation',
            'exploit_complete': '✓ Exploit Complete',
            'detection': '🔔 Detection',
            'detection_complete': '✓ Detection Complete',
            'hardening': '🛡️ Hardening',
            'hardening_complete': '✓ Hardening Complete',
            'integration': '🔄 Integration'
        };
        return phases[phase] || phase;
    }

    format_time_ago(iso_time) {
        const now = new Date();
        const time = new Date(iso_time);
        const seconds = Math.floor((now - time) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    update_timestamp() {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        document.getElementById('last-update').textContent = now;
    }

    escape_html(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.temple = new TempleController();
});
