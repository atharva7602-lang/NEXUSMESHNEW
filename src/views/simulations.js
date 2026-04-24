import { counterfactualEngine } from '../engine/counterfactualEngine.js';
import { DISRUPTION_SCENARIO } from '../data/supplyChainGraph.js';

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

  <!-- DUAL AXIS EXPLAINER -->
  <div class="grid-2" style="margin-bottom:16px">
    <div class="glass-card" style="padding:20px;border-color:rgba(0,240,255,.2)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:28px">🔀</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--accent-cyan)">Axis 1 — Routing/Sourcing Freedom</div>
          <div style="font-size:11px;color:var(--text-muted)">NexusMesh core capability</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">Find alternative suppliers, activate ghost capacity, reroute logistics flows. Permutes all possible sourcing paths across the graph to find optimal resolution.</div>
    </div>
    <div class="glass-card" style="padding:20px;border-color:rgba(247,37,133,.2)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:28px">🧬</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--accent-magenta)">Axis 2 — Semantic Substitution</div>
          <div style="font-size:11px;color:var(--text-muted)">OmniWeave injection</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">If no new supplier exists, Gemini cross-references chemical/engineering properties to find pre-approved, compliance-safe substitute materials in the secondary market.</div>
    </div>
  </div>

  <!-- SIMULATION RESULTS AREA -->
  <div id="sim-results">
    ${app.simulationResults ? renderResults(app.simulationResults, app) : renderReadyState(app)}
  </div>
</div>`;

  document.getElementById('run-sim')?.addEventListener('click', () => runSimulation(container, app));
}

function renderReadyState(app) {
  return `
<div class="glass-card" style="padding:48px;text-align:center">
  <div style="font-size:56px;margin-bottom:16px">🎲</div>
  <div style="font-size:20px;font-weight:800;margin-bottom:8px">${app.disruptionActive ? 'Ready to Simulate' : 'No Active Disruption'}</div>
  <div style="font-size:13px;color:var(--text-muted);max-width:400px;margin:0 auto 20px">
    ${app.disruptionActive
      ? 'Dhaka Border Blockage detected. Click "Run 10,000 Simulations" to generate ranked resolution strategies.'
      : 'Trigger a disruption simulation from the Dashboard first, then run counterfactual analysis here.'}
  </div>
  ${app.disruptionActive ? `
  <div style="display:flex;justify-content:center;gap:12px">
    <div style="padding:12px 20px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border-subtle)">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Disruption</div>
      <div style="font-size:14px;font-weight:700;color:var(--status-red);margin-top:2px">Dhaka Border Blockage</div>
    </div>
    <div style="padding:12px 20px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border-subtle)">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Revenue at Risk</div>
      <div style="font-size:14px;font-weight:700;color:var(--status-amber);margin-top:2px">₹${(DISRUPTION_SCENARIO.revenueAtRisk/100000).toFixed(1)}L</div>
    </div>
    <div style="padding:12px 20px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border-subtle)">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">GNN Confidence</div>
      <div style="font-size:14px;font-weight:700;color:var(--accent-cyan);margin-top:2px">89%</div>
    </div>
  </div>` : ''}
</div>`;
}

function renderResults(strategies, app) {
  const top = strategies.slice(0, 6);
  const best = top[0];
  return `
<div>
  <!-- TOP STRATEGY HIGHLIGHT -->
  <div style="background:linear-gradient(135deg,rgba(0,240,255,.08),rgba(139,92,246,.04));border:1px solid rgba(0,240,255,.25);border-radius:16px;padding:20px;margin-bottom:16px">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
      <div style="flex:1">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--accent-cyan);margin-bottom:6px">🏆 OPTIMAL STRATEGY · COMPOSITE SCORE ${best.compositeScore}%</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:6px">${best.name}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">${best.description}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${stratBadge('Confidence', Math.round(best.confidence*100)+'%', 'var(--accent-cyan)')}
          ${stratBadge('SLA Preserved', Math.round(best.slaPreservation*100)+'%', 'var(--status-green)')}
          ${stratBadge('Resolution', best.timeToResolve+'hrs', 'var(--status-amber)')}
          ${stratBadge('Cost Delta', (best.costImpact>0?'+':'')+best.costImpact+'%', best.costImpact>30?'var(--status-red)':'var(--text-secondary)')}
          <span style="padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;background:${best.axis==='routing'?'rgba(0,240,255,.1)':'rgba(247,37,133,.1)'};color:${best.axis==='routing'?'var(--accent-cyan)':'var(--accent-magenta)'};border:1px solid ${best.axis==='routing'?'rgba(0,240,255,.2)':'rgba(247,37,133,.2)'}">
            ${best.axis==='routing'?'🔀 Routing Axis':'🧬 Substitution Axis'}
          </span>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" onclick="document.querySelector('[data-view=sla]').click()">Generate SLA Amendment →</button>
    </div>
  </div>

  <!-- RANKED LIST -->
  <div class="glass-card" style="padding:20px">
    <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">All Strategies — Ranked by Composite Score</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${top.map((s,i) => strategyRow(s, i)).join('')}
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

function strategyRow(s, i) {
  const axisColor = s.axis==='routing' ? 'var(--accent-cyan)' : 'var(--accent-magenta)';
  const riskColor = s.risk > 0.3 ? 'var(--status-red)' : s.risk > 0.15 ? 'var(--status-amber)' : 'var(--status-green)';
  return `
<div style="padding:14px;background:var(--bg-surface);border-radius:12px;border:1px solid ${i===0?'rgba(0,240,255,.25)':'var(--border-subtle)'};display:flex;align-items:center;gap:12px">
  <div style="font-size:20px;font-weight:900;font-family:var(--font-mono);color:${i===0?'var(--accent-cyan)':'var(--text-muted)'};width:28px">#${i+1}</div>
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <div style="font-weight:700;font-size:13px">${s.name}</div>
      <span style="font-size:9px;padding:2px 6px;border-radius:10px;background:${s.axis==='routing'?'rgba(0,240,255,.1)':'rgba(247,37,133,.1)'};color:${axisColor};font-weight:700">${s.axis==='routing'?'ROUTING':'SUBSTITUTE'}</span>
    </div>
    <div style="font-size:11px;color:var(--text-muted)">${s.timeToResolve}hrs · Cost ${s.costImpact>0?'+':''}${s.costImpact}% · SLA ${Math.round(s.slaPreservation*100)}%</div>
    <div class="progress-bar" style="margin-top:6px;height:3px">
      <div class="progress-fill" style="width:${s.compositeScore}%;background:${i===0?'linear-gradient(90deg,var(--accent-cyan),var(--accent-purple))':'rgba(0,240,255,.4)'}"></div>
    </div>
  </div>
  <div style="text-align:right">
    <div style="font-size:18px;font-weight:800;font-family:var(--font-mono);color:${i===0?'var(--accent-cyan)':'var(--text-primary)'}">${s.compositeScore}%</div>
    <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Score</div>
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

  const strategies = await counterfactualEngine.run(DISRUPTION_SCENARIO);
  app.simulationResults = strategies;

  results.innerHTML = renderResults(strategies, app);
  if (btn) btn.disabled = false;
}
