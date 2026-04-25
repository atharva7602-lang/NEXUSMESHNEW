import { counterfactualEngine } from '../engine/counterfactualEngine.js';
import { DISRUPTION_SCENARIOS } from '../engine/newsSimulator.js';

export function renderSimulations(container, app) {
  container.innerHTML = `
<div class="animate-fade-in">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div>
      <h1 style="font-size:20px;font-weight:800">Counterfactual Simulation Engine</h1>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">10,000 Monte Carlo scenarios · Dual-axis freedom · Composite ranking</div>
    </div>
    <button class="btn btn-primary btn-lg" id="run-sim">⚡ Run 10,000 Simulations</button>
  </div>

  <div class="grid-2" style="margin-bottom:16px">
    <div class="glass-card" style="padding:20px;border-color:rgba(0,240,255,.2)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:28px">🔀</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--accent-cyan)">Axis 1 — Routing/Sourcing Freedom</div>
          <div style="font-size:11px;color:var(--text-muted)">NexusMesh core capability</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">Find alternative suppliers, activate ghost capacity, reroute logistics flows.</div>
    </div>
    <div class="glass-card" style="padding:20px;border-color:rgba(247,37,133,.2)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:28px">🧬</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--accent-magenta)">Axis 2 — Semantic Substitution</div>
          <div style="font-size:11px;color:var(--text-muted)">OmniWeave injection</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">Cross-references chemical/engineering properties to find pre-approved substitutes.</div>
    </div>
  </div>

  <div id="sim-results">
    ${app.simulationResults ? renderResults(app.simulationResults, app) : renderReadyState(app)}
  </div>
</div>`;

  document.getElementById('run-sim')?.addEventListener('click', () => runSimulation(container, app));
  bindRouteSelectors(app);
}

function renderReadyState(app) {
  const scenario = app.activeScenario;
  return `
<div class="glass-card" style="padding:32px;text-align:center">
  <div style="font-size:56px;margin-bottom:16px">${scenario ? '🎯' : '🎲'}</div>
  <div style="font-size:20px;font-weight:800;margin-bottom:8px">${scenario ? 'Ready to Simulate' : 'No Active Disruption'}</div>
  <div style="font-size:13px;color:var(--text-muted);max-width:500px;margin:0 auto 20px">
    ${scenario
      ? `Disruption detected: <strong style="color:#ff1744">${scenario.headline}</strong><br>Click <strong>Run 10,000 Simulations</strong> to generate ranked alternate routes.`
      : 'Trigger a disruption simulation from the Dashboard first, then run counterfactual analysis here.'}
  </div>
  ${scenario ? `
  <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
    <div style="padding:12px 20px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border-subtle)">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Disruption</div>
      <div style="font-size:14px;font-weight:700;color:var(--status-red);margin-top:2px">${scenario.headline.slice(0,40)}...</div>
    </div>
    <div style="padding:12px 20px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border-subtle)">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Revenue at Risk</div>
      <div style="font-size:14px;font-weight:700;color:var(--status-amber);margin-top:2px">$${(scenario.revenueAtRisk/1e6).toFixed(1)}M</div>
    </div>
    <div style="padding:12px 20px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border-subtle)">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Impact</div>
      <div style="font-size:14px;font-weight:700;color:var(--accent-cyan);margin-top:2px">${scenario.estimatedImpactHrs}hrs</div>
    </div>
  </div>` : ''}
</div>`;
}

function renderResults(strategies, app) {
  const top = strategies.slice(0, 6);
  const best = top[0];
  const selectedId = app.selectedRouteId;
  return `
<div>
  <!-- INSTRUCTION BANNER -->
  <div style="background:linear-gradient(135deg,rgba(139,92,246,.1),rgba(0,240,255,.05));border:1px solid rgba(139,92,246,.3);border-radius:12px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
    <div style="font-size:24px">👇</div>
    <div>
      <div style="font-size:14px;font-weight:700;color:var(--accent-purple)">Select an alternate route below</div>
      <div style="font-size:12px;color:var(--text-muted)">Click "Select This Route" on any strategy to activate it on the map with purple route lines and animated supply flow</div>
    </div>
  </div>

  <!-- RANKED LIST with SELECT buttons -->
  <div class="glass-card" style="padding:20px">
    <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">All Strategies — Ranked by Composite Score</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${top.map((s,i) => strategyRow(s, i, selectedId)).join('')}
    </div>
  </div>

  <!-- FORMULA DETAIL -->
  <div class="grid-2" style="margin-top:16px">
    <div class="glass-card" style="padding:20px">
      <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">🧠 GNN Propagation Model</div>
      <div class="formula-block" style="font-size:12px">
        P(Sⱼ|Sᵢ) = σ(W·[hᵢ‖eᵢⱼ]+b) · e<sup>−λΔt</sup><br>
        λ = 0.08 &nbsp;|&nbsp; σ = sigmoid<br>
        hᵢ: SAR(0.85) + Sentiment(0.72) + Telemetry(0.91)<br>
        eᵢⱼ: leadTime_norm(0.57) + trustInv(0.28)
      </div>
    </div>
    <div class="glass-card" style="padding:20px">
      <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">📊 Simulation Statistics</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${simStat('Scenarios Run','10,000')}
        ${simStat('Strategies Found', strategies.length.toString())}
        ${simStat('Routing Options','4')}
        ${simStat('Substitution Options','2')}
        ${simStat('Best Score', best.compositeScore+'%')}
        ${simStat('Avg Resolution',Math.round(strategies.reduce((a,s)=>a+s.timeToResolve,0)/strategies.length)+'hrs')}
      </div>
    </div>
  </div>
</div>`;
}

function strategyRow(s, i, selectedId) {
  const axisColor = s.axis==='routing' ? 'var(--accent-cyan)' : 'var(--accent-magenta)';
  const isSelected = selectedId === s.id;
  const borderColor = isSelected ? '#00e676' : i===0 ? 'rgba(0,240,255,.25)' : 'var(--border-subtle)';
  const bgColor = isSelected ? 'rgba(0,230,118,0.06)' : 'var(--bg-surface)';
  return `
<div style="padding:14px;background:${bgColor};border-radius:12px;border:1px solid ${borderColor};display:flex;align-items:center;gap:12px;transition:all .3s" data-route-row="${s.id}">
  <div style="font-size:20px;font-weight:900;font-family:var(--font-mono);color:${isSelected?'#00e676':i===0?'var(--accent-cyan)':'var(--text-muted)'};width:28px">#${i+1}</div>
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <div style="font-weight:700;font-size:13px">${s.name}</div>
      <span style="font-size:9px;padding:2px 6px;border-radius:10px;background:${s.axis==='routing'?'rgba(0,240,255,.1)':'rgba(247,37,133,.1)'};color:${axisColor};font-weight:700">${s.axis==='routing'?'ROUTING':'SUBSTITUTE'}</span>
      ${isSelected ? '<span style="font-size:9px;padding:2px 6px;border-radius:10px;background:rgba(0,230,118,.15);color:#00e676;font-weight:700">✅ SELECTED</span>' : ''}
    </div>
    <div style="font-size:11px;color:var(--text-muted)">${s.description?.slice(0,100) || ''}${s.description?.length > 100 ? '...' : ''}</div>
    <div style="display:flex;gap:12px;margin-top:8px;font-size:11px;color:var(--text-secondary)">
      <span>⏱ ${s.timeToResolve}hrs</span>
      <span>💰 Cost ${s.costImpact>0?'+':''}${s.costImpact}%</span>
      <span>📋 SLA ${Math.round(s.slaPreservation*100)}%</span>
      <span>🛡️ Safety ${Math.round((1-s.risk)*100)}%</span>
    </div>
    <div class="progress-bar" style="margin-top:6px;height:3px">
      <div class="progress-fill" style="width:${s.compositeScore}%;background:${isSelected?'#00e676':i===0?'linear-gradient(90deg,var(--accent-cyan),var(--accent-purple))':'rgba(0,240,255,.4)'}"></div>
    </div>
  </div>
  <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
    <div style="font-size:18px;font-weight:800;font-family:var(--font-mono);color:${isSelected?'#00e676':i===0?'var(--accent-cyan)':'var(--text-primary)'}">${s.compositeScore}%</div>
    <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Score</div>
    <button class="btn ${isSelected ? 'btn-success' : 'btn-purple'} select-route-btn" data-route-id="${s.id}" style="font-size:10px;padding:4px 12px;white-space:nowrap">
      ${isSelected ? '✅ Selected' : '🔀 Select This Route'}
    </button>
  </div>
</div>`;
}

function stratBadge(label, val, color) {
  return `<span style="padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(0,0,0,.3);color:${color};border:1px solid rgba(255,255,255,.06)">${label}: <b>${val}</b></span>`;
}

function simStat(label, val) {
  return `<div style="padding:8px;background:rgba(0,0,0,.3);border-radius:8px">
    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase">${label}</div>
    <div style="font-size:14px;font-weight:700;font-family:var(--font-mono);color:var(--accent-cyan);margin-top:2px">${val}</div>
  </div>`;
}

function bindRouteSelectors(app) {
  setTimeout(() => {
    document.querySelectorAll('.select-route-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const routeId = btn.dataset.routeId;
        if (!routeId || !app.simulationResults) return;

        const strategy = app.simulationResults.find(s => s.id === routeId);
        if (!strategy) return;

        // Mark as selected
        app.selectedRouteId = routeId;
        app.routeResolved = true;
        app.altRouteNodes = strategy.routeNodes || ['alt-1', 'ghost-1', 'micro-1', 'ret-1'];

        // Update risk to green
        const newRisk = Math.max(12, (app.globalRisk || 82) - 55);
        app.globalRisk = newRisk;
        app._updateRiskDisplay?.();

        // Update all maps to show purple route then resolve to green
        Object.values(app._mapInstances || {}).forEach(m => {
          if (m?.nexusResolve) m.nexusResolve(app.activeScenario, app.altRouteNodes);
        });

        // Show toast
        app._showToast?.(`✅ Route "${strategy.name}" selected — map updated with safe route. Risk normalized.`, 'cyan');

        // Re-render simulation results to show selected state
        const results = document.getElementById('sim-results');
        if (results) {
          results.innerHTML = renderResults(app.simulationResults, app);
          bindRouteSelectors(app);
        }
      });
    });
  }, 50);
}

async function runSimulation(container, app) {
  const btn = document.getElementById('run-sim');
  if (btn) btn.disabled = true;

  const results = document.getElementById('sim-results');
  results.innerHTML = `
<div class="glass-card sim-progress-wrap">
  <div class="sim-spinner"></div>
  <div class="sim-count" id="sim-counter">0</div>
  <div style="font-size:14px;color:var(--text-muted)">Running counterfactual scenarios...</div>
  <div class="progress-bar" style="width:320px">
    <div class="progress-fill" id="sim-prog" style="width:0%"></div>
  </div>
  <div style="font-size:11px;color:var(--text-muted)">Dual-axis: Routing + Semantic Substitution</div>
</div>`;

  counterfactualEngine.on('progress', ({ completed, pct }) => {
    const counter = document.getElementById('sim-counter');
    const prog = document.getElementById('sim-prog');
    if (counter) counter.textContent = completed.toLocaleString();
    if (prog) prog.style.width = (pct * 100) + '%';
  });

  const scenario = app.activeScenario || DISRUPTION_SCENARIOS[0];
  const strategies = await counterfactualEngine.run(scenario);
  app.simulationResults = strategies;
  app.selectedRouteId = null;  // reset selection

  results.innerHTML = renderResults(strategies, app);
  bindRouteSelectors(app);
  if (btn) btn.disabled = false;
}
