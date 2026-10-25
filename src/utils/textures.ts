import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generator.
 * Creates rich textures for lava, cracked obsidian, skulls/bones, and infernal stone.
 * Zero external files or images.
 */

export function createLavaTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Molten base
  const grad = ctx.createRadialGradient(size / 2, size / 2, 40, size / 2, size / 2, size);
  grad.addColorStop(0, '#ffbb00');
  grad.addColorStop(0.3, '#ff4400');
  grad.addColorStop(0.7, '#aa1100');
  grad.addColorStop(1.0, '#330000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fiery cracks and crust
  ctx.fillStyle = '#180400';
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 15 + Math.random() * 45;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing orange magma veins
  ctx.strokeStyle = '#ff9900';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ff3300';
  ctx.shadowBlur = 10;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 5; j++) {
      cx += (Math.random() - 0.5) * 120;
      cy += (Math.random() - 0.5) * 120;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Intense yellow-hot sparks
  ctx.fillStyle = '#fff488';
  for (let i = 0; i < 80; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    ctx.fillRect(px, py, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createObsidianTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian charcoal base
  ctx.fillStyle = '#111116';
  ctx.fillRect(0, 0, size, size);

  // Rock facets
  for (let i = 0; i < 100; i++) {
    const gray = Math.floor(18 + Math.random() * 30);
    ctx.fillStyle = `rgb(${gray}, ${Math.floor(gray * 0.9)}, ${Math.floor(gray * 1.1)})`;
    ctx.beginPath();
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60);
    ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60);
    ctx.closePath();
    ctx.fill();
  }

  // Red glowing cracks running through obsidian
  ctx.strokeStyle = 'rgba(255, 60, 20, 0.45)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 4; j++) {
      cx += (Math.random() - 0.5) * 140;
      cy += (Math.random() - 0.5) * 140;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createHellPrisonBricksTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark crimson base
  ctx.fillStyle = '#1a0808';
  ctx.fillRect(0, 0, size, size);

  // Brick grid
  const rows = 8;
  const cols = 4;
  const h = size / rows;
  const w = size / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (w / 2);
    for (let c = -1; c <= cols; c++) {
      const bx = c * w + offset;
      const by = r * h;

      const tone = Math.floor(25 + Math.random() * 25);
      ctx.fillStyle = `rgb(${tone + 20}, ${tone}, ${tone})`;
      ctx.fillRect(bx + 3, by + 3, w - 6, h - 6);

      // Charred weathering
      ctx.fillStyle = 'rgba(230, 60, 10, 0.08)';
      ctx.fillRect(bx + 3, by + 3, (w - 6) * Math.random(), (h - 6) * Math.random());
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBoneTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#dcd4c0';
  ctx.fillRect(0, 0, size, size);

  // Aged dirt and blood streaks on bone
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(70, 50, 40, 0.12)' : 'rgba(150, 20, 10, 0.1)';
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillRect(x, y, 10 + Math.random() * 30, 2 + Math.random() * 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createOmarFabricTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Tactical carbon fiber suit
  ctx.fillStyle = '#141416';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#232328';
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Crimson warning hazard stripes on armor edge
  ctx.fillStyle = '#cc1111';
  ctx.fillRect(0, 0, size, 16);
  ctx.fillRect(0, size - 16, size, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
