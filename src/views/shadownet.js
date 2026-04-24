import { shadowNetState, GHOST_TRUCKS, MICRO_WAREHOUSES, GIG_WORKER_POOLS } from '../data/shadowNetResources.js';
import { DISRUPTION_SCENARIO } from '../data/supplyChainGraph.js';

export function renderShadowNet(container, app) {
  const state = shadowNetState.state;
  const isActive = state === 'ACTIVE';
  const resources = shadowNetState.selectedResources;

  container.innerHTML = `
<div class="animate-fade-in">

  <!-- BANNER -->
  <div class="shadow-net-activate-banner ${isActive ? 'active-state' : ''}">
    <div class="banner-icon">${isActive ? '🕸️' : '👻'}</div>
    <div class="banner-content">
      <div class="banner-title">${isActive ? 'Shadow Net — ACTIVE' : 'Shadow Net — DORMANT'}</div>
      <div class="banner-sub">${isActive
        ? `Ghost capacity secured · ${resources.trucks?.length||0} trucks · ${resources.warehouses?.length||0} micro-warehouses · ${resources.gigPools?.length||0} gig pools`
        : 'Invisible backup logistics network · Activates automatically on disruption detection'
      }</div>
    </div>
    <button class="btn btn-lg ${isActive ? 'btn-danger' : 'btn-purple'}" id="sn-toggle">
      ${isActive ? '⏹ Deactivate Shadow Net' : '▶ Activate Shadow Net'}
    </button>
  </div>

  <!-- STATE MACHINE -->
  <div class="glass-card" style="padding:20px;margin-bottom:16px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:12px">State Machine</div>
    <div class="shadow-net-state-machine" id="state-machine">
      ${renderStateMachine(state)}
    </div>
  </div>

  <div class="grid-2">

    <!-- LEFT: RESOURCES -->
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">👻 Ghost Capacity — Empty Backhauls</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${GHOST_TRUCKS.map((t,i) => truckCard(t, isActive && i===0)).join('')}
        </div>
      </div>

      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">🏪 Micro-Warehouses — Dark Stores</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${MICRO_WAREHOUSES.map((w,i) => warehouseCard(w, isActive && i<2)).join('')}
        </div>
      </div>
    </div>

    <!-- RIGHT: GIG POOLS + TIMELINE + SEMANTIC -->
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

      <!-- TIMELINE -->
      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">📅 Activation Timeline</div>
        ${shadowNetState.activationTimeline.length === 0
          ? `<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:20px 0">No activations recorded</div>`
          : `<div class="activation-timeline">
              ${shadowNetState.activationTimeline.map((e,i) => `
              <div class="timeline-event done">
                <div class="timeline-time">${e.time}</div>
                <div class="timeline-action">${e.from} → ${e.to}</div>
                <div class="timeline-detail">State transition recorded</div>
              </div>`).join('')}
            </div>`
        }
        ${isActive ? `
        <div style="margin-top:12px;padding:12px;background:rgba(139,92,246,.08);border-radius:10px;border:1px solid rgba(139,92,246,.2)">
          <div style="font-size:12px;font-weight:700;color:var(--accent-purple);margin-bottom:6px">🕸️ Shadow Net Impact Estimate</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            ${['Delay Mitigation: 18hrs','Cost Delta: +₹2.4L','SLA Preserved: 86%','CO₂ Delta: +8.5%'].map(s=>`
            <div style="font-size:11px;color:var(--text-secondary);padding:4px 0">${s}</div>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- SEMANTIC SUBSTITUTION -->
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

  document.getElementById('sn-toggle')?.addEventListener('click', async () => {
    const btn = document.getElementById('sn-toggle');
    if (btn) btn.disabled = true;
    if (shadowNetState.state === 'DORMANT') {
      await shadowNetState.activate();
    } else if (shadowNetState.state === 'ACTIVE') {
      await shadowNetState.deactivate();
    }
    // Re-render
    const el = document.getElementById('view-shadownet');
    if (el) { el.dataset.rendered = ''; el.innerHTML = ''; }
    renderShadowNet(document.getElementById('view-shadownet'), app);
    document.getElementById('view-shadownet').dataset.rendered = '1';
  });

  // Update state machine during transitions
  shadowNetState.on('state-change', ({ to }) => {
    const sm = document.getElementById('state-machine');
    if (sm) sm.innerHTML = renderStateMachine(to);
  });
}

function renderStateMachine(current) {
  const states = ['DORMANT','SCANNING','ACTIVATING','ACTIVE','DEACTIVATING'];
  const icons  = { DORMANT:'💤', SCANNING:'🔍', ACTIVATING:'⚡', ACTIVE:'🕸️', DEACTIVATING:'⏹' };
  const ci = states.indexOf(current);
  return states.map((s, i) => `
    <div class="state-node ${i===ci?'current '+(s==='ACTIVE'?'':'')+(s==='ACTIVATING'?'purple':'')+(s==='ACTIVE'?'purple':'') : i<ci?'passed':''}" >
      <div class="state-node-icon">${icons[s]}</div>
      <div class="state-node-label">${s}</div>
    </div>
    ${i < states.length-1 ? `<div class="state-arrow ${i<ci?'active':''}">→</div>` : ''}
  `).join('');
}

function truckCard(truck, active) {
  const pct = Math.round(truck.availableCapacity / truck.capacity * 100);
  return `<div class="shadow-resource-card ${active?'active':''}">
    <div class="resource-card-header">
      <div>
        <div class="resource-name">${truck.name}</div>
        <div class="resource-detail">🚛 ${truck.route}</div>
      </div>
      <div>
        <div class="resource-type-badge resource-type-ghost">GHOST</div>
        ${active ? `<div style="font-size:9px;color:var(--status-green);margin-top:4px;font-weight:700">● BOOKED</div>` : ''}
      </div>
    </div>
    <div class="resource-metrics">
      <div class="resource-metric"><div class="resource-metric-value">${truck.availableCapacity}T</div><div class="resource-metric-label">Available</div></div>
      <div class="resource-metric"><div class="resource-metric-value">${truck.eta}hr</div><div class="resource-metric-label">ETA</div></div>
      <div class="resource-metric"><div class="resource-metric-value">${truck.reliability}%</div><div class="resource-metric-label">Reliability</div></div>
    </div>
  </div>`;
}

function warehouseCard(wh, active) {
  return `<div class="shadow-resource-card ${active?'active':''}">
    <div class="resource-card-header">
      <div>
        <div class="resource-name">${wh.name}</div>
        <div class="resource-detail">📍 ${wh.location} · ${wh.area.toLocaleString()} sq.ft</div>
      </div>
      <div>
        <div class="resource-type-badge resource-type-micro">MICRO</div>
        ${active ? `<div style="font-size:9px;color:var(--status-green);margin-top:4px;font-weight:700">● RENTED</div>` : ''}
      </div>
    </div>
    <div class="resource-metrics">
      <div class="resource-metric"><div class="resource-metric-value">${wh.capacity.toLocaleString()}</div><div class="resource-metric-label">Capacity</div></div>
      <div class="resource-metric"><div class="resource-metric-value">₹${(wh.dailyRate/1000).toFixed(0)}K</div><div class="resource-metric-label">/day</div></div>
      <div class="resource-metric"><div class="resource-metric-value">${wh.availability}</div><div class="resource-metric-label">Available</div></div>
    </div>
  </div>`;
}
