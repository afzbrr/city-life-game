import * as THREE from 'three';
import { AvatarModel } from './avatarModel';
import { AvatarConfig } from './types';

export interface NPCPlayer {
  id: string;
  name: string;
  gender: 'cewek' | 'cowok';
  model: AvatarModel;
  rootGroup: THREE.Group;
  initialPos: THREE.Vector3;
  targetPos?: THREE.Vector3;
  behavior: 'wander' | 'sit' | 'chat';
  greeting: string;
  isSitting?: boolean;
}

// Procedural 3D Canvas Name Tag Sprite
function createNameBadgeSprite(name: string, isGirl: boolean): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Pill Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(16, 8, 224, 48, 24);
  ctx.fill();

  // Border
  ctx.strokeStyle = isGirl ? '#f472b6' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Name Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.4, 0.35, 1);
  return sprite;
}

const NPC_DATA = [
  { name: 'Raka', gender: 'cowok' as const, behavior: 'wander' as const, greeting: 'Hai! Seru banget ya keliling di sini! 🏃‍♂️' },
  { name: 'Sinta', gender: 'cewek' as const, behavior: 'sit' as const, greeting: 'Halo! Cuacanya adem banget hari ini ya! 🌸' },
  { name: 'Bimo', gender: 'cowok' as const, behavior: 'chat' as const, greeting: 'Bro, cobain wahana di sebelah sana, keren parah! 🚀' },
  { name: 'Dina', gender: 'cewek' as const, behavior: 'wander' as const, greeting: 'Mau jalan bareng ga? Lagi nyari jajanan enak nih! 🍦' },
  { name: 'Kenzo', gender: 'cowok' as const, behavior: 'sit' as const, greeting: 'Me time dulu sambil dengerin musik lofi 🎧✨' },
  { name: 'Alya', gender: 'cewek' as const, behavior: 'chat' as const, greeting: 'Hai! Baju avatar kamu lucu banget! 💖' },
  { name: 'Reza', gender: 'cowok' as const, behavior: 'wander' as const, greeting: 'Kota ini rame banget ya, banyak spot foto bagus! 📸' },
  { name: 'Nabila', gender: 'cewek' as const, behavior: 'sit' as const, greeting: 'Duduk santai di sini bikin pikiran rileks banget ☕' },
  { name: 'Dika', gender: 'cowok' as const, behavior: 'wander' as const, greeting: 'Wah, kamu juga baru masuk ke dunia ini ya? Salam kenal! 👋' },
  { name: 'Maya', gender: 'cewek' as const, behavior: 'chat' as const, greeting: 'Jangan lupa cobain makanannya ya, enak banget! 😋' },
];

interface WorldSpawnDef {
  x: number;
  y: number;
  z: number;
  rotY: number;
  behavior: 'wander' | 'sit' | 'chat';
}

const WORLD_SPAWNS: Record<string, WorldSpawnDef[]> = {
  taman: [
    { x: 5.6, y: 0, z: 0, rotY: -Math.PI / 2, behavior: 'sit' },
    { x: -5.6, y: 0, z: 0, rotY: Math.PI / 2, behavior: 'sit' },
    { x: 12, y: 0, z: -10, rotY: Math.PI, behavior: 'chat' },
    { x: 0, y: 0, z: 3.8, rotY: 0, behavior: 'chat' },
    { x: 1.2, y: 0, z: 3.8, rotY: Math.PI, behavior: 'chat' },
    { x: 0, y: 0, z: 5.6, rotY: Math.PI, behavior: 'sit' },
    { x: -10, y: 0, z: -8, rotY: 0, behavior: 'wander' },
    { x: 8, y: 0, z: 8, rotY: 0, behavior: 'wander' },
    { x: -8, y: 0, z: 10, rotY: 0, behavior: 'wander' },
    { x: 4, y: 0, z: -12, rotY: 0, behavior: 'wander' },
  ],
  pantai: [
    { x: -8, y: 0, z: 4, rotY: 0, behavior: 'sit' },
    { x: -5, y: 0, z: 4, rotY: 0, behavior: 'sit' },
    { x: 12, y: 0, z: 3, rotY: -Math.PI / 2, behavior: 'chat' },
    { x: 10, y: 0, z: -12, rotY: 0, behavior: 'chat' },
    { x: 11.5, y: 0, z: -12, rotY: Math.PI, behavior: 'chat' },
    { x: 4, y: 0, z: 4, rotY: 0, behavior: 'sit' },
    { x: -10, y: 0, z: 8, rotY: 0, behavior: 'wander' },
    { x: -2, y: 0, z: 12, rotY: 0, behavior: 'wander' },
    { x: 5, y: 0, z: 10, rotY: 0, behavior: 'wander' },
    { x: 8, y: 0, z: -6, rotY: 0, behavior: 'wander' },
  ],
  cafe: [
    { x: -6, y: 0, z: -4, rotY: 0, behavior: 'sit' },
    { x: -6, y: 0, z: -2.6, rotY: Math.PI, behavior: 'sit' },
    { x: 6, y: 0, z: -4, rotY: 0, behavior: 'sit' },
    { x: -6, y: 0, z: 4, rotY: 0, behavior: 'sit' },
    { x: 0, y: 0, z: -8.8, rotY: 0, behavior: 'sit' },
    { x: 2.5, y: 0, z: -6.5, rotY: Math.PI, behavior: 'chat' },
    { x: -9.5, y: 0, z: 0, rotY: Math.PI / 2, behavior: 'chat' },
    { x: -9.5, y: 0, z: 1.5, rotY: -Math.PI / 2, behavior: 'chat' },
    { x: 2, y: 0, z: 2, rotY: 0, behavior: 'wander' },
    { x: 8, y: 0, z: 4, rotY: -Math.PI / 2, behavior: 'wander' },
  ],
  aquarium: [
    { x: -1.2, y: 0, z: 1.8, rotY: 0, behavior: 'sit' },
    { x: 1.2, y: 0, z: 1.8, rotY: 0, behavior: 'sit' },
    { x: 0, y: 0, z: -2, rotY: 0, behavior: 'chat' },
    { x: 5.5, y: 0, z: 0, rotY: -Math.PI / 2, behavior: 'chat' },
    { x: 5.5, y: 0, z: 1.2, rotY: Math.PI / 2, behavior: 'chat' },
    { x: -2.8, y: 0, z: -6.5, rotY: Math.PI / 4, behavior: 'chat' },
    { x: 2.8, y: 0, z: 6.5, rotY: -Math.PI / 4, behavior: 'chat' },
    { x: -1.5, y: 0, z: -8, rotY: 0, behavior: 'wander' },
    { x: 1.5, y: 0, z: 8, rotY: 0, behavior: 'wander' },
    { x: 0, y: 0, z: 5, rotY: 0, behavior: 'wander' },
  ],
  pasar_malam: [
    { x: -7, y: 0, z: 9.8, rotY: 0, behavior: 'chat' },
    { x: -14, y: 0, z: 9.8, rotY: 0, behavior: 'chat' },
    { x: 14.5, y: 0, z: 2, rotY: -Math.PI / 2, behavior: 'chat' },
    { x: 16.5, y: 0, z: 2, rotY: -Math.PI / 2, behavior: 'chat' },
    { x: 0, y: 0, z: -10, rotY: 0, behavior: 'sit' },
    { x: -15, y: 0, z: 1, rotY: 0, behavior: 'sit' },
    { x: 7, y: 0, z: 9.8, rotY: 0, behavior: 'chat' },
    { x: -4, y: 0, z: 2, rotY: 0, behavior: 'wander' },
    { x: 4, y: 0, z: 2, rotY: 0, behavior: 'wander' },
    { x: 0, y: 0, z: 6, rotY: 0, behavior: 'wander' },
  ],
};

export function spawnWorldNPCs(scene: THREE.Scene, worldType: string): {
  npcs: NPCPlayer[];
  update: (time: number) => void;
  cleanup: () => void;
  getNearbyNPC: (playerPos: THREE.Vector3, maxDist: number) => NPCPlayer | null;
} {
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const npcs: NPCPlayer[] = [];
  const spawns = WORLD_SPAWNS[worldType] || WORLD_SPAWNS.taman;

  NPC_DATA.forEach((data, index) => {
    const isGirl = data.gender === 'cewek';
    const spawn = spawns[index % spawns.length];
    const behavior = spawn.behavior;

    const cowoHairs = ['cowo_two_block', 'cowo_mullet', 'cowo_comma', 'cowo_curtain', 'cowo_perm'];
    const ceweHairs = ['cewe_long_hair', 'cewe_wolf_cut', 'cewe_curtain_bangs', 'cewe_butterfly_cut', 'cewe_hush_cut'];
    const npcExprs = ['senyum', 'senyum_lebar', 'berbinar', 'malu', 'kedip_satu'] as const;

    const config: AvatarConfig = {
      gender: data.gender,
      ageGroup: 'dewasa',
      skinColor: index % 2 === 0 ? '#fff0ea' : '#ffe0b2',
      hairStyle: isGirl ? ceweHairs[index % ceweHairs.length] : cowoHairs[index % cowoHairs.length],
      hairColor: index % 3 === 0 ? '#18181b' : (index % 3 === 1 ? '#6b3e26' : '#334155'),
      top: isGirl ? (index % 2 === 0 ? 'cardigan_pink' : 'hoodie_pink') : (index % 2 === 0 ? 'hoodie_biru' : 'kemeja_flannel'),
      bottom: isGirl ? 'rok_plisket_biru' : 'jeans_denim',
      shoes: isGirl ? 'mary_jane_black' : 'sneakers_biru_putih',
      hat: index === 3 ? 'beret_pink' : (index === 6 ? 'cap_hitam' : 'none'),
      glasses: index === 2 || index === 7 ? 'kacamata_bulat' : 'none',
      accessory: isGirl && index % 2 === 0 ? 'pita_pink' : 'none',
      faceExpression: npcExprs[index % npcExprs.length],
    };

    const avatar = new AvatarModel(config);
    const npcRoot = new THREE.Group();
    npcRoot.add(avatar.group);

    npcRoot.position.set(spawn.x, spawn.y, spawn.z);
    avatar.group.rotation.y = spawn.rotY;

    // Floating name tag
    const nameSprite = createNameBadgeSprite(data.name, isGirl);
    nameSprite.position.set(0, 2.5, 0);
    npcRoot.add(nameSprite);

    rootGroup.add(npcRoot);

    const npc: NPCPlayer = {
      id: `npc_${index}`,
      name: data.name,
      gender: data.gender,
      model: avatar,
      rootGroup: npcRoot,
      initialPos: new THREE.Vector3(spawn.x, spawn.y, spawn.z),
      behavior,
      greeting: data.greeting,
    };

    if (behavior === 'sit') {
      avatar.setAnimation('sit');
      npc.isSitting = true;
    } else {
      avatar.setAnimation('idle');
    }

    npcs.push(npc);
  });

  const update = (time: number) => {
    npcs.forEach((npc, idx) => {
      if (npc.behavior === 'wander' && !npc.isSitting) {
        // Smooth gentle wandering in a small local loop
        const loopT = time * 0.45 + idx * 1.6;
        const offsetX = Math.sin(loopT) * 2.8;
        const offsetZ = Math.cos(loopT * 0.8) * 2.8;

        npc.rootGroup.position.x = npc.initialPos.x + offsetX;
        npc.rootGroup.position.z = npc.initialPos.z + offsetZ;

        // Face walking direction
        const dirX = Math.cos(loopT) * 2.8;
        const dirZ = -Math.sin(loopT * 0.8) * 2.24;
        npc.model.group.rotation.y = Math.atan2(dirX, dirZ);

        npc.model.update(time, true);
      } else if (npc.behavior === 'chat') {
        // Idle with expressive conversational gestures
        npc.model.update(time, false);
      } else {
        // Sitting
        npc.model.update(time, false);
      }
    });
  };

  const getNearbyNPC = (playerPos: THREE.Vector3, maxDist = 2.5): NPCPlayer | null => {
    let closest: NPCPlayer | null = null;
    let minDist = maxDist;

    npcs.forEach((npc) => {
      const dist = npc.rootGroup.position.distanceTo(playerPos);
      if (dist < minDist) {
        minDist = dist;
        closest = npc;
      }
    });

    return closest;
  };

  const cleanup = () => {
    npcs.forEach((npc) => {
      npc.model.dispose();
    });
    scene.remove(rootGroup);
  };

  return { npcs, update, cleanup, getNearbyNPC };
}
