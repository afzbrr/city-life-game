import * as THREE from 'three';
import { InteractionTarget } from '../types';
import {
  createGradientSkyDome,
  createSandPBRMaterial,
  createWaterPBRMaterial,
  createWoodPBRMaterial,
} from '../pbrMaterials';
import { createTextSignTexture, disposeHierarchy } from './worldHelpers';

export function buildBeachScene(scene: THREE.Scene): {
  interactions: InteractionTarget[];
  update: (time: number) => void;
  cleanup: () => void;
} {
  const root = new THREE.Group();
  scene.add(root);
  const signTexturesToDispose: THREE.CanvasTexture[] = [];

  // 1. Sunset Sky Dome + Large Sun + 8 Clouds + 10 Seagulls + Distant Airplane
  const sunsetDome = new THREE.Mesh(
    new THREE.SphereGeometry(72, 24, 16),
    createGradientSkyDome(0x4c1d95, 0xf43f5e, 0xfdba74)
  );
  root.add(sunsetDome);

  const sunsetSun = new THREE.Mesh(
    new THREE.SphereGeometry(5.6, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  sunsetSun.position.set(0, 12, -46);
  root.add(sunsetSun);

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xfed7aa,
    roughness: 0.4,
    transparent: true,
    opacity: 0.88,
  });
  const clouds: { group: THREE.Group; speed: number; startX: number }[] = [];
  const cloudSphere = new THREE.SphereGeometry(1, 8, 8);
  for (let ci = 0; ci < 8; ci++) {
    const cg = new THREE.Group();
    const cx = -32 + ci * 9.5;
    const cy = 18 + (ci % 3) * 3.5;
    const cz = -28 + (ci % 4) * 8;
    [
      [0, 0, 0, 1.5],
      [1.3, 0.2, 0, 1.9],
      [2.5, -0.1, 0, 1.3],
      [-1.2, -0.1, 0, 1.3],
    ].forEach(([bx, by, bz, r]) => {
      const puff = new THREE.Mesh(cloudSphere, cloudMat);
      puff.scale.setScalar(r);
      puff.position.set(bx, by, bz);
      cg.add(puff);
    });
    cg.position.set(cx, cy, cz);
    root.add(cg);
    clouds.push({ group: cg, speed: 0.35 + (ci % 3) * 0.12, startX: cx });
  }

  // 10 Seagulls flying across sky
  const gulls: { group: THREE.Group; phase: number; r: number; h: number }[] = [];
  const gullMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  for (let gi = 0; gi < 10; gi++) {
    const g = new THREE.Group();
    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.18), gullMat);
    wL.position.x = -0.27;
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.18), gullMat);
    wR.position.x = 0.27;
    g.add(wL, wR);
    root.add(g);
    gulls.push({ group: g, phase: gi * 0.7, r: 10 + (gi % 4) * 5, h: 9.5 + (gi % 3) * 2.4 });
  }

  // Distant Airplane cruising high on horizon
  const planeGroup = new THREE.Group();
  const planeBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 1.8, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  planeBody.rotation.z = Math.PI / 2;
  const planeWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.05, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  const planeTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.45, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  planeTail.position.set(-0.9, 0.24, 0);
  planeGroup.add(planeBody, planeWing, planeTail);
  planeGroup.position.set(-30, 22, -36);
  root.add(planeGroup);

  // 2. VAST OCEAN + 3 LAYERED WAVES & WHITE SEAFOAM + TEXTURED SAND
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(80, 42), createSandPBRMaterial(14, 8));
  sand.rotateX(-Math.PI / 2);
  sand.position.set(0, 0, 14);
  sand.receiveShadow = true;
  root.add(sand);

  const boardwalk = new THREE.Mesh(
    new THREE.BoxGeometry(52, 0.12, 2.4),
    createWoodPBRMaterial('#854d0e', '#451a03', 10, 1)
  );
  boardwalk.position.set(0, 0.06, 13.5);
  boardwalk.receiveShadow = true;
  root.add(boardwalk);

  const farWater = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 42),
    createWaterPBRMaterial(0x0369a1, 0.94)
  );
  farWater.rotateX(-Math.PI / 2);
  farWater.position.set(0, 0.02, -31);
  root.add(farWater);

  const midWater = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 14),
    createWaterPBRMaterial(0x0284c7, 0.88)
  );
  midWater.rotateX(-Math.PI / 2);
  midWater.position.set(0, 0.04, -12);
  root.add(midWater);

  const nearWater = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 8),
    createWaterPBRMaterial(0x0ea5e9, 0.8)
  );
  nearWater.rotateX(-Math.PI / 2);
  nearWater.position.set(0, 0.055, -3.5);
  root.add(nearWater);

  // 3 Layered Seafoam Bands (Near, Mid, Far)
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.82,
    roughness: 0.2,
  });
  const foamBands = [
    { z: -0.2, w: 90, d: 1.5, phase: 0 },
    { z: -8.5, w: 96, d: 1.1, phase: 1.4 },
    { z: -18.5, w: 105, d: 1.2, phase: 2.8 },
  ].map((fb) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(fb.w, fb.d), foamMat);
    m.rotateX(-Math.PI / 2);
    m.position.set(0, 0.075, fb.z);
    root.add(m);
    return { mesh: m, baseZ: fb.z, phase: fb.phase };
  });

  // Shoreline Details: Footprints, 24 Seashells, 12 Starfish, 12 Coral Rocks, Seaweed
  const dummy = new THREE.Object3D();
  const fpInst = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.16, 0.3),
    new THREE.MeshBasicMaterial({ color: 0xca8a04, transparent: true, opacity: 0.35 }),
    30
  );
  for (let fi = 0; fi < 30; fi++) {
    dummy.position.set(-14 + fi * 0.95, 0.015, 2.2 + (fi % 2) * 0.45 + Math.sin(fi * 0.4) * 0.6);
    dummy.rotation.set(-Math.PI / 2, 0, 0.15);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    fpInst.setMatrixAt(fi, dummy.matrix);
  }
  fpInst.instanceMatrix.needsUpdate = true;
  root.add(fpInst);

  // 24 Seashells (Instanced)
  const shellInst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.16, 0.14, 7),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 }),
    24
  );
  for (let si = 0; si < 24; si++) {
    dummy.position.set(-22 + si * 1.9, 0.06, 1.5 + (si % 4) * 1.4);
    dummy.rotation.set(0.3, si * 0.8, 0);
    dummy.scale.setScalar(0.8 + (si % 3) * 0.25);
    dummy.updateMatrix();
    shellInst.setMatrixAt(si, dummy.matrix);
  }
  shellInst.instanceMatrix.needsUpdate = true;
  root.add(shellInst);

  // 12 Starfish (Instanced)
  const starInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.06, 5),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.45 }),
    12
  );
  for (let st = 0; st < 12; st++) {
    dummy.position.set(-20 + st * 3.6, 0.04, 1.8 + (st % 3) * 1.5);
    dummy.rotation.set(0, st * 0.7, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    starInst.setMatrixAt(st, dummy.matrix);
  }
  starInst.instanceMatrix.needsUpdate = true;
  root.add(starInst);

  // 12 Coastal Coral Boulders + Seaweed Patches
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
  const rockGeo = new THREE.DodecahedronGeometry(0.75, 0);
  const seaweedMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  for (let ri = 0; ri < 12; ri++) {
    const rx = -24 + ri * 4.4;
    const rz = ri % 2 === 0 ? 0.6 : -1.4;
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.scale.set(0.8 + (ri % 3) * 0.45, 0.6 + (ri % 2) * 0.3, 0.9);
    rock.position.set(rx, 0.25, rz);
    rock.castShadow = true;
    root.add(rock);

    const weed = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 5), seaweedMat);
    weed.position.set(rx + 0.5, 0.15, rz + 0.3);
    root.add(weed);
  }

  // 3. 10 COCONUT PALM TREES + 4 PINE TREES + 12 BEACH SHRUBS + FLOWERS
  const palmLeavesList: THREE.Group[] = [];
  const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });

  const plantPalm = (px: number, pz: number, curveDir: number) => {
    const palm = new THREE.Group();
    palm.position.set(px, 0, pz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 5.4, 8), palmTrunkMat);
    trunk.position.y = 2.7;
    trunk.rotation.z = curveDir * 0.18;
    trunk.castShadow = true;
    palm.add(trunk);

    const crownGroup = new THREE.Group();
    crownGroup.position.set(curveDir * 0.9, 5.2, 0);
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 2.6), palmLeafMat);
      leaf.position.set(Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.38;
      crownGroup.add(leaf);
    }
    palm.add(crownGroup);
    palmLeavesList.push(crownGroup);
    root.add(palm);
  };
  [
    [-15, 9, 1], [-16, 2, -1], [17, 10, -1], [18, 3, 1], [-22, 6, 1],
    [-21, 14, -1], [22, 14, 1], [23, 6, -1], [-8, 16, 1], [8, 16, -1],
  ].forEach(([px, pz, dir]) => plantPalm(px, pz, dir));

  // 4 Coastal Pine Trees + 12 Beach Shrubs + Beach Flowers
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
  [[-24, 18], [-12, 19], [12, 19], [24, 18]].forEach(([cx, cz]) => {
    const pine = new THREE.Group();
    pine.position.set(cx, 0, cz);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 2.4, 8), palmTrunkMat);
    tr.position.y = 1.2;
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.8, 10), pineMat);
    c1.position.y = 3.1;
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 10), pineMat);
    c2.position.y = 4.4;
    pine.add(tr, c1, c2);
    root.add(pine);
  });

  const shrubFlowerColors = [0xf43f5e, 0xfacc15, 0xec4899, 0xa855f7];
  for (let si = 0; si < 12; si++) {
    const sx = -22 + si * 4.0;
    const sz = 16.5 + (si % 2) * 1.8;
    const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), palmLeafMat);
    shrub.position.set(sx, 0.35, sz);
    const fl = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 6, 6),
      new THREE.MeshStandardMaterial({ color: shrubFlowerColors[si % shrubFlowerColors.length] })
    );
    fl.position.set(sx, 0.85, sz);
    root.add(shrub, fl);
  }

  // 4. 10 COLORFUL STRIPED BEACH UMBRELLAS + 16 LOUNGE CHAIRS + 8 WOVEN MATS + GEAR
  const umbrellaColors = [0xef4444, 0x0284c7, 0xf59e0b, 0xec4899, 0x10b981];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.6 });

  const buildUmbrellaAndLoungers = (
    ux: number,
    uz: number,
    colorIdx: number,
    leftL: boolean,
    rightL: boolean
  ) => {
    const uGroup = new THREE.Group();
    uGroup.position.set(ux, 0, uz);
    const uCol = umbrellaColors[colorIdx % umbrellaColors.length];
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.3), poleMat);
    pole.position.y = 1.65;
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(2.15, 0.85, 16),
      new THREE.MeshStandardMaterial({ color: uCol, roughness: 0.4 })
    );
    canopy.position.y = 3.25;
    const stripe = new THREE.Mesh(
      new THREE.ConeGeometry(2.17, 0.86, 16, 1, false, 0, Math.PI / 4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    stripe.position.y = 3.25;
    uGroup.add(pole, canopy, stripe);

    const lMat = new THREE.MeshStandardMaterial({ color: uCol, roughness: 0.5 });
    const addLounger = (lx: number) => {
      const l = new THREE.Group();
      l.position.set(lx, 0, 0.25);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.22, 2.5), lMat);
      base.position.y = 0.22;
      base.castShadow = true;
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.2, 1.1), lMat);
      back.position.set(0, 0.58, -0.82);
      back.rotation.x = -0.55;
      // Towel on chair
      const towel = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.04, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xfef08a })
      );
      towel.position.set(0, 0.35, 0.2);
      l.add(base, back, towel);
      uGroup.add(l);
    };
    if (leftL) addLounger(-1.35);
    if (rightL) addLounger(1.35);
    root.add(uGroup);
  };

  // 10 Umbrellas with 16 Lounge Chairs total (preserving -12,6 and 9,5!)
  [
    [-12, 6, 0, true, true],
    [-5, 5, 1, true, true],
    [2, 6, 2, true, true],
    [9, 5, 1, true, true],
    [16, 6, 3, true, true],
    [-19, 6, 4, true, false],
    [-15, 9.5, 2, true, false],
    [-8, 9.5, 3, true, false],
    [6, 9.5, 4, true, false],
    [13, 9.5, 0, true, true],
  ].forEach(([ux, uz, ci, l, r]) =>
    buildUmbrellaAndLoungers(ux as number, uz as number, ci as number, l as boolean, r as boolean)
  );

  // 8 Woven Beach Mats + Towels, Sunglasses, Cooler Boxes, Tote Bags
  const matColors = [0x38bdf8, 0xf43f5e, 0xfbbf24, 0x10b981, 0xa855f7, 0xf97316, 0xec4899, 0x06b6d4];
  for (let mi = 0; mi < 8; mi++) {
    const mx = -17 + mi * 4.8;
    const mz = 3.2 + (mi % 2) * 1.1;
    const beachMat = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.04, 2.3),
      new THREE.MeshStandardMaterial({ color: matColors[mi], roughness: 0.85 })
    );
    beachMat.position.set(mx, 0.03, mz);
    root.add(beachMat);

    if (mi % 2 === 0) {
      // Cooler box
      const cooler = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.45, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      cooler.position.set(mx + 0.9, 0.23, mz);
      root.add(cooler);
    } else {
      // Beach tote bag + sunglasses
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.4, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 })
      );
      bag.position.set(mx - 0.5, 0.22, mz - 0.5);
      const glasses = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.06, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      glasses.position.set(mx + 0.2, 0.08, mz + 0.4);
      root.add(bag, glasses);
    }
  }

  // 2 Volleyball Nets + 6 Volleyballs
  const vPostMat = createWoodPBRMaterial('#78350f', '#451a03');
  const buildVNet = (vx: number, vz: number) => {
    const vNetGroup = new THREE.Group();
    vNetGroup.position.set(vx, 0, vz);
    [-2.6, 2.6].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 10), vPostMat);
      post.position.set(px, 1.25, 0);
      vNetGroup.add(post);
    });
    const vNet = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.68, side: THREE.DoubleSide })
    );
    vNet.position.set(0, 1.9, 0);
    vNetGroup.add(vNet);
    root.add(vNetGroup);
  };
  buildVNet(-2, 8.8);
  buildVNet(18, 12.2);

  const vBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 })
  );
  vBall.castShadow = true;
  root.add(vBall);

  [[-1.2, 7.6], [17, 11], [19, 13], [-14, 4.5], [10, 3.8]].forEach(([bx, bz], bi) => {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 10),
      new THREE.MeshStandardMaterial({ color: bi % 2 === 0 ? 0xf8fafc : 0x38bdf8, roughness: 0.35 })
    );
    ball.position.set(bx, 0.22, bz);
    root.add(ball);
  });

  // 3 Sandcastles + 4 Sand Buckets & Shovels
  const castleMat = createSandPBRMaterial(1, 1);
  [[4.5, 3.2], [-6.5, 2.6], [14.5, 2.5]].forEach(([cx, cz]) => {
    const castle = new THREE.Group();
    castle.position.set(cx, 0, cz);
    const cBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 1.1), castleMat);
    cBase.position.y = 0.22;
    castle.add(cBase);
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([tx, tz]) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.75, 10), castleMat);
      tower.position.set(tx, 0.38, tz);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 10), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      cone.position.set(tx, 0.88, tz);
      castle.add(tower, cone);
    });
    root.add(castle);
  });

  [[5.8, 3.8], [-5.2, 3.0], [15.6, 3.2], [-10.5, 4.2]].forEach(([bx, bz], bi) => {
    const bucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.32, 10),
      new THREE.MeshStandardMaterial({ color: matColors[bi], roughness: 0.4 })
    );
    bucket.position.set(bx, 0.16, bz);
    const shovel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.45, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xfacc15 })
    );
    shovel.position.set(bx + 0.22, 0.18, bz);
    shovel.rotation.z = 0.6;
    root.add(bucket, shovel);
  });

  // 3 Surfboards Upright + 3 Swim Rings (Pelampung)
  [0xf43f5e, 0x38bdf8, 0xfacc15].forEach((sc, si) => {
    const board = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 1.5, 6, 8),
      new THREE.MeshStandardMaterial({ color: sc, roughness: 0.25 })
    );
    board.scale.set(1, 1, 0.18);
    board.position.set(6.5 + si * 0.7, 0.9, 10.5);
    board.rotation.x = -0.15;
    root.add(board);

    const floatRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.16, 10, 18),
      new THREE.MeshStandardMaterial({ color: sc, roughness: 0.3 })
    );
    floatRing.rotation.x = Math.PI / 2;
    floatRing.position.set(-16 + si * 9, 0.18, 1.5);
    root.add(floatRing);
  });

  // 5. DOCK + 2 JETSKIS + 5 BOATS (3 IN OCEAN + 2 ON SAND) + SNORKELING CORAL
  const dockGroup = new THREE.Group();
  dockGroup.position.set(-8, 0, -8);
  const dockPlank = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.4, 18),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
  );
  dockPlank.position.y = 0.45;
  dockPlank.castShadow = true;
  dockGroup.add(dockPlank);

  [0xef4444, 0x0284c7].forEach((c, idx) => {
    const js = new THREE.Group();
    js.position.set(-2.8, 0.25, idx === 0 ? 2 : -4);
    const hull = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 3.2, 10),
      new THREE.MeshStandardMaterial({ color: c, metalness: 0.7, roughness: 0.25 })
    );
    hull.rotation.x = Math.PI / 2;
    hull.rotation.z = Math.PI;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 1.2), new THREE.MeshStandardMaterial({ color: 0x18181b }));
    seat.position.y = 0.35;
    js.add(hull, seat);
    dockGroup.add(js);
  });
  root.add(dockGroup);

  const boatGroupList: THREE.Group[] = [];
  const buildBoat = (bx: number, by: number, bz: number, hullHex: number) => {
    const boat = new THREE.Group();
    boat.position.set(bx, by, bz);
    const bHull = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 3.8, 8),
      new THREE.MeshStandardMaterial({ color: hullHex, roughness: 0.65 })
    );
    bHull.rotation.x = Math.PI / 2;
    bHull.scale.set(0.75, 1, 0.45);
    boat.add(bHull);
    root.add(boat);
    return boat;
  };
  // 3 floating in ocean + 2 docked on beach sand
  boatGroupList.push(buildBoat(5, 0.15, -16, 0xb45309));
  boatGroupList.push(buildBoat(-16, 0.15, -18, 0x0284c7));
  boatGroupList.push(buildBoat(18, 0.15, -20, 0xd97706));
  buildBoat(-21, 0.22, 1.5, 0x059669);
  buildBoat(21, 0.22, 1.8, 0xef4444);

  // Snorkeling Coral Buoy (6, -7)
  const reefGroup = new THREE.Group();
  reefGroup.position.set(6, 0, -7);
  [0xf43f5e, 0xfbbf24, 0xa855f7, 0x06b6d4].forEach((c, idx) => {
    const coral = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 + (idx % 2) * 0.2, 0),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })
    );
    coral.position.set((idx - 1.5) * 0.9, 0.1, (idx % 2) * 0.6);
    reefGroup.add(coral);
  });
  const buoy = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 })
  );
  buoy.position.y = 0.35;
  reefGroup.add(buoy);
  root.add(reefGroup);

  // 6. 5 WARUNG BERJEJER (Kelapa Muda 20 biji, Jagung Bakar, Kulkas Es, Meja, Kursi Plastik, Spanduk Harga)
  const warungDefs = [
    { x: -16, z: 12.2, title: 'WARUNG ES BUAH 🍧', price: 'Rp 12.000', color: 0xec4899 },
    { x: -8, z: 12.2, title: 'WARUNG JAGUNG BAKAR 🌽', price: 'Rp 10.000', color: 0xea580c },
    { x: 0, z: 12.2, title: 'WARUNG SEAFOOD PANTAI 🦐', price: 'Rp 25.000', color: 0x0284c7 },
    { x: 10.5, z: 8.5, title: 'ES KELAPA MUDA 🥥', price: 'Rp 15.000', color: 0x16a34a },
    { x: 18.5, z: 12.2, title: 'MINUMAN DINGIN 🧋', price: 'Rp 8.000', color: 0xa855f7 },
  ];
  const cocoGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
  const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });

  warungDefs.forEach((wd, wi) => {
    const wg = new THREE.Group();
    wg.position.set(wd.x, 0, wd.z);

    // Counter & Straw/Colored Awning Tent
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 1.5, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
    );
    counter.position.y = 0.75;
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 1.35, 4),
      new THREE.MeshStandardMaterial({ color: wd.color, roughness: 0.65 })
    );
    roof.position.y = 3.1;
    roof.rotation.y = Math.PI / 4;
    wg.add(counter, roof);

    // Price Banner
    const sTex = createTextSignTexture(wd.title, '#0f172a', '#ffffff', '#fde047', `HARGA: ${wd.price}`);
    signTexturesToDispose.push(sTex);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.8), new THREE.MeshBasicMaterial({ map: sTex }));
    sign.position.set(0, 2.25, -1.08);
    sign.rotation.y = Math.PI;
    wg.add(sign);

    // Glass-Door Ice Fridge (Kulkas Es)
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.85, 0.8), fridgeMat);
    fridge.position.set(2.8, 0.92, 0);
    const fDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.25),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd })
    );
    fDoor.position.set(2.8, 1.05, -0.42);
    fDoor.rotation.y = Math.PI;
    wg.add(fridge, fDoor);

    // Front dining table + 2 plastic chairs
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 0.9), fridgeMat);
    table.position.set(0, 0.38, -2.2);
    wg.add(table);
    [-1.1, 1.1].forEach((cx) => {
      const pChair = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.5, 0.45),
        new THREE.MeshStandardMaterial({ color: wd.color })
      );
      pChair.position.set(cx, 0.25, -2.2);
      wg.add(pChair);
    });

    // Grilled corn on charcoal grill
    const grill = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.22, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    grill.position.set(-1.3, 1.6, 0);
    for (let ci = 0; ci < 3; ci++) {
      const corn = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.08, 0.22, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      corn.rotation.z = Math.PI / 2;
      corn.position.set(-1.6 + ci * 0.3, 1.78, 0);
      wg.add(corn);
    }
    wg.add(grill);

    // Pile of 20 coconuts at main coconut warung (and 4 at others)
    const cocoCount = wi === 3 ? 20 : 4;
    for (let c = 0; c < cocoCount; c++) {
      const layer = Math.floor(c / 7);
      const posInLayer = c % 7;
      const coco = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), cocoGreenMat);
      coco.position.set(0.3 + (posInLayer % 4) * 0.38, 1.68 + layer * 0.28, -0.35 + Math.floor(posInLayer / 4) * 0.38);
      wg.add(coco);
    }

    root.add(wg);
  });

  const interactions: InteractionTarget[] = [
    { id: 'jetski_dock', name: 'Jetski Sporty Dermaga', prompt: 'Naik Jetski: Kendarai Keliling Laut dengan Joystick 🚤', icon: '🚤', actionType: 'fountain', x: -10.5, z: -6, radius: 3.6 },
    { id: 'ocean_swim', name: 'Berenang di Laut Biru', prompt: 'Berenang di Ombak Laut Segar 🏊', icon: '🏊', actionType: 'fountain', x: 0, z: -8, radius: 4.8 },
    { id: 'snorkel_coral', name: 'Snorkeling Terumbu Karang', prompt: 'Lihat Terumbu Karang & Penyu Laut 🤿', icon: '🤿', actionType: 'fountain', x: 6, z: -7, radius: 3.4 },
    { id: 'coconut_stall', name: 'Warung Es Kelapa Muda', prompt: 'Beli Es Kelapa Muda Segar (20 Koin 🥥)', icon: '🥥', actionType: 'icecream', x: 10.5, z: 8.5, radius: 3.2 },
    { id: 'lounger_left', name: 'Kursi Santai Pantai', prompt: 'Berjemur Santai di Bawah Payung Pantai 🏖️', icon: '🏖️', actionType: 'sleep', x: -12, z: 6, radius: 2.8 },
    { id: 'lounger_right', name: 'Kursi Pantai Kanan', prompt: 'Duduk Santai Memandang Sunset 🪑', icon: '🪑', actionType: 'sit', x: 9, z: 5, radius: 2.8 },
  ];

  const update = (time: number) => {
    nearWater.position.y = 0.055 + Math.sin(time * 2.2) * 0.04;
    midWater.position.y = 0.04 + Math.sin(time * 1.8) * 0.045;
    foamBands.forEach((fb) => {
      fb.mesh.position.z = fb.baseZ + Math.sin(time * 2.1 + fb.phase) * 0.8;
    });
    buoy.position.y = 0.35 + Math.sin(time * 2.5) * 0.1;

    vBall.position.set(
      -2 + Math.sin(time * 1.9) * 1.6,
      2.35 + Math.abs(Math.cos(time * 1.9)) * 1.25,
      8.8 + Math.sin(time * 1.9) * 1.8
    );

    palmLeavesList.forEach((crown, i) => {
      crown.rotation.z = Math.sin(time * 1.5 + i) * 0.09;
    });

    boatGroupList.forEach((boat, i) => {
      boat.position.y = 0.15 + Math.sin(time * 2.0 + i * 1.2) * 0.08;
      boat.rotation.z = Math.sin(time * 1.6 + i * 0.8) * 0.07;
    });

    gulls.forEach((g) => {
      const a = time * 0.42 + g.phase;
      g.group.position.set(Math.cos(a) * g.r, g.h + Math.sin(time * 2 + g.phase) * 0.35, Math.sin(a) * g.r);
      g.group.rotation.y = -a;
      const flap = Math.sin(time * 7.5 + g.phase) * 0.42;
      g.group.children[0].rotation.z = flap;
      g.group.children[1].rotation.z = -flap;
    });

    planeGroup.position.x = ((time * 2.2) % 90) - 45;
    clouds.forEach((c) => {
      c.group.position.x = ((c.startX + time * c.speed * 2 + 50) % 90) - 45;
    });
  };

  const cleanup = () => {
    scene.remove(root);
    signTexturesToDispose.forEach((t) => t.dispose());
    disposeHierarchy(root);
  };

  return { interactions, update, cleanup };
}
