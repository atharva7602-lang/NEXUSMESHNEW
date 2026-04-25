// ============================================
// NEXUSMESH — Bloomberg-style Event Ticker
// Real-time supply chain intelligence stream
// ============================================

export function initEventTicker(app, getTickerFn) {
  const ticker = document.createElement('div');
  ticker.id = 'nexus-ticker';
  ticker.innerHTML = `
    <div id="nexus-ticker-label">LIVE FEED</div>
    <div id="nexus-ticker-track-wrapper">
      <div id="nexus-ticker-track"></div>
    </div>
  `;
  document.body.appendChild(ticker);

  const style = document.createElement('style');
  style.textContent = `
    #nexus-ticker {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 34px;
      background: rgba(5,8,16,0.97);
      border-top: 1px solid rgba(0,240,255,0.12);
      z-index: 7000;
      display: flex;
      align-items: center;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }
    #nexus-ticker-label {
      padding: 0 14px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #00f0ff;
      background: rgba(0,240,255,0.08);
      border-right: 1px solid rgba(0,240,255,0.2);
      height: 100%;
      display: flex;
      align-items: center;
      white-space: nowrap;
      flex-shrink: 0;
    }
    #nexus-ticker-track-wrapper {
      flex: 1;
      overflow: hidden;
      height: 100%;
      display: flex;
      align-items: center;
    }
    #nexus-ticker-track {
      display: flex;
      align-items: center;
      gap: 0;
      white-space: nowrap;
      animation: ticker-scroll linear infinite;
      animation-duration: 60s;
    }
    #nexus-ticker-track.fast { animation-duration: 30s; }
    .ticker-item {
      font-size: 11.5px;
      font-weight: 500;
      color: #9aa0a6;
      padding: 0 24px;
      border-right: 1px solid rgba(255,255,255,0.05);
      white-space: nowrap;
    }
    .ticker-item.alert { color: #ff1744; font-weight: 700; }
    .ticker-item.warning { color: #ffab00; font-weight: 600; }
    .ticker-item.info { color: #00f0ff; }
    .ticker-item.success { color: #00e676; }
    @keyframes ticker-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    /* Push main content up to not overlap ticker */
    .main-content { padding-bottom: calc(var(--space-6) + 34px) !important; }
  `;
  document.head.appendChild(style);

  function buildItems(items) {
    return items.map(item => {
      let cls = 'ticker-item';
      if (item.startsWith('🚨') || item.startsWith('💸')) cls += ' alert';
      else if (item.startsWith('⚡') || item.startsWith('⚠️')) cls += ' warning';
      else if (item.startsWith('📡') || item.startsWith('🌐') || item.startsWith('📊')) cls += ' info';
      else if (item.startsWith('✅') || item.startsWith('🛡️')) cls += ' success';
      return `<div class="${cls}">${item}</div>`;
    }).join('');
  }

  function refresh() {
    const items = getTickerFn();
    // Duplicate items for infinite scroll illusion
    const html = buildItems(items) + buildItems(items);
    const track = document.getElementById('nexus-ticker-track');
    if (track) {
      track.innerHTML = html;
      track.classList.toggle('fast', app.disruptionActive);
    }
  }

  refresh();
  // Refresh ticker every 10 seconds
  setInterval(refresh, 10000);

  return { refresh };
}
