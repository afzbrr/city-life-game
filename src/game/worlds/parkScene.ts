import * as THREE from 'three';
import { InteractionTarget } from '../types';
import {
  createGradientSkyDome,
  createGrassPBRMaterial,
  createPavingPBRMaterial,
  createWaterPBRMaterial,
  createWoodPBRMaterial,
} from '../pbrMaterials';
import {
  buildBicycle,
  createParkGrassTexture,
  createTextSignTexture,
  disposeHierarchy,
} from './worldHelpers';

export function buildParkScene(scene: THREE.Scene): {
  interactions: InteractionTarget[];
  update: (time: number, swingOverrideAngle?: number) => void;
  cleanup: () => void;
} {
  const root = new THREE.Group();
  scene.add(root);

  const signTexturesToDispose: THREE.CanvasTexture[] = [];

  // 1. Sunset Warm Sky Dome + PBR Lush Textured Lawn & Winding Cobblestone Paths
  const parkSkyDome = new THREE.Mesh(
    new THREE.SphereGeometry(62, 24, 16),
    createGradientSkyDome(0x2563eb, 0xfdba74, 0xfef3c7)
  );
  root.add(parkSkyDome);

  const grassTex = createParkGrassTexture();
  const parkGrassMat = createGrassPBRMaterial('#368a2e', '#1f591a', 14, 14);
  const stoneMat = createPavingPBRMaterial('#cbd5e1', '#64748b', 10, 10);
  const parkWoodMat = createWoodPBRMaterial('#854d0e', '#451a03', 2, 2);
  const trimStoneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });

  const groundGeo = new THREE.PlaneGeometry(66, 66);
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, parkGrassMat);
  ground.receiveShadow = true;
  root.add(ground);

  // Center Plaza + Winding Outer & Inner Ring Paving + Serpentine Stepping Stones
  const plazaCenter = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.4, 0.06, 36), stoneMat);
  plazaCenter.position.set(0, 0.03, 0);
  plazaCenter.receiveShadow = true;
  root.add(plazaCenter);

  const outerLoopPath = new THREE.Mesh(new THREE.RingGeometry(13.2, 17.6, 48), stoneMat);
  outerLoopPath.rotateX(-Math.PI / 2);
  outerLoopPath.position.set(0, 0.035, 0);
  outerLoopPath.receiveShadow = true;
  root.add(outerLoopPath);

  const midLoopPath = new THREE.Mesh(new THREE.RingGeometry(8.5, 10.6, 44), stoneMat);
  midLoopPath.rotateX(-Math.PI / 2);
  midLoopPath.position.set(0, 0.032, 0);
  midLoopPath.receiveShadow = true;
  root.add(midLoopPath);

  const pathH = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 48).rotateX(-Math.PI / 2), stoneMat);
  pathH.position.set(0, 0.038, 0);
  pathH.receiveShadow = true;
  const pathV = new THREE.Mesh(new THREE.PlaneGeometry(48, 4.4).rotateX(-Math.PI / 2), stoneMat);
  pathV.position.set(0, 0.038, 0);
  pathV.receiveShadow = true;
  root.add(pathH, pathV);

  // Winding serpentine garden stone stepping paths
  const stepGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.06, 12);
  for (let si = 0; si < 36; si++) {
    const t = (si / 36) * Math.PI * 2;
    const rad = 11.8 + Math.sin(t * 4) * 1.4;
    const step = new THREE.Mesh(stepGeo, trimStoneMat);
    step.position.set(Math.cos(t) * rad, 0.03, Math.sin(t) * rad);
    root.add(step);
  }

  // 2. SUN & DRIFTING PUFFY CLOUDS
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  );
  sunMesh.position.set(28, 32, -28);
  root.add(sunMesh);

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    transparent: true,
    opacity: 0.9,
  });
  const clouds: { group: THREE.Group; speed: number; startX: number }[] = [];
  const cloudSphereGeo = new THREE.SphereGeometry(1, 10, 10);
  [
    { x: -22, y: 22, z: -15, s: 1.1, spd: 0.5 },
    { x: 5, y: 24, z: -20, s: 1.4, spd: 0.4 },
    { x: -12, y: 26, z: 12, s: 0.95, spd: 0.6 },
    { x: 18, y: 21, z: 10, s: 1.2, spd: 0.45 },
    { x: -5, y: 25, z: -8, s: 1.3, spd: 0.55 },
  ].forEach((cd) => {
    const cg = new THREE.Group();
    [
      [0, 0, 0, 1.6],
      [1.4, 0.3, 0, 2.1],
      [2.8, -0.2, 0, 1.4],
      [-1.3, -0.1, 0, 1.5],
    ].forEach(([bx, by, bz, r]) => {
      const puff = new THREE.Mesh(cloudSphereGeo, cloudMat);
      puff.scale.setScalar(r * cd.s);
      puff.position.set(bx * cd.s, by * cd.s, bz * cd.s);
      cg.add(puff);
    });
    cg.position.set(cd.x, cd.y, cd.z);
    root.add(cg);
    clouds.push({ group: cg, speed: cd.spd, startX: cd.x });
  });

  // 3. PERIMETER WHITE PICKET FENCE (Instanced)
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
  const buildRail = (w: number, d: number, x: number, y: number, z: number) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), fenceMat);
    r.position.set(x, y, z);
    root.add(r);
  };
  [26, -26].forEach((coord) => {
    buildRail(0.08, 52, coord, 0.45, 0);
    buildRail(0.08, 52, coord, 0.85, 0);
    buildRail(52, 0.08, 0, 0.45, coord);
    buildRail(52, 0.08, 0, 0.85, coord);
  });

  const picketCoords: { x: number; z: number; rotY: number }[] = [];
  for (let p = -25; p <= 25; p += 1.6) {
    if (Math.abs(p) < 3.5) continue;
    picketCoords.push({ x: 26, z: p, rotY: Math.PI / 2 });
    picketCoords.push({ x: -26, z: p, rotY: Math.PI / 2 });
    picketCoords.push({ x: p, z: 26, rotY: 0 });
    picketCoords.push({ x: p, z: -26, rotY: 0 });
  }
  const picketInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.16, 1.15, 0.08),
    fenceMat,
    picketCoords.length
  );
  const dummy = new THREE.Object3D();
  picketCoords.forEach((pc, idx) => {
    dummy.position.set(pc.x, 0.58, pc.z);
    dummy.rotation.set(0, pc.rotY, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    picketInst.setMatrixAt(idx, dummy.matrix);
  });
  picketInst.instanceMatrix.needsUpdate = true;
  root.add(picketInst);

  // 4. GRAND TIERED FOUNTAIN WITH 4 WATER JETS (4 Pancuran!)
  const fountainGroup = new THREE.Group();
  const outerBasin = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.95, 0.72, 32), trimStoneMat);
  outerBasin.position.y = 0.36;
  outerBasin.castShadow = true;
  outerBasin.receiveShadow = true;
  fountainGroup.add(outerBasin);

  const waterPool = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.4, 0.68, 32),
    createWaterPBRMaterial(0x0ea5e9, 0.88)
  );
  waterPool.position.y = 0.42;
  fountainGroup.add(waterPool);

  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.78, 1.9, 16), trimStoneMat);
  p1.position.y = 1.25;
  const bowl1 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 0.5, 0.55, 24), trimStoneMat);
  bowl1.position.y = 2.2;
  const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.0, 16), trimStoneMat);
  p2.position.y = 2.85;
  const bowlTop = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), trimStoneMat);
  bowlTop.position.y = 3.45;
  fountainGroup.add(p1, bowl1, p2, bowlTop);

  // 4 Cardinal Spouts around the basin
  for (let sp = 0; sp < 4; sp++) {
    const sa = (sp / 4) * Math.PI * 2;
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.55, 10), trimStoneMat);
    spout.position.set(Math.cos(sa) * 3.1, 0.85, Math.sin(sa) * 3.1);
    spout.rotation.z = Math.PI / 4;
    spout.rotation.y = -sa;
    fountainGroup.add(spout);
  }

  // 48 Water droplets forming 4 directional arcs + center crown
  const sprayCount = 48;
  const sprayInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.085, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xbae6fd }),
    sprayCount
  );
  fountainGroup.add(sprayInst);
  root.add(fountainGroup);

  // 5. GAZEBO / WOODEN PERGOLA (-11, 0, -4)
  const pergolaGroup = new THREE.Group();
  pergolaGroup.position.set(-11, 0, -4);
  const stoneDeck = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.18, 8), trimStoneMat);
  stoneDeck.position.y = 0.09;
  pergolaGroup.add(stoneDeck);
  [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.6, 10), darkWoodMat);
    pillar.position.set(px, 1.8, pz);
    pillar.castShadow = true;
    pergolaGroup.add(pillar);
  });
  for (let b = -2.2; b <= 2.2; b += 0.9) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 0.16), darkWoodMat);
    beam.position.set(0, 3.65, b);
    pergolaGroup.add(beam);
  }
  const gTable = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 20), darkWoodMat);
  gTable.position.y = 0.85;
  const gLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 0.75, 12), darkWoodMat);
  gLeg.position.y = 0.45;
  const gBench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.65), darkWoodMat);
  gBench.position.set(0, 0.55, 1.6);
  pergolaGroup.add(gTable, gLeg, gBench);
  root.add(pergolaGroup);

  // 6. KOI POND & WOODEN ARCHED BRIDGE (11.5, 0, -11.5)
  const pondGroup = new THREE.Group();
  pondGroup.position.set(11.5, 0, -11.5);
  const pondWater = new THREE.Mesh(
    new THREE.CylinderGeometry(4.3, 4.3, 0.08, 28),
    createWaterPBRMaterial(0x0284c7, 0.85)
  );
  pondWater.position.y = 0.04;
  pondGroup.add(pondWater);
  const pondRim = new THREE.Mesh(
    new THREE.TorusGeometry(4.35, 0.28, 8, 28),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })
  );
  pondRim.rotation.x = Math.PI / 2;
  pondRim.position.y = 0.15;
  pondGroup.add(pondRim);

  for (let i = -3; i <= 3; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.65), darkWoodMat);
    const arcY = 0.45 + Math.cos((i / 3) * (Math.PI / 2)) * 0.65;
    plank.position.set(0, arcY, i * 0.72);
    plank.rotation.x = -i * 0.11;
    pondGroup.add(plank);
  }
  const koiMeshes: THREE.Mesh[] = [];
  const koiColors = [0xf97316, 0xfef08a, 0xf43f5e, 0xffffff, 0xf97316, 0xf59e0b];
  for (let k = 0; k < 6; k++) {
    const koi = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.55, 6),
      new THREE.MeshStandardMaterial({ color: koiColors[k], roughness: 0.3 })
    );
    koi.rotation.x = Math.PI / 2;
    pondGroup.add(koi);
    koiMeshes.push(koi);
  }
  root.add(pondGroup);

  // 7. 10 WOODEN & IRON PARK BENCHES (preserving east 5.6,0 & west -5.6,0)
  const benchWoodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 });
  const buildParkBench = (bx: number, bz: number, rotY: number) => {
    const bench = new THREE.Group();
    bench.position.set(bx, 0, bz);
    bench.rotation.y = rotY;
    [-1.4, 1.4].forEach((ax) => {
      const armCurve = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 14, Math.PI), ironMat);
      armCurve.position.set(ax, 0.85, 0);
      const bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.85), ironMat);
      bLeg.position.set(ax, 0.32, 0);
      bench.add(armCurve, bLeg);
    });
    for (let si = 0; si < 4; si++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 0.16), benchWoodMat);
      slat.position.set(0, 0.66, -0.28 + si * 0.19);
      slat.castShadow = true;
      bench.add(slat);
    }
    for (let bi = 0; bi < 3; bi++) {
      const bSlat = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.16, 0.06), benchWoodMat);
      bSlat.position.set(0, 0.95 + bi * 0.22, -0.38);
      bench.add(bSlat);
    }
    root.add(bench);
  };
  [
    [5.6, 0, -Math.PI / 2],
    [-5.6, 0, Math.PI / 2],
    [0, 5.6, Math.PI],
    [0, -5.6, 0],
    [11, 11, -Math.PI * 0.75],
    [-11, 11, Math.PI * 0.75],
    [15, -1, -Math.PI / 2],
    [-15, 1, Math.PI / 2],
    [-7, -15, 0],
    [7, -15, 0],
  ].forEach(([bx, bz, ry]) => buildParkBench(bx, bz, ry));

  // 8. 6 PARK STREET LAMPS + 4 TRASH BINS + 2 PUBLIC TOILETS + INFO BOARD
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const buildStreetLamp = (lx: number, lz: number, withLight: boolean) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, 0, lz);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 4.4, 10), ironMat);
    pole.position.y = 2.2;
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.6, 6), ironMat);
    lantern.position.y = 4.5;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), lampGlowMat);
    bulb.position.y = 4.5;
    lamp.add(pole, lantern, bulb);
    if (withLight) {
      const light = new THREE.PointLight(0xfef08a, 0.35, 9);
      light.position.y = 4.4;
      lamp.add(light);
    }
    root.add(lamp);
  };
  [
    [-4.2, 4.2, true],
    [4.2, -4.2, true],
    [0, -9.5, true],
    [9.5, 9.5, false],
    [-9.5, -9.5, false],
    [0, 14.5, false],
  ].forEach(([lx, lz, wl]) => buildStreetLamp(lx as number, lz as number, wl as boolean));

  // 4 Trash Bins
  const binMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
  const binLidMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  [[-3.6, 6.2], [3.6, -6.2], [13.5, 2.2], [-12.5, 10.5]].forEach(([tx, tz]) => {
    const bin = new THREE.Group();
    bin.position.set(tx, 0, tz);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.85, 12), binMat);
    body.position.y = 0.42;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 12), binLidMat);
    lid.position.y = 0.95;
    bin.add(body, lid);
    root.add(bin);
  });

  // 2 Public Toilets (NW outer corner & NE outer corner)
  const toiletWallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const toiletRoofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  [
    { x: -21, z: -20, label: 'TOILET PRIA 🚻' },
    { x: -17, z: -20, label: 'TOILET WANITA 🚻' },
  ].forEach((tl) => {
    const wc = new THREE.Group();
    wc.position.set(tl.x, 0, tl.z);
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 2.6), toiletWallMat);
    box.position.y = 1.4;
    box.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.9, 4), toiletRoofMat);
    roof.position.y = 3.25;
    roof.rotation.y = Math.PI / 4;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.1), darkWoodMat);
    door.position.set(0, 1.05, 1.32);
    const tTex = createTextSignTexture(tl.label, '#0369a1', '#ffffff', '#bae6fd');
    signTexturesToDispose.push(tTex);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.55), new THREE.MeshBasicMaterial({ map: tTex }));
    sign.position.set(0, 2.55, 1.35);
    wc.add(box, roof, door, sign);
    root.add(wc);
  });

  // Park Info Board near South Entrance (3.8, 0, 17.5)
  const infoPost = new THREE.Group();
  infoPost.position.set(3.8, 0, 17.5);
  const iLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), darkWoodMat);
  iLegL.position.set(-1.3, 1.2, 0);
  const iLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), darkWoodMat);
  iLegR.position.set(1.3, 1.2, 0);
  const iBoard = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.5, 0.14), darkWoodMat);
  iBoard.position.set(0, 1.8, 0);
  const iTex = createTextSignTexture('INFO TAMAN KOTA', '#14532d', '#ffffff', '#86efac', 'Air Mancur • Playground • Koi');
  signTexturesToDispose.push(iTex);
  const iFace = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.3), new THREE.MeshBasicMaterial({ map: iTex }));
  iFace.position.set(0, 1.8, 0.08);
  infoPost.add(iLegL, iLegR, iBoard, iFace);
  root.add(infoPost);

  // 9. 18 LARGE LUSH TREES (>= 15!) + 32 FLOWERING BUSHES (>= 30!)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3817, roughness: 0.8 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
  const limeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
  const blossomMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.45 });

  const treeCoords: [number, number, number][] = [
    [-9.5, -13.5, 0], [-16.5, 5.5, 1], [9.5, -17.5, 1], [16.5, -4.5, 0],
    [-15.5, -16.5, 2], [14.5, 12.5, 1], [0, 20.5, 0], [-17.5, 14.5, 2],
    [18.5, 3.5, 1], [-18.5, -4.5, 0], [-21.5, 8.5, 2], [-21.5, -11.5, 1],
    [21.5, -11.5, 0], [21.5, 11.5, 2], [-7.5, 19.5, 1], [7.5, 19.5, 0],
    [-21, 19, 0], [21, -20, 1],
  ];
  const trunkGeo = new THREE.CylinderGeometry(0.38, 0.55, 3.4, 8);
  const foliageGeo = new THREE.DodecahedronGeometry(2.1);
  treeCoords.forEach(([tx, tz, type]) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.7;
    trunk.castShadow = true;
    tree.add(trunk);

    const lMat = type === 1 ? blossomMat : type === 2 ? limeLeavesMat : leavesMat;
    const c1 = new THREE.Mesh(foliageGeo, lMat);
    c1.position.y = 4.0;
    c1.castShadow = true;
    const c2 = new THREE.Mesh(foliageGeo, lMat);
    c2.scale.setScalar(0.8);
    c2.position.set(0.7, 4.9, 0.45);
    const c3 = new THREE.Mesh(foliageGeo, lMat);
    c3.scale.setScalar(0.74);
    c3.position.set(-0.7, 4.7, -0.45);
    tree.add(c1, c2, c3);
    root.add(tree);
  });

  // 32 Colorful Flowering Bushes (Instanced Bush Base + Colorful Blossom Caps)
  const bushCount = 32;
  const bushInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.75, 10, 8),
    leavesMat,
    bushCount
  );
  const bushFlowerInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.24, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    bushCount * 3
  );
  const bfPalette = [0xf43f5e, 0xfacc15, 0xec4899, 0xa855f7, 0xf97316, 0x38bdf8];
  const col = new THREE.Color();
  for (let bi = 0; bi < bushCount; bi++) {
    const ang = (bi / bushCount) * Math.PI * 2;
    const rad = bi % 2 === 0 ? 12.2 : 19.2;
    const bx = Math.cos(ang) * rad;
    const bz = Math.sin(ang) * rad;
    dummy.position.set(bx, 0.42, bz);
    dummy.rotation.set(0, ang, 0);
    dummy.scale.set(1.15, 0.8, 1.15);
    dummy.updateMatrix();
    bushInst.setMatrixAt(bi, dummy.matrix);

    for (let f = 0; f < 3; f++) {
      const fIdx = bi * 3 + f;
      dummy.position.set(bx + (f - 1) * 0.35, 0.82 + (f % 2) * 0.14, bz + ((f % 2) - 0.5) * 0.3);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      bushFlowerInst.setMatrixAt(fIdx, dummy.matrix);
      bushFlowerInst.setColorAt(fIdx, col.setHex(bfPalette[(bi + f) % bfPalette.length]));
    }
  }
  bushInst.instanceMatrix.needsUpdate = true;
  bushFlowerInst.instanceMatrix.needsUpdate = true;
  if (bushFlowerInst.instanceColor) bushFlowerInst.instanceColor.needsUpdate = true;
  root.add(bushInst, bushFlowerInst);

  // 72 Instanced Wildflowers across lawns
  const wildCount = 72;
  const stemInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.45, 5),
    new THREE.MeshStandardMaterial({ color: 0x16a34a }),
    wildCount
  );
  const petalInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.14, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff }),
    wildCount
  );
  for (let wi = 0; wi < wildCount; wi++) {
    const a = wi * 0.55;
    const r = 4.2 + (wi % 15) * 1.15;
    const fx = Math.cos(a) * r;
    const fz = Math.sin(a) * r;
    dummy.position.set(fx, 0.22, fz);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    stemInst.setMatrixAt(wi, dummy.matrix);
    dummy.position.set(fx, 0.46, fz);
    dummy.updateMatrix();
    petalInst.setMatrixAt(wi, dummy.matrix);
    petalInst.setColorAt(wi, col.setHex(bfPalette[wi % bfPalette.length]));
  }
  stemInst.instanceMatrix.needsUpdate = true;
  petalInst.instanceMatrix.needsUpdate = true;
  if (petalInst.instanceColor) petalInst.instanceColor.needsUpdate = true;
  root.add(stemInst, petalInst);

  // 10. 4 FOOD CARTS IN A ROW (Kompor, Panci, Piring Numpuk, Botol Saus, Spanduk Menu, Payung)
  const buildDetailedCart = (
    cx: number,
    cz: number,
    rotY: number,
    bodyColor: number,
    umbrellaColor: number,
    signTitle: string,
    signBg: string
  ) => {
    const cGroup = new THREE.Group();
    cGroup.position.set(cx, 0, cz);
    cGroup.rotation.y = rotY;

    const cBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.25, 1.5),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35 })
    );
    cBody.position.y = 0.85;
    cBody.castShadow = true;

    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.1, 1.65),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    counter.position.y = 1.52;

    // Wheels
    [-0.95, 0.95].forEach((wx) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 12), ironMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.32, 0.72);
      cGroup.add(wheel);
    });

    // Stove (Kompor) + Cooking Pot (Panci)
    const stove = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.55), ironMat);
    stove.position.set(-0.75, 1.64, 0);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.22, 0.32, 12),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 })
    );
    pot.position.set(-0.75, 1.88, 0);
    cGroup.add(stove, pot);

    // Stacked Plates (Piring Numpuk)
    for (let pl = 0; pl < 5; pl++) {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.16, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      plate.position.set(0.15, 1.6 + pl * 0.045, 0.2);
      cGroup.add(plate);
    }

    // Sauce Bottles (Botol Saus Red & Yellow)
    [0xef4444, 0xfacc15, 0x16a34a].forEach((sc, si) => {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.06, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: sc, roughness: 0.3 })
      );
      bottle.position.set(0.65 + si * 0.18, 1.72, -0.2);
      cGroup.add(bottle);
    });

    // Cart Umbrella (Payung Gerobak)
    const uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), ironMat);
    uPole.position.set(0, 2.5, 0);
    const umbrella = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 0.85, 14),
      new THREE.MeshStandardMaterial({ color: umbrellaColor, roughness: 0.4 })
    );
    umbrella.position.set(0, 3.65, 0);

    // Menu Banner (Spanduk Menu)
    const sTex = createTextSignTexture(signTitle, signBg, '#ffffff', '#fde047');
    signTexturesToDispose.push(sTex);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 0.6), new THREE.MeshBasicMaterial({ map: sTex }));
    sign.position.set(0, 1.0, 0.78);

    cGroup.add(cBody, counter, uPole, umbrella, sign);
    root.add(cGroup);
  };

  buildDetailedCart(7.5, 7.5, -Math.PI * 0.25, 0xf43f5e, 0xfbbf24, 'ES KRIM GEMOY 🍦', '#be123c');
  buildDetailedCart(14.5, 4.5, -Math.PI / 2, 0xd97706, 0xef4444, 'CILOK & BATAGOR 🍢', '#9a3412');
  buildDetailedCart(14.5, 8.2, -Math.PI / 2, 0x0284c7, 0x38bdf8, 'BAKSO MALANG 🍜', '#0369a1');
  buildDetailedCart(14.5, 11.9, -Math.PI / 2, 0x16a34a, 0xfacc15, 'ES TEH & JASUKE 🧋', '#15803d');

  // 11. TUKANG BALON (-4.5, 0, 10.5)
  const balloonVendorGroup = new THREE.Group();
  balloonVendorGroup.position.set(-4.5, 0, 10.5);
  const cartStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.9, 1.2, 14),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 })
  );
  cartStand.position.y = 0.6;
  const bPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.6), ironMat);
  bPole.position.y = 2.2;
  balloonVendorGroup.add(cartStand, bPole);
  const balloonMeshGroup = new THREE.Group();
  const bColors = [0xf43f5e, 0xfbbf24, 0xa855f7, 0x10b981, 0xec4899, 0x38bdf8, 0xf97316, 0x06b6d4];
  for (let bi = 0; bi < 10; bi++) {
    const bAngle = (bi / 10) * Math.PI * 2;
    const bDist = 0.45 + (bi % 2) * 0.35;
    const balloon = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 10, 10),
      new THREE.MeshStandardMaterial({ color: bColors[bi % bColors.length], roughness: 0.25 })
    );
    balloon.scale.set(1, 1.25, 1);
    balloon.position.set(Math.cos(bAngle) * bDist, 3.2 + (bi % 3) * 0.35, Math.sin(bAngle) * bDist);
    balloonMeshGroup.add(balloon);
  }
  balloonVendorGroup.add(balloonMeshGroup);
  root.add(balloonVendorGroup);

  // 12. FULL PLAYGROUND: 3 SWING FRAMES, 2 SLIDES, SEESAW, MERRY-GO-ROUND, ROPE CLIMBER
  const swingSetGroup = new THREE.Group();
  swingSetGroup.position.set(-8.5, 0, 7.5);
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
  const topBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.5), darkWoodMat);
  topBeam.rotation.z = Math.PI / 2;
  topBeam.position.y = 3.8;
  swingSetGroup.add(topBeam);
  [-3.6, 3.6].forEach((lx) => {
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.4), darkWoodMat);
    leg1.position.set(lx, 2, 1.1);
    leg1.rotation.x = -0.3;
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.4), darkWoodMat);
    leg2.position.set(lx, 2, -1.1);
    leg2.rotation.x = 0.3;
    swingSetGroup.add(leg1, leg2);
  });
  const swingHangers: THREE.Group[] = [];
  [-2.2, 0, 2.2].forEach((sx) => {
    const hanger = new THREE.Group();
    hanger.position.set(sx, 3.8, 0);
    [-0.45, 0.45].forEach((cx) => {
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.08), chainMat);
      chain.position.set(cx, -1.54, 0);
      hanger.add(chain);
    });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.45), seatMat);
    seat.position.y = -3.08;
    hanger.add(seat);
    swingSetGroup.add(hanger);
    swingHangers.push(hanger);
  });
  root.add(swingSetGroup);

  // 2 Extra Swing Sets near SW Playground (-14, 11 and -14, 4)
  [[-14, 11], [-14, 4]].forEach(([ex, ez]) => {
    const extraSwing = new THREE.Group();
    extraSwing.position.set(ex, 0, ez);
    extraSwing.rotation.y = Math.PI / 2;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.5), darkWoodMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 3.4;
    extraSwing.add(beam);
    [-2.1, 2.1].forEach((lx) => {
      const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.8), darkWoodMat);
      l1.position.set(lx, 1.75, 0.9);
      l1.rotation.x = -0.28;
      const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.8), darkWoodMat);
      l2.position.set(lx, 1.75, -0.9);
      l2.rotation.x = 0.28;
      extraSwing.add(l1, l2);
    });
    const h = new THREE.Group();
    h.position.set(0, 3.4, 0);
    [-0.4, 0.4].forEach((cx) => {
      const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4), chainMat);
      ch.position.set(cx, -1.2, 0);
      h.add(ch);
    });
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.42), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    s.position.y = -2.4;
    h.add(s);
    extraSwing.add(h);
    swingHangers.push(h);
    root.add(extraSwing);
  });

  // 2 Slides (Main yellow slide + Pink twin slide)
  const buildSlide = (sx: number, sz: number, chuteHex: number, rotY = 0) => {
    const sg = new THREE.Group();
    sg.position.set(sx, 0, sz);
    sg.rotation.y = rotY;
    const lad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    lad.position.set(0, 1.6, -1.2);
    const chute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 4.2), new THREE.MeshStandardMaterial({ color: chuteHex, roughness: 0.3 }));
    chute.position.set(0, 1.4, 0.6);
    chute.rotation.x = -0.55;
    sg.add(lad, chute);
    root.add(sg);
  };
  buildSlide(8.5, -8, 0xfacc15, 0);
  buildSlide(-14, 15, 0xec4899, Math.PI * 0.25);

  // Seesaw
  const seesawGroup = new THREE.Group();
  seesawGroup.position.set(11, 0, -2);
  const seesawBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.9, 12), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
  seesawBase.position.y = 0.45;
  seesawGroup.add(seesawBase);
  const seesawPlankGroup = new THREE.Group();
  seesawPlankGroup.position.y = 0.9;
  const seesawPlank = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 0.45), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 }));
  seesawPlankGroup.add(seesawPlank);
  seesawGroup.add(seesawPlankGroup);
  root.add(seesawGroup);

  // Spinning Merry-Go-Round (Ayunan Putar) at (-18, 0, 8)
  const merryGroup = new THREE.Group();
  merryGroup.position.set(-18, 0, 8);
  const merryDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 0.2, 20),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 })
  );
  merryDisc.position.y = 0.35;
  merryGroup.add(merryDisc);
  for (let h = 0; h < 4; h++) {
    const a = (h / 4) * Math.PI * 2;
    const bar = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 6, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    bar.position.set(Math.cos(a) * 1.4, 0.9, Math.sin(a) * 1.4);
    bar.rotation.y = a;
    merryGroup.add(bar);
  }
  root.add(merryGroup);

  // Rope Climbing Pyramid (Panjat Tali) at (-18, 0, 14)
  const ropeGroup = new THREE.Group();
  ropeGroup.position.set(-18, 0, 14);
  const centerMast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.2, 10), ironMat);
  centerMast.position.y = 2.1;
  const ropeCone = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 3.8, 8, 4, true),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true })
  );
  ropeCone.position.y = 1.9;
  ropeGroup.add(centerMast, ropeCone);
  root.add(ropeGroup);

  // 13. 6 FLOWER POTS + DECORATIVE BIRDCAGE + BICYCLE RACK (8 BICYCLES) + STONE CHESS TABLES
  const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 });
  [[-3.8, 12], [3.8, 12], [-6.5, -6.5], [6.5, -6.5], [6.5, 6.5], [-6.5, 6.5]].forEach(([px, pz], pi) => {
    const potG = new THREE.Group();
    potG.position.set(px, 0, pz);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.34, 0.65, 12), potMat);
    pot.position.y = 0.32;
    const fl = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 10, 8),
      new THREE.MeshStandardMaterial({ color: bfPalette[pi % bfPalette.length], roughness: 0.5 })
    );
    fl.position.y = 0.8;
    potG.add(pot, fl);
    root.add(potG);
  });

  // Garden Aviary / Birdcage (-4.5, 0, -14.5)
  const cageGroup = new THREE.Group();
  cageGroup.position.set(-4.5, 0, -14.5);
  const cageBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.4, 16), trimStoneMat);
  cageBase.position.y = 0.2;
  const cageMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 2.4, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, wireframe: true })
  );
  cageMesh.position.y = 1.6;
  const cageDome = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, wireframe: true })
  );
  cageDome.position.y = 2.8;
  cageGroup.add(cageBase, cageMesh, cageDome);
  [0xfef08a, 0x38bdf8, 0xf472b6].forEach((bc, bi) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: bc }));
    b.position.set(-0.4 + bi * 0.4, 1.4 + (bi % 2) * 0.4, 0);
    cageGroup.add(b);
  });
  root.add(cageGroup);

  // Bicycle Parking Rack with 8 Colorful Bicycles (7.5, 0, 17)
  const bikeColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x06b6d4, 0xa855f7, 0xf8fafc];
  const rackBar = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.08, 0.6), ironMat);
  rackBar.position.set(11.5, 0.25, 17.5);
  root.add(rackBar);
  for (let b = 0; b < 8; b++) {
    const bike = buildBicycle(bikeColors[b]);
    bike.position.set(7.2 + b * 1.2, 0, 17.5);
    root.add(bike);
  }

  // 2 Stone Chess Tables (-7, 0, -9) and (-3, 0, -18)
  [[-7, -9], [3, -18]].forEach(([cx, cz]) => {
    const chessG = new THREE.Group();
    chessG.position.set(cx, 0, cz);
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.5), trimStoneMat);
    cTop.position.y = 0.85;
    const cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.85, 10), trimStoneMat);
    cLeg.position.y = 0.42;
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.04, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    board.position.y = 0.93;
    chessG.add(cTop, cLeg, board);
    [[-1.1, 0], [1.1, 0]].forEach(([sx, sz]) => {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.5, 12), trimStoneMat);
      stool.position.set(sx, 0.25, sz);
      chessG.add(stool);
    });
    root.add(chessG);
  });

  // Living Details: Butterflies, Soccer Ball, Flying Birds, Falling Leaves
  const butterflies: { mesh: THREE.Mesh; seed: number; bx: number; bz: number }[] = [];
  const bFlyGeo = new THREE.PlaneGeometry(0.18, 0.14);
  const bFlyMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide });
  for (let bi = 0; bi < 10; bi++) {
    const bf = new THREE.Mesh(bFlyGeo, bFlyMat);
    const bx = -8 + (bi % 5) * 4;
    const bz = -6 + Math.floor(bi / 5) * 8;
    bf.position.set(bx, 1.4, bz);
    root.add(bf);
    butterflies.push({ mesh: bf, seed: bi * 1.4, bx, bz });
  }

  const soccerBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 14),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  soccerBall.position.set(3.5, 0.28, 10);
  soccerBall.castShadow = true;
  root.add(soccerBall);

  const birds: { group: THREE.Group; phase: number; r: number; h: number }[] = [];
  const birdMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  for (let b = 0; b < 8; b++) {
    const bg = new THREE.Group();
    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.16), birdMat);
    wL.position.x = -0.22;
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.16), birdMat);
    wR.position.x = 0.22;
    bg.add(wL, wR);
    root.add(bg);
    birds.push({ group: bg, phase: b * 0.9, r: 10 + (b % 3) * 4, h: 9.5 + (b % 2) * 2.2 });
  }

  const leaves: { mesh: THREE.Mesh; x: number; z: number; seed: number }[] = [];
  const leafGeo = new THREE.PlaneGeometry(0.18, 0.12);
  const fallingLeafMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
  for (let li = 0; li < 24; li++) {
    const lm = new THREE.Mesh(leafGeo, fallingLeafMat);
    const lx = ((li * 17) % 36) - 18;
    const lz = ((li * 23) % 36) - 18;
    lm.position.set(lx, 5 + (li % 5), lz);
    root.add(lm);
    leaves.push({ mesh: lm, x: lx, z: lz, seed: li * 0.9 });
  }

  const interactions: InteractionTarget[] = [
    { id: 'swing_main', name: 'Ayunan 3D Taman', prompt: 'Main Ayunan: Berayun Maju-Mundur 🎡', icon: '🎡', actionType: 'sit', x: -8.5, z: 7.5, radius: 3.3 },
    { id: 'balloon_vendor', name: 'Tukang Balon Taman', prompt: 'Beli Balon Warna-warni (Goyang di Tangan 🎈)', icon: '🎈', actionType: 'icecream', x: -4.5, z: 10.5, radius: 2.8 },
    { id: 'park_gazebo', name: 'Gazebo Pergola Taman', prompt: 'Duduk Santai di Gazebo Pergola 🏡', icon: '🏡', actionType: 'sit', x: -11, z: -4, radius: 3.0 },
    { id: 'park_pond', name: 'Jembatan Kolam Koi', prompt: 'Beri Makan Ikan Koi di Kolam Jembatan 🐟', icon: '🐟', actionType: 'fountain', x: 11.5, z: -11.5, radius: 3.4 },
    { id: 'slide_main', name: 'Perosotan Taman', prompt: 'Meluncur di Perosotan Ceria 🛝', icon: '🛝', actionType: 'sit', x: 8.5, z: -8.0, radius: 2.8 },
    { id: 'seesaw_main', name: 'Jungkat-Jungkit Taman', prompt: 'Main Jungkat-Jungkit Berdua 🪵', icon: '🪵', actionType: 'sit', x: 11.0, z: -2.0, radius: 2.8 },
    { id: 'bench_east', name: 'Kursi Taman Kayu', prompt: 'Duduk Santai di Kursi Taman 🪑', icon: '🪑', actionType: 'sit', x: 5.6, z: 0, radius: 2.4 },
    { id: 'bench_west', name: 'Kursi Taman Barat', prompt: 'Duduk Santai Memandang Bunga 🪑', icon: '🪑', actionType: 'sit', x: -5.6, z: 0, radius: 2.4 },
    { id: 'icecream_cart', name: 'Gerobak Es Krim Vintage', prompt: 'Beli Es Krim Stroberi (25 Koin 🍦)', icon: '🍦', actionType: 'icecream', x: 7.5, z: 7.5, radius: 2.8 },
    { id: 'food_cilok', name: 'Gerobak Cilok & Batagor', prompt: 'Beli Cilok & Batagor Hangat (15 Koin 🍢)', icon: '🍢', actionType: 'icecream', x: 14.5, z: 4.5, radius: 3.0 },
    { id: 'fountain', name: 'Air Mancur Marmer', prompt: 'Lempar Koin Harapan (+Kebahagiaan ⛲)', icon: '⛲', actionType: 'fountain', x: 0, z: 0, radius: 3.8 },
  ];

  const update = (time: number, swingOverrideAngle?: number) => {
    for (let idx = 0; idx < sprayCount; idx++) {
      const stream = idx % 4;
      const baseAngle = (stream / 4) * Math.PI * 2 + ((idx % 12) - 6) * 0.04;
      const speed = 1.65 + (idx % 3) * 0.25;
      const cycle = (time * speed + idx * 0.14) % 1.1;
      const radius = 0.5 + cycle * 2.3;
      const height = 2.4 + Math.sin(cycle * Math.PI) * 1.55;
      dummy.position.set(Math.cos(baseAngle) * radius, height, Math.sin(baseAngle) * radius);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      sprayInst.setMatrixAt(idx, dummy.matrix);
    }
    sprayInst.instanceMatrix.needsUpdate = true;

    butterflies.forEach(({ mesh, seed, bx, bz }) => {
      mesh.position.set(
        bx + Math.cos(time * 1.4 + seed) * 1.2,
        1.4 + Math.sin(time * 5 + seed) * 0.35,
        bz + Math.sin(time * 1.1 + seed) * 1.2
      );
      mesh.rotation.y = time * 3 + seed;
      mesh.rotation.z = Math.sin(time * 15 + seed) * 0.5;
    });

    koiMeshes.forEach((koi, idx) => {
      const ka = time * 0.8 + idx * 1.05;
      koi.position.set(Math.cos(ka) * 2.5, 0.12, Math.sin(ka) * 2.5);
      koi.rotation.y = -ka;
    });

    swingHangers.forEach((sh, idx) => {
      if (idx === 1 && swingOverrideAngle !== undefined) {
        sh.rotation.x = swingOverrideAngle;
      } else {
        sh.rotation.x = Math.sin(time * 2.2 + idx * 0.8) * 0.35;
      }
    });
    seesawPlankGroup.rotation.z = Math.sin(time * 1.8) * 0.24;
    merryGroup.rotation.y = time * 0.9;
    balloonMeshGroup.position.y = Math.sin(time * 2) * 0.08;
    balloonMeshGroup.rotation.y = Math.sin(time * 0.8) * 0.15;

    soccerBall.position.x = 3.5 + Math.sin(time * 1.4) * 2.4;
    soccerBall.position.y = 0.28 + Math.abs(Math.sin(time * 2.8)) * 0.35;
    soccerBall.rotation.z = -time * 2.2;

    birds.forEach((bd) => {
      const ang = time * 0.45 + bd.phase;
      bd.group.position.set(
        Math.cos(ang) * bd.r,
        bd.h + Math.sin(time * 2 + bd.phase) * 0.4,
        Math.sin(ang) * bd.r
      );
      bd.group.rotation.y = -ang;
      const flap = Math.sin(time * 8 + bd.phase) * 0.45;
      bd.group.children[0].rotation.z = flap;
      bd.group.children[1].rotation.z = -flap;
    });

    leaves.forEach((lf) => {
      const fallY = 7.5 - ((time * 0.8 + lf.seed) % 7.3);
      lf.mesh.position.set(
        lf.x + Math.sin(time * 1.2 + lf.seed) * 0.9,
        fallY,
        lf.z + Math.cos(time * 0.9 + lf.seed) * 0.9
      );
      lf.mesh.rotation.x = time * 1.5 + lf.seed;
      lf.mesh.rotation.z = Math.sin(time * 2 + lf.seed) * 0.6;
    });

    clouds.forEach((c) => {
      c.group.position.x = ((c.startX + time * c.speed * 2 + 50) % 90) - 45;
    });
  };

  const cleanup = () => {
    scene.remove(root);
    grassTex.dispose();
    signTexturesToDispose.forEach((t) => t.dispose());
    disposeHierarchy(root);
  };

  return { interactions, update, cleanup };
}
