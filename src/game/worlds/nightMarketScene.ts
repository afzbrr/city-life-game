import * as THREE from 'three';
import { InteractionTarget } from '../types';
import { createReflectiveGlassMaterial } from '../pbrMaterials';
import {
  buildMotorbike,
  createAsphaltFestivalTexture,
  createTextSignTexture,
  disposeHierarchy,
} from './worldHelpers';

export function buildNightMarketScene(scene: THREE.Scene): {
  interactions: InteractionTarget[];
  update: (
    time: number,
    playerCar?: { active: boolean; x: number; z: number; yaw: number }
  ) => void;
  cleanup: () => void;
} {
  const root = new THREE.Group();
  scene.add(root);
  const signTextures: THREE.CanvasTexture[] = [];
  const dummy = new THREE.Object3D();

  // 1. ASPHALT GROUND, PICNIC MATS, LITTER CUPS, 10 PARKED MOTORBIKES
  const floorTex = createAsphaltFestivalTexture();
  const floorGeo = new THREE.PlaneGeometry(72, 72);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(
    floorGeo,
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 })
  );
  floor.receiveShadow = true;
  root.add(floor);

  // 4 Picnic Mats (Tikar) along plaza + Plastic Cup Litter
  const matColors = [0x0284c7, 0x16a34a, 0xe11d48, 0xf59e0b];
  [[-6, 3], [6, 3], [-6, -5], [6, -5]].forEach(([mx, mz], mi) => {
    const tikar = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.04, 1.9),
      new THREE.MeshStandardMaterial({ color: matColors[mi], roughness: 0.9 })
    );
    tikar.position.set(mx, 0.025, mz);
    root.add(tikar);
  });

  const cupLitterInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }),
    18
  );
  for (let li = 0; li < 18; li++) {
    dummy.position.set(-16 + (li * 7) % 32, 0.06, -12 + (li * 5) % 28);
    dummy.rotation.set(Math.PI / 2, li, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    cupLitterInst.setMatrixAt(li, dummy.matrix);
  }
  cupLitterInst.instanceMatrix.needsUpdate = true;
  root.add(cupLitterInst);

  // 10 Parked Motorbikes lined up near Entrance (East & West of Entrance Arch)
  const motoColors = [0xef4444, 0x0f172a, 0x3b82f6, 0xf8fafc, 0x16a34a, 0xf59e0b, 0xec4899, 0x64748b, 0xdc2626, 0x0284c7];
  for (let m = 0; m < 10; m++) {
    const moto = buildMotorbike(motoColors[m]);
    const mx = m < 5 ? -15 + m * 1.6 : 7.5 + (m - 5) * 1.6;
    moto.position.set(mx, 0, 21.5);
    moto.rotation.y = Math.PI;
    root.add(moto);
  }

  // 2. CRESCENT MOON + 60 TWINKLING STARS
  const moonGroup = new THREE.Group();
  moonGroup.position.set(22, 28, -28);
  moonGroup.add(
    new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfef08a })),
    (() => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 16), new THREE.MeshBasicMaterial({ color: 0x090d1a }));
      s.position.set(-0.9, 0.4, 0.4);
      return s;
    })()
  );
  root.add(moonGroup);

  const starCount = 60;
  const starInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.15, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    starCount
  );
  const starCoords = Array.from({ length: starCount }, () => {
    const a = Math.random() * Math.PI * 2;
    const d = 22 + Math.random() * 18;
    return { x: Math.cos(a) * d, y: 18 + Math.random() * 14, z: Math.sin(a) * d, phase: Math.random() * Math.PI * 2 };
  });
  root.add(starInst);

  // 3. FESTIVAL ENTRANCE ARCH + 100 STRING BULBS + BUNTING FLAGS + 20 BALLOONS + 10 BANNERS
  const archGroup = new THREE.Group();
  archGroup.position.set(0, 0, 18.5);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35 });
  [-4.5, 4.5].forEach((px) => {
    const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 5.2, 10), pillarMat);
    pil.position.set(px, 2.6, 0);
    archGroup.add(pil);
  });
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.3, 0.6), pillarMat);
  archTop.position.set(0, 5.2, 0);
  const archSignTex = createTextSignTexture('PASAR MALAM MERIAH 🎡', '#be123c', '#ffffff', '#fde047');
  signTextures.push(archSignTex);
  const archSign = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 1.15), new THREE.MeshBasicMaterial({ map: archSignTex }));
  archSign.position.set(0, 5.2, 0.32);
  archGroup.add(archTop, archSign);
  root.add(archGroup);

  // 100 Blinking String Bulbs crisscrossed across 5 streets (20 bulbs per line = 100!)
  const lightColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0xa855f7];
  const bulbCount = 100;
  const bulbInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.18, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    bulbCount
  );
  const bCol = new THREE.Color();
  const bulbCoords: { pos: THREE.Vector3; hex: number; phase: number }[] = [];
  const lines = [
    { s: new THREE.Vector3(-22, 6.8, -10), e: new THREE.Vector3(22, 6.8, -10) },
    { s: new THREE.Vector3(-22, 6.8, -2), e: new THREE.Vector3(22, 6.8, -2) },
    { s: new THREE.Vector3(-22, 6.8, 6), e: new THREE.Vector3(22, 6.8, 6) },
    { s: new THREE.Vector3(-22, 6.8, 14), e: new THREE.Vector3(22, 6.8, 14) },
    { s: new THREE.Vector3(0, 7.2, -16), e: new THREE.Vector3(0, 7.2, 18) },
  ];
  lines.forEach((ln, li) => {
    for (let bi = 0; bi < 20; bi++) {
      const t = bi / 19;
      const pos = new THREE.Vector3().lerpVectors(ln.s, ln.e, t);
      pos.y -= Math.sin(t * Math.PI) * 1.25;
      const hex = lightColors[(bi + li) % lightColors.length];
      bulbCoords.push({ pos, hex, phase: bi * 0.6 + li });
    }
  });
  root.add(bulbInst);

  // Colorful Bunting Pennant Flags (Instanced)
  const flagInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.28, 0.45, 3),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
    40
  );
  for (let fi = 0; fi < 40; fi++) {
    const fx = -20 + (fi % 20) * 2.1;
    const fz = fi < 20 ? 15.5 : -6.5;
    dummy.position.set(fx, 5.2, fz);
    dummy.rotation.set(Math.PI, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    flagInst.setMatrixAt(fi, dummy.matrix);
    flagInst.setColorAt(fi, bCol.setHex(lightColors[fi % lightColors.length]));
  }
  flagInst.instanceMatrix.needsUpdate = true;
  if (flagInst.instanceColor) flagInst.instanceColor.needsUpdate = true;
  root.add(flagInst);

  // 20 Floating Balloons + 5 Trash Bins + 2 Portable Toilets + 4 Big Stage Speakers
  for (let bl = 0; bl < 20; bl++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 8, 8),
      new THREE.MeshStandardMaterial({ color: lightColors[bl % lightColors.length], roughness: 0.25 })
    );
    b.scale.set(1, 1.2, 1);
    b.position.set(-18 + (bl % 10) * 4, 3.6 + (bl % 3) * 0.5, bl < 10 ? 15 : -14);
    root.add(b);
  }

  // 5 Trash Bins + 2 Portable Toilets
  const binMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
  [[-12, 9], [0, 9], [12, 9], [-12, -6], [12, -6]].forEach(([tx, tz]) => {
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.9, 10), binMat);
    bin.position.set(tx, 0.45, tz);
    root.add(bin);
  });

  [[-22, 16], [-19, 16]].forEach(([px, pz], pi) => {
    const wc = new THREE.Group();
    wc.position.set(px, 0, pz);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.5, 1.8),
      new THREE.MeshStandardMaterial({ color: pi === 0 ? 0x0284c7 : 0xec4899, roughness: 0.4 })
    );
    box.position.y = 1.25;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.2, 1.9), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    roof.position.y = 2.6;
    wc.add(box, roof);
    root.add(wc);
  });

  // 4. WAHANA 1: GIANT FERRIS WHEEL WITH 12 CABINS (0, 12, -17)
  const ferrisWheelGroup = new THREE.Group();
  ferrisWheelGroup.position.set(0, 12, -17);
  const wheelRimMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.8,
    metalness: 0.7,
    roughness: 0.25,
  });
  const rim1 = new THREE.Mesh(new THREE.TorusGeometry(9.6, 0.26, 10, 32), wheelRimMat);
  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(9.6, 0.26, 10, 32), wheelRimMat);
  rim2.position.z = 2.6;
  const hubMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 2.8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 })
  );
  hubMesh.rotation.x = Math.PI / 2;
  hubMesh.position.z = 1.3;
  ferrisWheelGroup.add(rim1, rim2, hubMesh);

  const cabins: THREE.Group[] = [];
  const cabinColors = [0xf43f5e, 0x38bdf8, 0xfbbf24, 0x10b981, 0xa855f7, 0xf97316, 0xec4899, 0x06b6d4];
  for (let ci = 0; ci < 12; ci++) {
    const ang = (ci / 12) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 19.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 })
    );
    spoke.rotation.z = ang;
    spoke.position.z = 1.3;
    ferrisWheelGroup.add(spoke);

    const cabin = new THREE.Group();
    const cabinBox = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: cabinColors[ci % cabinColors.length], roughness: 0.4 })
    );
    cabin.add(cabinBox);
    cabin.position.set(Math.cos(ang) * 9.6, Math.sin(ang) * 9.6, 1.3);
    ferrisWheelGroup.add(cabin);
    cabins.push(cabin);
  }
  const supportMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
  [-2.4, 2.4].forEach((sx) => {
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 24), supportMat);
    leg1.position.set(sx + 3.8, 0, -17);
    leg1.rotation.z = -0.32;
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 24), supportMat);
    leg2.position.set(sx - 3.8, 0, -17);
    leg2.rotation.z = 0.32;
    root.add(leg1, leg2);
  });
  root.add(ferrisWheelGroup);

  // WAHANA 2: CAROUSEL WITH 10 HORSES (-15, 0, -2)
  const carouselGroup = new THREE.Group();
  carouselGroup.position.set(-15, 0, -2);
  const carouselBase = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 6.0, 0.65, 24),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
  );
  carouselBase.position.y = 0.32;
  const carouselRoof = new THREE.Mesh(
    new THREE.ConeGeometry(6.2, 2.5, 24),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35 })
  );
  carouselRoof.position.y = 5.2;
  carouselGroup.add(carouselBase, carouselRoof);

  const rotatingHorseGroup = new THREE.Group();
  const horseRods: { horse: THREE.Group; phase: number }[] = [];
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
  const horseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const saddleMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
  for (let hi = 0; hi < 10; hi++) {
    const ha = (hi / 10) * Math.PI * 2;
    const hr = hi % 2 === 0 ? 4.3 : 2.8;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6), brassMat);
    pole.position.set(Math.cos(ha) * hr, 2.6, Math.sin(ha) * hr);
    rotatingHorseGroup.add(pole);

    const horse = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.72, 6, 8), horseMat);
    body.rotation.x = Math.PI / 2;
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.32, 6, 8), horseMat);
    neck.position.set(0, 0.34, 0.36);
    neck.rotation.x = 0.45;
    const hHead = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.22, 6, 8), horseMat);
    hHead.position.set(0, 0.54, 0.54);
    hHead.rotation.x = 1.25;
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.1, 0.42), saddleMat);
    saddle.position.set(0, 0.28, -0.05);
    horse.add(body, neck, hHead, saddle);
    horse.position.set(Math.cos(ha) * hr, 1.8, Math.sin(ha) * hr);
    // Tangent forward around carousel rotation
    horse.rotation.y = -ha;
    rotatingHorseGroup.add(horse);
    horseRods.push({ horse, phase: hi * 0.65 });
  }
  carouselGroup.add(rotatingHorseGroup);
  root.add(carouselGroup);

  // WAHANA 3: BUMPER CAR ARENA WITH 8 NEON CARS (13, 0, 6)
  const bumperArena = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 5.8, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
  );
  bumperArena.position.set(13, 0.12, 6);
  root.add(bumperArena);

  const bumperCars: { mesh: THREE.Group; phase: number; r: number }[] = [];
  for (let bIdx = 0; bIdx < 8; bIdx++) {
    const bCol = lightColors[bIdx % lightColors.length];
    const car = new THREE.Group();
    const hull = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.48, 0.78, 6, 10),
      new THREE.MeshStandardMaterial({ color: bCol, emissive: bCol, emissiveIntensity: 0.28, roughness: 0.3 })
    );
    hull.rotation.x = Math.PI / 2;
    hull.position.y = 0.48;
    const seatBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    seatBase.position.set(0, 0.55, -0.08);
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.025, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    wheel.position.set(0, 0.88, 0.38);
    wheel.rotation.x = -0.5;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.1, 6, 14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.36;
    car.add(hull, seatBase, wheel, ring);
    root.add(car);
    bumperCars.push({ mesh: car, phase: bIdx * 0.85, r: 1.8 + (bIdx % 3) * 1.15 });
  }

  // WAHANA 4: 3 CLAW MACHINES EACH WITH 20 PLUSHIES INSIDE (-10, 0, 7)
  const clawArms: THREE.Mesh[] = [];
  const clawGlass = createReflectiveGlassMaterial(0xfbcfe8, 0.3);
  [-12.6, -10.0, -7.4].forEach((cx, ci) => {
    const clawGroup = new THREE.Group();
    clawGroup.position.set(cx, 0, 7);
    const cBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.05, 1.9),
      new THREE.MeshStandardMaterial({ color: ci === 1 ? 0xec4899 : 0x8b5cf6, emissive: 0x4c1d95, emissiveIntensity: 0.35 })
    );
    cBase.position.y = 0.52;
    const cGlass = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.7, 1.75), clawGlass);
    cGlass.position.y = 1.9;
    const cTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.45, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.45 })
    );
    cTop.position.y = 2.95;
    clawGroup.add(cBase, cGlass, cTop);

    const clawArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
    );
    clawArm.position.y = 2.25;
    clawGroup.add(clawArm);
    clawArms.push(clawArm);

    // 20 Plushies packed inside EACH machine
    const plushInst = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.18, 7, 7),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
      20
    );
    for (let pi = 0; pi < 20; pi++) {
      const col = pi % 4;
      const row = Math.floor(pi / 4) % 3;
      const layer = Math.floor(pi / 12);
      dummy.position.set(-0.6 + col * 0.4, 1.2 + layer * 0.28, -0.5 + row * 0.48);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      plushInst.setMatrixAt(pi, dummy.matrix);
      plushInst.setColorAt(pi, bCol.setHex(lightColors[(pi + ci) % lightColors.length]));
    }
    plushInst.instanceMatrix.needsUpdate = true;
    if (plushInst.instanceColor) plushInst.instanceColor.needsUpdate = true;
    clawGroup.add(plushInst);
    root.add(clawGroup);
  });

  // WAHANA 5: HAUNTED HOUSE WITH DOOR & SKULLS (-16, 0, -14)
  const hauntedGroup = new THREE.Group();
  hauntedGroup.position.set(-16, 0, -14);
  const hBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 4.5, 5.2),
    new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.7 })
  );
  hBuilding.position.y = 2.25;
  const hRoof = new THREE.Mesh(
    new THREE.ConeGeometry(5.2, 2.6, 4),
    new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6 })
  );
  hRoof.position.y = 5.6;
  hRoof.rotation.y = Math.PI / 4;
  const hDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 2.7, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x090d1a })
  );
  hDoor.position.set(0, 1.35, 2.62);
  // Glowing Skulls flanking entrance
  [-1.6, 1.6].forEach((sx) => {
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0xa855f7, emissiveIntensity: 0.35 })
    );
    skull.position.set(sx, 2.6, 2.75);
    hauntedGroup.add(skull);
  });
  const hSignTex = createTextSignTexture('RUMAH HANTU 👻', '#1e1b4b', '#fde047', '#a855f7');
  signTextures.push(hSignTex);
  const hSign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.0), new THREE.MeshBasicMaterial({ map: hSignTex }));
  hSign.position.set(0, 3.7, 2.65);
  hauntedGroup.add(hBuilding, hRoof, hDoor, hSign);
  root.add(hauntedGroup);

  // WAHANA 6 & 7: BALLOON POP GALLERY (50 Balloons) & RING TOSS (30 Bottles)
  const tossGroup = new THREE.Group();
  tossGroup.position.set(15, 0, -13);
  const tBooth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.3, 2.6), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
  tBooth.position.y = 0.65;
  const tBackWall = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 0.3), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  tBackWall.position.set(0, 1.8, -1.2);
  const tRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }));
  tRoof.position.y = 4.0;
  tRoof.rotation.y = Math.PI / 4;
  const tSignTex = createTextSignTexture('TEMBAK BALON & GELANG ⚾', '#0284c7', '#ffffff', '#fde047');
  signTextures.push(tSignTex);
  const tSign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.85), new THREE.MeshBasicMaterial({ map: tSignTex }));
  tSign.position.set(0, 3.2, 1.35);
  tossGroup.add(tBooth, tBackWall, tRoof, tSign);

  // 50 Target Balloons on Back Wall (Instanced)
  const popBalloonInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.18, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }),
    50
  );
  for (let bi = 0; bi < 50; bi++) {
    const col = bi % 10;
    const row = Math.floor(bi / 10);
    dummy.position.set(-2.2 + col * 0.48, 1.35 + row * 0.42, -0.95);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1.2, 1);
    dummy.updateMatrix();
    popBalloonInst.setMatrixAt(bi, dummy.matrix);
    popBalloonInst.setColorAt(bi, bCol.setHex(lightColors[bi % lightColors.length]));
  }
  popBalloonInst.instanceMatrix.needsUpdate = true;
  if (popBalloonInst.instanceColor) popBalloonInst.instanceColor.needsUpdate = true;
  tossGroup.add(popBalloonInst);

  // 30 Ring-Toss Bottles on Counter (Instanced)
  const bottleInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.34, 7),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 }),
    30
  );
  for (let bti = 0; bti < 30; bti++) {
    const col = bti % 10;
    const row = Math.floor(bti / 10);
    dummy.position.set(-2.2 + col * 0.48, 1.48, 0.2 + row * 0.36);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    bottleInst.setMatrixAt(bti, dummy.matrix);
  }
  bottleInst.instanceMatrix.needsUpdate = true;
  tossGroup.add(bottleInst);
  root.add(tossGroup);

  // WAHANA 8: OMBAK BANYU WAVE RIDE (20, 0, -14)
  const ombakGroup = new THREE.Group();
  ombakGroup.position.set(21, 0, -15);
  const ombakBase = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 4.2, 0.6, 18),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3 })
  );
  ombakBase.position.y = 0.3;
  const ombakRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.5, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35 })
  );
  ombakRing.rotation.x = Math.PI / 2;
  ombakRing.position.y = 1.2;
  ombakGroup.add(ombakBase, ombakRing);
  root.add(ombakGroup);

  // 5. LIVE STAGE + 4 BIG SPEAKERS (16, 0, -2)
  const stageGroup = new THREE.Group();
  stageGroup.position.set(16, 0, -2);
  const stagePlat = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.9, 7.5), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 }));
  stagePlat.position.y = 0.45;
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 }));
  carpet.rotateX(-Math.PI / 2);
  carpet.position.y = 0.91;
  stageGroup.add(stagePlat, carpet);

  // 4 Big PA Speakers on Stage Corners
  [[-3.2, -3.2], [3.2, -3.2], [-3.2, 3.2], [3.2, 3.2]].forEach(([sx, sz]) => {
    const spk = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.0, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x090d1a, roughness: 0.6 })
    );
    spk.position.set(sx, 1.9, sz);
    stageGroup.add(spk);
  });

  const spotColors = [0xec4899, 0x38bdf8, 0xfacc15];
  const spotCones: { cone: THREE.Mesh; phase: number }[] = [];
  [-1.8, 0, 1.8].forEach((sx, sIdx) => {
    const sCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 5.0, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: spotColors[sIdx], transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    sCone.position.set(sx, 3.0, 0);
    sCone.rotation.x = 0.5;
    stageGroup.add(sCone);
    spotCones.push({ cone: sCone, phase: sIdx * 1.5 });
  });
  root.add(stageGroup);

  // 6. 12 FULL FOOD & SNACK KIOSKS (Every kiosk has awning, bulb, table full of food, sauce bottles, stacked plates, price banner & plastic stools!)
  const stallWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const foodStalls = [
    // South lane 5 main stalls
    { x: -14, z: 12, rotY: 0, label: 'CILOK PEDAS 🍢', price: 'Rp 5.000', color: 0xe11d48, bgHex: '#e11d48' },
    { x: -7, z: 12, rotY: 0, label: 'SOSIS BAKAR 🌭', price: 'Rp 10.000', color: 0xea580c, bgHex: '#ea580c' },
    { x: 0, z: 12, rotY: 0, label: 'JAGUNG BAKAR 🌽', price: 'Rp 8.000', color: 0x059669, bgHex: '#059669' },
    { x: 7, z: 12, rotY: 0, label: 'ES TEH BOBA 🧋', price: 'Rp 7.000', color: 0x0284c7, bgHex: '#0284c7' },
    { x: 14, z: 12, rotY: 0, label: 'GULALI MANIS 🍭', price: 'Rp 6.000', color: 0xdb2777, bgHex: '#db2777' },
    // Additional 7 kiosks along East & West market rows (= 12 kiosks total!)
    { x: -22, z: 10, rotY: Math.PI / 2, label: 'MARTABAK MINI 🥞', price: 'Rp 12.000', color: 0xf59e0b, bgHex: '#b45309' },
    { x: -22, z: 4, rotY: Math.PI / 2, label: 'BAKSO BAKAR 🍡', price: 'Rp 10.000', color: 0xef4444, bgHex: '#991b1b' },
    { x: -22, z: -2, rotY: Math.PI / 2, label: 'KERAK TELOR 🍳', price: 'Rp 15.000', color: 0x16a34a, bgHex: '#166534' },
    { x: -22, z: -8, rotY: Math.PI / 2, label: 'TAKOYAKI 🐙', price: 'Rp 12.000', color: 0xa855f7, bgHex: '#6b21a8' },
    { x: 22, z: 10, rotY: -Math.PI / 2, label: 'TAHU BULAT 🟡', price: 'Rp 5.000', color: 0xfacc15, bgHex: '#854d0e' },
    { x: 22, z: 4, rotY: -Math.PI / 2, label: 'ES KEPAL MILO 🍧', price: 'Rp 10.000', color: 0x3b82f6, bgHex: '#1d4ed8' },
    { x: 22, z: -8, rotY: -Math.PI / 2, label: 'KUE CUBIT 🧁', price: 'Rp 8.000', color: 0xec4899, bgHex: '#9d174d' },
  ];

  foodStalls.forEach((st) => {
    const stall = new THREE.Group();
    stall.position.set(st.x, 0, st.z);
    stall.rotation.y = st.rotY;

    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 2.2), stallWoodMat);
    counter.position.y = 0.7;
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 1.2, 4),
      new THREE.MeshStandardMaterial({ color: st.color, roughness: 0.4 })
    );
    roof.position.y = 3.3;
    roof.rotation.y = Math.PI / 4;
    stall.add(counter, roof);

    [-1.9, 1.9].forEach((px) => {
      [-0.9, 0.9].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6), stallWoodMat);
        post.position.set(px, 1.9, pz);
        stall.add(post);
      });
    });

    // Hanging Warm Bulb inside Kiosk
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bulb.position.set(0, 2.45, 0);
    stall.add(bulb);

    // Food Trays + Sauce Bottles + Stacked Plates on Counter
    [0xfacc15, 0xef4444, 0x16a34a].forEach((fc, fi) => {
      const foodDish = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.16, 0.45),
        new THREE.MeshStandardMaterial({ color: fc })
      );
      foodDish.position.set(-1.1 + fi * 0.75, 1.48, 0.25);
      const sauce = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.24, 6),
        new THREE.MeshStandardMaterial({ color: fc })
      );
      sauce.position.set(0.9 + fi * 0.18, 1.54, -0.35);
      stall.add(foodDish, sauce);
    });
    for (let pl = 0; pl < 4; pl++) {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.15, 0.04, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      plate.position.set(1.3, 1.44 + pl * 0.045, 0.4);
      stall.add(plate);
    }

    // 2 Plastic Stools in front of Kiosk
    [-1.0, 1.0].forEach((sx) => {
      const stool = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.48, 0.45),
        new THREE.MeshStandardMaterial({ color: st.color })
      );
      stool.position.set(sx, 0.24, -1.6);
      stall.add(stool);
    });

    // Menu Banner with Price
    const stTex = createTextSignTexture(st.label, st.bgHex, '#ffffff', '#fde047', st.price);
    signTextures.push(stTex);
    const stSign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.8), new THREE.MeshBasicMaterial({ map: stTex }));
    stSign.position.set(0, 2.65, -1.2);
    stSign.rotation.y = Math.PI;
    stall.add(stSign);

    root.add(stall);
  });

  // Rising Satay Grill Smoke Particles + Tukang Sate Fanning Grill (Kipas-kipas!)
  const smokeMeshes: THREE.Mesh[] = [];
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.36 });
  for (let sm = 0; sm < 8; sm++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), smokeMat);
    puff.position.set(-7 + (sm % 2) * 0.5, 2.4, 12);
    root.add(puff);
    smokeMeshes.push(puff);
  }

  const vendorGroup = new THREE.Group();
  vendorGroup.position.set(-7.1, 0, 12.8);
  const vApron = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.65 });
  const vBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 6, 8), vApron);
  vBody.position.y = 1.28;
  const vHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfde0c8 }));
  vHead.position.y = 1.84;
  const fanArmPivot = new THREE.Group();
  fanArmPivot.position.set(0.28, 1.48, -0.15);
  const vArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.34, 4, 6), vApron);
  vArm.rotation.x = -0.8;
  vArm.position.z = -0.18;
  const bambooFan = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.24, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
  );
  bambooFan.position.set(0, -0.05, -0.4);
  fanArmPivot.add(vArm, bambooFan);
  vendorGroup.add(vBody, vHead, fanArmPivot);
  root.add(vendorGroup);

  const interactions: InteractionTarget[] = [
    { id: 'ferris_wheel', name: 'Bianglala Raksasa', prompt: 'Naik Bianglala: Liat Lampu Kota 🎡', icon: '🎡', actionType: 'sit', x: 0, z: -12, radius: 4.8 },
    { id: 'carousel', name: 'Komidi Putar Musik', prompt: 'Naik Kuda Komidi Putar Karnaval 🎠', icon: '🎠', actionType: 'sit', x: -15, z: -2, radius: 4.5 },
    { id: 'bumper_cars', name: 'Arena Bom-Bom Car', prompt: 'Main Bom-Bom Car Tabrak Seru (+30 Koin 🚗)', icon: '🚗', actionType: 'sit', x: 13, z: 6, radius: 4.2 },
    { id: 'claw_machine', name: 'Mesin Capit Boneka', prompt: 'Main Capit Boneka Gemoy (15 Koin 🧸)', icon: '🧸', actionType: 'fountain', x: -10, z: 7, radius: 3.2 },
    { id: 'haunted_house', name: 'Rumah Hantu Misteri', prompt: 'Uji Nyali Masuk Rumah Hantu (+100 Koin 👻)', icon: '👻', actionType: 'fountain', x: -16, z: -11.5, radius: 3.8 },
    { id: 'carnival_toss', name: 'Permainan Lempar Kaleng', prompt: 'Lempar Bola Kaleng & Tembak Balon ⚾', icon: '⚾', actionType: 'fountain', x: 15, z: -11, radius: 3.5 },
    { id: 'food_cilok', name: 'Stand Cilok Bumbu Kacang', prompt: 'Beli Cilok Kenyal Bumbu Kacang (15 Koin 🍢)', icon: '🍢', actionType: 'icecream', x: -14, z: 12, radius: 3.4 },
    { id: 'food_sosis', name: 'Stand Sosis Bakar Jumbo', prompt: 'Beli Sosis Bakar BBQ (20 Koin 🌭)', icon: '🌭', actionType: 'icecream', x: -7, z: 12, radius: 3.4 },
    { id: 'food_jagung', name: 'Stand Jagung Bakar Manis', prompt: 'Beli Jagung Bakar Mentega (15 Koin 🌽)', icon: '🌽', actionType: 'icecream', x: 0, z: 12, radius: 3.4 },
    { id: 'food_esteh', name: 'Stand Es Teh Manis Jumbo', prompt: 'Beli Es Teh Jumbo Segar (10 Koin 🧋)', icon: '🧋', actionType: 'icecream', x: 7, z: 12, radius: 3.4 },
    { id: 'food_gulali', name: 'Stand Gulali Arum Manis', prompt: 'Beli Gulali Kapas Pink (15 Koin 🍭)', icon: '🍭', actionType: 'icecream', x: 14, z: 12, radius: 3.4 },
    { id: 'live_stage', name: 'Panggung Musik Akustik', prompt: 'Ikut Nyanyi & Joget di Depan Panggung 🎤', icon: '🎤', actionType: 'fountain', x: 16, z: 2, radius: 4.2 },
  ];

  const update = (
    time: number,
    playerCar?: { active: boolean; x: number; z: number; yaw: number }
  ) => {
    ferrisWheelGroup.rotation.z = time * 0.22;
    cabins.forEach((c) => {
      c.rotation.z = -ferrisWheelGroup.rotation.z;
    });

    rotatingHorseGroup.rotation.y = time * 0.7;
    horseRods.forEach((hr) => {
      hr.horse.position.y = 1.8 + Math.sin(time * 3 + hr.phase) * 0.3;
    });

    ombakRing.rotation.z = Math.sin(time * 2.2) * 0.25;
    ombakRing.rotation.y = time * 1.4;

    bumperCars.forEach((bc, bi) => {
      if (bi === 0 && playerCar && playerCar.active) {
        bc.mesh.position.set(playerCar.x, 0.25, playerCar.z);
        bc.mesh.rotation.y = playerCar.yaw;
      } else {
        const a = time * 1.4 + bc.phase;
        bc.mesh.position.set(13 + Math.cos(a) * bc.r, 0.25, 6 + Math.sin(a * 1.15) * bc.r);
        bc.mesh.rotation.y = -a;
      }
    });

    fanArmPivot.rotation.z = Math.sin(time * 9.5) * 0.45;

    clawArms.forEach((arm, ci) => {
      arm.position.x = Math.sin(time * 1.5 + ci) * 0.55;
      arm.position.z = Math.cos(time * 1.1 + ci) * 0.45;
    });

    smokeMeshes.forEach((sm, si) => {
      const cycle = (time * 0.55 + si * 0.32) % 2.4;
      sm.position.y = 2.3 + cycle * 1.3;
      sm.position.x = -7 + Math.sin(time * 2 + si) * 0.35;
      sm.scale.setScalar(0.8 + cycle * 0.55);
    });

    starCoords.forEach((st, idx) => {
      const tw = (Math.sin(time * 2.5 + st.phase) + 1) * 0.5;
      dummy.position.set(st.x, st.y, st.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.65 + tw * 0.55);
      dummy.updateMatrix();
      starInst.setMatrixAt(idx, dummy.matrix);
    });
    starInst.instanceMatrix.needsUpdate = true;

    // 100 Blinking String Bulbs
    bulbCoords.forEach((bc, idx) => {
      const isBright = Math.sin(time * 4.5 + bc.phase) > 0;
      dummy.position.copy(bc.pos);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(isBright ? 1.15 : 0.72);
      dummy.updateMatrix();
      bulbInst.setMatrixAt(idx, dummy.matrix);
      bCol.setHex(bc.hex).multiplyScalar(isBright ? 1.0 : 0.42);
      bulbInst.setColorAt(idx, bCol);
    });
    bulbInst.instanceMatrix.needsUpdate = true;
    if (bulbInst.instanceColor) bulbInst.instanceColor.needsUpdate = true;

    spotCones.forEach((sp) => {
      sp.cone.rotation.y = Math.sin(time * 1.5 + sp.phase) * 0.4;
    });
  };

  const cleanup = () => {
    scene.remove(root);
    floorTex.dispose();
    archSignTex.dispose();
    signTextures.forEach((t) => t.dispose());
    disposeHierarchy(root);
  };

  return { interactions, update, cleanup };
}
