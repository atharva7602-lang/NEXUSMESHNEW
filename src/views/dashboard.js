import { telemetrySimulator } from '../data/telemetrySimulator.js';
import { DISRUPTION_SCENARIO } from '../data/supplyChainGraph.js';
import { createGeoMap } from '../components/GeoMap.js';

export function renderDashboard(container, app) {
  const risk = app.globalRisk;
  const disrupted = app.disruptionActive;
  const riskColor = risk > 65 ? 'var(--status-red)' : risk > 40 ? 'var(--status-amber)' : 'var(--status-green)';

  container.innerHTML = `
<div class="animate-fade-in">

  <!-- DISRUPTION BANNER -->
  ${disrupted ? `
  <div style="background:linear-gradient(135deg,rgba(255,23,68,0.12),rgba(255,171,0,0.06));border:1px solid rgba(255,23,68,0.4);border-radius:16px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;animation:glow-red 2s ease-in-out infinite">
    <div style="display:flex;align-items:center;gap:16px">
      <div style="font-size:32px">🚨</div>
      <div>
        <div style="font-size:16px;font-weight:800;color:var(--status-red)">DISRUPTION DETECTED — Dhaka Border Blockage</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">${DISRUPTION_SCENARIO.workerTelemetrySignal}</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-shrink:0">
      <button class="btn btn-danger" onclick="document.querySelector('[data-view=shadownet]').click()">Activate Shadow Net →</button>
      <button class="btn btn-primary" onclick="document.querySelector('[data-view=simulations]').click()">Run Simulations →</button>
    </div>
  </div>` : ''}

  <!-- METRIC CARDS -->
  <div class="grid-4" style="margin-bottom:24px">
    ${metricCard('🌐','Global Risk Score', risk, riskColor, disrupted ? '↑ +58 from disruption' : '↓ Nominal range', disrupted ? 'up' : 'down', 'linear-gradient(135deg,'+(risk>65?'#ff1744':'#00f0ff')+','+(risk>65?'#ff4081':'#8b5cf6')+')')}
    ${metricCard('⚡','Active Disruptions', disrupted ? 1 : 0, disrupted ? 'var(--status-red)' : 'var(--status-green)', disrupted ? '↑ Dhaka border blockage' : '↓ All nodes healthy', disrupted ? 'up' : 'neutral', 'linear-gradient(135deg,#ff1744,#f72585)')}
    ${metricCard('👻','Shadow Net Status', disrupted ? 'READY' : 'DORMANT', 'var(--accent-purple)', disrupted ? '↑ Resources identified' : '↓ Background monitoring', 'neutral', 'linear-gradient(135deg,#8b5cf6,#3b82f6)')}
    ${metricCard('✅','Resolution Rate', '94.7%', 'var(--status-green)', '↓ +2.1% this quarter', 'down', 'linear-gradient(135deg,#00e676,#14b8a6)')}
  </div>

  <!-- MAIN GRID -->
  <div class="grid-main">
    <!-- LEFT: GEOGRAPHIC MAP -->
    <div class="glass-card panel-card">
      <div class="panel-card-header">
        <div>
          <div class="section-title">🗺️ Live Supply Chain Map</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">25 nodes · India states · ${app.activeScenario ? '🚨 Disruption active — click map markers' : 'Live GNN risk scoring'}</div>
        </div>
        <button class="btn btn-ghost" onclick="document.querySelector('[data-view=network]').click()">Full View →</button>
      </div>
      <div id="dashboard-geo-map" style="height:340px;border-radius:12px;overflow:hidden;border:1px solid var(--border-subtle)"></div>
    </div>

    <!-- RIGHT COLUMN -->
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- GNN FORMULA -->
      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">🧠 GNN Propagation Model</div>
        <div class="formula-block">P(Sⱼ|Sᵢ) = σ(W·[hᵢ‖eᵢⱼ]+b) · e<sup>−λΔt</sup></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
          ${gnnParam('hᵢ','Fused anomaly vector (SAR+Sentiment+Telemetry)','var(--accent-cyan)')}
          ${gnnParam('eᵢⱼ','Edge constraints (lead time, SLA trust score)','var(--accent-purple)')}
          ${gnnParam('λ','Decay factor = 0.08','var(--status-amber)')}
          ${gnnParam('σ','Sigmoid activation function','var(--status-green)')}
        </div>
      </div>

      <!-- ALERT FEED -->
      <div class="glass-card" style="padding:20px;flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">🚨 Live Alert Feed</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto">
          ${alertItem('CRITICAL','Dark Matter','Dhaka scan hesitation +340% — anomaly confidence 91%','2 min ago','red', disrupted)}
          ${alertItem('WARNING','GNN Engine','Propagation to dc-1, dc-3, ret-1 predicted within 18hrs','4 min ago','amber', disrupted)}
          ${alertItem('INFO','Shadow Net','Ghost capacity identified: TL-7724 (Kolkata→Delhi)','6 min ago','cyan', disrupted)}
          ${alertItem('INFO','Sentiment','Negative trade news spike detected — Bangladesh border','12 min ago','cyan', true)}
          ${alertItem('LOW','Telemetry','Mumbai hub throughput nominal — 1,847 items/hr','18 min ago','green', true)}
        </div>
      </div>

      <!-- DARK MATTER MINI -->
      <div class="glass-card" style="padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">📡 Dark Matter Signal</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="text-align:center;padding:12px;background:var(--bg-surface);border-radius:10px;border:1px solid ${disrupted?'rgba(255,23,68,.3)':'var(--border-subtle)'}">
            <div style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:${disrupted?'var(--status-red)':'var(--accent-cyan)'}" id="db-scan">${disrupted?'1,088':'324'} ms</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:.06em">Scan Hesitation</div>
          </div>
          <div style="text-align:center;padding:12px;background:var(--bg-surface);border-radius:10px;border:1px solid ${disrupted?'rgba(255,23,68,.3)':'var(--border-subtle)'}">
            <div style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:${disrupted?'var(--status-red)':'var(--status-green)'}" id="db-rescan">${disrupted?'11.4':'2.1'}%</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:.06em">Re-scan Rate</div>
          </div>
        </div>
        <button class="btn btn-ghost" style="width:100%;margin-top:10px;justify-content:center" onclick="document.querySelector('[data-view=telemetry]').click()">View Full Telemetry →</button>
      </div>
    </div>
  </div>

  <!-- BOTTOM STATS -->
  <div class="grid-3" style="margin-top:24px">
    ${statCard('🛰️','SAR Signal','Sentinel-1 feed active','No anomalies detected in port areas','green')}
    ${statCard('📰','Sentiment Index','NLP stream: 847 articles/hr','Bangladesh trade sentiment: NEGATIVE ▼','red', disrupted)}
    ${statCard('🔄','Counterfactual Engine','10,000 scenarios ready','Dual-axis freedom: Routing + Substitution','cyan')}
  </div>
</div>`;

  // Init compact geographic map
  const dashMap = createGeoMap('dashboard-geo-map', app, { compact: true });
  app._mapInstances = app._mapInstances || {};
  app._mapInstances['dashboard'] = dashMap;
  if (app.activeScenario) dashMap.nexusUpdate(app.activeScenario);
}

function metricCard(icon, label, value, color, trend, trendDir, gradient) {
  return `
<div class="glass-card metric-card delay-${Math.floor(Math.random()*4)+1}">
  <div class="metric-card-accent" style="background:${gradient}"></div>
  <div class="metric-card-icon" style="background:${gradient.replace('linear-gradient','radial-gradient')};opacity:.15;position:absolute;top:20px;right:20px"></div>
  <div style="font-size:24px;margin-bottom:8px">${icon}</div>
  <div class="metric-label">${label}</div>
  <div class="metric-value" style="color:${color}">${value}</div>
  <div class="metric-trend ${trendDir}">${trend}</div>
</div>`;
}

function gnnParam(sym, desc, color) {
  return `<div style="padding:8px;background:rgba(0,0,0,.3);border-radius:8px;border-left:2px solid ${color}">
    <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:${color}">${sym}</div>
    <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${desc}</div>
  </div>`;
}

function alertItem(level, source, msg, time, type, show = true) {
  if (!show && type !== 'green') return '';
  const colors = { red:'var(--status-red)', amber:'var(--status-amber)', cyan:'var(--accent-cyan)', green:'var(--status-green)' };
  return `<div style="padding:10px 12px;background:var(--bg-surface);border-radius:8px;border-left:2px solid ${colors[type]};display:flex;gap:10px;align-items:flex-start">
    <div class="status-dot ${type}" style="margin-top:4px"></div>
    <div style="flex:1">
      <div style="display:flex;justify-content:space-between;margin-bottom:2px">
        <span style="font-size:10px;font-weight:700;color:${colors[type]};text-transform:uppercase">${level} · ${source}</span>
        <span style="font-size:10px;color:var(--text-muted)">${time}</span>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">${msg}</div>
    </div>
  </div>`;
}

function statCard(icon, title, sub, detail, type, active = true) {
  if (!active) type = 'green';
  const colors = { green:'var(--status-green)', red:'var(--status-red)', cyan:'var(--accent-cyan)', amber:'var(--status-amber)' };
  return `<div class="glass-card" style="padding:20px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="font-size:24px">${icon}</div>
      <div>
        <div style="font-weight:700;font-size:14px">${title}</div>
        <div style="font-size:11px;color:var(--text-muted)">${sub}</div>
      </div>
      <div class="status-dot ${type}" style="margin-left:auto"></div>
    </div>
    <div style="font-size:12px;color:${colors[type]};font-weight:600">${detail}</div>
  </div>`;
}

function drawMiniNetwork(app) {
  const canvas = document.getElementById('mini-canvas');
  if (!canvas) return;
  const container = document.getElementById('mini-network');
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight || 340;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Simple force-like positions for mini map
  const positions = {
    'rm-1':[0.15,0.3], 'rm-2':[0.1,0.5], 'rm-3':[0.05,0.7],
    'mfg-1':[0.28,0.25], 'mfg-2':[0.28,0.45], 'mfg-3':[0.28,0.65],
    'mfg-4':[0.28,0.35], 'mfg-5':[0.28,0.8],
    'asm-1':[0.45,0.3], 'asm-2':[0.45,0.55], 'asm-3':[0.45,0.8],
    'dc-1':[0.62,0.35], 'dc-2':[0.62,0.55], 'dc-3':[0.62,0.7],
    'dc-4':[0.62,0.2], 'dc-5':[0.62,0.85],
    'ret-1':[0.82,0.4], 'ret-2':[0.82,0.6], 'ret-3':[0.82,0.25], 'ret-4':[0.82,0.8],
    'ghost-1':[0.45,0.72], 'micro-1':[0.55,0.82], 'micro-2':[0.7,0.88], 'alt-1':[0.3,0.55],
  };

  const { NODES, EDGES } = { NODES: app.gnnResults?.nodeRisks || [], EDGES: [] };

  // Draw edges
  const edgeList = [{s:'rm-1',t:'mfg-4'},{s:'rm-2',t:'mfg-1'},{s:'rm-2',t:'mfg-2'},
    {s:'mfg-1',t:'asm-1'},{s:'mfg-2',t:'asm-1'},{s:'mfg-3',t:'asm-2'},{s:'mfg-4',t:'asm-2'},
    {s:'mfg-5',t:'asm-3'},{s:'asm-1',t:'dc-4'},{s:'asm-1',t:'dc-2'},{s:'asm-2',t:'dc-1'},
    {s:'asm-2',t:'dc-2'},{s:'asm-3',t:'dc-5'},{s:'dc-1',t:'ret-1'},{s:'dc-2',t:'ret-2'},
    {s:'dc-3',t:'ret-1'},{s:'dc-5',t:'ret-4'},{s:'dc-1',t:'dc-3'},{s:'mfg-3',t:'dc-1'}];
  edgeList.forEach(({s,t}) => {
    const sp = positions[s], tp = positions[t];
    if (!sp || !tp) return;
    ctx.beginPath();
    ctx.moveTo(sp[0]*W, sp[1]*H);
    ctx.lineTo(tp[0]*W, tp[1]*H);
    const isDisrupted = app.disruptionActive && (s==='mfg-3'||t==='mfg-3'||s==='dc-1'&&t==='dc-3');
    ctx.strokeStyle = isDisrupted ? 'rgba(255,23,68,.5)' : 'rgba(0,240,255,.12)';
    ctx.lineWidth = isDisrupted ? 1.5 : 0.8;
    ctx.stroke();
  });

  // Risk map for coloring
  const riskMap = {};
  if (app.gnnResults) app.gnnResults.nodeRisks.forEach(n => { riskMap[n.id] = n.riskScore; });

  // Draw nodes
  Object.entries(positions).forEach(([id, [px, py]]) => {
    const x = px * W, y = py * H;
    const risk = riskMap[id] || 15;
    const color = risk > 65 ? '#ff1744' : risk > 35 ? '#ffab00' : id.startsWith('ghost')||id.startsWith('micro') ? '#8b5cf6' : '#00e676';
    const r = id.startsWith('asm') ? 7 : id.startsWith('dc') ? 6 : id.startsWith('ret') ? 5 : 4;

    // Glow for risky nodes
    if (risk > 40) {
      const grad = ctx.createRadialGradient(x,y,0,x,y,r*3);
      grad.addColorStop(0, color.replace('#','rgba(').replace('ff1744','255,23,68,.4)').replace('ffab00','255,171,0,.3)'));
      grad.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x,y,r*3,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill();
    }

    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    if (id === 'mfg-3' && app.disruptionActive) {
      ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 2; ctx.stroke();
    }
  });

  // Label a few key nodes
  ctx.font = '9px Inter, sans-serif'; ctx.fillStyle = 'rgba(232,234,237,.5)';
  [['mfg-3','Dhaka',0.28,0.65],['dc-1','Kolkata DC',0.62,0.35],['ret-1','Delhi Retail',0.82,0.4]].forEach(([,l,px,py])=>{
    ctx.fillText(l, px*W+8, py*H+3);
  });
}
