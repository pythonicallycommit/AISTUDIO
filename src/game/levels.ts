import { LevelConfig, PlatformDef } from '../types/game';

/**
 * Procedural Level Configurations for Escape Omar.
 * Each level offers varied parkour challenges, moving platforms, hazards,
 * hellish decorations (skulls, dead bodies, braziers), and agent Omar patrols.
 */

export const LEVELS: LevelConfig[] = [
  // LEVEL 1: The Dungeon Maw
  {
    levelNumber: 1,
    name: 'The Dungeon Maw',
    targetScore: 20,
    startPos: [0, 1.2, 0],
    goalPos: [0, 1.2, -42],
    omarSpawnPos: [0, 1.2, -30],
    omarSpeed: 2.2,
    ambientColor: 0x240808,
    fogDensity: 0.02,
    platforms: [
      // Starting Safe Sanctuary
      { x: 0, y: 0, z: 0, width: 6, height: 1.5, depth: 6, type: 'static', hasFireBrazier: true },
      // Stepping platforms
      { x: 0, y: 0.2, z: -7, width: 4, height: 1.5, depth: 3, type: 'static', hasSkulls: true },
      { x: 2.5, y: 0.5, z: -13, width: 3, height: 1.5, depth: 3, type: 'static' },
      { x: -2.5, y: 0.8, z: -19, width: 3, height: 1.5, depth: 3, type: 'static', hasDeadBody: true },
      { x: 0, y: 1.0, z: -25, width: 4, height: 1.5, depth: 3, type: 'moving_x', moveRange: 3.5, moveSpeed: 1.5 },
      { x: 0, y: 1.2, z: -33, width: 3.5, height: 1.5, depth: 3.5, type: 'static', hasFireBrazier: true, hasSkulls: true },
      // Goal Platform
      { x: 0, y: 1.2, z: -42, width: 7, height: 1.5, depth: 7, type: 'static', hasFireBrazier: true },
    ],
  },

  // LEVEL 2: The Brimstone Chasm
  {
    levelNumber: 2,
    name: 'The Brimstone Chasm',
    targetScore: 40,
    startPos: [0, 1.2, 0],
    goalPos: [0, 1.5, -50],
    omarSpawnPos: [3, 1.2, -36],
    omarSpeed: 2.6,
    ambientColor: 0x2a0505,
    fogDensity: 0.022,
    platforms: [
      { x: 0, y: 0, z: 0, width: 5, height: 1.5, depth: 5, type: 'static', hasFireBrazier: true },
      { x: -3, y: 0.3, z: -7, width: 3, height: 1.5, depth: 3, type: 'static', hasDeadBody: true },
      { x: 3, y: 0.6, z: -14, width: 3, height: 1.5, depth: 3, type: 'moving_x', moveRange: 4, moveSpeed: 2.0 },
      { x: 0, y: 0.8, z: -21, width: 2.8, height: 1.5, depth: 2.8, type: 'static', hasSkulls: true },
      { x: -2.5, y: 1.0, z: -28, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_z', moveRange: 3, moveSpeed: 1.8 },
      { x: 2.5, y: 1.2, z: -35, width: 3.5, height: 1.5, depth: 3.5, type: 'static', hasFireBrazier: true },
      { x: 0, y: 1.4, z: -42, width: 2.8, height: 1.5, depth: 2.8, type: 'moving_x', moveRange: 3.5, moveSpeed: 2.2 },
      { x: 0, y: 1.5, z: -50, width: 6, height: 1.5, depth: 6, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },

  // LEVEL 3: The Hanging Catacombs
  {
    levelNumber: 3,
    name: 'The Hanging Catacombs',
    targetScore: 60,
    startPos: [0, 1.2, 0],
    goalPos: [0, 2.0, -58],
    omarSpawnPos: [0, 1.5, -42],
    omarSpeed: 3.0,
    ambientColor: 0x300606,
    fogDensity: 0.024,
    platforms: [
      { x: 0, y: 0, z: 0, width: 5, height: 1.5, depth: 5, type: 'static' },
      { x: 0, y: 0.4, z: -8, width: 2.6, height: 1.5, depth: 2.6, type: 'moving_y', moveRange: 2.0, moveSpeed: 1.5 },
      { x: 4, y: 0.8, z: -15, width: 2.8, height: 1.5, depth: 2.8, type: 'static', hasSkulls: true },
      { x: 0, y: 1.0, z: -22, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_x', moveRange: 4.5, moveSpeed: 2.4 },
      { x: -4, y: 1.3, z: -29, width: 3, height: 1.5, depth: 3, type: 'static', hasDeadBody: true },
      { x: 0, y: 1.5, z: -36, width: 2.6, height: 1.5, depth: 2.6, type: 'moving_y', moveRange: 2.5, moveSpeed: 1.8 },
      { x: 3, y: 1.7, z: -43, width: 3, height: 1.5, depth: 3, type: 'static', hasFireBrazier: true },
      { x: -2, y: 1.9, z: -50, width: 2.6, height: 1.5, depth: 2.6, type: 'moving_x', moveRange: 3.5, moveSpeed: 2.5 },
      { x: 0, y: 2.0, z: -58, width: 6.5, height: 1.5, depth: 6.5, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },

  // LEVEL 4: The Infernal Foundry (Mob 1: Imp Spawns)
  {
    levelNumber: 4,
    name: 'The Infernal Foundry',
    targetScore: 100,
    startPos: [0, 1.2, 0],
    goalPos: [0, 2.2, -66],
    omarSpawnPos: [-2, 1.8, -48],
    omarSpeed: 3.3,
    ambientColor: 0x380a04,
    fogDensity: 0.025,
    platforms: [
      { x: 0, y: 0, z: 0, width: 5, height: 1.5, depth: 5, type: 'static', hasFireBrazier: true },
      { x: -3.5, y: 0.4, z: -8, width: 2.5, height: 1.5, depth: 2.5, type: 'static', hasSkulls: true },
      { x: 0, y: 0.8, z: -15, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_x', moveRange: 4, moveSpeed: 2.2 },
      { x: 3.5, y: 1.1, z: -22, width: 2.8, height: 1.5, depth: 2.8, type: 'static', hasDeadBody: true },
      { x: 0, y: 1.4, z: -30, width: 2.6, height: 1.5, depth: 2.6, type: 'moving_z', moveRange: 3.5, moveSpeed: 2.0 },
      { x: -3.5, y: 1.6, z: -38, width: 3, height: 1.5, depth: 3, type: 'static', hasFireBrazier: true },
      { x: 0, y: 1.8, z: -46, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_y', moveRange: 2.5, moveSpeed: 2.0 },
      { x: 3.5, y: 2.0, z: -54, width: 2.8, height: 1.5, depth: 2.8, type: 'moving_x', moveRange: 4.2, moveSpeed: 2.5 },
      { x: 0, y: 2.2, z: -66, width: 7, height: 1.5, depth: 7, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },

  // LEVEL 5: The Molten Gauntlet (Mob 2: Infernal Guard Spawns)
  {
    levelNumber: 5,
    name: 'The Molten Gauntlet',
    targetScore: 200,
    startPos: [0, 1.2, 0],
    goalPos: [0, 2.5, -74],
    omarSpawnPos: [2, 2.0, -56],
    omarSpeed: 3.6,
    ambientColor: 0x400c06,
    fogDensity: 0.026,
    platforms: [
      { x: 0, y: 0, z: 0, width: 5, height: 1.5, depth: 5, type: 'static' },
      { x: 0, y: 0.5, z: -8, width: 2.4, height: 1.5, depth: 2.4, type: 'moving_x', moveRange: 4.5, moveSpeed: 2.6 },
      { x: -4, y: 0.9, z: -16, width: 2.6, height: 1.5, depth: 2.6, type: 'static', hasDeadBody: true },
      { x: 0, y: 1.2, z: -24, width: 2.4, height: 1.5, depth: 2.4, type: 'moving_y', moveRange: 3.0, moveSpeed: 2.2 },
      { x: 4, y: 1.5, z: -32, width: 2.8, height: 1.5, depth: 2.8, type: 'static', hasFireBrazier: true },
      { x: 0, y: 1.8, z: -40, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_x', moveRange: 5.0, moveSpeed: 2.8 },
      { x: -4, y: 2.0, z: -48, width: 2.8, height: 1.5, depth: 2.8, type: 'static', hasSkulls: true },
      { x: 0, y: 2.2, z: -57, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_z', moveRange: 4.0, moveSpeed: 2.5 },
      { x: 3, y: 2.4, z: -65, width: 2.6, height: 1.5, depth: 2.6, type: 'static', hasFireBrazier: true },
      { x: 0, y: 2.5, z: -74, width: 7, height: 1.5, depth: 7, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },

  // LEVEL 6: The Shadow Crypts (Mob 3: Shadow Specter Spawns)
  {
    levelNumber: 6,
    name: 'The Shadow Crypts',
    targetScore: 300,
    startPos: [0, 1.2, 0],
    goalPos: [0, 2.8, -82],
    omarSpawnPos: [0, 2.2, -64],
    omarSpeed: 3.8,
    ambientColor: 0x220516,
    fogDensity: 0.028,
    platforms: [
      { x: 0, y: 0, z: 0, width: 5, height: 1.5, depth: 5, type: 'static', hasFireBrazier: true },
      { x: 3, y: 0.6, z: -9, width: 2.4, height: 1.5, depth: 2.4, type: 'static', hasSkulls: true },
      { x: -3, y: 1.0, z: -17, width: 2.4, height: 1.5, depth: 2.4, type: 'moving_x', moveRange: 4.5, moveSpeed: 2.8 },
      { x: 0, y: 1.4, z: -26, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_y', moveRange: 3.2, moveSpeed: 2.4 },
      { x: 4, y: 1.8, z: -35, width: 2.6, height: 1.5, depth: 2.6, type: 'static', hasDeadBody: true },
      { x: -4, y: 2.0, z: -44, width: 2.4, height: 1.5, depth: 2.4, type: 'moving_z', moveRange: 4.0, moveSpeed: 2.6 },
      { x: 0, y: 2.3, z: -53, width: 2.5, height: 1.5, depth: 2.5, type: 'moving_x', moveRange: 5.0, moveSpeed: 3.0 },
      { x: 3.5, y: 2.5, z: -62, width: 2.6, height: 1.5, depth: 2.6, type: 'static', hasFireBrazier: true },
      { x: -2, y: 2.7, z: -71, width: 2.4, height: 1.5, depth: 2.4, type: 'moving_y', moveRange: 2.8, moveSpeed: 2.5 },
      { x: 0, y: 2.8, z: -82, width: 7, height: 1.5, depth: 7, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },

  // LEVEL 7: Omar's Iron Bastion (Mob 4: Enforcer Spawns)
  {
    levelNumber: 7,
    name: "Omar's Iron Bastion",
    targetScore: 400,
    startPos: [0, 1.2, 0],
    goalPos: [0, 3.0, -90],
    omarSpawnPos: [0, 2.4, -70],
    omarSpeed: 4.2,
    ambientColor: 0x330005,
    fogDensity: 0.03,
    platforms: [
      { x: 0, y: 0, z: 0, width: 5, height: 1.5, depth: 5, type: 'static', hasFireBrazier: true },
      { x: 0, y: 0.6, z: -9, width: 2.2, height: 1.5, depth: 2.2, type: 'moving_x', moveRange: 5.0, moveSpeed: 3.2 },
      { x: -3.5, y: 1.1, z: -18, width: 2.4, height: 1.5, depth: 2.4, type: 'static', hasDeadBody: true },
      { x: 3.5, y: 1.5, z: -27, width: 2.4, height: 1.5, depth: 2.4, type: 'moving_y', moveRange: 3.5, moveSpeed: 2.8 },
      { x: 0, y: 1.9, z: -36, width: 2.2, height: 1.5, depth: 2.2, type: 'moving_x', moveRange: 5.2, moveSpeed: 3.4 },
      { x: -4, y: 2.2, z: -46, width: 2.6, height: 1.5, depth: 2.6, type: 'static', hasFireBrazier: true },
      { x: 0, y: 2.5, z: -56, width: 2.2, height: 1.5, depth: 2.2, type: 'moving_z', moveRange: 4.5, moveSpeed: 3.0 },
      { x: 4, y: 2.7, z: -66, width: 2.6, height: 1.5, depth: 2.6, type: 'static', hasSkulls: true },
      { x: 0, y: 2.9, z: -77, width: 2.2, height: 1.5, depth: 2.2, type: 'moving_x', moveRange: 5.5, moveSpeed: 3.5 },
      { x: 0, y: 3.0, z: -90, width: 8, height: 1.5, depth: 8, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },

  // LEVEL 8: The Core of Torment / BOSS ARENA (Score 500: MEGA OMAR BOSS!)
  {
    levelNumber: 8,
    name: 'The Core of Torment - BOSS ARENA',
    targetScore: 500,
    startPos: [0, 1.2, 0],
    goalPos: [0, 3.5, -96],
    omarSpawnPos: [0, 1.5, -55], // Where Mega Boss Omar reigns
    omarSpeed: 4.5,
    ambientColor: 0x480000,
    fogDensity: 0.025,
    platforms: [
      { x: 0, y: 0, z: 0, width: 6, height: 1.5, depth: 6, type: 'static', hasFireBrazier: true },
      { x: -4, y: 0.8, z: -10, width: 3.0, height: 1.5, depth: 3.0, type: 'static', hasSkulls: true },
      { x: 4, y: 1.2, z: -19, width: 3.0, height: 1.5, depth: 3.0, type: 'moving_x', moveRange: 5, moveSpeed: 3.2 },
      { x: 0, y: 1.6, z: -29, width: 3.2, height: 1.5, depth: 3.2, type: 'static', hasFireBrazier: true },
      // The Massive Grand Colosseum Arena where Mega Boss Omar battles
      { x: 0, y: 1.8, z: -55, width: 24, height: 2.0, depth: 26, type: 'static', hasFireBrazier: true, hasSkulls: true, hasDeadBody: true },
      // Elevated Pillar bridges to escape
      { x: -6, y: 2.6, z: -74, width: 3.2, height: 1.5, depth: 3.2, type: 'moving_y', moveRange: 2.5, moveSpeed: 2.5 },
      { x: 6, y: 3.0, z: -84, width: 3.2, height: 1.5, depth: 3.2, type: 'moving_x', moveRange: 4.5, moveSpeed: 3.0 },
      // Final Escape Gateway
      { x: 0, y: 3.5, z: -96, width: 10, height: 2.0, depth: 10, type: 'static', hasFireBrazier: true, hasSkulls: true },
    ],
  },
];
