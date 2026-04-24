// ============================================
// NEXUSMESH — Shadow Net Resource Database
// Ghost capacity, micro-warehouses, gig pools
// ============================================

export const GHOST_TRUCKS = [
  {
    id: 'gt-1',
    name: 'Tata Logistics TL-7724',
    route: 'Kolkata → Delhi',
    routeFrom: 'Kolkata, IN',
    routeTo: 'Delhi, IN',
    capacity: 12,         // tonnes
    currentLoad: 4.8,     // tonnes (40% loaded — returning empty)
    availableCapacity: 7.2,
    eta: 18,              // hours from now
    costPerTonne: 2800,   // INR
    reliability: 94,      // %
    driver: 'Ramesh Kumar',
    vehicleType: 'Heavy Freight',
    status: 'dormant',
  },
  {
    id: 'gt-2',
    name: 'BlueDart Express BD-1190',
    route: 'Patna → Delhi',
    routeFrom: 'Patna, IN',
    routeTo: 'Delhi, IN',
    capacity: 8,
    currentLoad: 2.5,
    availableCapacity: 5.5,
    eta: 22,
    costPerTonne: 3100,
    reliability: 91,
    driver: 'Suresh Yadav',
    vehicleType: 'Medium Freight',
    status: 'dormant',
  },
  {
    id: 'gt-3',
    name: 'Gati Logistics GL-4432',
    route: 'Varanasi → Delhi',
    routeFrom: 'Varanasi, IN',
    routeTo: 'Delhi, IN',
    capacity: 15,
    currentLoad: 6,
    availableCapacity: 9,
    eta: 26,
    costPerTonne: 2600,
    reliability: 88,
    driver: 'Mohammad Irfan',
    vehicleType: 'Heavy Freight',
    status: 'dormant',
  },
];

export const MICRO_WAREHOUSES = [
  {
    id: 'mw-1',
    name: 'Kanpur Dark Store α',
    location: 'Kanpur, IN',
    type: 'dark-store',
    area: 8400,     // sq ft
    capacity: 2100, // units
    dailyRate: 45000, // INR/day
    availability: 'immediate',
    features: ['Climate controlled', 'CCTV', '24/7 access', 'Dock leveler'],
    operator: 'SpaceMart Pvt Ltd',
    status: 'dormant',
    rating: 4.6,
    distanceToDest: 74,  // km to Delhi
  },
  {
    id: 'mw-2',
    name: 'Lucknow Hub β',
    location: 'Lucknow, IN',
    type: 'flex-space',
    area: 12000,
    capacity: 3200,
    dailyRate: 62000,
    availability: 'immediate',
    features: ['Forklift', 'Racking system', 'Security'],
    operator: 'FlexStore India',
    status: 'dormant',
    rating: 4.3,
    distanceToDest: 555,
  },
  {
    id: 'mw-3',
    name: 'Agra Transit Point γ',
    location: 'Agra, IN',
    type: 'transit-hub',
    area: 5600,
    capacity: 1400,
    dailyRate: 31000,
    availability: '4hr',
    features: ['Loading bay', '24/7 access'],
    operator: 'Logistics Nest',
    status: 'dormant',
    rating: 4.0,
    distanceToDest: 210,
  },
];

export const GIG_WORKER_POOLS = [
  { region: 'Delhi NCR',    available: 124, capacity: 4200,  avgETA: '45 min',  rating: 4.7, platform: 'Porter' },
  { region: 'Noida',        available: 87,  capacity: 2900,  avgETA: '30 min',  rating: 4.5, platform: 'Dunzo' },
  { region: 'Gurgaon',      available: 96,  capacity: 3100,  avgETA: '40 min',  rating: 4.6, platform: 'Borzo' },
  { region: 'Faridabad',    available: 43,  capacity: 1400,  avgETA: '55 min',  rating: 4.2, platform: 'Porter' },
  { region: 'Ghaziabad',    available: 68,  capacity: 2200,  avgETA: '35 min',  rating: 4.4, platform: 'Dunzo' },
  { region: 'Agra',         available: 31,  capacity: 900,   avgETA: '60 min',  rating: 4.1, platform: 'Local' },
];

// Semantic substitution database
export const MATERIAL_SUBSTITUTES = [
  {
    original: 'Dhaka Cotton Blend T-200',
    originalSpec: 'Cotton 65%, Polyester 35%, Grade T-200',
    substitute: 'Gujarat Cotton Blend T-198',
    substituteSource: 'Surat Textile Hub, IN',
    compatibility: 97.4,
    complianceStatus: 'approved',
    certifications: ['ISO 9001', 'OEKO-TEX', 'BIS'],
    leadTime: 2,
    costDelta: '+3.2%',
    available: 48000, // units
    chemicalMatch: 99.1,
    tensileStrength: 98.7,
    engineeringApproval: 'auto',
  },
  {
    original: 'Dhaka Cotton Blend T-200',
    originalSpec: 'Cotton 65%, Polyester 35%, Grade T-200',
    substitute: 'Vietnam Blend VB-205',
    substituteSource: 'Ho Chi Minh Textile, VN',
    compatibility: 91.8,
    complianceStatus: 'approved',
    certifications: ['ISO 9001', 'GOTS'],
    leadTime: 6,
    costDelta: '+7.8%',
    available: 120000,
    chemicalMatch: 95.3,
    tensileStrength: 96.2,
    engineeringApproval: 'manual-review',
  },
];

// Shadow Net state machine states
export const SHADOW_NET_STATES = ['DORMANT', 'SCANNING', 'ACTIVATING', 'ACTIVE', 'DEACTIVATING'];

export class ShadowNetState {
  constructor() {
    this.state = 'DORMANT';
    this.listeners = {};
    this.activationTimeline = [];
    this.selectedResources = { trucks: [], warehouses: [], gigPools: [] };
  }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  transition(newState) {
    const prev = this.state;
    this.state = newState;
    this.activationTimeline.push({
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      from: prev,
      to: newState,
      timestamp: Date.now(),
    });
    this.emit('state-change', { from: prev, to: newState });
  }

  async activate() {
    if (this.state !== 'DORMANT') return;

    this.transition('SCANNING');
    this.emit('scanning', { message: 'Scanning ghost capacity network...' });
    await delay(1500);

    this.transition('ACTIVATING');
    this.selectedResources = {
      trucks: [GHOST_TRUCKS[0]],
      warehouses: [MICRO_WAREHOUSES[0], MICRO_WAREHOUSES[2]],
      gigPools: [GIG_WORKER_POOLS[0], GIG_WORKER_POOLS[1]],
    };
    this.emit('resources-selected', this.selectedResources);
    await delay(2000);

    this.transition('ACTIVE');
    this.emit('activated', {
      message: 'Shadow Net operational — ghost capacity secured',
      resources: this.selectedResources,
    });
  }

  async deactivate() {
    if (this.state !== 'ACTIVE') return;
    this.transition('DEACTIVATING');
    await delay(1500);
    this.transition('DORMANT');
    this.selectedResources = { trucks: [], warehouses: [], gigPools: [] };
    this.activationTimeline = [];
    this.emit('deactivated', {});
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const shadowNetState = new ShadowNetState();
