import React from 'react';
import ChibiAvatar from './ChibiAvatar';
import ChibiPet from './ChibiPet';
import { AvatarState, PetState } from '../types/game';

interface SplashScreenProps {
  onStart: () => void;
  onOpenAvatarCreator: () => void;
}

export default function SplashScreen({ onStart, onOpenAvatarCreator }: SplashScreenProps) {
  // Demo Humans: Cewe rambut hitam baju pink & Cowo rambut hitam baju biru
  const demoGirl: AvatarState = {
    name: 'Ayu',
    gender: 'cewek',
    skinColor: 'putih',
    faceShape: 'bulat',
    eyeType: 'gemoy',
    eyeColor: 'pink',
    hairStyle: 'kepang2',
    hairColor: '#111111',
    eyebrows: 'tipis',
    mouth: 'senyum',
    blush: 'pink',
    height: 'normal',
    outfitId: 'outfit_pink',
    outfitName: 'Hoodie Pink Gemoy',
    outfitType: 'pink_cewe',
    accessoryId: 'cat_ears',
    shoesId: 'sneakers_pink',
  };

  const demoBoy: AvatarState = {
    name: 'Faiz',
    gender: 'cowok',
    skinColor: 'kuning_langsat',
    faceShape: 'oval',
    eyeType: 'gemoy',
    eyeColor: 'biru',
    hairStyle: 'wolf_cut',
    hairColor: '#111111',
    eyebrows: 'tebal',
    mouth: 'senyum',
    blush: 'none',
    height: 'normal',
    outfitId: 'outfit_blue',
    outfitName: 'Hoodie Biru Keren',
    outfitType: 'biru_cowo',
    accessoryId: 'none',
    shoesId: 'sneakers_blue',
  };

  // 4 Demo Pets
  const demoPets: PetState[] = [
    { id: '1', name: 'Milo', type: 'kucing', level: 8, xp: 50, favoriteFood: 'Ikan 🐟', hunger: 90, happiness: 95, energy: 85, hygiene: 90, love: 92 },
    { id: '2', name: 'Sharky', type: 'hiu', level: 12, xp: 80, favoriteFood: 'Donat 🍩', hunger: 85, happiness: 90, energy: 95, hygiene: 90, love: 88 },
    { id: '3', name: 'Mochi', type: 'kelinci', level: 6, xp: 40, favoriteFood: 'Wortel 🥕', hunger: 95, happiness: 98, energy: 90, hygiene: 95, love: 96 },
    { id: '4', name: 'Pio', type: 'ayam', level: 5, xp: 30, favoriteFood: 'Jagung 🌽', hunger: 88, happiness: 92, energy: 85, hygiene: 88, love: 90 },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-pink-100 via-rose-50 to-amber-50 flex flex-col justify-between items-center p-4 relative overflow-hidden select-none">
      
      {/* Pastel Clouds & Floating Stars */}
      <div className="absolute top-4 left-6 text-2xl animate-pulse">☁️</div>
      <div className="absolute top-10 right-8 text-2xl animate-pulse delay-300">✨</div>
      <div className="absolute top-28 left-4 text-xl opacity-60">🌸</div>
      <div className="absolute top-32 right-6 text-xl opacity-60">🎈</div>

      {/* Pastel City Skyline Silhouette (Buildings) */}
      <div className="absolute bottom-28 inset-x-0 h-32 flex items-end justify-center gap-1.5 opacity-35 pointer-events-none">
        <div className="w-12 h-24 bg-pink-300 rounded-t-xl flex flex-col items-center pt-2 gap-1.5">
          <div className="w-6 h-3 bg-white rounded-xs"></div>
          <div className="w-6 h-3 bg-white rounded-xs"></div>
        </div>
        <div className="w-16 h-30 bg-sky-300 rounded-t-2xl flex flex-col items-center pt-2 gap-1.5">
          <div className="w-8 h-4 bg-white rounded-xs"></div>
          <div className="w-8 h-4 bg-white rounded-xs"></div>
        </div>
        <div className="w-14 h-20 bg-amber-300 rounded-t-xl flex flex-col items-center pt-2 gap-1">
          <div className="w-7 h-3 bg-white rounded-xs"></div>
        </div>
        <div className="w-16 h-28 bg-purple-300 rounded-t-2xl flex flex-col items-center pt-2 gap-1.5">
          <div className="w-8 h-4 bg-white rounded-xs"></div>
          <div className="w-8 h-4 bg-white rounded-xs"></div>
        </div>
        <div className="w-12 h-22 bg-rose-300 rounded-t-xl flex flex-col items-center pt-2 gap-1">
          <div className="w-6 h-3 bg-white rounded-xs"></div>
        </div>
      </div>

      {/* Header: Logo CITY LIFE */}
      <div className="pt-6 text-center z-10">
        <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-xs border-2 border-pink-300 px-3 py-1 rounded-full text-xs font-black text-pink-600 mb-2 shadow-xs">
          <span>💖</span> GAME KAWAI CHIBI INDONESIA
        </div>
        <h1 className="text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 font-['Fredoka'] drop-shadow-sm">
          CITY LIFE
        </h1>
        <p className="text-xs text-slate-600 font-bold mt-0.5">
          Dunia Chibi Penuh Petualangan, Sahabat & Hewan Lucu!
        </p>
      </div>

      {/* Center Showcase: 2 Manusia Chibi (Cewe Pink + Cowo Biru) + 4 Pet Chibi */}
      <div className="my-auto flex flex-col items-center z-10 w-full">
        {/* 2 Chibi Humans Center Stage */}
        <div className="flex items-end justify-center gap-5 mb-2">
          {/* Cewe rambut hitam baju pink */}
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-[10px] font-extrabold text-pink-600 bg-pink-100 border border-pink-300 px-2 py-0.5 rounded-full mb-1">
              Ayu (Baju Pink)
            </span>
            <ChibiAvatar avatar={demoGirl} size={115} action="wave" />
          </div>

          {/* Cowo rambut hitam baju biru */}
          <div className="flex flex-col items-center animate-bounce delay-150">
            <span className="text-[10px] font-extrabold text-sky-600 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-full mb-1">
              Faiz (Baju Biru)
            </span>
            <ChibiAvatar avatar={demoBoy} size={115} action="dance" />
          </div>
        </div>

        {/* 4 Pet Chibi Cards Row */}
        <div className="bg-white/85 backdrop-blur-xs border-2 border-pink-300 rounded-3xl p-3 shadow-md w-full max-w-[340px]">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              <span>🐾</span> 4 Pet Chibi Gemoy:
            </span>
            <span className="text-[10px] text-pink-600 font-bold">Lompat Ceria</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {demoPets.map((pet) => (
              <div
                key={pet.id}
                className="bg-pink-50/70 border border-pink-200 rounded-2xl p-1.5 flex flex-col items-center hover:scale-105 transition-transform"
              >
                <ChibiPet pet={pet} size={50} action="jump" />
                <span className="text-[10px] font-black text-slate-800 mt-0.5">{pet.name}</span>
                <span className="text-[8px] text-slate-500 font-medium truncate">{pet.favoriteFood}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Buttons */}
      <div className="w-full max-w-[340px] space-y-2 pb-4 z-10">
        <button
          onClick={onStart}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-base rounded-2xl shadow-lg border-2 border-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 font-['Fredoka']"
        >
          <span>Mulai Main Sekarang</span>
          <span className="text-xl">▶️</span>
        </button>

        <button
          onClick={onOpenAvatarCreator}
          className="w-full py-2.5 bg-white hover:bg-pink-50 text-pink-600 font-extrabold text-xs rounded-xl shadow-xs border-2 border-pink-300 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span>✨</span>
          <span>Kustomisasi Avatar Dulu</span>
          <span>👗</span>
        </button>
      </div>

    </div>
  );
}
