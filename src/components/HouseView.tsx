import React, { useState } from 'react';
import ChibiAvatar from './ChibiAvatar';
import ChibiPet from './ChibiPet';
import { AvatarState, PetState, FurnitureItem } from '../types/game';

interface HouseViewProps {
  avatar: AvatarState;
  pet: PetState;
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onUpdatePet: (pet: PetState) => void;
  onOpenWardrobe: () => void;
  isOwner?: boolean;
}

export const INITIAL_FURNITURE: FurnitureItem[] = [
  { id: 'kasur', name: 'Kasur Mewah Pink', category: 'kamar', emoji: '🛏️', price: 150, x: 22, y: 30, room: 'kamar', rotation: 0 },
  { id: 'sofa', name: 'Sofa Cloud Peach', category: 'ruang_tamu', emoji: '🛋️', price: 200, x: 50, y: 55, room: 'ruang_tamu', rotation: 0 },
  { id: 'tv', name: 'Smart TV 4K', category: 'ruang_tamu', emoji: '📺', price: 300, x: 50, y: 20, room: 'ruang_tamu', rotation: 0 },
  { id: 'meja', name: 'Meja Kopi Boba', category: 'ruang_tamu', emoji: '☕', price: 80, x: 50, y: 70, room: 'ruang_tamu', rotation: 0 },
  { id: 'kulkas', name: 'Kulkas Pastel', category: 'dapur', emoji: '🧊', price: 250, x: 80, y: 25, room: 'dapur', rotation: 0 },
  { id: 'tanaman', name: 'Monstera Tropis', category: 'ruang_tamu', emoji: '🪴', price: 60, x: 78, y: 75, room: 'ruang_tamu', rotation: 0 },
];

export default function HouseView({
  avatar,
  pet,
  coins,
  onUpdateCoins,
  onUpdatePet,
  onOpenWardrobe,
  isOwner = false,
}: HouseViewProps) {
  const [furnitureList, setFurnitureList] = useState<FurnitureItem[]>(INITIAL_FURNITURE);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);

  // Avatar & Pet Position in House
  const [avatarPos, setAvatarPos] = useState<{ x: number; y: number }>({ x: 42, y: 58 });
  const [avatarAction, setAvatarAction] = useState<'stand' | 'walk' | 'sit' | 'sleep' | 'wave' | 'dance'>('stand');
  const [speechBubble, setSpeechBubble] = useState<string | null>('Rumah kita nyaman banget! 💖');

  // Status Modals (when tapping human or pet)
  const [showStatusModal, setShowStatusModal] = useState<'human' | 'pet' | null>(null);

  // House Paint Color State
  const [wallColor, setWallColor] = useState<string>('#fce7f3'); // soft pink pastel
  const [floorColor, setFloorColor] = useState<string>('#fef3c7'); // warm parquet cream
  const [showPaintMenu, setShowPaintMenu] = useState<boolean>(false);

  // View / Room Rotation Angle (0, 90, 180, 270)
  const [roomRotation, setRoomRotation] = useState<number>(0);

  // Helper trigger speech
  const say = (text: string, duration = 3500) => {
    setSpeechBubble(text);
    setTimeout(() => {
      setSpeechBubble((prev) => (prev === text ? null : prev));
    }, duration);
  };

  // Human Activity Actions (Makan, Main, Mandi, Tidur, Ganti Baju)
  const handleAction = (type: 'makan' | 'main' | 'mandi' | 'tidur' | 'ganti_baju') => {
    if (type === 'makan') {
      setAvatarAction('dance');
      setAvatarPos({ x: 50, y: 65 });
      say('Nyam nyam! Makan boba & pancake lezat bareng pet! 🥞🧋');
      onUpdatePet({ ...pet, hunger: Math.min(100, pet.hunger + 25), happiness: Math.min(100, pet.happiness + 15) });
      onUpdateCoins(10);
    } else if (type === 'main') {
      setAvatarAction('dance');
      say('Hore! Main kejar-kejaran bareng pet tercinta! 🎾✨');
      onUpdatePet({ ...pet, happiness: Math.min(100, pet.happiness + 30), love: Math.min(100, pet.love + 10) });
      onUpdateCoins(15);
    } else if (type === 'mandi') {
      setAvatarAction('walk');
      say('Segar banget! Mandi air hangat sabun stroberi wangi 🫧🛁');
      onUpdatePet({ ...pet, hygiene: 100 });
      onUpdateCoins(10);
    } else if (type === 'tidur') {
      setAvatarAction('sleep');
      setAvatarPos({ x: 25, y: 32 });
      say('Zzz... Tidur nyenyak di kasur empuk. Selamat malam! 🛏️🌙');
      onUpdatePet({ ...pet, energy: 100 });
      onUpdateCoins(40);
    } else if (type === 'ganti_baju') {
      onOpenWardrobe();
    }
  };

  // Move furniture in edit mode
  const handleMoveFurniture = (dx: number, dy: number) => {
    if (!selectedFurniture) return;
    setFurnitureList((prev) =>
      prev.map((f) =>
        f.id === selectedFurniture.id
          ? { ...f, x: Math.max(10, Math.min(90, f.x + dx)), y: Math.max(10, Math.min(90, f.y + dy)) }
          : f
      )
    );
  };

  // Rotate furniture
  const handleRotateFurniture = () => {
    if (!selectedFurniture) return;
    setFurnitureList((prev) =>
      prev.map((f) =>
        f.id === selectedFurniture.id ? { ...f, rotation: (f.rotation + 90) % 360 } : f
      )
    );
  };

  // Delete furniture
  const handleDeleteFurniture = () => {
    if (!selectedFurniture) return;
    setFurnitureList((prev) => prev.filter((f) => f.id !== selectedFurniture.id));
    setSelectedFurniture(null);
  };

  // Tap floor to walk
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setAvatarAction('walk');
    setAvatarPos({ x: clickX, y: clickY });
    setTimeout(() => setAvatarAction('stand'), 800);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 select-none relative overflow-hidden bg-amber-50/50">
      
      {/* 1. TOP CONTROLS: Mode Hias Rumah, Cat Rumah & Putar Layar */}
      <div className="flex items-center justify-between z-20 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsEditMode(!isEditMode);
              setSelectedFurniture(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black border-2 transition-all cursor-pointer shadow-xs ${
              isEditMode
                ? 'bg-amber-400 text-slate-900 border-amber-500 scale-102'
                : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
            }`}
          >
            {isEditMode ? '✅ Selesai Hias' : '🏠 Hias Rumah'}
          </button>

          <button
            onClick={() => setShowPaintMenu(!showPaintMenu)}
            className="px-2.5 py-1.5 rounded-full text-xs font-black bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-xs cursor-pointer"
          >
            🎨 Cat
          </button>
        </div>

        {/* Putar Layar / View Rotation Toggle (0°, 90°, 180°, 270°) */}
        <button
          onClick={() => setRoomRotation((r) => (r + 90) % 360)}
          className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/90 border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
          title="Putar sudut pandang ruangan"
        >
          <span>🔄</span>
          <span className="text-[10px] font-black">{roomRotation}°</span>
        </button>
      </div>

      {/* PAINT MENU DROPDOWN */}
      {showPaintMenu && (
        <div className="absolute top-12 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border-2 border-pink-300 shadow-xl z-30 space-y-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-800">🎨 Pilih Cat Dinding & Lantai:</span>
            <button onClick={() => setShowPaintMenu(false)} className="font-bold text-slate-400">✕</button>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block mb-1">Cat Dinding Pastel:</span>
            <div className="flex gap-2">
              {[
                { name: 'Pink Pastel', color: '#fce7f3' },
                { name: 'Biru Langit', color: '#e0f2fe' },
                { name: 'Ungu Lilac', color: '#f3e8ff' },
                { name: 'Mint Segar', color: '#ecfdf5' },
                { name: 'Cream Hangat', color: '#fffbeb' },
              ].map((p) => (
                <button
                  key={p.color}
                  onClick={() => setWallColor(p.color)}
                  style={{ backgroundColor: p.color }}
                  className={`w-7 h-7 rounded-full border-2 ${wallColor === p.color ? 'border-pink-600 scale-110' : 'border-slate-300'}`}
                  title={p.name}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block mb-1">Lantai Rumah:</span>
            <div className="flex gap-2">
              {[
                { name: 'Kayu Parquet', color: '#fef3c7' },
                { name: 'Keramik Pink', color: '#fbcfe8' },
                { name: 'Keramik Putih', color: '#ffffff' },
                { name: 'Biru Lembut', color: '#bae6fd' },
              ].map((f) => (
                <button
                  key={f.color}
                  onClick={() => setFloorColor(f.color)}
                  style={{ backgroundColor: f.color }}
                  className={`w-7 h-7 rounded-full border-2 ${floorColor === f.color ? 'border-pink-600 scale-110' : 'border-slate-300'}`}
                  title={f.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN TOP-DOWN HOUSE VIEWPORT */}
      <div
        onClick={handleFloorClick}
        style={{
          backgroundColor: floorColor,
          borderColor: wallColor,
          transform: `rotate(${roomRotation}deg)`,
          transition: 'transform 0.4s ease-in-out',
        }}
        className="w-full flex-1 rounded-3xl border-8 shadow-inner relative overflow-hidden cursor-crosshair min-h-[380px]"
      >
        {/* Decorative Wall Base & Wallpaper Accent */}
        <div
          style={{ backgroundColor: wallColor }}
          className="absolute top-0 inset-x-0 h-10 border-b-2 border-pink-200/50 flex items-center justify-between px-3 text-xs opacity-80"
        >
          <span>🖼️ Foto Sahabat</span>
          <span>🎀 Cermin Bulat</span>
          <span>⭐ Jam Dinding</span>
        </div>

        {/* Fluffy Rug in Living Room */}
        <div className="absolute top-[52%] left-[42%] w-24 h-24 rounded-full bg-pink-100/70 border border-pink-200 pointer-events-none"></div>

        {/* FURNITURE ITEMS IN HOUSE */}
        {furnitureList.map((item) => {
          const isSelected = selectedFurniture?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                if (isEditMode) {
                  e.stopPropagation();
                  setSelectedFurniture(item);
                }
              }}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              }}
              className={`absolute flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                isEditMode
                  ? isSelected
                    ? 'ring-4 ring-amber-400 bg-amber-100/80 cursor-grab scale-110 z-30'
                    : 'ring-2 ring-pink-300 hover:ring-pink-500 cursor-pointer bg-white/60 z-10'
                  : 'pointer-events-none'
              }`}
            >
              <span className="text-3xl filter drop-shadow-xs">{item.emoji}</span>
              <span className="text-[9px] font-black text-slate-700 bg-white/80 px-1.5 py-0.2 rounded-full shadow-xs whitespace-nowrap mt-0.5">
                {item.name}
              </span>
            </div>
          );
        })}

        {/* CHIBI HUMAN AVATAR (Walks, sits, sleeps inside room) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusModal('human');
          }}
          style={{
            left: `${avatarPos.x}%`,
            top: `${avatarPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-40 transition-all duration-300 cursor-pointer"
        >
          <ChibiAvatar
            avatar={avatar}
            size={95}
            action={avatarAction}
            showBubble={speechBubble || undefined}
            isOwner={isOwner}
            nameTag={avatar.name}
          />
        </div>

        {/* CHIBI PET (Follows human nearby) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusModal('pet');
          }}
          style={{
            left: `${avatarPos.x + 14}%`,
            top: `${avatarPos.y + 6}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-40 transition-all duration-300 cursor-pointer"
        >
          <ChibiPet pet={pet} size={50} action={avatarAction === 'walk' ? 'walk' : 'jump'} />
        </div>
      </div>

      {/* EDIT FURNITURE TOOLBAR (Visible in Edit Mode) */}
      {isEditMode && selectedFurniture && (
        <div className="bg-white p-2.5 rounded-2xl border-2 border-amber-400 shadow-lg mt-2 flex items-center justify-between z-30 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedFurniture.emoji}</span>
            <div>
              <div className="font-black text-xs text-slate-800">{selectedFurniture.name}</div>
              <div className="text-[10px] text-slate-500">Geser atau putar perabot</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleMoveFurniture(-5, 0)}
              className="w-7 h-7 bg-slate-100 rounded-lg font-bold text-xs"
            >
              ←
            </button>
            <button
              onClick={() => handleMoveFurniture(5, 0)}
              className="w-7 h-7 bg-slate-100 rounded-lg font-bold text-xs"
            >
              →
            </button>
            <button
              onClick={() => handleMoveFurniture(0, -5)}
              className="w-7 h-7 bg-slate-100 rounded-lg font-bold text-xs"
            >
              ↑
            </button>
            <button
              onClick={() => handleMoveFurniture(0, 5)}
              className="w-7 h-7 bg-slate-100 rounded-lg font-bold text-xs"
            >
              ↓
            </button>
            <button
              onClick={handleRotateFurniture}
              className="px-2 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-lg"
            >
              🔄 Putar
            </button>
            <button
              onClick={handleDeleteFurniture}
              className="px-2 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-lg"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* 3. BOTTOM HUMAN/PET CARE BUTTONS: Makan, Main, Mandi, Tidur, Ganti Baju */}
      {!isEditMode && (
        <div className="grid grid-cols-5 gap-1.5 mt-2 z-20">
          <button
            onClick={() => handleAction('makan')}
            className="flex flex-col items-center py-2 bg-white hover:bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-lg">🥞</span>
            <span className="text-[10px] font-black text-slate-700">Makan</span>
          </button>
          <button
            onClick={() => handleAction('main')}
            className="flex flex-col items-center py-2 bg-white hover:bg-pink-50 rounded-2xl border-2 border-pink-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-lg">🎾</span>
            <span className="text-[10px] font-black text-slate-700">Main</span>
          </button>
          <button
            onClick={() => handleAction('mandi')}
            className="flex flex-col items-center py-2 bg-white hover:bg-sky-50 rounded-2xl border-2 border-sky-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-lg">🫧</span>
            <span className="text-[10px] font-black text-slate-700">Mandi</span>
          </button>
          <button
            onClick={() => handleAction('tidur')}
            className="flex flex-col items-center py-2 bg-white hover:bg-indigo-50 rounded-2xl border-2 border-indigo-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-lg">🛏️</span>
            <span className="text-[10px] font-black text-slate-700">Tidur</span>
          </button>
          <button
            onClick={() => handleAction('ganti_baju')}
            className="flex flex-col items-center py-2 bg-white hover:bg-purple-50 rounded-2xl border-2 border-purple-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-lg">👗</span>
            <span className="text-[10px] font-black text-slate-700">Ganti Baju</span>
          </button>
        </div>
      )}

      {/* POPUP STATUS MODAL: Human or Pet Status */}
      {showStatusModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-4 w-full max-w-[320px] border-4 border-pink-300 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm text-slate-800">
                {showStatusModal === 'human' ? `Status Avatar: ${avatar.name}` : `Status Pet: ${pet.name}`}
              </h3>
              <button
                onClick={() => setShowStatusModal(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {showStatusModal === 'human' ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <ChibiAvatar avatar={avatar} size={70} />
                  <div>
                    <div className="font-black text-sm text-slate-900">{avatar.name}</div>
                    <div className="text-[10px] font-bold text-pink-600">
                      {avatar.gender === 'cewek' ? 'Cewek Cantik Rambut Hitam' : 'Cowok Keren Rambut Hitam'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Outfit: {avatar.outfitName}</div>
                  </div>
                </div>
                <div className="bg-pink-50 p-2.5 rounded-2xl border border-pink-200 space-y-1">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>Energi Avatar</span>
                    <span className="text-emerald-600">100% Penuh ⚡</span>
                  </div>
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>Suasana Hati</span>
                    <span className="text-pink-600">Sangat Bahagia 💕</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <ChibiPet pet={pet} size={65} action="jump" />
                  <div>
                    <div className="font-black text-sm text-slate-900">{pet.name} (Lv.{pet.level})</div>
                    <div className="text-[10px] font-bold text-pink-600">Makanan: {pet.favoriteFood}</div>
                    <div className="text-[10px] text-amber-600 font-bold">XP: {pet.xp} / 100</div>
                  </div>
                </div>
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[10px]">
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Lapar</span>
                      <span>{pet.hunger}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pet.hunger}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Senang</span>
                      <span>{pet.happiness}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-pink-400 h-full rounded-full" style={{ width: `${pet.happiness}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Sayang</span>
                      <span>{pet.love}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pet.love}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
