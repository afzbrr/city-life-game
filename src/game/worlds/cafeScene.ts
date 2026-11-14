import * as THREE from 'three';
import { InteractionTarget } from '../types';
import { createReflectiveGlassMaterial, createWoodPBRMaterial } from '../pbrMaterials';
import {
  createBrickWallTexture,
  createTextSignTexture,
  disposeHierarchy,
} from './worldHelpers';

export function buildCafeScene(scene: THREE.Scene): {
  interactions: InteractionTarget[];
  update: (time: number) => void;
  cleanup: () => void;
} {
  const root = new THREE.Group();
  scene.add(root);
  const texturesToDispose: THREE.CanvasTexture[] = [];

  // 1. FLOOR, BRICK WALLS, 4 LARGE WINDOWS WITH CURTAINS & GLASS ENTRANCE DOOR
  const floorGeo = new THREE.PlaneGeometry(42, 42);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(
    floorGeo,
    createWoodPBRMaterial('#7c3f14', '#421e06', 7, 7, 0.45)
  );
  floor.receiveShadow = true;
  root.add(floor);

  const brickTex = createBrickWallTexture();
  texturesToDispose.push(brickTex);
  const brickWallMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.82 });

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(42, 12, 0.6), brickWallMat);
  backWall.position.set(0, 6, -19.5);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 12, 42), brickWallMat);
  leftWall.position.set(-19.5, 6, 0);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 12, 42), brickWallMat);
  rightWall.position.set(19.5, 6, 0);
  root.add(backWall, leftWall, rightWall);

  // Glass Entrance Double Door at South (0, 0, 19)
  const frameWoodMat = createWoodPBRMaterial('#5c2d0c', '#361704', 1, 1);
  const glassMat = createReflectiveGlassMaterial(0xbae6fd, 0.3);
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0, 0, 19);
  const dFrame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4.6, 0.3), frameWoodMat);
  dFrame.position.y = 2.3;
  const dGlass = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.2, 0.1), glassMat);
  dGlass.position.y = 2.2;
  doorGroup.add(dFrame, dGlass);
  root.add(doorGroup);

  // 4 Large Arched/Framed Windows with Curtains (3 along Back Wall + 1 on Right Wall)
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 });
  const buildWindow = (wx: number, wy: number, wz: number, rotY = 0) => {
    const wg = new THREE.Group();
    wg.position.set(wx, wy, wz);
    wg.rotation.y = rotY;
    wg.add(
      new THREE.Mesh(new THREE.BoxGeometry(6.8, 5.2, 0.25), frameWoodMat),
      new THREE.Mesh(new THREE.BoxGeometry(6.2, 4.6, 0.1), glassMat)
    );
    const skyPane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 4.6),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd })
    );
    skyPane.position.z = -0.06;
    wg.add(skyPane);

    // Left & Right Draped Curtains
    [-2.7, 2.7].forEach((cx) => {
      const curtain = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 5.0, 10), curtainMat);
      curtain.scale.set(1.1, 1, 0.45);
      curtain.position.set(cx, 0, 0.25);
      wg.add(curtain);
    });
    root.add(wg);
  };
  [-12, -2, 8].forEach((wx) => buildWindow(wx, 6.2, -19.1, 0));
  buildWindow(19.1, 6.2, -2, -Math.PI / 2);

  // 2. 3 COZY RUGS + SOFA WITH PILLOWS + NEWSPAPERS & MAGAZINES
  [
    { x: 5, z: -5, r: 4.0, col: 0xfef3c7 },
    { x: -10, z: 5, r: 4.2, col: 0xfde68a },
    { x: 11, z: 6, r: 3.6, col: 0xfecdd3 },
  ].forEach((rg) => {
    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(rg.r, 28),
      new THREE.MeshStandardMaterial({ color: rg.col, roughness: 0.9 })
    );
    rug.rotateX(-Math.PI / 2);
    rug.position.set(rg.x, 0.02, rg.z);
    root.add(rug);
  });

  // Big Plush Brown Lofi Sofa (-11, 0, 5) with 4 Throw Pillows
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
  const brownSofa = new THREE.Group();
  brownSofa.position.set(-11, 0, 5);
  brownSofa.rotation.y = Math.PI / 2;
  const sBase = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.65, 2.2), sofaMat);
  sBase.position.y = 0.32;
  const sBack = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.2, 0.5), sofaMat);
  sBack.position.set(0, 1.05, -0.9);
  brownSofa.add(sBase, sBack);
  [0xf43f5e, 0xfbbf24, 0x38bdf8, 0xf43f5e].forEach((pc, pi) => {
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.55, 0.25),
      new THREE.MeshStandardMaterial({ color: pc, roughness: 0.85 })
    );
    pillow.position.set(-2.1 + pi * 1.4, 0.95, -0.5);
    pillow.rotation.x = -0.25;
    brownSofa.add(pillow);
  });
  root.add(brownSofa);

  // 3. LONG BARISTA BAR (-10, 0, -11) WITH 8 BAR STOOLS, 3 ESPRESSO MACHINES, SYRUP RACK, BLENDER, GLASSES, COOKIE JARS, CASH REGISTER
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(13.5, 2.1, 2.6),
    createWoodPBRMaterial('#6d3710', '#3d1c05', 4, 1)
  );
  counterTop.position.set(-9, 1.05, -11);
  counterTop.castShadow = true;
  root.add(counterTop);

  // 8 Bar Stools along Bar Counter
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.25 });
  const stoolSeatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 });
  for (let bs = 0; bs < 8; bs++) {
    const stool = new THREE.Group();
    stool.position.set(-14.6 + bs * 1.6, 0, -8.8);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.3, 8), metalMat);
    leg.position.y = 0.65;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.06, 12), metalMat);
    base.position.y = 0.03;
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 14), stoolSeatMat);
    seat.position.y = 1.32;
    stool.add(leg, base, seat);
    root.add(stool);
  }

  // 3 Espresso Coffee Machines + Blender + Cookie Jars + Cash Register + Receipt + Money
  for (let em = 0; em < 3; em++) {
    const machine = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.25, 1.1),
      new THREE.MeshStandardMaterial({ color: em === 1 ? 0xdc2626 : 0x1e293b, metalness: 0.85, roughness: 0.2 })
    );
    machine.position.set(-14.2 + em * 2.1, 2.72, -11.3);
    root.add(machine);
  }
  // Blender
  const blenderBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.35, 10), metalMat);
  blenderBase.position.set(-7.6, 2.28, -11.2);
  const blenderJar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.65, 10), glassMat);
  blenderJar.position.set(-7.6, 2.78, -11.2);
  root.add(blenderBase, blenderJar);

  // 4 Cookie Jars (Toples Kue)
  [0xfbbf24, 0x92400e, 0xf43f5e, 0x16a34a].forEach((cc, ci) => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.45, 10), glassMat);
    jar.position.set(-6.5 + ci * 0.6, 2.34, -10.3);
    const cookieFill = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({ color: cc })
    );
    cookieFill.position.set(-6.5 + ci * 0.6, 2.28, -10.3);
    root.add(jar, cookieFill);
  });

  // Cash Register + Receipt + Bills
  const register = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.65), metalMat);
  register.position.set(-3.6, 2.38, -10.8);
  const receipt = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.45),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  receipt.position.set(-3.2, 2.65, -10.6);
  const bills = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.04, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x22c55e })
  );
  bills.position.set(-3.6, 2.14, -10.2);
  root.add(register, receipt, bills);

  // Back Bar Syrup Bottle Rack (12 colorful syrup bottles) + Hanging Glasses Rack
  const backBarShelf = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.16, 0.9), frameWoodMat);
  backBarShelf.position.set(-9.5, 3.6, -14.2);
  root.add(backBarShelf);
  const syrupPalette = [0xf43f5e, 0xf59e0b, 0x10b981, 0x3b82f6, 0xa855f7, 0xec4899];
  for (let sb = 0; sb < 12; sb++) {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.12, 0.58, 8),
      new THREE.MeshStandardMaterial({ color: syrupPalette[sb % syrupPalette.length], roughness: 0.25 })
    );
    bottle.position.set(-14.0 + sb * 0.82, 3.98, -14.2);
    root.add(bottle);
  }

  // Hanging Glasses Rack above Bar
  const glassRack = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.12, 1.4), metalMat);
  glassRack.position.set(-9, 6.2, -11);
  root.add(glassRack);
  for (let hg = 0; hg < 10; hg++) {
    const glass = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 10), glassMat);
    glass.position.set(-13 + hg * 0.88, 5.95, -11);
    root.add(glass);
  }

  // Handwritten Chalkboard Menu + Neon Cafe Sign
  const menuTex = createTextSignTexture('MENU BARISTA ☕', '#0f172a', '#fde68a', '#f59e0b', 'Latte • Matcha • Croissant • Boba');
  texturesToDispose.push(menuTex);
  const menuBoard = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.5), new THREE.MeshBasicMaterial({ map: menuTex }));
  menuBoard.position.set(-9.5, 5.8, -14.6);
  root.add(menuBoard);

  const cafeSignTex = createTextSignTexture('CITY COZY CAFE ☕', '#451a03', '#fef08a', '#f472b6');
  texturesToDispose.push(cafeSignTex);
  const cafeSign = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.5), new THREE.MeshBasicMaterial({ map: cafeSignTex }));
  cafeSign.position.set(-19.1, 7.2, -4);
  cafeSign.rotation.y = Math.PI / 2;
  root.add(cafeSign);

  // 4. 2 FULL BOOKSHELVES + 5 PAINTINGS + LARGE MIRROR + WALL CLOCK
  const bookColors = [0xf43f5e, 0x3b82f6, 0x10b981, 0xf59e0b, 0xa855f7, 0xec4899];
  [6, 12].forEach((sz) => {
    const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 4.4, 3.8), frameWoodMat);
    shelfFrame.position.set(-18.6, 2.2, sz);
    root.add(shelfFrame);
    for (let row = 0; row < 3; row++) {
      for (let bk = 0; bk < 6; bk++) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.65, 0.35),
          new THREE.MeshStandardMaterial({ color: bookColors[(row + bk) % bookColors.length], roughness: 0.7 })
        );
        book.position.set(-18.25, 1.1 + row * 1.15, sz - 1.3 + bk * 0.52);
        root.add(book);
      }
    }
  });

  // 5 Framed Paintings + 1 Large Wall Mirror + 1 Wall Clock
  const artColors = [0xf43f5e, 0x38bdf8, 0xfbbf24, 0x10b981, 0xa855f7];
  [
    [-19.1, 6.2, -13, Math.PI / 2],
    [-19.1, 6.2, 2, Math.PI / 2],
    [19.1, 6.2, -11, -Math.PI / 2],
    [19.1, 6.2, 6, -Math.PI / 2],
    [19.1, 6.2, 13, -Math.PI / 2],
  ].forEach(([px, py, pz, ry], pi) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.14), frameWoodMat);
    frame.position.set(px, py, pz);
    frame.rotation.y = ry;
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.4),
      new THREE.MeshStandardMaterial({ color: artColors[pi] })
    );
    canvas.position.z = 0.08;
    frame.add(canvas);
    root.add(frame);
  });

  // Large Mirror
  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 0.16), frameWoodMat);
  mirrorFrame.position.set(16.2, 4.6, -19.1);
  const mirrorGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 3.8),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.08 })
  );
  mirrorGlass.position.z = 0.09;
  mirrorFrame.add(mirrorGlass);
  root.add(mirrorFrame);

  // Wall Clock
  const clockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.12, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(-19.1, 8.2, -8);
  clockFace.rotation.z = Math.PI / 2;
  root.add(clockFace);

  // 5. 13 TABLES & 26+ CHAIRS WITH RICH TABLETOP PROPS (NO EMPTY TABLES!)
  const tableWoodMat = createWoodPBRMaterial('#a15c26', '#542c0d', 2, 2, 0.42);
  const chairWoodMat = createWoodPBRMaterial('#b45309', '#5c2d0c', 1, 1);
  const steamParticles: THREE.Mesh[] = [];
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });

  const addChair = (parent: THREE.Group, cx: number, cz: number, rotY: number) => {
    const chair = new THREE.Group();
    chair.position.set(cx, 0, cz);
    chair.rotation.y = rotY;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.76), chairWoodMat);
    seat.position.y = 0.58;
    seat.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 0.08), chairWoodMat);
    back.position.set(0, 0.96, 0.34);
    back.castShadow = true;
    // 4 Solid grounded chair legs
    [
      [-0.31, -0.31],
      [0.31, -0.31],
      [-0.31, 0.31],
      [0.31, 0.31],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.58, 8), metalMat);
      leg.position.set(lx, 0.29, lz);
      leg.castShadow = true;
      chair.add(leg);
    });
    chair.add(seat, back);
    parent.add(chair);
  };

  const addTableProps = (tGroup: THREE.Group, variant: number) => {
    // Coffee or Matcha cup sitting flush on y = 1.15 tabletop
    const isMatcha = variant % 3 === 1;
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.12, 0.24, 10),
      new THREE.MeshStandardMaterial({ color: isMatcha ? 0x22c55e : 0xffffff, roughness: 0.2 })
    );
    cup.position.set(-0.35, 1.32, 0.1);
    tGroup.add(cup);

    const steam = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), steamMat);
    steam.position.set(-0.35, 1.56, 0.1);
    tGroup.add(steam);
    steamParticles.push(steam);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.2, 0.04, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    plate.position.set(0.25, 1.22, 0.25);
    const pastry = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      new THREE.MeshStandardMaterial({ color: variant % 2 === 0 ? 0xd97706 : 0xf43f5e })
    );
    pastry.scale.set(1.3, 0.65, 0.9);
    pastry.position.set(0.25, 1.3, 0.25);
    tGroup.add(plate, pastry);

    if (variant % 3 === 0 || variant === 4) {
      const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.54), metalMat);
      lapBase.position.set(0.32, 1.22, -0.25);
      const lapScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.52, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      lapScreen.position.set(0.32, 1.48, -0.49);
      lapScreen.rotation.x = -0.2;
      tGroup.add(lapBase, lapScreen);
    } else {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.05, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xfef9c3 })
      );
      book.position.set(0.3, 1.22, -0.25);
      tGroup.add(book);
    }

    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.11, 0.24, 10),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc })
    );
    vase.position.set(-0.05, 1.32, -0.3);
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 8),
      new THREE.MeshStandardMaterial({ color: variant === 0 ? 0xe11d48 : 0xfacc15 })
    );
    flower.position.set(-0.05, 1.5, -0.3);
    const tissue = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.13, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
    );
    tissue.position.set(-0.48, 1.26, -0.35);
    const phone = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.03, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    phone.position.set(-0.6, 1.22, 0.25);
    tGroup.add(vase, flower, tissue, phone);
  };

  // 10 Round Bistro Tables (including interactive (5,-5), (-3,4), (5,9))
  const roundTableCoords: [number, number][] = [
    [5, -5], [5, 2], [5, 9], [-3, -3], [-3, 4],
    [12, -5], [12, 2], [12, 9], [-3, 11], [5, 15],
  ];
  roundTableCoords.forEach(([tx, tz], ti) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, 0, tz);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.1, 20), tableWoodMat);
    top.position.y = 1.15;
    top.castShadow = true;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.15, 10), metalMat);
    leg.position.y = 0.58;
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 14), metalMat);
    disk.position.y = 0.03;
    tGroup.add(top, leg, disk);

    addChair(tGroup, -1.55, 0, -Math.PI / 2);
    addChair(tGroup, 1.55, 0, Math.PI / 2);
    addTableProps(tGroup, ti);
    root.add(tGroup);
  });

  // 1 Long Communal Study Table (Meja Panjang Buat Nugas) at (12, 0, 15) with 4 chairs
  const longTable = new THREE.Group();
  longTable.position.set(12, 0, 15);
  const ltTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 2.0), tableWoodMat);
  ltTop.position.y = 1.15;
  longTable.add(ltTop);
  [-2.3, 2.3].forEach((lx) => {
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.15, 1.6), metalMat);
    lLeg.position.set(lx, 0.58, 0);
    longTable.add(lLeg);
  });
  [-1.6, 1.6].forEach((cx) => {
    addChair(longTable, cx, -1.35, Math.PI);
    addChair(longTable, cx, 1.35, 0);
  });
  addTableProps(longTable, 0);
  root.add(longTable);

  // 1 Window Bar Table along Right Window (17.8, 0, -2) with 3 chairs
  const winBar = new THREE.Group();
  winBar.position.set(17.8, 0, -2);
  const wbTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 6.2), tableWoodMat);
  wbTop.position.y = 1.15;
  winBar.add(wbTop);
  [-2, 0, 2].forEach((cz) => {
    addChair(winBar, -1.05, cz, -Math.PI / 2);
  });
  addTableProps(winBar, 1);
  root.add(winBar);

  // 1 Low Sofa Coffee Table (-8.5, 0, 5) with Newspapers, Magazines & Handbag
  const sofaTable = new THREE.Group();
  sofaTable.position.set(-8.5, 0, 5);
  const stTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 3.2), tableWoodMat);
  stTop.position.y = 0.75;
  const stLeg1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.12), metalMat);
  stLeg1.position.set(0, 0.37, -1.3);
  const stLeg2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.12), metalMat);
  stLeg2.position.set(0, 0.37, 1.3);
  const newspaper = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.04, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
  );
  newspaper.position.set(0, 0.82, -0.6);
  const magazine = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.04, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xf472b6 })
  );
  magazine.position.set(0.1, 0.82, 0.3);
  const handbag = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.38, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x991b1b })
  );
  handbag.position.set(-0.2, 0.99, 1.0);
  sofaTable.add(stTop, stLeg1, stLeg2, newspaper, magazine, handbag);
  root.add(sofaTable);

  // 6. 8 WARM HANGING PENDANT LAMPS + WALL TUMBLR FAIRY LIGHTS + 10 POTTED PLANTS
  [
    [-8, 8.5, -4], [-2, 8.5, 3], [5, 8.5, -5], [5, 8.5, 9],
    [12, 8.5, -5], [12, 8.5, 9], [-3, 8.5, 11], [12, 8.5, 15],
  ].forEach(([lx, ly, lz], li) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, ly, lz);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.5), metalMat);
    wire.position.y = 1.25;
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 0.65, 14),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.4 })
    );
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    bulb.position.y = -0.15;
    lamp.add(wire, shade, bulb);
    if (li < 3) {
      const warmLight = new THREE.PointLight(0xfef08a, 0.4, 11);
      warmLight.position.y = -0.3;
      lamp.add(warmLight);
    }
    root.add(lamp);
  });

  // Wall Tumblr Fairy String Lights (24 bulbs along ceiling & left brick wall)
  const tumblrGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const tumblrMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  for (let ti = 0; ti < 14; ti++) {
    const t = ti / 13;
    const bulb = new THREE.Mesh(tumblrGeo, tumblrMat);
    bulb.position.set(-14 + t * 28, 8.6 - Math.sin(t * Math.PI) * 1.1, -9);
    root.add(bulb);
  }
  for (let wi = 0; wi < 12; wi++) {
    const bulb = new THREE.Mesh(tumblrGeo, tumblrMat);
    bulb.position.set(-19.1, 8.4 - Math.sin((wi / 11) * Math.PI) * 0.9, -14 + wi * 2.5);
    root.add(bulb);
  }

  // 10 Potted Monstera Plants
  const potMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
  [
    [-17, -17], [-17, 11], [16, -17], [16, 12], [-5, -11],
    [0, 12], [17, 4], [-17, -2], [6, -17], [-9, 16],
  ].forEach(([px, pz]) => {
    const plant = new THREE.Group();
    plant.position.set(px, 0, pz);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.32, 0.75, 10), potMat);
    pot.position.y = 0.38;
    plant.add(pot);
    for (let li = 0; li < 5; li++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 7), leafMat);
      leaf.scale.set(0.9, 1.4, 0.15);
      const ang = (li / 5) * Math.PI * 2;
      leaf.position.set(Math.cos(ang) * 0.25, 0.8 + (li % 2) * 0.2, Math.sin(ang) * 0.25);
      leaf.rotation.y = ang;
      leaf.rotation.x = 0.3;
      plant.add(leaf);
    }
    root.add(plant);
  });

  // Spinning Overhead Ceiling Fan (Kipas Angin Langit-Langit)
  const fanGroup = new THREE.Group();
  fanGroup.position.set(2, 9.6, 1);
  const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.25, 12), metalMat);
  fanGroup.add(fanHub);
  for (let b = 0; b < 4; b++) {
    const bladeWrap = new THREE.Group();
    bladeWrap.rotation.y = (b / 4) * Math.PI * 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.34), frameWoodMat);
    blade.position.x = 1.2;
    bladeWrap.add(blade);
    fanGroup.add(bladeWrap);
  }
  root.add(fanGroup);

  // Animated Barista Staff behind Counter (-10, 0, -12.7)
  const baristaGroup = new THREE.Group();
  baristaGroup.position.set(-10.2, 0, -12.8);
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.65 });
  const bTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 6, 10), apronMat);
  bTorso.position.y = 1.35;
  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffe4d6, roughness: 0.5 }));
  bHead.position.y = 1.92;
  const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.1, 12), apronMat);
  bCap.position.y = 2.06;
  const bArmR = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.36, 4, 8), apronMat);
  bArmR.position.set(-0.26, 1.48, 0.18);
  bArmR.rotation.x = -0.9;
  baristaGroup.add(bTorso, bHead, bCap, bArmR);
  root.add(baristaGroup);

  const interactions: InteractionTarget[] = [
    { id: 'cafe_barista', name: 'Counter Barista Cafe', prompt: 'Pesan Kopi Latte Hangat (30 Koin ☕)', icon: '☕', actionType: 'icecream', x: -10, z: -11, radius: 3.4 },
    { id: 'cafe_date', name: 'Meja Ngedate Berdua', prompt: 'Duduk Berdua di Meja Romantis 🌹', icon: '🌹', actionType: 'sit', x: 5, z: -5, radius: 2.8 },
    { id: 'cafe_study', name: 'Meja Laptop & Nugas', prompt: 'Buka Laptop & Nugas (+50 Koin Bonus 💻)', icon: '💻', actionType: 'sit', x: -3, z: 4, radius: 2.8 },
    { id: 'cafe_sofa', name: 'Sofa Coklat Empuk', prompt: 'Duduk Santai di Sofa Dengar Musik Lofi 🛋️', icon: '🛋️', actionType: 'sit', x: -11, z: 5, radius: 3.2 },
    { id: 'cafe_window_seat', name: 'Meja Pojok Jendela', prompt: 'Duduk Santai Memandang Jendela 🪑', icon: '🪑', actionType: 'sit', x: 5, z: 9, radius: 2.8 },
  ];

  const update = (time: number) => {
    steamParticles.forEach((sp, i) => {
      sp.position.y = 1.5 + ((time * 0.4 + i * 0.3) % 0.65);
      sp.scale.setScalar(0.8 + Math.sin(time * 2 + i) * 0.2);
    });
    fanGroup.rotation.y = time * 4.2;
    baristaGroup.position.x = -10.2 + Math.sin(time * 0.8) * 1.4;
    bArmR.rotation.x = -0.8 + Math.sin(time * 5.0) * 0.35;
  };

  const cleanup = () => {
    scene.remove(root);
    texturesToDispose.forEach((t) => t.dispose());
    disposeHierarchy(root);
  };

  return { interactions, update, cleanup };
}
