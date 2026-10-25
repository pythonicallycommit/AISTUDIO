import * as THREE from 'three';
import {
  createLavaTexture,
  createObsidianTexture,
  createHellPrisonBricksTexture,
  createBoneTexture,
  createOmarFabricTexture,
} from '../utils/textures';

// Cached shared materials & textures to prevent duplicate allocations
let lavaTex: THREE.CanvasTexture | null = null;
let obsidianTex: THREE.CanvasTexture | null = null;
let brickTex: THREE.CanvasTexture | null = null;
let boneTex: THREE.CanvasTexture | null = null;
let suitTex: THREE.CanvasTexture | null = null;

function getSharedTextures() {
  if (!lavaTex) lavaTex = createLavaTexture();
  if (!obsidianTex) obsidianTex = createObsidianTexture();
  if (!brickTex) brickTex = createHellPrisonBricksTexture();
  if (!boneTex) boneTex = createBoneTexture();
  if (!suitTex) suitTex = createOmarFabricTexture();
  return { lavaTex, obsidianTex, brickTex, boneTex, suitTex };
}

/**
 * Creates a detailed 3D Skull with jaw, eye sockets, and aged bone material.
 * Composite 5-part model.
 */
export function createSkullMesh(scale = 1.0): THREE.Group {
  const { boneTex } = getSharedTextures();
  const skullGroup = new THREE.Group();

  const boneMat = new THREE.MeshStandardMaterial({
    map: boneTex,
    color: 0xded8c6,
    roughness: 0.8,
    metalness: 0.05,
  });

  const darkMat = new THREE.MeshBasicMaterial({ color: 0x0a0505 });

  // 1. Cranium (Braincase)
  const craniumGeo = new THREE.SphereGeometry(0.35 * scale, 12, 10);
  craniumGeo.scale(1, 1.15, 1.1);
  const cranium = new THREE.Mesh(craniumGeo, boneMat);
  cranium.position.y = 0.45 * scale;
  skullGroup.add(cranium);

  // 2. Upper Jaw & Nasal cavity
  const jawGeo = new THREE.BoxGeometry(0.38 * scale, 0.25 * scale, 0.3 * scale);
  const upperJaw = new THREE.Mesh(jawGeo, boneMat);
  upperJaw.position.set(0, 0.22 * scale, 0.2 * scale);
  skullGroup.add(upperJaw);

  // 3. Lower Mandible
  const mandibleGeo = new THREE.BoxGeometry(0.32 * scale, 0.12 * scale, 0.24 * scale);
  const mandible = new THREE.Mesh(mandibleGeo, boneMat);
  mandible.position.set(0, 0.08 * scale, 0.18 * scale);
  mandible.rotation.x = 0.15; // slightly agape
  skullGroup.add(mandible);

  // 4 & 5. Deep Hollow Eye Sockets
  const eyeGeo = new THREE.SphereGeometry(0.09 * scale, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, darkMat);
  leftEye.position.set(-0.12 * scale, 0.36 * scale, 0.34 * scale);
  skullGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, darkMat);
  rightEye.position.set(0.12 * scale, 0.36 * scale, 0.34 * scale);
  skullGroup.add(rightEye);

  skullGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return skullGroup;
}

/**
 * Creates a Dead Body / Chained Skeleton on the floor or platform.
 * Composite 8-part model.
 */
export function createDeadBodyMesh(scale = 1.0): THREE.Group {
  const { boneTex } = getSharedTextures();
  const bodyGroup = new THREE.Group();

  const boneMat = new THREE.MeshStandardMaterial({
    map: boneTex,
    color: 0xc8baa0,
    roughness: 0.85,
    metalness: 0.1,
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x242426,
    roughness: 0.5,
    metalness: 0.85,
  });

  // Skull
  const skull = createSkullMesh(0.7 * scale);
  skull.position.set(0, 0.18 * scale, -0.6 * scale);
  skull.rotation.set(-0.2, 0.3, 0.4);
  bodyGroup.add(skull);

  // Rib cage / Thorax
  const ribGeo = new THREE.CylinderGeometry(0.22 * scale, 0.16 * scale, 0.55 * scale, 8);
  const ribCage = new THREE.Mesh(ribGeo, boneMat);
  ribCage.rotation.x = Math.PI / 2;
  ribCage.position.set(0, 0.14 * scale, -0.15 * scale);
  bodyGroup.add(ribCage);

  // Spine & Pelvis
  const pelvisGeo = new THREE.BoxGeometry(0.35 * scale, 0.12 * scale, 0.22 * scale);
  const pelvis = new THREE.Mesh(pelvisGeo, boneMat);
  pelvis.position.set(0, 0.1 * scale, 0.22 * scale);
  bodyGroup.add(pelvis);

  // Legs splayed
  const limbGeo = new THREE.CylinderGeometry(0.05 * scale, 0.04 * scale, 0.7 * scale, 6);
  const leftLeg = new THREE.Mesh(limbGeo, boneMat);
  leftLeg.rotation.set(Math.PI / 2.2, 0, -0.3);
  leftLeg.position.set(-0.25 * scale, 0.08 * scale, 0.6 * scale);
  bodyGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(limbGeo, boneMat);
  rightLeg.rotation.set(Math.PI / 2.1, 0, 0.35);
  rightLeg.position.set(0.25 * scale, 0.08 * scale, 0.6 * scale);
  bodyGroup.add(rightLeg);

  // Arm reaching out
  const armGeo = new THREE.CylinderGeometry(0.04 * scale, 0.03 * scale, 0.6 * scale, 6);
  const arm = new THREE.Mesh(armGeo, boneMat);
  arm.rotation.set(0.1, 0.4, Math.PI / 2);
  arm.position.set(0.4 * scale, 0.08 * scale, -0.2 * scale);
  bodyGroup.add(arm);

  // Iron Shackle & Chain links
  const shackleGeo = new THREE.TorusGeometry(0.08 * scale, 0.025 * scale, 6, 12);
  const shackle = new THREE.Mesh(shackleGeo, ironMat);
  shackle.position.set(0.65 * scale, 0.08 * scale, -0.2 * scale);
  shackle.rotation.x = Math.PI / 2;
  bodyGroup.add(shackle);

  return bodyGroup;
}

/**
 * Creates a Hell Fire Brazier with metal stand, burning coals, and glowing flame.
 */
export function createFireBrazier(): {
  mesh: THREE.Group;
  light: THREE.PointLight;
  flameMesh: THREE.Mesh;
} {
  const brazierGroup = new THREE.Group();

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1f1f22,
    roughness: 0.6,
    metalness: 0.9,
  });

  // Stand base
  const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 8);
  const base = new THREE.Mesh(baseGeo, ironMat);
  base.position.y = 0.05;
  brazierGroup.add(base);

  // Pillar
  const pillarGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.7, 8);
  const pillar = new THREE.Mesh(pillarGeo, ironMat);
  pillar.position.y = 0.45;
  brazierGroup.add(pillar);

  // Bowl
  const bowlGeo = new THREE.CylinderGeometry(0.45, 0.2, 0.3, 8);
  const bowl = new THREE.Mesh(bowlGeo, ironMat);
  bowl.position.y = 0.9;
  brazierGroup.add(bowl);

  // Glowing hot coals
  const coalsMat = new THREE.MeshStandardMaterial({
    color: 0xff3300,
    emissive: 0xff4400,
    emissiveIntensity: 1.2,
    roughness: 0.9,
  });
  const coalsGeo = new THREE.CylinderGeometry(0.4, 0.38, 0.08, 8);
  const coals = new THREE.Mesh(coalsGeo, coalsMat);
  coals.position.y = 1.0;
  brazierGroup.add(coals);

  // Flame cone
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.85,
  });
  const flameGeo = new THREE.ConeGeometry(0.3, 0.7, 7);
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.y = 1.35;
  brazierGroup.add(flameMesh);

  // Point light for flickering hell glow
  const light = new THREE.PointLight(0xff6600, 2.5, 9);
  light.position.y = 1.4;
  brazierGroup.add(light);

  brazierGroup.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  return { mesh: brazierGroup, light, flameMesh };
}

/**
 * Creates Agent Omar 3D Character.
 * Omar is the menacing prison warden: tailored dark enforcer suit, glowing red visor,
 * demonic shoulder guards, and articulated limbs for patrol walking animation.
 */
export function createOmarCharacter(): {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  head: THREE.Group;
  spotlight: THREE.SpotLight;
} {
  const { suitTex } = getSharedTextures();
  const group = new THREE.Group();

  const suitMat = new THREE.MeshStandardMaterial({
    map: suitTex,
    color: 0x202025,
    roughness: 0.65,
    metalness: 0.35,
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.3,
    metalness: 0.9,
  });

  const redVisorMat = new THREE.MeshBasicMaterial({
    color: 0xff0022,
  });

  // 1. Torso / Tactical Enforcer Armor
  const torsoGeo = new THREE.BoxGeometry(0.65, 0.85, 0.45);
  const torso = new THREE.Mesh(torsoGeo, suitMat);
  torso.position.y = 1.35;
  group.add(torso);

  // Chest armor plate with sinister crest
  const chestPlateGeo = new THREE.BoxGeometry(0.55, 0.5, 0.08);
  const chestPlate = new THREE.Mesh(chestPlateGeo, armorMat);
  chestPlate.position.set(0, 1.45, 0.24);
  group.add(chestPlate);

  // Sinister glowing badge
  const badgeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.04);
  const badge = new THREE.Mesh(badgeGeo, redVisorMat);
  badge.position.set(0, 1.48, 0.29);
  group.add(badge);

  // 2. Head Group with Warden Cap & Glowing Red Monocle/Visor
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.95, 0);

  const headGeo = new THREE.BoxGeometry(0.36, 0.38, 0.36);
  const headMesh = new THREE.Mesh(headGeo, suitMat);
  headGroup.add(headMesh);

  // Warden visor / glowing red optics
  const visorGeo = new THREE.BoxGeometry(0.34, 0.1, 0.1);
  const visor = new THREE.Mesh(visorGeo, redVisorMat);
  visor.position.set(0, 0.04, 0.17);
  headGroup.add(visor);

  // Warden peaked cap / horned crest
  const capGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.14, 8);
  const cap = new THREE.Mesh(capGeo, armorMat);
  cap.position.y = 0.22;
  headGroup.add(cap);

  const capPeakGeo = new THREE.BoxGeometry(0.34, 0.04, 0.2);
  const capPeak = new THREE.Mesh(capPeakGeo, armorMat);
  capPeak.position.set(0, 0.18, 0.2);
  capPeak.rotation.x = 0.2;
  headGroup.add(capPeak);

  // Sinister demonic mini-horns on warden cap
  const hornGeo = new THREE.ConeGeometry(0.06, 0.25, 5);
  const hornLeft = new THREE.Mesh(hornGeo, armorMat);
  hornLeft.position.set(-0.16, 0.32, 0);
  hornLeft.rotation.z = -0.3;
  headGroup.add(hornLeft);

  const hornRight = new THREE.Mesh(hornGeo, armorMat);
  hornRight.position.set(0.16, 0.32, 0);
  hornRight.rotation.z = 0.3;
  headGroup.add(hornRight);

  group.add(headGroup);

  // 3. Legs
  const legGeo = new THREE.BoxGeometry(0.22, 0.9, 0.24);
  const leftLeg = new THREE.Mesh(legGeo, suitMat);
  leftLeg.position.set(-0.18, 0.45, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, suitMat);
  rightLeg.position.set(0.18, 0.45, 0);
  group.add(rightLeg);

  // 4. Arms
  const armGeo = new THREE.BoxGeometry(0.18, 0.8, 0.2);
  const leftArm = new THREE.Mesh(armGeo, suitMat);
  leftArm.position.set(-0.44, 1.3, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, suitMat);
  rightArm.position.set(0.44, 1.3, 0);
  group.add(rightArm);

  // Shoulder Pauldrons
  const pauldronGeo = new THREE.BoxGeometry(0.24, 0.18, 0.28);
  const leftPauldron = new THREE.Mesh(pauldronGeo, armorMat);
  leftPauldron.position.set(-0.46, 1.7, 0);
  group.add(leftPauldron);

  const rightPauldron = new THREE.Mesh(pauldronGeo, armorMat);
  rightPauldron.position.set(0.46, 1.7, 0);
  group.add(rightPauldron);

  // Menacing Red Search Spotlight projecting from Omar
  const spotlight = new THREE.SpotLight(0xff1122, 4.0, 18, Math.PI / 5, 0.4, 1.0);
  spotlight.position.set(0, 1.95, 0.2);
  const targetObj = new THREE.Object3D();
  targetObj.position.set(0, 0, 8);
  group.add(targetObj);
  spotlight.target = targetObj;
  group.add(spotlight);

  group.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  return { group, leftLeg, rightLeg, leftArm, rightArm, head: headGroup, spotlight };
}

/**
 * Creates Player 3D Character (visible in Third Person View).
 * Inmate dressed in orange jumpsuit with parkour harness.
 */
export function createPlayerMesh(): {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  head: THREE.Mesh;
} {
  const group = new THREE.Group();

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0xee5511, // Orange inmate suit
    roughness: 0.75,
    metalness: 0.1,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdca888,
    roughness: 0.6,
  });

  const bootsMat = new THREE.MeshStandardMaterial({
    color: 0x1f1f1f,
    roughness: 0.4,
    metalness: 0.5,
  });

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.75, 0.3);
  const torso = new THREE.Mesh(torsoGeo, suitMat);
  torso.position.y = 1.25;
  group.add(torso);

  // Head
  const headGeo = new THREE.SphereGeometry(0.2, 10, 8);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.8;
  group.add(head);

  // Hair / headband
  const hairGeo = new THREE.BoxGeometry(0.38, 0.12, 0.38);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x221814 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 1.95;
  group.add(hair);

  // Legs & Boots
  const legGeo = new THREE.BoxGeometry(0.18, 0.8, 0.18);
  const leftLeg = new THREE.Mesh(legGeo, suitMat);
  leftLeg.position.set(-0.14, 0.45, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, suitMat);
  rightLeg.position.set(0.14, 0.45, 0);
  group.add(rightLeg);

  const bootGeo = new THREE.BoxGeometry(0.2, 0.2, 0.28);
  const leftBoot = new THREE.Mesh(bootGeo, bootsMat);
  leftBoot.position.set(-0.14, 0.1, 0.04);
  group.add(leftBoot);

  const rightBoot = new THREE.Mesh(bootGeo, bootsMat);
  rightBoot.position.set(0.14, 0.1, 0.04);
  group.add(rightBoot);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.15, 0.7, 0.15);
  const leftArm = new THREE.Mesh(armGeo, suitMat);
  leftArm.position.set(-0.35, 1.2, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, suitMat);
  rightArm.position.set(0.35, 1.2, 0);
  group.add(rightArm);

  group.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  return { group, leftLeg, rightLeg, leftArm, rightArm, head };
}

/**
 * Creates Hell Mobs based on level/score (imp, guard, specter).
 */
export function createHellMob(type: 'imp' | 'guard' | 'specter'): THREE.Group {
  const mobGroup = new THREE.Group();

  if (type === 'imp') {
    // Hell Imp: Fast, crouched demon with red horns and spiked back
    const impMat = new THREE.MeshStandardMaterial({
      color: 0x991111,
      roughness: 0.6,
      metalness: 0.2,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const bodyGeo = new THREE.SphereGeometry(0.35, 8, 8);
    bodyGeo.scale(1, 0.8, 1.4);
    const body = new THREE.Mesh(bodyGeo, impMat);
    body.position.y = 0.45;
    mobGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const head = new THREE.Mesh(headGeo, impMat);
    head.position.set(0, 0.65, 0.4);
    mobGroup.add(head);

    // Glowing eyes
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeMat);
    eye1.position.set(-0.08, 0.7, 0.55);
    const eye2 = eye1.clone();
    eye2.position.x = 0.08;
    mobGroup.add(eye1);
    mobGroup.add(eye2);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.06, 0.3, 5);
    const horn1 = new THREE.Mesh(hornGeo, impMat);
    horn1.position.set(-0.12, 0.85, 0.35);
    horn1.rotation.z = -0.4;
    const horn2 = new THREE.Mesh(hornGeo, impMat);
    horn2.position.set(0.12, 0.85, 0.35);
    horn2.rotation.z = 0.4;
    mobGroup.add(horn1);
    mobGroup.add(horn2);
  } else if (type === 'guard') {
    // Infernal Guard: Iron clad brute with spiked shoulders and battle halberd
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x280e0e,
      roughness: 0.4,
      metalness: 0.8,
    });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.5);
    const torso = new THREE.Mesh(torsoGeo, ironMat);
    torso.position.y = 1.3;
    mobGroup.add(torso);

    const helmGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const helm = new THREE.Mesh(helmGeo, ironMat);
    helm.position.y = 2.0;
    mobGroup.add(helm);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.1), glowMat);
    visor.position.set(0, 2.0, 0.22);
    mobGroup.add(visor);

    // Spiked shoulders
    const spikeGeo = new THREE.ConeGeometry(0.1, 0.4, 4);
    const spike1 = new THREE.Mesh(spikeGeo, ironMat);
    spike1.position.set(-0.55, 1.8, 0);
    spike1.rotation.z = -0.5;
    const spike2 = new THREE.Mesh(spikeGeo, ironMat);
    spike2.position.set(0.55, 1.8, 0);
    spike2.rotation.z = 0.5;
    mobGroup.add(spike1);
    mobGroup.add(spike2);
  } else {
    // Specter / Shadow Stalker: Floating horned skull with shadowy smoke shroud
    const skull = createSkullMesh(0.9);
    skull.position.y = 1.2;
    mobGroup.add(skull);

    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x140614,
      transparent: true,
      opacity: 0.75,
      roughness: 0.9,
    });
    const shroudGeo = new THREE.ConeGeometry(0.6, 1.4, 8);
    const shroud = new THREE.Mesh(shroudGeo, shroudMat);
    shroud.position.y = 0.8;
    mobGroup.add(shroud);

    const haloMat = new THREE.MeshBasicMaterial({ color: 0xff0066, wireframe: true });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 16), haloMat);
    halo.position.y = 1.9;
    halo.rotation.x = Math.PI / 2;
    mobGroup.add(halo);
  }

  mobGroup.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  return mobGroup;
}

/**
 * Creates the Big Boss Mob: MEGA OMAR / INFERNAL TITAN.
 * Spawned at score 500!
 * Huge 3.8x scale, flaming horns, massive demonic obsidian armor, blazing core.
 */
export function createBossOmar(): {
  group: THREE.Group;
  coreGlow: THREE.Mesh;
  flameCrown: THREE.Group;
  leftFist: THREE.Mesh;
  rightFist: THREE.Mesh;
} {
  const { obsidianTex } = getSharedTextures();
  const group = new THREE.Group();
  const bossScale = 3.6;

  const titanObsidianMat = new THREE.MeshStandardMaterial({
    map: obsidianTex,
    color: 0x1a0a0a,
    roughness: 0.4,
    metalness: 0.85,
  });

  const magmaMat = new THREE.MeshBasicMaterial({
    color: 0xff3300,
  });

  const fireMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    wireframe: true,
  });

  // Massive Torso
  const torsoGeo = new THREE.BoxGeometry(0.9 * bossScale, 1.2 * bossScale, 0.65 * bossScale);
  const torso = new THREE.Mesh(torsoGeo, titanObsidianMat);
  torso.position.y = 1.4 * bossScale;
  group.add(torso);

  // Blazing Magma Core in chest
  const coreGeo = new THREE.SphereGeometry(0.3 * bossScale, 10, 10);
  const coreGlow = new THREE.Mesh(coreGeo, magmaMat);
  coreGlow.position.set(0, 1.45 * bossScale, 0.3 * bossScale);
  group.add(coreGlow);

  // Massive Head
  const headGeo = new THREE.BoxGeometry(0.55 * bossScale, 0.55 * bossScale, 0.55 * bossScale);
  const head = new THREE.Mesh(headGeo, titanObsidianMat);
  head.position.y = 2.3 * bossScale;
  group.add(head);

  // Blazing Giant Horns
  const hornGeo = new THREE.ConeGeometry(0.12 * bossScale, 0.7 * bossScale, 6);
  const hornL = new THREE.Mesh(hornGeo, titanObsidianMat);
  hornL.position.set(-0.35 * bossScale, 2.7 * bossScale, 0);
  hornL.rotation.z = -0.5;
  group.add(hornL);

  const hornR = new THREE.Mesh(hornGeo, titanObsidianMat);
  hornR.position.set(0.35 * bossScale, 2.7 * bossScale, 0);
  hornR.rotation.z = 0.5;
  group.add(hornR);

  // Crown of Fire above head
  const flameCrown = new THREE.Group();
  flameCrown.position.y = 2.8 * bossScale;
  for (let i = 0; i < 6; i++) {
    const flameGeo = new THREE.ConeGeometry(0.08 * bossScale, 0.4 * bossScale, 4);
    const flame = new THREE.Mesh(flameGeo, fireMat);
    const angle = (i / 6) * Math.PI * 2;
    flame.position.set(Math.cos(angle) * 0.35 * bossScale, 0, Math.sin(angle) * 0.35 * bossScale);
    flameCrown.add(flame);
  }
  group.add(flameCrown);

  // Glowing Eye Visor
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.45 * bossScale, 0.12 * bossScale, 0.1 * bossScale), magmaMat);
  visor.position.set(0, 2.3 * bossScale, 0.28 * bossScale);
  group.add(visor);

  // Massive Fists / Gauntlets
  const fistGeo = new THREE.BoxGeometry(0.38 * bossScale, 0.45 * bossScale, 0.38 * bossScale);
  const leftFist = new THREE.Mesh(fistGeo, titanObsidianMat);
  leftFist.position.set(-0.75 * bossScale, 1.1 * bossScale, 0.3 * bossScale);
  group.add(leftFist);

  const rightFist = new THREE.Mesh(fistGeo, titanObsidianMat);
  rightFist.position.set(0.75 * bossScale, 1.1 * bossScale, 0.3 * bossScale);
  group.add(rightFist);

  // Heavy Spiked Legs
  const legGeo = new THREE.BoxGeometry(0.35 * bossScale, 1.1 * bossScale, 0.35 * bossScale);
  const leftLeg = new THREE.Mesh(legGeo, titanObsidianMat);
  leftLeg.position.set(-0.28 * bossScale, 0.55 * bossScale, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, titanObsidianMat);
  rightLeg.position.set(0.28 * bossScale, 0.55 * bossScale, 0);
  group.add(rightLeg);

  // Boss Ambient Light
  const bossLight = new THREE.PointLight(0xff2200, 5, 25);
  bossLight.position.set(0, 2.0 * bossScale, 0.5 * bossScale);
  group.add(bossLight);

  group.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  return { group, coreGlow, flameCrown, leftFist, rightFist };
}

/**
 * Creates the Exit Portal / Escape Vault Door.
 * Glowing mystical portal flanked by hell pillars and skulls.
 */
export function createExitPortal(): THREE.Group {
  const portalGroup = new THREE.Group();

  const archMat = new THREE.MeshStandardMaterial({
    color: 0x1f1414,
    roughness: 0.5,
    metalness: 0.7,
  });

  const swirlMat = new THREE.MeshBasicMaterial({
    color: 0x22ffaa,
    wireframe: true,
  });

  // Pillars
  const pillarGeo = new THREE.BoxGeometry(0.6, 4.5, 0.6);
  const pillarL = new THREE.Mesh(pillarGeo, archMat);
  pillarL.position.set(-1.8, 2.25, 0);
  portalGroup.add(pillarL);

  const pillarR = new THREE.Mesh(pillarGeo, archMat);
  pillarR.position.set(1.8, 2.25, 0);
  portalGroup.add(pillarR);

  // Top Arch
  const topGeo = new THREE.BoxGeometry(4.4, 0.7, 0.8);
  const topArch = new THREE.Mesh(topGeo, archMat);
  topArch.position.set(0, 4.5, 0);
  portalGroup.add(topArch);

  // Skulls adorning the arch
  const skull1 = createSkullMesh(0.8);
  skull1.position.set(-1.8, 4.8, 0.3);
  portalGroup.add(skull1);

  const skull2 = createSkullMesh(0.8);
  skull2.position.set(1.8, 4.8, 0.3);
  portalGroup.add(skull2);

  const skullCenter = createSkullMesh(1.1);
  skullCenter.position.set(0, 4.85, 0.35);
  portalGroup.add(skullCenter);

  // Glowing Ethereal Portal Vortex Plane
  const vortexGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 16);
  vortexGeo.rotateX(Math.PI / 2);
  const vortex = new THREE.Mesh(vortexGeo, swirlMat);
  vortex.position.set(0, 2.2, 0);
  portalGroup.add(vortex);

  const portalLight = new THREE.PointLight(0x22ffaa, 3.5, 12);
  portalLight.position.set(0, 2.2, 0.5);
  portalGroup.add(portalLight);

  return portalGroup;
}

/**
 * Creates the Infernal Hellfire Blade weapon.
 * Handheld weapon with obsidian hilt, demonic skull crossguard,
 * serrated molten blade edge, and glowing ember pointlight.
 */
export function createInfernalBlade(scale = 1.0): {
  group: THREE.Group;
  bladeMesh: THREE.Mesh;
  glowLight: THREE.PointLight;
} {
  const group = new THREE.Group();

  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.35,
    metalness: 0.85,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x422010,
    roughness: 0.8,
  });

  const magmaBladeMat = new THREE.MeshStandardMaterial({
    color: 0xff3300,
    emissive: 0xff4400,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.6,
  });

  const gemMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

  // 1. Grip / Hilt
  const gripGeo = new THREE.CylinderGeometry(0.035 * scale, 0.04 * scale, 0.42 * scale, 8);
  const grip = new THREE.Mesh(gripGeo, leatherMat);
  grip.position.y = 0.21 * scale;
  group.add(grip);

  // 2. Pommel (bottom weight with amber gem)
  const pommelGeo = new THREE.SphereGeometry(0.06 * scale, 8, 8);
  const pommel = new THREE.Mesh(pommelGeo, obsidianMat);
  pommel.position.y = 0;
  group.add(pommel);

  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.035 * scale, 6, 6), gemMat);
  gem.position.y = -0.02 * scale;
  group.add(gem);

  // 3. Crossguard (spiked wings)
  const crossGeo = new THREE.BoxGeometry(0.36 * scale, 0.06 * scale, 0.1 * scale);
  const crossguard = new THREE.Mesh(crossGeo, obsidianMat);
  crossguard.position.y = 0.44 * scale;
  group.add(crossguard);

  const crossSkull = createSkullMesh(0.28 * scale);
  crossSkull.position.set(0, 0.45 * scale, 0.06 * scale);
  group.add(crossSkull);

  // 4. Main Blade
  const bladeGeo = new THREE.BoxGeometry(0.1 * scale, 1.05 * scale, 0.025 * scale);
  const bladeMesh = new THREE.Mesh(bladeGeo, obsidianMat);
  bladeMesh.position.y = 0.98 * scale;
  group.add(bladeMesh);

  // 5. Molten Glowing Edge / Spine
  const edgeGeo = new THREE.BoxGeometry(0.03 * scale, 1.02 * scale, 0.032 * scale);
  const moltenEdge = new THREE.Mesh(edgeGeo, magmaBladeMat);
  moltenEdge.position.set(0.045 * scale, 0.98 * scale, 0);
  group.add(moltenEdge);

  // Tip
  const tipGeo = new THREE.ConeGeometry(0.065 * scale, 0.22 * scale, 4);
  const tip = new THREE.Mesh(tipGeo, magmaBladeMat);
  tip.position.y = 1.6 * scale;
  tip.rotation.y = Math.PI / 4;
  group.add(tip);

  // Glow Light from blade
  const glowLight = new THREE.PointLight(0xff5500, 1.6, 5);
  glowLight.position.set(0, 1.0 * scale, 0.2 * scale);
  group.add(glowLight);

  group.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
    }
  });

  return { group, bladeMesh, glowLight };
}

