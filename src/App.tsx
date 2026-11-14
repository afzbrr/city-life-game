import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Volume2, VolumeX } from 'lucide-react';
import { AvatarModel } from './game/avatarModel';
import {
  buildAquariumScene,
  buildBeachScene,
  buildCafeScene,
  buildNightMarketScene,
  buildParkScene,
} from './game/sceneBuilder';
import { NPCPlayer, spawnWorldNPCs } from './game/npcManager';
import { FootstepSurface, sound } from './game/soundManager';
import {
  AvatarConfig,
  GameWorldLocation,
  HeldFoodItem,
  InteractionTarget,
} from './game/types';
import { AvatarState, FriendEntry, FriendRequest } from './types/game';
import GameLoadingScreen from './components/GameLoadingScreen';
import HomeDashboard from './components/HomeDashboard';
import ChatSystem from './components/ChatSystem';
import FriendsModal from './components/FriendsModal';
import TransferModal from './components/TransferModal';
import PhotoBoothModal from './components/PhotoBoothModal';
import ProfileView from './components/ProfileView';
import AvatarCreator from './components/AvatarCreator';

const WORLD_NAMES: Record<GameWorldLocation, { title: string; icon: string }> = {
  taman: { title: 'TAMAN KOTA', icon: '🌳' },
  pantai: { title: 'PANTAI SUNSET', icon: '🏖️' },
  cafe: { title: 'CAFE COZY', icon: '☕' },
  aquarium: { title: 'AQUARIUM UNDERWATER', icon: '🦈' },
  pasar_malam: { title: 'PASAR MALAM', icon: '🎡' },
};

const INITIAL_FRIENDS: FriendEntry[] = [
  {
    id: 'friend_maya',
    name: 'Maya',
    username: '@maya_cute',
    status: 'playing',
    worldId: 'taman',
    worldTitle: 'TAMAN KOTA',
    activity: 'Main ayunan & foto',
    avatar: {
      name: 'Maya',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'bulat',
      eyeType: 'gemoy',
      eyeColor: 'pink',
      hairStyle: 'lurus_panjang',
      hairColor: '#18181b',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'cardigan_pink',
      outfitName: 'Cardigan Pink',
      outfitType: 'pink_cewe',
      accessoryId: 'cat_ears',
      shoesId: 'sepatu_sekolah',
    },
  },
  {
    id: 'friend_bima',
    name: 'Bima',
    username: '@bima_skater',
    status: 'playing',
    worldId: 'pantai',
    worldTitle: 'PANTAI SUNSET',
    activity: 'Naik Jetski',
    avatar: {
      name: 'Bima',
      gender: 'cowok',
      skinColor: 'kuning',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'hitam',
      hairStyle: 'two_block',
      hairColor: '#334155',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'jaket_denim',
      outfitName: 'Jaket Denim',
      outfitType: 'biru_cowo',
      accessoryId: 'kacamata_bulat',
      shoesId: 'sneakers_hitam',
    },
  },
  {
    id: 'friend_salsa',
    name: 'Salsa',
    username: '@salsa_lofi',
    status: 'playing',
    worldId: 'cafe',
    worldTitle: 'CAFE COZY',
    activity: 'Minum Boba & Nugas',
    avatar: {
      name: 'Salsa',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'coklat',
      hairStyle: 'lurus_panjang',
      hairColor: '#451a03',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'sweater_rajut',
      outfitName: 'Sweater Cream',
      outfitType: 'pink_cewe',
      accessoryId: 'bando_putih',
      shoesId: 'sneakers_putih',
    },
  },
  {
    id: 'friend_reno',
    name: 'Reno',
    username: '@reno_night',
    status: 'playing',
    worldId: 'pasar_malam',
    worldTitle: 'PASAR MALAM',
    activity: 'Naik Bianglala',
    avatar: {
      name: 'Reno',
      gender: 'cowok',
      skinColor: 'sawo_matang',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'hitam',
      hairStyle: 'two_block',
      hairColor: '#0f172a',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'jaket_bomber',
      outfitName: 'Jaket Bomber',
      outfitType: 'biru_cowo',
      accessoryId: 'none',
      shoesId: 'sneakers_hitam',
    },
  },
  {
    id: 'friend_nina',
    name: 'Nina',
    username: '@nina_ocean',
    status: 'online',
    avatar: {
      name: 'Nina',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'bulat',
      eyeType: 'gemoy',
      eyeColor: 'biru',
      hairStyle: 'lurus_panjang',
      hairColor: '#1e293b',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'blouse_pastel',
      outfitName: 'Blouse Pastel',
      outfitType: 'pink_cewe',
      accessoryId: 'none',
      shoesId: 'sneakers_putih',
    },
  },
  {
    id: 'friend_kevin',
    name: 'Kevin',
    username: '@kevin_chill',
    status: 'offline',
    lastSeen: '25 menit lalu',
    avatar: {
      name: 'Kevin',
      gender: 'cowok',
      skinColor: 'kuning',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'coklat',
      hairStyle: 'two_block',
      hairColor: '#18181b',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'hoodie_oversize',
      outfitName: 'Hoodie Hitam',
      outfitType: 'biru_cowo',
      accessoryId: 'none',
      shoesId: 'sneakers_putih',
    },
  },
];

const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req_ayla',
    name: 'Ayla',
    username: '@ayla_berry',
    mutualFriends: 3,
    note: 'Hai! Ketemu di Aquarium tadi 🦈✨',
    avatar: {
      name: 'Ayla',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'bulat',
      eyeType: 'gemoy',
      eyeColor: 'pink',
      hairStyle: 'lurus_panjang',
      hairColor: '#be185d',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'dress_pantai',
      outfitName: 'Dress Pastel',
      outfitType: 'pink_cewe',
      accessoryId: 'cat_ears',
      shoesId: 'sneakers_putih',
    },
  },
  {
    id: 'req_fajar',
    name: 'Fajar',
    username: '@fajar_vibe',
    mutualFriends: 2,
    note: 'Ayo mabar ke Pasar Malam! 🎡',
    avatar: {
      name: 'Fajar',
      gender: 'cowok',
      skinColor: 'kuning',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'hitam',
      hairStyle: 'two_block',
      hairColor: '#18181b',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'crewneck_abu',
      outfitName: 'Crewneck',
      outfitType: 'biru_cowo',
      accessoryId: 'none',
      shoesId: 'sneakers_putih',
    },
  },
];

function isSoftwareWebGLRenderer(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return false;
    const rendererStr = String(
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
    ).toLowerCase();
    return (
      rendererStr.includes('swiftshader') ||
      rendererStr.includes('llvmpipe') ||
      rendererStr.includes('software') ||
      rendererStr.includes('microsoft basic render')
    );
  } catch {
    return false;
  }
}

function toAvatarState(config: AvatarConfig): AvatarState {
  return {
    name: config.gender === 'cewek' ? 'Ayu' : 'Faiz',
    gender: config.gender,
    skinColor: config.skinColor === '#fff0ea' ? 'putih' : 'kuning',
    faceShape: 'bulat',
    eyeType: 'gemoy',
    eyeColor: 'pink',
    hairStyle: config.hairStyle || (config.gender === 'cowok' ? 'cowo_two_block' : 'cewe_long_hair'),
    hairColor: config.hairColor,
    eyebrows: 'tipis',
    mouth: 'senyum',
    blush: 'pink',
    height: 'tinggi',
    outfitId: config.outfitId || config.top || 'kaos_polos_putih',
    outfitName: 'Setelan Kartun',
    outfitType: config.gender === 'cewek' ? 'pink_cewe' : 'biru_cowo',
    accessoryId: config.accessoryId || config.accessory || 'none',
    shoesId: config.shoes || 'sendal_jepit_coklat',
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'loading' | 'home' | 'world'>('loading');
  const [currentLocation, setCurrentLocation] = useState<GameWorldLocation>('taman');
  const [coins, setCoins] = useState<number>(1000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);

  // Avatar Configuration (OUTFIT AWAL GRATIS: Kaos Polos Putih + Celana Pendek Biru Muda + Sendal Jepit Coklat)
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    gender: 'cewek',
    ageGroup: 'dewasa',
    skinColor: '#fff0ea',
    hairStyle: 'cewe_long_hair',
    hairColor: '#18181b',
    top: 'kaos_polos_putih',
    bottom: 'celana_pendek_biru_muda',
    shoes: 'sendal_jepit_coklat',
    hat: 'none',
    glasses: 'none',
    accessory: 'none',
    outfitId: 'kaos_polos_putih',
    shirtColor: '#ffffff',
    pantsColor: '#93c5fd',
    shoesColor: '#78350f',
    accessoryId: 'none',
    heldItem: 'none',
    faceExpression: 'senyum',
  });

  // Food / Drink Held Item State (100% -> 0%)
  const [heldFood, setHeldFood] = useState<HeldFoodItem | null>(null);
  const [heldBalloon, setHeldBalloon] = useState<string | null>(null);

  // Sitting / Riding States + live Ref mirror for animation loop
  const [isSitting, setIsSitting] = useState<boolean>(false);
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [swingSpeed, setSwingSpeed] = useState<number>(1);
  const [isSwimming, setIsSwimming] = useState<boolean>(false);
  const [isRidingJetski, setIsRidingJetski] = useState<boolean>(false);
  const [isRidingBumperCar, setIsRidingBumperCar] = useState<boolean>(false);
  const [isOnFerrisWheel, setIsOnFerrisWheel] = useState<boolean>(false);
  const [isOnCarousel, setIsOnCarousel] = useState<boolean>(false);

  const liveActivityRef = useRef({
    isSitting: false,
    isSwinging: false,
    swingSpeed: 1,
    isSwimming: false,
    isRidingJetski: false,
    isRidingBumperCar: false,
    isOnFerrisWheel: false,
    isOnCarousel: false,
  });

  useEffect(() => {
    liveActivityRef.current = {
      isSitting,
      isSwinging,
      swingSpeed,
      isSwimming,
      isRidingJetski,
      isRidingBumperCar,
      isOnFerrisWheel,
      isOnCarousel,
    };
  }, [
    isSitting,
    isSwinging,
    swingSpeed,
    isSwimming,
    isRidingJetski,
    isRidingBumperCar,
    isOnFerrisWheel,
    isOnCarousel,
  ]);

  // Friends & Chat States (Shared across Beranda & 3D Worlds)
  const [friends, setFriends] = useState<FriendEntry[]>(INITIAL_FRIENDS);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(INITIAL_FRIEND_REQUESTS);
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(false);
  const [activeChatChannel, setActiveChatChannel] = useState<string>('room');
  const [unreadChatCount, setUnreadChatCount] = useState<number>(2);

  // Active NPC Nearby
  const [activeNPC, setActiveNPC] = useState<NPCPlayer | null>(null);
  const [npcChatBubble, setNpcChatBubble] = useState<{ name: string; text: string } | null>(null);

  // Modals
  const [infoModal, setInfoModal] = useState<{ title: string; text: string; icon: string } | null>(null);
  const [showWardrobe, setShowWardrobe] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isPhotoBoothOpen, setIsPhotoBoothOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Three.js Scene Refs
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarModelRef = useRef<AvatarModel | null>(null);
  const activeSceneCleanupRef = useRef<(() => void) | null>(null);
  const activeSceneUpdateRef = useRef<((time: number, extra?: any) => void) | null>(null);
  const activeNPCManagerRef = useRef<ReturnType<typeof spawnWorldNPCs> | null>(null);

  // Player Kinematics & Spatial Audio/Ride Timers
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const targetYawRef = useRef<number>(0);
  const isJumping = useRef<boolean>(false);
  const jumpVelocity = useRef<number>(0);
  const swingTimeRef = useRef<number>(0);
  const stepTimerRef = useRef<number>(0);
  const bumperBumpCooldownRef = useRef<number>(0);

  // Camera Orbit (Free 360° Horizontal & Vertical Look, zero rubber-band lag, damped follow distance & position)
  const cameraOrbitAngle = useRef<number>(0);
  const cameraPitchAngle = useRef<number>(0.02);
  const cameraDampedTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraCurrentDistRef = useRef<number>(6.0);
  const activeOrbitPointerId = useRef<number | null>(null);
  const lastPointerX = useRef<number>(0);
  const lastPointerY = useRef<number>(0);

  // Touch Virtual Joystick
  const joystickCenter = useRef<{ x: number; y: number } | null>(null);
  const joystickDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);

  // Keyboard & Interaction Targets
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const activeInteractionsRef = useRef<InteractionTarget[]>([]);
  const [nearbyInteraction, setNearbyInteraction] = useState<InteractionTarget | null>(null);
  const lastNearbyIdRef = useRef<string | null>(null);
  const lastNpcIdRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const avatarState = useMemo(() => toAvatarState(avatarConfig), [avatarConfig]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Sync live wardrobe changes & photo booth pose expression into active world avatar
  useEffect(() => {
    avatarModelRef.current?.updateWardrobe(avatarConfig);
  }, [avatarConfig]);

  useEffect(() => {
    if (isPhotoBoothOpen) {
      avatarModelRef.current?.setTempExpression('kedip_satu');
    } else {
      avatarModelRef.current?.setTempExpression(null);
    }
  }, [isPhotoBoothOpen]);

  // Ambient Soundscape per Location (only while inside a 3D world)
  useEffect(() => {
    if (currentScreen === 'world') {
      sound.startAmbience(currentLocation);
    } else {
      sound.stopAmbience();
    }
    return () => {
      sound.stopAmbience();
    };
  }, [currentScreen, currentLocation]);

  // Reset sitting/riding when changing world
  const enterWorld = (loc: GameWorldLocation) => {
    sound.playDoor();
    setIsSitting(false);
    setIsSwinging(false);
    setIsSwimming(false);
    setIsRidingJetski(false);
    setIsRidingBumperCar(false);
    setIsOnFerrisWheel(false);
    setIsOnCarousel(false);
    setNearbyInteraction(null);
    setActiveNPC(null);
    setNpcChatBubble(null);
    lastNearbyIdRef.current = null;
    lastNpcIdRef.current = null;
    setCurrentLocation(loc);
    setCurrentScreen('world');
  };

  // Jump Action
  const handleJump = () => {
    if (
      liveActivityRef.current.isSitting ||
      liveActivityRef.current.isOnFerrisWheel ||
      liveActivityRef.current.isOnCarousel ||
      liveActivityRef.current.isRidingBumperCar
    ) {
      return;
    }
    if (!isJumping.current) {
      sound.playJump();
      isJumping.current = true;
      jumpVelocity.current = 0.22;
    }
  };

  // Stand Up Action
  const handleStandUp = () => {
    const wasElevated =
      liveActivityRef.current.isOnFerrisWheel ||
      liveActivityRef.current.isSwinging ||
      liveActivityRef.current.isOnCarousel ||
      liveActivityRef.current.isRidingBumperCar ||
      liveActivityRef.current.isSitting;
    setIsSitting(false);
    setIsSwinging(false);
    setIsRidingJetski(false);
    setIsRidingBumperCar(false);
    setIsOnFerrisWheel(false);
    setIsOnCarousel(false);
    setIsSwimming(false);
    if (wasElevated) {
      if (liveActivityRef.current.isOnFerrisWheel) {
        playerPos.current.set(0, 0, -10.5);
      } else if (liveActivityRef.current.isOnCarousel) {
        playerPos.current.set(-10.5, 0, -2);
      } else if (liveActivityRef.current.isRidingBumperCar) {
        playerPos.current.set(13, 0, 0.2);
      } else {
        playerPos.current.y = 0;
      }
    }
    avatarModelRef.current?.setSitConfig({ mode: 'bench', seatRelY: 0.45 });
    avatarModelRef.current?.setAnimation('idle');
    triggerToast('Kamu sudah berdiri! 🚶');
  };

  // Execute Context Interaction Target (Handles ALL IDs from sceneBuilder.ts)
  const executeInteraction = (target: InteractionTarget) => {
    sound.playPop();

    // 1. TAMAN KOTA INTERACTIONS
    if (target.id === 'swing_main') {
      sound.playSit();
      swingTimeRef.current = 0;
      setIsSitting(true);
      setIsSwinging(true);
      setSwingSpeed(1);
      avatarModelRef.current?.setSitConfig({ mode: 'swing', seatRelY: 0.50, swingPhase: 0 });
      avatarModelRef.current?.setAnimation('sit');
      triggerToast('Lagi main ayunan! Tekan tombol untuk ayun lebih kenceng! 🎡');
    } else if (target.id === 'balloon_vendor') {
      sound.playFanfare();
      setHeldBalloon('Balon Hati Pink 💖');
      triggerToast('Balon Hati Pink dibeli! Balon nempel goyang-goyang! 🎈');
    } else if (target.id === 'park_gazebo') {
      sound.playSit();
      playerPos.current.set(-11, 0.18, -2.4);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = Math.PI;
        avatarModelRef.current.setSitConfig({ mode: 'bench', seatRelY: 0.43 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      triggerToast('Santai di Gazebo Pergola sambil dengerin angin taman 🏡✨');
    } else if (target.id === 'park_pond') {
      sound.playCoin();
      setCoins((c) => c + 15);
      avatarModelRef.current?.setAnimation('wave');
      triggerToast('Kamu memberi makan ikan koi di kolam! +15 Koin Kebahagiaan 🐟✨');
    } else if (target.id === 'slide_main') {
      sound.playFanfare();
      playerPos.current.set(8.5, 0, -6.2);
      setCoins((c) => c + 10);
      triggerToast('Wushhh!! Serunya meluncur di perosotan taman! +10 Koin 🛝🎉');
    } else if (target.id === 'seesaw_main') {
      sound.playSit();
      playerPos.current.set(9.1, 0.25, -2.0);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = Math.PI / 2;
        avatarModelRef.current.setSitConfig({ mode: 'bench', seatRelY: 0.65 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      triggerToast('Naik jungkat-jungkit taman bareng teman! 🪵✨');
    } else if (target.id === 'bench_east' || target.id === 'bench_west') {
      sound.playSit();
      playerPos.current.set(target.x, 0, target.z);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y =
          target.id === 'bench_east' ? -Math.PI / 2 : Math.PI / 2;
        avatarModelRef.current.setSitConfig({ mode: 'bench', seatRelY: 0.69 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      triggerToast('Duduk santai di bangku taman sambil memandang bunga 🌸🪑');
    } else if (target.id === 'fountain') {
      sound.playCoin();
      setCoins((c) => c + 20);
      triggerToast('Melempar koin harapan ke Air Mancur Marmer! +20 Koin Hoki ⛲✨');
    } else if (target.id === 'icecream_cart') {
      if (coins < 25) {
        triggerToast('Koin tidak cukup! Butuh 25 Koin untuk es krim. 🪙');
        return;
      }
      sound.playEat();
      setCoins((c) => c - 25);
      setHeldFood({
        id: 'ice_cream',
        name: 'Es Krim Matcha Stroberi 🍦',
        icon: '🍦',
        remainingPercent: 100,
        actionType: 'makan',
      });
      avatarModelRef.current?.setHeldItem('ice_cream');
      triggerToast('Beli Es Krim! Klik MAKAN untuk menghabiskan! 🍦');
    }

    // 2. PANTAI SUNSET INTERACTIONS
    else if (target.id === 'ocean_swim') {
      playerPos.current.set(0, -0.25, -8.5);
      setIsSitting(false);
      setIsSwimming(true);
      avatarModelRef.current?.setAnimation('swim');
      triggerToast('Berenang di laut biru segar! Jalan ke pantai atau klik Berdiri untuk naik 🏊🌊');
    } else if (target.id === 'jetski_dock') {
      sound.playFanfare();
      playerPos.current.set(-10.5, 0.15, -7.5);
      setIsSitting(false);
      setIsRidingJetski(true);
      avatarModelRef.current?.setSitConfig({ mode: 'bumper', seatRelY: 0.42, steerAngle: 0 });
      avatarModelRef.current?.setAnimation('sit');
      triggerToast('Naik Jetski! Kendarai keliling laut kencang dengan joystick! 🚤💨');
    } else if (target.id === 'coconut_stall') {
      if (coins < 20) {
        triggerToast('Koin tidak cukup! Butuh 20 Koin untuk es kelapa. 🪙');
        return;
      }
      sound.playEat();
      setCoins((c) => c - 20);
      setHeldFood({
        id: 'coconut',
        name: 'Es Kelapa Muda Batok 🥥',
        icon: '🥥',
        remainingPercent: 100,
        actionType: 'minum',
      });
      triggerToast('Beli Es Kelapa Muda! Klik MINUM untuk menghabiskan! 🥥🌴');
    } else if (target.id === 'snorkel_coral') {
      setCoins((c) => c + 25);
      setInfoModal({
        title: 'Snorkeling Terumbu Karang 🤿',
        text: 'Menyelam di antara terumbu karang warna-warni! Kamu melihat kawanan ikan badut ceria dan penyu laut purba yang berenang anggun! (+25 Koin Eksplorasi)',
        icon: '🤿',
      });
    } else if (target.id === 'lounger_left' || target.id === 'lounger_right') {
      sound.playSit();
      if (target.id === 'lounger_left') {
        playerPos.current.set(-13.35, 0.3, 6.25);
        if (avatarModelRef.current) {
          avatarModelRef.current.group.rotation.y = 0;
          avatarModelRef.current.setAnimation('sleep');
        }
      } else {
        playerPos.current.set(10.35, 0, 5.25);
        if (avatarModelRef.current) {
          avatarModelRef.current.group.rotation.y = Math.PI;
          avatarModelRef.current.setSitConfig({ mode: 'sand', seatRelY: 0.36 });
          avatarModelRef.current.setAnimation('sit');
        }
      }
      setIsSitting(true);
      triggerToast('Santai di kursi pantai menikmati sunset emas! 🏖️☀️');
    }

    // 3. CAFE COZY INTERACTIONS
    else if (target.id === 'cafe_barista') {
      if (coins < 30) {
        triggerToast('Koin tidak cukup! Butuh 30 Koin untuk kopi latte. 🪙');
        return;
      }
      sound.playEat();
      setCoins((c) => c - 30);
      setHeldFood({
        id: 'latte',
        name: 'Kopi Latte Hangat ☕',
        icon: '☕',
        remainingPercent: 100,
        actionType: 'minum',
      });
      avatarModelRef.current?.setHeldItem('tea_cup');
      triggerToast('Kopi Latte siap dinikmati! Klik MINUM untuk menyeruput! ☕✨');
    } else if (target.id === 'cafe_date') {
      sound.playSit();
      playerPos.current.set(3.45, 0, -5);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = Math.PI / 2;
        avatarModelRef.current.setSitConfig({ mode: 'cafe_cup', seatRelY: 0.62 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      setInfoModal({
        title: 'Meja Ngedate Berdua 🌹',
        text: 'Duduk berdua di meja romantis dengan vas bunga mawar merah. "Terima kasih sudah menemani aku ngopi hari ini ya! 💖"',
        icon: '🌹',
      });
    } else if (target.id === 'cafe_study') {
      sound.playSit();
      playerPos.current.set(-4.55, 0, 4);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = Math.PI / 2;
        avatarModelRef.current.setSitConfig({ mode: 'cafe_cup', seatRelY: 0.62 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      setCoins((c) => c + 50);
      triggerToast('Buka laptop & nugas produktif! +50 Koin Bonus! 💻✨');
    } else if (target.id === 'cafe_sofa') {
      sound.playSit();
      playerPos.current.set(-11, 0, 5);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = Math.PI / 2;
        avatarModelRef.current.setSitConfig({ mode: 'bench', seatRelY: 0.62 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      triggerToast('Duduk empuk di sofa cafe sambil dengerin musik lofi 🛋️🎶');
    } else if (target.id === 'cafe_window_seat' || target.id === 'cafe_window') {
      sound.playSit();
      playerPos.current.set(6.55, 0, 9);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = -Math.PI / 2;
        avatarModelRef.current.setSitConfig({ mode: 'cafe_cup', seatRelY: 0.62 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      triggerToast('Me Time... Menikmati kopi hangat di pojok jendela ☕🍃');
    }

    // 4. AQUARIUM UNDERWATER INTERACTIONS
    else if (target.id === 'view_shark') {
      setInfoModal({
        title: 'Hiu Putih & Hiu Martil Samudra 🦈',
        text: 'Panjang 3.5 - 4.2 meter. Penguasa puncak samudera dengan indra navigasi magnetik luar biasa. Berenang anggun tepat di atas terowongan kaca transparan!',
        icon: '🦈',
      });
    } else if (target.id === 'view_clownfish') {
      setInfoModal({
        title: 'Kawanan Ikan Badut & Anemon 🐠',
        text: 'Panjang 10 - 15 cm. Memiliki hubungan simbiotik erat dengan anemon laut. Berenang lincah di sela terumbu karang warna-warni!',
        icon: '🐠',
      });
    } else if (target.id === 'turtle_watch') {
      setInfoModal({
        title: 'Penyu Hijau Raksasa (Chelonia mydas) 🐢',
        text: 'Penyu purba laut yang mampu mengarungi ribuan mil samudra! Berenang anggun dengan sirip depan yang mengepak bak sayap di air biru.',
        icon: '🐢',
      });
    } else if (target.id === 'aquarium_date') {
      sound.playSit();
      playerPos.current.set(0, 0, 1.8);
      if (avatarModelRef.current) {
        avatarModelRef.current.group.rotation.y = Math.PI;
        avatarModelRef.current.setSitConfig({ mode: 'bench', seatRelY: 0.55 });
        avatarModelRef.current.setAnimation('sit');
      }
      setIsSitting(true);
      triggerToast('Duduk berdua di bawah terowongan kaca aquarium! 💖🦈');
    } else if (target.id === 'feed_fish') {
      sound.playCoin();
      setCoins((c) => c + 20);
      avatarModelRef.current?.setAnimation('wave');
      triggerToast('Feeding Time! Ikan-ikan berkumpul makan pelet udang! +20 Koin 🦐✨');
    }

    // 5. PASAR MALAM INTERACTIONS
    else if (target.id === 'ferris_wheel') {
      sound.playFanfare();
      setIsOnCarousel(false);
      setIsRidingBumperCar(false);
      setIsOnFerrisWheel(true);
      setIsSitting(true);
      avatarModelRef.current?.setSitConfig({ mode: 'ferris', seatRelY: 0.34 });
      avatarModelRef.current?.setAnimation('sit');
      triggerToast('Naik Bianglala Raksasa! Pemandangan lampu kota terlihat dari atas! 🎡✨');
    } else if (target.id === 'carousel') {
      sound.playFanfare();
      setIsOnFerrisWheel(false);
      setIsRidingBumperCar(false);
      setIsOnCarousel(true);
      setIsSitting(true);
      avatarModelRef.current?.setSitConfig({ mode: 'carousel', seatRelY: 0.48 });
      avatarModelRef.current?.setAnimation('sit');
      triggerToast('Naik Kuda Komidi Putar! Berputar meriah kelap-kelip! 🎠✨');
    } else if (target.id === 'haunted_house') {
      sound.playJump();
      setCoins((c) => c + 100);
      setInfoModal({
        title: 'Rumah Hantu Misteri 👻',
        text: 'BOO!! Hantu lucu melompat kaget! Kamu berhasil menyelesaikan uji nyali dan mendapatkan hadiah +100 Koin! 🎃🎉',
        icon: '👻',
      });
    } else if (target.id === 'carnival_toss') {
      sound.playFanfare();
      setCoins((c) => c + 30);
      avatarModelRef.current?.setHeldItem('bear_plushie');
      setInfoModal({
        title: 'Lempar Bola Kaleng ⚾',
        text: 'STRIKE! Lemparan bola kamu tepat sasaran merobohkan susunan kaleng! Kamu memenangkan +30 Koin & Boneka Beruang 🧸!',
        icon: '🧸',
      });
    } else if (target.id === 'food_sosis' || target.id === 'night_market_food') {
      sound.playEat();
      setCoins((c) => Math.max(0, c - 20));
      setHeldFood({
        id: 'sosis_bakar',
        name: 'Sosis Bakar Jumbo BBQ 🌭',
        icon: '🌭',
        remainingPercent: 100,
        actionType: 'makan',
      });
      triggerToast('Beli Sosis Bakar Jumbo! Klik MAKAN untuk menghabiskan! 🌭😋');
    } else if (target.id === 'food_cilok') {
      sound.playEat();
      setCoins((c) => Math.max(0, c - 15));
      setHeldFood({
        id: 'cilok',
        name: 'Cilok Kenyal Bumbu Kacang 🍢',
        icon: '🍢',
        remainingPercent: 100,
        actionType: 'makan',
      });
      triggerToast('Beli Cilok Bumbu Kacang! Klik MAKAN untuk menghabiskan! 🍢🔥');
    } else if (target.id === 'food_jagung') {
      sound.playEat();
      setCoins((c) => Math.max(0, c - 15));
      setHeldFood({
        id: 'jagung_bakar',
        name: 'Jagung Bakar Mentega Manis 🌽',
        icon: '🌽',
        remainingPercent: 100,
        actionType: 'makan',
      });
      triggerToast('Beli Jagung Bakar Manis! Klik MAKAN untuk menghabiskan! 🌽✨');
    } else if (target.id === 'food_esteh') {
      sound.playEat();
      setCoins((c) => Math.max(0, c - 10));
      setHeldFood({
        id: 'es_teh',
        name: 'Es Teh Manis Jumbo & Boba 🧋',
        icon: '🧋',
        remainingPercent: 100,
        actionType: 'minum',
      });
      triggerToast('Beli Es Teh Jumbo! Klik MINUM untuk menyeruput segar! 🧋✨');
    } else if (target.id === 'food_gulali') {
      sound.playEat();
      setCoins((c) => Math.max(0, c - 15));
      setHeldFood({
        id: 'gulali',
        name: 'Gulali Arum Manis Pink 🍭',
        icon: '🍭',
        remainingPercent: 100,
        actionType: 'makan',
      });
      triggerToast('Beli Gulali Kapas Pink Manis! Klik MAKAN untuk menikmati! 🍭💖');
    } else if (target.id === 'bumper_cars') {
      sound.playFanfare();
      setCoins((c) => c + 30);
      setIsOnFerrisWheel(false);
      setIsOnCarousel(false);
      setIsRidingBumperCar(true);
      setIsSitting(true);
      playerPos.current.set(13, 0.25, 4.2);
      avatarModelRef.current?.setSitConfig({ mode: 'bumper', seatRelY: 0.34, steerAngle: 0 });
      avatarModelRef.current?.setAnimation('sit');
      triggerToast('Naik Bom-Bom Car! Kemudikan pakai Joystick / WASD di arena neon! (+30 Koin 🚗⚡)');
    } else if (target.id === 'claw_machine') {
      if (coins < 15) {
        triggerToast('Koin tidak cukup! Butuh 15 Koin untuk main capit boneka. 🪙');
        return;
      }
      sound.playFanfare();
      setCoins((c) => c - 15);
      avatarModelRef.current?.setHeldItem('bear_plushie');
      setInfoModal({
        title: 'Mesin Capit Boneka Gemoy 🧸',
        text: 'YEAY!! Capit besi berhasil mengangkat Boneka Beruang Pink super lembut! Boneka sekarang dibawa oleh avatarmu! 🧸✨',
        icon: '🧸',
      });
    } else if (target.id === 'live_stage') {
      sound.playFanfare();
      setCoins((c) => c + 25);
      avatarModelRef.current?.setAnimation('dance');
      triggerToast('Joget & nyanyi di depan panggung musik! +25 Koin! 🎤🎸🎉');
    } else {
      sound.playSit();
      setIsSitting(true);
      avatarModelRef.current?.setSitConfig({ mode: 'sand', seatRelY: 0.04 });
      avatarModelRef.current?.setAnimation('sit');
      triggerToast('Duduk santai menikmati suasana sekitar! 🪑');
    }
  };

  // Keyboard listener (always uses fresh nearbyInteraction)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isChatOpen || isFriendsOpen || showWardrobe || isTransferOpen) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.code === 'Space') {
        handleJump();
      }
      if (e.key.toLowerCase() === 'e' && nearbyInteraction) {
        executeInteraction(nearbyInteraction);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyInteraction, isChatOpen, isFriendsOpen, showWardrobe, isTransferOpen, coins]);

  // Consume Food or Drink (100% -> 0%)
  const handleConsumeFood = () => {
    if (!heldFood) return;
    sound.playEat();
    const nextPct = heldFood.remainingPercent - 25;

    if (nextPct <= 0) {
      setHeldFood(null);
      avatarModelRef.current?.setHeldItem('none');
      triggerToast(`Nyam nyam! ${heldFood.name} sudah habis dinikmati! 😋✨`);
    } else {
      setHeldFood({
        ...heldFood,
        remainingPercent: nextPct,
      });
      triggerToast(`${heldFood.actionType === 'makan' ? 'Makan' : 'Minum'}! Sisa: ${nextPct}%`);
    }
  };

  // Release Balloon Action
  const handleReleaseBalloon = () => {
    sound.playPop();
    setHeldBalloon(null);
    triggerToast('Balon dilepaskan terbang bebas ke langit! 🎈✨');
  };

  // Friends Actions
  const handleAcceptRequest = (reqId: string) => {
    const req = friendRequests.find((r) => r.id === reqId);
    if (!req) return;
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    setFriends((prev) => [
      {
        id: `friend_${req.id}`,
        name: req.name,
        username: req.username,
        avatar: req.avatar,
        status: 'online',
      },
      ...prev,
    ]);
    triggerToast(`${req.name} resmi jadi temanmu sekarang! 🤝✨`);
  };

  const handleDeclineRequest = (reqId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    triggerToast('Permintaan pertemanan ditolak.');
  };

  const handleAddFriend = (player: Omit<FriendEntry, 'status'>) => {
    setFriends((prev) => {
      if (prev.some((f) => f.username === player.username)) return prev;
      return [{ ...player, status: 'playing' }, ...prev];
    });
    triggerToast(`Berhasil menambahkan ${player.name} ke daftar Teman! 🎉`);
  };

  const handleRemoveFriend = (friendId: string) => {
    const target = friends.find((f) => f.id === friendId);
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    if (activeChatChannel === friendId) {
      setActiveChatChannel('room');
    }
    if (target) {
      triggerToast(`${target.name} dihapus dari daftar teman.`);
    }
  };

  // Three.js World Initialization (Only when currentScreen === 'world')
  useEffect(() => {
    if (currentScreen !== 'world' || !canvasMountRef.current) return;

    const mount = canvasMountRef.current;
    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 700;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 160);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    const isSoftware = isSoftwareWebGLRenderer(renderer);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSoftware ? 1 : 1.75));
    renderer.shadowMap.enabled = !isSoftware;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x64748b, 0.62);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 0.95);
    dirLight.position.set(12, 20, 12);
    dirLight.castShadow = !isSoftware;
    dirLight.shadow.mapSize.width = isSoftware ? 512 : 1024;
    dirLight.shadow.mapSize.height = isSoftware ? 512 : 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 65;
    dirLight.shadow.camera.left = -26;
    dirLight.shadow.camera.right = 26;
    dirLight.shadow.camera.top = 26;
    dirLight.shadow.camera.bottom = -26;
    scene.add(dirLight);

    const avatar = new AvatarModel(avatarConfig);
    avatarModelRef.current = avatar;
    scene.add(avatar.group);

    // BUILD CURRENT 3D WORLD
    if (currentLocation === 'taman') {
      const park = buildParkScene(scene);
      activeInteractionsRef.current = park.interactions;
      activeSceneUpdateRef.current = park.update;
      activeSceneCleanupRef.current = park.cleanup;
      scene.background = new THREE.Color(0xbae6fd);
      scene.fog = new THREE.Fog(0xbae6fd, 38, 95);
    } else if (currentLocation === 'pantai') {
      const beach = buildBeachScene(scene);
      activeInteractionsRef.current = beach.interactions;
      activeSceneUpdateRef.current = beach.update;
      activeSceneCleanupRef.current = beach.cleanup;
      scene.background = new THREE.Color(0xfb923c);
      scene.fog = new THREE.Fog(0xfdba74, 38, 95);
    } else if (currentLocation === 'cafe') {
      const cafe = buildCafeScene(scene);
      activeInteractionsRef.current = cafe.interactions;
      activeSceneUpdateRef.current = cafe.update;
      activeSceneCleanupRef.current = cafe.cleanup;
      hemiLight.intensity = 0.48;
      dirLight.intensity = 0.55;
      scene.environmentIntensity = 0.25;
      scene.background = new THREE.Color(0x291206);
      scene.fog = null;
    } else if (currentLocation === 'aquarium') {
      const aq = buildAquariumScene(scene);
      activeInteractionsRef.current = aq.interactions;
      activeSceneUpdateRef.current = aq.update;
      activeSceneCleanupRef.current = aq.cleanup;
      hemiLight.color.setHex(0x38bdf8);
      hemiLight.groundColor.setHex(0x082f49);
      hemiLight.intensity = 0.52;
      dirLight.intensity = 0.45;
      scene.environmentIntensity = 0.28;
      scene.background = new THREE.Color(0x020b18);
      scene.fog = new THREE.Fog(0x041e38, 22, 62);
    } else if (currentLocation === 'pasar_malam') {
      const pm = buildNightMarketScene(scene);
      activeInteractionsRef.current = pm.interactions;
      activeSceneUpdateRef.current = pm.update;
      activeSceneCleanupRef.current = pm.cleanup;
      hemiLight.color.setHex(0x94a3b8);
      hemiLight.groundColor.setHex(0x0f172a);
      hemiLight.intensity = 0.45;
      dirLight.intensity = 0.55;
      scene.environmentIntensity = 0.25;
      scene.background = new THREE.Color(0x090d1a);
      scene.fog = new THREE.Fog(0x0f172a, 34, 88);
    }

    const npcMgr = spawnWorldNPCs(scene, currentLocation);
    activeNPCManagerRef.current = npcMgr;

    const spawnZMap: Record<GameWorldLocation, number> = {
      taman: 5.2,
      pantai: 2.8,
      cafe: 2.0,
      aquarium: 4.0,
      pasar_malam: 2.5,
    };
    const startZ = spawnZMap[currentLocation] ?? 2;
    playerPos.current.set(0, 0, startZ);
    cameraDampedTargetRef.current.copy(playerPos.current);
    cameraCurrentDistRef.current = 6.0;
    targetYawRef.current = 0;

    // Pre-compile shaders upfront to eliminate first-turn frame hitch
    camera.position.set(0, 2.5, startZ + 6.0);
    camera.lookAt(0, 1.45, startZ);
    renderer.compile(scene, camera);

    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();
      const act = liveActivityRef.current;

      // Kinematics Input
      let inputX = joystickDelta.current.x;
      let inputZ = joystickDelta.current.y;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) inputZ -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) inputZ += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) inputX -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) inputX += 1;

      const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
      const isLockedRide = act.isOnFerrisWheel || act.isOnCarousel || act.isSwinging;
      const isMoving = inputLen > 0.15 && !isLockedRide;

      if (isMoving) {
        if (act.isSitting && !act.isRidingJetski && !act.isRidingBumperCar) {
          setIsSitting(false);
          setIsSwinging(false);
          playerPos.current.y = 0;
        }

        const normX = inputX / Math.max(1, inputLen);
        const normZ = inputZ / Math.max(1, inputLen);
        const moveSpeed = act.isRidingJetski
          ? 9.8
          : act.isRidingBumperCar
          ? 7.2
          : act.isSwimming
          ? 3.5
          : 5.4;

        const camAngle = cameraOrbitAngle.current;
        const rotatedX = normX * Math.cos(camAngle) + normZ * Math.sin(camAngle);
        const rotatedZ = -normX * Math.sin(camAngle) + normZ * Math.cos(camAngle);

        if (act.isRidingBumperCar) {
          // Constrain playable bumper car inside the arena centered at (13, 6) radius 4.7m
          let nx = playerPos.current.x + rotatedX * moveSpeed * delta;
          let nz = playerPos.current.z + rotatedZ * moveSpeed * delta;
          const dxA = nx - 13;
          const dzA = nz - 6;
          const rA = Math.hypot(dxA, dzA);
          if (rA > 4.65) {
            nx = 13 + (dxA / rA) * 4.55;
            nz = 6 + (dzA / rA) * 4.55;
            if (time - bumperBumpCooldownRef.current > 0.55) {
              bumperBumpCooldownRef.current = time;
              sound.playBump();
            }
          }
          playerPos.current.set(nx, 0.25, nz);
          const steerAngle = THREE.MathUtils.clamp(-normX * 0.65, -0.65, 0.65);
          avatar.setSitConfig({ mode: 'bumper', seatRelY: 0.34, steerAngle });
        } else {
          playerPos.current.x = THREE.MathUtils.clamp(
            playerPos.current.x + rotatedX * moveSpeed * delta,
            -24,
            24
          );
          playerPos.current.z = THREE.MathUtils.clamp(
            playerPos.current.z + rotatedZ * moveSpeed * delta,
            -24,
            24
          );

          // Exit swim smoothly if player walks back onto beach sand (z > 1.5)
          if (currentLocation === 'pantai' && act.isSwimming && playerPos.current.z > 1.5) {
            playerPos.current.y = 0;
            setIsSwimming(false);
            avatar.setAnimation('idle');
          }
        }

        targetYawRef.current = Math.atan2(rotatedX, rotatedZ);
        let diff = targetYawRef.current - avatar.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        avatar.group.rotation.y += diff * Math.min(1, delta * (act.isRidingBumperCar ? 8 : 14));
      } else if (act.isRidingBumperCar) {
        avatar.setSitConfig({ mode: 'bumper', seatRelY: 0.34, steerAngle: 0 });
      }

      // Surface-aware Footsteps while walking on foot
      if (
        isMoving &&
        !isJumping.current &&
        !act.isSwimming &&
        !act.isRidingJetski &&
        !act.isRidingBumperCar &&
        !act.isSitting
      ) {
        stepTimerRef.current += delta;
        if (stepTimerRef.current >= 0.34) {
          stepTimerRef.current = 0;
          let surf: FootstepSurface = 'stone';
          if (currentLocation === 'pantai') {
            surf = playerPos.current.z < 0.8 ? 'water' : 'sand';
          } else if (currentLocation === 'cafe') {
            surf = 'wood';
          } else if (currentLocation === 'aquarium') {
            surf = 'tile';
          } else if (currentLocation === 'taman') {
            const onPath =
              Math.hypot(playerPos.current.x, playerPos.current.z) < 7.5 ||
              Math.abs(playerPos.current.x) < 2.2 ||
              Math.abs(playerPos.current.z) < 2.2;
            surf = onPath ? 'stone' : 'grass';
          }
          sound.playStep(surf);
        }
      } else {
        stepTimerRef.current = 0.24;
      }

      // Jump Physics
      if (isJumping.current) {
        playerPos.current.y += jumpVelocity.current;
        jumpVelocity.current -= 0.015;
        if (playerPos.current.y <= 0) {
          playerPos.current.y = 0;
          isJumping.current = false;
        }
      }

      // Synchronized Live Ride / Swing Motion
      let swingOverrideAngle: number | undefined;
      if (act.isOnFerrisWheel) {
        const rotZ = time * 0.22;
        const cx = Math.cos(rotZ) * 9.6;
        const cy = 12 + Math.sin(rotZ) * 9.6;
        playerPos.current.set(cx, cy - 0.68, -15.7);
        avatar.group.rotation.y = 0;
      } else if (act.isOnCarousel) {
        const rotY = time * 0.7;
        const hy = 1.8 + Math.sin(time * 3) * 0.3;
        const wx = -15 + 4.3 * Math.cos(rotY);
        const wz = -2 - 4.3 * Math.sin(rotY);
        playerPos.current.set(wx, hy - 0.15, wz);
        avatar.group.rotation.y = rotY;
      } else if (act.isSwinging) {
        swingTimeRef.current += delta * (2.2 + (act.swingSpeed - 1) * 1.1);
        const amp = Math.min(0.74, 0.38 + (act.swingSpeed - 1) * 0.18);
        const theta = Math.sin(swingTimeRef.current) * amp;
        swingOverrideAngle = theta;
        const seatY = 3.8 - Math.cos(theta) * 3.04;
        const seatZ = 7.5 - Math.sin(theta) * 3.04;
        playerPos.current.set(-8.5, seatY - 0.50, seatZ);
        avatar.group.rotation.y = 0;
        avatar.setSitConfig({ mode: 'swing', seatRelY: 0.50, swingPhase: theta });
      } else if (act.isSwimming && currentLocation === 'pantai') {
        playerPos.current.y = -0.25 + Math.sin(time * 3.2) * 0.08;
      }

      avatar.group.position.copy(playerPos.current);
      avatar.update(time, isMoving && !act.isRidingBumperCar);

      if (activeSceneUpdateRef.current) {
        if (currentLocation === 'taman' && swingOverrideAngle !== undefined) {
          activeSceneUpdateRef.current(time, swingOverrideAngle);
        } else if (currentLocation === 'pasar_malam' && act.isRidingBumperCar) {
          activeSceneUpdateRef.current(time, {
            active: true,
            x: playerPos.current.x,
            z: playerPos.current.z,
            yaw: avatar.group.rotation.y,
          });
        } else {
          activeSceneUpdateRef.current(time);
        }
      }

      // 3D Spatial Audio Listener Follow
      sound.updateSpatialListener(
        playerPos.current.x,
        playerPos.current.z,
        cameraOrbitAngle.current,
        currentLocation
      );

      // Update NPCs & Automatic Facial Expressions
      let nearbyFriend: NPCPlayer | null = null;
      if (activeNPCManagerRef.current) {
        activeNPCManagerRef.current.update(time);
        nearbyFriend = activeNPCManagerRef.current.getNearbyNPC(playerPos.current, 2.8);
        const nextNpcId = nearbyFriend ? nearbyFriend.id : null;
        if (nextNpcId !== lastNpcIdRef.current) {
          lastNpcIdRef.current = nextNpcId;
          setActiveNPC(nearbyFriend);
        }
      }

      if (nearbyFriend) {
        avatar.setTempExpression('berbinar');
      } else if (isMoving) {
        avatar.setTempExpression('senyum');
      } else {
        avatar.setTempExpression(null);
      }

      // Proximity to interaction targets
      let closest: InteractionTarget | null = null;
      let minDist = 999;
      for (const t of activeInteractionsRef.current) {
        const dx = playerPos.current.x - t.x;
        const dz = playerPos.current.z - t.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= t.radius && dist < minDist) {
          minDist = dist;
          closest = t;
        }
      }
      const nextClosestId = closest ? closest.id : null;
      if (nextClosestId !== lastNearbyIdRef.current) {
        lastNearbyIdRef.current = nextClosestId;
        setNearbyInteraction(closest);
      }

      // Smooth 60 FPS Camera Follow Position & Zoom Damping + Crisp Manual 360° Free-Look
      const targetCamDist = act.isOnFerrisWheel
        ? 13.0
        : act.isRidingJetski
        ? 7.6
        : act.isRidingBumperCar
        ? 5.2
        : act.isSitting
        ? 4.65
        : 6.0;
      cameraCurrentDistRef.current = THREE.MathUtils.lerp(
        cameraCurrentDistRef.current,
        targetCamDist,
        Math.min(1, delta * 6.5)
      );
      const followRate = isLockedRide ? 1 : Math.min(1, delta * 14);
      cameraDampedTargetRef.current.lerp(playerPos.current, followRate);

      const camDist = cameraCurrentDistRef.current;
      const pitch = cameraPitchAngle.current; // Direct manual pitch (no auto-drift!)
      const yaw = cameraOrbitAngle.current; // Direct manual yaw (right->right, left->left)

      const walkBob =
        isMoving &&
        !isJumping.current &&
        !act.isSwimming &&
        !act.isRidingJetski &&
        !act.isRidingBumperCar
          ? Math.abs(Math.sin(time * 9.5)) * 0.042
          : 0;

      const horizDist = camDist * Math.cos(pitch * 0.45);
      const pivotY = cameraDampedTargetRef.current.y + 1.45 + walkBob;
      const camOffsetY = 0.75 - Math.sin(pitch) * 1.45;

      const desiredX = cameraDampedTargetRef.current.x + Math.sin(yaw) * horizDist;
      const desiredY = Math.max(0.45, pivotY + camOffsetY);
      const desiredZ = cameraDampedTargetRef.current.z + Math.cos(yaw) * horizDist;

      camera.position.set(desiredX, desiredY, desiredZ);

      const lookOffsetY = Math.sin(pitch) * 4.2;
      camera.lookAt(
        cameraDampedTargetRef.current.x,
        pivotY + lookOffsetY,
        cameraDampedTargetRef.current.z
      );

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (activeNPCManagerRef.current) {
        activeNPCManagerRef.current.cleanup();
      }
      if (activeSceneCleanupRef.current) {
        activeSceneCleanupRef.current();
      }
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      avatar.dispose();
      avatarModelRef.current = null;
    };
  }, [currentScreen, currentLocation]);

  // Touch Virtual Joystick Handlers
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.touches[0];
    joystickCenter.current = { x: touch.clientX, y: touch.clientY };
    setIsJoystickActive(true);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!joystickCenter.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenter.current.x;
    const dy = touch.clientY - joystickCenter.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 45;

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    joystickDelta.current = { x: clampedX / maxRadius, y: clampedY / maxRadius };
    setJoystickThumb({ x: clampedX, y: clampedY });
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    joystickCenter.current = null;
    joystickDelta.current = { x: 0, y: 0 };
    setJoystickThumb({ x: 0, y: 0 });
    setIsJoystickActive(false);
  };

  // Viewport Free Orbit Drag Handlers (Right->Right, Left->Left, Up->Up, Down->Down; isolated by pointerId)
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only start camera orbit when dragging the 3D viewport directly (never from HUD buttons or joystick)
    const targetEl = e.target as HTMLElement | null;
    if (targetEl && targetEl.closest('button, [data-no-orbit="true"]')) {
      return;
    }
    if (activeOrbitPointerId.current !== null) return;
    activeOrbitPointerId.current = e.pointerId;
    lastPointerX.current = e.clientX;
    lastPointerY.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handleViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeOrbitPointerId.current !== e.pointerId) return;
    const deltaX = e.clientX - lastPointerX.current;
    const deltaY = e.clientY - lastPointerY.current;
    lastPointerX.current = e.clientX;
    lastPointerY.current = e.clientY;

    // Right swipe (deltaX > 0) turns screen right; Left swipe turns screen left
    cameraOrbitAngle.current -= deltaX * 0.0085;
    // Up swipe (deltaY < 0) tilts screen UP (+pitch); Down swipe tilts screen DOWN (-pitch)
    cameraPitchAngle.current = Math.max(
      -0.85,
      Math.min(0.85, cameraPitchAngle.current - deltaY * 0.0065)
    );
  };

  const handleViewportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeOrbitPointerId.current !== e.pointerId) return;
    activeOrbitPointerId.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // SCREEN 1: LOADING MASUK GAME
  if (currentScreen === 'loading') {
    return <GameLoadingScreen onFinish={() => setCurrentScreen('home')} />;
  }

  const currentWorldInfo = WORLD_NAMES[currentLocation] || {
    title: 'DUNIA KOTA',
    icon: '🏙️',
  };
  const onlineFriendsCount = friends.filter((f) => f.status !== 'offline').length;

  return (
    <>
      {/* SCREEN 2: BERANDA (HOME 2D) */}
      {currentScreen === 'home' && (
        <HomeDashboard
          avatar={avatarState}
          coins={coins}
          friendRequestsCount={friendRequests.length}
          onlineFriendsCount={onlineFriendsCount}
          unreadChatCount={unreadChatCount}
          onEnterWorld={enterWorld}
          onOpenAvatarCreator={() => {
            sound.playClick();
            setShowWardrobe(true);
          }}
          onOpenChat={() => {
            sound.playClick();
            setUnreadChatCount(0);
            setIsChatOpen(true);
          }}
          onOpenProfile={() => {
            sound.playClick();
            setIsProfileOpen(true);
          }}
          onOpenFriends={() => {
            sound.playClick();
            setIsFriendsOpen(true);
          }}
        />
      )}

      {/* SCREEN 3: DUNIA 3D (WORLD GAMEPLAY) */}
      {currentScreen === 'world' && (
        <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col font-['Quicksand'] select-none overflow-hidden">
          {/* TOP APP BAR DALAM DUNIA */}
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 z-30 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentScreen('home');
                }}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-black px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0"
              >
                <span>◀</span>
                <span className="hidden sm:inline">Kembali ke Beranda</span>
                <span className="sm:hidden">Beranda</span>
              </button>

              <div className="bg-slate-800 px-2.5 py-1 rounded-full border border-pink-500/40 text-[11px] font-black text-pink-300 flex items-center gap-1 truncate">
                <span>{currentWorldInfo.icon}</span>
                <span className="truncate">{currentWorldInfo.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <span>🪙</span>
                <span>{coins.toLocaleString()}</span>
              </div>

              <button
                onClick={() => {
                  const next = !soundEnabled;
                  sound.setEnabled(next);
                  setSoundEnabled(next);
                  triggerToast(next ? 'Suara lingkungan aktif 🔊' : 'Suara dimatikan 🔇');
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 shadow-md cursor-pointer active:scale-90"
                title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setIsFriendsOpen(true);
                }}
                className="relative w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs border border-slate-700 shadow-md cursor-pointer active:scale-90"
                title="Menu Teman"
              >
                <span>👥</span>
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
                    {friendRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setUnreadChatCount(0);
                  setIsChatOpen(true);
                }}
                className="relative w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs border border-slate-700 shadow-md cursor-pointer active:scale-90"
                title="Buka Chat"
              >
                <span>💬</span>
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1 rounded-full">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  avatarModelRef.current?.setAnimation('wave');
                  triggerToast('Melambai ramah! 👋✨');
                }}
                className="hidden sm:flex w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white items-center justify-center text-xs border border-slate-700 shadow-md cursor-pointer active:scale-90"
                title="Melambai"
              >
                👋
              </button>

              <button
                onClick={() => {
                  sound.playFanfare();
                  avatarModelRef.current?.setAnimation('dance');
                  triggerToast('Joget riang gembira! 💃🎉');
                }}
                className="hidden sm:flex w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white items-center justify-center text-xs border border-slate-700 shadow-md cursor-pointer active:scale-90"
                title="Joget"
              >
                💃
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setShowWardrobe(true);
                }}
                className="px-2.5 h-8 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 text-white flex items-center gap-1 text-xs font-black shadow-md cursor-pointer active:scale-90"
                title="Buka Lemari / Ganti Baju"
              >
                <span>👗</span>
                <span className="hidden sm:inline">Lemari</span>
              </button>
            </div>
          </div>

          {/* 3D GAMEPLAY VIEWPORT */}
          <div
            onPointerDown={handleViewportPointerDown}
            onPointerMove={handleViewportPointerMove}
            onPointerUp={handleViewportPointerUp}
            onPointerCancel={handleViewportPointerUp}
            onPointerLeave={handleViewportPointerUp}
            className="flex-1 relative w-full h-full overflow-hidden touch-none"
          >
            <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Camera Orbit Hint */}
            <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-slate-900/85 text-[10px] text-slate-300 font-bold px-3 py-1 rounded-full border border-white/10 shadow-sm items-center gap-1.5 select-none">
              <span className="text-pink-400">🔄</span>
              <span>Geser layar untuk putar kamera 360° • WASD / Joystick untuk jalan</span>
            </div>

            {/* HELD FOOD / DRINK HUD */}
            {heldFood && (
              <div className="absolute top-3 right-3 z-40 bg-slate-900/95 border border-pink-500/50 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5 max-w-[190px]">
                <div className="flex items-center gap-1.5 text-xs font-black text-white truncate">
                  <span>{heldFood.icon}</span>
                  <span className="truncate">{heldFood.name}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-emerald-400 h-full transition-all duration-200"
                    style={{ width: `${heldFood.remainingPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
                  <span>Sisa: {heldFood.remainingPercent}%</span>
                </div>
                <button
                  onClick={handleConsumeFood}
                  className="w-full py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[11px] rounded-xl shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 uppercase"
                >
                  <span>{heldFood.actionType === 'makan' ? 'MAKAN 🍴' : 'MINUM 🥤'}</span>
                </button>
              </div>
            )}

            {/* HELD BALLOON HUD */}
            {heldBalloon && (
              <div className="absolute top-28 right-3 z-40 bg-slate-900/95 border border-sky-400/50 p-2 rounded-2xl shadow-xl flex items-center gap-2">
                <span className="text-xl">🎈</span>
                <div className="text-[10px] text-white font-black">
                  <div>Balon Melayang</div>
                  <button
                    onClick={handleReleaseBalloon}
                    className="text-[9px] text-pink-400 underline font-black hover:text-pink-300 cursor-pointer"
                  >
                    Lepaskan ke Langit 🚀
                  </button>
                </div>
              </div>
            )}

            {/* STAND UP BUTTON */}
            {(isSitting ||
              isSwinging ||
              isRidingJetski ||
              isRidingBumperCar ||
              isOnFerrisWheel ||
              isOnCarousel ||
              isSwimming) && (
              <div className="absolute top-14 left-3 z-40">
                <button
                  onClick={handleStandUp}
                  className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs px-4 py-2 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isSwimming ? '🏖️' : isRidingBumperCar ? '🚗' : '🪑'}</span>
                  <span>
                    {isSwimming ? 'NAIK KE PANTAI' : isRidingBumperCar ? 'TURUN MOBIL' : 'BERDIRI'}
                  </span>
                </button>
              </div>
            )}

            {/* SWING CONTROLS */}
            {isSwinging && (
              <div className="absolute top-26 left-3 z-40 flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSwingSpeed((s) => Math.min(2.5, s + 0.5));
                    triggerToast('Wushhh! Ayunan makin kenceng! 🚀');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-xl shadow-lg border border-white cursor-pointer active:scale-95"
                >
                  🚀 Ayun Lebih Kenceng
                </button>
              </div>
            )}

            {/* DYNAMIC NEARBY INTERACTION TARGET BUTTON */}
            {nearbyInteraction &&
              !isSitting &&
              !isOnFerrisWheel &&
              !isOnCarousel &&
              !isRidingBumperCar && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40">
                <button
                  onClick={() => executeInteraction(nearbyInteraction)}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border-2 border-white cursor-pointer active:scale-95 transition-all"
                >
                  <span className="text-base">{nearbyInteraction.icon}</span>
                  <span>{nearbyInteraction.prompt}</span>
                  <span className="bg-black/20 text-slate-900 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                    E / KLIK
                  </span>
                </button>
              </div>
            )}

            {/* NEARBY NPC PLAYER CHAT PROMPT */}
            {activeNPC && !nearbyInteraction && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40">
                <button
                  onClick={() => {
                    sound.playPop();
                    setNpcChatBubble({
                      name: activeNPC.name,
                      text: activeNPC.greeting,
                    });
                  }}
                  className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border-2 border-white cursor-pointer active:scale-95"
                >
                  <span>💬</span>
                  <span>Ajak Ngobrol {activeNPC.name}</span>
                </button>
              </div>
            )}

            {/* NPC CHAT BUBBLE POPUP */}
            {npcChatBubble && (
              <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-pink-400 text-white p-3 rounded-2xl shadow-2xl max-w-xs w-full">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1.5">
                  <span className="font-black text-xs text-pink-300">
                    Pemain: {npcChatBubble.name}
                  </span>
                  <button
                    onClick={() => setNpcChatBubble(null)}
                    className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                  "{npcChatBubble.text}"
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => {
                      sound.playFanfare();
                      const friendId = `npc_${npcChatBubble.name.toLowerCase().replace(/\s+/g, '_')}`;
                      handleAddFriend({
                        id: friendId,
                        name: npcChatBubble.name,
                        username: `@${npcChatBubble.name.toLowerCase().replace(/\s+/g, '')}`,
                        worldId: currentLocation,
                        worldTitle: currentWorldInfo.title,
                        avatar: {
                          ...avatarState,
                          name: npcChatBubble.name,
                        },
                      });
                      setNpcChatBubble(null);
                    }}
                    className="flex-1 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] rounded-lg cursor-pointer"
                  >
                    + Tambah Teman 🤝
                  </button>
                </div>
              </div>
            )}

            {/* TOUCH VIRTUAL JOYSTICK & BUTTONS */}
            <div className="absolute inset-x-0 bottom-4 px-4 flex items-end justify-between pointer-events-none z-30">
              <div
                data-no-orbit="true"
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={handleJoystickTouchStart}
                onTouchMove={handleJoystickTouchMove}
                onTouchEnd={handleJoystickTouchEnd}
                className="w-28 h-28 rounded-full bg-slate-900/75 border-2 border-white/30 pointer-events-auto flex items-center justify-center relative touch-none shadow-xl active:border-pink-400"
              >
                <div
                  style={{
                    transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform duration-75 ${
                    isJoystickActive
                      ? 'bg-gradient-to-br from-pink-400 to-rose-500 scale-105'
                      : 'bg-white/85'
                  }`}
                >
                  <span className="text-xs">🕹️</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pointer-events-auto">
                <button
                  onClick={handleJump}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-xl flex items-center justify-center shadow-2xl border-2 border-white cursor-pointer active:scale-90 transition-transform"
                  title="Lompat"
                >
                  ⬆️
                </button>

                <button
                  onClick={() => {
                    if (nearbyInteraction) {
                      executeInteraction(nearbyInteraction);
                    } else if (
                      isSitting ||
                      isOnFerrisWheel ||
                      isOnCarousel ||
                      isRidingBumperCar ||
                      isSwimming
                    ) {
                      handleStandUp();
                    } else {
                      sound.playSit();
                      setIsSitting(true);
                      avatarModelRef.current?.setSitConfig({ mode: 'sand', seatRelY: 0.04 });
                      avatarModelRef.current?.setAnimation('sit');
                      triggerToast(
                        currentLocation === 'pantai'
                          ? 'Duduk santai di atas pasir pantai! 🏖️'
                          : 'Duduk santai di tempat! 🪑'
                      );
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-slate-900/90 text-white font-bold text-sm flex items-center justify-center shadow-xl border border-pink-300/40 cursor-pointer active:scale-90 transition-transform self-end"
                  title="Interaksi / Duduk"
                >
                  {nearbyInteraction ? nearbyInteraction.icon : isSitting ? '🚶' : '🪑'}
                </button>
              </div>
            </div>

            {/* FLOATING CHAT & PHOTOBOOTH QUICK BUTTONS */}
            <div className="absolute bottom-36 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPhotoBoothOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base flex items-center justify-center shadow-2xl border border-white cursor-pointer active:scale-90"
                title="Studio Foto"
              >
                📸
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setUnreadChatCount(0);
                  setIsChatOpen(true);
                }}
                className="relative w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg flex items-center justify-center shadow-2xl border border-white cursor-pointer active:scale-90"
                title="Buka Chat WhatsApp"
              >
                <span>💬</span>
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 rounded-full">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SHARED GLOBAL MODALS (WORKS FROM BOTH BERANDA AND 3D WORLDS) */}
      {/* ============================================================ */}

      {/* GLOBAL TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-14 left-4 right-4 z-[70] bg-slate-900/95 text-white text-xs font-black py-2.5 px-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 border border-pink-400/50 max-w-sm mx-auto pointer-events-none">
          <span>✨</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* INFO CARDS MODAL */}
      {infoModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-pink-500 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
              {infoModal.icon}
            </div>
            <h3 className="font-black text-sm font-['Fredoka'] text-white">
              {infoModal.title}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-2 mb-4 leading-relaxed">
              {infoModal.text}
            </p>
            <button
              onClick={() => setInfoModal(null)}
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs rounded-xl cursor-pointer active:scale-95 shadow-md"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ROBLOX-STYLE FRIENDS MODAL */}
      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        friends={friends}
        requests={friendRequests}
        onJoinWorld={(worldId, friendName) => {
          setIsFriendsOpen(false);
          enterWorld(worldId);
          triggerToast(`Ikut main bareng ${friendName} di ${WORLD_NAMES[worldId].title}! 🚀`);
        }}
        onOpenDM={(friend) => {
          setIsFriendsOpen(false);
          setActiveChatChannel(friend.id);
          setUnreadChatCount(0);
          setIsChatOpen(true);
        }}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
      />

      {/* WHATSAPP-STYLE CHAT SYSTEM (ROOM + DM FRIENDS) */}
      <ChatSystem
        currentRoom={currentWorldInfo.title}
        myAvatar={avatarState}
        friends={friends}
        activeChannelId={activeChatChannel}
        onChangeChannel={setActiveChatChannel}
        onSendMessage={(_msg, chId) => {
          if (chId === 'room' && currentScreen === 'world') {
            avatarModelRef.current?.setAnimation('wave');
          }
        }}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isOwner={true}
      />

      {/* TRANSFER MODAL */}
      <TransferModal
        coins={coins}
        onTransfer={(target, amt) => {
          if (coins >= amt) {
            setCoins((c) => c - amt);
            triggerToast(`Berhasil transfer ${amt} Koin ke ${target}! 💸`);
            return true;
          }
          return false;
        }}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        isOwner={true}
      />

      {/* PHOTO BOOTH MODAL */}
      <PhotoBoothModal
        avatar={avatarState}
        pet={{
          id: 'kucing',
          name: 'Milo',
          type: 'kucing',
          level: 5,
          xp: 80,
          favoriteFood: 'Ikan 🐟',
          hunger: 90,
          happiness: 95,
          energy: 90,
          hygiene: 90,
          love: 95,
        }}
        isOpen={isPhotoBoothOpen}
        onClose={() => setIsPhotoBoothOpen(false)}
        isOwner={true}
      />

      {/* PROFIL WARGA MODAL */}
      {isProfileOpen && (
        <div
          onClick={() => setIsProfileOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end sm:items-center sm:justify-center sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] w-full sm:max-w-md flex flex-col overflow-hidden shadow-2xl border-t-4 sm:border-2 border-pink-400"
          >
            <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">👤</span>
                <h2 className="font-black text-sm font-['Fredoka']">PROFIL WARGA & PREVIEW</h2>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProfileView
                avatar={avatarState}
                pet={{
                  id: 'kucing',
                  name: 'Milo',
                  type: 'kucing',
                  level: 5,
                  xp: 80,
                  favoriteFood: 'Ikan 🐟',
                  hunger: 90,
                  happiness: 95,
                  energy: 90,
                  hygiene: 90,
                  love: 95,
                }}
                coins={coins}
                onOpenAvatarCreator={() => {
                  setIsProfileOpen(false);
                  setShowWardrobe(true);
                }}
                onOpenTransfer={() => {
                  setIsProfileOpen(false);
                  setIsTransferOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* LEMARI / AVATAR CREATOR MODAL */}
      {showWardrobe && (
        <AvatarCreator
          initialAvatar={avatarState}
          initialConfig={avatarConfig}
          coins={coins}
          onUpdateCoins={(amt) => setCoins((c) => Math.max(0, c + amt))}
          onSaveConfig={(fullConfig) => {
            setAvatarConfig((prev) => ({
              ...prev,
              ...fullConfig,
              outfitId: fullConfig.top,
              accessoryId: fullConfig.accessory,
            }));
          }}
          onSave={() => {
            setShowWardrobe(false);
            triggerToast('Outfit Lemari Berhasil Disimpan ke Dunia! ✨🎉');
          }}
          onGoHome={() => setShowWardrobe(false)}
        />
      )}
    </>
  );
}
