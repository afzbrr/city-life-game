import * as THREE from 'three';
import { FaceExpression } from '../types';

const FACE_TEXTURE_CACHE = new Map<string, THREE.CanvasTexture>();
let HAIR_STRAND_TEX: THREE.CanvasTexture | null = null;

/**
 * Procedural fine hair-strand texture so all 3D hair meshes show real strands
 * & silky sheen rather than flat plastic blocks.
 */
export function createHairStrandTexture(): THREE.CanvasTexture {
  if (HAIR_STRAND_TEX) return HAIR_STRAND_TEX;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle vertical hair strand striations
  for (let i = 0; i < 420; i++) {
    const x = (i * 19.7) % 256;
    const isHighlight = i % 3 === 0;
    ctx.strokeStyle = isHighlight
      ? 'rgba(255, 255, 255, 0.34)'
      : 'rgba(15, 23, 42, 0.22)';
    ctx.lineWidth = isHighlight ? 1.2 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + Math.sin(i) * 3,
      85,
      x - Math.cos(i) * 3,
      170,
      x + ((i % 5) - 2),
      256
    );
    ctx.stroke();
  }

  // Soft glossy horizontal hair halo (anisotropic specular feel)
  const shine = ctx.createLinearGradient(0, 48, 0, 128);
  shine.addColorStop(0, 'rgba(255,255,255,0)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 48, 256, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  HAIR_STRAND_TEX = tex;
  return tex;
}

/**
 * Generates and caches a crisp 512x512 stylized Zepeto/Sims front face texture
 * supporting all 13 expressions + blinking + sleeping + eye-glance direction.
 * Every expression coordinates EYES + EYEBROWS + MOUTH + BLUSH together!
 */
export function createCartoonFaceTexture(
  skinColor = '#fff0ea',
  isBlinking = false,
  isSleeping = false,
  expression: FaceExpression = 'senyum',
  gazeShift: -1 | 0 | 1 = 0
): THREE.CanvasTexture {
  const key = `${skinColor}|${isBlinking ? 1 : 0}|${isSleeping ? 1 : 0}|${expression}|${gazeShift}`;
  const cached = FACE_TEXTURE_CACHE.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Smooth skin base
  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, 512, 512);

  // Soft facial shading around nose bridge & temples for 3D depth
  const centerGlow = ctx.createRadialGradient(256, 256, 18, 256, 256, 210);
  centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0.04)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, 512, 512);

  // Cheek Blush (stronger & rosy on malu / love / ketawa)
  const blushAlpha =
    expression === 'malu'
      ? 0.62
      : expression === 'love' || expression === 'ketawa' || expression === 'berbinar'
      ? 0.44
      : 0.28;

  const drawBlush = (bx: number, by: number) => {
    const g = ctx.createRadialGradient(bx, by, 4, bx, by, 42);
    g.addColorStop(0, `rgba(244, 63, 94, ${blushAlpha})`);
    g.addColorStop(0.6, `rgba(251, 113, 133, ${blushAlpha * 0.45})`);
    g.addColorStop(1, 'rgba(251, 113, 133, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(bx, by, 42, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    if (expression === 'malu') {
      // Cute anime blush diagonal lines
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.55)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let l = -1; l <= 1; l++) {
        ctx.beginPath();
        ctx.moveTo(bx + l * 10 - 4, by + 6);
        ctx.lineTo(bx + l * 10 + 4, by - 6);
        ctx.stroke();
      }
    }
  };
  drawBlush(148, 286);
  drawBlush(364, 286);

  const eyeLX = 188;
  const eyeRX = 324;
  const eyeY = 232;

  const drawClosedEyeCurve = (cx: number, y: number, happyCurve = true) => {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (happyCurve) {
      // Cute upward-curving laughing/winking arc ^ ^
      ctx.arc(cx, y + 12, 26, Math.PI * 1.15, Math.PI * 1.85);
    } else {
      // Peaceful downward-curving closed/blinking arc U
      ctx.arc(cx, y - 4, 26, Math.PI * 0.14, Math.PI * 0.86);
    }
    ctx.stroke();

    // Soft side lash
    ctx.lineWidth = 4;
    const dir = cx < 256 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 24, y + (happyCurve ? 2 : 4));
    ctx.lineTo(cx + dir * 32, y - 4);
    ctx.stroke();
  };

  const drawHeartEye = (cx: number, y: number) => {
    ctx.save();
    ctx.translate(cx, y + 2);
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.bezierCurveTo(-30, 4, -30, -24, -12, -24);
    ctx.bezierCurveTo(-3, -24, 0, -14, 0, -10);
    ctx.bezierCurveTo(0, -14, 3, -24, 12, -24);
    ctx.bezierCurveTo(30, -24, 30, 4, 0, 22);
    ctx.fill();

    // Inner pink glow + sparkle
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(-8, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-11, -13, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawDetailedEye = (
    cx: number,
    isRight: boolean,
    opts: {
      scaleX?: number;
      scaleY?: number;
      droop?: boolean;
      starry?: boolean;
      sleepy?: boolean;
      angry?: boolean;
      pupilOffsetX?: number;
      tears?: boolean;
    } = {}
  ) => {
    const rx = 27 * (opts.scaleX ?? 1);
    const ry = 34 * (opts.scaleY ?? 1);
    const pxOff = opts.pupilOffsetX ?? 0;

    // Clean sclera
    ctx.fillStyle = '#fffdfd';
    ctx.beginPath();
    ctx.ellipse(cx, eyeY + 1, rx + 4, ry * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris gradient
    const ix = cx + pxOff;
    const irisGrad = ctx.createLinearGradient(ix, eyeY - ry, ix, eyeY + ry);
    irisGrad.addColorStop(0, '#09090b');
    irisGrad.addColorStop(0.55, '#1e1b4b');
    irisGrad.addColorStop(1, '#4338ca');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(ix, eyeY + 1, rx * 0.84, ry * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.ellipse(ix, eyeY + 1, rx * 0.44, ry * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lower iris glint
    ctx.fillStyle = 'rgba(165, 180, 252, 0.42)';
    ctx.beginPath();
    ctx.ellipse(ix, eyeY + ry * 0.46, rx * 0.48, ry * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ix + 8, eyeY - 12, 8.5, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ix - 8, eyeY + 11, 3.8, 0, Math.PI * 2);
    ctx.fill();

    if (opts.starry) {
      // Cute 4-point star sparkle inside eye (Berbinar)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(ix, eyeY - 7);
      ctx.lineTo(ix + 4, eyeY - 1);
      ctx.lineTo(ix + 10, eyeY + 1);
      ctx.lineTo(ix + 4, eyeY + 4);
      ctx.lineTo(ix, eyeY + 10);
      ctx.lineTo(ix - 4, eyeY + 4);
      ctx.lineTo(ix - 10, eyeY + 1);
      ctx.lineTo(ix - 4, eyeY - 1);
      ctx.closePath();
      ctx.fill();
    }

    if (opts.sleepy) {
      // Half-closed sleepy upper eyelid
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.rect(cx - rx - 8, eyeY - ry - 6, (rx + 8) * 2, ry * 0.92);
      ctx.fill();
    }

    if (opts.tears) {
      // Glossy tear pool + cute cheek teardrop
      ctx.fillStyle = 'rgba(56, 189, 248, 0.78)';
      ctx.beginPath();
      ctx.ellipse(cx, eyeY + ry * 0.78, rx * 0.75, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      const tearX = isRight ? cx + 18 : cx - 18;
      ctx.beginPath();
      ctx.moveTo(tearX, eyeY + ry * 0.85);
      ctx.quadraticCurveTo(tearX - 8, eyeY + ry + 18, tearX, eyeY + ry + 26);
      ctx.quadraticCurveTo(tearX + 8, eyeY + ry + 18, tearX, eyeY + ry * 0.85);
      ctx.fill();
    }

    // Upper Eyelash arc
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    if (opts.sleepy) {
      ctx.beginPath();
      ctx.moveTo(cx - rx - 3, eyeY - 2);
      ctx.quadraticCurveTo(cx, eyeY + 5, cx + rx + 3, eyeY - 2);
      ctx.stroke();
    } else if (opts.angry) {
      ctx.beginPath();
      if (isRight) {
        ctx.moveTo(cx - rx - 2, eyeY - ry * 0.45);
        ctx.lineTo(cx + rx + 4, eyeY - ry * 0.85);
      } else {
        ctx.moveTo(cx - rx - 4, eyeY - ry * 0.85);
        ctx.lineTo(cx + rx + 2, eyeY - ry * 0.45);
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        eyeY - (opts.droop ? 0 : 2),
        rx + 3,
        ry * 0.84,
        0,
        Math.PI * 1.05,
        Math.PI * 1.95
      );
      ctx.stroke();
    }
  };

  // --- 1. EYES + EYEBROWS COORDINATED PER STATE/EXPRESSION ---
  const browStroke = '#18181b';
  const drawBrow = (
    x1: number,
    y1: number,
    cx: number,
    cy: number,
    x2: number,
    y2: number
  ) => {
    ctx.strokeStyle = browStroke;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  };

  if (isSleeping) {
    drawClosedEyeCurve(eyeLX, eyeY, false);
    drawClosedEyeCurve(eyeRX, eyeY, false);
    drawBrow(156, 178, 188, 172, 218, 178);
    drawBrow(294, 178, 324, 172, 356, 178);
  } else if (isBlinking) {
    drawClosedEyeCurve(eyeLX, eyeY, false);
    drawClosedEyeCurve(eyeRX, eyeY, false);
    drawBrow(156, 174, 188, 166, 218, 174);
    drawBrow(294, 174, 324, 166, 356, 174);
  } else {
    switch (expression) {
      case 'ketawa':
        drawClosedEyeCurve(eyeLX, eyeY - 2, true);
        drawClosedEyeCurve(eyeRX, eyeY - 2, true);
        drawBrow(156, 166, 188, 152, 218, 166);
        drawBrow(294, 166, 324, 152, 356, 166);
        break;
      case 'kedip_satu':
        drawDetailedEye(eyeLX, false);
        drawClosedEyeCurve(eyeRX, eyeY, true);
        drawBrow(156, 170, 188, 158, 218, 170);
        drawBrow(294, 176, 324, 166, 356, 176);
        break;
      case 'berbinar':
        drawDetailedEye(eyeLX, false, { scaleX: 1.06, scaleY: 1.08, starry: true });
        drawDetailedEye(eyeRX, true, { scaleX: 1.06, scaleY: 1.08, starry: true });
        drawBrow(156, 166, 188, 152, 218, 166);
        drawBrow(294, 166, 324, 152, 356, 166);
        break;
      case 'love':
        drawHeartEye(eyeLX, eyeY);
        drawHeartEye(eyeRX, eyeY);
        drawBrow(156, 168, 188, 156, 218, 168);
        drawBrow(294, 168, 324, 156, 356, 168);
        break;
      case 'kaget':
        drawDetailedEye(eyeLX, false, { scaleX: 1.12, scaleY: 1.16 });
        drawDetailedEye(eyeRX, true, { scaleX: 1.12, scaleY: 1.16 });
        drawBrow(154, 156, 188, 140, 218, 156);
        drawBrow(294, 156, 324, 140, 358, 156);
        break;
      case 'sedih':
        drawDetailedEye(eyeLX, false, { scaleY: 0.9, droop: true });
        drawDetailedEye(eyeRX, true, { scaleY: 0.9, droop: true });
        drawBrow(154, 182, 186, 170, 218, 162);
        drawBrow(294, 162, 326, 170, 358, 182);
        break;
      case 'nangis':
        drawClosedEyeCurve(eyeLX, eyeY + 4, false);
        drawClosedEyeCurve(eyeRX, eyeY + 4, false);
        // Cute streaming tears
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillRect(eyeLX - 10, eyeY + 18, 16, 42);
        ctx.fillRect(eyeRX - 6, eyeY + 18, 16, 42);
        ctx.beginPath();
        ctx.arc(eyeLX - 2, eyeY + 60, 8, 0, Math.PI * 2);
        ctx.arc(eyeRX + 2, eyeY + 60, 8, 0, Math.PI * 2);
        ctx.fill();
        drawBrow(154, 184, 186, 170, 218, 160);
        drawBrow(294, 160, 326, 170, 358, 184);
        break;
      case 'ngantuk':
        drawDetailedEye(eyeLX, false, { sleepy: true });
        drawDetailedEye(eyeRX, true, { sleepy: true });
        drawBrow(156, 180, 188, 176, 218, 180);
        drawBrow(294, 180, 324, 176, 356, 180);
        break;
      case 'marah':
        drawDetailedEye(eyeLX, false, { scaleY: 0.86, angry: true });
        drawDetailedEye(eyeRX, true, { scaleY: 0.86, angry: true });
        drawBrow(156, 162, 188, 174, 218, 186);
        drawBrow(294, 186, 324, 174, 356, 162);
        break;
      case 'lirik':
        drawDetailedEye(eyeLX, false, { pupilOffsetX: gazeShift * 8 });
        drawDetailedEye(eyeRX, true, { pupilOffsetX: gazeShift * 8 });
        drawBrow(156, 170, 188, 160, 218, 170);
        drawBrow(294, 170, 324, 160, 356, 170);
        break;
      case 'cool':
        drawDetailedEye(eyeLX, false, { scaleY: 0.82 });
        drawDetailedEye(eyeRX, true, { scaleY: 0.82 });
        drawBrow(156, 172, 188, 168, 218, 172);
        drawBrow(294, 172, 324, 168, 356, 172);
        break;
      case 'malu':
        drawDetailedEye(eyeLX, false, { scaleY: 0.94 });
        drawDetailedEye(eyeRX, true, { scaleY: 0.94 });
        drawBrow(156, 178, 188, 168, 218, 166);
        drawBrow(294, 166, 324, 168, 356, 178);
        break;
      case 'senyum_lebar':
      case 'senyum':
      default:
        drawDetailedEye(eyeLX, false);
        drawDetailedEye(eyeRX, true);
        drawBrow(156, 172, 188, 160, 218, 172);
        drawBrow(294, 172, 324, 160, 356, 172);
        break;
    }
  }

  // --- 2. MOUTH RENDERING AT Y=328 (CLEARLY BELOW 3D NOSE) ---
  const mouthY = 330;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isSleeping) {
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(256, mouthY, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    switch (expression) {
      case 'senyum_lebar':
      case 'ketawa': {
        // Wide happy open grin with white teeth + cute tongue
        ctx.fillStyle = '#be123c';
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(222, mouthY - 6);
        ctx.quadraticCurveTo(256, mouthY - 2, 290, mouthY - 6);
        ctx.quadraticCurveTo(286, mouthY + 26, 256, mouthY + 26);
        ctx.quadraticCurveTo(226, mouthY + 26, 222, mouthY - 6);
        ctx.fill();
        ctx.stroke();

        // Top teeth
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(228, mouthY - 4, 56, 11, 4);
        ctx.fill();

        // Pink tongue
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 18, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'kaget': {
        // Cute O mouth
        ctx.fillStyle = '#e11d48';
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 4, 13, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'ngantuk': {
        // Yawning small oval mouth
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 4, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'sedih':
      case 'nangis': {
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(234, mouthY + 12);
        ctx.quadraticCurveTo(256, mouthY - 4, 278, mouthY + 12);
        ctx.stroke();
        break;
      }
      case 'marah': {
        // Cute pout / grump wave
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(234, mouthY + 8);
        ctx.quadraticCurveTo(246, mouthY, 256, mouthY + 6);
        ctx.quadraticCurveTo(266, mouthY, 278, mouthY + 8);
        ctx.stroke();
        break;
      }
      case 'malu': {
        // Sweet small shy cat/curled smile
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(238, mouthY);
        ctx.quadraticCurveTo(247, mouthY + 9, 256, mouthY + 2);
        ctx.quadraticCurveTo(265, mouthY + 9, 274, mouthY);
        ctx.stroke();
        break;
      }
      case 'kedip_satu': {
        // Playful cheeky grin
        ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 4, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(234, mouthY);
        ctx.quadraticCurveTo(256, mouthY + 15, 280, mouthY - 4);
        ctx.stroke();
        break;
      }
      case 'cool': {
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(238, mouthY + 4);
        ctx.lineTo(276, mouthY);
        ctx.stroke();
        break;
      }
      case 'lirik': {
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(240, mouthY + 3);
        ctx.quadraticCurveTo(256, mouthY + 8, 274, mouthY + 1);
        ctx.stroke();
        break;
      }
      case 'berbinar':
      case 'love':
      case 'senyum':
      default: {
        // Warm soft glossy lips + natural smile
        ctx.fillStyle = 'rgba(244, 63, 94, 0.34)';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 5, 19, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(232, mouthY - 1);
        ctx.quadraticCurveTo(256, mouthY + 16, 280, mouthY - 1);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(256, mouthY + 9, 6.5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  FACE_TEXTURE_CACHE.set(key, tex);
  return tex;
}
