/**
 * PROJECT: LAST SIGNAL - 2D HTML5 Canvas Simulation & Rendering Engine
 */

import {
  GameState,
  PlayerEntity,
  DroneEntity,
  PowerNodeInfo,
  DataFragment,
  Interactable,
  Particle,
  Star,
  Vector2D
} from './types';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  ROOMS,
  WALLS,
  SPACE_WINDOWS,
  INITIAL_POWER_NODES,
  INITIAL_DATA_FRAGMENTS,
  INTERACTABLES,
  INITIAL_DRONE_WAYPOINTS
} from './mapData';
import { sound } from './audio';

export interface GameEngineCallbacks {
  onStateChange: (newState: GameState) => void;
  onOpenCircuitPuzzle: (nodeId: 'DELTA' | 'SIGMA' | 'OMEGA') => void;
  onOpenDataLog: (fragment: DataFragment) => void;
  onOpenHintModal: (title: string, content: string) => void;
  onHudUpdate: (stats: {
    energy: number;
    fragmentsCollected: number;
    totalFragments: number;
    nodesActivated: number;
    totalNodes: number;
    currentObjective: string;
    nearbyInteractable: Interactable | null;
    droneDisabledTimer: number;
    gameTime: number;
  }) => void;
  onTransmissionComplete: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  public state: GameState = 'TITLE';
  public isPaused: boolean = false;

  // Simulation time
  private lastTime: number = 0;
  private gameTime: number = 0;
  private animFrameId: number | null = null;

  // Entities
  public player: PlayerEntity = {
    x: 1200,
    y: 1000, // Starts in Central Crossroads Hub
    radius: 16,
    vx: 0,
    vy: 0,
    speed: 210, // px per second
    angle: -Math.PI / 2, // Facing North initially
    energy: 100,
    maxEnergy: 100,
    isInteracting: false,
    interactTarget: null,
    walkFrame: 0,
    footstepTimer: 0,
    invulnerableTimer: 0
  };

  public drone: DroneEntity = {
    x: 1700,
    y: 1000,
    radius: 20,
    angle: 0,
    waypoints: INITIAL_DRONE_WAYPOINTS,
    currentWaypointIdx: 0,
    speed: 75,
    alertSpeed: 155,
    isAlert: false,
    alertTimer: 0,
    isDisabled: false,
    disabledTimer: 0,
    disabledMaxTimer: 45, // 45 seconds EMP disable
    visionRange: 220,
    visionConeAngle: Math.PI / 3, // 60 degrees
    knockbackTimer: 0
  };

  public powerNodes: PowerNodeInfo[] = JSON.parse(JSON.stringify(INITIAL_POWER_NODES));
  public dataFragments: DataFragment[] = JSON.parse(JSON.stringify(INITIAL_DATA_FRAGMENTS));
  public interactables: Interactable[] = JSON.parse(JSON.stringify(INTERACTABLES));

  // Particle systems
  private particles: Particle[] = [];
  private stars: Star[] = [];

  // Camera viewport
  public camera = { x: 1200, y: 1000, zoom: 1 };

  // Inputs
  private keys: Record<string, boolean> = {};
  public virtualMove: Vector2D = { x: 0, y: 0 };
  public virtualAction: boolean = false;

  // Flashlight beam angle
  private flashlightSway: number = 0;

  // Transmission cutscene timer
  public transmissionTimer: number = 0;
  private transmissionMax: number = 6.0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.initStars();
    this.setupEventListeners();
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 280; i++) {
      this.stars.push({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        size: Math.random() < 0.8 ? 1 + Math.random() * 1.5 : 2.5 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 4,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Handle pause on Escape
      if (e.key === 'Escape') {
        if (this.state === 'PLAYING') {
          this.setPaused(true);
        } else if (this.state === 'PAUSED') {
          this.setPaused(false);
        }
      }

      // Handle interaction on E or Space
      if ((e.key.toLowerCase() === 'e' || e.key === ' ') && this.state === 'PLAYING') {
        this.triggerInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.virtualMove = { x: 0, y: 0 };
    });
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.callbacks.onStateChange(paused ? 'PAUSED' : 'PLAYING');
  }

  public startNewGame() {
    this.powerNodes = JSON.parse(JSON.stringify(INITIAL_POWER_NODES));
    this.dataFragments = JSON.parse(JSON.stringify(INITIAL_DATA_FRAGMENTS));
    this.interactables = JSON.parse(JSON.stringify(INTERACTABLES));
    this.particles = [];

    this.player = {
      x: 1200,
      y: 1000,
      radius: 16,
      vx: 0,
      vy: 0,
      speed: 210,
      angle: -Math.PI / 2,
      energy: 100,
      maxEnergy: 100,
      isInteracting: false,
      interactTarget: null,
      walkFrame: 0,
      footstepTimer: 0,
      invulnerableTimer: 0
    };

    this.drone = {
      x: 1700,
      y: 1000,
      radius: 20,
      angle: 0,
      waypoints: INITIAL_DRONE_WAYPOINTS,
      currentWaypointIdx: 0,
      speed: 75,
      alertSpeed: 155,
      isAlert: false,
      alertTimer: 0,
      isDisabled: false,
      disabledTimer: 0,
      disabledMaxTimer: 45,
      visionRange: 220,
      visionConeAngle: Math.PI / 3,
      knockbackTimer: 0
    };

    this.gameTime = 0;
    this.transmissionTimer = 0;
    this.state = 'PLAYING';
    this.isPaused = false;
    sound.startAmbient();
    this.callbacks.onStateChange('PLAYING');
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public startLoop() {
    this.lastTime = performance.now();
    const frame = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.05); // clamp dt
      this.lastTime = time;

      if (this.state === 'PLAYING' && !this.isPaused) {
        this.update(dt);
      } else if (this.state === 'TRANSMITTING') {
        this.updateTransmission(dt);
      }

      this.render();
      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  public stopLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopAmbient();
  }

  public triggerInteraction() {
    if (this.state !== 'PLAYING' || this.isPaused) return;
    const target = this.getClosestInteractable();
    if (!target) return;

    sound.playBlip();

    switch (target.type) {
      case 'POWER_NODE':
        if (target.nodeId) {
          this.handlePowerNodeInteract(target.nodeId);
        }
        break;

      case 'DATA_FRAGMENT':
        if (target.fragmentId) {
          const fragment = this.dataFragments.find(f => f.id === target.fragmentId);
          if (fragment && !fragment.collected) {
            fragment.collected = true;
            sound.playDataFragment();
            this.spawnBurstParticles(fragment.position.x, fragment.position.y, '#38bdf8', 25);
            this.callbacks.onOpenDataLog(fragment);
          }
        }
        break;

      case 'RECHARGE_STATION':
        // Replenish energy
        this.rechargeSuit();
        break;

      case 'EMP_CONSOLE':
        this.triggerEmpPulse();
        break;

      case 'COMM_CONSOLE':
        this.tryTriggerTransmission();
        break;

      case 'TERMINAL_HINT':
        if (target.hintTitle && target.hintContent) {
          this.callbacks.onOpenHintModal(target.hintTitle, target.hintContent);
        }
        break;

      case 'BLAST_DOOR':
        this.checkBlastDoor();
        break;
    }
  }

  private handlePowerNodeInteract(nodeId: 'DELTA' | 'SIGMA' | 'OMEGA') {
    const node = this.powerNodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.isActivated) {
      this.callbacks.onOpenHintModal(
        `${node.name} [STABILIZED]`,
        `This harmonic power node is online and synchronized at ${node.frequency}. Energy is flowing through the primary conduit grid.`
      );
      return;
    }

    // Sequence check:
    // Delta (1) must be activated first.
    // Sigma (2) requires Delta.
    // Omega (3) requires Sigma.
    if (nodeId === 'SIGMA') {
      const deltaNode = this.powerNodes.find(n => n.id === 'DELTA');
      if (!deltaNode?.isActivated) {
        sound.playCircuitError();
        this.callbacks.onOpenHintModal(
          'SEQUENCE INHIBITED: Base Harmonic Missing',
          'HARMONIC SEQUENCE ERROR: Node Beta (Σ) cannot ignite without upstream base carrier flux. Please energize Power Node Alpha (Δ) in the Reactor Core first.'
        );
        return;
      }
    } else if (nodeId === 'OMEGA') {
      const sigmaNode = this.powerNodes.find(n => n.id === 'SIGMA');
      if (!sigmaNode?.isActivated) {
        sound.playCircuitError();
        this.callbacks.onOpenHintModal(
          'SEQUENCE INHIBITED: Intermediate Flux Missing',
          'HARMONIC SEQUENCE ERROR: Node Gamma (Ω) requires balanced quad-bridge impedance. Please energize Power Node Beta (Σ) in the Engineering Bay first.'
        );
        return;
      }
    }

    // Open circuit routing puzzle
    this.callbacks.onOpenCircuitPuzzle(nodeId);
  }

  public completePowerNode(nodeId: 'DELTA' | 'SIGMA' | 'OMEGA') {
    const node = this.powerNodes.find(n => n.id === nodeId);
    if (node) {
      node.isActivated = true;
      sound.playPowerRestored();
      this.spawnBurstParticles(node.position.x, node.position.y, '#22d3ee', 35);
    }
  }

  private rechargeSuit() {
    if (this.player.energy >= 100) {
      sound.playBlip();
      return;
    }
    this.player.energy = Math.min(100, this.player.energy + 35);
    sound.playRechargeHum();
    this.spawnBurstParticles(340, 500, '#10b981', 20);
  }

  private triggerEmpPulse() {
    sound.playEmpBurst();
    this.drone.isDisabled = true;
    this.drone.disabledTimer = this.drone.disabledMaxTimer;
    this.drone.isAlert = false;
    this.spawnBurstParticles(this.drone.x, this.drone.y, '#3b82f6', 40);
    this.spawnBurstParticles(2100, 920, '#60a5fa', 25);

    this.callbacks.onOpenHintModal(
      'EMP COUNTERMEASURE DISCHARGED',
      `High-voltage electromagnetic dampening pulse triggered! Drone Sentry-X sensory processor scrambler activated for ${this.drone.disabledMaxTimer} seconds. Secure the sector while perimeter defenses remain offline.`
    );
  }

  private checkBlastDoor() {
    const allNodesActive = this.powerNodes.every(n => n.isActivated);
    const allFragmentsCollected = this.dataFragments.every(f => f.collected);

    if (allNodesActive && allFragmentsCollected) {
      this.callbacks.onOpenHintModal(
        'COMMUNICATIONS BRIDGE UNLOCKED',
        'All three harmonic nodes are online and all three data fragments decrypted. Security blast door is now open. Proceed North to the Main Comm Array.'
      );
    } else {
      const activeCount = this.powerNodes.filter(n => n.isActivated).length;
      const fragCount = this.dataFragments.filter(f => f.collected).length;
      sound.playCircuitError();
      this.callbacks.onOpenHintModal(
        'SECURITY BLAST DOOR - LOCKED',
        `EMERGENCY SHIELD ACTIVE. Access requires:\n• 3 Power Nodes Online (${activeCount}/3)\n• 3 Decrypted Data Fragments (${fragCount}/3)\n\nRestore all systems to disengage bridge lockdown.`
      );
    }
  }

  private tryTriggerTransmission() {
    const allNodesActive = this.powerNodes.every(n => n.isActivated);
    const allFragmentsCollected = this.dataFragments.every(f => f.collected);

    if (!allNodesActive || !allFragmentsCollected) {
      this.checkBlastDoor();
      return;
    }

    // Begin transmission climax!
    this.state = 'TRANSMITTING';
    this.transmissionTimer = 0;
    sound.playTransmissionClimax();
    this.callbacks.onStateChange('TRANSMITTING');
  }

  private updateTransmission(dt: number) {
    this.transmissionTimer += dt;

    // Emit massive beam particles from console towards space window
    if (Math.random() < 0.6) {
      this.particles.push({
        x: 1200 + (Math.random() - 0.5) * 60,
        y: 180,
        vx: (Math.random() - 0.5) * 80,
        vy: -150 - Math.random() * 200,
        size: 3 + Math.random() * 5,
        color: Math.random() < 0.5 ? '#38bdf8' : '#a855f7',
        alpha: 1,
        decay: 0.8,
        life: 0,
        maxLife: 1.2
      });
    }

    this.updateParticles(dt);

    if (this.transmissionTimer >= this.transmissionMax) {
      this.state = 'VICTORY';
      this.callbacks.onStateChange('VICTORY');
      this.callbacks.onTransmissionComplete();
    }
  }

  private update(dt: number) {
    this.gameTime += dt;

    // 1. Player input & movement
    this.updatePlayerMovement(dt);

    // 2. Suit Life-Support Battery consumption (~1% every 2.4s)
    this.updateLifeSupport(dt);

    // 3. Drone Patrol & AI
    this.updateDroneAI(dt);

    // 4. Proximity Checks (Data fragments auto-collect on contact or near interaction)
    this.updateCollectibles();

    // 5. Update Particles
    this.updateParticles(dt);

    // 6. Camera follows player smoothly
    const targetCamX = this.player.x;
    const targetCamY = this.player.y;
    this.camera.x += (targetCamX - this.camera.x) * (dt * 6);
    this.camera.y += (targetCamY - this.camera.y) * (dt * 6);

    // 7. Inform HUD
    const closest = this.getClosestInteractable();
    const activeNodes = this.powerNodes.filter(n => n.isActivated).length;
    const collectedFrags = this.dataFragments.filter(f => f.collected).length;

    let objective = 'Restore 3 Power Nodes across station';
    if (activeNodes < 3) {
      const nextNode = this.powerNodes.find(n => !n.isActivated);
      objective = `Energize ${nextNode?.name || 'Power Nodes'} (${activeNodes}/3)`;
    } else if (collectedFrags < 3) {
      objective = `Recover Data Fragments (${collectedFrags}/3)`;
    } else {
      objective = 'Bridge unlocked: Transmit Signal at Comm Array';
    }

    this.callbacks.onHudUpdate({
      energy: Math.round(this.player.energy),
      fragmentsCollected: collectedFrags,
      totalFragments: this.dataFragments.length,
      nodesActivated: activeNodes,
      totalNodes: this.powerNodes.length,
      currentObjective: objective,
      nearbyInteractable: closest,
      droneDisabledTimer: Math.ceil(this.drone.disabledTimer),
      gameTime: this.gameTime
    });
  }

  private updatePlayerMovement(dt: number) {
    let dx = 0;
    let dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    // Merge virtual joystick if used
    if (this.virtualMove.x !== 0 || this.virtualMove.y !== 0) {
      dx = this.virtualMove.x;
      dy = this.virtualMove.y;
    }

    // Normalize diagonal speed
    const len = Math.hypot(dx, dy);
    if (len > 0.05) {
      const normalizedSpeed = this.player.speed * (len > 1 ? 1 : len);
      this.player.vx = (dx / (len > 1 ? len : 1)) * normalizedSpeed;
      this.player.vy = (dy / (len > 1 ? len : 1)) * normalizedSpeed;

      // Update orientation
      this.player.angle = Math.atan2(this.player.vy, this.player.vx);

      // Footstep sounds & dust
      this.player.walkFrame += dt * 10;
      this.player.footstepTimer += dt;
      if (this.player.footstepTimer > 0.32) {
        sound.playFootstep();
        this.player.footstepTimer = 0;
        this.spawnFootstepParticle(this.player.x, this.player.y);
      }
    } else {
      this.player.vx = 0;
      this.player.vy = 0;
    }

    // Move X with collision
    const nextX = this.player.x + this.player.vx * dt;
    if (!this.checkWallCollision(nextX, this.player.y, this.player.radius)) {
      this.player.x = nextX;
    }

    // Move Y with collision
    const nextY = this.player.y + this.player.vy * dt;
    if (!this.checkWallCollision(this.player.x, nextY, this.player.radius)) {
      this.player.y = nextY;
    }

    // Invulnerability decay
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }
  }

  private updateLifeSupport(dt: number) {
    // Normal consumption rate: 1% per 2.6 seconds (approx 4.3 minutes total)
    this.player.energy -= (dt / 2.6);

    if (this.player.energy <= 0) {
      this.player.energy = 0;
      this.state = 'GAME_OVER';
      sound.playDroneShock();
      this.callbacks.onStateChange('GAME_OVER');
      return;
    }

    // Warning tone at low energy
    if (this.player.energy < 22 && Math.floor(this.gameTime) % 3 === 0 && Math.random() < 0.02) {
      sound.playLowEnergyWarning();
    }
  }

  private updateDroneAI(dt: number) {
    // Check if EMP disabled
    if (this.drone.isDisabled) {
      this.drone.disabledTimer -= dt;
      if (this.drone.disabledTimer <= 0) {
        this.drone.isDisabled = false;
        this.drone.disabledTimer = 0;
      }
      // Spark particles while disabled
      if (Math.random() < 0.25) {
        this.particles.push({
          x: this.drone.x + (Math.random() - 0.5) * 30,
          y: this.drone.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          size: 2,
          color: '#60a5fa',
          alpha: 1,
          decay: 2,
          life: 0,
          maxLife: 0.5
        });
      }
      return;
    }

    // Check if player is detected by drone's vision cone
    const distToPlayer = Math.hypot(this.player.x - this.drone.x, this.player.y - this.drone.y);
    const angleToPlayer = Math.atan2(this.player.y - this.drone.y, this.player.x - this.drone.x);
    let diffAngle = angleToPlayer - this.drone.angle;
    // Normalize angle to [-PI, PI]
    while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

    const inCone = distToPlayer < this.drone.visionRange && Math.abs(diffAngle) < this.drone.visionConeAngle / 2;

    if (inCone) {
      if (!this.drone.isAlert) {
        sound.playDroneAlert();
      }
      this.drone.isAlert = true;
      this.drone.alertTimer = 3.5; // Stays alert for 3.5s after losing sight
    } else if (this.drone.isAlert) {
      this.drone.alertTimer -= dt;
      if (this.drone.alertTimer <= 0) {
        this.drone.isAlert = false;
      }
    }

    // Movement: Chase player if alert, otherwise follow waypoints
    let targetX: number;
    let targetY: number;
    let targetSpeed = this.drone.speed;

    if (this.drone.isAlert) {
      targetX = this.player.x;
      targetY = this.player.y;
      targetSpeed = this.drone.alertSpeed;
    } else {
      const wp = this.drone.waypoints[this.drone.currentWaypointIdx];
      targetX = wp.x;
      targetY = wp.y;
      const wpDist = Math.hypot(wp.x - this.drone.x, wp.y - this.drone.y);
      if (wpDist < 15) {
        this.drone.currentWaypointIdx = (this.drone.currentWaypointIdx + 1) % this.drone.waypoints.length;
      }
    }

    const moveAngle = Math.atan2(targetY - this.drone.y, targetX - this.drone.x);
    this.drone.angle = moveAngle;

    const stepX = Math.cos(moveAngle) * targetSpeed * dt;
    const stepY = Math.sin(moveAngle) * targetSpeed * dt;

    if (!this.checkWallCollision(this.drone.x + stepX, this.drone.y, this.drone.radius)) {
      this.drone.x += stepX;
    }
    if (!this.checkWallCollision(this.drone.x, this.drone.y + stepY, this.drone.radius)) {
      this.drone.y += stepY;
    }

    // Drone collision with player: electric shock!
    if (distToPlayer < this.drone.radius + this.player.radius && this.player.invulnerableTimer <= 0) {
      sound.playDroneShock();
      this.player.energy = Math.max(0, this.player.energy - 20);
      this.player.invulnerableTimer = 2.0; // 2 seconds grace period

      // Knockback player away from drone
      const knockAngle = Math.atan2(this.player.y - this.drone.y, this.player.x - this.drone.x);
      this.player.x += Math.cos(knockAngle) * 45;
      this.player.y += Math.sin(knockAngle) * 45;

      this.spawnBurstParticles(this.player.x, this.player.y, '#ef4444', 30);
    }
  }

  private updateCollectibles() {
    this.dataFragments.forEach(frag => {
      if (!frag.collected) {
        const dist = Math.hypot(this.player.x - frag.position.x, this.player.y - frag.position.y);
        if (dist < this.player.radius + 20) {
          frag.collected = true;
          sound.playDataFragment();
          this.spawnBurstParticles(frag.position.x, frag.position.y, '#38bdf8', 30);
          this.callbacks.onOpenDataLog(frag);
        }
      }
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnBurstParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4
      });
    }
  }

  private spawnFootstepParticle(x: number, y: number) {
    this.particles.push({
      x,
      y: y + 10,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      size: 1.5,
      color: '#475569',
      alpha: 0.5,
      decay: 2,
      life: 0,
      maxLife: 0.35
    });
  }

  public checkWallCollision(x: number, y: number, radius: number): boolean {
    // 1. Boundary
    if (x - radius < 190 || x + radius > 2220 || y - radius < 50 || y + radius > 1920) {
      return true;
    }

    // 2. Blast door collision (if locked)
    const allActive = this.powerNodes.every(n => n.isActivated) && this.dataFragments.every(f => f.collected);
    if (!allActive) {
      // Blast door at (1140..1260, y: 350..370)
      if (x + radius > 1130 && x - radius < 1270 && y + radius > 350 && y - radius < 380) {
        return true;
      }
    }

    // 3. Walls
    for (const wall of WALLS) {
      const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
      const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
      const distSq = (x - closestX) ** 2 + (y - closestY) ** 2;
      if (distSq < radius * radius) {
        return true;
      }
    }

    return false;
  }

  public getClosestInteractable(): Interactable | null {
    let closest: Interactable | null = null;
    let minDist = 55; // interaction radius

    for (const item of this.interactables) {
      const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
      if (dist < minDist) {
        minDist = dist;
        closest = item;
      }
    }
    return closest;
  }

  // ==========================================
  // RENDERING
  // ==========================================
  public render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Apply Camera Transform
    const camOffsetX = width / 2 - this.camera.x;
    const camOffsetY = height / 2 - this.camera.y;
    ctx.translate(camOffsetX, camOffsetY);

    // 1. Draw Starfields & Space Windows
    this.renderSpaceBackdrop(ctx);

    // 2. Draw Station Rooms & Floors
    this.renderRooms(ctx);

    // 3. Draw Floor Conduits & Glowing Cables
    this.renderFloorConduits(ctx);

    // 4. Draw Consoles & Station Machinery
    this.renderStationMachinery(ctx);

    // 5. Draw Walls & Blast Doors
    this.renderWalls(ctx);

    // 6. Draw Collectibles & Terminals
    this.renderInteractables(ctx);

    // 7. Draw Rogue Drone & Sensor Cone
    this.renderDrone(ctx);

    // 8. Draw Player Nova
    this.renderPlayer(ctx);

    // 9. Draw Particles
    this.renderParticles(ctx);

    // 10. Ambient Sci-Fi Lighting & Flashlight Vignette
    this.renderLightingOverlay(ctx);

    ctx.restore();
  }

  private renderSpaceBackdrop(ctx: CanvasRenderingContext2D) {
    const time = this.gameTime;

    // Render twinkling stars visible behind space windows
    for (const win of SPACE_WINDOWS) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(win.x, win.y, win.width, win.height);
      ctx.clip();

      // Deep cosmic gradient
      const grad = ctx.createLinearGradient(win.x, win.y, win.x + win.width, win.y + win.height);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(win.x, win.y, win.width, win.height);

      // Distant magenta/cyan nebula dust
      const nebGrad = ctx.createRadialGradient(win.x + win.width * 0.4, win.y + win.height * 0.5, 5, win.x + win.width * 0.4, win.y + win.height * 0.5, 120);
      nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      nebGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
      nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(win.x, win.y, win.width, win.height);

      // Stars
      for (const star of this.stars) {
        if (star.x >= win.x && star.x <= win.x + win.width && star.y >= win.y && star.y <= win.y + win.height) {
          const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // High-tech glass framing line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(win.x, win.y, win.width, win.height);
      ctx.restore();
    }
  }

  private renderRooms(ctx: CanvasRenderingContext2D) {
    for (const room of ROOMS) {
      const { x, y, width, height } = room.bounds;

      ctx.fillStyle = room.color;
      ctx.fillRect(x, y, width, height);

      // Floor tile patterns
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      const tileSize = 40;
      for (let tx = x; tx < x + width; tx += tileSize) {
        ctx.beginPath();
        ctx.moveTo(tx, y);
        ctx.lineTo(tx, y + height);
        ctx.stroke();
      }
      for (let ty = y; ty < y + height; ty += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, ty);
        ctx.lineTo(x + width, ty);
        ctx.stroke();
      }

      // Room name decal on floor
      ctx.save();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(room.name.toUpperCase(), x + 16, y + 24);
      ctx.restore();
    }

    // Central Crossroads Station Seal
    ctx.save();
    ctx.translate(1200, 1000);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ECHO-7', 0, -8);
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('CORE RESEARCH', 0, 8);
    ctx.restore();
  }

  private renderFloorConduits(ctx: CanvasRenderingContext2D) {
    const time = this.gameTime;

    const deltaActive = this.powerNodes.find(n => n.id === 'DELTA')?.isActivated;
    const sigmaActive = this.powerNodes.find(n => n.id === 'SIGMA')?.isActivated;
    const omegaActive = this.powerNodes.find(n => n.id === 'OMEGA')?.isActivated;

    // Delta Conduit (Reactor Core -> Hub)
    this.drawConduit(ctx, [
      { x: 520, y: 1440 },
      { x: 800, y: 1540 },
      { x: 900, y: 1100 },
      { x: 1200, y: 1000 }
    ], deltaActive, '#f59e0b', time);

    // Sigma Conduit (Engineering -> Hub)
    this.drawConduit(ctx, [
      { x: 1900, y: 1440 },
      { x: 1600, y: 1540 },
      { x: 1500, y: 1100 },
      { x: 1200, y: 1000 }
    ], sigmaActive, '#38bdf8', time + 1);

    // Omega Conduit (Life Support -> Hub)
    this.drawConduit(ctx, [
      { x: 680, y: 480 },
      { x: 800, y: 650 },
      { x: 900, y: 900 },
      { x: 1200, y: 1000 }
    ], omegaActive, '#10b981', time + 2);

    // Hub to Comm Bridge Conduit (active when all 3 nodes on)
    const allActive = deltaActive && sigmaActive && omegaActive;
    this.drawConduit(ctx, [
      { x: 1200, y: 1000 },
      { x: 1200, y: 550 },
      { x: 1200, y: 220 }
    ], allActive, '#a855f7', time * 2);
  }

  private drawConduit(ctx: CanvasRenderingContext2D, points: Vector2D[], isActive: boolean | undefined, color: string, time: number) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    if (isActive) {
      // Glowing energized conduit
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Flowing energy dashes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 16]);
      ctx.lineDashOffset = -time * 50;
      ctx.stroke();
    } else {
      // Inactive dark metal wire
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderStationMachinery(ctx: CanvasRenderingContext2D) {
    const time = this.gameTime;

    // 1. REACTOR CORE (x: 520, y: 1600)
    ctx.save();
    ctx.translate(520, 1600);
    // Outer magnetic containment ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating containment arms
    ctx.save();
    ctx.rotate(time * 0.8);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-6, -55, 12, 16);
    }
    ctx.restore();

    // Inner pulsing plasma core
    const plasmaGlow = 18 + Math.sin(time * 4) * 4;
    const coreGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, plasmaGlow);
    const deltaActive = this.powerNodes.find(n => n.id === 'DELTA')?.isActivated;
    if (deltaActive) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#38bdf8');
      coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    } else {
      coreGrad.addColorStop(0, '#fef08a');
      coreGrad.addColorStop(0.5, '#f59e0b');
      coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    }
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, plasmaGlow, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. LIFE SUPPORT RECHARGE POD (x: 340, y: 500)
    ctx.save();
    ctx.translate(340, 500);
    // Green hexagonal recharge pad
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const rx = Math.cos(a) * 32;
      const ry = Math.sin(a) * 32;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();

    // Pulsing energy cylinder
    const rechargePulse = 0.4 + 0.3 * Math.sin(time * 3);
    ctx.fillStyle = `rgba(16, 185, 129, ${rechargePulse})`;
    ctx.fill();

    // Symbol: Cross / Energy
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);
    ctx.restore();

    // 3. SECURITY EMP CONSOLE (x: 2100, y: 920)
    ctx.save();
    ctx.translate(2100, 920);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-20, -20, 40, 40);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, -20, 40, 40);
    // Monitor screen with waveform
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -14, 28, 28);
    ctx.strokeStyle = this.drone.isDisabled ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = -10; i <= 10; i += 3) {
      const y = Math.sin(time * 6 + i) * 5;
      if (i === -10) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
    ctx.restore();

    // 4. MAIN COMMUNICATIONS ARRAY (x: 1200, y: 180)
    ctx.save();
    ctx.translate(1200, 180);
    // Huge curved transmitter dish console
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 36, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    // Glowing core
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, 10 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📡', 0, 0);
    ctx.restore();
  }

  private renderWalls(ctx: CanvasRenderingContext2D) {
    for (const wall of WALLS) {
      // Metal wall body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

      // Top bevel highlight
      ctx.fillStyle = '#334155';
      ctx.fillRect(wall.x, wall.y, wall.w, Math.min(4, wall.h));

      // Border outline
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    }

    // COMMUNICATIONS BRIDGE BLAST DOOR
    // Doorway at x: 1140..1260, y: 350..370
    const allActive = this.powerNodes.every(n => n.isActivated) && this.dataFragments.every(f => f.collected);
    ctx.save();
    if (allActive) {
      // Unlocked: Green threshold lights, door retracted
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(1140, 360);
      ctx.lineTo(1260, 360);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BRIDGE ACCESS [OPEN]', 1200, 350);
    } else {
      // Locked: Heavy red laser barrier
      const time = this.gameTime;
      const laserPulse = 0.7 + 0.3 * Math.sin(time * 6);
      ctx.strokeStyle = `rgba(239, 68, 68, ${laserPulse})`;
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(1140, 360);
      ctx.lineTo(1260, 360);
      ctx.stroke();

      // Warning stripes & label
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED // PROTOCOL QUARANTINE', 1200, 350);
    }
    ctx.restore();
  }

  private renderInteractables(ctx: CanvasRenderingContext2D) {
    const time = this.gameTime;

    // 1. DATA FRAGMENTS (Spinning 3D holographic cubes)
    for (const frag of this.dataFragments) {
      if (!frag.collected) {
        ctx.save();
        ctx.translate(frag.position.x, frag.position.y);

        const floatY = Math.sin(time * 3 + frag.id) * 5;
        ctx.translate(0, floatY);

        // Hologram Aura
        const haloGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
        haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
        haloGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.4)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Isometric Crystal
        ctx.rotate(time * 1.5);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;

        const s = 12;
        ctx.strokeRect(-s / 2, -s / 2, s, s);

        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = '#c084fc';
        ctx.strokeRect(-s / 2, -s / 2, s, s);

        ctx.restore();
      }
    }

    // 2. POWER NODE TERMINALS
    for (const node of this.powerNodes) {
      ctx.save();
      ctx.translate(node.position.x, node.position.y);

      // Terminal pedestal
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = node.isActivated ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.shadowColor = node.isActivated ? '#10b981' : '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Node Symbol (Δ, Σ, Ω)
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.symbol, 0, 0);

      // Status text below
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = node.isActivated ? '#10b981' : '#94a3b8';
      ctx.fillText(node.isActivated ? 'ONLINE' : 'OFFLINE', 0, 32);

      ctx.restore();
    }

    // 3. Highlight closest interactable with subtle target reticle
    const closest = this.getClosestInteractable();
    if (closest) {
      ctx.save();
      ctx.translate(closest.x, closest.y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = time * 15;
      ctx.beginPath();
      ctx.arc(0, 0, closest.radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderDrone(ctx: CanvasRenderingContext2D) {
    const time = this.gameTime;
    const d = this.drone;

    ctx.save();
    ctx.translate(d.x, d.y);

    // 1. VISION CONE (Only if not disabled)
    if (!d.isDisabled) {
      ctx.save();
      ctx.rotate(d.angle);

      const coneGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, d.visionRange);
      if (d.isAlert) {
        coneGrad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
        coneGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
        coneGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else {
        coneGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        coneGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.15)');
        coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      }

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, d.visionRange, -d.visionConeAngle / 2, d.visionConeAngle / 2);
      ctx.closePath();
      ctx.fill();

      // Vision sweep perimeter arc
      ctx.strokeStyle = d.isAlert ? '#ef4444' : 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, d.visionRange, -d.visionConeAngle / 2, d.visionConeAngle / 2);
      ctx.stroke();

      ctx.restore();
    }

    // 2. DRONE BODY
    ctx.rotate(d.angle);

    // Thruster back trail
    if (!d.isDisabled) {
      ctx.fillStyle = d.isAlert ? '#ef4444' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-16, -5);
      ctx.lineTo(-24 - Math.random() * 8, 0);
      ctx.lineTo(-16, 5);
      ctx.closePath();
      ctx.fill();
    }

    // Drone Chassis (Sleek triangular stealth shape)
    ctx.fillStyle = d.isDisabled ? '#334155' : (d.isAlert ? '#450a0a' : '#0f172a');
    ctx.strokeStyle = d.isDisabled ? '#64748b' : (d.isAlert ? '#ef4444' : '#f59e0b');
    ctx.lineWidth = 2;
    ctx.shadowColor = d.isDisabled ? '#64748b' : (d.isAlert ? '#ef4444' : '#f59e0b');
    ctx.shadowBlur = d.isDisabled ? 0 : 8;

    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-14, -14);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Sensor Eye
    ctx.fillStyle = d.isDisabled ? '#1e293b' : (d.isAlert ? '#ef4444' : '#38bdf8');
    ctx.beginPath();
    ctx.arc(4, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Disabled status ring or countdown
    if (d.isDisabled) {
      ctx.restore();
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`EMP: ${Math.ceil(d.disabledTimer)}s`, 0, -32);
    }

    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Damage / Invulnerability flicker
    if (p.invulnerableTimer > 0 && Math.floor(this.gameTime * 20) % 2 === 0) {
      ctx.restore();
      return;
    }

    ctx.rotate(p.angle);

    // FLASHLIGHT BEAM
    ctx.save();
    const beamGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 190);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    beamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.arc(10, 0, 190, -Math.PI / 4.5, Math.PI / 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ASTRONAUT BODY (Top-down view of Nova)
    // Backpack / Life Support Unit
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-15, -9, 8, 18);
    // Oxygen tanks on backpack
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(-13, -7, 4, 5);
    ctx.fillRect(-13, 2, 4, 5);

    // Suit Shoulders & Torso
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet & Reflective Cyan Visor
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Visor arc
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(4, 0, 6, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderLightingOverlay(ctx: CanvasRenderingContext2D) {
    // Subtle sci-fi ambient shadow mask with radial cutout around Nova
    const px = this.player.x;
    const py = this.player.y;

    const radGrad = ctx.createRadialGradient(px, py, 60, px, py, 420);
    radGrad.addColorStop(0, 'rgba(3, 7, 18, 0)');
    radGrad.addColorStop(0.5, 'rgba(3, 7, 18, 0.35)');
    radGrad.addColorStop(1, 'rgba(3, 7, 18, 0.7)');

    ctx.fillStyle = radGrad;
    ctx.fillRect(px - 600, py - 500, 1200, 1000);
  }
}
