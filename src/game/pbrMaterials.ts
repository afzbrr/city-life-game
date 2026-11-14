import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeatX = 1,
  repeatY = 1,
  isColor = true
): THREE.CanvasTexture {
  const fullKey = `${key}_${repeatX}_${repeatY}_${isColor ? 'c' : 'd'}`;
  const cached = textureCache.get(fullKey);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, width, height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  textureCache.set(fullKey, tex);
  return tex;
}

/**
 * Rich Wood Grain PBR Material (visible wood fibers + plank grooves + bump)
 */
export function createWoodPBRMaterial(
  baseHex = '#9a5b2c',
  darkHex = '#5c3114',
  repeatX = 2,
  repeatY = 2,
  roughness = 0.62
): THREE.MeshStandardMaterial {
  const map = getOrCreateTexture(
    `wood_color_${baseHex}_${darkHex}`,
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);

      // Wood grain fibers
      for (let i = 0; i < 160; i++) {
        const y = (i / 160) * h;
        ctx.strokeStyle = i % 3 === 0 ? darkHex : 'rgba(255,220,180,0.12)';
        ctx.globalAlpha = i % 3 === 0 ? 0.24 : 0.2;
        ctx.lineWidth = 1 + (i % 4) * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) {
          const wave = Math.sin(x * 0.025 + i * 0.4) * 4;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Subtle wood knots
      for (let k = 0; k < 3; k++) {
        const kx = 90 + k * 160;
        const ky = 110 + ((k * 130) % 280);
        const grad = ctx.createRadialGradient(kx, ky, 2, kx, ky, 24);
        grad.addColorStop(0, darkHex);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(kx, ky, 26, 10, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Plank seams
      ctx.strokeStyle = darkHex;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      for (let p = 1; p < 4; p++) {
        const py = (p * h) / 4;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    repeatX,
    repeatY,
    true
  );

  const bumpMap = getOrCreateTexture(
    'wood_bump',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) {
        const y = (i / 160) * h;
        ctx.strokeStyle = i % 2 === 0 ? '#686868' : '#9c9c9c';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) {
          ctx.lineTo(x, y + Math.sin(x * 0.025 + i * 0.4) * 4);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = '#303030';
      ctx.lineWidth = 3;
      for (let p = 1; p < 4; p++) {
        const py = (p * h) / 4;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
      }
    },
    repeatX,
    repeatY,
    false
  );

  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.035,
    roughness,
    metalness: 0.05,
  });
}

/**
 * Detailed Grass Turf PBR Material
 */
export function createGrassPBRMaterial(
  primaryHex = '#3b8c32',
  secondaryHex = '#235e1e',
  repeatX = 12,
  repeatY = 12
): THREE.MeshStandardMaterial {
  const map = getOrCreateTexture(
    `grass_${primaryHex}_${secondaryHex}`,
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = primaryHex;
      ctx.fillRect(0, 0, w, h);

      // Soft organic soil/moss patches
      for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * h;
        const r = 18 + (i % 25);
        ctx.fillStyle = i % 2 === 0 ? secondaryHex : '#4ca640';
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Grass blades
      ctx.lineWidth = 1.6;
      for (let b = 0; b < 1400; b++) {
        const x = ((b * 73) % w);
        const y = ((b * 137) % h);
        ctx.strokeStyle = b % 3 === 0 ? '#65bd52' : secondaryHex;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + ((b % 5) - 2), y - 6 - (b % 6));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    repeatX,
    repeatY,
    true
  );

  const bumpMap = getOrCreateTexture(
    'grass_bump',
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#777777';
      ctx.fillRect(0, 0, w, h);
      for (let b = 0; b < 900; b++) {
        const x = (b * 41) % w;
        const y = (b * 89) % h;
        ctx.fillStyle = b % 2 === 0 ? '#a8a8a8' : '#555555';
        ctx.fillRect(x, y, 2, 5);
      }
    },
    repeatX,
    repeatY,
    false
  );

  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.04,
    roughness: 0.9,
    metalness: 0.02,
  });
}

/**
 * Cobblestone / Paving Stone Path PBR Material
 */
export function createPavingPBRMaterial(
  stoneHex = '#cbd5e1',
  mortarHex = '#64748b',
  repeatX = 6,
  repeatY = 6
): THREE.MeshStandardMaterial {
  const map = getOrCreateTexture(
    `paving_${stoneHex}_${mortarHex}`,
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = mortarHex;
      ctx.fillRect(0, 0, w, h);

      const rows = 8;
      const cols = 6;
      const cellH = h / rows;
      const cellW = w / cols;

      for (let r = 0; r < rows; r++) {
        const offsetX = r % 2 === 0 ? 0 : cellW * 0.5;
        for (let c = -1; c <= cols; c++) {
          const x = c * cellW + offsetX + 3;
          const y = r * cellH + 3;
          const bw = cellW - 6;
          const bh = cellH - 6;
          const shade = ((r * 7 + c * 13) % 3);
          ctx.fillStyle = shade === 0 ? stoneHex : shade === 1 ? '#b8c4d4' : '#dde5ef';
          ctx.beginPath();
          ctx.roundRect(x, y, bw, bh, 8);
          ctx.fill();
        }
      }
    },
    repeatX,
    repeatY,
    true
  );

  const bumpMap = getOrCreateTexture(
    'paving_bump',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#383838';
      ctx.fillRect(0, 0, w, h);
      const rows = 8;
      const cols = 6;
      const cellH = h / rows;
      const cellW = w / cols;
      for (let r = 0; r < rows; r++) {
        const offsetX = r % 2 === 0 ? 0 : cellW * 0.5;
        for (let c = -1; c <= cols; c++) {
          ctx.fillStyle = '#c4c4c4';
          ctx.beginPath();
          ctx.roundRect(
            c * cellW + offsetX + 4,
            r * cellH + 4,
            cellW - 8,
            cellH - 8,
            8
          );
          ctx.fill();
        }
      }
    },
    repeatX,
    repeatY,
    false
  );

  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.06,
    roughness: 0.78,
    metalness: 0.05,
  });
}

/**
 * Rippled Beach Sand with Footprints PBR Material
 */
export function createSandPBRMaterial(repeatX = 10, repeatY = 8): THREE.MeshStandardMaterial {
  const map = getOrCreateTexture(
    'beach_sand_color',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#f4d38a';
      ctx.fillRect(0, 0, w, h);

      // Subtle golden sand grains
      for (let i = 0; i < 2400; i++) {
        const x = (i * 97) % w;
        const y = (i * 53) % h;
        ctx.fillStyle = i % 3 === 0 ? '#e3b868' : '#fce4a6';
        ctx.globalAlpha = 0.45;
        ctx.fillRect(x, y, 2, 2);
      }

      // Wind ripples
      ctx.strokeStyle = '#dfb564';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      for (let r = 0; r < 24; r++) {
        const y = (r / 24) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 24) {
          ctx.lineTo(x, y + Math.sin(x * 0.03 + r) * 5);
        }
        ctx.stroke();
      }

      // Subtle beach footprint trail
      ctx.fillStyle = '#c99b49';
      ctx.globalAlpha = 0.25;
      for (let f = 0; f < 6; f++) {
        const fx = 120 + f * 48;
        const fy = 220 + (f % 2 === 0 ? -10 : 12);
        ctx.beginPath();
        ctx.ellipse(fx, fy, 9, 5, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    repeatX,
    repeatY,
    true
  );

  const bumpMap = getOrCreateTexture(
    'beach_sand_bump',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#9e9e9e';
      ctx.lineWidth = 3;
      for (let r = 0; r < 24; r++) {
        const y = (r / 24) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 24) {
          ctx.lineTo(x, y + Math.sin(x * 0.03 + r) * 5);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#505050';
      for (let f = 0; f < 6; f++) {
        const fx = 120 + f * 48;
        const fy = 220 + (f % 2 === 0 ? -10 : 12);
        ctx.beginPath();
        ctx.ellipse(fx, fy, 9, 5, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    repeatX,
    repeatY,
    false
  );

  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.045,
    roughness: 0.92,
    metalness: 0.02,
  });
}

/**
 * Animated / Rippled Reflective Water Material
 */
export function createWaterPBRMaterial(
  colorHex = 0x0284c7,
  opacity = 0.86
): THREE.MeshPhysicalMaterial {
  const bumpMap = getOrCreateTexture(
    'water_ripples_bump',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        const cx = (i * 79) % w;
        const cy = (i * 131) % h;
        const r = 14 + (i % 24);
        const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
        grad.addColorStop(0, '#c0c0c0');
        grad.addColorStop(0.5, '#606060');
        grad.addColorStop(1, '#808080');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    6,
    6,
    false
  );

  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness: 0.08,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    ior: 1.33,
    reflectivity: 0.9,
    bumpMap,
    bumpScale: 0.03,
    transparent: true,
    opacity,
  });
}

/**
 * Water Caustics Glow Texture (for Aquarium floor & Pool bottoms)
 */
export function createWaterCausticsMaterial(baseHex = '#0c4a6e'): THREE.MeshStandardMaterial {
  const map = getOrCreateTexture(
    `caustics_${baseHex}`,
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      for (let i = 0; i < 36; i++) {
        const cx = (i * 113) % w;
        const cy = (i * 179) % h;
        const rx = 28 + (i % 35);
        const ry = 20 + (i % 28);
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, i * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    6,
    6,
    true
  );

  return new THREE.MeshStandardMaterial({
    map,
    emissive: 0x0ea5e9,
    emissiveMap: map,
    emissiveIntensity: 0.15,
    roughness: 0.45,
    metalness: 0.1,
  });
}

/**
 * Clear Reflective Glass Material
 */
export function createReflectiveGlassMaterial(
  tintHex = 0xbae6fd,
  opacity = 0.34
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: tintHex,
    roughness: 0.04,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    ior: 1.5,
    reflectivity: 0.96,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * Sunset Gradient Sky Dome Shader Material (Orange -> Pink -> Deep Purple)
 */
export function createGradientSkyDome(
  topHex: number,
  midHex: number,
  bottomHex: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(topHex) },
      midColor: { value: new THREE.Color(midHex) },
      bottomColor: { value: new THREE.Color(bottomHex) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 col = mix(bottomColor, midColor, smoothstep(-0.05, 0.25, h));
        col = mix(col, topColor, smoothstep(0.25, 0.85, h));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
}
