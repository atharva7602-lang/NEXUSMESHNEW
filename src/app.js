import { telemetrySimulator } from './data/telemetrySimulator.js';
import { NODES, EDGES } from './data/supplyChainGraph.js';
import { runGNNPropagation } from './engine/gnnSimulator.js';
import { shadowNetState } from './data/shadowNetResources.js';
import { newsSimulator } from './engine/newsSimulator.js';
import { renderDashboard } from './views/dashboard.js';
import { renderNetwork } from './views/network.js';
import { renderShadowNet } from './views/shadownet.js';
import { renderSimulations } from './views/simulations.js';
import { renderTelemetry } from './views/telemetry.js';
import { renderSLA } from './views/sla.js';
import { initAIChat } from './components/AIChat.js';
import { initEventTicker } from './components/EventTicker.js';

export class App {
  constructor(root) {
    this.root = root;
    this.currentView = 'dashboard';
    this.sidebarCollapsed = false;
    this.alertCount = 3;
    this.globalRisk = 24;
    this.simulationResults = null;
    this.disruptionActive = false;
    this.gnnResults = null;
    this.activeScenario = null;
    this._ticker = null;
    this._mapInstances = {};
  }

  init() {
    this.root.innerHTML = this._shell();
    this._bindNav();
    this._bindHeader();
    this.navigate('dashboard');
    telemetrySimulator.start(1200);
    telemetrySimulator.on('update', () => this._onTelemetryUpdate());
    shadowNetState.on('state-change', (e) => this._onShadowNetChange(e));

    // Init AI Chat widget
    initAIChat(this);

    // Init Bloomberg ticker
    this._ticker = initEventTicker(this, () =>
      newsSimulator.getTickerItems(this.activeScenario)
    );
  }

  _shell() {
    return `
<div class="dashboard-layout" id="layout">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="4" fill="#00f0ff"/>
          <circle cx="6" cy="8" r="3" fill="#8b5cf6"/>
          <circle cx="26" cy="8" r="3" fill="#8b5cf6"/>
          <circle cx="6" cy="24" r="3" fill="#8b5cf6"/>
          <circle cx="26" cy="24" r="3" fill="#8b5cf6"/>
          <line x1="16" y1="16" x2="6" y2="8" stroke="#00f0ff" stroke-width="1.5" opacity=".7"/>
          <line x1="16" y1="16" x2="26" y2="8" stroke="#00f0ff" stroke-width="1.5" opacity=".7"/>
          <line x1="16" y1="16" x2="6" y2="24" stroke="#00f0ff" stroke-width="1.5" opacity=".7"/>
          <line x1="16" y1="16" x2="26" y2="24" stroke="#00f0ff" stroke-width="1.5" opacity=".7"/>
        </svg>
      </div>
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-title">NexusMesh</div>
        <div class="sidebar-logo-sub">Supply Chain AI</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Command Center</div>
      <div class="nav-item active" data-view="dashboard">
        <span class="nav-item-icon">📊</span>
        <span class="nav-item-label">Dashboard</span>
      </div>
      <div class="nav-item" data-view="network">
        <span class="nav-item-icon">🗺️</span>
        <span class="nav-item-label">Live Map</span>
      </div>
      <div class="nav-section-label">Intelligence</div>
      <div class="nav-item shadow-net-item" data-view="shadownet">
        <span class="nav-item-icon">👻</span>
        <span class="nav-item-label">Shadow Net</span>
      </div>
      <div class="nav-item" data-view="simulations">
        <span class="nav-item-icon">🎲</span>
        <span class="nav-item-label">Simulations</span>
      </div>
      <div class="nav-section-label">Monitoring</div>
      <div class="nav-item" data-view="telemetry">
        <span class="nav-item-icon">📡</span>
        <span class="nav-item-label">Dark Matter</span>
      </div>
      <div class="nav-item" data-view="sla">
        <span class="nav-item-icon">✨</span>
        <span class="nav-item-label">Gemini SLA</span>
        <span class="nav-badge" id="sla-badge">NEW</span>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="system-status">
        <div class="status-dot green animate-pulse-dot"></div>
        <div class="system-status-text">
          <div class="system-status-label">System Status</div>
          <div class="system-status-value" id="sys-status">All Systems Online</div>
        </div>
      </div>
    </div>
  </aside>

  <header class="header" id="header">
    <button class="header-icon-btn sidebar-toggle" id="sidebar-toggle" title="Toggle sidebar">☰</button>
    <div class="header-title">
      <div class="header-page-name" id="page-name">Dashboard</div>
      <div class="header-page-sub" id="page-sub">Real-time supply chain intelligence</div>
    </div>
    <div class="header-actions">
      <div class="header-risk-gauge">
        <div>
          <div class="risk-score-label">Global Risk</div>
          <div class="risk-score-value" id="global-risk" style="color:var(--status-green)">24</div>
        </div>
      </div>
      <div class="shadow-net-badge dormant" id="sn-badge">
        <div class="status-dot cyan animate-pulse-dot"></div>
        <span>Shadow Net: DORMANT</span>
      </div>
      <div class="header-icon-btn" id="disrupt-btn" title="Simulate news-based disruption" style="background:linear-gradient(135deg,rgba(255,23,68,0.15),rgba(255,23,68,0.05));border-color:var(--status-red);color:var(--status-red);width:auto;padding:0 12px;gap:6px;font-size:12px;font-weight:700">
        ⚡ SIMULATE DISRUPTION
      </div>
      <div class="header-icon-btn" id="bell-btn" title="Alerts">
        🔔
        <span class="header-bell-count" id="bell-count">3</span>
      </div>
    </div>
  </header>

  <main class="main-content" id="main-content">
    <div class="view active" id="view-dashboard"></div>
    <div class="view" id="view-network"></div>
    <div class="view" id="view-shadownet"></div>
    <div class="view" id="view-simulations"></div>
    <div class="view" id="view-telemetry"></div>
    <div class="view" id="view-sla"></div>
  </main>
</div>`;
  }

  _bindNav() {
    document.querySelectorAll('.nav-item[data-view]').forEach(el => {
      el.addEventListener('click', () => this.navigate(el.dataset.view));
    });
  }

  _bindHeader() {
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => this._toggleSidebar());
    document.getElementById('disrupt-btn')?.addEventListener('click', () => this._runNewsDisruption());
  }

  navigate(view) {
    this.currentView = view;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === `view-${view}`));

    const titles = {
      dashboard:   ['Dashboard', 'Real-time supply chain intelligence'],
      network:     ['Live Supply Chain Map', 'Interactive geographic visualization with India state boundaries'],
      shadownet:   ['Shadow Net', 'Ghost logistics activation and monitoring'],
      simulations: ['News-Driven Simulations', 'Real-time global disruption scenario analysis'],
      telemetry:   ['Dark Matter Signals', 'Worker behavioral telemetry from Edge TPUs'],
      sla:         ['Gemini SLA Engine', 'Autonomous legal and logistics document generation'],
    };
    const [name, sub] = titles[view] || ['Dashboard', ''];
    document.getElementById('page-name').textContent = name;
    document.getElementById('page-sub').textContent = sub;

    const container = document.getElementById(`view-${view}`);
    if (container && !container.dataset.rendered) {
      this._renderView(view, container);
      container.dataset.rendered = '1';
    }
  }

  _renderView(view, container) {
    switch (view) {
      case 'dashboard':   renderDashboard(container, this); break;
      case 'network':     renderNetwork(container, this); break;
      case 'shadownet':   renderShadowNet(container, this); break;
      case 'simulations': renderSimulations(container, this); break;
      case 'telemetry':   renderTelemetry(container, this); break;
      case 'sla':         renderSLA(container, this); break;
    }
  }

  _toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    document.getElementById('sidebar')?.classList.toggle('collapsed', this.sidebarCollapsed);
    document.getElementById('layout')?.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
  }

  async _runNewsDisruption(specificId = null) {
    if (this.disruptionActive) {
      // Allow reset: clear and run new scenario
      this.disruptionActive = false;
      this.activeScenario = null;
    }
    this.disruptionActive = true;

    // Pick a fresh random scenario from news simulator
    const scenario = newsSimulator.triggerNewsDisruption(this.activeScenario?.id);
    this.activeScenario = scenario;

    this._showToast(`📰 ${scenario.source}: ${scenario.headline}`, 'red');
    telemetrySimulator.triggerAnomaly('wh-dhaka');

    await this._delay(1500);

    this.gnnResults = runGNNPropagation({
      nodes: NODES, edges: EDGES,
      disruptionNodeId: scenario.origin,
      signals: scenario.signals,
    });

    this.globalRisk = scenario.riskBoost;
    this._updateRiskDisplay();
    this.alertCount += 4;
    const bellEl = document.getElementById('bell-count');
    if (bellEl) bellEl.textContent = this.alertCount;
    this._showToast(`🧠 GNN propagation — ${scenario.riskBoost}% global risk detected across ${scenario.propagationPath.length} nodes`, 'amber');

    // Re-render all views
    ['dashboard','network','shadownet','simulations','sla','telemetry'].forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) { el.dataset.rendered = ''; el.innerHTML = ''; }
      if (v === this.currentView) this._renderView(v, el);
    });

    // Update map instances if any are alive
    Object.values(this._mapInstances).forEach(m => {
      if (m && m.nexusUpdate) m.nexusUpdate(scenario);
    });

    // Reset simulation state for fresh run
    this.simulationResults = null;
    this.selectedRouteId = null;
    this.routeResolved = false;
    this.altRouteNodes = null;

    // Refresh ticker
    if (this._ticker) this._ticker.refresh();

    // Notify AI chat
    if (window._aiChatNotify) window._aiChatNotify();

    await this._delay(1000);
    this._showToast(`🕸️ Activate Shadow Net to find alternate routes around ${scenario.region}`, 'purple');

    // Auto-navigate to Shadow Net so user can activate it
    await this._delay(800);
    document.querySelector('[data-view=shadownet]')?.click();

    const slaEl = document.getElementById('sla-badge');
    if (slaEl) slaEl.textContent = 'NEW';
  }

  _onTelemetryUpdate() {
    if (this.currentView === 'telemetry') {
      const el = document.getElementById('view-telemetry');
      if (el?.dataset.rendered) {
        const dhaka = telemetrySimulator.getDhaka();
        const h = el.querySelector('#tel-hesitation');
        const r = el.querySelector('#tel-rescan');
        const f = el.querySelector('#tel-fatigue');
        if (h) h.textContent = Math.round(dhaka?.current?.scanHesitation || 0) + ' ms';
        if (r) r.textContent = (dhaka?.current?.reScanRate || 0).toFixed(1) + '%';
        if (f) f.textContent = Math.round(dhaka?.current?.workerFatigue || 0);
      }
    }
  }

  _onShadowNetChange({ to }) {
    const badge = document.getElementById('sn-badge');
    if (!badge) return;
    badge.className = `shadow-net-badge ${to === 'ACTIVE' ? 'active' : 'dormant'}`;
    badge.innerHTML = `<div class="status-dot cyan animate-pulse-dot"></div><span>Shadow Net: ${to}</span>`;
    if (to === 'ACTIVE') this._showToast('🕸️ SHADOW NET ACTIVE — Ghost capacity secured!', 'purple');
  }

  _updateRiskDisplay() {
    const el = document.getElementById('global-risk');
    if (!el) return;
    el.textContent = this.globalRisk;
    el.style.color = this.globalRisk > 65 ? 'var(--status-red)' : this.globalRisk > 40 ? 'var(--status-amber)' : 'var(--status-green)';
  }

  _showToast(msg, type = 'cyan') {
    const colors = { cyan: '#00f0ff', red: '#ff1744', amber: '#ffab00', purple: '#8b5cf6' };
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:58px;right:24px;z-index:9999;background:var(--bg-raised);border:1px solid ${colors[type]};border-radius:12px;padding:14px 20px;font-size:13px;font-weight:600;color:${colors[type]};box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:slideInRight .3s ease;max-width:380px;line-height:1.4;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 5000);
  }

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}
