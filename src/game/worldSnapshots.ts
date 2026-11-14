import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameWorldLocation } from './types';
import {
  createGradientSkyDome,
  createGrassPBRMaterial,
  createPavingPBRMaterial,
  createReflectiveGlassMaterial,
  createSandPBRMaterial,
  createWaterCausticsMaterial,
  createWaterPBRMaterial,
  createWoodPBRMaterial,
} from './pbrMaterials';

export type SnapshotKey = GameWorldLocation | 'hero_city';

const snapshotCache = new Map<SnapshotKey, string>();

function buildMiniHumanSilhouette(
  shirtColor: number,
  pantsColor: number,
  skinColor = 0xffe4d6
): THREE.Group {
  const g = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.45 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.65 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), skinMat);
  head.position.y = 1.18;
  head.castShadow = true;
  g.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
  hair.position.set(0, 1.2, -0.02);
  g.add(hair);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 8, 12), shirtMat);
  torso.position.y = 0.78;
  torso.castShadow = true;
  g.add(torso);

  [-0.08, 0.08].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.36, 6, 10), pantsMat);
    leg.position.set(lx, 0.25, 0);
    leg.castShadow = true;
    g.add(leg);
  });

  [-0.2, 0.2].forEach((ax) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.32, 6, 10), shirtMat);
    arm.position.set(ax, 0.75, 0);
    arm.rotation.z = ax < 0 ? 0.14 : -0.14;
    g.add(arm);
  });

  return g;
}

function populateSnapshotScene(key: SnapshotKey, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  if (key === 'hero_city') {
    scene.background = new THREE.Color(0x060b19);
    scene.fog = new THREE.FogExp2(0x09122b, 0.022);
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(48, 24, 16),
      createGradientSkyDome(0x040714, 0x172554, 0x3b1d5a)
    );
    scene.add(sky);

    camera.position.set(0, 4.6, 13.5);
    camera.lookAt(0, 2.6, -6);

    const moonLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    moonLight.position.set(-8, 14, 8);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // Asphalt avenue + reflective puddle water canal
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 26),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.4 })
    );
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    const canal = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), createWaterPBRMaterial(0x0284c7, 0.85));
    canal.rotation.x = -Math.PI / 2;
    canal.position.set(0, 0.02, 4.5);
    scene.add(canal);

    // Glowing crescent moon
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    moon.position.set(-7.5, 9.5, -18);
    scene.add(moon);

    // City skyline skyscrapers with lit windows & neon crowns
    const neonColors = [0xf472b6, 0x38bdf8, 0xfacc15, 0xa855f7, 0x34d399];
    for (let i = -7; i <= 7; i++) {
      if (Math.abs(i) === 0) continue;
      const h = 4.5 + ((Math.abs(i * 37) % 7) * 1.4);
      const w = 1.6 + (Math.abs(i) % 2) * 0.5;
      const z = -6 - (Math.abs(i * 19) % 5) * 1.6;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, w),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.6 })
      );
      bldg.position.set(i * 1.75, h / 2, z);
      bldg.castShadow = true;
      scene.add(bldg);

      const accent = neonColors[Math.abs(i) % neonColors.length];
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.08, 0.16, w + 0.08),
        new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.8 })
      );
      crown.position.set(i * 1.75, h - 0.15, z);
      scene.add(crown);

      // Window grid strips
      for (let wy = 1; wy < h - 0.8; wy += 0.65) {
        const winStrip = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.72, 0.22),
          new THREE.MeshBasicMaterial({
            color: (wy + i) % 2 === 0 ? 0xfde68a : 0x7dd3fc,
          })
        );
        winStrip.position.set(i * 1.75, wy, z + w / 2 + 0.01);
        scene.add(winStrip);
      }
    }

    // Warm street lamps along promenade
    [-6, -2, 2, 6].forEach((lx) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, 2.8, 10),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
      );
      pole.position.set(lx, 1.4, 1.3);
      scene.add(pole);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 2.2 })
      );
      bulb.position.set(lx, 2.85, 1.3);
      scene.add(bulb);

      const pt = new THREE.PointLight(0xfbbf24, 3.2, 8);
      pt.position.set(lx, 2.6, 1.5);
      scene.add(pt);
    });
    return;
  }

  if (key === 'taman') {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(45, 24, 16),
      createGradientSkyDome(0x38bdf8, 0xfdba74, 0xfef3c7)
    );
    scene.add(sky);
    scene.fog = new THREE.Fog(0xfde68a, 18, 42);

    camera.position.set(4.5, 3.3, 9.2);
    camera.lookAt(0, 1.2, -1);

    const sun = new THREE.DirectionalLight(0xffedd5, 2.1);
    sun.position.set(-8, 9, 6);
    sun.castShadow = true;
    scene.add(sun);

    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), createGrassPBRMaterial());
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    scene.add(lawn);

    const paving = new THREE.Mesh(new THREE.CircleGeometry(4.2, 32), createPavingPBRMaterial());
    paving.rotation.x = -Math.PI / 2;
    paving.position.y = 0.015;
    paving.receiveShadow = true;
    scene.add(paving);

    // Fountain
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.3, 0.5, 28),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
    );
    basin.position.set(0, 0.25, -1);
    basin.castShadow = true;
    scene.add(basin);
    const poolWater = new THREE.Mesh(new THREE.CircleGeometry(1.9, 28), createWaterPBRMaterial(0x38bdf8, 0.9));
    poolWater.rotation.x = -Math.PI / 2;
    poolWater.position.set(0, 0.45, -1);
    scene.add(poolWater);

    // Shady Trees
    const woodMat = createWoodPBRMaterial('#6d4423', '#42250e');
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
    [[-4.2, -3.5], [4.5, -4], [-5, 2.8]].forEach(([tx, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.6, 12), woodMat);
      trunk.position.set(tx, 1.3, tz);
      trunk.castShadow = true;
      scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 1), leafMat);
      crown.position.set(tx, 3.0, tz);
      crown.castShadow = true;
      scene.add(crown);
    });

    // Swing frame + NPCs playing ball
    const swing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), woodMat);
    swing.rotation.z = Math.PI / 2;
    swing.position.set(-3.2, 2.2, 1.4);
    scene.add(swing);

    const kid1 = buildMiniHumanSilhouette(0xf43f5e, 0x1d4ed8);
    kid1.position.set(1.8, 0, 2.6);
    kid1.rotation.y = 0.6;
    scene.add(kid1);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    ball.position.set(2.35, 0.16, 3.1);
    scene.add(ball);
    return;
  }

  if (key === 'pantai') {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(48, 24, 16),
      createGradientSkyDome(0x581c87, 0xf43f5e, 0xfbbf24)
    );
    scene.add(sky);
    scene.fog = new THREE.Fog(0xfb923c, 20, 46);

    camera.position.set(-3.8, 2.6, 8.8);
    camera.lookAt(0.8, 1.1, -4);

    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 24, 20),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    sunOrb.position.set(2.5, 3.8, -22);
    scene.add(sunOrb);

    const sunLight = new THREE.DirectionalLight(0xfdba74, 2.2);
    sunLight.position.set(4, 6, -12);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const sand = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), createSandPBRMaterial());
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(0, 0, 6);
    sand.receiveShadow = true;
    scene.add(sand);

    const sea = new THREE.Mesh(new THREE.PlaneGeometry(46, 26), createWaterPBRMaterial(0x0284c7, 0.9));
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, 0.04, -10);
    scene.add(sea);

    // White seafoam strip
    const foam = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 0.55),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72 })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(0, 0.06, -0.5);
    scene.add(foam);

    // Palm tree
    const palmTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.24, 3.8, 12),
      createWoodPBRMaterial('#854d0e', '#451a03')
    );
    palmTrunk.position.set(-3.2, 1.85, 2.4);
    palmTrunk.rotation.z = -0.18;
    palmTrunk.castShadow = true;
    scene.add(palmTrunk);
    for (let f = 0; f < 6; f++) {
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 1.9, 6),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
      );
      const ang = (f / 6) * Math.PI * 2;
      frond.position.set(-2.9 + Math.cos(ang) * 0.7, 3.7, 2.4 + Math.sin(ang) * 0.7);
      frond.rotation.z = Math.cos(ang) * -1.1;
      frond.rotation.x = Math.sin(ang) * 1.1;
      scene.add(frond);
    }

    // Fishing boat & umbrella
    const boat = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.4, 0.7),
      createWoodPBRMaterial('#b45309', '#451a03')
    );
    boat.position.set(4.5, 0.15, -8.5);
    scene.add(boat);

    const umb = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 })
    );
    umb.position.set(2.4, 2.1, 3.2);
    umb.castShadow = true;
    scene.add(umb);
    return;
  }

  if (key === 'cafe') {
    scene.background = new THREE.Color(0x271307);
    scene.fog = new THREE.Fog(0x271307, 10, 26);

    camera.position.set(4.2, 2.7, 6.2);
    camera.lookAt(-0.3, 1.2, -1);

    const warmLight = new THREE.PointLight(0xfbbf24, 5.5, 16);
    warmLight.position.set(0, 3.6, 0);
    warmLight.castShadow = true;
    scene.add(warmLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      createWoodPBRMaterial('#78350f', '#451a03', 4, 4, 0.45)
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 7),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 })
    );
    wall.position.set(0, 3.5, -5.5);
    scene.add(wall);

    // Barista counter + espresso machine
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 1.1, 1.3),
      createWoodPBRMaterial('#92400e', '#451a03')
    );
    counter.position.set(-1.2, 0.55, -3.5);
    counter.castShadow = true;
    scene.add(counter);

    const espresso = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.65, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    espresso.position.set(-1.5, 1.42, -3.5);
    scene.add(espresso);

    // Pendant lamps glowing
    [-2, 0.2, 2.4].forEach((lx) => {
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.38, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.9 })
      );
      shade.position.set(lx, 3.3, -1.5);
      scene.add(shade);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      bulb.position.set(lx, 3.12, -1.5);
      scene.add(bulb);
    });

    // Foreground wooden coffee table with steaming cup & laptop
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.08, 24),
      createWoodPBRMaterial('#b45309', '#451a03', 1, 1, 0.35)
    );
    tableTop.position.set(1.2, 0.82, 1.4);
    tableTop.castShadow = true;
    scene.add(tableTop);

    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.28, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.7 })
    );
    laptop.position.set(1.05, 1.0, 1.25);
    laptop.rotation.x = -0.25;
    scene.add(laptop);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.06, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    cup.position.set(1.42, 0.93, 1.5);
    scene.add(cup);

    const patron = buildMiniHumanSilhouette(0xfb7185, 0x334155);
    patron.position.set(1.2, 0, 2.1);
    patron.rotation.y = Math.PI;
    scene.add(patron);
    return;
  }

  if (key === 'aquarium') {
    scene.background = new THREE.Color(0x031126);
    scene.fog = new THREE.FogExp2(0x041e42, 0.055);

    camera.position.set(0, 1.7, 6.2);
    camera.lookAt(0, 2.1, -3);

    const aqLight = new THREE.PointLight(0x38bdf8, 8, 24);
    aqLight.position.set(0, 5.5, -1);
    scene.add(aqLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 22),
      createWaterCausticsMaterial('#082f49')
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Glass tunnel arch
    const tunnel = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.4, 16, 28, 1, true, 0, Math.PI),
      createReflectiveGlassMaterial(0x7dd3fc, 0.28)
    );
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = Math.PI / 2;
    tunnel.position.set(0, 0.4, -2);
    scene.add(tunnel);

    // Shark overhead
    const sharkGroup = new THREE.Group();
    const sharkBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 1.7, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.2 })
    );
    sharkBody.rotation.z = Math.PI / 2;
    sharkGroup.add(sharkBody);
    const fin = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.55, 6),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    fin.position.set(0, 0.42, 0);
    sharkGroup.add(fin);
    sharkGroup.position.set(-0.6, 3.9, -2.5);
    sharkGroup.rotation.y = 0.25;
    scene.add(sharkGroup);

    // Glowing pink jellyfish & colorful clownfish
    [[-2.2, 2.9, -3.5], [2.4, 3.2, -4.2]].forEach(([jx, jy, jz]) => {
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
        new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xec4899,
          emissiveIntensity: 1.8,
          transparent: true,
          opacity: 0.85,
        })
      );
      bell.position.set(jx, jy, jz);
      scene.add(bell);
    });

    const fishMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.4 });
    [[1.4, 2.2, -1.6], [1.9, 2.5, -2.2], [-1.7, 1.9, -1.8]].forEach(([fx, fy, fz]) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), fishMat);
      f.scale.set(1.5, 0.9, 0.7);
      f.position.set(fx, fy, fz);
      scene.add(f);
    });

    const kid = buildMiniHumanSilhouette(0x38bdf8, 0x1e293b);
    kid.position.set(-0.9, 0, 1.5);
    kid.rotation.y = Math.PI;
    scene.add(kid);
    return;
  }

  // PASAR MALAM
  scene.background = new THREE.Color(0x090b1a);
  scene.fog = new THREE.FogExp2(0x160d2e, 0.032);

  camera.position.set(5.2, 3.4, 10.5);
  camera.lookAt(-0.5, 2.6, -4);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), createPavingPBRMaterial('#334155', '#1e293b'));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const neonPt = new THREE.PointLight(0xf472b6, 7, 22);
  neonPt.position.set(-2, 5, -2);
  scene.add(neonPt);
  const goldPt = new THREE.PointLight(0xfacc15, 6, 18);
  goldPt.position.set(3, 4, 2);
  scene.add(goldPt);

  // Glowing Neon Ferris Wheel
  const wheelRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.14, 12, 36),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 1.6 })
  );
  wheelRing.position.set(-2.5, 4.4, -4.5);
  scene.add(wheelRing);

  const podColors = [0x38bdf8, 0xfacc15, 0xa855f7, 0x34d399];
  for (let g = 0; g < 10; g++) {
    const ang = (g / 10) * Math.PI * 2;
    const col = podColors[g % podColors.length];
    const pod = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.2 })
    );
    pod.position.set(-2.5 + Math.cos(ang) * 3.4, 4.4 + Math.sin(ang) * 3.4, -4.5);
    scene.add(pod);
  }

  // Striped Food Kiosks with warm lights
  [2.5, 5.2].forEach((kx, idx) => {
    const stall = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.3, 1.4),
      createWoodPBRMaterial('#92400e', '#451a03')
    );
    stall.position.set(kx, 0.65, 1.8 - idx * 2.4);
    scene.add(stall);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 0.8, 4),
      new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0xef4444 : 0xa855f7,
        emissive: idx === 0 ? 0xb91c1c : 0x7e22ce,
        emissiveIntensity: 0.45,
      })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(kx, 2.2, 1.8 - idx * 2.4);
    scene.add(roof);
  });

  const visitor = buildMiniHumanSilhouette(0xfacc15, 0x1e293b);
  visitor.position.set(0.8, 0, 4.0);
  visitor.rotation.y = Math.PI * 0.85;
  scene.add(visitor);
}

/**
 * Generates and caches high-detail 3D PBR snapshot renders using ONE temporary renderer.
 */
export function generateWorldSnapshots(): Record<SnapshotKey, string> {
  const keys: SnapshotKey[] = ['hero_city', 'taman', 'pantai', 'cafe', 'aquarium', 'pasar_malam'];
  const allCached = keys.every((k) => snapshotCache.has(k));

  if (!allCached) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(640, 420);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    for (const key of keys) {
      if (snapshotCache.has(key)) continue;
      const scene = new THREE.Scene();
      scene.environment = envTex;
      scene.add(new THREE.HemisphereLight(0xfffbeb, 0x334155, 0.85));

      const camera = new THREE.PerspectiveCamera(44, 640 / 420, 0.1, 80);
      populateSnapshotScene(key, scene, camera);

      renderer.render(scene, camera);
      snapshotCache.set(key, renderer.domElement.toDataURL('image/jpeg', 0.88));

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
    }

    envTex.dispose();
    renderer.dispose();
  }

  return {
    hero_city: snapshotCache.get('hero_city') || '',
    taman: snapshotCache.get('taman') || '',
    pantai: snapshotCache.get('pantai') || '',
    cafe: snapshotCache.get('cafe') || '',
    aquarium: snapshotCache.get('aquarium') || '',
    pasar_malam: snapshotCache.get('pasar_malam') || '',
  };
}
