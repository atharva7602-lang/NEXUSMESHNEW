import { geminiActuator } from '../engine/geminiActuator.js';
import { DISRUPTION_SCENARIO } from '../data/supplyChainGraph.js';
import { MATERIAL_SUBSTITUTES } from '../data/shadowNetResources.js';

export function renderSLA(container, app) {
  const hasSim = !!app.simulationResults;
  const bestStrategy = hasSim ? app.simulationResults[0] : null;

  container.innerHTML = `
<div class="animate-fade-in">
  <!-- GEMINI HEADER -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="font-size:40px">✨</div>
      <div>
        <h1 style="font-size:20px;font-weight:800">Gemini SLA Engine</h1>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Autonomous legal & logistics document generation · Powered by Gemini 2.5 Pro</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:linear-gradient(135deg,rgba(0,240,255,.08),rgba(139,92,246,.08));border:1px solid rgba(0,240,255,.15);border-radius:10px">
      <div style="font-size:14px">🤖</div>
      <div>
        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Powered by</div>
        <div style="font-size:12px;font-weight:700;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Gemini 2.5 Pro</div>
      </div>
    </div>
  </div>

  ${!app.disruptionActive ? `
  <div class="glass-card" style="padding:48px;text-align:center">
    <div style="font-size:48px;margin-bottom:16px">✨</div>
    <div style="font-size:18px;font-weight:800;margin-bottom:8px">No Active Disruption</div>
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Trigger a disruption from the Dashboard, run simulations, then come back here for auto-generated SLA documents.</div>
    <button class="btn btn-primary" onclick="document.querySelector('[data-view=dashboard]').click()">← Go to Dashboard</button>
  </div>` : `

  <!-- GENERATION CONTROLS -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
    <button class="btn btn-primary btn-lg" id="gen-sla" style="justify-content:center">📄 Generate SLA Amendment</button>
    <button class="btn btn-purple btn-lg" id="gen-notif" style="justify-content:center">📧 Generate Supplier Notice</button>
    <button class="btn btn-ghost btn-lg" id="gen-sub" style="justify-content:center">🧬 Generate Substitution Report</button>
  </div>

  <!-- CONTEXT CARD -->
  <div class="glass-card" style="padding:16px;margin-bottom:16px;border-color:rgba(255,23,68,.2)">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="font-size:20px">📋</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">Active Context: ${DISRUPTION_SCENARIO.name}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">
          ${hasSim ? `Best resolution: "${bestStrategy?.name}" · Score: ${bestStrategy?.compositeScore}%` : 'Run simulations first for optimal strategy selection'}
        </div>
      </div>
      ${hasSim ? `<span class="badge badge-cyan">Strategy Loaded</span>` : `<span class="badge badge-amber">No Strategy</span>`}
    </div>
  </div>

  <!-- OUTPUT AREA -->
  <div id="sla-output">
    <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px">Select a document type above to generate with Gemini ↑</div>
  </div>
  `}
</div>`;

  if (!app.disruptionActive) return;

  document.getElementById('gen-sla')?.addEventListener('click', () => generateDoc('sla', app));
  document.getElementById('gen-notif')?.addEventListener('click', () => generateDoc('notif', app));
  document.getElementById('gen-sub')?.addEventListener('click', () => generateDoc('sub', app));
}

async function generateDoc(type, app) {
  const output = document.getElementById('sla-output');
  const strategy = app.simulationResults?.[0] || { name: 'Ghost Capacity + Micro-Warehouse Relay', axis:'routing', timeToResolve:22, costImpact:9.2, slaPreservation:.86, risk:.14, shadowNetActivation:true };

  output.innerHTML = `
<div class="glass-card" style="padding:40px;text-align:center">
  <div style="display:flex;flex-direction:column;align-items:center;gap:16px">
    <div style="position:relative;width:64px;height:64px">
      <div style="position:absolute;inset:0;border:3px solid rgba(0,240,255,.1);border-top-color:var(--accent-cyan);border-radius:50%;animation:spin .8s linear infinite"></div>
      <div style="position:absolute;inset:6px;border:3px solid rgba(139,92,246,.1);border-top-color:var(--accent-purple);border-radius:50%;animation:spin 1.2s linear infinite reverse"></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px">✨</div>
    </div>
    <div>
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">Gemini is generating your document...</div>
      <div style="font-size:12px;color:var(--text-muted)">Model: gemini-2.5-pro-preview · Temperature: 0.2</div>
    </div>
  </div>
</div>`;

  let text = '';
  try {
    if (type === 'sla')   text = await geminiActuator.generateSLAAmendment(DISRUPTION_SCENARIO, strategy);
    if (type === 'notif') text = await geminiActuator.generateSupplierNotification(DISRUPTION_SCENARIO, strategy);
    if (type === 'sub')   text = await geminiActuator.generateSubstitutionReport(MATERIAL_SUBSTITUTES[0]);
  } catch(e) { text = 'Error generating document.'; }

  const titles = { sla:'📄 SLA Amendment', notif:'📧 Supplier Notification', sub:'🧬 Substitution Report' };
  output.innerHTML = `
<div class="glass-card" style="padding:20px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border-subtle)">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="font-size:20px">${titles[type].split(' ')[0]}</div>
      <div>
        <div style="font-weight:700;font-size:14px">${titles[type].substring(2)}</div>
        <div style="font-size:11px;color:var(--text-muted)">Generated by Gemini 2.5 Pro · ${new Date().toLocaleTimeString()}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('doc-text').textContent)">📋 Copy</button>
      <button class="btn btn-ghost" onclick="document.getElementById('sla-output').innerHTML='<div style=\\'text-align:center;padding:40px;color:var(--text-muted);font-size:13px\\'>Select a document type above ↑</div>'">✕ Clear</button>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:8px 12px;background:rgba(0,240,255,.04);border-radius:8px;border:1px solid rgba(0,240,255,.1)">
    <div style="font-size:14px">🤖</div>
    <div style="font-size:11px;color:var(--accent-cyan);font-weight:600">Auto-generated by Gemini 2.5 Pro based on GNN disruption analysis and counterfactual simulation output</div>
    <span class="badge badge-green" style="margin-left:auto">Review recommended</span>
  </div>
  <pre id="doc-text" style="white-space:pre-wrap;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);background:rgba(0,0,0,.4);border:1px solid rgba(0,240,255,.08);border-radius:10px;padding:20px;overflow-x:auto;line-height:1.8;max-height:500px;overflow-y:auto">${text}</pre>
  <div style="display:flex;gap:10px;margin-top:14px">
    <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="this.textContent='✓ Approved';this.style.background='rgba(0,230,118,.2)';this.style.borderColor='var(--status-green)';this.style.color='var(--status-green)'">✓ Approve & Execute</button>
    <button class="btn btn-ghost" style="flex:1;justify-content:center">✏️ Edit Document</button>
    <button class="btn btn-danger" style="flex:1;justify-content:center">✕ Reject</button>
  </div>
</div>`;
}
