export type GameScreen = 'start' | 'playing' | 'paused' | 'gameover' | 'victory';

export type CameraView = 'first' | 'third';

export type VictoryReward = 'money' | 'golden_heart' | null;

export interface PlayerState {
  hearts: number;
  maxHearts: number;
  hasGoldenHeart: boolean;
  score: number;
  level: number;
  fallsInCurrentLevel: number;
  totalFalls: number;
  hasMadeMistakeInLevel: boolean;
  sprintStamina: number;
  isSprinting: boolean;
  money: number;
  highScore: number;
  omarStunTime: number;
  bossHealth: number | null;
}

export interface PlatformDef {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  type: 'static' | 'moving_x' | 'moving_y' | 'moving_z' | 'crumbling' | 'lava_hazard';
  moveRange?: number;
  moveSpeed?: number;
  moveOffset?: number;
  hasFireBrazier?: boolean;
  hasSkulls?: boolean;
  hasDeadBody?: boolean;
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  targetScore: number;
  platforms: PlatformDef[];
  startPos: [number, number, number];
  goalPos: [number, number, number];
  omarSpawnPos: [number, number, number];
  omarSpeed: number;
  ambientColor: number;
  fogDensity: number;
}

export interface MobEntity {
  id: string;
  type: 'imp' | 'guard' | 'specter' | 'boss';
  mesh: any;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  attackRange: number;
  damage: number;
  patrolCenter: [number, number, number];
  patrolRadius: number;
  lastAttackTime: number;
  isBoss?: boolean;
  alertState: 'patrol' | 'chase' | 'attack';
}
