import * as THREE from 'three';
import { AvatarConfig, AvatarAnimState, FaceExpression, SitPoseConfig } from './types';
import { WARDROBE_ITEMS } from '../data/wardrobeCatalog';
import { createCartoonFaceTexture, createHairStrandTexture } from './avatar/faceTextures';
import { build3DHairStyle, HairSwayEntry } from './avatar/hairBuilder';

const STANDING_TORSO_Y = 0.775;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export { createCartoonFaceTexture };

// ---------------------------------------------------------------------------
// 2. MODULE-LEVEL SHARED SCULPTED HUMAN GEOMETRIES (Zero Boxes!)
// ---------------------------------------------------------------------------
let SHARED_GEOS: {
  torso: THREE.LatheGeometry;
  waist: THREE.LatheGeometry;
  skirt: THREE.LatheGeometry;
  neck: THREE.LatheGeometry;
  head: THREE.SphereGeometry;
  faceDecal: THREE.SphereGeometry;
  ear: THREE.SphereGeometry;
  nose: THREE.SphereGeometry;
  upperArm: THREE.LatheGeometry;
  lowerArm: THREE.LatheGeometry;
  jointArm: THREE.SphereGeometry;
  upperLeg: THREE.LatheGeometry;
  lowerLeg: THREE.LatheGeometry;
  jointLeg: THREE.SphereGeometry;
  palm: THREE.SphereGeometry;
  finger: THREE.CapsuleGeometry;
  thumb: THREE.CapsuleGeometry;
  shadow: THREE.PlaneGeometry;
} | null = null;

function getSharedAvatarGeometries() {
  if (SHARED_GEOS) return SHARED_GEOS;

  // Contoured Human Upper Torso (ribcage -> tapered waist -> rounded shoulders)
  const torsoPts = [
    new THREE.Vector2(0.0, -0.02),
    new THREE.Vector2(0.115, 0.0),
    new THREE.Vector2(0.108, 0.10), // slim waist curve
    new THREE.Vector2(0.148, 0.23), // ribcage / bust contour
    new THREE.Vector2(0.162, 0.31), // upper chest
    new THREE.Vector2(0.125, 0.365), // shoulder slope
    new THREE.Vector2(0.055, 0.39), // collar base
    new THREE.Vector2(0.0, 0.395),
  ];
  const torso = new THREE.LatheGeometry(torsoPts, 24);
  torso.computeVertexNormals();

  // Contoured Pelvis / Waist Hip Curve
  const waistPts = [
    new THREE.Vector2(0.0, -0.04),
    new THREE.Vector2(0.132, 0.0), // curved hips
    new THREE.Vector2(0.145, 0.08), // fullest hip point
    new THREE.Vector2(0.125, 0.16), // hip-to-waist taper
    new THREE.Vector2(0.108, 0.23),
    new THREE.Vector2(0.0, 0.24),
  ];
  const waist = new THREE.LatheGeometry(waistPts, 24);
  waist.computeVertexNormals();

  // Softly Flared A-Line Pleated Skirt Silhouette
  const skirtPts = [
    new THREE.Vector2(0.245, -0.17),
    new THREE.Vector2(0.225, -0.08),
    new THREE.Vector2(0.185, 0.02),
    new THREE.Vector2(0.135, 0.11),
    new THREE.Vector2(0.125, 0.14),
    new THREE.Vector2(0.0, 0.14),
  ];
  const skirt = new THREE.LatheGeometry(skirtPts, 28);
  skirt.computeVertexNormals();

  // Contoured Neck
  const neckPts = [
    new THREE.Vector2(0.068, -0.06),
    new THREE.Vector2(0.054, 0.0),
    new THREE.Vector2(0.052, 0.07),
    new THREE.Vector2(0.062, 0.11),
  ];
  const neck = new THREE.LatheGeometry(neckPts, 16);
  neck.computeVertexNormals();

  // Tapered Upper Arm (shoulder curve -> slim mid-bicep -> elbow)
  const upperArmPts = [
    new THREE.Vector2(0.0, 0.02),
    new THREE.Vector2(0.046, 0.0),
    new THREE.Vector2(0.048, -0.06),
    new THREE.Vector2(0.043, -0.15),
    new THREE.Vector2(0.039, -0.22),
    new THREE.Vector2(0.0, -0.235),
  ];
  const upperArm = new THREE.LatheGeometry(upperArmPts, 16);
  upperArm.computeVertexNormals();

  // Tapered Forearm (elbow -> subtle forearm curve -> slender wrist)
  const lowerArmPts = [
    new THREE.Vector2(0.0, 0.01),
    new THREE.Vector2(0.039, 0.0),
    new THREE.Vector2(0.041, -0.06),
    new THREE.Vector2(0.033, -0.14),
    new THREE.Vector2(0.027, -0.20),
    new THREE.Vector2(0.0, -0.21),
  ];
  const lowerArm = new THREE.LatheGeometry(lowerArmPts, 16);
  lowerArm.computeVertexNormals();

  // Sculpted Upper Leg / Thigh (rounded hip -> tapered knee)
  const upperLegPts = [
    new THREE.Vector2(0.0, 0.03),
    new THREE.Vector2(0.074, 0.0),
    new THREE.Vector2(0.076, -0.09),
    new THREE.Vector2(0.066, -0.23),
    new THREE.Vector2(0.054, -0.37),
    new THREE.Vector2(0.0, -0.39),
  ];
  const upperLeg = new THREE.LatheGeometry(upperLegPts, 18);
  upperLeg.computeVertexNormals();

  // Sculpted Lower Leg / Calf (knee -> calf swell -> slender ankle)
  const lowerLegPts = [
    new THREE.Vector2(0.0, 0.01),
    new THREE.Vector2(0.054, 0.0),
    new THREE.Vector2(0.059, -0.11), // gentle calf muscle contour
    new THREE.Vector2(0.048, -0.24),
    new THREE.Vector2(0.039, -0.37), // slim ankle
    new THREE.Vector2(0.0, -0.385),
  ];
  const lowerLeg = new THREE.LatheGeometry(lowerLegPts, 18);
  lowerLeg.computeVertexNormals();

  const headRadius = 0.19;
  const head = new THREE.SphereGeometry(headRadius, 32, 28);
  // CRITICAL: phi = Math.PI * 0.5 points directly along +Z FRONT (NOT phi = 0 which is -X side!)
  const faceDecal = new THREE.SphereGeometry(
    headRadius + 0.0024,
    32,
    20,
    Math.PI * 0.05,
    Math.PI * 0.9,
    Math.PI * 0.16,
    Math.PI * 0.68
  );

  SHARED_GEOS = {
    torso,
    waist,
    skirt,
    neck,
    head,
    faceDecal,
    ear: new THREE.SphereGeometry(0.034, 12, 12),
    nose: new THREE.SphereGeometry(0.016, 10, 10),
    upperArm,
    lowerArm,
    jointArm: new THREE.SphereGeometry(0.040, 12, 12),
    upperLeg,
    lowerLeg,
    jointLeg: new THREE.SphereGeometry(0.055, 12, 12),
    palm: new THREE.SphereGeometry(0.036, 12, 12),
    finger: new THREE.CapsuleGeometry(0.0085, 0.028, 6, 8),
    thumb: new THREE.CapsuleGeometry(0.0095, 0.024, 6, 8),
    shadow: new THREE.PlaneGeometry(1.35, 1.35),
  };

  return SHARED_GEOS;
}

// Shared soft drop shadow texture
let SHARED_SHADOW_TEX: THREE.CanvasTexture | null = null;
function getContactShadowTexture(): THREE.CanvasTexture {
  if (SHARED_SHADOW_TEX) return SHARED_SHADOW_TEX;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.44)');
  grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.16)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  SHARED_SHADOW_TEX = new THREE.CanvasTexture(canvas);
  return SHARED_SHADOW_TEX;
}

export class AvatarModel {
  public group: THREE.Group;
  public config: AvatarConfig;
  public currentAnim: AvatarAnimState = 'idle';

  private rootGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private chestGroup: THREE.Group;
  private neckMesh: THREE.Mesh;
  private headGroup: THREE.Group;
  private headMesh: THREE.Mesh;
  private faceDecalMesh: THREE.Mesh;
  private hairGroup: THREE.Group;
  private ribbonGroup: THREE.Group;

  // Limbs
  private leftShoulderGroup: THREE.Group;
  private rightShoulderGroup: THREE.Group;
  private leftUpperArm: THREE.Mesh;
  private rightUpperArm: THREE.Mesh;
  private leftElbowGroup: THREE.Group;
  private rightElbowGroup: THREE.Group;
  private leftLowerArm: THREE.Mesh;
  private rightLowerArm: THREE.Mesh;
  private leftHandGroup: THREE.Group;
  private rightHandGroup: THREE.Group;

  private leftHipGroup: THREE.Group;
  private rightHipGroup: THREE.Group;
  private leftUpperLeg: THREE.Mesh;
  private rightUpperLeg: THREE.Mesh;
  private leftKneeGroup: THREE.Group;
  private rightKneeGroup: THREE.Group;
  private leftLowerLeg: THREE.Mesh;
  private rightLowerLeg: THREE.Mesh;
  private leftFootGroup: THREE.Group;
  private rightFootGroup: THREE.Group;

  private skirtMesh?: THREE.Mesh;
  private contactShadow: THREE.Mesh;
  private handPropGroup: THREE.Group;
  private waistMesh!: THREE.Mesh;
  private chestMesh!: THREE.Mesh;
  private cardigansDetailGroup: THREE.Group;
  private leftElbowMesh!: THREE.Mesh;
  private rightElbowMesh!: THREE.Mesh;
  private leftKneeMesh!: THREE.Mesh;
  private rightKneeMesh!: THREE.Mesh;
  private accessoryGroup: THREE.Group;
  private specialFxGroup: THREE.Group;
  private sultanStars: THREE.Mesh[] = [];
  private coupleHearts: THREE.Mesh[] = [];

  // Materials
  private skinMat: THREE.MeshStandardMaterial;
  private faceMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private pinkCardiganMat: THREE.MeshStandardMaterial;
  private whiteShirtMat: THREE.MeshStandardMaterial;
  private blueSkirtMat: THREE.MeshStandardMaterial;
  private whiteSockMat: THREE.MeshStandardMaterial;
  private blackMaryJaneMat: THREE.MeshStandardMaterial;
  private blueHoodieMat: THREE.MeshStandardMaterial;
  private denimJeansMat: THREE.MeshStandardMaterial;
  private sneakerWhiteMat: THREE.MeshStandardMaterial;
  private sneakerBlueMat: THREE.MeshStandardMaterial;
  private ribbonPinkMat: THREE.MeshStandardMaterial;
  private customTopMat: THREE.MeshStandardMaterial;
  private customBottomMat: THREE.MeshStandardMaterial;
  private customShoesMat: THREE.MeshStandardMaterial;
  private goldStarMat: THREE.MeshStandardMaterial;
  private coupleHeartMat: THREE.MeshStandardMaterial;

  // Staggered blink timer & track last applied face state (zero redundant updates!)
  private blinkTimer = Math.random() * 2.5;
  private isBlinking = false;
  private lastFaceStateKey = '';
  private walkCycleTime = 0;
  private tempExpression: FaceExpression | null = null;
  private hairSwayGroups: HairSwayEntry[] = [];
  private sitProgress = 0;
  private sitConfig: SitPoseConfig = { mode: 'bench', seatRelY: 0.48, swingPhase: 0, steerAngle: 0 };

  constructor(config: AvatarConfig) {
    this.config = config;
    const geos = getSharedAvatarGeometries();

    this.group = new THREE.Group();
    this.rootGroup = new THREE.Group();
    this.group.add(this.rootGroup);

    this.cardigansDetailGroup = new THREE.Group();
    this.accessoryGroup = new THREE.Group();
    this.specialFxGroup = new THREE.Group();
    this.group.add(this.specialFxGroup);

    // Initialize Shared PBR Materials
    const skinHex = this.config.skinColor || '#fff0ea';
    this.skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinHex),
      roughness: 0.52,
      metalness: 0.04,
    });

    const expr = this.config.faceExpression || 'senyum';
    const faceTexture = createCartoonFaceTexture(skinHex, false, false, expr, 0);
    // Warm up blink frame immediately at init so runtime blinks are instant
    createCartoonFaceTexture(skinHex, true, false, expr, 0);
    this.lastFaceStateKey = `${skinHex}|0|0|${expr}|0`;

    this.faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.42,
      metalness: 0.04,
      transparent: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const hairHex = this.config.hairColor || (this.config.gender === 'cewek' ? '#18181b' : '#111827');
    const strandTex = createHairStrandTexture();
    this.hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex),
      map: strandTex,
      bumpMap: strandTex,
      bumpScale: 0.012,
      roughness: 0.36,
      metalness: 0.16,
    });

    this.pinkCardiganMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.62 });
    this.whiteShirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48 });
    this.blueSkirtMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.55 });
    this.whiteSockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
    this.blackMaryJaneMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.35 });
    this.blueHoodieMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.55 });
    this.denimJeansMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.68 });
    this.sneakerWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    this.sneakerBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.38 });
    this.ribbonPinkMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.32 });
    this.customTopMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.52 });
    this.customBottomMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.62 });
    this.customShoesMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });

    this.goldStarMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.85,
      roughness: 0.18,
      emissive: new THREE.Color(0xca8a04),
      emissiveIntensity: 0.4,
    });

    this.coupleHeartMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.28,
      emissive: new THREE.Color(0xf472b6),
      emissiveIntensity: 0.3,
    });

    // Contact Ground Shadow
    this.contactShadow = new THREE.Mesh(
      geos.shadow,
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        depthWrite: false,
      })
    );
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = 0.012;
    this.group.add(this.contactShadow);

    // ---------------------------------------------------------
    // SCULPTED STYLIZED HUMAN SKELETON (Height ~ 2.38 units)
    // ---------------------------------------------------------
    const isGirl = this.config.gender === 'cewek';

    // 1. Pelvis / Torso Pivot (Grounded so shoe bottoms touch y = 0!)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = STANDING_TORSO_Y;
    this.rootGroup.add(this.torsoGroup);

    this.waistMesh = new THREE.Mesh(geos.waist, this.customTopMat);
    this.waistMesh.scale.set(isGirl ? 1.0 : 0.96, 1.0, isGirl ? 0.86 : 0.84);
    this.waistMesh.castShadow = true;
    this.torsoGroup.add(this.waistMesh);

    // Flared skirt layer (toggled in applyWardrobeMaterials)
    this.skirtMesh = new THREE.Mesh(geos.skirt, this.blueSkirtMat);
    this.skirtMesh.position.y = 0.02;
    this.skirtMesh.scale.set(1, 1, 0.88);
    this.skirtMesh.castShadow = true;
    this.torsoGroup.add(this.skirtMesh);

    // 2. Upper Chest Group
    this.chestGroup = new THREE.Group();
    this.chestGroup.position.y = 0.21;
    this.torsoGroup.add(this.chestGroup);

    this.chestMesh = new THREE.Mesh(geos.torso, this.customTopMat);
    this.chestMesh.scale.set(isGirl ? 0.96 : 1.08, 1.02, isGirl ? 0.82 : 0.86);
    this.chestMesh.castShadow = true;
    this.chestGroup.add(this.chestMesh);
    this.chestGroup.add(this.cardigansDetailGroup);

    // Smooth Neck seamlessly connecting Chest and Head
    this.neckMesh = new THREE.Mesh(geos.neck, this.skinMat);
    this.neckMesh.position.y = 0.39;
    this.chestGroup.add(this.neckMesh);

    // 3. Sculpted Zepeto/Sims Head Group (proportional human head)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.625;
    this.chestGroup.add(this.headGroup);

    // Gently sculpted stylized oval proportions
    this.headMesh = new THREE.Mesh(geos.head, this.skinMat);
    this.headMesh.scale.set(0.95, 1.03, 0.94);
    this.headMesh.castShadow = true;
    this.headGroup.add(this.headMesh);

    // Attached Crisp Front-Facing Face (+Z Center!)
    this.faceDecalMesh = new THREE.Mesh(geos.faceDecal, this.faceMat);
    this.faceDecalMesh.scale.set(0.95, 1.03, 0.94);
    this.headGroup.add(this.faceDecalMesh);

    // 2 Sculpted 3D Ears (left & right sides, level with the eyes) with warm inner ear shell
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xf4a99d, roughness: 0.6 });
    [-0.178, 0.178].forEach((ex) => {
      const ear = new THREE.Mesh(geos.ear, this.skinMat);
      ear.scale.set(0.5, 1.1, 0.68);
      ear.position.set(ex, 0.008, -0.005);
      this.headGroup.add(ear);

      const innerEar = new THREE.Mesh(geos.ear, innerEarMat);
      innerEar.scale.set(0.28, 0.68, 0.42);
      innerEar.position.set(ex * 0.99, 0.008, 0.003);
      this.headGroup.add(innerEar);
    });

    // Proportional 3D Nose (centered between eyes & mouth on +Z front)
    const noseBridge = new THREE.Mesh(geos.nose, this.skinMat);
    noseBridge.scale.set(0.55, 1.1, 0.65);
    noseBridge.position.set(0, -0.006, 0.178);
    const noseTip = new THREE.Mesh(geos.nose, this.skinMat);
    noseTip.scale.set(0.72, 0.68, 0.85);
    noseTip.position.set(0, -0.022, 0.183);
    this.headGroup.add(noseBridge, noseTip);

    this.hairGroup = new THREE.Group();
    this.headGroup.add(this.hairGroup);

    this.ribbonGroup = new THREE.Group();
    this.headGroup.add(this.ribbonGroup);

    this.headGroup.add(this.accessoryGroup);

    // 4. Sculpted Smooth Arms
    const shoulderOffsetX = isGirl ? 0.172 : 0.192;

    this.leftShoulderGroup = new THREE.Group();
    this.leftShoulderGroup.position.set(shoulderOffsetX, 0.315, 0);
    this.chestGroup.add(this.leftShoulderGroup);

    const leftShoulderCap = new THREE.Mesh(geos.jointArm, this.customTopMat);
    leftShoulderCap.scale.setScalar(1.08);
    this.leftShoulderGroup.add(leftShoulderCap);

    this.leftUpperArm = new THREE.Mesh(geos.upperArm, this.customTopMat);
    this.leftUpperArm.castShadow = true;
    this.leftShoulderGroup.add(this.leftUpperArm);

    this.leftElbowGroup = new THREE.Group();
    this.leftElbowGroup.position.y = -0.22;
    this.leftShoulderGroup.add(this.leftElbowGroup);
    this.leftElbowMesh = new THREE.Mesh(geos.jointArm, this.customTopMat);
    this.leftElbowGroup.add(this.leftElbowMesh);

    this.leftLowerArm = new THREE.Mesh(geos.lowerArm, this.skinMat);
    this.leftLowerArm.castShadow = true;
    this.leftElbowGroup.add(this.leftLowerArm);

    this.leftHandGroup = new THREE.Group();
    this.leftHandGroup.position.y = -0.205;
    this.leftElbowGroup.add(this.leftHandGroup);
    this.buildSmoothHand(this.leftHandGroup, true);

    this.rightShoulderGroup = new THREE.Group();
    this.rightShoulderGroup.position.set(-shoulderOffsetX, 0.315, 0);
    this.chestGroup.add(this.rightShoulderGroup);

    const rightShoulderCap = new THREE.Mesh(geos.jointArm, this.customTopMat);
    rightShoulderCap.scale.setScalar(1.08);
    this.rightShoulderGroup.add(rightShoulderCap);

    this.rightUpperArm = new THREE.Mesh(geos.upperArm, this.customTopMat);
    this.rightUpperArm.castShadow = true;
    this.rightShoulderGroup.add(this.rightUpperArm);

    this.rightElbowGroup = new THREE.Group();
    this.rightElbowGroup.position.y = -0.22;
    this.rightShoulderGroup.add(this.rightElbowGroup);
    this.rightElbowMesh = new THREE.Mesh(geos.jointArm, this.customTopMat);
    this.rightElbowGroup.add(this.rightElbowMesh);

    this.rightLowerArm = new THREE.Mesh(geos.lowerArm, this.skinMat);
    this.rightLowerArm.castShadow = true;
    this.rightElbowGroup.add(this.rightLowerArm);

    this.rightHandGroup = new THREE.Group();
    this.rightHandGroup.position.y = -0.205;
    this.rightElbowGroup.add(this.rightHandGroup);
    this.buildSmoothHand(this.rightHandGroup, false);

    this.handPropGroup = new THREE.Group();
    this.rightHandGroup.add(this.handPropGroup);

    // 5. Sculpted Smooth Long Legs
    this.leftHipGroup = new THREE.Group();
    this.leftHipGroup.position.set(0.082, -0.02, 0);
    this.torsoGroup.add(this.leftHipGroup);

    this.leftUpperLeg = new THREE.Mesh(geos.upperLeg, this.customBottomMat);
    this.leftUpperLeg.castShadow = true;
    this.leftHipGroup.add(this.leftUpperLeg);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.y = -0.37;
    this.leftHipGroup.add(this.leftKneeGroup);
    this.leftKneeMesh = new THREE.Mesh(geos.jointLeg, this.skinMat);
    this.leftKneeGroup.add(this.leftKneeMesh);

    this.leftLowerLeg = new THREE.Mesh(geos.lowerLeg, this.skinMat);
    this.leftLowerLeg.castShadow = true;
    this.leftKneeGroup.add(this.leftLowerLeg);

    this.leftFootGroup = new THREE.Group();
    this.leftFootGroup.position.y = -0.375;
    this.leftKneeGroup.add(this.leftFootGroup);

    this.rightHipGroup = new THREE.Group();
    this.rightHipGroup.position.set(-0.082, -0.02, 0);
    this.torsoGroup.add(this.rightHipGroup);

    this.rightUpperLeg = new THREE.Mesh(geos.upperLeg, this.customBottomMat);
    this.rightUpperLeg.castShadow = true;
    this.rightHipGroup.add(this.rightUpperLeg);

    this.rightKneeGroup = new THREE.Group();
    this.rightKneeGroup.position.y = -0.37;
    this.rightHipGroup.add(this.rightKneeGroup);
    this.rightKneeMesh = new THREE.Mesh(geos.jointLeg, this.skinMat);
    this.rightKneeGroup.add(this.rightKneeMesh);

    this.rightLowerLeg = new THREE.Mesh(geos.lowerLeg, this.skinMat);
    this.rightLowerLeg.castShadow = true;
    this.rightKneeGroup.add(this.rightLowerLeg);

    this.rightFootGroup = new THREE.Group();
    this.rightFootGroup.position.y = -0.375;
    this.rightKneeGroup.add(this.rightFootGroup);

    // Apply initial look
    this.applyWardrobeMaterials();
    this.rebuildHair();
    this.rebuildShoes();
    this.rebuildAccessories();
    this.rebuildSpecialFx();
    this.applyIdlePose();
  }

  public setTempExpression(expr: FaceExpression | null) {
    if (this.tempExpression === expr) return;
    this.tempExpression = expr;
    this.syncFaceTexture(this.isBlinking, this.currentAnim === 'sleep', 0);
  }

  public setSitConfig(cfg: Partial<SitPoseConfig>) {
    this.sitConfig = { ...this.sitConfig, ...cfg };
  }

  private getEffectiveExpression(isMoving = false): FaceExpression {
    if (this.tempExpression) return this.tempExpression;
    const base = this.config.faceExpression || 'senyum';
    if (isMoving && base === 'sedih') return 'senyum';
    if (isMoving && base === 'ngantuk') return 'senyum';
    return base;
  }

  private syncFaceTexture(
    isBlinking: boolean,
    isSleeping: boolean,
    gazeShift: -1 | 0 | 1 = 0,
    isMoving = false
  ) {
    const skinHex = this.config.skinColor || '#fff0ea';
    const expr = this.getEffectiveExpression(isMoving);
    const key = `${skinHex}|${isBlinking ? 1 : 0}|${isSleeping ? 1 : 0}|${expr}|${gazeShift}`;
    if (key === this.lastFaceStateKey) return;
    this.lastFaceStateKey = key;
    this.faceMat.map = createCartoonFaceTexture(skinHex, isBlinking, isSleeping, expr, gazeShift);
    this.faceMat.needsUpdate = true;
  }

  public updateWardrobe(newConfig: Partial<AvatarConfig>) {
    this.config = { ...this.config, ...newConfig };

    const isGirl = this.config.gender === 'cewek';
    this.waistMesh.scale.set(isGirl ? 1.0 : 0.96, 1.0, isGirl ? 0.86 : 0.84);
    this.chestMesh.scale.set(isGirl ? 0.96 : 1.08, 1.02, isGirl ? 0.82 : 0.86);
    const sx = isGirl ? 0.172 : 0.192;
    this.leftShoulderGroup.position.x = sx;
    this.rightShoulderGroup.position.x = -sx;

    if (this.config.skinColor) {
      this.skinMat.color.set(this.config.skinColor);
    }
    if (this.config.hairColor) {
      this.hairMat.color.set(this.config.hairColor);
    }

    this.syncFaceTexture(this.isBlinking, this.currentAnim === 'sleep', 0);
    this.applyWardrobeMaterials();
    this.rebuildHair();
    this.rebuildShoes();
    this.rebuildAccessories();
    this.rebuildSpecialFx();
  }

  public applyWardrobeMaterials() {
    const topId = this.config.top || 'kaos_polos_putih';
    const bottomId = this.config.bottom || 'celana_pendek_biru_muda';
    const topCatalog = WARDROBE_ITEMS.find((i) => i.id === topId);
    const bottomCatalog = WARDROBE_ITEMS.find((i) => i.id === bottomId);

    const topHex = this.config.shirtColor || topCatalog?.color || '#ffffff';
    const bottomHex = this.config.pantsColor || bottomCatalog?.color || '#93c5fd';

    this.customTopMat.color.set(topHex);
    this.customBottomMat.color.set(bottomHex);

    const isSleeveless = topId.includes('tank_top') || topId.includes('crop_top');
    const isShortSleeve =
      topId.startsWith('kaos') ||
      topId.includes('jersey') ||
      topId.includes('renang') ||
      topId === 'kaos_polos_putih';

    if (isSleeveless) {
      this.leftUpperArm.material = this.skinMat;
      this.rightUpperArm.material = this.skinMat;
      this.leftElbowMesh.material = this.skinMat;
      this.rightElbowMesh.material = this.skinMat;
      this.leftLowerArm.material = this.skinMat;
      this.rightLowerArm.material = this.skinMat;
      this.waistMesh.material = topId.includes('crop_top') ? this.skinMat : this.customTopMat;
    } else if (isShortSleeve) {
      this.leftUpperArm.material = this.customTopMat;
      this.rightUpperArm.material = this.customTopMat;
      this.leftElbowMesh.material = this.skinMat;
      this.rightElbowMesh.material = this.skinMat;
      this.leftLowerArm.material = this.skinMat;
      this.rightLowerArm.material = this.skinMat;
      this.waistMesh.material = this.customTopMat;
    } else {
      this.leftUpperArm.material = this.customTopMat;
      this.rightUpperArm.material = this.customTopMat;
      this.leftElbowMesh.material = this.customTopMat;
      this.rightElbowMesh.material = this.customTopMat;
      this.leftLowerArm.material = this.customTopMat;
      this.rightLowerArm.material = this.customTopMat;
      this.waistMesh.material = this.customTopMat;
    }

    while (this.cardigansDetailGroup.children.length > 0) {
      this.cardigansDetailGroup.remove(this.cardigansDetailGroup.children[0]);
    }

    if (topId.includes('cardigan') || topId.includes('blazer') || topId.includes('seragam')) {
      const shirtV = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.055, 0.17, 10, 12),
        this.whiteShirtMat
      );
      shirtV.position.set(0, 0.21, 0.088);
      this.cardigansDetailGroup.add(shirtV);

      [0.05, 0.12, 0.19].forEach((by) => {
        const btn = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), this.whiteShirtMat);
        btn.position.set(0, by, 0.132);
        this.cardigansDetailGroup.add(btn);
      });
    } else if (topId.includes('hoodie') || topId.includes('jaket')) {
      const pocketMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.045, 0.14, 10, 12),
        this.customTopMat
      );
      pocketMesh.rotation.z = Math.PI / 2;
      pocketMesh.position.set(0, 0.06, 0.115);
      this.cardigansDetailGroup.add(pocketMesh);

      const hoodMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.115, 0.042, 10, 24, Math.PI * 1.25),
        this.customTopMat
      );
      hoodMesh.rotation.x = Math.PI * 0.72;
      hoodMesh.position.set(0, 0.34, -0.07);
      this.cardigansDetailGroup.add(hoodMesh);
    }

    // Collar ring detail for clean neck seam
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.072, 0.016, 8, 20),
      topId.includes('cardigan') ? this.whiteShirtMat : this.customTopMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.375, 0.0);
    this.cardigansDetailGroup.add(collar);

    const isShorts =
      bottomId.includes('pendek') ||
      bottomId.includes('pantai') ||
      bottomId.includes('renang') ||
      bottomId === 'celana_pendek_biru_muda';

    const isSkirt =
      bottomId.startsWith('rok_') ||
      (this.config.gender === 'cewek' && bottomId === 'rok_plisket_biru');

    if (this.skirtMesh) {
      this.skirtMesh.visible = isSkirt;
      if (isSkirt) {
        (this.skirtMesh.material as THREE.MeshStandardMaterial).color.set(bottomHex);
      }
    }

    if (isSkirt) {
      this.leftUpperLeg.material = this.skinMat;
      this.rightUpperLeg.material = this.skinMat;
      this.leftKneeMesh.material = this.skinMat;
      this.rightKneeMesh.material = this.skinMat;
      this.leftLowerLeg.material = bottomId.includes('plisket') ? this.whiteSockMat : this.skinMat;
      this.rightLowerLeg.material = bottomId.includes('plisket') ? this.whiteSockMat : this.skinMat;
    } else if (isShorts) {
      this.leftUpperLeg.material = this.customBottomMat;
      this.rightUpperLeg.material = this.customBottomMat;
      this.leftKneeMesh.material = this.skinMat;
      this.rightKneeMesh.material = this.skinMat;
      this.leftLowerLeg.material = this.skinMat;
      this.rightLowerLeg.material = this.skinMat;
    } else {
      this.leftUpperLeg.material = this.customBottomMat;
      this.rightUpperLeg.material = this.customBottomMat;
      this.leftKneeMesh.material = this.customBottomMat;
      this.rightKneeMesh.material = this.customBottomMat;
      this.leftLowerLeg.material = this.customBottomMat;
      this.rightLowerLeg.material = this.customBottomMat;
    }
  }

  private buildSmoothHand(handGroup: THREE.Group, isLeft: boolean) {
    const geos = getSharedAvatarGeometries();
    const palm = new THREE.Mesh(geos.palm, this.skinMat);
    palm.scale.set(0.95, 1.15, 0.58);
    handGroup.add(palm);

    [-0.016, -0.0055, 0.0055, 0.016].forEach((fx) => {
      const finger = new THREE.Mesh(geos.finger, this.skinMat);
      finger.position.set(fx, -0.032, 0);
      handGroup.add(finger);
    });

    const thumb = new THREE.Mesh(geos.thumb, this.skinMat);
    thumb.position.set(isLeft ? 0.024 : -0.024, -0.012, 0.012);
    thumb.rotation.z = (isLeft ? 1 : -1) * 0.52;
    handGroup.add(thumb);
  }

  public rebuildShoes() {
    while (this.leftFootGroup.children.length > 0) {
      this.leftFootGroup.remove(this.leftFootGroup.children[0]);
    }
    while (this.rightFootGroup.children.length > 0) {
      this.rightFootGroup.remove(this.rightFootGroup.children[0]);
    }

    const shoeId = this.config.shoes || 'sendal_jepit_coklat';
    const shoeCatalog = WARDROBE_ITEMS.find((i) => i.id === shoeId);
    const shoeHex = this.config.shoesColor || shoeCatalog?.color || '#78350f';
    this.customShoesMat.color.set(shoeHex);

    const buildFoot = (footGroup: THREE.Group, isLeft: boolean) => {
      if (shoeId.includes('sendal_jepit') || shoeId === 'sendal_jepit_coklat') {
        const soleMesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.050, 0.12, 10, 12),
          this.customShoesMat
        );
        soleMesh.rotation.x = Math.PI / 2;
        soleMesh.scale.set(0.95, 0.25, 1);
        soleMesh.position.set(0, 0.005, 0.035);
        footGroup.add(soleMesh);

        const footSkin = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.044, 0.095, 10, 10),
          this.skinMat
        );
        footSkin.rotation.x = Math.PI / 2;
        footSkin.position.set(0, 0.02, 0.03);
        footGroup.add(footSkin);

        const strapL = new THREE.Mesh(new THREE.CapsuleGeometry(0.007, 0.048, 6, 8), this.customShoesMat);
        strapL.position.set(0.015, 0.03, 0.04);
        strapL.rotation.set(0.4, 0, -0.4);
        footGroup.add(strapL);

        const strapR = new THREE.Mesh(new THREE.CapsuleGeometry(0.007, 0.048, 6, 8), this.customShoesMat);
        strapR.position.set(-0.015, 0.03, 0.04);
        strapR.rotation.set(0.4, 0, 0.4);
        footGroup.add(strapR);
      } else if (shoeId.includes('mary_jane')) {
        const shoeMesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.050, 0.115, 10, 12),
          this.blackMaryJaneMat
        );
        shoeMesh.rotation.x = Math.PI / 2;
        shoeMesh.position.set(0, 0.02, 0.035);
        footGroup.add(shoeMesh);

        const strapMesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.052, 0.011, 8, 16, Math.PI * 0.9),
          this.blackMaryJaneMat
        );
        strapMesh.rotation.x = -Math.PI / 4;
        strapMesh.position.set(0, 0.044, 0.01);
        footGroup.add(strapMesh);

        const buckle = new THREE.Mesh(
          new THREE.SphereGeometry(0.011, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
        );
        buckle.position.set(isLeft ? 0.05 : -0.05, 0.044, 0.02);
        footGroup.add(buckle);
      } else if (shoeId.includes('boots')) {
        const bootMesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.055, 0.135, 10, 12),
          this.customShoesMat
        );
        bootMesh.rotation.x = Math.PI / 2;
        bootMesh.position.set(0, 0.028, 0.04);
        footGroup.add(bootMesh);

        const cuffMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.058, 0.055, 0.14, 16),
          this.customShoesMat
        );
        cuffMesh.position.set(0, 0.085, 0);
        footGroup.add(cuffMesh);
      } else if (shoeId.includes('bulu')) {
        const furMesh = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), this.customShoesMat);
        furMesh.scale.set(1, 0.72, 1.3);
        furMesh.position.set(0, 0.022, 0.04);
        footGroup.add(furMesh);
      } else {
        const sneakerMesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.054, 0.135, 10, 12),
          this.customShoesMat
        );
        sneakerMesh.rotation.x = Math.PI / 2;
        sneakerMesh.position.set(0, 0.024, 0.04);
        footGroup.add(sneakerMesh);

        const toe = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.sneakerWhiteMat);
        toe.position.set(0, 0.024, 0.072);
        toe.scale.set(0.95, 0.85, 0.58);
        footGroup.add(toe);

        const soleMesh = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.013, 8, 18), this.sneakerWhiteMat);
        soleMesh.rotation.x = Math.PI / 2;
        soleMesh.scale.set(0.95, 1.45, 1);
        soleMesh.position.set(0, 0.004, 0.04);
        footGroup.add(soleMesh);
      }
    };

    buildFoot(this.leftFootGroup, true);
    buildFoot(this.rightFootGroup, false);
  }

  public rebuildHair() {
    while (this.ribbonGroup.children.length > 0) {
      this.ribbonGroup.remove(this.ribbonGroup.children[0]);
    }

    const hairStyle =
      this.config.hairStyle || (this.config.gender === 'cewek' ? 'cewe_long_hair' : 'cowo_two_block');

    if (hairStyle === 'pirang' && !this.config.hairColor) {
      this.hairMat.color.set('#fef08a');
    } else if (this.config.hairColor) {
      this.hairMat.color.set(this.config.hairColor);
    }

    build3DHairStyle(
      this.hairGroup,
      hairStyle,
      this.config.gender,
      this.hairMat,
      this.skinMat,
      this.hairSwayGroups
    );
  }

  public rebuildAccessories() {
    while (this.accessoryGroup.children.length > 0) {
      this.accessoryGroup.remove(this.accessoryGroup.children[0]);
    }

    const hr = 0.19;
    const accId = this.config.accessory || this.config.hat || 'none';

    if (accId.includes('pita') || accId === 'pita_pink') {
      const bowLeft = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), this.ribbonPinkMat);
      bowLeft.scale.set(1.5, 0.8, 0.5);
      bowLeft.position.set(hr * 0.86, 0.08, 0.08);
      bowLeft.rotation.z = 0.35;
      this.accessoryGroup.add(bowLeft);

      const bowRight = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), this.ribbonPinkMat);
      bowRight.scale.set(1.5, 0.8, 0.5);
      bowRight.position.set(hr * 0.86 + 0.03, 0.09, 0.08);
      bowRight.rotation.z = -0.35;
      this.accessoryGroup.add(bowRight);

      const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.ribbonPinkMat);
      bowKnot.position.set(hr * 0.86 + 0.015, 0.085, 0.095);
      this.accessoryGroup.add(bowKnot);
    }

    if (accId.includes('mahkota') || accId.includes('tiara')) {
      const crownMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.14, 0.075, 16),
        this.goldStarMat
      );
      crownMesh.position.set(0, hr + 0.045, 0);
      this.accessoryGroup.add(crownMesh);
    }

    if (accId.includes('topi') || accId.includes('bucket') || accId.includes('beanie')) {
      const capMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.55 });
      const capDome = new THREE.Mesh(
        new THREE.SphereGeometry(hr + 0.025, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42),
        capMat
      );
      capDome.position.set(0, 0.03, 0);
      this.accessoryGroup.add(capDome);

      const brimMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(hr + 0.08, hr + 0.08, 0.015, 24),
        capMat
      );
      brimMesh.position.set(0, 0.08, 0.05);
      brimMesh.rotation.x = -0.15;
      this.accessoryGroup.add(brimMesh);
    }

    if (accId.includes('bando') || accId.includes('bandana')) {
      const bandMesh = new THREE.Mesh(
        new THREE.TorusGeometry(hr + 0.016, 0.018, 8, 24, Math.PI),
        this.ribbonPinkMat
      );
      bandMesh.rotation.x = -Math.PI / 2;
      bandMesh.position.set(0, 0.07, 0.02);
      this.accessoryGroup.add(bandMesh);
    }

    const glassesId = this.config.glasses || (accId.includes('kacamata') ? accId : 'none');
    if (glassesId !== 'none' && glassesId.includes('kacamata')) {
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        metalness: 0.85,
        roughness: 0.18,
      });

      [-0.062, 0.062].forEach((gx) => {
        const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.039, 0.0065, 8, 20), glassMat);
        ringMesh.position.set(gx, -0.005, hr * 0.94);
        this.accessoryGroup.add(ringMesh);
      });

      const bridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.034, 6, 6), glassMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, -0.005, hr * 0.94);
      this.accessoryGroup.add(bridge);
    }
  }

  public rebuildSpecialFx() {
    while (this.specialFxGroup.children.length > 0) {
      this.specialFxGroup.remove(this.specialFxGroup.children[0]);
    }
    this.sultanStars = [];
    this.coupleHearts = [];

    const isSultan =
      this.config.isSultan ||
      this.config.top?.includes('sultan') ||
      this.config.dressOrSetelan?.includes('sultan');

    const isCouple =
      this.config.isCouple ||
      this.config.top?.includes('couple') ||
      this.config.dressOrSetelan?.includes('couple');

    if (isSultan) {
      const starGeo = new THREE.OctahedronGeometry(0.045, 0);
      for (let s = 0; s < 5; s++) {
        const starMesh = new THREE.Mesh(starGeo, this.goldStarMat);
        this.specialFxGroup.add(starMesh);
        this.sultanStars.push(starMesh);
      }
    }

    if (isCouple) {
      const lobeGeo = new THREE.SphereGeometry(0.024, 8, 8);
      const tipGeo = new THREE.ConeGeometry(0.032, 0.05, 8);
      for (let h = 0; h < 4; h++) {
        const heartGroup = new THREE.Group();
        const lobeL = new THREE.Mesh(lobeGeo, this.coupleHeartMat);
        lobeL.position.x = -0.014;
        const lobeR = new THREE.Mesh(lobeGeo, this.coupleHeartMat);
        lobeR.position.x = 0.014;
        const tip = new THREE.Mesh(tipGeo, this.coupleHeartMat);
        tip.rotation.x = Math.PI;
        tip.position.y = -0.025;
        heartGroup.add(lobeL, lobeR, tip);
        this.specialFxGroup.add(heartGroup as unknown as THREE.Mesh);
        this.coupleHearts.push(heartGroup as unknown as THREE.Mesh);
      }
    }
  }

  public setHeldItem(item: 'none' | 'ice_cream' | 'tea_cup' | 'bear_plushie') {
    while (this.handPropGroup.children.length > 0) {
      this.handPropGroup.remove(this.handPropGroup.children[0]);
    }

    if (item === 'ice_cream') {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 })
      );
      cone.rotation.x = Math.PI;
      this.handPropGroup.add(cone);

      const scoop = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35 })
      );
      scoop.position.y = 0.08;
      this.handPropGroup.add(scoop);
    } else if (item === 'tea_cup') {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.035, 0.09, 12),
        this.whiteShirtMat
      );
      cup.position.y = 0.03;
      this.handPropGroup.add(cup);
    }
  }

  private applyIdlePose() {
    const isGirl = this.config.gender === 'cewek';

    this.rootGroup.rotation.set(0, 0, 0);
    this.torsoGroup.position.set(0, STANDING_TORSO_Y, 0);
    this.torsoGroup.rotation.set(0, 0, 0);
    this.chestGroup.rotation.set(0, 0, 0);
    this.headGroup.rotation.set(0, 0, 0);

    this.leftHipGroup.rotation.set(0.02, 0, -0.035);
    this.rightHipGroup.rotation.set(0.02, 0, 0.035);
    this.leftKneeGroup.rotation.set(0, 0, 0);
    this.rightKneeGroup.rotation.set(0, 0, 0);

    if (isGirl) {
      this.leftShoulderGroup.rotation.set(0.22, 0.18, 0.58);
      this.leftElbowGroup.rotation.set(0.82, 0.35, 0.52);
      this.leftHandGroup.rotation.set(0, 0.25, -0.35);

      this.rightShoulderGroup.rotation.set(0.04, 0, -0.10);
      this.rightElbowGroup.rotation.set(0.12, 0, -0.04);
      this.rightHandGroup.rotation.set(0, 0, 0);
    } else {
      this.leftShoulderGroup.rotation.set(0.06, 0, 0.11);
      this.leftElbowGroup.rotation.set(0.14, 0, 0.05);
      this.leftHandGroup.rotation.set(0, 0, 0);

      this.rightShoulderGroup.rotation.set(0.06, 0, -0.11);
      this.rightElbowGroup.rotation.set(0.14, 0, -0.05);
      this.rightHandGroup.rotation.set(0, 0, 0);
    }
  }

  public setAnimation(state: AvatarAnimState) {
    if (this.currentAnim === state) return;
    this.currentAnim = state;
    this.syncFaceTexture(this.isBlinking, state === 'sleep');
    if (state === 'idle') {
      this.applyIdlePose();
    }
  }

  public update(time: number, isMoving: boolean) {
    // 0. Sultan Stars & Couple Hearts
    if (this.sultanStars.length > 0) {
      this.sultanStars.forEach((star, idx) => {
        const angle = time * 2.5 + (idx * (Math.PI * 2)) / this.sultanStars.length;
        star.position.set(
          Math.cos(angle) * 0.55,
          1.45 + Math.sin(time * 3 + idx) * 0.15,
          Math.sin(angle) * 0.55
        );
        star.rotation.x = time * 3;
        star.rotation.y = time * 4;
      });
    }

    if (this.coupleHearts.length > 0) {
      this.coupleHearts.forEach((heart, idx) => {
        const angle = time * 1.8 + (idx * (Math.PI * 2)) / this.coupleHearts.length;
        heart.position.set(
          Math.cos(angle) * 0.45,
          1.65 + Math.sin(time * 4 + idx) * 0.18,
          Math.sin(angle) * 0.45
        );
        heart.rotation.y = time * 2;
      });
    }

    // 0.5 Dynamic Breeze & Walking Hair Motion
    if (this.hairSwayGroups.length > 0) {
      const walkLag = isMoving ? 0.14 + Math.abs(Math.sin(time * 8)) * 0.09 : 0;
      const breeze = Math.sin(time * 2.1) * 0.038 + Math.sin(time * 3.7) * 0.015;
      this.hairSwayGroups.forEach((entry) => {
        entry.group.rotation.x =
          entry.baseRotX + (walkLag + breeze * 0.75) * entry.factor;
        entry.group.rotation.z =
          entry.baseRotZ + Math.sin(time * 2.4 + entry.phase) * (isMoving ? 0.06 : 0.025) * entry.factor;
      });
    }

    // 1. Auto-Blink Every 3 Seconds + Dynamic Lirik Gaze + Walking Cheerful Sync
    const activeExpr = this.getEffectiveExpression(isMoving);
    const gazeShift: -1 | 0 | 1 =
      activeExpr === 'lirik'
        ? ((Math.floor(time * 1.3) % 4 === 1 ? -1 : Math.floor(time * 1.3) % 4 === 3 ? 1 : 0) as -1 | 0 | 1)
        : 0;

    this.blinkTimer += 0.016;
    if (this.blinkTimer >= 3.0) {
      if (!this.isBlinking) {
        this.isBlinking = true;
      }
      if (this.blinkTimer >= 3.15) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }
    this.syncFaceTexture(this.isBlinking, this.currentAnim === 'sleep', gazeShift, isMoving);

    // Smooth Sit-Down / Stand-Up Transition Progress (0 -> 1 via easeInOutQuad)
    if (this.currentAnim === 'sit') {
      this.sitProgress = Math.min(1, this.sitProgress + 0.065);
    } else {
      this.sitProgress = Math.max(0, this.sitProgress - 0.085);
    }

    // 2. Sleeping / Lounger Pose
    if (this.currentAnim === 'sleep') {
      this.rootGroup.rotation.x = THREE.MathUtils.lerp(this.rootGroup.rotation.x, -Math.PI / 2, 0.18);
      this.torsoGroup.position.set(0, 0.22, 0);
      this.torsoGroup.rotation.set(0, 0, 0);
      this.leftShoulderGroup.rotation.set(0, 0, 0.2);
      this.rightShoulderGroup.rotation.set(0, 0, -0.2);
      this.leftElbowGroup.rotation.set(0.15, 0, 0);
      this.rightElbowGroup.rotation.set(0.15, 0, 0);
      this.leftHipGroup.rotation.set(0, 0, 0);
      this.rightHipGroup.rotation.set(0, 0, 0);
      this.leftKneeGroup.rotation.set(0, 0, 0);
      this.rightKneeGroup.rotation.set(0, 0, 0);
      this.chestGroup.scale.y = 1 + Math.sin(time * 2) * 0.025;
      return;
    }

    // 3. Analytical 2-Bone IK Sitting Pose (Solid Butt Contact + Grounded Feet + Natural Arm Grips)
    if (this.currentAnim === 'sit') {
      const e = easeInOutQuad(this.sitProgress);
      const { mode, seatRelY, swingPhase = 0, steerAngle = 0 } = this.sitConfig;

      // Exact butt-to-seat contact height: pelvis bottom at -0.04m rests flush on seatRelY
      const targetTorsoY =
        mode === 'sand' ? 0.085 : Math.max(0.1, seatRelY + 0.042);

      // Torso squat dip during mid-transition then settle cleanly onto seat
      const squatDip = Math.sin(this.sitProgress * Math.PI) * 0.06;
      this.torsoGroup.position.set(0, THREE.MathUtils.lerp(STANDING_TORSO_Y, targetTorsoY, e) - squatDip, 0);

      let targetHipRotX = -1.45;
      let targetKneeRotX = 1.45;
      let targetTorsoRotX = 0;
      let targetRootRotX = 0;
      let lShX = -0.32;
      let lShZ = 0.16;
      let lElX = 0.65;
      let rShX = -0.32;
      let rShZ = -0.16;
      let rElX = 0.65;

      if (mode === 'sand') {
        // Seated directly on beach sand: legs stretched straight out, slight lean back, hands on sand
        targetHipRotX = -1.44;
        targetKneeRotX = 0.08;
        targetTorsoRotX = -0.16;
        lShX = 0.36;
        lShZ = 0.24;
        lElX = 0.12;
        rShX = 0.36;
        rShZ = -0.24;
        rElX = 0.12;
      } else if (mode === 'swing') {
        // Swing seat IK: butt locked on seat, legs bend naturally forward, hands grip left/right chains!
        targetRootRotX = swingPhase * 0.85;
        targetHipRotX = -1.35 + swingPhase * 0.25;
        targetKneeRotX = 1.05 - swingPhase * 0.3;
        lShX = -1.08;
        lShZ = 0.32;
        lElX = 0.62;
        rShX = -1.08;
        rShZ = -0.32;
        rElX = 0.62;
      } else {
        // Closed-form 2-bone analytical Leg IK so feet ALWAYS touch y = 0.012 on ground/floor
        const L1 = 0.37;
        const L2 = 0.375;
        const hipY = targetTorsoY - 0.02;
        const ankleDrop = Math.max(0.14, hipY - 0.012);
        const reachZ = mode === 'bumper' ? 0.34 : 0.31;
        const dist = Math.min(L1 + L2 - 0.006, Math.hypot(reachZ, ankleDrop));
        const thetaTarget = Math.atan2(reachZ, ankleDrop);
        const cosA = THREE.MathUtils.clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
        const cosK = THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1);
        targetHipRotX = -(thetaTarget + Math.acos(cosA));
        targetKneeRotX = Math.PI - Math.acos(cosK);

        if (mode === 'carousel') {
          lShX = -1.05;
          lShZ = 0.12;
          lElX = 0.72;
          rShX = -1.05;
          rShZ = -0.12;
          rElX = 0.72;
          targetTorsoRotX = 0.06;
        } else if (mode === 'ferris') {
          lShX = -0.58;
          lShZ = 0.18;
          lElX = 0.85;
          rShX = -0.58;
          rShZ = -0.18;
          rElX = 0.85;
        } else if (mode === 'bumper') {
          lShX = -0.78 + steerAngle * 0.15;
          lShZ = 0.18;
          lElX = 0.62;
          rShX = -0.78 - steerAngle * 0.15;
          rShZ = -0.18;
          rElX = 0.62;
          this.torsoGroup.rotation.z = steerAngle * 0.08;
        } else if (mode === 'cafe_cup') {
          lShX = -0.35;
          lShZ = 0.14;
          lElX = 0.75;
          rShX = -0.55;
          rShZ = -0.16;
          rElX = 1.05;
        }
      }

      this.rootGroup.rotation.x = targetRootRotX;
      this.torsoGroup.rotation.x = THREE.MathUtils.lerp(0, targetTorsoRotX, e);
      this.leftHipGroup.rotation.set(THREE.MathUtils.lerp(0.02, targetHipRotX, e), 0, -0.06);
      this.rightHipGroup.rotation.set(THREE.MathUtils.lerp(0.02, targetHipRotX, e), 0, 0.06);
      this.leftKneeGroup.rotation.set(THREE.MathUtils.lerp(0, targetKneeRotX, e), 0, 0);
      this.rightKneeGroup.rotation.set(THREE.MathUtils.lerp(0, targetKneeRotX, e), 0, 0);

      this.leftShoulderGroup.rotation.set(THREE.MathUtils.lerp(0.06, lShX, e), 0, lShZ);
      this.rightShoulderGroup.rotation.set(THREE.MathUtils.lerp(0.06, rShX, e), 0, rShZ);
      this.leftElbowGroup.rotation.set(THREE.MathUtils.lerp(0.14, lElX, e), 0, 0);
      this.rightElbowGroup.rotation.set(THREE.MathUtils.lerp(0.14, rElX, e), 0, 0);
      this.headGroup.rotation.y = Math.sin(time * 1.4) * 0.08;
      this.headGroup.rotation.x = 0.03;
      return;
    }

    // 4. Wave Animation
    if (this.currentAnim === 'wave') {
      this.torsoGroup.position.y = THREE.MathUtils.lerp(this.torsoGroup.position.y, STANDING_TORSO_Y, 0.2);
      this.rightShoulderGroup.rotation.set(0, 0, -2.1 + Math.sin(time * 8) * 0.38);
      this.rightElbowGroup.rotation.set(0.4, 0, 0);
      this.headGroup.rotation.y = Math.sin(time * 2) * 0.08;
      return;
    }

    // 5. Dance Animation
    if (this.currentAnim === 'dance' && !isMoving) {
      const beat = time * 6.5;
      this.torsoGroup.position.y = STANDING_TORSO_Y + Math.abs(Math.sin(beat)) * 0.09;
      this.torsoGroup.rotation.y = Math.sin(beat * 0.5) * 0.28;
      this.torsoGroup.rotation.z = Math.sin(beat * 0.5) * 0.08;
      this.leftShoulderGroup.rotation.set(Math.sin(beat) * 0.6, 0, 0.8 + Math.cos(beat) * 0.4);
      this.rightShoulderGroup.rotation.set(-Math.sin(beat) * 0.6, 0, -0.8 - Math.cos(beat) * 0.4);
      this.leftElbowGroup.rotation.set(0.8, 0, 0);
      this.rightElbowGroup.rotation.set(0.8, 0, 0);
      this.leftHipGroup.rotation.x = Math.sin(beat) * 0.25;
      this.rightHipGroup.rotation.x = -Math.sin(beat) * 0.25;
      this.leftKneeGroup.rotation.x = Math.max(0, Math.sin(beat) * 0.45);
      this.rightKneeGroup.rotation.x = Math.max(0, -Math.sin(beat) * 0.45);
      this.headGroup.rotation.z = Math.sin(beat * 0.5) * 0.12;
      return;
    }

    // 6. Swim Animation
    if (this.currentAnim === 'swim') {
      this.rootGroup.rotation.x = 1.15;
      this.torsoGroup.position.y = 0.62 + Math.sin(time * 3) * 0.06;
      const stroke = time * 5.2;
      this.leftShoulderGroup.rotation.set(-Math.PI * 0.7 + Math.sin(stroke) * 0.9, 0, 0.25);
      this.rightShoulderGroup.rotation.set(-Math.PI * 0.7 - Math.sin(stroke) * 0.9, 0, -0.25);
      this.leftHipGroup.rotation.x = Math.sin(stroke * 1.4) * 0.35;
      this.rightHipGroup.rotation.x = -Math.sin(stroke * 1.4) * 0.35;
      this.leftKneeGroup.rotation.x = 0.2;
      this.rightKneeGroup.rotation.x = 0.2;
      this.headGroup.rotation.x = -0.65;
      return;
    }

    // 7. Walking Kinematics (opposing arm-leg swing + ~2.5cm vertical body bob)
    if (isMoving || this.currentAnim === 'walk') {
      this.rootGroup.rotation.x = THREE.MathUtils.lerp(this.rootGroup.rotation.x, 0, 0.2);
      this.walkCycleTime += 0.085;
      const t = this.walkCycleTime;

      this.torsoGroup.position.y = STANDING_TORSO_Y + Math.abs(Math.sin(t * 2)) * 0.025;
      this.torsoGroup.rotation.x = THREE.MathUtils.lerp(this.torsoGroup.rotation.x, 0.035, 0.16);
      this.torsoGroup.rotation.y = Math.sin(t) * 0.085;
      this.torsoGroup.rotation.z = Math.cos(t) * 0.022;

      const leftLegAngle = Math.sin(t) * 0.62;
      const rightLegAngle = -Math.sin(t) * 0.62;

      this.leftHipGroup.rotation.x = leftLegAngle;
      this.rightHipGroup.rotation.x = rightLegAngle;
      this.leftKneeGroup.rotation.x = Math.max(0, -Math.sin(t + 0.3) * 0.58);
      this.rightKneeGroup.rotation.x = Math.max(0, Math.sin(t + 0.3) * 0.58);

      this.leftShoulderGroup.rotation.set(-leftLegAngle * 0.56, 0, 0.09);
      this.rightShoulderGroup.rotation.set(-rightLegAngle * 0.56, 0, -0.09);
      this.leftElbowGroup.rotation.set(Math.max(0.15, -leftLegAngle * 0.4), 0, 0);
      this.rightElbowGroup.rotation.set(Math.max(0.15, -rightLegAngle * 0.4), 0, 0);
      this.headGroup.rotation.x = Math.sin(t * 2) * 0.028;
      this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, 0, 0.12);
      return;
    }

    // 8. Smooth Ease Return & Natural Breathing + Head Glance Idle
    this.rootGroup.rotation.x = THREE.MathUtils.lerp(this.rootGroup.rotation.x, 0, 0.15);
    this.leftHipGroup.rotation.x = THREE.MathUtils.lerp(this.leftHipGroup.rotation.x, 0.02, 0.16);
    this.rightHipGroup.rotation.x = THREE.MathUtils.lerp(this.rightHipGroup.rotation.x, 0.02, 0.16);
    this.leftKneeGroup.rotation.x = THREE.MathUtils.lerp(this.leftKneeGroup.rotation.x, 0, 0.16);
    this.rightKneeGroup.rotation.x = THREE.MathUtils.lerp(this.rightKneeGroup.rotation.x, 0, 0.16);
    this.leftShoulderGroup.rotation.x = THREE.MathUtils.lerp(this.leftShoulderGroup.rotation.x, 0.06, 0.16);
    this.rightShoulderGroup.rotation.x = THREE.MathUtils.lerp(this.rightShoulderGroup.rotation.x, 0.06, 0.16);
    this.leftElbowGroup.rotation.x = THREE.MathUtils.lerp(this.leftElbowGroup.rotation.x, 0.14, 0.16);
    this.rightElbowGroup.rotation.x = THREE.MathUtils.lerp(this.rightElbowGroup.rotation.x, 0.14, 0.16);
    this.torsoGroup.rotation.x = THREE.MathUtils.lerp(this.torsoGroup.rotation.x, 0, 0.16);
    this.torsoGroup.rotation.y = THREE.MathUtils.lerp(this.torsoGroup.rotation.y, 0, 0.16);
    this.torsoGroup.rotation.z = THREE.MathUtils.lerp(this.torsoGroup.rotation.z, 0, 0.16);

    const breath = Math.sin(time * 2.2);
    this.chestGroup.scale.set(1 + breath * 0.016, 1 + breath * 0.02, 1 + breath * 0.016);
    this.torsoGroup.position.y = THREE.MathUtils.lerp(
      this.torsoGroup.position.y,
      STANDING_TORSO_Y + breath * 0.008,
      0.18
    );
    this.headGroup.rotation.y = Math.sin(time * 0.72) * 0.13 + Math.sin(time * 0.31) * 0.07;
    this.headGroup.rotation.x = Math.sin(time * 1.1) * 0.025;
  }

  public dispose() {
    this.skinMat.dispose();
    this.faceMat.dispose(); // Note: Texture is shared via FACE_TEXTURE_CACHE
    this.hairMat.dispose();
    this.pinkCardiganMat.dispose();
    this.whiteShirtMat.dispose();
    this.blueSkirtMat.dispose();
    this.whiteSockMat.dispose();
    this.blackMaryJaneMat.dispose();
    this.blueHoodieMat.dispose();
    this.denimJeansMat.dispose();
    this.sneakerWhiteMat.dispose();
    this.sneakerBlueMat.dispose();
    this.ribbonPinkMat.dispose();
    this.customTopMat.dispose();
    this.customBottomMat.dispose();
    this.customShoesMat.dispose();
    this.goldStarMat.dispose();
    this.coupleHeartMat.dispose();
  }
}
