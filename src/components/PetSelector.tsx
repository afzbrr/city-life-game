import React, { useState } from 'react';
import ChibiPet from './ChibiPet';
import { PetState, PetType } from '../types/game';

interface PetSelectorProps {
  currentPet: PetState;
  onSelectPet: (pet: PetState) => void;
  onConfirm: () => void;
}

export const INITIAL_PETS: PetState[] = [
  {
    id: 'kucing',
    name: 'Milo',
    type: 'kucing',
    level: 3,
    xp: 45,
    favoriteFood: 'Ikan Tuna 🐟',
    hunger: 90,
    happiness: 95,
    energy: 90,
    hygiene: 92,
    love: 94,
  },
  {
    id: 'hiu',
    name: 'Sharky',
    type: 'hiu',
    level: 4,
    xp: 60,
    favoriteFood: 'Donat Cokelat 🍩',
    hunger: 85,
    happiness: 90,
    energy: 95,
    hygiene: 90,
    love: 90,
  },
  {
    id: 'kelinci',
    name: 'Mochi',
    type: 'kelinci',
    level: 2,
    xp: 30,
    favoriteFood: 'Wortel Manis 🥕',
    hunger: 95,
    happiness: 98,
    energy: 92,
    hygiene: 96,
    love: 96,
  },
  {
    id: 'ayam',
    name: 'Pio',
    type: 'ayam',
    level: 3,
    xp: 50,
    favoriteFood: 'Biji Jagung 🌽',
    hunger: 88,
    happiness: 92,
    energy: 85,
    hygiene: 88,
    love: 91,
  },
];

export default function PetSelector({ currentPet, onSelectPet, onConfirm }: PetSelectorProps) {
  const [selectedPet, setSelectedPet] = useState<PetState>(currentPet);

  const handlePick = (pet: PetState) => {
    setSelectedPet(pet);
    onSelectPet(pet);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-pink-100 via-rose-50 to-amber-50 flex flex-col justify-between p-4 overflow-hidden select-none">
      
      {/* Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1 bg-white/80 border border-pink-300 px-3 py-1 rounded-full text-xs font-black text-pink-600 mb-1">
          <span>🐾</span> TEMAN SETIA CITY LIFE
        </div>
        <h2 className="text-2xl font-black text-slate-800 font-['Fredoka']">
          PILIH PET CHIBI GEMOY
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Pet selalu menemanimu di Rumah, Kota, dan Sekolah!
        </p>
      </div>

      {/* Selected Pet Big Showcase */}
      <div className="my-auto flex flex-col items-center">
        <div className="relative flex flex-col items-center p-4 bg-white/90 rounded-3xl border-4 border-pink-400 shadow-lg w-full max-w-[280px]">
          {/* Sparkles */}
          <div className="absolute top-2 right-3 text-lg animate-spin">✨</div>
          <div className="absolute top-3 left-3 text-lg animate-bounce">💖</div>

          {/* Big Selected Pet Display */}
          <ChibiPet pet={selectedPet} size={110} action="jump" />

          <div className="text-center mt-2">
            <h3 className="font-black text-lg text-slate-800 leading-none">
              {selectedPet.name}
            </h3>
            <span className="text-[11px] font-bold text-pink-600 uppercase bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full inline-block mt-1">
              {selectedPet.type === 'kucing' && 'Kucing Putih Pita Pink'}
              {selectedPet.type === 'hiu' && 'Hiu Kecil Gemoy'}
              {selectedPet.type === 'kelinci' && 'Kelinci Putih-Pink'}
              {selectedPet.type === 'ayam' && 'Ayam Cangkang Telur'}
            </span>
            <div className="text-xs text-slate-600 font-bold mt-1">
              Makanan Favorit: <span className="text-amber-600">{selectedPet.favoriteFood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pet Selection Cards Grid */}
      <div className="grid grid-cols-2 gap-2 max-w-[340px] mx-auto w-full mb-2">
        {INITIAL_PETS.map((pet) => {
          const isChosen = selectedPet.type === pet.type;
          return (
            <div
              key={pet.id}
              onClick={() => handlePick(pet)}
              className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                isChosen
                  ? 'border-pink-500 bg-pink-100 shadow-md scale-102'
                  : 'border-pink-200 bg-white hover:bg-pink-50'
              }`}
            >
              <ChibiPet pet={pet} size={42} action={isChosen ? 'jump' : 'idle'} />
              <div className="truncate">
                <div className="font-black text-xs text-slate-800 leading-tight">{pet.name}</div>
                <div className="text-[10px] text-pink-600 font-bold truncate">{pet.favoriteFood}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Button */}
      <div className="w-full max-w-[340px] mx-auto">
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm rounded-2xl shadow-lg border-2 border-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Pilih {selectedPet.name} & Lanjut</span>
          <span>🐾</span>
        </button>
      </div>

    </div>
  );
}
