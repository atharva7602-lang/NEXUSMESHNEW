import * as d3 from 'd3';
import { NODES, EDGES, getRiskColor } from '../data/supplyChainGraph.js';
import { createGeoMap } from '../components/GeoMap.js';

export function renderNetwork(container, app) {
  const scenario = app.activeScenario;
  container.innerHTML = `
<div class="animate-fade-in">
  <!-- GEOGRAPHIC MAP -->
  <div class="glass-card" style="margin-bottom:16px;overflow:hidden;border-radius:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border-subtle)">
      <div>
        <div style="font-weight:700;font-size:14px">🗺️ Live Supply Chain Map</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">India states + global nodes · Click markers for details · ${scenario ? '🚨 Disruption active' : 'All nodes nominal'}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${scenario ? `<span style="background:rgba(255,23,68,0.15);color:#ff1744;border:1px solid rgba(255,23,68,0.3);padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700">${scenario.region} · ${scenario.type.toUpperCase()}</span>` : ''}
        <button class="btn btn-ghost" id="reset-graph">↺ Reset View</button>
      </div>
    </div>
    <div id="nexus-geo-map" style="height:480px;width:100%"></div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 300px;gap:16px">
    <!-- D3 FORCE GRAPH -->
    <div class="glass-card" style="padding:14px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:12px">⚡ GNN Force Graph</div>
      <div class="graph-container" style="height:440px;position:relative">
        <svg id="network-svg" style="width:100%;height:100%"></svg>
        <div class="graph-legend">
          <div class="legend-title">Node Types</div>
          ${['⛏️ Raw Material','🏭 Manufacturer','🏗️ Assembly','📦 Distribution','🏪 Retail'].map(l=>`<div class="legend-item"><span>${l}</span></div>`).join('')}
          <div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>
          <div class="legend-title">Risk Level</div>
          ${[['#00e676','Low (<30)'],['#ffab00','Medium (30-65)'],['#ff1744','High (>65)']].map(([c,l])=>`<div class="legend-item"><div class="legend-dot" style="background:${c}"></div>${l}</div>`).join('')}
        </div>
        <div class="graph-status-bar">
          <div class="graph-stat"><span>Nodes</span><span class="graph-stat-value">25</span></div>
          <div class="graph-sep"></div>
          <div class="graph-stat"><span>Edges</span><span class="graph-stat-value">38</span></div>
          <div class="graph-sep"></div>
          <div class="graph-stat"><span>Risk</span><span class="graph-stat-value" style="color:${app.globalRisk>65?'var(--status-red)':app.globalRisk>40?'var(--status-amber)':'var(--status-green)'}">${app.globalRisk}</span></div>
          <div class="graph-sep"></div>
          <div class="graph-stat"><span>Affected</span><span class="graph-stat-value">${app.gnnResults?.affectedNodeCount || 0}</span></div>
        </div>
        <div id="node-tooltip" class="node-tooltip"></div>
      </div>
    </div>

    <!-- SIDE PANEL -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="glass-card" style="padding:16px" id="node-detail">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:12px">NODE INSPECTOR</div>
        <div style="font-size:13px;color:var(--text-muted);text-align:center;padding:20px 0">Click any node to inspect</div>
      </div>

      ${app.disruptionActive && app.gnnResults && scenario ? `
      <div class="glass-card" style="padding:16px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--status-red);margin-bottom:12px">⚡ PROPAGATION</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px">${scenario.headline}</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${scenario.propagationPath.map((id)=>{
            const n = NODES.find(x=>x.id===id);
            const risk = app.gnnResults.riskScores[id] || 0;
            return `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg-surface);border-radius:8px;border-left:2px solid ${getRiskColor(risk*100)}">
              <span style="font-size:14px">${n?.icon||'📦'}</span>
              <div style="flex:1">
                <div style="font-size:11px;font-weight:600">${n?.name||id}</div>
                <div style="font-size:9px;color:var(--text-muted)">${n?.location||''}</div>
              </div>
              <div style="font-size:10px;font-weight:700;font-family:var(--font-mono);color:${getRiskColor(risk*100)}">${Math.round(risk*100)}%</div>
            </div>`;
          }).join('<div style="width:1px;height:5px;background:var(--status-red);margin:0 auto;opacity:.3"></div>')}
        </div>
      </div>` : ''}

      <div class="glass-card" style="padding:16px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:12px">SIGNAL FUSION</div>
        ${signalBar('🛰️ SAR Signal', scenario ? Math.round(scenario.signals.sarSignal*100) : 12, 'var(--accent-cyan)')}
        ${signalBar('📰 Sentiment', scenario ? Math.round(scenario.signals.sentiment*100) : 18, 'var(--accent-purple)')}
        ${signalBar('📡 Telemetry', scenario ? Math.round(scenario.signals.telemetry*100) : 8, 'var(--status-amber)')}
      </div>
    </div>
  </div>
</div>`;

  // Init Leaflet map
  const mapInstance = createGeoMap('nexus-geo-map', app);
  app._mapInstances['network'] = mapInstance;

  // Init D3 graph
  initD3Graph(app);
  document.getElementById('reset-graph')?.addEventListener('click', () => {
    if (mapInstance) mapInstance.setView([22, 82], 4);
    initD3Graph(app);
  });
}

function signalBar(label, val, color) {
  return `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
      <span style="font-size:11px;color:var(--text-secondary)">${label}</span>
      <span style="font-size:11px;font-weight:700;font-family:var(--font-mono);color:${color}">${val}%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${val}%;background:${color}"></div>
    </div>
  </div>`;
}

function initD3Graph(app) {
  const svg = d3.select('#network-svg');
  svg.selectAll('*').remove();
  const el = document.getElementById('network-svg');
  if (!el) return;
  const W = el.clientWidth || 700, H = el.clientHeight || 600;

  const riskMap = {};
  if (app.gnnResults) app.gnnResults.nodeRisks.forEach(n => { riskMap[n.id] = n.riskScore; });

  const nodes = NODES.map(n => ({ ...n, risk: riskMap[n.id] ?? n.riskScore }));
  const edges = EDGES.filter(e => !e.dormant || (app.disruptionActive && e.type === 'shadow'));

  const g = svg.append('g');

  // Zoom
  svg.call(d3.zoom().scaleExtent([0.3,3]).on('zoom', e => g.attr('transform', e.transform)));

  // Defs for glow
  const defs = svg.append('defs');
  ['cyan','red','purple','amber'].forEach(c => {
    const glowColors = { cyan:'#00f0ff', red:'#ff1744', purple:'#8b5cf6', amber:'#ffab00' };
    const filter = defs.append('filter').attr('id',`glow-${c}`);
    filter.append('feGaussianBlur').attr('stdDeviation','3').attr('result','blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in','blur');
    merge.append('feMergeNode').attr('in','SourceGraphic');
  });

  // Simulation
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d=>d.id).distance(d => 60 + d.leadTime * 4).strength(0.4))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('x', d3.forceX(W/2).strength(0.04))
    .force('y', d3.forceY(H/2).strength(0.04))
    .force('collision', d3.forceCollide(18));

  // Edges
  const link = g.append('g').selectAll('line').data(edges).join('line')
    .attr('stroke', d => {
      if (d.type === 'shadow') return '#8b5cf6';
      const isAffected = app.disruptionActive && (d.source.id==='mfg-3'||d.target?.id==='mfg-3'||d.source==='mfg-3'||d.target==='mfg-3');
      return isAffected ? '#ff1744' : `rgba(0,240,255,${0.1 + d.load*0.25})`;
    })
    .attr('stroke-width', d => 0.8 + d.load * 2)
    .attr('stroke-dasharray', d => d.type==='shadow' ? '5,4' : null)
    .attr('stroke-opacity', d => d.dormant ? 0.4 : 0.7);

  // Nodes
  const node = g.append('g').selectAll('g').data(nodes).join('g')
    .attr('cursor','pointer')
    .call(d3.drag().on('start', (e,d) => { if(!e.active) sim.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag', (e,d) => { d.fx=e.x; d.fy=e.y; })
      .on('end', (e,d) => { if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }));

  // Glow ring for risky nodes
  node.filter(d => d.risk > 35).append('circle')
    .attr('r', d => getRadius(d) + 6)
    .attr('fill', 'none')
    .attr('stroke', d => getRiskColor(d.risk))
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.4)
    .attr('filter', d => d.risk > 65 ? 'url(#glow-red)' : 'url(#glow-amber)');

  // Main circle
  node.append('circle')
    .attr('r', d => getRadius(d))
    .attr('fill', d => {
      if (d.type==='ghost'||d.type==='microwarehouse') return '#8b5cf6';
      if (d.type==='alternative') return '#3b82f6';
      return getRiskColor(d.risk);
    })
    .attr('filter', d => d.id === (app.activeScenario?.origin) && app.disruptionActive ? 'url(#glow-red)' : null)
    .attr('stroke', d => d.id === (app.activeScenario?.origin) && app.disruptionActive ? '#ff1744' : 'rgba(255,255,255,.1)')
    .attr('stroke-width', d => d.id === (app.activeScenario?.origin) ? 2.5 : 1);

  // Icon label
  node.append('text').text(d => d.icon||'●')
    .attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('font-size', d => getRadius(d) * 1.1)
    .style('pointer-events','none');

  // Name label
  node.append('text').text(d => d.name.split(' ')[0])
    .attr('y', d => getRadius(d) + 10)
    .attr('text-anchor','middle')
    .attr('font-size','9')
    .attr('fill','rgba(232,234,237,.5)')
    .style('pointer-events','none');

  // Tooltip
  const tooltip = document.getElementById('node-tooltip');
  node.on('mouseover', (e, d) => {
    if (!tooltip) return;
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-icon">${d.icon||'📦'}</span>
        <div><div class="tooltip-name">${d.name}</div><div class="tooltip-location">${d.location}</div></div>
      </div>
      <div class="tooltip-metrics">
        <div><div class="tooltip-metric-label">Risk</div><div class="tooltip-metric-value" style="color:${getRiskColor(d.risk)}">${d.risk}%</div></div>
        <div><div class="tooltip-metric-label">Status</div><div class="tooltip-metric-value">${d.status}</div></div>
        <div><div class="tooltip-metric-label">Tier</div><div class="tooltip-metric-value">${d.tier}</div></div>
        <div><div class="tooltip-metric-label">Capacity</div><div class="tooltip-metric-value">${d.capacity?.toLocaleString()}</div></div>
      </div>`;
    tooltip.classList.add('visible');
    tooltip.style.left = (e.pageX - el.getBoundingClientRect().left + 12) + 'px';
    tooltip.style.top  = (e.pageY - el.getBoundingClientRect().top - 20) + 'px';
  }).on('mousemove', e => {
    if (!tooltip) return;
    tooltip.style.left = (e.pageX - el.getBoundingClientRect().left + 12) + 'px';
    tooltip.style.top  = (e.pageY - el.getBoundingClientRect().top - 20) + 'px';
  }).on('mouseout', () => tooltip?.classList.remove('visible'))
  .on('click', (e, d) => showNodeDetail(d, app));

  // Disruption pulse
  if (app.disruptionActive && app.activeScenario) {
    const origin = nodes.find(n => n.id === app.activeScenario.origin);
    if (origin) {
      setInterval(() => {
        if (!origin.x) return;
        g.append('circle').attr('cx', origin.x).attr('cy', origin.y).attr('r', 10)
          .attr('fill','none').attr('stroke','#ff1744').attr('stroke-width',2).attr('opacity',1)
          .transition().duration(1500).attr('r', 60).attr('opacity',0).remove();
      }, 2000);
    }
  }

  sim.on('tick', () => {
    link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}

function getRadius(d) {
  const base = { raw:6, manufacturer:9, assembly:11, distribution:10, retail:8, ghost:7, microwarehouse:6, alternative:8 };
  return base[d.type] || 7;
}

function showNodeDetail(d, app) {
  const panel = document.getElementById('node-detail');
  if (!panel) return;
  const risk = d.risk || d.riskScore || 0;
  panel.innerHTML = `
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:12px">NODE INSPECTOR</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="font-size:32px">${d.icon||'📦'}</div>
      <div>
        <div style="font-weight:700;font-size:14px">${d.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${d.location} · Tier ${d.tier}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${nodeMetric('Risk Score', risk+'%', getRiskColor(risk))}
      ${nodeMetric('Status', d.status, d.status==='healthy'?'var(--status-green)':'var(--status-red)')}
      ${nodeMetric('Capacity', d.capacity?.toLocaleString(), 'var(--text-primary)')}
      ${nodeMetric('Type', d.type, 'var(--accent-cyan)')}
    </div>
    ${risk > 35 ? `<div style="padding:8px;background:rgba(255,23,68,.08);border-radius:8px;border:1px solid rgba(255,23,68,.2)">
      <div style="font-size:11px;color:var(--status-red);font-weight:600">⚠️ Elevated Risk Detected</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">GNN propagation contributing ${risk}% risk score via upstream disruption at Dhaka</div>
    </div>` : ''}`;
}

function nodeMetric(label, val, color) {
  return `<div style="padding:8px;background:var(--bg-surface);border-radius:8px">
    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">${label}</div>
    <div style="font-size:13px;font-weight:700;color:${color};margin-top:2px;font-family:var(--font-mono)">${val}</div>
  </div>`;
}
