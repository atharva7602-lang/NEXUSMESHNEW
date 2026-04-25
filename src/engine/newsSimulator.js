// ============================================
// NEXUSMESH — Dynamic News Simulator Engine
// Generates realistic global supply chain disruption events
// mapped to actual supply chain graph nodes
// ============================================

export const DISRUPTION_SCENARIOS = [
  {
    id: 'dhaka-border-2026',
    headline: '🚨 Bangladesh–India Border Checkpoint Seizes 3 Truck Convoys',
    source: 'Reuters Trade Wire',
    region: 'South Asia',
    origin: 'mfg-3',
    type: 'regulatory',
    severity: 'critical',
    description: 'Customs anomaly flags triggered an emergency regulatory inspection at the Benapole–Petrapole corridor, detaining all outbound textile shipments.',
    workerTelemetrySignal: 'Scan hesitation at Dhaka warehouse increased 340% over 6hrs — Edge TPU anomaly detected',
    propagationPath: ['mfg-3', 'asm-2', 'dc-1', 'dc-3', 'ret-1'],
    affectedEdges: ['e8', 'e13', 'e22', 'e23', 'e17', 'e19'],
    estimatedImpactHrs: 48,
    revenueAtRisk: 4200000,
    alternativeNodes: ['alt-1', 'ghost-1', 'micro-1', 'micro-2'],
    signals: { sarSignal: 0.85, sentiment: 0.72, telemetry: 0.91 },
    riskBoost: 82,
    lat: 23.8, lng: 90.4,
    tags: ['regulatory', 'border', 'textiles'],
  },
  {
    id: 'osaka-quake-2026',
    headline: '🌍 Magnitude 6.1 Earthquake Disrupts Osaka Manufacturing Belt',
    source: 'AP Global News',
    region: 'Japan',
    origin: 'mfg-1',
    type: 'natural',
    severity: 'high',
    description: 'A 6.1 magnitude earthquake struck the Kansai region, forcing emergency shutdowns at precision parts facilities. Damage assessment ongoing.',
    workerTelemetrySignal: 'Production line halt detected at Osaka facility — seismic sensor data confirms 4.2hr downtime',
    propagationPath: ['mfg-1', 'asm-1', 'dc-4', 'dc-1', 'ret-3'],
    affectedEdges: ['e2', 'e6', 'e7', 'e11', 'e21'],
    estimatedImpactHrs: 72,
    revenueAtRisk: 6800000,
    alternativeNodes: ['alt-1', 'mfg-2'],
    signals: { sarSignal: 0.91, sentiment: 0.68, telemetry: 0.78 },
    riskBoost: 76,
    lat: 34.7, lng: 135.5,
    tags: ['natural disaster', 'earthquake', 'manufacturing'],
  },
  {
    id: 'rotterdam-strike-2026',
    headline: '⚓ Rotterdam Port Workers Strike Enters Day 3 — 400+ Ships Queued',
    source: 'Lloyd\'s Maritime Intelligence',
    region: 'Europe',
    origin: 'dc-5',
    type: 'labor',
    severity: 'high',
    description: 'Labor union disputes over automation policies have paralyzed the Port of Rotterdam, the largest gateway port in Europe, affecting 40% of EU supply routes.',
    workerTelemetrySignal: 'Zero throughput recorded at Rotterdam Gateway — union lockout confirmed via port authority API',
    propagationPath: ['dc-5', 'asm-3', 'mfg-5', 'ret-4'],
    affectedEdges: ['e4', 'e10', 'e15', 'e20'],
    estimatedImpactHrs: 96,
    revenueAtRisk: 9100000,
    alternativeNodes: ['dc-5'],
    signals: { sarSignal: 0.44, sentiment: 0.89, telemetry: 0.55 },
    riskBoost: 71,
    lat: 51.9, lng: 4.5,
    tags: ['labor', 'port', 'europe', 'shipping'],
  },
  {
    id: 'chile-lithium-2026',
    headline: '⚡ Chilean Lithium Export Ban Triggers Global Battery Supply Shock',
    source: 'Bloomberg Commodities',
    region: 'South America',
    origin: 'rm-3',
    type: 'geopolitical',
    severity: 'critical',
    description: 'Chilean government announced a 60-day moratorium on lithium exports to renegotiate state ownership terms. Battery manufacturers worldwide are scrambling for alternatives.',
    workerTelemetrySignal: 'Atacama mine output dropped to 0 — government enforcement drones detected at perimeter via SAR',
    propagationPath: ['rm-3', 'mfg-5', 'asm-3', 'dc-5', 'ret-4'],
    affectedEdges: ['e4', 'e10', 'e15', 'e20'],
    estimatedImpactHrs: 1440,
    revenueAtRisk: 22000000,
    alternativeNodes: ['rm-2'],
    signals: { sarSignal: 0.96, sentiment: 0.93, telemetry: 0.42 },
    riskBoost: 88,
    lat: -23.6, lng: -68.2,
    tags: ['geopolitical', 'commodities', 'lithium', 'ban'],
  },
  {
    id: 'shanghai-lockdown-2026',
    headline: '🏙️ Shanghai Port Operations Restricted — Health Protocol Enforcement',
    source: 'Xinhua Economic Wire',
    region: 'China',
    origin: 'dc-4',
    type: 'regulatory',
    severity: 'high',
    description: 'Authorities enforced strict health protocol inspections at the Shanghai Crossdock, reducing container throughput by 65%. 180 vessels redirected to Ningbo.',
    workerTelemetrySignal: 'Shanghai DC throughput dropped 65% — crowd-sourced mobility data confirms restricted movement',
    propagationPath: ['dc-4', 'asm-1', 'mfg-2', 'dc-1', 'ret-1'],
    affectedEdges: ['e2', 'e3', 'e7', 'e11', 'e16', 'e17'],
    estimatedImpactHrs: 120,
    revenueAtRisk: 12500000,
    alternativeNodes: ['alt-1', 'ghost-1'],
    signals: { sarSignal: 0.78, sentiment: 0.84, telemetry: 0.67 },
    riskBoost: 79,
    lat: 31.2, lng: 121.5,
    tags: ['regulatory', 'health', 'china', 'port'],
  },
  {
    id: 'mumbai-flood-2026',
    headline: '🌧️ Extreme Monsoon Floods Mumbai Port Hub — Cargo Operations Halted',
    source: 'Indian Meteorological Service',
    region: 'India',
    origin: 'dc-2',
    type: 'natural',
    severity: 'critical',
    description: 'Record-breaking monsoon rainfall (487mm in 24hrs) has inundated the JNPT port area. All cargo operations suspended. Military deployed for rescue operations.',
    workerTelemetrySignal: 'Mumbai hub offline — IoT flood sensors reporting 1.2m water level in cargo bay. Zero throughput.',
    propagationPath: ['dc-2', 'asm-2', 'ret-2', 'dc-1'],
    affectedEdges: ['e12', 'e14', 'e18', 'e22'],
    estimatedImpactHrs: 60,
    revenueAtRisk: 7800000,
    alternativeNodes: ['dc-1', 'ghost-1', 'micro-1'],
    signals: { sarSignal: 0.88, sentiment: 0.71, telemetry: 0.83 },
    riskBoost: 74,
    lat: 19.1, lng: 72.9,
    tags: ['natural disaster', 'flood', 'india', 'port'],
  },
  {
    id: 'busan-cyber-2026',
    headline: '💻 Ransomware Attack Hits Busan Components Ltd — Production Halted',
    source: 'CyberSec Asia Monitor',
    region: 'South Korea',
    origin: 'mfg-2',
    type: 'cyber',
    severity: 'high',
    description: 'A sophisticated ransomware group targeted Busan\'s OT/SCADA systems, encrypting production control software. All automated manufacturing lines are down pending forensics.',
    workerTelemetrySignal: 'PLC anomalies detected at Busan facility — network scan shows lateral movement across 14 devices',
    propagationPath: ['mfg-2', 'asm-1', 'dc-4', 'ret-3'],
    affectedEdges: ['e3', 'e7', 'e11', 'e21'],
    estimatedImpactHrs: 36,
    revenueAtRisk: 3900000,
    alternativeNodes: ['mfg-1', 'alt-1'],
    signals: { sarSignal: 0.31, sentiment: 0.77, telemetry: 0.96 },
    riskBoost: 68,
    lat: 35.1, lng: 129.0,
    tags: ['cyber', 'ransomware', 'korea', 'manufacturing'],
  },
];

class NewsSimulator {
  constructor() {
    this._listeners = {};
    this._tickerPool = [
      '📡 SHADOW NET: Ghost capacity TL-7724 on standby',
      '🌐 SAR SIGNAL: No port anomalies detected — Colombo & Singapore clear',
      '📊 GNN ENGINE: Risk propagation model v3.2 — all nodes nominal',
      '🧵 TEXTILE: Bangladesh–India corridor throughput 94% of SLA target',
      '⚓ SHIPPING: Strait of Malacca — 312 vessels in transit, nominal',
      '🔌 SEMICONDUCTORS: TSMC allocation confirmed — Q2 2026 on schedule',
      '🛡️ SENTINEL: No anomalies in SAR sweep of major port zones',
      '📰 SENTIMENT: Global trade sentiment index 61.4 — stable',
      '⚡ ENERGY: European spot LNG prices up 3.2% — monitoring impact',
      '🚢 FREIGHT: Transpacific rates stable — Shanghai to LA USD 2,140/TEU',
      '🔧 MAINTENANCE: Stuttgart assembly line scheduled downtime in 48hrs',
      '🏭 CAPACITY: MegaCorp India Hub operating at 87% capacity',
      '🛒 DEMAND: North India retail demand up 12% — seasonal surge',
      '🌍 GEOPOLITICS: US–China trade talks ongoing — no tariff changes expected',
      '⛏️ MINING: Rajasthan Minerals output on track — Q2 quota met at 91%',
    ];
  }

  /** Get a random disruption scenario (excluding the passed id) */
  getRandomScenario(excludeId = null) {
    const pool = excludeId
      ? DISRUPTION_SCENARIOS.filter(s => s.id !== excludeId)
      : DISRUPTION_SCENARIOS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** Simulate a "news-triggered" disruption with random scenario */
  triggerNewsDisruption(specificId = null) {
    const scenario = specificId
      ? DISRUPTION_SCENARIOS.find(s => s.id === specificId) || this.getRandomScenario()
      : this.getRandomScenario();

    this._emit('disruption', scenario);
    return scenario;
  }

  /** Get live ticker items (mix static + dynamic) */
  getTickerItems(activeScenario = null) {
    const items = [...this._tickerPool];
    if (activeScenario) {
      items.unshift(`🚨 BREAKING: ${activeScenario.headline}`);
      items.unshift(`⚡ ALERT: GNN propagation — ${activeScenario.propagationPath.join(' → ')}`);
      items.unshift(`💸 REVENUE AT RISK: $${(activeScenario.revenueAtRisk / 1e6).toFixed(1)}M — ${activeScenario.region}`);
    }
    return items;
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  }
}

export const newsSimulator = new NewsSimulator();
