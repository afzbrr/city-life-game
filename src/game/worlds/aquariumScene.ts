import * as THREE from 'three';
import { InteractionTarget } from '../types';
import {
  createReflectiveGlassMaterial,
  createSandPBRMaterial,
  createWaterCausticsMaterial,
} from '../pbrMaterials';
import { createTextSignTexture, disposeHierarchy } from './worldHelpers';

// Procedural Marine CanvasTextures (zero external URLs)
function createSharkSkinTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.55, '#64748b');
  grad.addColorStop(0.65, '#f1f5f9');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  // Subtle dorsal speckles
  ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc((i * 37) % 256, (i * 19) % 64, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gill slits near head (center-front)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  for (let g = 0; g < 5; g++) {
    const gx = 165 + g * 8;
    ctx.beginPath();
    ctx.moveTo(gx, 46);
    ctx.lineTo(gx - 2, 74);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTurtleShellTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#365314';
  ctx.fillRect(0, 0, 256, 256);

  // Polygonal brown/olive scute plates with golden amber borders
  const cols = 4;
  const rows = 4;
  const cw = 256 / cols;
  const ch = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const cx = (col + 0.5) * cw + (r % 2 === 0 ? 0 : cw * 0.25);
      const cy = (r + 0.5) * ch;
      ctx.fillStyle = (r + col) % 2 === 0 ? '#4d7c0f' : '#713f12';
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const px = cx + Math.cos(a) * cw * 0.44;
        const py = cy + Math.sin(a) * ch * 0.44;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      // Inner scute highlight ring
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, cw * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createClownfishTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f97316';
  ctx.fillRect(0, 0, 256, 128);

  // 3 classic black-edged white bands along body (U = circumference/length depending on rotation)
  const bands = [52, 126, 200];
  bands.forEach((bx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 16, 0, 32, 128);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 11, 0, 22, 128);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStarfishGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const points = 5;
  const outerR = 0.34;
  const innerR = 0.14;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function buildAquariumScene(scene: THREE.Scene): {
  interactions: InteractionTarget[];
  update: (time: number) => void;
  cleanup: () => void;
} {
  const root = new THREE.Group();
  scene.add(root);
  const texturesToDispose: THREE.CanvasTexture[] = [];
  const dummy = new THREE.Object3D();

  // Procedural creature textures
  const sharkTex = createSharkSkinTexture();
  const turtleShellTex = createTurtleShellTexture();
  const clownTex = createClownfishTexture();
  texturesToDispose.push(sharkTex, turtleShellTex, clownTex);

  // 1. FLOOR, BLUE FLOOR LIGHT STRIPS, DARK HALL DOME & CLEAR GALLERY WALKWAY
  const floorGeo = new THREE.PlaneGeometry(62, 62);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, createWaterCausticsMaterial('#062a47'));
  floor.receiveShadow = true;
  root.add(floor);

  const stripMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.42,
  });
  [-4.2, 4.2, -9.6, 9.6].forEach((sx) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 42), stripMat);
    strip.position.set(sx, 0.015, 0);
    root.add(strip);
  });

  const oceanDome = new THREE.Mesh(
    new THREE.SphereGeometry(48, 22, 20),
    new THREE.MeshBasicMaterial({ color: 0x04192e, side: THREE.BackSide })
  );
  oceanDome.position.y = 10;
  root.add(oceanDome);

  const tankSandMat = createSandPBRMaterial(6, 6);
  const tankGlassMat = createReflectiveGlassMaterial(0x7dd3fc, 0.22);
  tankGlassMat.depthWrite = false;
  const archSteelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });

  // 2. LONG CENTRAL ACRYLIC GLASS TUNNEL WITH 50 OVERHEAD FISH (Walkway inside stays 100% open!)
  const tunnelRadius = 5.2;
  const tunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, 36, 32, 1, true, 0, Math.PI),
    tankGlassMat
  );
  tunnel.rotation.z = Math.PI / 2;
  tunnel.renderOrder = 3;
  root.add(tunnel);

  for (let ribZ = -16; ribZ <= 16; ribZ += 4) {
    const archRib = new THREE.Mesh(
      new THREE.TorusGeometry(tunnelRadius + 0.05, 0.14, 8, 30, Math.PI),
      archSteelMat
    );
    archRib.position.set(0, 0, ribZ);
    root.add(archRib);
  }

  // 50 Overhead Tunnel Fish Swimming Above Glass Arch (y = 6.0..12.0)
  const tunnelFishCount = 50;
  const tunnelFishGeo = new THREE.SphereGeometry(0.16, 10, 8);
  tunnelFishGeo.scale(0.65, 0.9, 2.2);
  const tunnelFishInst = new THREE.InstancedMesh(
    tunnelFishGeo,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }),
    tunnelFishCount
  );
  const tfColors = [0x38bdf8, 0xfacc15, 0xf472b6, 0x22d3ee, 0xf97316, 0xa855f7];
  const tfCol = new THREE.Color();
  const tfData = Array.from({ length: tunnelFishCount }, (_, i) => {
    tfCol.setHex(tfColors[i % tfColors.length]);
    tunnelFishInst.setColorAt(i, tfCol);
    return {
      radius: 6.4 + (i % 5) * 1.4,
      angleOffset: (i / tunnelFishCount) * Math.PI * 2,
      speed: 0.32 + (i % 4) * 0.08,
      height: 6.0 + (i % 6) * 1.1,
    };
  });
  if (tunnelFishInst.instanceColor) tunnelFishInst.instanceColor.needsUpdate = true;
  root.add(tunnelFishInst);

  // 3. HELPER TO BUILD LARGE DISPLAY TANKS + INFO BOARDS (8 EXHIBIT TANKS ALONG SIDE/NORTH WALLS!)
  const tankWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.14,
    roughness: 0.12,
    depthWrite: false,
  });

  const addTankFloraAndCorals = (tank: THREE.Group, w: number, d: number, seedOffset: number) => {
    const weedMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    const coralPalette = [0xf43f5e, 0xfbbf24, 0xa855f7, 0x06b6d4, 0xec4899, 0x22c55e];

    // Wavy short seaweed clusters safely INSIDE the glass tank
    for (let wi = 0; wi < 8; wi++) {
      const tuft = new THREE.Group();
      const angle = (wi / 8) * Math.PI * 2 + seedOffset;
      tuft.position.set(
        Math.cos(angle) * (w * 0.34),
        1.03,
        Math.sin(angle) * (d * 0.34)
      );
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.035, 0.7 + (b % 2) * 0.3, 4, 6),
          weedMat
        );
        blade.position.set((b - 1) * 0.08, 0.42, (b % 2) * 0.06);
        blade.rotation.z = (b - 1) * 0.18;
        tuft.add(blade);
      }
      tank.add(tuft);
    }

    // Branching 3D corals inside tank
    for (let ci = 0; ci < 5; ci++) {
      const coral = new THREE.Group();
      const cMat = new THREE.MeshStandardMaterial({
        color: coralPalette[(ci + seedOffset) % coralPalette.length],
        roughness: 0.42,
      });
      const cx = -w * 0.32 + (ci / 4) * (w * 0.64);
      const cz = ((ci % 2) - 0.5) * (d * 0.5);
      coral.position.set(cx, 1.03, cz);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.52, 8), cMat);
      stem.position.y = 0.26;
      coral.add(stem);
      [-1, 1].forEach((dir) => {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.42, 7), cMat);
        branch.position.set(dir * 0.14, 0.52, 0);
        branch.rotation.z = -dir * 0.45;
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 7, 7), cMat);
        tip.position.set(dir * 0.24, 0.7, 0);
        coral.add(branch, tip);
      });
      tank.add(coral);
    }
  };

  const buildExhibitTank = (
    tx: number,
    tz: number,
    w: number,
    h: number,
    d: number,
    title: string,
    subtitle: string,
    signPos: [number, number, number],
    signRotY: number
  ): THREE.Group => {
    const tg = new THREE.Group();
    tg.position.set(tx, 0, tz);

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.9, d + 0.4), archSteelMat);
    plinth.position.y = 0.45;
    const sandBed = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, 0.16, d - 0.3), tankSandMat);
    sandBed.position.y = 0.95;
    const waterBox = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, h, d - 0.2), tankWaterMat);
    waterBox.position.y = 0.9 + h / 2;
    waterBox.renderOrder = 1;
    const glassBox = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), tankGlassMat);
    glassBox.position.y = 0.9 + h / 2;
    glassBox.renderOrder = 2;
    const topCap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.35, d + 0.4), archSteelMat);
    topCap.position.y = 0.9 + h + 0.18;

    const sTex = createTextSignTexture(title, '#0c4a6e', '#ffffff', '#38bdf8', subtitle);
    texturesToDispose.push(sTex);
    const sBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 0.78),
      new THREE.MeshBasicMaterial({ map: sTex })
    );
    sBoard.position.set(signPos[0], signPos[1], signPos[2]);
    sBoard.rotation.y = signRotY;

    const sPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), archSteelMat);
    sPost.position.set(signPos[0], 0.65, signPos[2]);

    tg.add(plinth, sandBed, waterBox, glassBox, topCap, sBoard, sPost);
    root.add(tg);
    return tg;
  };

  // --- TANK 1 (Main Overhead Sharks + West Shark Tank): 5 Multi-Part Textured Sharks + 20 Fish ---
  const sharkTank = buildExhibitTank(
    -14,
    -10,
    7.2,
    5.2,
    7.2,
    'TANGKI HIU SAMUDRA 🦈',
    '5 Hiu & 20 Ikan Karang',
    [4.2, 1.45, 0],
    Math.PI / 2
  );
  addTankFloraAndCorals(sharkTank, 7.2, 7.2, 1);

  const sharkSkinMat = new THREE.MeshStandardMaterial({
    map: sharkTex,
    roughness: 0.32,
    metalness: 0.08,
  });
  const sharkFinMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35 });
  const sharkWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.38 });
  const darkEyeMat = new THREE.MeshStandardMaterial({ color: 0x090d1a, roughness: 0.15 });

  // Sculpted torpedo profile for shark hull
  const sharkHullPts = [
    new THREE.Vector2(0.0, -2.2),
    new THREE.Vector2(0.28, -1.6),
    new THREE.Vector2(0.62, -0.7),
    new THREE.Vector2(0.86, 0.2),
    new THREE.Vector2(0.82, 1.1),
    new THREE.Vector2(0.54, 1.9),
    new THREE.Vector2(0.18, 2.45),
    new THREE.Vector2(0.0, 2.6),
  ];
  const sharkHullGeo = new THREE.LatheGeometry(sharkHullPts, 18);
  sharkHullGeo.rotateX(Math.PI / 2);

  const sharks: {
    group: THREE.Group;
    tailFin: THREE.Group;
    speed: number;
    r: number;
    h: number;
    cx: number;
    cz: number;
    phase: number;
  }[] = [];

  const buildShark = (
    scale: number,
    isHammer: boolean,
    cx: number,
    cz: number,
    r: number,
    h: number,
    speed: number,
    phase: number
  ) => {
    const sGroup = new THREE.Group();
    const body = new THREE.Mesh(sharkHullGeo, sharkSkinMat);
    body.scale.set(0.88 * scale, 0.95 * scale, scale);
    sGroup.add(body);

    const belly = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45 * scale, 2.2 * scale, 8, 12),
      sharkWhiteMat
    );
    belly.rotation.x = Math.PI / 2;
    belly.position.set(0, -0.34 * scale, 0.25 * scale);
    belly.scale.set(1.0, 1.0, 0.48);
    sGroup.add(belly);

    if (isHammer) {
      const hammer = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22 * scale, 2.2 * scale, 6, 10),
        sharkFinMat
      );
      hammer.rotation.z = Math.PI / 2;
      hammer.position.set(0, 0.08 * scale, 2.25 * scale);
      sGroup.add(hammer);
      [-1.12, 1.12].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 8, 8), darkEyeMat);
        eye.position.set(ex * scale, 0.1 * scale, 2.34 * scale);
        sGroup.add(eye);
      });
    } else {
      [-0.5, 0.5].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 8, 8), darkEyeMat);
        eye.position.set(ex * scale, 0.12 * scale, 1.75 * scale);
        sGroup.add(eye);
      });
    }

    // Dorsal + 2 Pectoral Fins
    const dorsal = new THREE.Mesh(
      new THREE.ConeGeometry(0.48 * scale, 1.35 * scale, 4),
      sharkFinMat
    );
    dorsal.position.set(0, 1.1 * scale, 0.15 * scale);
    dorsal.rotation.x = -0.38;
    sGroup.add(dorsal);

    [-1, 1].forEach((side) => {
      const pec = new THREE.Mesh(
        new THREE.ConeGeometry(0.32 * scale, 1.25 * scale, 4),
        sharkFinMat
      );
      pec.position.set(side * 0.9 * scale, -0.22 * scale, 0.55 * scale);
      pec.rotation.z = side * -1.15;
      pec.rotation.x = 0.25;
      sGroup.add(pec);
    });

    // Articulated Tail Pivot with Crescent Caudal Fin
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0, -2.0 * scale);
    const upperLobe = new THREE.Mesh(
      new THREE.ConeGeometry(0.22 * scale, 1.35 * scale, 4),
      sharkFinMat
    );
    upperLobe.position.set(0, 0.48 * scale, -0.35 * scale);
    upperLobe.rotation.x = -0.7;
    const lowerLobe = new THREE.Mesh(
      new THREE.ConeGeometry(0.18 * scale, 0.85 * scale, 4),
      sharkFinMat
    );
    lowerLobe.position.set(0, -0.34 * scale, -0.28 * scale);
    lowerLobe.rotation.x = -2.35;
    tailPivot.add(upperLobe, lowerLobe);
    sGroup.add(tailPivot);

    root.add(sGroup);
    sharks.push({ group: sGroup, tailFin: tailPivot, speed, r, h, cx, cz, phase });
  };

  buildShark(1.1, false, 0, 0, 10.5, 9.2, 0.35, 0);
  buildShark(0.95, true, 0, 0, 13.5, 10.4, 0.42, Math.PI);
  buildShark(0.42, false, -14, -10, 2.0, 2.4, 0.65, 0.5);
  buildShark(0.38, true, -14, -10, 1.7, 3.6, 0.72, 2.6);
  buildShark(0.36, false, -14, -10, 1.5, 4.6, 0.58, 4.4);

  const smallFishCount = 20;
  const smallFishGeo = new THREE.SphereGeometry(0.13, 8, 8);
  smallFishGeo.scale(0.6, 0.85, 1.8);
  const smallFishInst = new THREE.InstancedMesh(
    smallFishGeo,
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25 }),
    smallFishCount
  );
  sharkTank.add(smallFishInst);

  // --- TANK 2: JELLYFISH TANK (West Center -14, 0): 20 Glowing Jellyfish with 6 Wavy Tentacles ---
  const jellyTank = buildExhibitTank(
    -14,
    0,
    6.8,
    5.2,
    6.8,
    'TANGKI UBUR-UBUR 🪼',
    '20 Ubur-ubur Bercahaya',
    [4.0, 1.45, 0],
    Math.PI / 2
  );
  const jellies: {
    group: THREE.Group;
    cap: THREE.Mesh;
    tentacles: THREE.Mesh[];
    baseY: number;
    phase: number;
  }[] = [];
  const jPink = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    emissive: 0xdb2777,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const jPurple = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const jCyan = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x0891b2,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const jMats = [jPink, jPurple, jCyan];

  for (let ji = 0; ji < 20; ji++) {
    const jGroup = new THREE.Group();
    const jMat = jMats[ji % jMats.length];
    const jCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.48),
      jMat
    );
    jGroup.add(jCap);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    core.position.y = -0.05;
    jGroup.add(core);

    const tentacles: THREE.Mesh[] = [];
    for (let tn = 0; tn < 6; tn++) {
      const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.008, 0.85, 5), jMat);
      const a = (tn / 6) * Math.PI * 2;
      tent.position.set(Math.cos(a) * 0.16, -0.45, Math.sin(a) * 0.16);
      jGroup.add(tent);
      tentacles.push(tent);
    }
    const px = -2.2 + (ji % 5) * 1.1;
    const pz = -2.0 + Math.floor(ji / 5) * 1.3;
    const bh = 1.9 + (ji % 4) * 0.85;
    jGroup.position.set(px, bh, pz);
    jellyTank.add(jGroup);
    jellies.push({ group: jGroup, cap: jCap, tentacles, baseY: bh, phase: ji * 0.55 });
  }

  // --- TANK 3: SEA TURTLE TANK (West South -14, 10): 3 Textured Multi-Part Turtles ---
  const turtleTank = buildExhibitTank(
    -14,
    10,
    6.8,
    5.0,
    6.8,
    'TANGKI PENYU LAUT 🐢',
    '3 Penyu Hijau & Terumbu',
    [4.0, 1.45, 0],
    Math.PI / 2
  );
  addTankFloraAndCorals(turtleTank, 6.8, 6.8, 2);

  const shellMat = new THREE.MeshStandardMaterial({
    map: turtleShellTex,
    roughness: 0.42,
    metalness: 0.08,
  });
  const tSkinMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.5 });
  const tBellyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
  const turtles: {
    group: THREE.Group;
    fL: THREE.Group;
    fR: THREE.Group;
    bL: THREE.Group;
    bR: THREE.Group;
    speed: number;
    r: number;
    h: number;
    phase: number;
  }[] = [];

  for (let ti = 0; ti < 3; ti++) {
    const tGroup = new THREE.Group();
    const carapace = new THREE.Mesh(
      new THREE.SphereGeometry(0.74, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.48),
      shellMat
    );
    carapace.scale.set(0.92, 0.56, 1.28);
    const plastron = new THREE.Mesh(new THREE.SphereGeometry(0.66, 12, 8), tBellyMat);
    plastron.scale.set(0.85, 0.16, 1.18);
    plastron.position.y = -0.04;

    // Sculpted Turtle Head + 2 Eyes
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.06, 1.05);
    const tHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), tSkinMat);
    tHead.scale.set(0.9, 0.82, 1.18);
    headPivot.add(tHead);
    [-0.14, 0.14].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), darkEyeMat);
      eye.position.set(ex, 0.06, 0.12);
      headPivot.add(eye);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), tSkinMat);
    tail.rotation.x = -Math.PI / 2;
    tail.position.set(0, 0.0, -1.0);

    const makeFlipper = (isFront: boolean, side: number) => {
      const piv = new THREE.Group();
      piv.position.set(side * (isFront ? 0.55 : 0.42), 0.02, isFront ? 0.45 : -0.68);
      const blade = new THREE.Mesh(
        new THREE.CapsuleGeometry(isFront ? 0.12 : 0.08, isFront ? 0.72 : 0.36, 6, 8),
        tSkinMat
      );
      blade.rotation.z = Math.PI / 2;
      blade.scale.set(1, 1, 0.32);
      blade.position.x = side * (isFront ? 0.42 : 0.22);
      blade.rotation.y = side * (isFront ? -0.35 : -0.55);
      piv.add(blade);
      return piv;
    };
    const fL = makeFlipper(true, -1);
    const fR = makeFlipper(true, 1);
    const bL = makeFlipper(false, -1);
    const bR = makeFlipper(false, 1);

    tGroup.add(carapace, plastron, headPivot, tail, fL, fR, bL, bR);
    turtleTank.add(tGroup);
    turtles.push({
      group: tGroup,
      fL,
      fR,
      bL,
      bR,
      speed: 0.42 + ti * 0.1,
      r: 1.55 + ti * 0.35,
      h: 2.1 + ti * 0.9,
      phase: (ti / 3) * Math.PI * 2,
    });
  }

  // --- TANK 4: CLOWNFISH & ANEMONE TANK (East North 14, -10): Striped Clownfish + 5 Hero Models + Anemones ---
  const nemoTank = buildExhibitTank(
    14,
    -10,
    6.8,
    5.0,
    6.8,
    'TANGKI IKAN BADUT 🐠',
    '30 Ikan Badut & Anemon',
    [-4.0, 1.45, 0],
    -Math.PI / 2
  );
  addTankFloraAndCorals(nemoTank, 6.8, 6.8, 3);

  const clownMat = new THREE.MeshStandardMaterial({ map: clownTex, roughness: 0.25 });
  const clownFishCount = 30;
  const clownBodyGeo = new THREE.SphereGeometry(0.18, 10, 8);
  clownBodyGeo.scale(0.55, 0.85, 1.55);
  const clownFishInst = new THREE.InstancedMesh(clownBodyGeo, clownMat, clownFishCount);
  nemoTank.add(clownFishInst);

  // 5 Hero Multi-part Clownfish with Wagging Tails & Dorsal Fins
  const heroClowns: { group: THREE.Group; tail: THREE.Mesh; phase: number; r: number; h: number }[] = [];
  for (let hc = 0; hc < 5; hc++) {
    const cg = new THREE.Group();
    const cb = new THREE.Mesh(clownBodyGeo, clownMat);
    const cTail = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.24, 4),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 })
    );
    cTail.rotation.x = Math.PI / 2;
    cTail.position.z = -0.32;
    const cDorsal = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    cDorsal.position.set(0, 0.16, 0);
    [-0.08, 0.08].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), darkEyeMat);
      eye.position.set(ex, 0.04, 0.19);
      cg.add(eye);
    });
    cg.add(cb, cTail, cDorsal);
    cg.scale.setScalar(1.35);
    nemoTank.add(cg);
    heroClowns.push({ group: cg, tail: cTail, phase: hc * 1.25, r: 1.3 + (hc % 3) * 0.45, h: 1.8 + hc * 0.5 });
  }

  // Multi-tentacle Sea Anemones
  for (let ai = 0; ai < 8; ai++) {
    const anemG = new THREE.Group();
    const aMat = new THREE.MeshStandardMaterial({
      color: ai % 2 === 0 ? 0xf472b6 : 0xa855f7,
      roughness: 0.45,
    });
    const ax = -2.0 + (ai % 4) * 1.3;
    const az = -1.6 + Math.floor(ai / 4) * 2.4;
    anemG.position.set(ax, 1.05, az);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.28, 8), aMat);
    base.position.y = 0.14;
    anemG.add(base);
    for (let t = 0; t < 7; t++) {
      const ta = (t / 7) * Math.PI * 2;
      const tent = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.38, 4, 6), aMat);
      tent.position.set(Math.cos(ta) * 0.14, 0.4, Math.sin(ta) * 0.14);
      tent.rotation.z = -Math.cos(ta) * 0.35;
      tent.rotation.x = Math.sin(ta) * 0.35;
      anemG.add(tent);
    }
    nemoTank.add(anemG);
  }

  // --- TANK 5: MANTA RAY TANK (East Center 14, 0): 4 Sculpted Gliding Manta Rays ---
  const mantaTank = buildExhibitTank(
    14,
    0,
    6.8,
    5.2,
    6.8,
    'TANGKI IKAN PARI 🌊',
    '4 Ikan Pari Manta Anggun',
    [-4.0, 1.45, 0],
    -Math.PI / 2
  );
  const mantaMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.32,
    metalness: 0.16,
  });
  const mantaBellyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
  const mantas: {
    group: THREE.Group;
    wingL: THREE.Mesh;
    wingR: THREE.Mesh;
    phase: number;
    h: number;
    r: number;
  }[] = [];

  for (let mi = 0; mi < 4; mi++) {
    const mg = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), mantaMat);
    core.scale.set(0.9, 0.28, 1.25);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), mantaBellyMat);
    belly.scale.set(0.86, 0.16, 1.2);
    belly.position.y = -0.05;

    const wingGeo = new THREE.ConeGeometry(0.48, 1.15, 4);
    const wingL = new THREE.Mesh(wingGeo, mantaMat);
    wingL.rotation.z = Math.PI / 2;
    wingL.scale.set(0.18, 1, 0.85);
    wingL.position.set(-0.65, 0, -0.05);

    const wingR = new THREE.Mesh(wingGeo, mantaMat);
    wingR.rotation.z = -Math.PI / 2;
    wingR.scale.set(0.18, 1, 0.85);
    wingR.position.set(0.65, 0, -0.05);

    const mTail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.008, 1.3, 6), mantaMat);
    mTail.rotation.x = Math.PI / 2;
    mTail.position.z = -1.0;

    [-0.22, 0.22].forEach((hx) => {
      const horn = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.22, 4, 6), mantaMat);
      horn.rotation.x = Math.PI / 2;
      horn.position.set(hx, 0.0, 0.6);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), darkEyeMat);
      eye.position.set(hx * 1.15, 0.06, 0.45);
      mg.add(horn, eye);
    });

    mg.add(core, belly, wingL, wingR, mTail);
    mantaTank.add(mg);
    mantas.push({
      group: mg,
      wingL,
      wingR,
      phase: mi * 1.5,
      h: 2.0 + (mi % 3) * 0.9,
      r: 1.55 + (mi % 2) * 0.45,
    });
  }

  // --- TANK 6: PENGUIN TANK (East South 14, 10): Icebergs + 6 Multi-Part Penguins ---
  const penguinTank = buildExhibitTank(
    14,
    10,
    6.8,
    5.0,
    6.8,
    'TANGKI PINGUIN ANTARTIKA 🐧',
    'Es Salju & 6 Pinguin Lucu',
    [-4.0, 1.45, 0],
    -Math.PI / 2
  );
  const iceMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.25 });
  const iceShelf = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.85, 3.2), iceMat);
  iceShelf.position.set(0, 1.35, -1.2);
  const iceBerg = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 5), iceMat);
  iceBerg.position.set(-1.5, 2.5, -1.5);
  penguinTank.add(iceShelf, iceBerg);

  const penguins: { group: THREE.Group; baseX: number; baseZ: number; phase: number }[] = [];
  const pBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const pWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const pBeak = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  for (let pi = 0; pi < 6; pi++) {
    const pg = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 6, 10), pBlack);
    body.position.y = 0.45;
    const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.35, 6, 8), pWhite);
    belly.position.set(0, 0.42, 0.08);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), pBeak);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.72, 0.24);
    [-0.08, 0.08].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), darkEyeMat);
      eye.position.set(ex, 0.76, 0.18);
      pg.add(eye);
    });
    [-0.22, 0.22].forEach((fx) => {
      const flipper = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.26, 4, 6), pBlack);
      flipper.position.set(fx, 0.48, 0.0);
      flipper.rotation.z = fx < 0 ? 0.35 : -0.35;
      pg.add(flipper);
    });
    pg.add(body, belly, beak);
    const bx = -1.8 + (pi % 3) * 1.6;
    const bz = -1.8 + Math.floor(pi / 3) * 1.2;
    pg.position.set(bx, 1.78, bz);
    penguinTank.add(pg);
    penguins.push({ group: pg, baseX: bx, baseZ: bz, phase: pi * 1.1 });
  }

  // --- TANK 7: STARFISH & SHELL TANK (North End 0, -19): 15 True 5-Arm 3D Starfish + Clams ---
  const starTank = buildExhibitTank(
    0,
    -19,
    8.4,
    4.2,
    5.2,
    'TANGKI BINTANG LAUT ⭐',
    '15 Bintang Laut & Kerang',
    [0, 1.45, 3.3],
    0
  );
  addTankFloraAndCorals(starTank, 8.4, 5.2, 4);

  const starGeo = createStarfishGeometry();
  const starColors = [0xf43f5e, 0xf59e0b, 0xec4899, 0xa855f7, 0x38bdf8];
  for (let sf = 0; sf < 15; sf++) {
    const star = new THREE.Mesh(
      starGeo,
      new THREE.MeshStandardMaterial({ color: starColors[sf % starColors.length], roughness: 0.42 })
    );
    star.position.set(-3.0 + (sf % 5) * 1.5, 1.05, -1.4 + Math.floor(sf / 5) * 1.3);
    star.rotation.y = sf * 0.7;
    starTank.add(star);
  }
  for (let cl = 0; cl < 6; cl++) {
    const clam = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 })
    );
    clam.position.set(-2.5 + cl * 1.0, 1.05, 1.6);
    starTank.add(clam);
  }

  // --- TANK 8: CORAL, OCTOPUS & SEAHORSE GARDEN TANK (-9.5, -19) ---
  const coralTank = buildExhibitTank(
    -9.5,
    -19,
    6.2,
    4.2,
    5.2,
    'TAMAN KORAL TROPIS 🪸',
    'Gurita, Kuda Laut & Terumbu',
    [0, 1.45, 3.3],
    0
  );
  addTankFloraAndCorals(coralTank, 6.2, 5.2, 5);

  // Hero 8-Arm Octopus inside Coral Garden Tank
  const octoMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.42 });
  const octoGroup = new THREE.Group();
  octoGroup.position.set(0.6, 2.2, 0);
  const octoHead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), octoMat);
  octoHead.scale.set(1, 1.25, 1);
  octoGroup.add(octoHead);
  [-0.18, 0.18].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), darkEyeMat);
    eye.position.set(ex, 0.0, 0.36);
    octoGroup.add(eye);
  });
  const octoArms: THREE.Mesh[] = [];
  for (let oa = 0; oa < 8; oa++) {
    const ang = (oa / 8) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.72, 4, 6), octoMat);
    arm.position.set(Math.cos(ang) * 0.32, -0.45, Math.sin(ang) * 0.32);
    arm.rotation.z = -Math.cos(ang) * 0.65;
    arm.rotation.x = Math.sin(ang) * 0.65;
    octoGroup.add(arm);
    octoArms.push(arm);
  }
  coralTank.add(octoGroup);

  // 4 Swaying Seahorses inside Coral Garden Tank
  const seahorses: { group: THREE.Group; baseY: number; phase: number }[] = [];
  const seaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.38 });
  for (let sh = 0; sh < 4; sh++) {
    const sg = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.28, 6, 8), seaMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), seaMat);
    head.position.set(0, 0.22, 0.04);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.16, 6), seaMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.22, 0.14);
    const curl = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 6, 12, Math.PI * 1.4), seaMat);
    curl.rotation.y = Math.PI / 2;
    curl.position.set(0, -0.22, -0.04);
    sg.add(torso, head, snout, curl);
    const sy = 1.95 + (sh % 2) * 0.7;
    sg.position.set(-1.7 + sh * 0.6, sy, -0.6 + (sh % 2) * 1.1);
    coralTank.add(sg);
    seahorses.push({ group: sg, baseY: sy, phase: sh * 1.1 });
  }

  // 4. RISING BUBBLES & GLOWING PLANKTON (safely above tunnel & inside tank zones; central walkway 100% clear!)
  const bubbleCount = 60;
  const bubbleInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.11, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.68 }),
    bubbleCount
  );
  const bubbleData = Array.from({ length: bubbleCount }, (_, i) => ({
    angle: (i / bubbleCount) * Math.PI * 2,
    radius: 6.4 + (i % 6) * 1.6,
    y: 5.5 + (i % 10) * 1.3,
    speed: 0.8 + (i % 4) * 0.35,
  }));
  root.add(bubbleInst);

  const planktonCount = 80;
  const planktonInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.045, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 }),
    planktonCount
  );
  for (let pi = 0; pi < planktonCount; pi++) {
    dummy.position.set(((pi * 19) % 36) - 18, 4.2 + (pi % 9), ((pi * 23) % 36) - 18);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    planktonInst.setMatrixAt(pi, dummy.matrix);
  }
  planktonInst.instanceMatrix.needsUpdate = true;
  root.add(planktonInst);

  // 5. INTERIOR FACILITIES: VIEWING BENCHES, SOUVENIR SHOP, TICKET COUNTER, PHOTO BOOTH
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  [
    [0, -1.8, 0],
    [0, 1.8, 0],
    [-6.8, -10, Math.PI / 2],
    [-6.8, 0, Math.PI / 2],
    [6.8, -10, -Math.PI / 2],
    [6.8, 0, -Math.PI / 2],
  ].forEach(([bx, bz, ry]) => {
    const benchG = new THREE.Group();
    benchG.position.set(bx, 0, bz);
    benchG.rotation.y = ry;
    const seatTop = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 1.0), benchMat);
    seatTop.position.y = 0.48;
    [-1.4, 1.4].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.8), archSteelMat);
      leg.position.set(lx, 0.22, 0);
      benchG.add(leg);
    });
    benchG.add(seatTop);
    root.add(benchG);
  });

  // Souvenir Shop (-7.5, 0, 17.5)
  const shopGroup = new THREE.Group();
  shopGroup.position.set(-7.5, 0, 17.5);
  const shopCounter = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 1.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  shopCounter.position.y = 0.7;
  const shopTex = createTextSignTexture(
    'TOKO SOUVENIR LAUT 🦈',
    '#0369a1',
    '#ffffff',
    '#fde047',
    'Boneka Hiu • Kaos • Gantungan Kunci'
  );
  texturesToDispose.push(shopTex);
  const shopSign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 1.0),
    new THREE.MeshBasicMaterial({ map: shopTex })
  );
  shopSign.position.set(0, 2.8, -0.8);
  shopSign.rotation.y = Math.PI;
  shopGroup.add(shopCounter, shopSign);
  [0x38bdf8, 0x64748b, 0xf472b6, 0xfacc15].forEach((sc, si) => {
    const plush = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.35, 6, 8),
      new THREE.MeshStandardMaterial({ color: sc })
    );
    plush.position.set(-1.6 + si * 0.85, 1.62, 0.2);
    const tshirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.65, 0.08),
      new THREE.MeshStandardMaterial({ color: sc })
    );
    tshirt.position.set(-1.5 + si * 0.9, 1.9, -0.6);
    shopGroup.add(plush, tshirt);
  });
  root.add(shopGroup);

  // Ticket Booth & Photo Corner
  const ticketBooth = new THREE.Group();
  ticketBooth.position.set(0, 0, 17.5);
  const tbBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 2.6, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  tbBody.position.y = 1.3;
  const tbTex = createTextSignTexture('LOKET TIKET AQUARIUM 🎟️', '#0284c7', '#ffffff', '#fef08a');
  texturesToDispose.push(tbTex);
  const tbSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.8),
    new THREE.MeshBasicMaterial({ map: tbTex })
  );
  tbSign.position.set(0, 2.9, -1.12);
  tbSign.rotation.y = Math.PI;
  ticketBooth.add(tbBody, tbSign);
  root.add(ticketBooth);

  const photoCorner = new THREE.Group();
  photoCorner.position.set(7.5, 0, 17.5);
  const pcWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 0.3), archSteelMat);
  pcWall.position.y = 1.6;
  const pcTex = createTextSignTexture('STUDIO FOTO BAWAH LAUT 📸', '#be185d', '#ffffff', '#fbcfe8');
  texturesToDispose.push(pcTex);
  const pcSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 1.0),
    new THREE.MeshBasicMaterial({ map: pcTex })
  );
  pcSign.position.set(0, 2.2, -0.18);
  pcSign.rotation.y = Math.PI;
  photoCorner.add(pcWall, pcSign);
  root.add(photoCorner);

  // Interactive Fish Feeder Stand (-2.8, -2.5)
  const feederGroup = new THREE.Group();
  feederGroup.position.set(-2.8, 0, -2.5);
  const fPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.2, 12), benchMat);
  fPost.position.y = 0.6;
  const fBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 })
  );
  fBowl.position.y = 1.35;
  feederGroup.add(fPost, fBowl);
  root.add(feederGroup);

  const interactions: InteractionTarget[] = [
    {
      id: 'view_shark',
      name: 'Terowongan Kaca Hiu',
      prompt: 'Liat Hiu Putih & Hiu Martil Berenang Bebas 🦈',
      icon: '🦈',
      actionType: 'fountain',
      x: 0,
      z: -2,
      radius: 3.6,
    },
    {
      id: 'feed_fish',
      name: 'Dispenser Pakan Ikan',
      prompt: 'Kasih Makan Ikan di Terowongan Aquarium 🦐',
      icon: '🦐',
      actionType: 'fountain',
      x: -2.8,
      z: -2.5,
      radius: 2.8,
    },
    {
      id: 'view_clownfish',
      name: 'Taman Koral & Ikan Badut',
      prompt: 'Liat Kawanan Nemo Main di Anemon Laut 🐠',
      icon: '🐠',
      actionType: 'fountain',
      x: 6,
      z: 0,
      radius: 3.5,
    },
    {
      id: 'aquarium_date',
      name: 'Bangku Santai Terowongan',
      prompt: 'Duduk Romantis Menikmati Cahaya Bawah Air 💖',
      icon: '🪑',
      actionType: 'sit',
      x: 0,
      z: 1.8,
      radius: 3.0,
    },
    {
      id: 'turtle_watch',
      name: 'Anjungan Penyu Raksasa',
      prompt: 'Amati Penyu Laut Berenang Santai 🐢',
      icon: '🐢',
      actionType: 'fountain',
      x: 0,
      z: 7,
      radius: 3.5,
    },
  ];

  const update = (time: number) => {
    sharks.forEach((s) => {
      const a = time * s.speed + s.phase;
      s.group.position.set(
        s.cx + Math.cos(a) * s.r,
        s.h + Math.sin(time * 0.9 + s.phase) * 0.42,
        s.cz + Math.sin(a) * s.r
      );
      s.group.rotation.y = -a - Math.PI / 2;
      s.tailFin.rotation.y = Math.sin(time * 5.2 + s.phase) * 0.38;
    });

    for (let i = 0; i < tunnelFishCount; i++) {
      const d = tfData[i];
      const a = time * d.speed + d.angleOffset;
      dummy.position.set(
        Math.cos(a) * d.radius,
        d.height + Math.sin(time * 1.4 + i) * 0.35,
        Math.sin(a) * d.radius
      );
      dummy.rotation.set(0, -a, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      tunnelFishInst.setMatrixAt(i, dummy.matrix);
    }
    tunnelFishInst.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < smallFishCount; i++) {
      const a = time * 0.9 + i * 0.4;
      const rad = 1.1 + (i % 3) * 0.6;
      dummy.position.set(Math.cos(a) * rad, 1.8 + (i % 5) * 0.6, Math.sin(a) * rad);
      dummy.rotation.set(0, -a, 0);
      dummy.updateMatrix();
      smallFishInst.setMatrixAt(i, dummy.matrix);
    }
    smallFishInst.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < clownFishCount; i++) {
      const a = time * 1.1 + i * 0.35;
      const rad = 1.0 + (i % 4) * 0.5;
      dummy.position.set(Math.cos(a) * rad, 1.6 + (i % 6) * 0.5, Math.sin(a) * rad);
      dummy.rotation.set(0, -a, 0);
      dummy.updateMatrix();
      clownFishInst.setMatrixAt(i, dummy.matrix);
    }
    clownFishInst.instanceMatrix.needsUpdate = true;

    heroClowns.forEach((hc) => {
      const a = time * 1.25 + hc.phase;
      hc.group.position.set(
        Math.cos(a) * hc.r,
        hc.h + Math.sin(time * 2.2 + hc.phase) * 0.22,
        Math.sin(a) * hc.r
      );
      hc.group.rotation.y = -a;
      hc.tail.rotation.y = Math.sin(time * 8 + hc.phase) * 0.45;
    });

    mantas.forEach((m) => {
      const a = time * 0.65 + m.phase;
      m.group.position.set(
        Math.cos(a) * m.r,
        m.h + Math.sin(time * 1.2 + m.phase) * 0.35,
        Math.sin(a) * m.r
      );
      m.group.rotation.y = -a;
      const flap = Math.sin(time * 3.2 + m.phase) * 0.28;
      m.wingL.rotation.z = Math.PI / 2 + flap;
      m.wingR.rotation.z = -Math.PI / 2 - flap;
    });

    turtles.forEach((t) => {
      const a = time * t.speed + t.phase;
      t.group.position.set(
        Math.cos(a) * t.r,
        t.h + Math.sin(time * 0.7 + t.phase) * 0.3,
        Math.sin(a) * t.r
      );
      t.group.rotation.y = -a - Math.PI / 2;
      const flap = Math.sin(time * 3.4 + t.phase) * 0.42;
      t.fL.rotation.z = flap;
      t.fR.rotation.z = -flap;
      t.bL.rotation.z = -flap * 0.45;
      t.bR.rotation.z = flap * 0.45;
    });

    jellies.forEach((j) => {
      const p = Math.sin(time * 2.5 + j.phase);
      j.group.position.y = j.baseY + Math.sin(time * 1.2 + j.phase) * 0.42;
      j.cap.scale.set(1 + p * 0.14, 1 - p * 0.14, 1 + p * 0.14);
      j.tentacles.forEach((ten, ti) => {
        ten.rotation.z = Math.sin(time * 3.2 + j.phase + ti) * 0.18;
      });
    });

    penguins.forEach((pg) => {
      pg.group.rotation.z = Math.sin(time * 4 + pg.phase) * 0.12;
      pg.group.position.x = pg.baseX + Math.sin(time * 0.8 + pg.phase) * 0.3;
    });

    octoGroup.position.y = 2.25 + Math.sin(time * 1.6) * 0.25;
    octoArms.forEach((arm, i) => {
      arm.rotation.x = Math.sin(time * 2.8 + i) * 0.42;
    });

    seahorses.forEach((sh) => {
      sh.group.position.y = sh.baseY + Math.sin(time * 2.1 + sh.phase) * 0.18;
      sh.group.rotation.y = Math.sin(time * 1.1 + sh.phase) * 0.45;
    });

    bubbleData.forEach((b, idx) => {
      const y = ((b.y + time * b.speed) % 16) + 4.5;
      dummy.position.set(Math.cos(b.angle) * b.radius, y, Math.sin(b.angle) * b.radius);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      bubbleInst.setMatrixAt(idx, dummy.matrix);
    });
    bubbleInst.instanceMatrix.needsUpdate = true;
  };

  const cleanup = () => {
    scene.remove(root);
    texturesToDispose.forEach((t) => t.dispose());
    disposeHierarchy(root);
  };

  return { interactions, update, cleanup };
}
