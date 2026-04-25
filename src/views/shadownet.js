import { shadowNetState, GHOST_TRUCKS, MICRO_WAREHOUSES, GIG_WORKER_POOLS } from '../data/shadowNetResources.js';
import { NODES } from '../data/supplyChainGraph.js';

export function renderShadowNet(container, app) {
  const state = shadowNetState.state;
  const isActive = state === 'ACTIVE';
  const resources = shadowNetState.selectedResources;
  const scenario = app.activeScenario;
  const isResolved = app.routeResolved;

  // Pick best alternative route nodes from the active scenario
  const bestAltRoute = scenario?.alternativeNodes?.length
    ? [...scenario.alternativeNodes, ...(scenario.propagationPath?.slice(-1) || [])]
    : ['ghost-1', 'micro-1', 'dc-3', 'ret-1'];

  container.innerHTML = `
<div class="animate-fade-in">

  <!-- BANNER -->
  <div class="shadow-net-activate-banner ${isActive ? 'active-state' : ''} ${isResolved ? 'resolved-state' : ''}">
    <div class="banner-icon">${isResolved ? '✅' : isActive ? '🕸️' : '👻'}</div>
    <div class="banner-content">
      <div class="banner-title">${isResolved ? 'Shadow Net — ROUTE RESOLVED ✅' : isActive ? 'Shadow Net — ACTIVE' : 'Shadow Net — DORMANT'}</div>
      <div class="banner-sub">${isResolved
        ? `Alternative route secured · SLA preserved · Risk score normalized to GREEN`
        : isActive
          ? `Ghost capacity secured · ${resources.trucks?.length||0} trucks · ${resources.warehouses?.length||0} micro-warehouses · ${resources.gigPools?.length||0} gig pools`
          : 'Invisible backup logistics network · Activates automatically on disruption detection'
      }</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      ${isActive && !isResolved && scenario ? `
        <button class="btn btn-lg btn-success" id="sn-accept" style="background:linear-gradient(135deg,rgba(0,230,118,0.2),rgba(0,230,118,0.05));border-color:#00e676;color:#00e676;font-weight:800">
          ✅ Accept &amp; Execute Route
        </button>` : ''}
      <button class="btn btn-lg ${isResolved ? 'btn-ghost' : isActive ? 'btn-danger' : 'btn-purple'}" id="sn-toggle">
        ${isResolved ? '↺ Run New Simulation' : isActive ? '⏹ Deactivate Shadow Net' : '▶ Activate Shadow Net'}
      </button>
    </div>
  </div>

  <!-- RESOLVED STATE BANNER -->
  ${isResolved ? `
  <div style="background:linear-gradient(135deg,rgba(0,230,118,0.12),rgba(0,230,118,0.04));border:1px solid rgba(0,230,118,0.4);border-radius:16px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;gap:16px">
    <div style="font-size:40px">🟢</div>
    <div style="flex:1">
      <div style="font-size:16px;font-weight:800;color:#00e676">Alternative Route Successfully Activated</div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">
        NexusMesh has rerouted shipments via Shadow Net resources. Risk score has been normalized. SLA preserved.
        Check the <strong>Live Map</strong> to see the green safe route now active.
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-size:28px;font-weight:900;font-family:var(--font-mono);color:#00e676">${Math.max(12, (app.globalRisk || 82) - 55)}</div>
      <div style="font-size:10px;color:#00e676;text-transform:uppercase">New Risk Score</div>
    </div>
  </div>` : ''}

  <!-- ALTERNATIVE ROUTE PREVIEW ON MAP -->
  ${isActive && !isResolved && scenario ? `
  <div class="glass-card" style="padding:16px;margin-bottom:16px;border-color:rgba(139,92,246,0.3)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:13px;font-weight:700;color:var(--accent-purple);text-transform:uppercase;letter-spacing:.08em">👻 Proposed Alternative Route</div>
      <button class="btn btn-ghost" id="sn-preview-map" style="font-size:11px">🗺️ Show on Map</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      ${bestAltRoute.map(nodeId => {
        const node = NODES.find(n => n.id === nodeId);
        return node ? `<div style="display:flex;align-items:center;gap:4px">
          <span style="font-size:12px">${node.icon}</span>
          <span style="font-size:10px;font-weight:600;padding:3px 8px;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);border-radius:20px;color:#8b5cf6">${node.name.split(' ')[0]}</span>
          <span style="color:rgba(139,92,246,0.4);font-size:12px">→</span>
        </div>` : '';
      }).join('')}
      <span style="font-size:10px;font-weight:700;padding:3px 8px;background:rgba(0,230,118,0.12);border:1px solid rgba(0,230,118,0.3);border-radius:20px;color:#00e676">SAFE DESTINATION</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div style="background:var(--bg-surface);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:16px;font-weight:800;font-family:var(--font-mono);color:#8b5cf6">86%</div>
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">SLA Preserved</div>
      </div>
      <div style="background:var(--bg-surface);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:16px;font-weight:800;font-family:var(--font-mono);color:#ffab00">22hrs</div>
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Resolution Time</div>
      </div>
      <div style="background:var(--bg-surface);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:16px;font-weight:800;font-family:var(--font-mono);color:#00e676">+9.2%</div>
        <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Cost Delta</div>
      </div>
    </div>
  </div>` : ''}

  <!-- STATE MACHINE -->
  <div class="glass-card" style="padding:20px;margin-bottom:16px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:12px">State Machine</div>
    <div class="shadow-net-state-machine" id="state-machine">
      ${renderStateMachine(isResolved ? 'RESOLVED' : state)}
    </div>
  </div>

  <div class="grid-2">
    <!-- LEFT: RESOURCES -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">👻 Ghost Capacity — Empty Backhauls</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${GHOST_TRUCKS.map((t,i) => truckCard(t, isActive && i===0, isResolved)).join('')}
        </div>
      </div>
      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">🏪 Micro-Warehouses — Dark Stores</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${MICRO_WAREHOUSES.map((w,i) => warehouseCard(w, isActive && i<2, isResolved)).join('')}
        </div>
      </div>
    </div>

    <!-- RIGHT: GIG POOLS + TIMELINE -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">⚡ Gig Worker Pools — Last Mile</div>
        <div class="gig-pool-grid">
          ${GIG_WORKER_POOLS.map((g,i) => `
          <div class="gig-region-card ${isActive && i<2 ? 'available' : ''}">
            <div class="gig-region-name">${g.region}</div>
            <div class="gig-region-count">${isActive && i<2 ? g.available : '—'}</div>
            <div class="gig-region-label">${isActive && i<2 ? g.platform : 'Dormant'}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">📅 Activation Timeline</div>
        ${shadowNetState.activationTimeline.length === 0
          ? `<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:20px 0">No activations recorded</div>`
          : `<div class="activation-timeline">
              ${shadowNetState.activationTimeline.map(e => `
              <div class="timeline-event done">
                <div class="timeline-time">${e.time}</div>
                <div class="timeline-action">${e.from} → ${e.to}</div>
                <div class="timeline-detail">State transition recorded</div>
              </div>`).join('')}
            </div>`
        }
        ${isActive || isResolved ? `
        <div style="margin-top:12px;padding:12px;background:rgba(${isResolved?'0,230,118':'139,92,246'},.08);border-radius:10px;border:1px solid rgba(${isResolved?'0,230,118':'139,92,246'},.2)">
          <div style="font-size:12px;font-weight:700;color:${isResolved?'#00e676':'var(--accent-purple)'};margin-bottom:6px">${isResolved?'✅ Route Resolution Impact':'🕸️ Shadow Net Impact Estimate'}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            ${['Delay Mitigation: 18hrs','Cost Delta: +₹2.4L','SLA Preserved: 86%','CO₂ Delta: +8.5%'].map(s=>`
            <div style="font-size:11px;color:var(--text-secondary);padding:4px 0">${s}</div>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">🧬 Semantic Substitution (OmniWeave Axis)</div>
        <div style="padding:12px;background:rgba(247,37,133,.06);border-radius:10px;border:1px solid rgba(247,37,133,.2);margin-bottom:10px">
          <div style="font-size:11px;font-weight:700;color:var(--accent-magenta);margin-bottom:6px">AUTO-DETECTED SUBSTITUTE</div>
          <div style="font-size:13px;font-weight:700;color:var(--text-primary)">Gujarat Cotton Blend T-198</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">Chemical match: 99.1% · Tensile: 98.7% · Compliance: ✓ ISO 9001, OEKO-TEX</div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <div style="flex:1;text-align:center;padding:6px;background:rgba(0,0,0,.3);border-radius:6px">
              <div style="font-size:14px;font-weight:800;font-family:var(--font-mono);color:var(--status-green)">97.4%</div>
              <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Compatibility</div>
            </div>
            <div style="flex:1;text-align:center;padding:6px;background:rgba(0,0,0,.3);border-radius:6px">
              <div style="font-size:14px;font-weight:800;font-family:var(--font-mono);color:var(--status-amber)">+3.2%</div>
              <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Cost Delta</div>
            </div>
            <div style="flex:1;text-align:center;padding:6px;background:rgba(0,0,0,.3);border-radius:6px">
              <div style="font-size:14px;font-weight:800;font-family:var(--font-mono);color:var(--accent-cyan)">2 days</div>
              <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Lead Time</div>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost" style="width:100%;justify-content:center" onclick="document.querySelector('[data-view=sla]').click()">Generate Substitution Report in Gemini →</button>
      </div>
    </div>
  </div>
</div>`;

  // ── BIND EVENTS ───────────────────────────────────────────────
  document.getElementById('sn-toggle')?.addEventListener('click', async () => {
    const btn = document.getElementById('sn-toggle');
    if (btn) btn.disabled = true;
    if (isResolved) {
      // Reset everything
      app.routeResolved = false;
      app.altRouteNodes = null;
      app.disruptionActive = false;
      app.activeScenario = null;
      app.globalRisk = 24;
      app._updateRiskDisplay?.();
      Object.values(app._mapInstances || {}).forEach(m => { if (m?.nexusUpdate) m.nexusUpdate(null); });
    } else if (shadowNetState.state === 'DORMANT') {
      await shadowNetState.activate();
      // Auto-navigate to Simulations tab to run counterfactual analysis
      _rerender(app);
      app._showToast?.('🕸️ Shadow Net ACTIVE — redirecting to Simulation Engine to find alternate routes...', 'purple');
      setTimeout(() => {
        document.querySelector('[data-view=simulations]')?.click();
      }, 800);
      return;  // skip re-render below, we're navigating away
    } else if (shadowNetState.state === 'ACTIVE') {
      await shadowNetState.deactivate();
    }
    _rerender(app);
  });

  // Accept & Execute → green route
  document.getElementById('sn-accept')?.addEventListener('click', () => {
    app.routeResolved = true;
    app.disruptionActive = false;
    const newRisk = Math.max(12, (app.globalRisk || 82) - 55);
    app.globalRisk = newRisk;
    app._updateRiskDisplay?.();

    // Update all map instances to green resolved state
    Object.values(app._mapInstances || {}).forEach(m => {
      if (m?.nexusResolve) m.nexusResolve(app.activeScenario, app.altRouteNodes || bestAltRoute);
    });

    // Update ticker
    if (app._ticker) app._ticker.refresh();
    app._showToast?.('✅ Alternative route ACCEPTED — map updated to green safe route. Risk score normalized.', 'cyan');
    _rerender(app);
  });

  // Preview on map button
  document.getElementById('sn-preview-map')?.addEventListener('click', () => {
    Object.values(app._mapInstances || {}).forEach(m => {
      if (m?.nexusShowAlternative) m.nexusShowAlternative(app.activeScenario, bestAltRoute);
    });
    app._showToast?.('🗺️ Purple alternative route shown on all maps', 'purple');
    // Switch to map view
    document.querySelector('[data-view=network]')?.click();
  });

  shadowNetState.on('state-change', ({ to }) => {
    const sm = document.getElementById('state-machine');
    if (sm) sm.innerHTML = renderStateMachine(to);
  });
}

function _rerender(app) {
  const el = document.getElementById('view-shadownet');
  if (el) { el.dataset.rendered = ''; el.innerHTML = ''; }
  renderShadowNet(document.getElementById('view-shadownet'), app);
  document.getElementById('view-shadownet').dataset.rendered = '1';
}

function renderStateMachine(current) {
  const states = ['DORMANT','SCANNING','ACTIVATING','ACTIVE','RESOLVED'];
  const icons  = { DORMANT:'💤', SCANNING:'🔍', ACTIVATING:'⚡', ACTIVE:'🕸️', RESOLVED:'✅' };
  const ci = states.indexOf(current === 'DEACTIVATING' ? 'ACTIVE' : current);
  return states.map((s, i) => `
    <div class="state-node ${i===ci?'current '+(s==='ACTIVE'||s==='RESOLVED'?'purple':'') : i<ci?'passed':''}">
      <div class="state-node-icon">${icons[s]}</div>
      <div class="state-node-label">${s}</div>
    </div>
    ${i < states.length-1 ? `<div class="state-arrow ${i<ci?'active':''}">→</div>` : ''}
  `).join('');
}

function truckCard(truck, active, resolved) {
  const statusColor = resolved && active ? '#00e676' : active ? '#8b5cf6' : 'var(--text-muted)';
  const statusLabel = resolved && active ? '● ROUTE ACTIVE' : active ? '● BOOKED' : '○ IDLE';
  return `<div class="shadow-resource-card ${active?'active':''}">
    <div class="resource-card-header">
      <div>
        <div class="resource-name">${truck.name}</div>
        <div class="resource-detail">🚛 ${truck.route}</div>
      </div>
      <div>
        <div class="resource-type-badge resource-type-ghost">GHOST</div>
        ${active ? `<div style="font-size:9px;color:${statusColor};margin-top:4px;font-weight:700">${statusLabel}</div>` : ''}
      </div>
    </div>
    <div class="resource-metrics">
      <div class="resource-metric"><div class="resource-metric-value">${truck.availableCapacity}T</div><div class="resource-metric-label">Available</div></div>
      <div class="resource-metric"><div class="resource-metric-value">${truck.eta}hr</div><div class="resource-metric-label">ETA</div></div>
      <div class="resource-metric"><div class="resource-metric-value">${truck.reliability}%</div><div class="resource-metric-label">Reliability</div></div>
    </div>
  </div>`;
}

function warehouseCard(wh, active, resolved) {
  const statusColor = resolved && active ? '#00e676' : active ? '#8b5cf6' : 'var(--text-muted)';
  const statusLabel = resolved && active ? '● ACTIVE' : active ? '● RENTED' : '○ IDLE';
  return `<div class="shadow-resource-card ${active?'active':''}">
    <div class="resource-card-header">
      <div>
        <div class="resource-name">${wh.name}</div>
        <div class="resource-detail">📍 ${wh.location} · ${wh.area.toLocaleString()} sq.ft</div>
      </div>
      <div>
        <div class="resource-type-badge resource-type-micro">MICRO</div>
        ${active ? `<div style="font-size:9px;color:${statusColor};margin-top:4px;font-weight:700">${statusLabel}</div>` : ''}
      </div>
    </div>
    <div class="resource-metrics">
      <div class="resource-metric"><div class="resource-metric-value">${wh.capacity.toLocaleString()}</div><div class="resource-metric-label">Capacity</div></div>
      <div class="resource-metric"><div class="resource-metric-value">₹${(wh.dailyRate/1000).toFixed(0)}K</div><div class="resource-metric-label">/day</div></div>
      <div class="resource-metric"><div class="resource-metric-value">${wh.availability}</div><div class="resource-metric-label">Available</div></div>
    </div>
  </div>`;
}
