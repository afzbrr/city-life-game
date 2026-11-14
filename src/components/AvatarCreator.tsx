import React, { useState } from 'react';
import AvatarManusia from './AvatarManusia';
import ChibiPreview from './ChibiPreview';
import { AvatarConfig, AvatarAnimState, FaceExpression } from '../game/types';
import { AvatarState } from '../types/game';
import {
  WARDROBE_ITEMS,
  WardrobeCategory,
  WardrobeItem,
} from '../data/wardrobeCatalog';
import { sound } from '../game/soundManager';

const HAIR_COLORS = [
  { id: 'hitam', name: 'Hitam', hex: '#18181b' },
  { id: 'coklat', name: 'Coklat', hex: '#6b3e26' },
  { id: 'pirang', name: 'Pirang', hex: '#eab308' },
  { id: 'pink', name: 'Pink', hex: '#ec4899' },
  { id: 'ungu', name: 'Ungu', hex: '#9333ea' },
  { id: 'merah', name: 'Merah', hex: '#dc2626' },
  { id: 'abu', name: 'Abu', hex: '#94a3b8' },
];

interface AvatarCreatorProps {
  initialAvatar: AvatarState;
  initialConfig?: AvatarConfig;
  coins?: number;
  onUpdateCoins?: (amount: number) => void;
  onSave: (avatar: AvatarState) => void;
  onSaveConfig?: (config: AvatarConfig) => void;
  onGoHome: () => void;
}

export default function AvatarCreator({
  initialAvatar,
  initialConfig,
  coins = 1000,
  onUpdateCoins,
  onSave,
  onSaveConfig,
  onGoHome,
}: AvatarCreatorProps) {
  // Selected Wardrobe Slots (Mix & Match)
  // Default Starter Gratis: Kaos Polos Putih + Celana Pendek Biru Muda + Sendal Jepit Coklat
  const [top, setTop] = useState<string>(initialConfig?.top || initialAvatar.outfitId || 'kaos_polos_putih');
  const [bottom, setBottom] = useState<string>(initialConfig?.bottom || 'celana_pendek_biru_muda');
  const [shoes, setShoes] = useState<string>(
    initialConfig?.shoes ||
      (initialAvatar.shoesId && initialAvatar.shoesId !== 'default'
        ? initialAvatar.shoesId
        : 'sendal_jepit_coklat')
  );
  const [accessory, setAccessory] = useState<string>(
    initialConfig?.accessory ||
      (initialAvatar.accessoryId && initialAvatar.accessoryId !== 'none'
        ? initialAvatar.accessoryId
        : 'none')
  );
  const [dressOrSetelan, setDressOrSetelan] = useState<string>(initialConfig?.dressOrSetelan || 'none');
  const [hairStyle, setHairStyle] = useState<string>(
    initialConfig?.hairStyle ||
      (initialAvatar.gender === 'cowok' || initialAvatar.hairStyle === 'two_block'
        ? 'cowo_two_block'
        : 'cewe_long_hair')
  );
  const [hairColor, setHairColor] = useState<string>(initialConfig?.hairColor || initialAvatar.hairColor || '#18181b');
  const [faceExpression, setFaceExpression] = useState<FaceExpression>(
    initialConfig?.faceExpression || 'senyum'
  );
  const [skinColor, setSkinColor] = useState<string>(
    initialConfig?.skinColor || (initialAvatar.skinColor === 'kuning' ? '#ffe0b2' : '#fff0ea')
  );
  const [gender, setGender] = useState<'cewek' | 'cowok'>(initialConfig?.gender || initialAvatar.gender || 'cewek');

  // Owned item IDs tracking (Starter items are free & owned by default)
  const [ownedItems, setOwnedItems] = useState<Set<string>>(
    new Set([
      'kaos_polos_putih',
      'celana_pendek_biru_muda',
      'sendal_jepit_coklat',
      'cewe_long_hair',
      'cowo_two_block',
      'muka_senyum',
      'kulit_putih_cerah',
      'kulit_kuning_langsat',
      'kulit_sawo_matang',
      'kulit_warm_tan',
      'kulit_pastel_peach',
    ])
  );

  // Active Category Tab & Stage Preview Controls
  const [activeTab, setActiveTab] = useState<WardrobeCategory>('atasan');
  const [genderFilter, setGenderFilter] = useState<'all' | 'cewek' | 'cowok'>('all');
  const [animAction, setAnimAction] = useState<AvatarAnimState>('idle');
  const [viewAngle, setViewAngle] = useState<'depan' | 'samping' | 'belakang'>('depan');
  const [zoomLevel, setZoomLevel] = useState<number>(380); // Zoom height control
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2400);
  };

  // Find active items for meta badges
  const activeTopItem = WARDROBE_ITEMS.find((i) => i.id === top);
  const isSultan = activeTopItem?.isSultan || dressOrSetelan.includes('sultan');
  const isCouple = activeTopItem?.isCouple || dressOrSetelan.includes('couple');

  // 3D Avatar Configuration
  const currentConfig: AvatarConfig = {
    gender,
    ageGroup: 'dewasa',
    skinColor,
    hairStyle,
    hairColor,
    top,
    bottom,
    shoes,
    hat: accessory.startsWith('topi') || accessory.includes('beanie') || accessory.includes('bucket') ? accessory : 'none',
    glasses: accessory.includes('kacamata') ? accessory : 'none',
    accessory,
    shirtColor: activeTopItem?.color || '#ffffff',
    pantsColor: WARDROBE_ITEMS.find((i) => i.id === bottom)?.color || '#93c5fd',
    shoesColor: WARDROBE_ITEMS.find((i) => i.id === shoes)?.color || '#78350f',
    faceExpression,
    isSultan,
    isCouple,
    dressOrSetelan,
  };

  // Handle Item Click (Equip / Unequip / Buy)
  const handleItemClick = (item: WardrobeItem) => {
    const isOwned = ownedItems.has(item.id) || item.price === 0 || item.isDefault;

    if (!isOwned) {
      // Need to purchase
      if (coins < item.price) {
        sound.playPop();
        showToast(`Koin tidak cukup! Butuh 🪙 ${item.price} koin 😢`);
        return;
      }

      // Deduct coins & add to owned
      onUpdateCoins?.(-item.price);
      setOwnedItems((prev) => new Set([...prev, item.id]));
      sound.playCoin();
      showToast(`Berhasil membeli ${item.name}! -🪙 ${item.price} 🎉`);
    } else {
      sound.playPop();
    }

    // Equip / Toggle behavior by category
    switch (item.category) {
      case 'atasan':
        if (top === item.id) {
          // Toggle back to default starter
          setTop('kaos_polos_putih');
          showToast('Melepas atasan -> Kaos Polos Putih Gratis 👕');
        } else {
          setTop(item.id);
          showToast(`Memakai ${item.name} ✨`);
        }
        break;

      case 'bawahan':
        if (bottom === item.id) {
          setBottom('celana_pendek_biru_muda');
          showToast('Melepas bawahan -> Celana Pendek Gratis 🩳');
        } else {
          setBottom(item.id);
          showToast(`Memakai ${item.name} ✨`);
        }
        break;

      case 'sepatu':
        if (shoes === item.id) {
          setShoes('sendal_jepit_coklat');
          showToast('Melepas sepatu -> Sendal Jepit Coklat Gratis 🩴');
        } else {
          setShoes(item.id);
          showToast(`Memakai ${item.name} ✨`);
        }
        break;

      case 'aksesoris':
        if (accessory === item.id) {
          setAccessory('none');
          showToast('Melepas aksesoris');
        } else {
          setAccessory(item.id);
          showToast(`Memakai ${item.name} 🎀`);
        }
        break;

      case 'dress_setelan':
        if (dressOrSetelan === item.id) {
          setDressOrSetelan('none');
          setTop('kaos_polos_putih');
          setBottom('celana_pendek_biru_muda');
          showToast('Melepas setelan -> Kembali ke Kaos Polos & Celana Pendek');
        } else {
          setDressOrSetelan(item.id);
          setTop(item.id);
          // Setelan usually matches or coordinates bottom
          if (item.id.includes('rok') || item.gender === 'cewek') {
            setBottom('rok_plisket_biru');
          } else {
            setBottom('celana_jeans_panjang');
          }
          showToast(`Memakai ${item.name} ${item.isSultan ? '✨ (Efek Bintang Sultan)' : ''} ${item.isCouple ? '💕 (Efek Hati Couple)' : ''}`);
        }
        break;

      case 'rambut':
        setHairStyle(item.id);
        if (item.gender === 'cowok' || item.gender === 'cewek') {
          setGender(item.gender);
        }
        showToast(`Gaya rambut: ${item.name} 💇`);
        break;

      case 'muka':
        {
          const expr = item.id.replace('muka_', '') as FaceExpression;
          setFaceExpression(expr);
          showToast(`Ekspresi wajah: ${item.name} 😊`);
        }
        break;

      case 'kulit':
        setSkinColor(item.color);
        showToast(`Warna kulit: ${item.name} ✨`);
        break;
    }
  };

  // Check if an item is currently equipped
  const isItemEquipped = (item: WardrobeItem): boolean => {
    switch (item.category) {
      case 'atasan':
        return top === item.id;
      case 'bawahan':
        return bottom === item.id;
      case 'sepatu':
        return shoes === item.id;
      case 'aksesoris':
        return accessory === item.id;
      case 'dress_setelan':
        return dressOrSetelan === item.id || top === item.id;
      case 'rambut':
        return hairStyle === item.id;
      case 'muka':
        return faceExpression === item.id.replace('muka_', '');
      case 'kulit':
        return skinColor === item.color;
      default:
        return false;
    }
  };

  // Save changes & propagate to world
  const handleSave = () => {
    sound.playFanfare();
    const updated: AvatarState = {
      ...initialAvatar,
      name: gender === 'cewek' ? 'Ayu' : 'Faiz',
      gender,
      skinColor: skinColor === '#fff0ea' ? 'putih' : 'kuning',
      hairColor,
      hairStyle,
      height: 'tinggi',
      outfitId: top,
      outfitName: activeTopItem?.name || 'Outfit Manusia',
      outfitType: gender === 'cewek' ? 'pink_cewe' : 'biru_cowo',
      accessoryId: accessory,
      shoesId: shoes,
    };
    onSaveConfig?.(currentConfig);
    onSave(updated);
    showToast('Outfit Lemari berhasil disimpan ke Dunia! ✨🎉');
  };

  // Filter items in active category
  const filteredItems = WARDROBE_ITEMS.filter((i) => {
    if (i.category !== activeTab) return false;
    if (genderFilter === 'all') return true;
    if (i.gender === 'unisex' || !i.gender) return true;
    return i.gender === genderFilter;
  });

  const categoryTabs: { id: WardrobeCategory; label: string; icon: string }[] = [
    { id: 'atasan', label: 'Atasan', icon: '👕' },
    { id: 'bawahan', label: 'Bawahan', icon: '👖' },
    { id: 'sepatu', label: 'Sepatu', icon: '👟' },
    { id: 'aksesoris', label: 'Aksesoris', icon: '🎀' },
    { id: 'dress_setelan', label: 'Dress/Setelan', icon: '👗' },
    { id: 'rambut', label: 'Rambut', icon: '💇' },
    { id: 'muka', label: 'Muka', icon: '😊' },
    { id: 'kulit', label: 'Warna Kulit', icon: '🎨' },
  ];

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col font-['Quicksand'] select-none overflow-hidden animate-fadeIn">
      {/* 1. TOP HEADER */}
      <div className="p-3 bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 text-white flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚪</span>
          <div>
            <h1 className="font-black text-sm leading-tight font-['Fredoka']">LEMARI / GANTI BAJU</h1>
            <p className="text-[10px] text-pink-100 font-bold">Mix & Match Outfit Manusia Kartun 3D</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gender Switch Shortcut */}
          <div className="flex bg-black/25 rounded-full p-0.5 border border-white/20">
            <button
              onClick={() => {
                setGender('cewek');
                if (hairStyle.startsWith('cowo_')) setHairStyle('cewe_long_hair');
                showToast('Karakter Cewek (Ayu) 👧');
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                gender === 'cewek' ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-100'
              }`}
            >
              👧 Cewe
            </button>
            <button
              onClick={() => {
                setGender('cowok');
                if (hairStyle.startsWith('cewe_')) setHairStyle('cowo_two_block');
                showToast('Karakter Cowok (Faiz) 👦');
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                gender === 'cowok' ? 'bg-blue-500 text-white shadow-xs' : 'text-blue-100'
              }`}
            >
              👦 Cowo
            </button>
          </div>

          <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🪙</span>
            <span>{coins.toLocaleString()}</span>
          </span>

          <button
            onClick={onGoHome}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center cursor-pointer active:scale-90"
            title="Tutup"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. CENTER: LARGE 3D AVATAR (Grey Background + Contact Floor Shadow + 360° Drag + Zoom + Depan/Samping/Belakang) */}
      <div className="relative flex-1 min-h-[260px] max-h-[380px] flex items-center justify-center bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 overflow-hidden border-b border-slate-300">
        <AvatarManusia
          config={currentConfig}
          action={animAction}
          viewAngle={viewAngle}
          height={zoomLevel}
          width="100%"
          interactive={true}
          showPedestal={true}
        />

        {/* Floating Effects Badge (Sultan / Couple) */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
          {isSultan && (
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg border border-amber-300 animate-pulse flex items-center gap-1">
              <span>⭐</span>
              <span>Sultan Sparkle Aktif</span>
            </span>
          )}
          {isCouple && (
            <span className="bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg border border-pink-300 animate-bounce flex items-center gap-1">
              <span>💕</span>
              <span>Couple Gemoy Aktif</span>
            </span>
          )}
          <span className="bg-slate-900/70 text-slate-100 font-bold text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs">
            {activeTopItem?.name || 'Kaos Polos'}
          </span>
        </div>

        {/* Emotes & Zoom Controls (Right side) */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setAnimAction('idle')}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-all ${
              animAction === 'idle' ? 'bg-pink-500 text-white ring-2 ring-white scale-105' : 'bg-white/80 text-slate-700'
            }`}
            title="Santai"
          >
            ✨
          </button>
          <button
            onClick={() => setAnimAction('walk')}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-all ${
              animAction === 'walk' ? 'bg-pink-500 text-white ring-2 ring-white scale-105' : 'bg-white/80 text-slate-700'
            }`}
            title="Jalan"
          >
            🚶
          </button>
          <button
            onClick={() => setAnimAction('wave')}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-all ${
              animAction === 'wave' ? 'bg-pink-500 text-white ring-2 ring-white scale-105' : 'bg-white/80 text-slate-700'
            }`}
            title="Melambai"
          >
            👋
          </button>
          <button
            onClick={() => setAnimAction('sit')}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-all ${
              animAction === 'sit' ? 'bg-pink-500 text-white ring-2 ring-white scale-105' : 'bg-white/80 text-slate-700'
            }`}
            title="Duduk"
          >
            🪑
          </button>

          {/* Zoom In / Zoom Out */}
          <div className="mt-2 pt-2 border-t border-slate-300/80 flex flex-col gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(480, z + 30))}
              className="w-8 h-8 rounded-full bg-white/90 text-slate-800 font-black text-xs shadow-md flex items-center justify-center active:scale-90 cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(280, z - 30))}
              className="w-8 h-8 rounded-full bg-white/90 text-slate-800 font-black text-xs shadow-md flex items-center justify-center active:scale-90 cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
          </div>
        </div>

        {/* Preview Camera Angles: Depan / Samping / Belakang */}
        <div className="absolute bottom-2 left-3 z-20 flex bg-white/85 backdrop-blur-xs rounded-full p-0.5 shadow-sm border border-slate-300/80 gap-0.5">
          {([
            { id: 'depan', label: 'Depan' },
            { id: 'samping', label: 'Samping' },
            { id: 'belakang', label: 'Belakang' },
          ] as const).map((ang) => (
            <button
              key={ang.id}
              onClick={() => {
                sound.playPop();
                setViewAngle(ang.id);
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                viewAngle === ang.id
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {ang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM: CATEGORY TABS & 3-COLUMN SQUARE GRID */}
      <div className="bg-slate-900/95 flex-1 flex flex-col justify-between overflow-hidden">
        {/* HORIZONTAL CATEGORY TABS */}
        <div className="p-2 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 flex-nowrap">
            {categoryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playPop();
                    setActiveTab(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Gender Filter toggle */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 shrink-0 ml-1">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2 py-0.5 text-[9px] font-black rounded-md cursor-pointer ${
                genderFilter === 'all' ? 'bg-pink-500 text-white' : 'text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setGenderFilter('cewek')}
              className={`px-2 py-0.5 text-[9px] font-black rounded-md cursor-pointer ${
                genderFilter === 'cewek' ? 'bg-pink-500 text-white' : 'text-slate-400'
              }`}
            >
              👧
            </button>
            <button
              onClick={() => setGenderFilter('cowok')}
              className={`px-2 py-0.5 text-[9px] font-black rounded-md cursor-pointer ${
                genderFilter === 'cowok' ? 'bg-blue-500 text-white' : 'text-slate-400'
              }`}
            >
              👦
            </button>
          </div>
        </div>

        {/* 3-COLUMN SQUARE GRID (Chibi Human Avatar Preview + Name + Price + Pakai/Beli/DIPAKE) */}
        <div className="flex-1 overflow-y-auto p-2.5">
          {/* 7 Hair Color Swatches shown cleanly inside Rambut Tab */}
          {activeTab === 'rambut' && (
            <div className="mb-2.5 p-2 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-slate-200 whitespace-nowrap">
                🎨 Warna Rambut:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {HAIR_COLORS.map((hc) => {
                  const active = hairColor.toLowerCase() === hc.hex.toLowerCase();
                  return (
                    <button
                      key={hc.id}
                      onClick={() => {
                        sound.playPop();
                        setHairColor(hc.hex);
                        showToast(`Warna rambut: ${hc.name} 🎨`);
                      }}
                      title={hc.name}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition-all ${
                        active
                          ? 'bg-white text-slate-950 ring-2 ring-pink-400 scale-105'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block"
                        style={{ backgroundColor: hc.hex }}
                      />
                      <span>{hc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pb-2">
            {filteredItems.map((item) => {
              const equipped = isItemEquipped(item);
              const isOwned = ownedItems.has(item.id) || item.price === 0 || item.isDefault;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex flex-col items-center justify-between p-2 rounded-2xl border-2 cursor-pointer transition-all active:scale-95 select-none ${
                    equipped
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-lg ring-2 ring-emerald-400/40'
                      : isOwned
                      ? 'border-slate-700 bg-slate-800/90 hover:border-pink-400/60 hover:bg-slate-800'
                      : 'border-slate-800 bg-slate-800/50 hover:border-amber-400/60'
                  }`}
                >
                  {/* Equipped Checkmark Badge */}
                  {equipped && (
                    <div className="absolute top-1.5 right-1.5 z-10 bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md animate-pulse">
                      <span>✓</span>
                      <span>DIPAKE</span>
                    </div>
                  )}

                  {/* Special Sultan / Couple Tag */}
                  {item.isSultan && (
                    <div className="absolute top-1.5 left-1.5 z-10 bg-amber-400 text-slate-950 font-black text-[8px] px-1 rounded-sm shadow-xs">
                      ⭐ SULTAN
                    </div>
                  )}
                  {item.isCouple && (
                    <div className="absolute top-1.5 left-1.5 z-10 bg-pink-500 text-white font-black text-[8px] px-1 rounded-sm shadow-xs">
                      💕 COUPLE
                    </div>
                  )}

                  {/* CHIBI HUMAN AVATAR PREVIEW (Never empty hanger/box!) */}
                  <div className="w-16 h-16 flex items-center justify-center my-1">
                    <ChibiPreview
                      item={item}
                      gender={gender}
                      skinColor={skinColor}
                      hairColor={hairColor}
                    />
                  </div>

                  {/* Item Name */}
                  <div className="w-full text-center mt-1">
                    <div className="font-black text-[11px] text-white leading-tight truncate">
                      {item.name}
                    </div>
                    {item.tag && (
                      <div className="text-[9px] text-pink-300 font-bold truncate">
                        {item.tag}
                      </div>
                    )}
                  </div>

                  {/* Price & Action Button */}
                  <div className="w-full mt-1.5">
                    {equipped ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="w-full py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] cursor-pointer shadow-xs"
                      >
                        ✓ DIPAKE
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="w-full py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] cursor-pointer shadow-xs active:scale-95"
                      >
                        Pakai
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="w-full py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>Beli</span>
                        <span>🪙 {item.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. FOOTER: BATAL & SIMPAN BUTTONS */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
          <button
            onClick={onGoHome}
            className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs cursor-pointer active:scale-95 transition-all text-center"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Simpan Outfit ke Dunia</span>
            <span>💾</span>
          </button>
        </div>
      </div>

      {/* TOAST POPUP */}
      {toast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-pink-400/50 px-4 py-2 rounded-2xl text-xs font-black shadow-2xl animate-bounce flex items-center gap-1.5">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
