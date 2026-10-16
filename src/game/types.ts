/**
 * PROJECT: LAST SIGNAL - Game Engine Types
 */

export type GameState = 
  | 'TITLE'
  | 'PLAYING'
  | 'CIRCUIT_PUZZLE'
  | 'LOG_VIEW'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'TRANSMITTING'
  | 'VICTORY';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PowerNodeId = 'DELTA' | 'SIGMA' | 'OMEGA';

export interface PowerNodeInfo {
  id: PowerNodeId;
  name: string;
  symbol: string;
  roomName: string;
  frequency: string;
  sequenceOrder: number;
  isActivated: boolean;
  position: Vector2D;
}

export interface DataFragment {
  id: number;
  title: string;
  roomName: string;
  position: Vector2D;
  collected: boolean;
  logText: string;
  timestamp: string;
  author: string;
}

export interface DroneEntity {
  x: number;
  y: number;
  radius: number;
  angle: number;
  waypoints: Vector2D[];
  currentWaypointIdx: number;
  speed: number;
  alertSpeed: number;
  isAlert: boolean;
  alertTimer: number;
  isDisabled: boolean;
  disabledTimer: number;
  disabledMaxTimer: number;
  visionRange: number;
  visionConeAngle: number; // in radians
  knockbackTimer: number;
}

export interface PlayerEntity {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  energy: number;
  maxEnergy: number;
  isInteracting: boolean;
  interactTarget: Interactable | null;
  walkFrame: number;
  footstepTimer: number;
  invulnerableTimer: number;
}

export type InteractableType = 
  | 'POWER_NODE'
  | 'DATA_FRAGMENT'
  | 'RECHARGE_STATION'
  | 'EMP_CONSOLE'
  | 'COMM_CONSOLE'
  | 'TERMINAL_HINT'
  | 'BLAST_DOOR';

export interface Interactable {
  id: string;
  type: InteractableType;
  x: number;
  y: number;
  radius: number;
  label: string;
  actionText: string;
  nodeId?: PowerNodeId;
  fragmentId?: number;
  hintTitle?: string;
  hintContent?: string;
}

export interface WallTile {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'solid' | 'metal' | 'window' | 'door';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
  maxLife: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}
