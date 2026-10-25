import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraView, LevelConfig, MobEntity, PlayerState } from '../types/game';
import { LEVELS } from './levels';
import {
  createBossOmar,
  createDeadBodyMesh,
  createExitPortal,
  createFireBrazier,
  createHellMob,
  createInfernalBlade,
  createOmarCharacter,
  createPlayerMesh,
  createSkullMesh,
} from './proceduralModels';
import { soundManager } from '../utils/audio';
import { createLavaTexture, createObsidianTexture } from '../utils/textures';

// Pre-allocated math helpers for zero GC in render loop (Three.js skill directive)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _moveDir = new THREE.Vector3();

export interface GameEngineCallbacks {
  onPlayerStateChange: (state: PlayerState) => void;
  onScreenChange: (screen: 'playing' | 'paused' | 'gameover' | 'victory') => void;
  onNotification: (msg: string) => void;
  onOmarProximity: (distance: number, isHunting: boolean) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock = new THREE.Clock();
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;

  // Environment & Level
  private currentLevelIndex: number = 0;
  private platformMeshes: Array<{
    mesh: THREE.Mesh;
    def: any;
    initialPos: THREE.Vector3;
    box: THREE.Box3;
  }> = [];
  private lavaPlane!: THREE.Mesh;
  private braziers: Array<{ flame: THREE.Mesh; light: THREE.PointLight }> = [];
  private exitPortalMesh: THREE.Group | null = null;
  private ashParticles!: THREE.Points;

  // Particle Burst System for Hits & Damage
  private hitParticles!: THREE.Points;
  private hitParticleGeo!: THREE.BufferGeometry;
  private hitPositions!: Float32Array;
  private hitVelocities!: Float32Array;
  private hitLifetimes!: Float32Array;
  private hitColors!: Float32Array;
  private readonly MAX_BURST_PARTICLES = 160;

  // Player Entity & Physics
  public playerMeshGroup!: THREE.Group;
  private playerAnimParts: any;
  public playerPos = new THREE.Vector3(0, 2, 0);
  public playerVel = new THREE.Vector3(0, 0, 0);
  public isGrounded = false;
  private playerRadius = 0.45;
  private playerHeight = 1.8;
  public cameraView: CameraView = 'first';
  private cameraYaw = 0;
  private cameraPitch = 0;
  private screenShakeTrauma = 0;
  private currentStandingPlatform: any = null;
  private platformDelta = new THREE.Vector3();

  // Agent Omar Entity
  public omarGroup!: THREE.Group;
  private omarParts: any;
  public omarPos = new THREE.Vector3(0, 2, -30);
  public omarVel = new THREE.Vector3(0, 0, 0);
  public omarIsHunting = false;
  public omarStunnedTimer = 0;
  public omarHealth = 100;

  // Weapons (FPV & TPV)
  public fpvWeaponGroup!: THREE.Group;
  public tpvWeaponGroup!: THREE.Group;
  public isAttacking = false;
  public attackTimer = 0;
  public attackCooldown = 0;

  // Mobs & Boss
  private mobs: MobEntity[] = [];
  private bossData: any = null;
  public bossHealth: number | null = null;
  public maxBossHealth = 500;

  // Player State
  public playerState: PlayerState = {
    hearts: 3,
    maxHearts: 3,
    hasGoldenHeart: false,
    score: 0,
    level: 1,
    fallsInCurrentLevel: 0,
    totalFalls: 0,
    hasMadeMistakeInLevel: false,
    sprintStamina: 100,
    isSprinting: false,
    money: 0,
    highScore: 0,
    omarStunTime: 0,
    bossHealth: null,
  };

  // Input State
  private keys: Record<string, boolean> = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    Space: false,
    ShiftLeft: false,
    ShiftRight: false,
    KeyF: false,
    KeyE: false,
  };
  private isPointerLocked = false;
  private isMouseDown = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  public isPaused = false;
  private invincibleTimer = 0;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Load high score
    const savedHighScore = localStorage.getItem('escape_omar_highscore');
    if (savedHighScore) {
      this.playerState.highScore = parseInt(savedHighScore, 10) || 0;
    }

    this.initThree();
    this.initHitParticles();
    this.initAshAtmosphere();
    this.initPlayer();
    this.initWeapon();
    this.initOmar();
    this.loadLevel(0);
    this.setupEventListeners();
    this.startLoop();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x160404);
    this.scene.fog = new THREE.FogExp2(0x160404, 0.022);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(72, width / height, 0.05, 400);

    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Studio Environment map via PMREMGenerator (Three.js skill directive)
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {}

    // Studio 3-point lighting rig (Warm key + cool hemisphere fill)
    const keyLight = new THREE.DirectionalLight(0xff7733, 2.2);
    keyLight.position.set(20, 45, 20);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 180;
    const d = 50;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xff5522, 0x110522, 1.2);
    this.scene.add(hemiLight);

    // Roaring Infernal Lava Sea at y = -8
    const lavaTex = createLavaTexture();
    lavaTex.repeat.set(16, 16);
    const lavaGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
    const lavaMat = new THREE.MeshStandardMaterial({
      map: lavaTex,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xaa2200,
      emissiveIntensity: 0.7,
    });
    this.lavaPlane = new THREE.Mesh(lavaGeo, lavaMat);
    this.lavaPlane.rotation.x = -Math.PI / 2;
    this.lavaPlane.position.y = -7;
    this.lavaPlane.receiveShadow = true;
    this.scene.add(this.lavaPlane);
  }

  private initPlayer() {
    this.playerAnimParts = createPlayerMesh();
    this.playerMeshGroup = this.playerAnimParts.group;
    // CRITICAL: Player mesh is hidden in 1st person view so it never clips camera
    this.playerMeshGroup.visible = this.cameraView === 'third';
    this.scene.add(this.playerMeshGroup);
  }

  private initWeapon() {
    // 1. FPV weapon: attached to camera for first person view
    const fpvData = createInfernalBlade(0.68);
    this.fpvWeaponGroup = fpvData.group;
    this.fpvWeaponGroup.position.set(0.36, -0.32, -0.62);
    this.fpvWeaponGroup.rotation.set(-0.25, 0.45, -0.2);
    this.camera.add(this.fpvWeaponGroup);
    this.scene.add(this.camera);

    // 2. TPV weapon: attached to player's right hand
    const tpvData = createInfernalBlade(0.85);
    this.tpvWeaponGroup = tpvData.group;
    this.tpvWeaponGroup.position.set(0, -0.4, 0.15);
    this.tpvWeaponGroup.rotation.set(Math.PI / 2.2, 0, 0);
    this.playerAnimParts.rightArm.add(this.tpvWeaponGroup);

    this.updateWeaponVisibility();
  }

  public updateWeaponVisibility() {
    if (this.fpvWeaponGroup) {
      this.fpvWeaponGroup.visible = this.cameraView === 'first';
    }
    if (this.tpvWeaponGroup) {
      this.tpvWeaponGroup.visible = this.cameraView === 'third';
    }
    if (this.playerMeshGroup) {
      this.playerMeshGroup.visible = this.cameraView === 'third';
    }
  }

  private initOmar() {
    this.omarParts = createOmarCharacter();
    this.omarGroup = this.omarParts.group;
    this.scene.add(this.omarGroup);
  }

  private initHitParticles() {
    this.hitParticleGeo = new THREE.BufferGeometry();
    this.hitPositions = new Float32Array(this.MAX_BURST_PARTICLES * 3);
    this.hitVelocities = new Float32Array(this.MAX_BURST_PARTICLES * 3);
    this.hitLifetimes = new Float32Array(this.MAX_BURST_PARTICLES);
    this.hitColors = new Float32Array(this.MAX_BURST_PARTICLES * 3);

    for (let i = 0; i < this.MAX_BURST_PARTICLES; i++) {
      this.hitLifetimes[i] = -1; // Inactive
      this.hitPositions[i * 3 + 1] = -999;
    }

    this.hitParticleGeo.setAttribute('position', new THREE.BufferAttribute(this.hitPositions, 3));
    this.hitParticleGeo.setAttribute('color', new THREE.BufferAttribute(this.hitColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    this.hitParticles = new THREE.Points(this.hitParticleGeo, pMat);
    this.scene.add(this.hitParticles);
  }

  public triggerHitBurst(x: number, y: number, z: number, count = 45, isLava = false) {
    let spawned = 0;
    for (let i = 0; i < this.MAX_BURST_PARTICLES && spawned < count; i++) {
      if (this.hitLifetimes[i] <= 0) {
        this.hitPositions[i * 3] = x;
        this.hitPositions[i * 3 + 1] = y;
        this.hitPositions[i * 3 + 2] = z;

        const speed = 3.5 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        this.hitVelocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
        this.hitVelocities[i * 3 + 1] = (Math.abs(Math.cos(phi)) * 0.7 + 0.3) * speed + 2;
        this.hitVelocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

        this.hitLifetimes[i] = 0.5 + Math.random() * 0.5;

        // Orange / red flame sparks
        if (isLava) {
          this.hitColors[i * 3] = 1.0;
          this.hitColors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
          this.hitColors[i * 3 + 2] = 0.05;
        } else {
          this.hitColors[i * 3] = 1.0;
          this.hitColors[i * 3 + 1] = 0.15 + Math.random() * 0.2;
          this.hitColors[i * 3 + 2] = 0.05;
        }
        spawned++;
      }
    }
    this.hitParticleGeo.attributes.position.needsUpdate = true;
    this.hitParticleGeo.attributes.color.needsUpdate = true;
  }

  private initAshAtmosphere() {
    const count = 400;
    const ashGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 30 - 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    ashGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ashMat = new THREE.PointsMaterial({
      color: 0xff4411,
      size: 0.18,
      transparent: true,
      opacity: 0.5,
    });
    this.ashParticles = new THREE.Points(ashGeo, ashMat);
    this.scene.add(this.ashParticles);
  }

  public loadLevel(levelIdx: number) {
    this.currentLevelIndex = Math.max(0, Math.min(levelIdx, LEVELS.length - 1));
    const config = LEVELS[this.currentLevelIndex];

    this.playerState.level = config.levelNumber;
    this.playerState.fallsInCurrentLevel = 0;
    this.playerState.hasMadeMistakeInLevel = false;

    // Clear old platform meshes & hazards
    this.platformMeshes.forEach((p) => {
      this.scene.remove(p.mesh);
    });
    this.platformMeshes = [];

    this.braziers.forEach((b) => {
      this.scene.remove(b.flame.parent!);
    });
    this.braziers = [];

    if (this.exitPortalMesh) {
      this.scene.remove(this.exitPortalMesh);
      this.exitPortalMesh = null;
    }

    // Clear old mobs & boss
    this.mobs.forEach((m) => {
      this.scene.remove(m.mesh);
    });
    this.mobs = [];
    if (this.bossData) {
      this.scene.remove(this.bossData.group);
      this.bossData = null;
    }

    // Set atmosphere
    this.scene.background = new THREE.Color(config.ambientColor);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color = new THREE.Color(config.ambientColor);
      this.scene.fog.density = config.fogDensity;
    }

    // Build platforms
    const obsidianTex = createObsidianTexture();
    obsidianTex.repeat.set(2, 2);

    const platformMat = new THREE.MeshStandardMaterial({
      map: obsidianTex,
      roughness: 0.5,
      metalness: 0.7,
    });

    config.platforms.forEach((def, index) => {
      const geo = new THREE.BoxGeometry(def.width, def.height, def.depth);
      const mesh = new THREE.Mesh(geo, platformMat);
      mesh.position.set(def.x, def.y, def.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      this.platformMeshes.push({
        mesh,
        def,
        initialPos: new THREE.Vector3(def.x, def.y, def.z),
        box,
      });

      // Decorations: Fire Brazier
      if (def.hasFireBrazier) {
        const brazier = createFireBrazier();
        brazier.mesh.position.set(def.x + def.width * 0.38, def.y + def.height / 2, def.z + def.depth * 0.38);
        this.scene.add(brazier.mesh);
        this.braziers.push({ flame: brazier.flameMesh, light: brazier.light });
      }

      // Decorations: Skulls
      if (def.hasSkulls) {
        const skull = createSkullMesh(0.7);
        skull.position.set(def.x - def.width * 0.35, def.y + def.height / 2, def.z - def.depth * 0.3);
        skull.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(skull);
      }

      // Decorations: Dead body
      if (def.hasDeadBody) {
        const body = createDeadBodyMesh(0.8);
        body.position.set(def.x + (Math.random() - 0.5) * (def.width * 0.5), def.y + def.height / 2, def.z);
        body.rotation.y = Math.random() * Math.PI;
        this.scene.add(body);
      }
    });

    // Exit Portal on Goal Platform
    this.exitPortalMesh = createExitPortal();
    this.exitPortalMesh.position.set(config.goalPos[0], config.goalPos[1] + 0.75, config.goalPos[2]);
    this.scene.add(this.exitPortalMesh);

    // Reset Player to start
    this.respawnPlayer(false);

    // Setup Agent Omar
    this.omarPos.set(config.omarSpawnPos[0], config.omarSpawnPos[1], config.omarSpawnPos[2]);
    this.omarGroup.position.copy(this.omarPos);

    // Spawn Mobs based on Score / Level Difficulty (Every 100 points spawns a mob!)
    this.spawnMobsForCurrentState();

    this.callbacks.onPlayerStateChange({ ...this.playerState });
    this.callbacks.onNotification(`ENTERED LEVEL ${config.levelNumber}: ${config.name.toUpperCase()}`);
  }

  private spawnMobsForCurrentState() {
    const score = this.playerState.score;

    // Score 100+: Spawn Imp
    if (score >= 100) {
      const impMesh = createHellMob('imp');
      const startZ = this.playerPos.z - 20;
      impMesh.position.set(0, 2, startZ);
      this.scene.add(impMesh);
      this.mobs.push({
        id: 'imp-1',
        type: 'imp',
        mesh: impMesh,
        position: [0, 2, startZ],
        health: 50,
        maxHealth: 50,
        speed: 3.2,
        attackRange: 1.6,
        damage: 1,
        patrolCenter: [0, 2, startZ],
        patrolRadius: 6,
        lastAttackTime: 0,
        alertState: 'patrol',
      });
    }

    // Score 200+: Spawn Infernal Guard
    if (score >= 200) {
      const guardMesh = createHellMob('guard');
      const startZ = this.playerPos.z - 35;
      guardMesh.position.set(2, 2, startZ);
      this.scene.add(guardMesh);
      this.mobs.push({
        id: 'guard-1',
        type: 'guard',
        mesh: guardMesh,
        position: [2, 2, startZ],
        health: 100,
        maxHealth: 100,
        speed: 2.8,
        attackRange: 1.8,
        damage: 1,
        patrolCenter: [2, 2, startZ],
        patrolRadius: 7,
        lastAttackTime: 0,
        alertState: 'patrol',
      });
    }

    // Score 300+: Spawn Specter
    if (score >= 300) {
      const specterMesh = createHellMob('specter');
      const startZ = this.playerPos.z - 45;
      specterMesh.position.set(-2, 2.5, startZ);
      this.scene.add(specterMesh);
      this.mobs.push({
        id: 'specter-1',
        type: 'specter',
        mesh: specterMesh,
        position: [-2, 2.5, startZ],
        health: 120,
        maxHealth: 120,
        speed: 3.5,
        attackRange: 1.7,
        damage: 1,
        patrolCenter: [-2, 2.5, startZ],
        patrolRadius: 8,
        lastAttackTime: 0,
        alertState: 'patrol',
      });
    }

    // Score 400+: Spawn Omar Enforcer
    if (score >= 400) {
      const enforcerMesh = createHellMob('guard');
      enforcerMesh.scale.set(1.25, 1.25, 1.25);
      const startZ = this.playerPos.z - 55;
      enforcerMesh.position.set(0, 2, startZ);
      this.scene.add(enforcerMesh);
      this.mobs.push({
        id: 'enforcer-1',
        type: 'guard',
        mesh: enforcerMesh,
        position: [0, 2, startZ],
        health: 160,
        maxHealth: 160,
        speed: 4.0,
        attackRange: 2.0,
        damage: 1,
        patrolCenter: [0, 2, startZ],
        patrolRadius: 9,
        lastAttackTime: 0,
        alertState: 'patrol',
      });
    }

    // Score 500: Boss Mob - MEGA OMAR! Make him BIG!
    if (score >= 500 || this.currentLevelIndex === 7) {
      this.bossData = createBossOmar();
      this.bossData.group.position.set(0, 2.8, -55);
      this.scene.add(this.bossData.group);
      soundManager.playBossRoar();
      this.callbacks.onNotification('WARNING: TITAN OMAR HAS AWAKENED! ESCAPE THE ARENA!');
    }
  }

  public respawnPlayer(markMistake = true) {
    const config = LEVELS[this.currentLevelIndex];
    this.playerPos.set(config.startPos[0], config.startPos[1] + 1.2, config.startPos[2]);
    this.playerVel.set(0, 0, 0);
    this.playerMeshGroup.position.copy(this.playerPos);
    this.updateWeaponVisibility();
    this.isGrounded = true;
    this.invincibleTimer = 1.2;

    if (markMistake) {
      this.playerState.hasMadeMistakeInLevel = true;
    }
  }

  public toggleCameraView() {
    this.cameraView = this.cameraView === 'first' ? 'third' : 'first';
    this.updateWeaponVisibility();
    this.callbacks.onNotification(`CAMERA: ${this.cameraView.toUpperCase()} PERSON [Z]`);
  }

  public attack() {
    if (this.isPaused || this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackTimer = 0.35;
    this.attackCooldown = 0.38;
    soundManager.playWeaponSwing();
    this.checkAttackHits();
  }

  private checkAttackHits() {
    const forwardX = -Math.sin(this.cameraYaw);
    const forwardZ = -Math.cos(this.cameraYaw);

    // 1. Attack Agent Omar
    const distToOmar = this.playerPos.distanceTo(this.omarPos);
    if (distToOmar < 4.2) {
      _v1.set(this.omarPos.x - this.playerPos.x, 0, this.omarPos.z - this.playerPos.z).normalize();
      const dot = forwardX * _v1.x + forwardZ * _v1.z;
      if (dot > 0.15) {
        this.omarStunnedTimer = 3.2; // Stun Omar for 3.2s!
        this.playerState.omarStunTime = 3.2;
        this.omarHealth = Math.max(0, this.omarHealth - 25);

        // Knockback Omar away from player
        this.omarPos.x += forwardX * 5.5;
        this.omarPos.z += forwardZ * 5.5;
        this.omarGroup.position.copy(this.omarPos);

        soundManager.playWeaponHit();
        soundManager.playOmarStunned();
        this.triggerHitBurst(this.omarPos.x, this.omarPos.y + 1.2, this.omarPos.z, 55, false);

        this.playerState.score += 15;
        this.callbacks.onNotification('BLADE STRUCK OMAR! AGENT STUNNED 3s! (+15 PTS)');
        this.callbacks.onPlayerStateChange({ ...this.playerState });
      }
    }

    // 2. Attack Mobs
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      const dist = this.playerPos.distanceTo(mob.mesh.position);
      if (dist < 4.0) {
        _v1.set(mob.mesh.position.x - this.playerPos.x, 0, mob.mesh.position.z - this.playerPos.z).normalize();
        const dot = forwardX * _v1.x + forwardZ * _v1.z;
        if (dot > 0.1) {
          mob.health -= 50;
          soundManager.playWeaponHit();
          this.triggerHitBurst(mob.mesh.position.x, mob.mesh.position.y + 1, mob.mesh.position.z, 45, false);

          if (mob.health <= 0) {
            this.scene.remove(mob.mesh);
            this.mobs.splice(i, 1);
            soundManager.playMobScreech();
            this.playerState.score += 25;
            this.callbacks.onNotification(`VANQUISHED ${mob.type.toUpperCase()}! (+25 PTS)`);
            this.callbacks.onPlayerStateChange({ ...this.playerState });
          } else {
            mob.mesh.position.x += forwardX * 3.5;
            mob.mesh.position.z += forwardZ * 3.5;
            this.callbacks.onNotification(`SLASHED ${mob.type.toUpperCase()}!`);
          }
        }
      }
    }

    // 3. Attack Titan Boss Omar
    if (this.bossData && this.bossHealth !== null) {
      const bossPos = this.bossData.group.position;
      const distToBoss = this.playerPos.distanceTo(bossPos);
      if (distToBoss < 7.5) {
        _v1.set(bossPos.x - this.playerPos.x, 0, bossPos.z - this.playerPos.z).normalize();
        const dot = forwardX * _v1.x + forwardZ * _v1.z;
        if (dot > 0.05) {
          this.bossHealth = Math.max(0, this.bossHealth - 35);
          this.playerState.bossHealth = this.bossHealth;
          soundManager.playWeaponHit();
          soundManager.playBossRoar();
          this.triggerHitBurst(bossPos.x, bossPos.y + 3.0, bossPos.z, 65, true);

          if (this.bossHealth <= 0) {
            this.callbacks.onNotification('TITAN OMAR SLAIN! ESCAPE VAULT UNLOCKED!');
            this.handleLevelComplete();
          } else {
            this.callbacks.onNotification(`HIT TITAN OMAR! HP: ${this.bossHealth}/${this.maxBossHealth}`);
            this.callbacks.onPlayerStateChange({ ...this.playerState });
          }
        }
      }
    }
  }

  private updateWeapon(dt: number) {
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }

    const t = performance.now() * 0.005;

    // FPV Weapon Animation
    if (this.fpvWeaponGroup && this.cameraView === 'first') {
      if (this.isAttacking) {
        this.attackTimer -= dt;
        const progress = Math.max(0, Math.min(1, 1 - this.attackTimer / 0.35));

        if (progress < 0.5) {
          // Slash swing across screen
          const p = progress / 0.5;
          this.fpvWeaponGroup.position.set(0.36 - p * 0.72, -0.32 + Math.sin(p * Math.PI) * 0.22, -0.62 - p * 0.18);
          this.fpvWeaponGroup.rotation.set(-0.25 + p * 0.9, 0.45 - p * 1.7, -0.2 - p * 1.4);
        } else {
          // Return smoothly to idle
          const p = (progress - 0.5) / 0.5;
          this.fpvWeaponGroup.position.set(-0.36 + p * 0.72, -0.32, -0.8 + p * 0.18);
          this.fpvWeaponGroup.rotation.set(0.65 - p * 0.9, -1.25 + p * 1.7, -1.6 + p * 1.4);
        }

        if (this.attackTimer <= 0) {
          this.isAttacking = false;
        }
      } else {
        // Idle breathing and walking bob
        const isMoving = this.playerVel.length() > 0.5;
        const bobSpeed = isMoving ? 12 : 3;
        const bobAmt = isMoving ? 0.03 : 0.008;

        const bobY = Math.sin(t * bobSpeed) * bobAmt;
        const bobX = Math.cos(t * bobSpeed * 0.5) * bobAmt * 0.8;

        this.fpvWeaponGroup.position.set(0.36 + bobX, -0.32 + bobY, -0.62);
        this.fpvWeaponGroup.rotation.set(-0.25 + bobY * 0.5, 0.45, -0.2);
      }
    }

    // TPV Weapon Arm Animation
    if (this.cameraView === 'third' && this.playerAnimParts) {
      if (this.isAttacking) {
        this.attackTimer -= dt;
        const p = Math.sin((1 - Math.max(0, this.attackTimer) / 0.35) * Math.PI);
        this.playerAnimParts.rightArm.rotation.x = -Math.PI / 2.5 + p * 1.2;
        if (this.attackTimer <= 0) {
          this.isAttacking = false;
        }
      }
    }
  }

  public damagePlayer(amount = 1, reason = 'hit') {
    if (this.invincibleTimer > 0) return;
    this.invincibleTimer = 1.2;
    this.screenShakeTrauma = 1.0;
    this.playerState.hasMadeMistakeInLevel = true;

    // Check golden heart shield first
    if (this.playerState.hasGoldenHeart) {
      this.playerState.hasGoldenHeart = false;
      this.triggerHitBurst(this.playerPos.x, this.playerPos.y + 1, this.playerPos.z, 50, false);
      soundManager.playDamage();
      this.callbacks.onNotification('GOLDEN HEART ABSORBED THE FATAL BLOW!');
      this.callbacks.onPlayerStateChange({ ...this.playerState });
      return;
    }

    this.playerState.hearts -= amount;
    this.triggerHitBurst(this.playerPos.x, this.playerPos.y + 1, this.playerPos.z, 40, false);
    soundManager.playDamage();

    if (this.playerState.hearts <= 0) {
      this.handleThreeFallsOrDeath();
    } else {
      this.callbacks.onPlayerStateChange({ ...this.playerState });
    }
  }

  private handlePlayerFall() {
    this.triggerHitBurst(this.playerPos.x, -5, this.playerPos.z, 60, true);
    soundManager.playLavaFall();
    this.screenShakeTrauma = 1.0;

    this.playerState.hearts -= 1;
    this.playerState.fallsInCurrentLevel += 1;
    this.playerState.totalFalls += 1;
    this.playerState.hasMadeMistakeInLevel = true;

    // Rule: "If he falls 3 times, he gets back to the previous level."
    if (this.playerState.fallsInCurrentLevel >= 3 || this.playerState.hearts <= 0) {
      this.handleThreeFallsOrDeath();
    } else {
      this.callbacks.onNotification(`FELL INTO LAVA! -1 HEART (${this.playerState.hearts} LEFT)`);
      this.respawnPlayer(true);
      this.callbacks.onPlayerStateChange({ ...this.playerState });
    }
  }

  private handleThreeFallsOrDeath() {
    if (this.currentLevelIndex > 0) {
      // Sent back to previous level!
      this.callbacks.onNotification('3 FALLS! SENT BACK TO PREVIOUS LEVEL!');
      this.playerState.hearts = this.playerState.maxHearts;
      this.playerState.fallsInCurrentLevel = 0;
      this.loadLevel(this.currentLevelIndex - 1);
    } else {
      // Game Over at Level 1
      this.saveHighScore();
      this.isPaused = true;
      this.callbacks.onPlayerStateChange({ ...this.playerState });
      this.callbacks.onScreenChange('gameover');
      soundManager.playDamage();
    }
  }

  private handleLevelComplete() {
    const flawless = !this.playerState.hasMadeMistakeInLevel;
    let earnedPoints = 10;
    if (flawless) {
      earnedPoints += 10; // Rule: "+10 points for every level of parkour he gets through, +10 for doing it without any mistakes."
      this.callbacks.onNotification('LEVEL COMPLETE! +10 SCORE + 10 FLAWLESS BONUS (+20)!');
    } else {
      this.callbacks.onNotification('LEVEL COMPLETE! +10 SCORE!');
    }

    this.playerState.score += earnedPoints;
    this.saveHighScore();
    soundManager.playLevelSuccess(flawless);

    // Check if player completed final stage or boss level
    if (this.currentLevelIndex >= LEVELS.length - 1 || this.playerState.score >= 500) {
      this.isPaused = true;
      soundManager.playVictoryFanfare();
      this.callbacks.onPlayerStateChange({ ...this.playerState });
      this.callbacks.onScreenChange('victory');
    } else {
      // Next level
      this.loadLevel(this.currentLevelIndex + 1);
    }
  }

  public applyVictoryReward(choice: 'money' | 'golden_heart') {
    if (choice === 'money') {
      this.playerState.money += 500;
      this.callbacks.onNotification('AWARDED +500 HELL GOLD!');
    } else {
      this.playerState.hasGoldenHeart = true;
      this.callbacks.onNotification('AWARDED DIVINE GOLDEN HEART!');
    }
    soundManager.playRewardPick();
    this.callbacks.onPlayerStateChange({ ...this.playerState });
  }

  private saveHighScore() {
    if (this.playerState.score > this.playerState.highScore) {
      this.playerState.highScore = this.playerState.score;
      localStorage.setItem('escape_omar_highscore', String(this.playerState.highScore));
    }
  }

  public restartGame() {
    this.playerState = {
      hearts: 3,
      maxHearts: 3,
      hasGoldenHeart: false,
      score: 0,
      level: 1,
      fallsInCurrentLevel: 0,
      totalFalls: 0,
      hasMadeMistakeInLevel: false,
      sprintStamina: 100,
      isSprinting: false,
      money: 0,
      highScore: this.playerState.highScore,
      omarStunTime: 0,
      bossHealth: null,
    };
    this.isPaused = false;
    this.loadLevel(0);
    this.callbacks.onPlayerStateChange({ ...this.playerState });
    this.callbacks.onScreenChange('playing');
    soundManager.startAmbientHell();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onWindowResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    // Pointer lock support on click
    canvas.addEventListener('click', () => {
      if (!this.isPointerLocked && !this.isPaused) {
        try {
          canvas.requestPointerLock();
        } catch {}
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === canvas;
    });
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'KeyP') {
      this.togglePause();
      return;
    }
    if (e.code === 'KeyZ') {
      this.toggleCameraView();
      return;
    }
    if (e.code === 'KeyF' || e.code === 'KeyE') {
      this.attack();
      return;
    }
    if (this.keys[e.code] !== undefined) {
      this.keys[e.code] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (this.keys[e.code] !== undefined) {
      this.keys[e.code] = false;
    }
  };

  public togglePause() {
    this.isPaused = !this.isPaused;
    this.callbacks.onScreenChange(this.isPaused ? 'paused' : 'playing');
    if (!this.isPaused) {
      soundManager.startAmbientHell();
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0 && !this.isPaused) {
      this.attack();
    }
    this.isMouseDown = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isPaused) return;

    let deltaX = 0;
    let deltaY = 0;

    if (this.isPointerLocked) {
      deltaX = e.movementX;
      deltaY = e.movementY;
    } else if (this.isMouseDown) {
      deltaX = e.clientX - this.prevMouseX;
      deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      const sensitivity = 0.0032;
      this.cameraYaw -= deltaX * sensitivity;
      this.cameraPitch -= deltaY * sensitivity;
      // Clamp pitch
      this.cameraPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.cameraPitch));
    }
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // Virtual touch button triggers for mobile / on-screen controls
  public setVirtualKey(key: string, pressed: boolean) {
    if (this.keys[key] !== undefined) {
      this.keys[key] = pressed;
    }
  }

  public rotateCameraVirtual(deltaYaw: number, deltaPitch: number) {
    this.cameraYaw += deltaYaw;
    this.cameraPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.cameraPitch + deltaPitch));
  }

  private updatePlayerPhysics(dt: number) {
    const config = LEVELS[this.currentLevelIndex];

    // Sprint & Stamina
    const wantsSprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    let moveSpeed = 6.2;

    if (wantsSprint && this.playerState.sprintStamina > 5) {
      this.playerState.isSprinting = true;
      moveSpeed = 10.2;
      this.playerState.sprintStamina = Math.max(0, this.playerState.sprintStamina - 28 * dt);
    } else {
      this.playerState.isSprinting = false;
      this.playerState.sprintStamina = Math.min(100, this.playerState.sprintStamina + 18 * dt);
    }

    // Direction calculation relative to camera yaw
    let forward = 0;
    let strafe = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) strafe += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) strafe -= 1;

    _moveDir.set(0, 0, 0);
    if (forward !== 0 || strafe !== 0) {
      const sin = Math.sin(this.cameraYaw);
      const cos = Math.cos(this.cameraYaw);

      // Camera forward on XZ plane: (-sin, -cos)
      // Camera right on XZ plane: (cos, -sin)
      _moveDir.x = -sin * forward + cos * strafe;
      _moveDir.z = -cos * forward - sin * strafe;
      _moveDir.normalize();

      // Third-person character rotation towards movement
      if (this.cameraView === 'third') {
        const targetRot = Math.atan2(_moveDir.x, _moveDir.z);
        this.playerMeshGroup.rotation.y = THREE.MathUtils.damp(
          this.playerMeshGroup.rotation.y,
          targetRot,
          12,
          dt
        );
      }
    }

    // Smooth horizontal velocity damping
    const targetVelX = _moveDir.x * moveSpeed;
    const targetVelZ = _moveDir.z * moveSpeed;
    const accel = this.isGrounded ? 15 : 6;
    this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, targetVelX, accel, dt);
    this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, targetVelZ, accel, dt);

    // Jump
    if (this.keys['Space'] && this.isGrounded) {
      this.playerVel.y = 8.8;
      this.isGrounded = false;
      soundManager.playJump();
    }

    // Gravity
    this.playerVel.y -= 22 * dt;
    this.playerVel.y = Math.max(-26, this.playerVel.y);

    // If standing on moving platform, add platform delta
    if (this.isGrounded && this.currentStandingPlatform) {
      this.playerPos.add(this.platformDelta);
    }

    // Apply Velocity
    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.y += this.playerVel.y * dt;
    this.playerPos.z += this.playerVel.z * dt;

    // Platform Collisions
    this.isGrounded = false;
    this.currentStandingPlatform = null;
    const footY = this.playerPos.y;

    for (const p of this.platformMeshes) {
      const minX = p.mesh.position.x - p.def.width / 2;
      const maxX = p.mesh.position.x + p.def.width / 2;
      const minZ = p.mesh.position.z - p.def.depth / 2;
      const maxZ = p.mesh.position.z + p.def.depth / 2;
      const topY = p.mesh.position.y + p.def.height / 2;

      // Check horizontal bounds with player radius
      if (
        this.playerPos.x >= minX - this.playerRadius * 0.5 &&
        this.playerPos.x <= maxX + this.playerRadius * 0.5 &&
        this.playerPos.z >= minZ - this.playerRadius * 0.5 &&
        this.playerPos.z <= maxZ + this.playerRadius * 0.5
      ) {
        // Landing on top surface
        if (footY >= topY - 0.4 && footY <= topY + 0.35 && this.playerVel.y <= 0) {
          this.playerPos.y = topY;
          this.playerVel.y = 0;
          this.isGrounded = true;
          this.currentStandingPlatform = p;
          break;
        }
      }
    }

    // Check Lava Fall (y < -5)
    if (this.playerPos.y < -5.5) {
      this.handlePlayerFall();
      return;
    }

    // Check Goal Platform reach
    const distToGoal = _v1.set(this.playerPos.x, this.playerPos.y, this.playerPos.z).distanceTo(
      _v2.set(config.goalPos[0], config.goalPos[1], config.goalPos[2])
    );
    if (distToGoal < 3.2 && this.isGrounded) {
      this.handleLevelComplete();
      return;
    }

    // Animate Player mesh (visible in third person)
    this.playerMeshGroup.position.copy(this.playerPos);
    if (this.cameraView === 'third') {
      const isMoving = forward !== 0 || strafe !== 0;
      const animTime = performance.now() * 0.008;
      const legSwing = isMoving ? Math.sin(animTime) * 0.5 : 0;
      this.playerAnimParts.leftLeg.rotation.x = legSwing;
      this.playerAnimParts.rightLeg.rotation.x = -legSwing;
      this.playerAnimParts.leftArm.rotation.x = -legSwing;
      this.playerAnimParts.rightArm.rotation.x = legSwing;
    }
  }

  private updateMovingPlatforms(time: number, dt: number) {
    this.platformDelta.set(0, 0, 0);

    for (const p of this.platformMeshes) {
      const def = p.def;
      if (def.type === 'static') continue;

      const prevY = p.mesh.position.y;
      const prevX = p.mesh.position.x;
      const prevZ = p.mesh.position.z;

      const range = def.moveRange || 3;
      const speed = def.moveSpeed || 2;
      const offset = (def.moveOffset || 0) + time * speed;
      const displacement = Math.sin(offset) * (range * 0.5);

      if (def.type === 'moving_x') {
        p.mesh.position.x = p.initialPos.x + displacement;
      } else if (def.type === 'moving_y') {
        p.mesh.position.y = p.initialPos.y + displacement;
      } else if (def.type === 'moving_z') {
        p.mesh.position.z = p.initialPos.z + displacement;
      }

      if (this.currentStandingPlatform === p) {
        this.platformDelta.set(
          p.mesh.position.x - prevX,
          p.mesh.position.y - prevY,
          p.mesh.position.z - prevZ
        );
      }
    }
  }

  private updateOmarAI(dt: number) {
    const config = LEVELS[this.currentLevelIndex];
    const distToPlayer = this.omarPos.distanceTo(this.playerPos);

    // Stun state handling: If stunned, Omar staggers with glitching yellow optics and cannot move/chase
    if (this.omarStunnedTimer > 0) {
      this.omarStunnedTimer = Math.max(0, this.omarStunnedTimer - dt);
      this.playerState.omarStunTime = this.omarStunnedTimer;
      this.omarGroup.position.copy(this.omarPos);
      this.omarGroup.rotation.y += Math.sin(performance.now() * 0.04) * 0.08;
      this.omarParts.spotlight.color.setHex(0xffdd00);
      this.omarParts.spotlight.intensity = 3.0;
      this.callbacks.onOmarProximity(distToPlayer, false);
      return;
    }
    this.playerState.omarStunTime = 0;

    // Omar awareness logic: If within 18 units, Omar locks on and hunts the player!
    this.omarIsHunting = distToPlayer < 18;
    this.callbacks.onOmarProximity(distToPlayer, this.omarIsHunting);

    let targetX = this.playerPos.x;
    let targetZ = this.playerPos.z;

    if (!this.omarIsHunting) {
      // Omar patrols around his spawn / level route
      const t = performance.now() * 0.001;
      targetX = config.omarSpawnPos[0] + Math.sin(t * 1.5) * 6;
      targetZ = config.omarSpawnPos[2] + Math.cos(t * 1.5) * 8;
    }

    _v1.set(targetX - this.omarPos.x, 0, targetZ - this.omarPos.z);
    const dist = _v1.length();

    if (dist > 0.4) {
      _v1.normalize();
      const currentSpeed = this.omarIsHunting ? config.omarSpeed * 1.25 : config.omarSpeed * 0.8;
      this.omarPos.x += _v1.x * currentSpeed * dt;
      this.omarPos.z += _v1.z * currentSpeed * dt;

      // Rotate Omar towards target
      const angle = Math.atan2(_v1.x, _v1.z);
      this.omarGroup.rotation.y = THREE.MathUtils.damp(this.omarGroup.rotation.y, angle, 10, dt);

      // Animate Omar walk cycle
      const walkCycle = performance.now() * 0.009 * currentSpeed;
      this.omarParts.leftLeg.rotation.x = Math.sin(walkCycle) * 0.5;
      this.omarParts.rightLeg.rotation.x = -Math.sin(walkCycle) * 0.5;
      this.omarParts.leftArm.rotation.x = -Math.sin(walkCycle) * 0.45;
      this.omarParts.rightArm.rotation.x = Math.sin(walkCycle) * 0.45;
    }

    // Keep Omar grounded near platforms
    this.omarPos.y = this.playerPos.y > 0 ? this.playerPos.y : config.omarSpawnPos[1];
    this.omarGroup.position.copy(this.omarPos);

    // Omar Searchlight intensity and color switch when hunting
    if (this.omarIsHunting) {
      this.omarParts.spotlight.color.setHex(0xff0022);
      this.omarParts.spotlight.intensity = 6.5;
    } else {
      this.omarParts.spotlight.color.setHex(0xff5511);
      this.omarParts.spotlight.intensity = 3.5;
    }

    // Omar Catch / Attack logic
    if (distToPlayer < 1.6) {
      this.damagePlayer(1, 'omar');
      // Knockback player away from Omar
      this.playerVel.x += _v1.x * 6;
      this.playerVel.z += _v1.z * 6;
      this.playerVel.y = 4;
      this.callbacks.onNotification('AGENT OMAR STRUCK YOU! RUN!');
    }
  }

  private updateMobs(dt: number) {
    const now = performance.now();

    for (const mob of this.mobs) {
      const mobPos = mob.mesh.position;
      const distToPlayer = mobPos.distanceTo(this.playerPos);

      // State transition: patrol vs chase
      if (distToPlayer < 14) {
        mob.alertState = 'chase';
      } else {
        mob.alertState = 'patrol';
      }

      let tx = mob.patrolCenter[0];
      let tz = mob.patrolCenter[2];

      if (mob.alertState === 'chase') {
        tx = this.playerPos.x;
        tz = this.playerPos.z;
      } else {
        const angle = now * 0.001 * mob.speed;
        tx = mob.patrolCenter[0] + Math.cos(angle) * mob.patrolRadius;
        tz = mob.patrolCenter[2] + Math.sin(angle) * mob.patrolRadius;
      }

      _v1.set(tx - mobPos.x, 0, tz - mobPos.z);
      if (_v1.length() > 0.3) {
        _v1.normalize();
        mobPos.x += _v1.x * mob.speed * dt;
        mobPos.z += _v1.z * mob.speed * dt;
        mob.mesh.rotation.y = Math.atan2(_v1.x, _v1.z);
      }

      // Float specter or adjust Y
      if (mob.type === 'specter') {
        mobPos.y = 2.2 + Math.sin(now * 0.004) * 0.4;
      }

      // Attack if close
      if (distToPlayer < mob.attackRange && now - mob.lastAttackTime > 1500) {
        mob.lastAttackTime = now;
        soundManager.playMobScreech();
        this.damagePlayer(mob.damage, mob.type);
        this.callbacks.onNotification(`ATTACKED BY ${mob.type.toUpperCase()}!`);
      }
    }

    // Boss Omar AI
    if (this.bossData) {
      const bossPos = this.bossData.group.position;
      const distToBoss = bossPos.distanceTo(this.playerPos);

      // Rotate boss towards player
      _v1.set(this.playerPos.x - bossPos.x, 0, this.playerPos.z - bossPos.z).normalize();
      this.bossData.group.rotation.y = Math.atan2(_v1.x, _v1.z);

      // Boss slow menacing march
      if (distToBoss > 4.5) {
        bossPos.x += _v1.x * 2.2 * dt;
        bossPos.z += _v1.z * 2.2 * dt;
      }

      // Boss flame crown & core animation
      this.bossData.flameCrown.rotation.y += 1.5 * dt;
      const corePulse = 1.0 + Math.sin(now * 0.008) * 0.25;
      this.bossData.coreGlow.scale.set(corePulse, corePulse, corePulse);

      // Boss ground slam attack
      if (distToBoss < 5.5) {
        this.damagePlayer(1, 'boss');
        this.callbacks.onNotification('TITAN OMAR GROUND SLAM! LEAP AWAY!');
      }
    }
  }

  private updateParticles(dt: number) {
    // Hit particles burst update
    let hasActive = false;
    for (let i = 0; i < this.MAX_BURST_PARTICLES; i++) {
      if (this.hitLifetimes[i] > 0) {
        this.hitLifetimes[i] -= dt;
        this.hitPositions[i * 3] += this.hitVelocities[i * 3] * dt;
        this.hitPositions[i * 3 + 1] += this.hitVelocities[i * 3 + 1] * dt;
        this.hitPositions[i * 3 + 2] += this.hitVelocities[i * 3 + 2] * dt;
        this.hitVelocities[i * 3 + 1] -= 9.8 * dt; // gravity

        if (this.hitLifetimes[i] <= 0) {
          this.hitPositions[i * 3 + 1] = -999;
        }
        hasActive = true;
      }
    }
    if (hasActive) {
      this.hitParticleGeo.attributes.position.needsUpdate = true;
    }

    // Ambient Ash drifting
    if (this.ashParticles) {
      const pos = this.ashParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 1.2 * dt;
        if (pos[i + 1] < -6) {
          pos[i + 1] = 25;
        }
      }
      this.ashParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Braziers flame flicker
    const t = performance.now() * 0.008;
    this.braziers.forEach((b, idx) => {
      const scale = 0.9 + Math.sin(t + idx) * 0.2;
      b.flame.scale.set(scale, scale * 1.15, scale);
      b.light.intensity = 2.0 + Math.sin(t * 1.5 + idx * 2) * 0.6;
    });

    // Exit portal rotation
    if (this.exitPortalMesh) {
      this.exitPortalMesh.children.forEach((c) => {
        if (c instanceof THREE.Mesh && c.material && 'wireframe' in c.material && (c.material as any).wireframe) {
          c.rotation.z += 1.8 * dt;
        }
      });
    }
  }

  private updateCamera(dt: number) {
    // Screen shake decay
    let shakeX = 0;
    let shakeY = 0;
    let shakeZ = 0;
    if (this.screenShakeTrauma > 0) {
      this.screenShakeTrauma = Math.max(0, this.screenShakeTrauma - 1.8 * dt);
      const shakeAmt = this.screenShakeTrauma * this.screenShakeTrauma * 0.35;
      shakeX = (Math.random() - 0.5) * shakeAmt;
      shakeY = (Math.random() - 0.5) * shakeAmt;
      shakeZ = (Math.random() - 0.5) * shakeAmt;
    }

    if (this.cameraView === 'first') {
      // First person view: Camera sits directly at head level
      this.camera.position.set(
        this.playerPos.x + shakeX,
        this.playerPos.y + 1.65 + shakeY,
        this.playerPos.z + shakeZ
      );

      // Camera orientation from pitch and yaw
      const lookDist = 10;
      const targetX = this.camera.position.x - Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * lookDist;
      const targetY = this.camera.position.y + Math.sin(this.cameraPitch) * lookDist;
      const targetZ = this.camera.position.z - Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * lookDist;

      this.camera.lookAt(targetX, targetY, targetZ);
    } else {
      // Third person view: Camera smoothly tracks behind player
      const dist = 4.2;
      const height = 2.0;

      const idealCamX = this.playerPos.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * dist;
      const idealCamY = this.playerPos.y + height + Math.sin(this.cameraPitch) * dist * 0.5;
      const idealCamZ = this.playerPos.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * dist;

      // Smooth camera position damping
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, idealCamX + shakeX, 15, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, idealCamY + shakeY, 15, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, idealCamZ + shakeZ, 15, dt);

      _v1.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
      this.camera.lookAt(_v1);
    }
  }

  private startLoop() {
    const animate = () => {
      if (this.isDestroyed) return;
      this.animFrameId = requestAnimationFrame(animate);

      const dt = Math.min(this.clock.getDelta(), 0.08);

      if (!this.isPaused) {
        if (this.invincibleTimer > 0) {
          this.invincibleTimer -= dt;
        }

        const elapsed = this.clock.getElapsedTime();
        this.updateMovingPlatforms(elapsed, dt);
        this.updatePlayerPhysics(dt);
        this.updateWeapon(dt);
        this.updateOmarAI(dt);
        this.updateMobs(dt);
        this.updateParticles(dt);
        this.updateCamera(dt);
      }

      this.renderer.render(this.scene, this.camera);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    soundManager.stopAmbient();

    try {
      this.renderer.dispose();
      this.scene.clear();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    } catch {}
  }
}
