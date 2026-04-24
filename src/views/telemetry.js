import { telemetrySimulator, WAREHOUSES } from '../data/telemetrySimulator.js';

export function renderTelemetry(container, app) {
  const data = telemetrySimulator.getAllData();
  const dhaka = data['wh-dhaka'];
  const disrupted = app.disruptionActive;

  container.innerHTML = `
<div class="animate-fade-in">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div>
      <h1 style="font-size:20px;font-weight:800">Dark Matter Signals</h1>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Worker behavioral telemetry from Edge TPUs · Leading disruption indicators</div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <div class="status-dot ${disrupted?'red':'green'}"></div>
      <span style="font-size:12px;font-weight:600;color:${disrupted?'var(--status-red)':'var(--status-green)'}">${disrupted?'ANOMALY DETECTED — DHAKA':'All Signals Nominal'}</span>
    </div>
  </div>

  <!-- DHAKA PRIMARY PANEL -->
  <div style="background:linear-gradient(135deg,${disrupted?'rgba(255,23,68,.1)':'rgba(0,240,255,.04)'},rgba(0,0,0,.2));border:1px solid ${disrupted?'rgba(255,23,68,.3)':'var(--border-subtle)'};border-radius:16px;padding:20px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="font-size:28px">📡</div>
      <div>
        <div style="font-weight:800;font-size:16px">Dhaka Sorting Hub — Edge TPU Feed</div>
        <div style="font-size:11px;color:var(--text-muted)">48 workers · Real-time behavioral signal fusion</div>
      </div>
      <div style="margin-left:auto">
        <span class="badge ${disrupted?'badge-red':'badge-green'}">${disrupted?'⚠ ANOMALY':'✓ NOMINAL'}</span>
      </div>
    </div>
    <div class="grid-4">
      ${telMetric('Scan Hesitation', 'tel-hesitation', disrupted?Math.round(dhaka?.current?.scanHesitation||1088):Math.round(dhaka?.current?.scanHesitation||324), 'ms', disrupted, disrupted?'+340% above baseline':'Within normal range')}
      ${telMetric('Re-scan Rate', 'tel-rescan', disrupted?((dhaka?.current?.reScanRate||11.4)).toFixed(1):(dhaka?.current?.reScanRate||2.1).toFixed(1), '%', disrupted, disrupted?'5.4× baseline — mislabeling signal':'')}
      ${telMetric('Worker Fatigue', 'tel-fatigue', disrupted?Math.round(dhaka?.current?.workerFatigue||83):Math.round(dhaka?.current?.workerFatigue||28), '/100', disrupted && (dhaka?.current?.workerFatigue||0)>55, 'Cognitive load index (Edge TPU)')}
      ${telMetric('Pick Accuracy', 'tel-accuracy', disrupted?(dhaka?.current?.pickAccuracy||90.7).toFixed(1):(dhaka?.current?.pickAccuracy||99.2).toFixed(1), '%', disrupted, disrupted?'↓ -8.5% — upstream mislabeling':'')}
    </div>
    ${disrupted ? `
    <div style="margin-top:14px;padding:12px;background:rgba(255,23,68,.08);border-radius:10px;border:1px solid rgba(255,23,68,.2);display:flex;align-items:center;gap:12px">
      <div style="font-size:20px">⚠️</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--status-red)">DARK MATTER SIGNAL DETECTED — 91% Confidence</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">Scan hesitation spike is a leading indicator of border disruption. Pattern matches 3 of 3 historical Dhaka blockage events. GNN prediction triggered.</div>
      </div>
    </div>` : ''}
  </div>

  <!-- SPARKLINE CHARTS -->
  <div class="grid-2" style="margin-bottom:16px">
    <div class="glass-card" style="padding:20px">
      <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Scan Hesitation History — Dhaka (60 min)</div>
      <canvas id="chart-hesitation" height="120" style="width:100%"></canvas>
      <div style="font-size:11px;color:var(--text-muted);margin-top:8px">Baseline: 320ms · Current: <span style="color:${disrupted?'var(--status-red)':'var(--accent-cyan)'};">${disrupted?'~1,088':'~324'} ms</span></div>
    </div>
    <div class="glass-card" style="padding:20px">
      <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Re-scan Rate History — Dhaka (60 min)</div>
      <canvas id="chart-rescan" height="120" style="width:100%"></canvas>
      <div style="font-size:11px;color:var(--text-muted);margin-top:8px">Baseline: 2.1% · Current: <span style="color:${disrupted?'var(--status-red)':'var(--status-green)'};">${disrupted?'~11.4':'~2.1'}%</span></div>
    </div>
  </div>

  <!-- ALL WAREHOUSES GRID -->
  <div class="glass-card" style="padding:20px">
    <div style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">📊 All Warehouse Telemetry</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="border-bottom:1px solid var(--border-subtle)">
            ${['Warehouse','Workers','Hesitation','Re-scan','Fatigue','Accuracy','Throughput','Status'].map(h=>`<th style="text-align:left;padding:8px 12px;color:var(--text-muted);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.06em">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${WAREHOUSES.map(wh => {
            const d = data[wh.id];
            const isAnomaly = disrupted && wh.id === 'wh-dhaka';
            const c = isAnomaly ? 'var(--status-red)' : 'var(--text-primary)';
            const cur = d?.current;
            return `<tr style="border-bottom:1px solid var(--border-subtle);background:${isAnomaly?'rgba(255,23,68,.04)':'transparent'};transition:background .2s" onmouseover="this.style.background='rgba(0,240,255,.02)'" onmouseout="this.style.background='${isAnomaly?'rgba(255,23,68,.04)':'transparent'}'">
              <td style="padding:10px 12px;font-weight:600;color:${c}">${wh.name}</td>
              <td style="padding:10px 12px;color:var(--text-secondary)">${wh.workers}</td>
              <td style="padding:10px 12px;font-family:var(--font-mono);color:${c}">${cur?Math.round(cur.scanHesitation):'—'} ms</td>
              <td style="padding:10px 12px;font-family:var(--font-mono);color:${cur?.reScanRate>5?'var(--status-red)':cur?.reScanRate>3?'var(--status-amber)':'var(--status-green)'}">${cur?(cur.reScanRate).toFixed(1):'—'}%</td>
              <td style="padding:10px 12px;font-family:var(--font-mono);color:${cur?.workerFatigue>60?'var(--status-red)':cur?.workerFatigue>40?'var(--status-amber)':'var(--text-primary)'}">${cur?Math.round(cur.workerFatigue):'—'}</td>
              <td style="padding:10px 12px;font-family:var(--font-mono);color:${cur?.pickAccuracy<95?'var(--status-red)':cur?.pickAccuracy<98?'var(--status-amber)':'var(--status-green)'}">${cur?(cur.pickAccuracy).toFixed(1):'—'}%</td>
              <td style="padding:10px 12px;font-family:var(--font-mono);color:var(--text-secondary)">${cur?Math.round(cur.throughput).toLocaleString():'—'}/hr</td>
              <td style="padding:10px 12px"><span class="badge ${isAnomaly?'badge-red':'badge-green'}">${isAnomaly?'ANOMALY':'NOMINAL'}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- EDGE TPU INFO -->
  <div class="grid-3" style="margin-top:16px">
    ${edgeTPUCard('Edge TPU Model','Google Coral Edge TPU','Deployed at 5 warehouses · 4 TOPS inference')}
    ${edgeTPUCard('Signal Fusion','SAR + Sentiment + Behavioral','Multi-modal anomaly detection · 91% accuracy')}
    ${edgeTPUCard('Latency','<12ms inference','Real-time behavioral pattern matching on-device')}
  </div>
</div>`;

  drawCharts(data, app);
}

function telMetric(label, id, value, unit, alert, sub) {
  const color = alert ? 'var(--status-red)' : 'var(--accent-cyan)';
  return `<div style="padding:14px;background:var(--bg-surface);border-radius:12px;border:1px solid ${alert?'rgba(255,23,68,.3)':'var(--border-subtle)'}">
    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">${label}</div>
    <div style="font-size:22px;font-weight:800;font-family:var(--font-mono);color:${color}" id="${id}">${value} <span style="font-size:12px;font-weight:400">${unit}</span></div>
    ${sub ? `<div style="font-size:10px;color:${alert?'var(--status-red)':'var(--text-muted)'};margin-top:4px">${sub}</div>` : ''}
  </div>`;
}

function edgeTPUCard(title, value, detail) {
  return `<div class="glass-card" style="padding:16px">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px">${title}</div>
    <div style="font-size:14px;font-weight:700;color:var(--accent-cyan);margin-bottom:4px">${value}</div>
    <div style="font-size:11px;color:var(--text-secondary)">${detail}</div>
  </div>`;
}

function drawCharts(data, app) {
  const dhaka = data['wh-dhaka'];
  if (!dhaka?.history) return;

  drawLineChart('chart-hesitation', dhaka.history.scanHesitation, dhaka.history.timestamps, app.disruptionActive ? '#ff1744' : '#00f0ff', 200, 1400);
  drawLineChart('chart-rescan', dhaka.history.reScanRate, dhaka.history.timestamps, app.disruptionActive ? '#ff1744' : '#00e676', 0, 15);
}

function drawLineChart(id, values, timestamps, color, yMin, yMax) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth - 40;
  canvas.height = 120;
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  if (!values || values.length < 2) return;
  const pts = values.slice(-40);
  const range = yMax - yMin;

  // Fill gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, color.replace('#','rgba(').replace('ff1744','255,23,68,.3)').replace('00f0ff','0,240,255,.3)').replace('00e676','0,230,118,.3)') || color + '4d');
  grad.addColorStop(1, 'transparent');

  ctx.beginPath();
  pts.forEach((v, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((Math.min(Math.max(v, yMin), yMax) - yMin) / range) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach((v, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((Math.min(Math.max(v, yMin), yMax) - yMin) / range) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

  // Last point dot
  const lv = pts[pts.length - 1];
  const lx = W, ly = H - ((Math.min(Math.max(lv, yMin), yMax) - yMin) / range) * H;
  ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
}
