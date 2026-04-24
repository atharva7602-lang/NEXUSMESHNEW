// ============================================
// NEXUSMESH — "Dark Matter" Telemetry Simulator
// Worker behavioral signals as leading disruption indicators
// ============================================

const WAREHOUSES = [
  { id: 'wh-dhaka',   name: 'Dhaka Sorting Hub',   location: 'Dhaka, BD',    workers: 48 },
  { id: 'wh-kolkata', name: 'Kolkata Regional DC',  location: 'Kolkata, IN',  workers: 62 },
  { id: 'wh-mumbai',  name: 'Mumbai Port Hub',      location: 'Mumbai, IN',   workers: 85 },
  { id: 'wh-delhi',   name: 'Delhi NCR Fulfilment', location: 'Delhi, IN',    workers: 71 },
  { id: 'wh-pune',    name: 'MegaCorp India Hub',   location: 'Pune, IN',     workers: 54 },
];

// Baseline normal values
const BASELINE = {
  scanHesitation:   320,   // ms per scan
  reScanRate:       2.1,   // % of scans requiring re-scan
  workerFatigue:    28,    // 0-100 index
  pickAccuracy:     99.2,  // %
  throughput:       1800,  // items/hr
};

class TelemetrySimulator {
  constructor() {
    this.warehouses = WAREHOUSES;
    this.data = {};
    this.anomalyActive = false;
    this.anomalyWarehouse = 'wh-dhaka';
    this.listeners = {};
    this.interval = null;
    this.tick = 0;

    // Initialize data streams
    this.warehouses.forEach(wh => {
      this.data[wh.id] = {
        ...wh,
        history: {
          scanHesitation: this._genHistory(BASELINE.scanHesitation, 40),
          reScanRate:     this._genHistory(BASELINE.reScanRate, 0.5),
          workerFatigue:  this._genHistory(BASELINE.workerFatigue, 5),
          pickAccuracy:   this._genHistory(BASELINE.pickAccuracy, 0.3),
          throughput:     this._genHistory(BASELINE.throughput, 150),
          timestamps:     this._genTimestamps(),
        },
        current: {
          scanHesitation: BASELINE.scanHesitation + (Math.random() - 0.5) * 40,
          reScanRate:     BASELINE.reScanRate + (Math.random() - 0.5) * 0.5,
          workerFatigue:  BASELINE.workerFatigue + (Math.random() - 0.5) * 5,
          pickAccuracy:   BASELINE.pickAccuracy - Math.random() * 0.3,
          throughput:     BASELINE.throughput + (Math.random() - 0.5) * 150,
        },
        anomalyScore: 0,
        alertLevel: 'normal',
      };
    });
  }

  _genHistory(base, variance, count = 30) {
    return Array.from({ length: count }, () => base + (Math.random() - 0.5) * variance * 2);
  }

  _genTimestamps(count = 30) {
    const now = Date.now();
    return Array.from({ length: count }, (_, i) => now - (count - i) * 60000);
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  start(intervalMs = 1200) {
    this.interval = setInterval(() => this._tick(), intervalMs);
    return this;
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    return this;
  }

  triggerAnomaly(warehouseId = 'wh-dhaka') {
    this.anomalyActive = true;
    this.anomalyWarehouse = warehouseId;
    this.anomalyTick = 0;
    this.emit('anomaly-start', { warehouseId, timestamp: Date.now() });
  }

  resetAnomaly() {
    this.anomalyActive = false;
    this.anomalyTick = 0;
    this.emit('anomaly-end', { timestamp: Date.now() });
  }

  _tick() {
    this.tick++;
    const updates = {};

    this.warehouses.forEach(wh => {
      const d = this.data[wh.id];
      const isAnomalous = this.anomalyActive && wh.id === this.anomalyWarehouse;

      if (isAnomalous) {
        this.anomalyTick = (this.anomalyTick || 0) + 1;
        const anomalyFactor = Math.min(this.anomalyTick / 8, 1); // Ramps up over 8 ticks

        d.current.scanHesitation  = BASELINE.scanHesitation * (1 + anomalyFactor * 2.8) + (Math.random() - 0.5) * 80;
        d.current.reScanRate      = BASELINE.reScanRate * (1 + anomalyFactor * 4.5) + Math.random() * 1.5;
        d.current.workerFatigue   = BASELINE.workerFatigue + anomalyFactor * 55 + Math.random() * 10;
        d.current.pickAccuracy    = BASELINE.pickAccuracy - anomalyFactor * 8.5 - Math.random() * 2;
        d.current.throughput      = BASELINE.throughput * (1 - anomalyFactor * 0.55) + (Math.random() - 0.5) * 100;

        d.anomalyScore = Math.round(anomalyFactor * 94 + Math.random() * 6);
        d.alertLevel = anomalyFactor > 0.6 ? 'critical' : anomalyFactor > 0.3 ? 'warning' : 'elevated';
      } else {
        // Normal drift
        d.current.scanHesitation  += (Math.random() - 0.5) * 25;
        d.current.reScanRate      += (Math.random() - 0.5) * 0.3;
        d.current.workerFatigue   += (Math.random() - 0.5) * 3;
        d.current.pickAccuracy    += (Math.random() - 0.5) * 0.15;
        d.current.throughput      += (Math.random() - 0.5) * 80;

        // Clamp to realistic ranges
        d.current.scanHesitation  = Math.max(220, Math.min(480, d.current.scanHesitation));
        d.current.reScanRate      = Math.max(0.8, Math.min(4.5, d.current.reScanRate));
        d.current.workerFatigue   = Math.max(10, Math.min(55, d.current.workerFatigue));
        d.current.pickAccuracy    = Math.max(97, Math.min(99.9, d.current.pickAccuracy));
        d.current.throughput      = Math.max(1200, Math.min(2400, d.current.throughput));

        d.anomalyScore = Math.max(0, Math.min(15, d.anomalyScore + (Math.random() - 0.5) * 4));
        d.alertLevel = d.anomalyScore > 10 ? 'elevated' : 'normal';
      }

      // Update history
      const h = d.history;
      Object.keys(d.current).forEach(key => {
        if (h[key]) {
          h[key].push(d.current[key]);
          if (h[key].length > 60) h[key].shift();
        }
      });
      h.timestamps.push(Date.now());
      if (h.timestamps.length > 60) h.timestamps.shift();

      updates[wh.id] = { ...d };
    });

    this.data = { ...this.data, ...updates };
    this.emit('update', { data: this.data, tick: this.tick });
  }

  getAllData() { return this.data; }
  getWarehouseData(id) { return this.data[id]; }
  getDhaka() { return this.data['wh-dhaka']; }

  // Compute a global "dark matter signal" composite score
  getGlobalAnomalyScore() {
    const scores = Object.values(this.data).map(d => d.anomalyScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
}

export const telemetrySimulator = new TelemetrySimulator();
export { WAREHOUSES, BASELINE };
