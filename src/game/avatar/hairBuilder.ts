import * as THREE from 'three';

export interface HairSwayEntry {
  group: THREE.Group;
  baseRotX: number;
  baseRotZ: number;
  factor: number;
  phase: number;
}

const HEAD_R = 0.19;

/**
 * Helper to create a tapered 3D hair strand (smooth Tube + pointed/rounded tip)
 */
function addHairStrand(
  parent: THREE.Object3D,
  points: THREE.Vector3[],
  radius: number,
  mat: THREE.Material,
  pointTip = false
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 8, false), mat);
  mesh.castShadow = true;
  parent.add(mesh);

  if (pointTip && points.length >= 2) {
    const end = points[points.length - 1];
    const prev = points[points.length - 2];
    const dir = new THREE.Vector3().subVectors(end, prev).normalize();
    const tip = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.95, radius * 2.8, 7), mat);
    tip.position.copy(end).addScaledVector(dir, radius * 1.1);
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    parent.add(tip);
  }
}

/**
 * Helper for gradual fade side/back bands (shows subtle skin transition!)
 */
function addFadeBand(
  parent: THREE.Object3D,
  hairMat: THREE.Material,
  skinMat: THREE.Material,
  yOffset: number,
  thickness: number,
  blendWeight: number
) {
  const hairCol = (hairMat as THREE.MeshStandardMaterial).color;
  const skinCol = (skinMat as THREE.MeshStandardMaterial).color;
  const mixed = skinCol.clone().lerp(hairCol, blendWeight);
  const mat = new THREE.MeshStandardMaterial({
    color: mixed,
    roughness: 0.55,
    metalness: 0.05,
  });

  // Back & side crescent band leaving face clear (+Z front gap)
  const geo = new THREE.SphereGeometry(
    HEAD_R + thickness,
    24,
    10,
    Math.PI * 0.9,
    Math.PI * 1.2,
    Math.PI * (0.42 - yOffset),
    Math.PI * 0.24
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(0.97, 1.03, 0.96);
  parent.add(mesh);
}

/**
 * Helper for sculpted skull crown base
 */
function addCrownCap(
  parent: THREE.Object3D,
  hairMat: THREE.Material,
  opts: {
    radiusExtra?: number;
    thetaLength?: number;
    scaleY?: number;
    yOffset?: number;
  } = {}
) {
  const geo = new THREE.SphereGeometry(
    HEAD_R + (opts.radiusExtra ?? 0.015),
    28,
    16,
    0,
    Math.PI * 2,
    0,
    opts.thetaLength ?? Math.PI * 0.48
  );
  const cap = new THREE.Mesh(geo, hairMat);
  cap.scale.set(0.98, opts.scaleY ?? 1.05, 0.96);
  cap.position.y = opts.yOffset ?? 0.008;
  cap.castShadow = true;
  parent.add(cap);
}

/**
 * Builds 16 genuinely distinct 3D hairstyles (8 Cowo + 8 Cewe) + legacy aliases.
 * Populates swayGroups for natural breeze & walking physics!
 */
export function build3DHairStyle(
  hairGroup: THREE.Group,
  hairStyleRaw: string,
  gender: 'cewek' | 'cowok',
  hairMat: THREE.Material,
  skinMat: THREE.Material,
  swayGroups: HairSwayEntry[]
) {
  while (hairGroup.children.length > 0) {
    hairGroup.remove(hairGroup.children[0]);
  }
  swayGroups.length = 0;

  const raw = (hairStyleRaw || '').toLowerCase();
  const normalizeStyle = (): string => {
    // 8 Cowo models
    if (raw === 'cowo_mullet' || raw === 'mullet') return 'cowo_mullet';
    if (raw === 'cowo_two_block' || raw === 'pendek' || raw === 'two_block') return 'cowo_two_block';
    if (raw === 'cowo_comma' || raw === 'comma') return 'cowo_comma';
    if (raw === 'cowo_taper_fade' || raw === 'taper_fade') return 'cowo_taper_fade';
    if (raw === 'cowo_french_crop' || raw === 'french_crop') return 'cowo_french_crop';
    if (raw === 'cowo_curtain') return 'cowo_curtain';
    if (raw === 'cowo_low_fade' || raw === 'low_fade') return 'cowo_low_fade';
    if (raw === 'cowo_perm' || raw === 'perm' || raw === 'keriting') return 'cowo_perm';

    // 8 Cewe models
    if (raw === 'cewe_long_hair' || raw === 'panjang_hitam' || raw === 'cewe_lurus_panjang' || raw === 'pirang')
      return 'cewe_long_hair';
    if (raw === 'cewe_wolf_cut' || raw === 'wolf_cut') return 'cewe_wolf_cut';
    if (raw === 'cewe_curtain_bangs') return 'cewe_curtain_bangs';
    if (raw === 'cewe_side_part') return 'cewe_side_part';
    if (raw === 'cewe_long_layers') return 'cewe_long_layers';
    if (raw === 'cewe_butterfly_cut') return 'cewe_butterfly_cut';
    if (raw === 'cewe_hush_cut') return 'cewe_hush_cut';
    if (raw === 'cewe_curtain_hair') return 'cewe_curtain_hair';

    // Legacy fallbacks
    if (raw === 'kepang' || raw === 'kepang2') return 'cewe_long_layers';
    if (raw === 'bob') return 'cewe_hush_cut';

    return gender === 'cowok' ? 'cowo_two_block' : 'cewe_long_hair';
  };

  const style = normalizeStyle();

  const registerSway = (factor: number, phase = 0, baseRotX = 0, baseRotZ = 0): THREE.Group => {
    const g = new THREE.Group();
    g.rotation.x = baseRotX;
    g.rotation.z = baseRotZ;
    hairGroup.add(g);
    swayGroups.push({ group: g, baseRotX, baseRotZ, factor, phase });
    return g;
  };

  // =========================================================================
  // 8 MODEL RAMBUT COWO
  // =========================================================================
  if (style === 'cowo_mullet') {
    // MULLET: Depan pendek bertekstur, samping pendek keliatan kuping, belakang panjang sampe leher lancip-lancip
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.017, thetaLength: Math.PI * 0.44 });
    // Short spiky front fringe above forehead
    [-0.08, -0.04, 0, 0.04, 0.08].forEach((bx, idx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(bx * 0.7, 0.175, 0.08),
          new THREE.Vector3(bx * 0.95, 0.14, 0.165),
          new THREE.Vector3(bx * 1.05, 0.095 + (idx % 2) * 0.012, 0.18),
        ],
        0.02,
        hairMat,
        true
      );
    });
    // Tapered shaved temples (cleanly above ears)
    addFadeBand(hairGroup, hairMat, skinMat, 0.04, 0.004, 0.42);
    // Long messy spiky back tail down to neck (-0.34)
    const tailSway = registerSway(0.75, 0);
    [-0.105, -0.065, -0.025, 0.025, 0.065, 0.105].forEach((bx, idx) => {
      const len = -0.32 - (idx % 2) * 0.055;
      addHairStrand(
        tailSway,
        [
          new THREE.Vector3(bx * 0.85, 0.08, -0.155),
          new THREE.Vector3(bx * 1.05, -0.09, -0.185 - (idx % 2) * 0.015),
          new THREE.Vector3(bx * 1.28, len, -0.155 - (idx % 2) * 0.02),
        ],
        0.024,
        hairMat,
        true
      );
    });
    return;
  }

  if (style === 'cowo_two_block') {
    // TWO BLOCK: Atas tebel bervolume overhang + samping & belakang cukur tipis keliatan kulit gradasi
    addFadeBand(hairGroup, hairMat, skinMat, 0.02, 0.003, 0.28);
    addFadeBand(hairGroup, hairMat, skinMat, 0.09, 0.005, 0.55);

    // Voluminous thick overhanging upper block
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.029, thetaLength: Math.PI * 0.45, scaleY: 1.08, yOffset: 0.014 });
    const topBlock = registerSway(0.28, 0.4);
    [-0.10, -0.05, 0, 0.05, 0.10].forEach((tx, idx) => {
      addHairStrand(
        topBlock,
        [
          new THREE.Vector3(tx * 0.6, 0.21, -0.07),
          new THREE.Vector3(tx * 0.9, 0.205, 0.06),
          new THREE.Vector3(tx * 1.08, 0.095 + (idx % 2) * 0.008, 0.185),
        ],
        0.029,
        hairMat
      );
    });
    // Back upper block overhang above shaved nape
    [-0.08, -0.03, 0.03, 0.08].forEach((bx) => {
      addHairStrand(
        topBlock,
        [
          new THREE.Vector3(bx * 0.7, 0.18, -0.06),
          new THREE.Vector3(bx, 0.11, -0.185),
          new THREE.Vector3(bx * 1.05, 0.02, -0.195),
        ],
        0.028,
        hairMat
      );
    });
    return;
  }

  if (style === 'cowo_comma') {
    // COMMA HAIR: Poni melengkung huruf koma (,) ke dalam di jidat, samping rapi pendek
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.02, thetaLength: Math.PI * 0.46 });
    addFadeBand(hairGroup, hairMat, skinMat, 0.04, 0.004, 0.48);

    const bangsSway = registerSway(0.32, 0.2);
    // Dramatic inward C-shaped comma lock on left/center forehead
    addHairStrand(
      bangsSway,
      [
        new THREE.Vector3(-0.045, 0.20, 0.02),
        new THREE.Vector3(-0.09, 0.16, 0.14),
        new THREE.Vector3(-0.075, 0.095, 0.195),
        new THREE.Vector3(-0.025, 0.082, 0.192),
      ],
      0.027,
      hairMat,
      true
    );
    // Supporting sleek side-swept comma lock
    addHairStrand(
      bangsSway,
      [
        new THREE.Vector3(-0.02, 0.20, 0.03),
        new THREE.Vector3(0.06, 0.16, 0.145),
        new THREE.Vector3(0.095, 0.10, 0.18),
        new THREE.Vector3(0.055, 0.085, 0.188),
      ],
      0.024,
      hairMat,
      true
    );
    // Clean back nape
    [-0.07, 0, 0.07].forEach((bx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(bx, 0.14, -0.13),
          new THREE.Vector3(bx, 0.04, -0.185),
          new THREE.Vector3(bx, -0.06, -0.175),
        ],
        0.025,
        hairMat
      );
    });
    return;
  }

  if (style === 'cowo_taper_fade') {
    // TAPER FADE: Atas bervolume swept-up, samping & belakang mengecil bertahap halus ke leher
    addFadeBand(hairGroup, hairMat, skinMat, -0.02, 0.002, 0.22);
    addFadeBand(hairGroup, hairMat, skinMat, 0.04, 0.005, 0.48);
    addFadeBand(hairGroup, hairMat, skinMat, 0.10, 0.009, 0.78);
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.02, thetaLength: Math.PI * 0.42 });

    // Textured brushed-up top pompadour/quiff silhouette
    const topSway = registerSway(0.2, 0.1);
    [-0.075, -0.035, 0.005, 0.045, 0.08].forEach((tx, i) => {
      addHairStrand(
        topSway,
        [
          new THREE.Vector3(tx * 0.8, 0.18, -0.07),
          new THREE.Vector3(tx, 0.23 + (i % 2) * 0.012, 0.04),
          new THREE.Vector3(tx * 0.95, 0.17, 0.155),
        ],
        0.027,
        hairMat,
        true
      );
    });
    return;
  }

  if (style === 'cowo_french_crop') {
    // FRENCH CROP: Atas pendek rata + poni lurus rata di tengah jidat + samping fade pendek
    addFadeBand(hairGroup, hairMat, skinMat, 0.03, 0.003, 0.35);
    addFadeBand(hairGroup, hairMat, skinMat, 0.09, 0.007, 0.65);
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.015, thetaLength: Math.PI * 0.45, scaleY: 0.98 });

    // Crisp horizontal straight blunt fringe across forehead (cleanly above brows)
    const fringe = new THREE.Mesh(
      new THREE.CylinderGeometry(HEAD_R + 0.018, HEAD_R + 0.019, 0.052, 24, 1, false, -Math.PI * 0.27, Math.PI * 0.54),
      hairMat
    );
    fringe.position.set(0, 0.108, 0.005);
    hairGroup.add(fringe);

    // Textured crop crown lines
    [-0.06, -0.02, 0.02, 0.06].forEach((cx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(cx, 0.19, -0.06),
          new THREE.Vector3(cx, 0.195, 0.06),
          new THREE.Vector3(cx, 0.132, 0.168),
        ],
        0.022,
        hairMat
      );
    });
    return;
  }

  if (style === 'cowo_curtain') {
    // CURTAIN HAIR COWO: Belahan tengah jelas, poni jatuh kiri kanan kayak gorden nutup samping jidat
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.018, thetaLength: Math.PI * 0.46 });
    addFadeBand(hairGroup, hairMat, skinMat, 0.04, 0.005, 0.55);

    const curtainSway = registerSway(0.45, 0.3);
    [-1, 1].forEach((dir) => {
      // Main thick center-parted curtain wing
      addHairStrand(
        curtainSway,
        [
          new THREE.Vector3(dir * 0.015, 0.195, 0.05),
          new THREE.Vector3(dir * 0.085, 0.145, 0.15),
          new THREE.Vector3(dir * 0.13, 0.055, 0.145),
          new THREE.Vector3(dir * 0.145, -0.02, 0.095),
        ],
        0.028,
        hairMat,
        true
      );
      // Inner wispy curtain lock
      addHairStrand(
        curtainSway,
        [
          new THREE.Vector3(dir * 0.018, 0.19, 0.08),
          new THREE.Vector3(dir * 0.068, 0.125, 0.17),
          new THREE.Vector3(dir * 0.105, 0.072, 0.165),
        ],
        0.022,
        hairMat,
        true
      );
    });
    // Medium layered back
    [-0.09, -0.03, 0.03, 0.09].forEach((bx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(bx, 0.14, -0.14),
          new THREE.Vector3(bx * 1.05, 0.02, -0.188),
          new THREE.Vector3(bx, -0.09, -0.168),
        ],
        0.026,
        hairMat
      );
    });
    return;
  }

  if (style === 'cowo_low_fade') {
    // LOW FADE: Atas & samping atas tebel penuh, fade tipisnya cuma di bagian bawah deket leher/telinga
    addFadeBand(hairGroup, hairMat, skinMat, -0.05, 0.002, 0.25);
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.026, thetaLength: Math.PI * 0.56, scaleY: 1.07 });

    const frontSway = registerSway(0.3, 0);
    [-0.085, -0.04, 0.005, 0.05, 0.09].forEach((tx, i) => {
      addHairStrand(
        frontSway,
        [
          new THREE.Vector3(tx * 0.75, 0.20, -0.04),
          new THREE.Vector3(tx, 0.185, 0.08),
          new THREE.Vector3(tx * 1.04, 0.095 + (i % 2) * 0.01, 0.18),
        ],
        0.028,
        hairMat
      );
    });
    return;
  }

  if (style === 'cowo_perm') {
    // PERM / WAVY TWO BLOCK: Samping cukur tipis, atas keriting bergelombang bervolume & ikal!
    addFadeBand(hairGroup, hairMat, skinMat, 0.02, 0.003, 0.28);
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.026, thetaLength: Math.PI * 0.44 });

    const permGroup = registerSway(0.4, 0.5);
    const curlMatGeo = new THREE.SphereGeometry(0.037, 10, 10);
    const curlCoords: [number, number, number, number][] = [
      [-0.10, 0.16, 0.12, 1.05], [-0.04, 0.185, 0.145, 1.1], [0.02, 0.19, 0.145, 1.15], [0.08, 0.165, 0.125, 1.05],
      [-0.13, 0.14, 0.04, 1.0], [-0.06, 0.21, 0.03, 1.2], [0.01, 0.22, 0.02, 1.22], [0.08, 0.205, 0.03, 1.15], [0.13, 0.14, 0.04, 1.0],
      [-0.08, 0.19, -0.08, 1.1], [0.0, 0.20, -0.09, 1.15], [0.08, 0.19, -0.08, 1.1],
      [-0.11, 0.11, 0.135, 0.95], [0.11, 0.11, 0.135, 0.95],
      [-0.06, 0.115, 0.16, 0.88], [0.0, 0.11, 0.168, 0.9], [0.06, 0.115, 0.16, 0.88],
    ];
    curlCoords.forEach(([x, y, z, s]) => {
      const c = new THREE.Mesh(curlMatGeo, hairMat);
      c.position.set(x, y, z);
      c.scale.setScalar(s);
      c.castShadow = true;
      permGroup.add(c);
    });
    return;
  }

  // =========================================================================
  // 8 MODEL RAMBUT CEWE
  // =========================================================================
  if (style === 'cewe_long_hair') {
    // LONG HAIR: Panjang lurus sampai pinggang (-0.72), ujung rata rapi + ikatan lembut di belakang
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.018, thetaLength: Math.PI * 0.5 });

    // Clean straight bangs above eyebrows
    [-0.08, -0.04, 0, 0.04, 0.08].forEach((bx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(bx * 0.85, 0.175, 0.08),
          new THREE.Vector3(bx * 0.95, 0.135, 0.175),
          new THREE.Vector3(bx, 0.092, 0.18),
        ],
        0.02,
        hairMat
      );
    });

    // Sleek straight waist-length back sheet (even flat bottom edge!)
    const backSway = registerSway(0.85, 0);
    [-0.145, -0.105, -0.065, -0.022, 0.022, 0.065, 0.105, 0.145].forEach((bx) => {
      addHairStrand(
        backSway,
        [
          new THREE.Vector3(bx * 0.82, 0.11, -0.14),
          new THREE.Vector3(bx * 1.02, -0.25, -0.185),
          new THREE.Vector3(bx * 1.06, -0.70, -0.165),
        ],
        0.032,
        hairMat
      );
    });

    // Sleek side locks framing cheeks neatly
    const sideSway = registerSway(0.55, 0.3);
    [-1, 1].forEach((dir) => {
      addHairStrand(
        sideSway,
        [
          new THREE.Vector3(dir * 0.165, 0.09, 0.03),
          new THREE.Vector3(dir * 0.185, -0.14, 0.04),
          new THREE.Vector3(dir * 0.17, -0.45, 0.02),
        ],
        0.026,
        hairMat
      );
    });
    return;
  }

  if (style === 'cewe_wolf_cut') {
    // WOLF CUT LONG: Atas layer pendek bervolume shaggy kayak serigala, bawah panjang tipis ujung lancip-lancip
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.026, thetaLength: Math.PI * 0.48, scaleY: 1.08 });

    // Shaggy spiky top/crown cheek-framing layers flaring outward
    const upperSway = registerSway(0.45, 0.2);
    [-1, 1].forEach((dir) => {
      addHairStrand(
        upperSway,
        [
          new THREE.Vector3(dir * 0.11, 0.16, 0.05),
          new THREE.Vector3(dir * 0.195, 0.04, 0.07),
          new THREE.Vector3(dir * 0.22, -0.08, 0.03),
        ],
        0.027,
        hairMat,
        true
      );
      addHairStrand(
        upperSway,
        [
          new THREE.Vector3(dir * 0.12, 0.13, -0.05),
          new THREE.Vector3(dir * 0.215, -0.01, -0.08),
          new THREE.Vector3(dir * 0.23, -0.14, -0.11),
        ],
        0.027,
        hairMat,
        true
      );
    });
    // Wispy jagged bangs above brows
    [-0.08, -0.035, 0.01, 0.055, 0.09].forEach((bx, idx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(bx * 0.75, 0.185, 0.07),
          new THREE.Vector3(bx, 0.14, 0.17),
          new THREE.Vector3(bx * 1.08, 0.086 + (idx % 2) * 0.012, 0.182),
        ],
        0.018,
        hairMat,
        true
      );
    });

    // Long thinned-out pointed bottom tail down to chest (-0.55)
    const lowerSway = registerSway(0.9, 0.4);
    [-0.12, -0.06, 0, 0.06, 0.12].forEach((bx, idx) => {
      const len = -0.48 - (idx % 2 === 0 ? 0.08 : 0);
      addHairStrand(
        lowerSway,
        [
          new THREE.Vector3(bx * 0.85, 0.06, -0.16),
          new THREE.Vector3(bx * 1.1, -0.22, -0.19),
          new THREE.Vector3(bx * 1.18, len, -0.155),
        ],
        0.024,
        hairMat,
        true
      );
    });
    return;
  }

  if (style === 'cewe_curtain_bangs') {
    // CURTAIN BANGS: Poni belah tengah panjang sampe pipi kayak gorden kiri-kanan + rambut belakang panjang
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.019, thetaLength: Math.PI * 0.49 });

    const bangsSway = registerSway(0.5, 0.1);
    [-1, 1].forEach((dir) => {
      // Sweeping curtain bangs framing cheeks down to -0.09 (never blocking eyes!)
      addHairStrand(
        bangsSway,
        [
          new THREE.Vector3(dir * 0.012, 0.19, 0.07),
          new THREE.Vector3(dir * 0.095, 0.135, 0.16),
          new THREE.Vector3(dir * 0.148, 0.04, 0.142),
          new THREE.Vector3(dir * 0.162, -0.09, 0.095),
        ],
        0.025,
        hairMat,
        true
      );
    });

    const backSway = registerSway(0.85, 0.3);
    [-0.135, -0.08, -0.025, 0.025, 0.08, 0.135].forEach((bx) => {
      addHairStrand(
        backSway,
        [
          new THREE.Vector3(bx * 0.85, 0.10, -0.14),
          new THREE.Vector3(bx * 1.05, -0.24, -0.185),
          new THREE.Vector3(bx * 1.12, -0.62, -0.16),
        ],
        0.032,
        hairMat
      );
    });
    return;
  }

  if (style === 'cewe_side_part') {
    // SIDE PART: Belahan samping jelas (-0.07), poni menyapu diagonal ke kanan, satu sisi jidat keliatan, panjang sebelah lebih tebel!
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.018, thetaLength: Math.PI * 0.49 });

    const sideSway = registerSway(0.65, 0.2);
    // Diagonal sweeping bang from left-part (-0.07) across to right temple (+0.15) leaving left forehead clear!
    addHairStrand(
      sideSway,
      [
        new THREE.Vector3(-0.07, 0.195, 0.06),
        new THREE.Vector3(0.02, 0.155, 0.165),
        new THREE.Vector3(0.115, 0.095, 0.165),
        new THREE.Vector3(0.165, -0.05, 0.11),
      ],
      0.029,
      hairMat,
      true
    );
    // Heavy cascading lock on the parted-to side (+X)
    addHairStrand(
      sideSway,
      [
        new THREE.Vector3(0.14, 0.11, 0.05),
        new THREE.Vector3(0.19, -0.12, 0.06),
        new THREE.Vector3(0.18, -0.46, 0.03),
      ],
      0.032,
      hairMat
    );
    // Light tucked lock on open forehead side (-X)
    addHairStrand(
      sideSway,
      [
        new THREE.Vector3(-0.14, 0.10, 0.0),
        new THREE.Vector3(-0.185, -0.10, -0.02),
        new THREE.Vector3(-0.165, -0.36, -0.04),
      ],
      0.022,
      hairMat
    );

    const backSway = registerSway(0.8, 0.4);
    [-0.12, -0.05, 0.02, 0.09, 0.15].forEach((bx) => {
      addHairStrand(
        backSway,
        [
          new THREE.Vector3(bx * 0.85, 0.10, -0.14),
          new THREE.Vector3(bx * 1.05, -0.22, -0.185),
          new THREE.Vector3(bx * 1.1, -0.60, -0.16),
        ],
        0.032,
        hairMat
      );
    });
    return;
  }

  if (style === 'cewe_long_layers') {
    // LONG LAYERS: Panjang sampe pinggang dengan 3 tingkatan layer bervolume & ujung ngembang keluar
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.021, thetaLength: Math.PI * 0.49 });

    // Soft layered bangs
    [-1, 1].forEach((dir) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(dir * 0.02, 0.185, 0.08),
          new THREE.Vector3(dir * 0.085, 0.13, 0.172),
          new THREE.Vector3(dir * 0.125, 0.085, 0.162),
        ],
        0.022,
        hairMat
      );
    });

    // Tier 1: Shoulder flipped-out layer (-0.28)
    const tier1 = registerSway(0.55, 0.1);
    [-0.15, -0.08, 0, 0.08, 0.15].forEach((bx) => {
      addHairStrand(
        tier1,
        [
          new THREE.Vector3(bx * 0.85, 0.11, -0.13),
          new THREE.Vector3(bx * 1.08, -0.10, -0.195),
          new THREE.Vector3(bx * 1.32, -0.28, -0.21),
        ],
        0.028,
        hairMat
      );
    });

    // Tier 2: Mid-back voluminous flared layer (-0.48)
    const tier2 = registerSway(0.75, 0.35);
    [-0.13, -0.05, 0.05, 0.13].forEach((bx) => {
      addHairStrand(
        tier2,
        [
          new THREE.Vector3(bx * 0.85, 0.06, -0.15),
          new THREE.Vector3(bx * 1.08, -0.22, -0.19),
          new THREE.Vector3(bx * 1.35, -0.48, -0.20),
        ],
        0.03,
        hairMat
      );
    });

    // Tier 3: Waist length flared layer (-0.70)
    const tier3 = registerSway(0.95, 0.6);
    [-0.10, -0.03, 0.03, 0.10].forEach((bx) => {
      addHairStrand(
        tier3,
        [
          new THREE.Vector3(bx * 0.85, 0.02, -0.16),
          new THREE.Vector3(bx * 1.05, -0.35, -0.185),
          new THREE.Vector3(bx * 1.28, -0.70, -0.195),
        ],
        0.032,
        hairMat
      );
    });
    return;
  }

  if (style === 'cewe_butterfly_cut') {
    // BUTTERFLY CUT: Layer pendek di depan dagu melengkung keluar kayak sayap kupu-kupu + layer belakang panjang ngembang saat gerak!
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.024, thetaLength: Math.PI * 0.49, scaleY: 1.07 });

    // Characteristic Chin-Length Front Butterfly Wings (curve inward then flare outward!)
    [-1, 1].forEach((dir) => {
      const wingSway = registerSway(0.85, dir > 0 ? 0.2 : 0.6, 0, 0);
      addHairStrand(
        wingSway,
        [
          new THREE.Vector3(dir * 0.025, 0.19, 0.07),
          new THREE.Vector3(dir * 0.125, 0.10, 0.155),
          new THREE.Vector3(dir * 0.175, -0.03, 0.12),
          new THREE.Vector3(dir * 0.235, -0.13, 0.06), // Flared butterfly wing tip at chin level!
        ],
        0.029,
        hairMat,
        true
      );
      addHairStrand(
        wingSway,
        [
          new THREE.Vector3(dir * 0.09, 0.16, 0.02),
          new THREE.Vector3(dir * 0.19, -0.02, 0.05),
          new THREE.Vector3(dir * 0.245, -0.22, -0.02),
        ],
        0.028,
        hairMat,
        true
      );
    });

    // Long flared back layers that flutter
    const backSway = registerSway(1.0, 0.1);
    [-0.13, -0.065, 0, 0.065, 0.13].forEach((bx) => {
      addHairStrand(
        backSway,
        [
          new THREE.Vector3(bx * 0.85, 0.09, -0.145),
          new THREE.Vector3(bx * 1.12, -0.24, -0.195),
          new THREE.Vector3(bx * 1.38, -0.60, -0.21),
        ],
        0.033,
        hairMat
      );
    });
    return;
  }

  if (style === 'cewe_hush_cut') {
    // HUSH CUT: Panjang lembut berlayer halus, poni tipis see-through, ujung lembut kalem (C-curve inward!)
    addCrownCap(hairGroup, hairMat, { radiusExtra: 0.017, thetaLength: Math.PI * 0.49 });

    // Ultra-light wispy see-through bangs (3 thin strands cleanly spaced!)
    [-0.05, 0, 0.05].forEach((bx) => {
      addHairStrand(
        hairGroup,
        [
          new THREE.Vector3(bx * 0.8, 0.175, 0.085),
          new THREE.Vector3(bx * 0.95, 0.135, 0.175),
          new THREE.Vector3(bx, 0.088, 0.178),
        ],
        0.013,
        hairMat
      );
    });

    // Soft inward-curving feathered cheek layers
    const softSide = registerSway(0.5, 0.2);
    [-1, 1].forEach((dir) => {
      addHairStrand(
        softSide,
        [
          new THREE.Vector3(dir * 0.15, 0.10, 0.04),
          new THREE.Vector3(dir * 0.18, -0.08, 0.04),
          new THREE.Vector3(dir * 0.145, -0.26, 0.05),
        ],
        0.024,
        hairMat,
        true
      );
    });

    // Softly tapered calm long hair curving smoothly inward at ends
    const backSway = registerSway(0.75, 0.4);
    [-0.125, -0.06, 0, 0.06, 0.125].forEach((bx, i) => {
      addHairStrand(
        backSway,
        [
          new THREE.Vector3(bx * 0.85, 0.09, -0.145),
          new THREE.Vector3(bx * 1.05, -0.25, -0.185),
          new THREE.Vector3(bx * 0.92, -0.52 - (i % 2) * 0.04, -0.145),
        ],
        0.03,
        hairMat,
        true
      );
    });
    return;
  }

  // cewe_curtain_hair: Belahan tengah tebal simetris + poni gorden lebih panjang & tebal menyatu ke rambut panjang
  addCrownCap(hairGroup, hairMat, { radiusExtra: 0.023, thetaLength: Math.PI * 0.5, scaleY: 1.06 });

  const curtainSway = registerSway(0.65, 0.15);
  [-1, 1].forEach((dir) => {
    // Thick lush curtain sweeps curving down past cheekbones to chest
    addHairStrand(
      curtainSway,
      [
        new THREE.Vector3(dir * 0.014, 0.195, 0.06),
        new THREE.Vector3(dir * 0.10, 0.13, 0.16),
        new THREE.Vector3(dir * 0.165, 0.0, 0.135),
        new THREE.Vector3(dir * 0.185, -0.22, 0.07),
        new THREE.Vector3(dir * 0.175, -0.48, 0.01),
      ],
      0.033,
      hairMat
    );
    addHairStrand(
      curtainSway,
      [
        new THREE.Vector3(dir * 0.02, 0.188, 0.085),
        new THREE.Vector3(dir * 0.095, 0.115, 0.168),
        new THREE.Vector3(dir * 0.145, 0.01, 0.142),
      ],
      0.025,
      hairMat,
      true
    );
  });

  const backSway = registerSway(0.88, 0.45);
  [-0.14, -0.08, -0.025, 0.025, 0.08, 0.14].forEach((bx) => {
    addHairStrand(
      backSway,
      [
        new THREE.Vector3(bx * 0.85, 0.10, -0.14),
        new THREE.Vector3(bx * 1.08, -0.26, -0.19),
        new THREE.Vector3(bx * 1.15, -0.66, -0.165),
      ],
      0.035,
      hairMat
    );
  });
}
