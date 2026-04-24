// ============================================
// NEXUSMESH — GNN Disruption Propagation Simulator
// Implements: P(Sⱼ|Sᵢ) = σ(W·[hᵢ‖eᵢⱼ]+b) · e^(-λΔt)
// ============================================

// Sigmoid activation
const sigmoid = x => 1 / (1 + Math.exp(-x));

// Global model weights (fixed for demo — in production: learned from Vertex AI)
const W_ANOMALY   = [0.42, 0.38, 0.31];   // weights for [SAR, sentiment, telemetry] in hᵢ
const W_EDGE      = [0.28, 0.22];           // weights for [leadTime_norm, trustScore_norm] in eᵢⱼ
const B_PROPAGATE = -0.15;                  // bias
const LAMBDA      = 0.08;                   // temporal decay factor

/**
 * Compute fused anomaly vector hᵢ for a node
 * @param {Object} node - supply chain node
 * @param {number} sarSignal   - 0-1 SAR anomaly signal
 * @param {number} sentiment   - 0-1 negative sentiment score
 * @param {number} telemetry   - 0-1 worker telemetry anomaly
 */
function computeNodeVector(node, sarSignal = 0, sentiment = 0, telemetry = 0) {
  const h = W_ANOMALY[0] * sarSignal + W_ANOMALY[1] * sentiment + W_ANOMALY[2] * telemetry;
  const baseline = node.riskScore / 100;
  return Math.min(1, h + baseline * 0.3);
}

/**
 * Compute edge constraint vector eᵢⱼ
 * Longer lead time = higher propagation risk
 * Lower trust score = higher propagation risk
 */
function computeEdgeVector(edge) {
  const leadNorm  = Math.min(edge.leadTime / 14, 1);        // normalize to [0,1], max 14 days
  const trustNorm = 1 - (edge.slaScore / 100);              // invert: lower trust = higher risk
  return W_EDGE[0] * leadNorm + W_EDGE[1] * trustNorm;
}

/**
 * P(Sⱼ|Sᵢ) = σ(W·[hᵢ‖eᵢⱼ]+b) · e^(-λΔt)
 * Causal propagation probability from node i to node j
 */
function propagationProbability(hI, eIJ, deltaT = 0) {
  const linearCombination = hI + eIJ + B_PROPAGATE;
  const sigActivation     = sigmoid(linearCombination);
  const decayFactor       = Math.exp(-LAMBDA * deltaT);
  return sigActivation * decayFactor;
}

/**
 * Run GNN propagation from a disruption origin node
 * Returns risk scores for ALL nodes in the graph
 */
export function runGNNPropagation({ nodes, edges, disruptionNodeId, signals = {} }) {
  const {
    sarSignal   = 0.85,
    sentiment   = 0.72,
    telemetry   = 0.91,
  } = signals;

  // Build adjacency map
  const adjacency = {};
  nodes.forEach(n => { adjacency[n.id] = []; });
  edges.forEach(e => {
    if (!e.dormant) {
      if (!adjacency[e.source]) adjacency[e.source] = [];
      adjacency[e.source].push({ target: e.target, edge: e });
    }
  });

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // Initialize risk scores
  const riskScores = {};
  const propagationPaths = {};
  nodes.forEach(n => {
    riskScores[n.id] = n.riskScore / 100;
    propagationPaths[n.id] = [];
  });

  // Origin node — full disruption
  riskScores[disruptionNodeId] = 0.97;

  // BFS propagation with probability decay
  const queue = [{ nodeId: disruptionNodeId, depth: 0, cumProb: 1.0 }];
  const visited = new Set([disruptionNodeId]);

  while (queue.length > 0) {
    const { nodeId, depth, cumProb } = queue.shift();
    if (depth > 5) continue;  // Max propagation depth

    const hI = nodeId === disruptionNodeId
      ? computeNodeVector(nodeMap[nodeId], sarSignal, sentiment, telemetry)
      : riskScores[nodeId];

    const neighbors = adjacency[nodeId] || [];
    neighbors.forEach(({ target, edge }) => {
      if (!nodeMap[target]) return;

      const eIJ    = computeEdgeVector(edge);
      const deltaT = depth * 6;  // 6-hour time steps per hop
      const prob   = propagationProbability(hI, eIJ, deltaT);
      const newRisk = cumProb * prob;

      if (newRisk > riskScores[target]) {
        riskScores[target] = Math.min(0.99, newRisk);
        propagationPaths[target] = [...(propagationPaths[nodeId] || []), nodeId];
      }

      if (!visited.has(target) && newRisk > 0.15) {
        visited.add(target);
        queue.push({ nodeId: target, depth: depth + 1, cumProb: newRisk });
      }
    });
  }

  // Convert to output format with velocity
  const results = nodes.map(n => ({
    ...n,
    riskScore: Math.round(riskScores[n.id] * 100),
    propagationPath: propagationPaths[n.id] || [],
    propagationDepth: propagationPaths[n.id]?.length || 0,
    status: riskScores[n.id] > 0.65 ? 'critical' :
            riskScores[n.id] > 0.35 ? 'warning' : 'healthy',
  }));

  const propagationVelocity = computePropagationVelocity(riskScores, visited.size);

  return {
    nodeRisks:   results,
    riskScores,
    propagationVelocity,
    affectedNodeCount: [...visited].filter(id => riskScores[id] > 0.35).length,
    criticalNodes: results.filter(n => n.riskScore > 65).map(n => n.id),
    signals: { sarSignal, sentiment, telemetry },
    formula: {
      expression: 'P(Sⱼ|Sᵢ) = σ(W·[hᵢ‖eᵢⱼ]+b) · e^(-λΔt)',
      lambda: LAMBDA,
      weights: { W_ANOMALY, W_EDGE, B_PROPAGATE },
    },
  };
}

function computePropagationVelocity(riskScores, visitedCount) {
  const highRiskCount = Object.values(riskScores).filter(r => r > 0.5).length;
  return {
    nodesAffectedPerHour: (visitedCount / 2).toFixed(1),
    highRiskSpread: `${highRiskCount} nodes`,
    estimatedFullPropagation: `${Math.round(visitedCount * 1.8)} hrs`,
  };
}

// Incremental risk update (for real-time streaming)
export function updateNodeRisk(currentRisks, telemetryData) {
  const updated = { ...currentRisks };
  // Dhaka factory telemetry → bump upstream risk
  const dhakaAnomaly = telemetryData['wh-dhaka']?.anomalyScore || 0;
  if (dhakaAnomaly > 20) {
    const bump = (dhakaAnomaly / 100) * 0.35;
    ['mfg-3', 'asm-2', 'dc-1'].forEach(id => {
      if (updated[id] !== undefined) {
        updated[id] = Math.min(0.99, updated[id] + bump);
      }
    });
  }
  return updated;
}
