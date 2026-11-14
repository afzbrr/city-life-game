import * as THREE from 'three';

export function createTextSignTexture(
  title: string,
  bgHex: string,
  textHex = '#ffffff',
  borderHex = '#fde047',
  subtitle?: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.beginPath();
  ctx.roundRect(6, 6, 500, 116, 20);
  ctx.fill();

  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.fillStyle = textHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (subtitle) {
    ctx.font = '900 32px sans-serif';
    ctx.fillText(title, 256, 48);
    ctx.fillStyle = borderHex;
    ctx.font = '700 22px sans-serif';
    ctx.fillText(subtitle, 256, 88);
  } else {
    ctx.font = '900 38px sans-serif';
    ctx.fillText(title, 256, 66);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createBrickWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d6ccc2'; // mortar
  ctx.fillRect(0, 0, 512, 512);

  const brickColors = ['#9a3412', '#b45309', '#7c2d12', '#a16207', '#9f1239'];
  const bw = 64;
  const bh = 32;
  for (let row = 0; row < 16; row++) {
    const offset = (row % 2) * (bw / 2);
    for (let col = -1; col < 9; col++) {
      ctx.fillStyle = brickColors[(row * 5 + col * 3 + 12) % brickColors.length];
      ctx.fillRect(col * bw + offset + 3, row * bh + 3, bw - 6, bh - 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createParkGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#4ade80');
  g.addColorStop(0.5, '#22c55e');
  g.addColorStop(1, '#16a34a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 320; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(134, 239, 172, 0.35)' : 'rgba(21, 128, 61, 0.25)';
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  const flowerColors = ['#fef08a', '#ffffff', '#f472b6', '#38bdf8'];
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createAsphaltFestivalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#1e293b';
  for (let i = 0; i < 550; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }

  // Subtle footprint & confetti markings
  ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
  for (let i = 0; i < 28; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.random() * 512, Math.random() * 512, 4, 8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const confettiColors = ['#f43f5e', '#facc15', '#38bdf8', '#4ade80', '#ec4899'];
  for (let i = 0; i < 110; i++) {
    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => m.dispose());
    } else if (mat) {
      mat.dispose();
    }
  });
}

export function buildMotorbike(colorHex: number): THREE.Group {
  const moto = new THREE.Group();
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

  [-0.55, 0.55].forEach((wz) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 8, 14), darkMat);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.34, wz);
    moto.add(wheel);
  });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 1.3), bodyMat);
  frame.position.set(0, 0.62, 0);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.68), darkMat);
  seat.position.set(0, 0.84, -0.15);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 6), chromeMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, 1.0, 0.45);
  const headlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  headlight.position.set(0, 0.82, 0.65);

  moto.add(frame, seat, handle, headlight);
  return moto;
}

export function buildBicycle(colorHex: number): THREE.Group {
  const bike = new THREE.Group();
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const frameMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.5 });

  [-0.48, 0.48].forEach((wz) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 6, 14), tireMat);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.32, wz);
    bike.add(wheel);
  });

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 6), frameMat);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(0, 0.62, 0);
  const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), frameMat);
  seatPost.position.set(0, 0.65, -0.2);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.24), tireMat);
  saddle.position.set(0, 0.9, -0.2);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), frameMat);
  stem.position.set(0, 0.68, 0.42);
  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 6), tireMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 0.94, 0.42);

  bike.add(bar, seatPost, saddle, stem, handlebar);
  return bike;
}
