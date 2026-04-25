import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NODES, EDGES, getNodeStatusColor } from '../data/supplyChainGraph.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NODE_TYPE_SIZE = { raw:10, manufacturer:13, assembly:16, distribution:15, retail:11, ghost:9, microwarehouse:8, alternative:10 };
const INDIA_STATES_URL = 'https://raw.githubusercontent.com/datameet/maps/master/States/Admin2.geojson';
const INDIA_COMPOSITE_URL = 'https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson';

// ── CANVAS ANIMATION ENGINE ───────────────────────────────────
// Animates supply "truck" dots along polyline paths on a canvas overlay
class RouteAnimator {
  constructor(map) {
    this.map = map;
    this.canvas = null;
    this.ctx = null;
    this.routes = [];   // { points:[{lat,lng}], color, speed, label }
    this.trucks = [];   // live truck objects
    this._raf = null;
    this._init();
  }

  _init() {
    const container = this.map.getContainer();
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:400;';
    container.appendChild(this.canvas);
    this._resize();
    this.map.on('resize move zoom moveend zoomend', () => this._resize());
  }

  _resize() {
    const s = this.map.getSize();
    this.canvas.width  = s.x;
    this.canvas.height = s.y;
  }

  setRoutes(routes) {
    this.routes = routes;
    this.trucks = [];
    routes.forEach(route => {
      const count = route.disrupted ? 2 : 3; // fewer trucks on disrupted route
      for (let i = 0; i < count; i++) {
        this.trucks.push({
          route,
          progress: i / count,   // stagger start positions
          speed: route.disrupted ? 0.0008 : 0.0018,  // disrupted trucks go slow
          trail: [],
        });
      }
    });
  }

  start() {
    if (this._raf) return;
    const loop = () => {
      this._draw();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _latLngToCanvas(lat, lng) {
    const p = this.map.latLngToContainerPoint([lat, lng]);
    return { x: p.x, y: p.y };
  }

  _interpolate(pts, t) {
    if (!pts || pts.length < 2) return null;
    const total = pts.length - 1;
    const pos = t * total;
    const i = Math.min(Math.floor(pos), total - 1);
    const frac = pos - i;
    const a = this._latLngToCanvas(pts[i].lat, pts[i].lng);
    const b = this._latLngToCanvas(pts[i+1].lat, pts[i+1].lng);
    return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
  }

  _draw() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.trucks.forEach(truck => {
      truck.progress = (truck.progress + truck.speed) % 1;
      const pts = truck.route.points;
      const pos = this._interpolate(pts, truck.progress);
      if (!pos) return;

      truck.trail.push({ ...pos, alpha: 1 });
      if (truck.trail.length > 12) truck.trail.shift();

      // Draw trail
      truck.trail.forEach((tp, ti) => {
        const alpha = (ti / truck.trail.length) * 0.6;
        const size  = (ti / truck.trail.length) * 4;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, size, 0, Math.PI * 2);
        ctx.fillStyle = truck.route.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
        ctx.fill();
      });

      // Draw glowing dot
      const color = truck.route.color;
      const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
      grd.addColorStop(0, color);
      grd.addColorStop(0.4, color.replace(')', ',0.6)').replace('rgb','rgba'));
      grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 10, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 4, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
    });
  }

  destroy() {
    this.stop();
    this.canvas?.remove();
  }
}

export function createGeoMap(containerId, app, options = {}) {
  const { compact = false } = options;

  const map = L.map(containerId, {
    center: [22, 82], zoom: compact ? 3 : 4,
    zoomControl: !compact, attributionControl: false,
    scrollWheelZoom: !compact, dragging: !compact, doubleClickZoom: !compact,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:14, minZoom:2 }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  const routeLayer  = L.layerGroup().addTo(map);
  const indiaLayer  = L.layerGroup().addTo(map);
  const animator    = new RouteAnimator(map);

  // ── INDIA STATES GeoJSON ──────────────────────────────────────
  async function loadIndiaLayers() {
    try {
      const r = await fetch(INDIA_STATES_URL);
      if (!r.ok) throw new Error();
      addGeoJSON(await r.json());
    } catch {
      try { const r2 = await fetch(INDIA_COMPOSITE_URL); addGeoJSON(await r2.json()); } catch {}
    }
  }
  function addGeoJSON(data) {
    L.geoJSON(data, {
      style: () => ({ color:'rgba(0,240,255,0.3)', weight:1, fillColor:'rgba(0,240,255,0.04)', fillOpacity:1, dashArray:'3,3' }),
      onEachFeature: (f, layer) => {
        const name = f.properties?.ST_NM || f.properties?.NAME_1 || f.properties?.name || f.properties?.State;
        if (name) layer.bindTooltip(name, { permanent:false, className:'nexus-state-tooltip', direction:'center' });
        layer.on('mouseover', function(){ this.setStyle({ fillColor:'rgba(0,240,255,0.1)', color:'rgba(0,240,255,0.6)', weight:1.5 }); });
        layer.on('mouseout',  function(){ this.setStyle({ fillColor:'rgba(0,240,255,0.04)', color:'rgba(0,240,255,0.3)', weight:1 }); });
      },
    }).addTo(indiaLayer);
  }
  loadIndiaLayers();

  const nodeLookup = () => { const m={}; NODES.forEach(n=>{ m[n.id]=n; }); return m; };

  // ── NODES ─────────────────────────────────────────────────────
  function renderNodes(scenario, altRouteNodes) {
    markerLayer.clearLayers();
    const isResolved = app.routeResolved && altRouteNodes?.length;
    NODES.forEach(node => {
      const isOrigin    = scenario && scenario.origin === node.id;
      const isDisrupted = scenario && scenario.propagationPath?.includes(node.id) && !isOrigin;
      const isOnAlt     = altRouteNodes?.includes(node.id);
      const size = NODE_TYPE_SIZE[node.type] || 10;
      let color, glowColor, pulseAnim, badge;

      if (isResolved && (isOnAlt || isOrigin)) {
        color='#00e676'; glowColor='rgba(0,230,118,0.5)'; pulseAnim='nexus-pulse-green'; badge=isOrigin?'RESOLVED':'SAFE';
      } else if (isOnAlt && !isResolved) {
        color='#8b5cf6'; glowColor='rgba(139,92,246,0.45)'; pulseAnim='nexus-pulse-purple'; badge='ALT';
      } else if (isOrigin) {
        color='#ff1744'; glowColor='rgba(255,23,68,0.55)'; pulseAnim='nexus-pulse-red'; badge='ORIGIN';
      } else if (isDisrupted && !isResolved) {
        color='#ffab00'; glowColor='rgba(255,171,0,0.4)'; pulseAnim='nexus-pulse-amber'; badge='IMPACTED';
      } else {
        // Normal state: all active nodes are green
        const isDormant = node.status === 'dormant' || node.status === 'standby';
        color = isDormant ? getNodeStatusColor(node.status) : '#00e676';
        glowColor = isDormant ? 'rgba(139,92,246,0.3)' : 'rgba(0,230,118,0.35)';
        pulseAnim = isDormant ? 'nexus-pulse-purple' : 'nexus-pulse-green';
      }

      const icon = L.divIcon({
        className:'',
        html:`<div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div class="${pulseAnim}" style="position:absolute;width:${size*3}px;height:${size*3}px;border-radius:50%;background:${glowColor};"></div>
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${color};box-shadow:0 0 ${size*2}px ${color};position:relative;z-index:2;cursor:pointer;"></div>
          ${badge?`<div style="position:absolute;top:${-(size+12)}px;left:50%;transform:translateX(-50%);background:${color};color:${color==='#8b5cf6'?'#fff':'#000'};font-size:7px;font-weight:800;padding:1px 5px;border-radius:4px;white-space:nowrap;z-index:3">${badge}</div>`:''}
        </div>`,
        iconSize:[size*3,size*3], iconAnchor:[size*1.5,size*1.5],
      });
      L.marker([node.lat, node.lng], { icon }).addTo(markerLayer)
        .bindPopup(buildPopup(node, isOrigin, isDisrupted && !isResolved, isOnAlt && isResolved), { className:'nexus-popup', maxWidth:280 });
    });
  }

  // ── ROUTES ────────────────────────────────────────────────────
  const LINE_W = 4;

  function renderRoutes(scenario, altRouteNodes) {
    routeLayer.clearLayers();
    animator.stop();
    const nl = nodeLookup();
    const isResolved = app.routeResolved && altRouteNodes?.length;
    const isNormal   = !scenario && !isResolved;
    const animRoutes = [];

    // Base edges
    EDGES.forEach(edge => {
      const src = nl[edge.source], tgt = nl[edge.target];
      if (!src || !tgt) return;
      const isAffected = scenario?.affectedEdges?.includes(edge.id);
      const isShadow   = edge.type === 'shadow' || edge.type === 'alt';
      let color, weight, dash, opacity;

      if (isNormal && !isShadow) {
        // NORMAL STATE: green transit lines
        color='#00e676'; weight=2; dash=null; opacity=0.6;
        // Green glow halo
        L.polyline([[src.lat,src.lng],[tgt.lat,tgt.lng]], { color:'#00e676', weight:8, opacity:0.07 }).addTo(routeLayer);
      } else if (isResolved && isAffected) {
        color='#00e676'; weight=LINE_W; dash=null; opacity=0.7;
      } else if (isAffected) {
        color='#ff1744'; weight=LINE_W; dash='8,4'; opacity=0.85;
      } else if (isShadow) {
        color='#8b5cf6'; weight=1.5; dash='6,6'; opacity=0.3;
      } else {
        color='rgba(0,240,255,0.2)'; weight=1; dash=null; opacity=0.35;
      }
      L.polyline([[src.lat,src.lng],[tgt.lat,tgt.lng]], { color,weight,dashArray:dash,opacity }).addTo(routeLayer);
    });

    // ── NORMAL STATE: green animated supply dots on all edges ──────
    if (isNormal) {
      EDGES.filter(e => e.type !== 'shadow' && e.type !== 'alt').forEach(edge => {
        const src = nl[edge.source], tgt = nl[edge.target];
        if (!src || !tgt) return;
        animRoutes.push({
          points: [{ lat:src.lat, lng:src.lng }, { lat:tgt.lat, lng:tgt.lng }],
          color: 'rgb(0,230,118)',
          disrupted: false,
          label: 'Transit',
        });
      });
    }


    // ── RED disrupted propagation route (with glow halo) ─────────
    if (scenario && !isResolved) {
      const path = scenario.propagationPath;
      const redPts = [];
      path.forEach((nodeId, i) => {
        if (i===0) return;
        const prev = nl[path[i-1]], curr = nl[nodeId];
        if (!prev || !curr) return;
        // Glow halo
        L.polyline([[prev.lat,prev.lng],[curr.lat,curr.lng]], { color:'#ff1744', weight:LINE_W+8, opacity:0.13 }).addTo(routeLayer);
        // Solid red line
        L.polyline([[prev.lat,prev.lng],[curr.lat,curr.lng]], { color:'#ff1744', weight:LINE_W, opacity:0.95, dashArray:'10,4' }).addTo(routeLayer);
        redPts.push({ lat:prev.lat, lng:prev.lng });
        if (i === path.length-1) redPts.push({ lat:curr.lat, lng:curr.lng });
      });
      if (redPts.length > 1) animRoutes.push({ points:redPts, color:'rgb(255,23,68)', disrupted:true, label:'Disrupted' });
    }

    // ── PURPLE Shadow Net alternative route (same LINE_W) ─────────
    if (altRouteNodes?.length > 1 && !isResolved) {
      const purplePts = [];
      altRouteNodes.forEach((nodeId, i) => {
        if (i===0) return;
        const prev = nl[altRouteNodes[i-1]], curr = nl[nodeId];
        if (!prev || !curr) return;
        // Glow halo
        L.polyline([[prev.lat,prev.lng],[curr.lat,curr.lng]], { color:'#8b5cf6', weight:LINE_W+8, opacity:0.15 }).addTo(routeLayer);
        // Solid purple line — SAME width as red (LINE_W = 4)
        L.polyline([[prev.lat,prev.lng],[curr.lat,curr.lng]], { color:'#8b5cf6', weight:LINE_W, opacity:0.95 }).addTo(routeLayer);
        purplePts.push({ lat:prev.lat, lng:prev.lng });
        if (i === altRouteNodes.length-1) purplePts.push({ lat:curr.lat, lng:curr.lng });
      });
      if (purplePts.length > 1) animRoutes.push({ points:purplePts, color:'rgb(139,92,246)', disrupted:false, label:'Shadow Net' });
    }

    // ── GREEN resolved route ──────────────────────────────────────
    if (isResolved && altRouteNodes?.length > 1) {
      const greenPts = [];
      altRouteNodes.forEach((nodeId, i) => {
        if (i===0) return;
        const prev = nl[altRouteNodes[i-1]], curr = nl[nodeId];
        if (!prev || !curr) return;
        L.polyline([[prev.lat,prev.lng],[curr.lat,curr.lng]], { color:'#00e676', weight:LINE_W+8, opacity:0.15 }).addTo(routeLayer);
        L.polyline([[prev.lat,prev.lng],[curr.lat,curr.lng]], { color:'#00e676', weight:LINE_W, opacity:1 }).addTo(routeLayer);
        greenPts.push({ lat:prev.lat, lng:prev.lng });
        if (i===altRouteNodes.length-1) greenPts.push({ lat:curr.lat, lng:curr.lng });
      });
      if (greenPts.length > 1) animRoutes.push({ points:greenPts, color:'rgb(0,230,118)', disrupted:false, label:'Safe' });
    }

    // Start canvas animation if there are any routes to animate
    if (animRoutes.length) {
      animator.setRoutes(animRoutes);
      animator.start();
    }
  }

  // ── POPUP ─────────────────────────────────────────────────────
  function buildPopup(node, isOrigin, isDisrupted, isSafe) {
    const typeColors = { raw:'#00e676', manufacturer:'#00f0ff', assembly:'#3b82f6', distribution:'#ffab00', retail:'#8b5cf6', ghost:'#8b5cf6' };
    const col = isSafe?'#00e676': typeColors[node.type]||'#9aa0a6';
    return `<div style="font-family:'Inter',sans-serif;background:#0f1421;color:#e8eaed;padding:14px;border-radius:10px;min-width:220px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:18px">${node.icon}</span>
        <div>
          <div style="font-weight:700;font-size:13px;color:${isOrigin&&!isSafe?'#ff1744':col}">${node.name}</div>
          <div style="font-size:11px;color:#5f6368">${node.location}</div>
        </div>
        ${isOrigin&&!isSafe?'<span style="background:rgba(255,23,68,.2);color:#ff1744;border:1px solid rgba(255,23,68,.4);padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;margin-left:auto">ORIGIN</span>':''}
        ${isDisrupted?'<span style="background:rgba(255,171,0,.2);color:#ffab00;border:1px solid rgba(255,171,0,.4);padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;margin-left:auto">IMPACTED</span>':''}
        ${isSafe?'<span style="background:rgba(0,230,118,.2);color:#00e676;border:1px solid rgba(0,230,118,.4);padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;margin-left:auto">✅ SAFE</span>':''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div style="background:#131929;border-radius:6px;padding:8px;text-align:center">
          <div style="font-size:16px;font-weight:800;font-family:'JetBrains Mono',monospace;color:${isSafe?'#00e676':isOrigin?'#ff1744':'#00f0ff'}">${isSafe?'LOW':node.riskScore}</div>
          <div style="font-size:9px;color:#5f6368;text-transform:uppercase">Risk Score</div>
        </div>
        <div style="background:#131929;border-radius:6px;padding:8px;text-align:center">
          <div style="font-size:16px;font-weight:800;font-family:'JetBrains Mono',monospace;color:#00e676">${(node.capacity/1000).toFixed(0)}k</div>
          <div style="font-size:9px;color:#5f6368;text-transform:uppercase">Capacity</div>
        </div>
      </div>
      <div style="margin-top:8px;font-size:10px;color:#5f6368;display:flex;justify-content:space-between">
        <span>Tier ${node.tier} · ${node.type.toUpperCase()}</span>
        <span style="color:${isSafe?'#00e676':node.status==='healthy'?'#00e676':node.status==='warning'?'#ffab00':'#ff1744'}">${isSafe?'SAFE ✅':node.status.toUpperCase()}</span>
      </div>
      ${isSafe?'<div style="margin-top:8px;padding:6px 10px;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:6px;font-size:10px;color:#00e676;font-weight:600">🟢 Alternative route active — SLA preserved</div>':''}
    </div>`;
  }

  // ── MAP LEGEND ────────────────────────────────────────────────
  function showMapLegend(showAlt, isResolved) {
    const existing = document.getElementById('nexus-map-legend');
    if (existing) existing.remove();
    if (!showAlt && !isResolved) return;
    const legend = document.createElement('div');
    legend.id = 'nexus-map-legend';
    legend.style.cssText = 'position:absolute;bottom:10px;left:10px;z-index:1000;background:rgba(10,14,26,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;font-family:Inter,sans-serif;min-width:160px;';
    legend.innerHTML = `
      <div style="font-size:10px;font-weight:700;color:#9aa0a6;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Route Legend</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <div style="width:28px;height:4px;background:#ff1744;border-radius:2px;box-shadow:0 0 6px #ff1744"></div>
        <span style="font-size:11px;color:#ff6b6b;font-weight:600">Disrupted Route</span>
      </div>
      ${showAlt && !isResolved ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <div style="width:28px;height:4px;background:#8b5cf6;border-radius:2px;box-shadow:0 0 6px #8b5cf6"></div>
        <span style="font-size:11px;color:#a78bfa;font-weight:600">Shadow Net Route</span>
      </div>` : ''}
      ${isResolved ? `<div style="display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:4px;background:#00e676;border-radius:2px;box-shadow:0 0 6px #00e676"></div>
        <span style="font-size:11px;color:#00e676;font-weight:600">Safe Route ✅</span>
      </div>` : ''}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-size:9px;color:#5f6368">● Animated dots = live shipments</div>`;
    document.getElementById(containerId)?.appendChild(legend);
  }

  // Initial render
  renderNodes(app.activeScenario, app.altRouteNodes);
  renderRoutes(app.activeScenario, app.altRouteNodes);

  // ── PUBLIC API ────────────────────────────────────────────────
  map.nexusUpdate = function(scenario) {
    app.altRouteNodes = null; app.routeResolved = false;
    renderNodes(scenario, null);
    renderRoutes(scenario, null);
    showMapLegend(false, false);
    if (scenario) {
      const o = NODES.find(n => n.id === scenario.origin);
      if (o) map.flyTo([o.lat, o.lng], compact ? 4 : 5, { duration:1.5 });
    }
  };

  map.nexusShowAlternative = function(scenario, altNodes) {
    app.altRouteNodes = altNodes; app.routeResolved = false;
    renderNodes(scenario, altNodes);
    renderRoutes(scenario, altNodes);
    showMapLegend(true, false);
    // Fly to show both routes
    const nl = nodeLookup();
    const allNodeIds = [...(scenario?.propagationPath||[]), ...(altNodes||[])];
    const pts = allNodeIds.map(id => nl[id]).filter(Boolean).map(n => [n.lat, n.lng]);
    if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.25), { duration:1.5 });
  };

  map.nexusResolve = function(scenario, altNodes) {
    app.altRouteNodes = altNodes; app.routeResolved = true;
    renderNodes(scenario, altNodes);
    renderRoutes(scenario, altNodes);
    showMapLegend(false, true);
    map.flyTo([22, 82], compact ? 3 : 4, { duration:2 });
  };

  // Cleanup on map remove
  map.on('remove', () => animator.destroy());

  return map;
}

// ── GLOBAL CSS ────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  .leaflet-container { background: #050810 !important; }
  .leaflet-tile { filter: brightness(0.85) saturate(0.25); }
  .nexus-popup .leaflet-popup-content-wrapper { background:#0f1421!important;border:1px solid rgba(0,240,255,0.2)!important;box-shadow:0 8px 32px rgba(0,0,0,0.8)!important;border-radius:12px!important;padding:0!important; }
  .nexus-popup .leaflet-popup-content { margin:0!important; }
  .nexus-popup .leaflet-popup-tip { background:#0f1421!important; }
  .nexus-popup .leaflet-popup-close-button { color:#5f6368!important;top:8px!important;right:8px!important; }
  .nexus-state-tooltip { background:rgba(10,14,26,0.9)!important;border:1px solid rgba(0,240,255,0.2)!important;color:rgba(0,240,255,0.7)!important;font-size:10px!important;font-weight:600!important;border-radius:6px!important;padding:3px 8px!important;box-shadow:none!important; }
  .nexus-state-tooltip::before { display:none!important; }
  @keyframes nexus-pulse-cyan-kf   { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.6);opacity:.1} }
  @keyframes nexus-pulse-red-kf    { 0%,100%{transform:scale(1);opacity:.65} 50%{transform:scale(2.2);opacity:.05} }
  @keyframes nexus-pulse-amber-kf  { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.7);opacity:.1} }
  @keyframes nexus-pulse-purple-kf { 0%,100%{transform:scale(1);opacity:.55} 50%{transform:scale(1.8);opacity:.1} }
  @keyframes nexus-pulse-green-kf  { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.9);opacity:.08} }
  .nexus-pulse-cyan   { animation: nexus-pulse-cyan-kf   2.5s ease-in-out infinite; }
  .nexus-pulse-red    { animation: nexus-pulse-red-kf    1.1s ease-in-out infinite; }
  .nexus-pulse-amber  { animation: nexus-pulse-amber-kf  1.8s ease-in-out infinite; }
  .nexus-pulse-purple { animation: nexus-pulse-purple-kf 1.6s ease-in-out infinite; }
  .nexus-pulse-green  { animation: nexus-pulse-green-kf  1.4s ease-in-out infinite; }
`;
document.head.appendChild(style);
