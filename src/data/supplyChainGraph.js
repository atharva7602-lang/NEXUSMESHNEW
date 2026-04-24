// ============================================
// NEXUSMESH — Supply Chain Graph Data
// 25 nodes, 38 edges across Asia, Europe, Americas
// ============================================

export const NODES = [
  // ─── RAW MATERIAL SUPPLIERS (Tier 3) ───
  { id: 'rm-1', name: 'Rajasthan Minerals', type: 'raw', tier: 3, location: 'Jaipur, IN', lat: 26.9, lng: 75.8, capacity: 5000, status: 'healthy', riskScore: 12, icon: '⛏️', color: '#00e676' },
  { id: 'rm-2', name: 'Shandong Chemicals', type: 'raw', tier: 3, location: 'Qingdao, CN', lat: 36.1, lng: 120.4, capacity: 8000, status: 'healthy', riskScore: 18, icon: '🧪', color: '#00e676' },
  { id: 'rm-3', name: 'Chilean Lithium Co', type: 'raw', tier: 3, location: 'Atacama, CL', lat: -23.6, lng: -68.2, capacity: 3500, status: 'healthy', riskScore: 9, icon: '⚡', color: '#00e676' },

  // ─── COMPONENT MANUFACTURERS (Tier 2) ───
  { id: 'mfg-1', name: 'Osaka Precision Parts', type: 'manufacturer', tier: 2, location: 'Osaka, JP', lat: 34.7, lng: 135.5, capacity: 12000, status: 'healthy', riskScore: 22, icon: '🏭', color: '#00e676' },
  { id: 'mfg-2', name: 'Busan Components Ltd', type: 'manufacturer', tier: 2, location: 'Busan, KR', lat: 35.1, lng: 129.0, capacity: 9000, status: 'healthy', riskScore: 15, icon: '🏭', color: '#00e676' },
  { id: 'mfg-3', name: 'Dhaka Textile Mills', type: 'manufacturer', tier: 2, location: 'Dhaka, BD', lat: 23.8, lng: 90.4, capacity: 6000, status: 'warning', riskScore: 67, icon: '🧵', color: '#ffab00' },
  { id: 'mfg-4', name: 'Chennai Electronics', type: 'manufacturer', tier: 2, location: 'Chennai, IN', lat: 13.1, lng: 80.3, capacity: 7500, status: 'healthy', riskScore: 28, icon: '🔌', color: '#00e676' },
  { id: 'mfg-5', name: 'Stuttgart Auto Parts', type: 'manufacturer', tier: 2, location: 'Stuttgart, DE', lat: 48.8, lng: 9.2, capacity: 15000, status: 'healthy', riskScore: 11, icon: '🔧', color: '#00e676' },

  // ─── ASSEMBLY / FINISHED GOODS (Tier 1) ───
  { id: 'asm-1', name: 'NovaTech Assembly', type: 'assembly', tier: 1, location: 'Singapore', lat: 1.35, lng: 103.8, capacity: 20000, status: 'healthy', riskScore: 31, icon: '🏗️', color: '#00e676' },
  { id: 'asm-2', name: 'MegaCorp India Hub', type: 'assembly', tier: 1, location: 'Pune, IN', lat: 18.5, lng: 73.9, capacity: 18000, status: 'healthy', riskScore: 24, icon: '🏗️', color: '#00e676' },
  { id: 'asm-3', name: 'EuroPlex GmbH', type: 'assembly', tier: 1, location: 'Hamburg, DE', lat: 53.6, lng: 10.0, capacity: 22000, status: 'healthy', riskScore: 19, icon: '🏗️', color: '#00e676' },

  // ─── REGIONAL DISTRIBUTION CENTERS ───
  { id: 'dc-1', name: 'Kolkata Regional DC', type: 'distribution', tier: 1, location: 'Kolkata, IN', lat: 22.6, lng: 88.4, capacity: 30000, status: 'healthy', riskScore: 34, icon: '📦', color: '#00e676' },
  { id: 'dc-2', name: 'Mumbai Port Hub', type: 'distribution', tier: 1, location: 'Mumbai, IN', lat: 19.1, lng: 72.9, capacity: 35000, status: 'healthy', riskScore: 21, icon: '🚢', color: '#00e676' },
  { id: 'dc-3', name: 'Delhi NCR Fulfilment', type: 'distribution', tier: 1, location: 'Delhi, IN', lat: 28.7, lng: 77.1, capacity: 28000, status: 'healthy', riskScore: 45, icon: '📦', color: '#00e676' },
  { id: 'dc-4', name: 'Shanghai Crossdock', type: 'distribution', tier: 1, location: 'Shanghai, CN', lat: 31.2, lng: 121.5, capacity: 40000, status: 'healthy', riskScore: 17, icon: '🏢', color: '#00e676' },
  { id: 'dc-5', name: 'Rotterdam Gateway', type: 'distribution', tier: 1, location: 'Rotterdam, NL', lat: 51.9, lng: 4.5, capacity: 45000, status: 'healthy', riskScore: 13, icon: '⚓', color: '#00e676' },

  // ─── LAST-MILE / RETAILERS ───
  { id: 'ret-1', name: 'North India Retail Net', type: 'retail', tier: 0, location: 'Delhi, IN', lat: 28.6, lng: 77.2, capacity: 15000, status: 'healthy', riskScore: 38, icon: '🏪', color: '#00e676' },
  { id: 'ret-2', name: 'West India Markets', type: 'retail', tier: 0, location: 'Mumbai, IN', lat: 19.0, lng: 72.8, capacity: 12000, status: 'healthy', riskScore: 25, icon: '🏪', color: '#00e676' },
  { id: 'ret-3', name: 'Singapore E-Commerce', type: 'retail', tier: 0, location: 'Singapore', lat: 1.28, lng: 103.85, capacity: 9000, status: 'healthy', riskScore: 16, icon: '🛒', color: '#00e676' },
  { id: 'ret-4', name: 'EU Direct Market', type: 'retail', tier: 0, location: 'Frankfurt, DE', lat: 50.1, lng: 8.7, capacity: 11000, status: 'healthy', riskScore: 14, icon: '🏪', color: '#00e676' },

  // ─── SHADOW NET RESOURCES (ghost/popup) ───
  { id: 'ghost-1', name: '[GHOST] Kolkata Backhaul', type: 'ghost', tier: 1, location: 'Kolkata, IN', lat: 22.5, lng: 88.3, capacity: 5000, status: 'dormant', riskScore: 0, icon: '👻', color: '#8b5cf6' },
  { id: 'micro-1', name: '[MICRO] Kanpur Dark Store', type: 'microwarehouse', tier: 0, location: 'Kanpur, IN', lat: 26.5, lng: 80.3, capacity: 2000, status: 'dormant', riskScore: 0, icon: '🏪', color: '#8b5cf6' },
  { id: 'micro-2', name: '[MICRO] Lucknow Hub', type: 'microwarehouse', tier: 0, location: 'Lucknow, IN', lat: 26.8, lng: 80.9, capacity: 1500, status: 'dormant', riskScore: 0, icon: '🏪', color: '#8b5cf6' },
  { id: 'alt-1', name: 'Busan Alt Supplier', type: 'alternative', tier: 2, location: 'Busan, KR', lat: 35.05, lng: 128.95, capacity: 8000, status: 'standby', riskScore: 15, icon: '🔄', color: '#3b82f6' },
];

export const EDGES = [
  // Raw → Manufacturer
  { id: 'e1',  source: 'rm-1',   target: 'mfg-4',  leadTime: 3,  slaScore: 92, trustScore: 88, mode: 'truck',  load: 0.65 },
  { id: 'e2',  source: 'rm-2',   target: 'mfg-1',  leadTime: 5,  slaScore: 87, trustScore: 91, mode: 'sea',    load: 0.78 },
  { id: 'e3',  source: 'rm-2',   target: 'mfg-2',  leadTime: 2,  slaScore: 94, trustScore: 93, mode: 'truck',  load: 0.55 },
  { id: 'e4',  source: 'rm-3',   target: 'mfg-5',  leadTime: 14, slaScore: 89, trustScore: 85, mode: 'sea',    load: 0.42 },
  { id: 'e5',  source: 'rm-1',   target: 'mfg-3',  leadTime: 2,  slaScore: 76, trustScore: 70, mode: 'truck',  load: 0.88 },

  // Manufacturer → Assembly
  { id: 'e6',  source: 'mfg-1',  target: 'asm-1',  leadTime: 7,  slaScore: 91, trustScore: 89, mode: 'sea',    load: 0.72 },
  { id: 'e7',  source: 'mfg-2',  target: 'asm-1',  leadTime: 3,  slaScore: 95, trustScore: 94, mode: 'sea',    load: 0.60 },
  { id: 'e8',  source: 'mfg-3',  target: 'asm-2',  leadTime: 4,  slaScore: 72, trustScore: 68, mode: 'truck',  load: 0.91 },
  { id: 'e9',  source: 'mfg-4',  target: 'asm-2',  leadTime: 2,  slaScore: 90, trustScore: 87, mode: 'truck',  load: 0.55 },
  { id: 'e10', source: 'mfg-5',  target: 'asm-3',  leadTime: 1,  slaScore: 97, trustScore: 96, mode: 'truck',  load: 0.48 },

  // Assembly → DC
  { id: 'e11', source: 'asm-1',  target: 'dc-4',   leadTime: 5,  slaScore: 93, trustScore: 91, mode: 'sea',    load: 0.70 },
  { id: 'e12', source: 'asm-1',  target: 'dc-2',   leadTime: 7,  slaScore: 88, trustScore: 85, mode: 'sea',    load: 0.63 },
  { id: 'e13', source: 'asm-2',  target: 'dc-1',   leadTime: 2,  slaScore: 85, trustScore: 82, mode: 'truck',  load: 0.82 },
  { id: 'e14', source: 'asm-2',  target: 'dc-2',   leadTime: 1,  slaScore: 92, trustScore: 90, mode: 'truck',  load: 0.75 },
  { id: 'e15', source: 'asm-3',  target: 'dc-5',   leadTime: 2,  slaScore: 96, trustScore: 95, mode: 'truck',  load: 0.50 },
  { id: 'e16', source: 'dc-4',   target: 'dc-1',   leadTime: 10, slaScore: 84, trustScore: 80, mode: 'sea',    load: 0.68 },

  // DC → Retail
  { id: 'e17', source: 'dc-1',   target: 'ret-1',  leadTime: 2,  slaScore: 88, trustScore: 85, mode: 'truck',  load: 0.79 },
  { id: 'e18', source: 'dc-2',   target: 'ret-2',  leadTime: 1,  slaScore: 93, trustScore: 91, mode: 'truck',  load: 0.66 },
  { id: 'e19', source: 'dc-3',   target: 'ret-1',  leadTime: 1,  slaScore: 90, trustScore: 88, mode: 'truck',  load: 0.73 },
  { id: 'e20', source: 'dc-5',   target: 'ret-4',  leadTime: 1,  slaScore: 97, trustScore: 96, mode: 'truck',  load: 0.52 },
  { id: 'e21', source: 'asm-1',  target: 'ret-3',  leadTime: 1,  slaScore: 95, trustScore: 93, mode: 'truck',  load: 0.58 },

  // Cross-links
  { id: 'e22', source: 'dc-1',   target: 'dc-3',   leadTime: 1,  slaScore: 87, trustScore: 84, mode: 'truck',  load: 0.88 },
  { id: 'e23', source: 'mfg-3',  target: 'dc-1',   leadTime: 3,  slaScore: 69, trustScore: 64, mode: 'truck',  load: 0.95 },

  // Shadow Net edges (dormant)
  { id: 'e24', source: 'ghost-1', target: 'dc-3',  leadTime: 18, slaScore: 70, trustScore: 65, mode: 'truck',  load: 0.40, type: 'shadow', dormant: true },
  { id: 'e25', source: 'dc-1',   target: 'micro-1', leadTime: 4, slaScore: 75, trustScore: 70, mode: 'truck',  load: 0.30, type: 'shadow', dormant: true },
  { id: 'e26', source: 'alt-1',  target: 'asm-2',  leadTime: 5, slaScore: 88, trustScore: 82, mode: 'sea',    load: 0.00, type: 'alt',    dormant: true },
];

// The disruption scenario: Dhaka → Delhi
export const DISRUPTION_SCENARIO = {
  id: 'dhaka-delhi-2026',
  name: 'Dhaka Border Blockage',
  origin: 'mfg-3',
  type: 'regulatory',
  severity: 'critical',
  description: 'Bangladesh–India border checkpoint detained 3 truck convoys. Regulatory inspection triggered by customs anomaly flag.',
  workerTelemetrySignal: 'Scan hesitation at Dhaka warehouse increased 340% over 6hrs — Edge TPU anomaly detected',
  propagationPath: ['mfg-3', 'asm-2', 'dc-1', 'dc-3', 'ret-1'],
  affectedEdges: ['e8', 'e13', 'e22', 'e23', 'e17', 'e19'],
  estimatedImpactHrs: 48,
  revenueAtRisk: 4200000,
  alternativeNodes: ['alt-1', 'ghost-1', 'micro-1', 'micro-2'],
};

// Node risk color helper
export function getRiskColor(riskScore) {
  if (riskScore < 30) return '#00e676';
  if (riskScore < 60) return '#ffab00';
  return '#ff1744';
}

export function getNodeStatusColor(status) {
  const map = { healthy: '#00e676', warning: '#ffab00', critical: '#ff1744', dormant: '#8b5cf6', standby: '#3b82f6' };
  return map[status] || '#9aa0a6';
}
