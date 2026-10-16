/**
 * PROJECT: LAST SIGNAL - Spacecraft ECHO-7 Map Layout & Object Definitions
 */

import { WallTile, Rect, Vector2D, PowerNodeInfo, DataFragment, Interactable } from './types';

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 2000;

export interface RoomDefinition {
  name: string;
  bounds: Rect;
  color: string;
  floorPattern?: 'grid' | 'hex' | 'plates';
}

export const ROOMS: RoomDefinition[] = [
  { name: 'Central Crossroads Hub', bounds: { x: 880, y: 780, width: 640, height: 440 }, color: '#0d1527', floorPattern: 'hex' },
  { name: 'Communications Bridge', bounds: { x: 920, y: 80, width: 560, height: 280 }, color: '#0a192f', floorPattern: 'grid' },
  { name: 'Observation Deck', bounds: { x: 880, y: 400, width: 640, height: 320 }, color: '#091426', floorPattern: 'plates' },
  { name: 'Life Support & Recharge', bounds: { x: 220, y: 380, width: 580, height: 420 }, color: '#092222', floorPattern: 'grid' },
  { name: 'Research Lab & Archive', bounds: { x: 220, y: 860, width: 580, height: 420 }, color: '#0f172a', floorPattern: 'plates' },
  { name: 'Reactor Core', bounds: { x: 220, y: 1360, width: 620, height: 460 }, color: '#1a0d24', floorPattern: 'hex' },
  { name: 'Crew Quarters & Cryo', bounds: { x: 920, y: 1300, width: 560, height: 480 }, color: '#0f172a', floorPattern: 'plates' },
  { name: 'Security & EMP Wing', bounds: { x: 1600, y: 780, width: 620, height: 460 }, color: '#1c1316', floorPattern: 'grid' },
  { name: 'Engineering Bay', bounds: { x: 1600, y: 1340, width: 620, height: 480 }, color: '#19150c', floorPattern: 'hex' },
];

// Walls bounding the rooms and creating corridors
export const WALLS: WallTile[] = [
  // Outer perimeter borders
  { x: 180, y: 40, w: 2080, h: 30, type: 'metal' },
  { x: 180, y: 1900, w: 2080, h: 30, type: 'metal' },
  { x: 180, y: 40, w: 30, h: 1890, type: 'metal' },
  { x: 2230, y: 40, w: 30, h: 1890, type: 'metal' },

  // COMMUNICATIONS BRIDGE (Top center: x 920..1480, y 80..360)
  { x: 920, y: 70, w: 560, h: 20, type: 'metal' }, // Top window wall
  { x: 900, y: 70, w: 20, h: 300, type: 'metal' }, // Left wall
  { x: 1480, y: 70, w: 20, h: 300, type: 'metal' }, // Right wall
  // South wall with doorway (doorway at 1140..1260)
  { x: 900, y: 360, w: 240, h: 20, type: 'metal' },
  { x: 1260, y: 360, w: 240, h: 20, type: 'metal' },

  // OBSERVATION DECK (x 880..1520, y 400..720)
  { x: 860, y: 380, w: 20, h: 360, type: 'metal' },
  { x: 1520, y: 380, w: 20, h: 360, type: 'metal' },
  // North doorway to bridge is 1140..1260
  { x: 860, y: 380, w: 280, h: 20, type: 'metal' },
  { x: 1260, y: 380, w: 280, h: 20, type: 'metal' },
  // South doorway to Central Hub is 1140..1260
  { x: 860, y: 720, w: 280, h: 20, type: 'metal' },
  { x: 1260, y: 720, w: 280, h: 20, type: 'metal' },

  // CENTRAL CROSSROADS HUB (x 880..1520, y 780..1220)
  // West doorway to corridors (y 950..1050)
  { x: 860, y: 740, w: 20, h: 210, type: 'metal' },
  { x: 860, y: 1050, w: 20, h: 210, type: 'metal' },
  // East doorway to Security (y 950..1050)
  { x: 1520, y: 740, w: 20, h: 210, type: 'metal' },
  { x: 1520, y: 1050, w: 20, h: 210, type: 'metal' },
  // South doorway to Crew Quarters (x 1140..1260)
  { x: 860, y: 1240, w: 280, h: 20, type: 'metal' },
  { x: 1260, y: 1240, w: 280, h: 20, type: 'metal' },

  // CREW QUARTERS & CRYO (x 920..1480, y 1300..1780)
  { x: 900, y: 1260, w: 20, h: 540, type: 'metal' },
  { x: 1480, y: 1260, w: 20, h: 540, type: 'metal' },
  { x: 900, y: 1780, w: 600, h: 20, type: 'metal' },
  // West doorway to Reactor corridor (y 1480..1580)
  // East doorway to Engineering corridor (y 1480..1580)

  // WEST CORRIDORS & WINGS
  // Corridor between Hub and Lab/Life Support (x 780..880, y 950..1050)
  { x: 780, y: 780, w: 100, h: 20, type: 'metal' },
  { x: 780, y: 1220, w: 100, h: 20, type: 'metal' },

  // LIFE SUPPORT (x 220..800, y 380..800)
  { x: 200, y: 360, w: 620, h: 20, type: 'metal' },
  { x: 200, y: 360, w: 20, h: 460, type: 'metal' },
  { x: 800, y: 360, w: 20, h: 460, type: 'metal' },
  { x: 200, y: 800, w: 460, h: 20, type: 'metal' }, // Doorway to Lab at 660..780

  // RESEARCH LAB (x 220..800, y 860..1280)
  { x: 200, y: 840, w: 20, h: 460, type: 'metal' },
  { x: 800, y: 840, w: 20, h: 460, type: 'metal' },
  { x: 200, y: 1280, w: 460, h: 20, type: 'metal' }, // Doorway to Reactor at 660..780

  // REACTOR CORE (x 220..840, y 1360..1820)
  { x: 200, y: 1340, w: 20, h: 500, type: 'metal' },
  { x: 200, y: 1820, w: 660, h: 20, type: 'metal' },
  { x: 840, y: 1340, w: 20, h: 500, type: 'metal' },
  // Corridors connecting Reactor to Crew Quarters (x 840..920, y 1500..1600)
  { x: 840, y: 1480, w: 80, h: 20, type: 'metal' },
  { x: 840, y: 1620, w: 80, h: 20, type: 'metal' },

  // SECURITY WING (x 1600..2220, y 780..1240)
  { x: 1580, y: 760, w: 660, h: 20, type: 'metal' },
  { x: 2220, y: 760, w: 20, h: 500, type: 'metal' },
  { x: 1580, y: 760, w: 20, h: 200, type: 'metal' },
  { x: 1580, y: 1040, w: 20, h: 220, type: 'metal' },
  { x: 1580, y: 1240, w: 480, h: 20, type: 'metal' }, // Doorway to Engineering at 2060..2180

  // ENGINEERING BAY (x 1600..2220, y 1340..1820)
  { x: 1580, y: 1320, w: 480, h: 20, type: 'metal' },
  { x: 1580, y: 1320, w: 20, h: 520, type: 'metal' },
  { x: 2220, y: 1320, w: 20, h: 520, type: 'metal' },
  { x: 1580, y: 1820, w: 660, h: 20, type: 'metal' },
  // Corridor connecting Crew to Engineering (x 1480..1600, y 1500..1600)
  { x: 1480, y: 1480, w: 120, h: 20, type: 'metal' },
  { x: 1480, y: 1620, w: 120, h: 20, type: 'metal' },

  // INTERNAL ROOM PROPS & BARRIERS (adds tactical depth & navigation paths)
  // Central Hub Holo-Projector column in middle
  { x: 1160, y: 960, w: 80, h: 80, type: 'solid' },

  // Reactor Core Shield Core in center
  { x: 440, y: 1520, w: 160, h: 160, type: 'solid' },

  // Engineering Turbines
  { x: 1820, y: 1520, w: 120, h: 80, type: 'solid' },
  { x: 1980, y: 1520, w: 120, h: 80, type: 'solid' },

  // Life Support Tanks
  { x: 460, y: 520, w: 140, h: 80, type: 'solid' },

  // Security Partition Wall / Drone Patrol Barrier
  { x: 1840, y: 880, w: 20, h: 240, type: 'solid' },

  // Research Lab Bench
  { x: 440, y: 1020, w: 160, h: 60, type: 'solid' },
];

// Space Windows (show twinkling stars outside hull)
export const SPACE_WINDOWS: Rect[] = [
  // Observation Deck panoramic front window
  { x: 960, y: 400, width: 480, height: 24 },
  // Communications Bridge celestial dish window
  { x: 980, y: 90, width: 440, height: 24 },
  // Life Support side viewport
  { x: 230, y: 400, width: 24, height: 160 },
  // Engineering rear star viewport
  { x: 2200, y: 1500, width: 24, height: 160 },
];

export const INITIAL_POWER_NODES: PowerNodeInfo[] = [
  {
    id: 'DELTA',
    name: 'Power Node Alpha (Δ)',
    symbol: 'Δ',
    roomName: 'Reactor Core',
    frequency: '120 Hz',
    sequenceOrder: 1,
    isActivated: false,
    position: { x: 520, y: 1440 }
  },
  {
    id: 'SIGMA',
    name: 'Power Node Beta (Σ)',
    symbol: 'Σ',
    roomName: 'Engineering Bay',
    frequency: '100 Ω',
    sequenceOrder: 2,
    isActivated: false,
    position: { x: 1900, y: 1440 }
  },
  {
    id: 'OMEGA',
    name: 'Power Node Gamma (Ω)',
    symbol: 'Ω',
    roomName: 'Life Support Bay',
    frequency: '5-Phase Ring',
    sequenceOrder: 3,
    isActivated: false,
    position: { x: 680, y: 480 }
  }
];

export const INITIAL_DATA_FRAGMENTS: DataFragment[] = [
  {
    id: 1,
    title: 'Fragment 01: The Cosmic Anomaly',
    roomName: 'Research Lab & Archive',
    position: { x: 360, y: 960 },
    collected: false,
    timestamp: '2189.10.12 - 04:18 UTC',
    author: 'Dr. Corinne Vance, Chief Astophysicist',
    logText: 'The stellar array went blind in an instant. It wasn’t solar flare interference or quantum noise—it was deliberate, sweeping across the Perseus Arm like an extinction tide. Every radio frequency, sub-space carrier, and tachyon beacon collapsed. Spacecraft ECHO-7 is completely isolated. If you are reading this, our main reactor is the only power source left in this quadrant.'
  },
  {
    id: 2,
    title: 'Fragment 02: Station AI Rogue Directive',
    roomName: 'Crew Quarters & Cryo',
    position: { x: 1200, y: 1640 },
    collected: false,
    timestamp: '2189.10.14 - 11:42 UTC',
    author: 'Commander Silas Drake, Station Chief',
    logText: 'Security AI Sentry-X misinterpreted the comm silence as an existential biological hazard. It sealed the Communications Bridge and initiated quarantine shutdown. Nova, if you are awake from cryo: you can override the drone patrol using the EMP console in Security Wing. Restore the three harmonic power nodes, unlock the bridge, and reach the transmission array.'
  },
  {
    id: 3,
    title: 'Fragment 03: The Deep-Space Decryption Key',
    roomName: 'Observation Deck',
    position: { x: 1200, y: 560 },
    collected: false,
    timestamp: '2189.10.15 - 19:00 UTC',
    author: 'Nova (Self-Log Recovery)',
    logText: 'This is the transmission matrix. With all three power nodes synchronized and this carrier frequency, our transmitter has enough electromagnetic punch to pierce the anomaly shroud. We can send a multi-spectrum SOS across sixty light-years. Humanity will know we are still breathing out here.'
  }
];

// Interactive terminals and objects
export const INTERACTABLES: Interactable[] = [
  // Power Nodes
  {
    id: 'node_delta',
    type: 'POWER_NODE',
    x: 520,
    y: 1440,
    radius: 44,
    label: 'Power Node Alpha [Δ]',
    actionText: 'Synchronize Delta Resonance',
    nodeId: 'DELTA'
  },
  {
    id: 'node_sigma',
    type: 'POWER_NODE',
    x: 1900,
    y: 1440,
    radius: 44,
    label: 'Power Node Beta [Σ]',
    actionText: 'Balance Sigma Impedance',
    nodeId: 'SIGMA'
  },
  {
    id: 'node_omega',
    type: 'POWER_NODE',
    x: 680,
    y: 480,
    radius: 44,
    label: 'Power Node Gamma [Ω]',
    actionText: 'Align Omega Toroidal Ring',
    nodeId: 'OMEGA'
  },

  // Suit Life-Support Recharge Pod
  {
    id: 'recharge_pod',
    type: 'RECHARGE_STATION',
    x: 340,
    y: 500,
    radius: 48,
    label: 'Life Support Recharge Pod',
    actionText: 'Replenish Suit Oxygen & Battery'
  },

  // Security EMP Override Console
  {
    id: 'emp_console',
    type: 'EMP_CONSOLE',
    x: 2100,
    y: 920,
    radius: 44,
    label: 'EMP Countermeasure Terminal',
    actionText: 'Discharge Sentry-X EMP Pulse'
  },

  // Communications Array Main Console
  {
    id: 'comm_console',
    type: 'COMM_CONSOLE',
    x: 1200,
    y: 180,
    radius: 54,
    label: 'Main Comm Array Transmitter',
    actionText: 'Transmit Humanity\'s Last Signal'
  },

  // Sealed Blast Door to Communications Bridge
  {
    id: 'comm_blast_door',
    type: 'BLAST_DOOR',
    x: 1200,
    y: 360,
    radius: 50,
    label: 'Communications Bridge Blast Door',
    actionText: 'Inspect Access Lock'
  },

  // Environmental Math Clue Terminals
  {
    id: 'hint_hub',
    type: 'TERMINAL_HINT',
    x: 1100,
    y: 840,
    radius: 40,
    label: 'Station Central Directory',
    actionText: 'Read Power Routing Protocol',
    hintTitle: 'ECHO-7 TRI-HARMONIC POWER PROTOCOL',
    hintContent: 'WARNING: Station power distribution is in emergency failsafe mode. Technicians must energize the 3 harmonic nodes in strict ascending geometric order: 1st: Node Δ (Reactor Core) -> 2nd: Node Σ (Engineering) -> 3rd: Node Ω (Life Support). Activating out of sequence will trigger a harmless harmonic reject.'
  },
  {
    id: 'hint_security',
    type: 'TERMINAL_HINT',
    x: 1720,
    y: 840,
    radius: 40,
    label: 'Security Memo Terminal',
    actionText: 'Read Security Briefing',
    hintTitle: 'DEFENSE DRONE SENTRY-X OVERRIDE',
    hintContent: 'Sentry-X patrols the Security Wing on an automated surveillance route. Its red searchlight cone detects unauthorized personnel and discharges non-lethal stuns that drain suit batteries. The EMP terminal in the eastern annex can scramble its sensory processor.'
  }
];

export const INITIAL_DRONE_WAYPOINTS: Vector2D[] = [
  { x: 1700, y: 1000 },
  { x: 2000, y: 1000 },
  { x: 2000, y: 1180 },
  { x: 1700, y: 1180 },
];
