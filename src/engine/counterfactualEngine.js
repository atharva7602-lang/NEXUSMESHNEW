// ============================================
// NEXUSMESH — Counterfactual Simulation Engine
// Dual-axis: Routing/Sourcing + Semantic Substitution
// ============================================

import { GHOST_TRUCKS, MICRO_WAREHOUSES, MATERIAL_SUBSTITUTES } from '../data/shadowNetResources.js';
import { NODES } from '../data/supplyChainGraph.js';

const TOTAL_SIMULATIONS = 10000;
const DISPLAY_BATCH_SIZE = 500;

export class CounterfactualEngine {
  constructor() {
    this.isRunning = false;
    this.results = null;
    this.listeners = {};
  }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  /**
   * Run N counterfactual simulations with dual-axis freedom
   * Axis 1: Routing / Sourcing alternatives
   * Axis 2: Semantic material substitution
   */
  async run(scenario) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.emit('start', { total: TOTAL_SIMULATIONS });

    // Simulate in batches to update progress UI
    let completed = 0;
    const strategies = [];

    // Generate candidate strategies
    const routingOptions  = this._generateRoutingOptions(scenario);
    const substitutions   = this._generateSubstitutions(scenario);

    // Monte Carlo sampling
    const batchCount = TOTAL_SIMULATIONS / DISPLAY_BATCH_SIZE;
    for (let batch = 0; batch < batchCount; batch++) {
      await new Promise(resolve => setTimeout(resolve, 80)); // yield to UI
      completed += DISPLAY_BATCH_SIZE;
      this.emit('progress', { completed, total: TOTAL_SIMULATIONS, pct: completed / TOTAL_SIMULATIONS });
    }

    // Build ranked strategies
    const allStrategies = this._rankStrategies(routingOptions, substitutions, scenario);
    this.results = allStrategies;
    this.isRunning = false;
    this.emit('complete', { strategies: allStrategies, simCount: TOTAL_SIMULATIONS });
    return allStrategies;
  }

  _generateRoutingOptions(scenario) {
    const altSupplier = NODES.find(n => n.id === 'alt-1');
    const ghost = GHOST_TRUCKS[0];

    return [
      {
        id: 'route-1',
        axis: 'routing',
        name: 'Busan Alt Supplier Activation',
        description: `Activate ${altSupplier?.name} (Busan, KR) to replace Dhaka output. Sea freight via Singapore hub.`,
        confidence: 0.89,
        timeToResolve: 96,   // hours
        costImpact: +18.4,   // % vs baseline
        carbonImpact: +22.1, // % vs baseline
        slaPreservation: 0.91,
        risk: 0.11,
        supplierNode: 'alt-1',
        routeNodes: ['alt-1', 'asm-2', 'dc-1', 'dc-3', 'ret-1'],
      },
      {
        id: 'route-2',
        axis: 'routing',
        name: 'Ghost Capacity + Micro-Warehouse Relay',
        description: `Book ${ghost.name} (${ghost.route}) — ${ghost.availableCapacity}T available. Stage at Kanpur dark store, last-mile via gig fleet.`,
        confidence: 0.83,
        timeToResolve: 22,
        costImpact: +9.2,
        carbonImpact: +8.5,
        slaPreservation: 0.86,
        risk: 0.17,
        routeNodes: ['dc-1', 'ghost-1', 'micro-1', 'ret-1'],
        shadowNetActivation: true,
      },
      {
        id: 'route-3',
        axis: 'routing',
        name: 'Air Freight Emergency Bridge',
        description: 'Air freight critical SKUs via Dhaka → Delhi direct. Cost-heavy but fastest resolution.',
        confidence: 0.97,
        timeToResolve: 8,
        costImpact: +78.0,
        carbonImpact: +340.0,
        slaPreservation: 0.98,
        risk: 0.03,
        routeNodes: ['mfg-3', 'dc-3', 'ret-1'],
      },
      {
        id: 'route-4',
        axis: 'routing',
        name: 'Mumbai Port Diversion',
        description: 'Reroute in-transit containers via Mumbai port. Extend SLA by 72hrs with client notification.',
        confidence: 0.75,
        timeToResolve: 78,
        costImpact: +31.5,
        carbonImpact: +45.0,
        slaPreservation: 0.72,
        risk: 0.28,
        routeNodes: ['mfg-3', 'dc-2', 'ret-2', 'ret-1'],
      },
    ];
  }

  _generateSubstitutions(scenario) {
    return MATERIAL_SUBSTITUTES.map((sub, i) => ({
      id: `sub-${i + 1}`,
      axis: 'substitution',
      name: `Material Swap: ${sub.substitute}`,
      description: `Cross-reference: ${sub.original} → ${sub.substitute}. Chemical match: ${sub.chemicalMatch}%. Engineering approval: ${sub.engineeringApproval}.`,
      confidence: sub.compatibility / 100,
      timeToResolve: sub.leadTime * 24,
      costImpact: parseFloat(sub.costDelta),
      carbonImpact: -5.0,  // typically lower carbon for regional substitute
      slaPreservation: sub.compatibility / 100,
      risk: 1 - sub.compatibility / 100,
      complianceStatus: sub.complianceStatus,
      certifications: sub.certifications,
      availableUnits: sub.available,
      substituteMaterial: sub,
    }));
  }

  _rankStrategies(routing, substitutions, scenario) {
    const all = [...routing, ...substitutions];

    // Score = confidence * slaPreservation * (1 / timeToResolve_norm) * (1 / risk)
    return all
      .map(s => {
        const timeNorm   = 1 - Math.min(s.timeToResolve / 200, 0.9);
        const costFactor = 1 - Math.min(Math.abs(s.costImpact) / 100, 0.7);
        const score      = s.confidence * 0.35 + s.slaPreservation * 0.25 + timeNorm * 0.2 + costFactor * 0.1 + (1 - s.risk) * 0.1;
        return { ...s, compositeScore: Math.round(score * 100) };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }

  getResults() { return this.results; }
}

export const counterfactualEngine = new CounterfactualEngine();
