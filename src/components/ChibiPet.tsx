import React from 'react';
import { PetState, PetType } from '../types/game';

interface ChibiPetProps {
  pet: PetState;
  size?: number;
  showEvolution?: boolean;
  action?: 'idle' | 'walk' | 'jump' | 'sleep';
  onClick?: () => void;
  className?: string;
}

export default function ChibiPet({
  pet,
  size = 70,
  showEvolution = false,
  action = 'idle',
  onClick,
  className = '',
}: ChibiPetProps) {
  // Determine pet evolution stage based on level
  const isBaby = pet.level <= 5;
  const isTeen = pet.level > 5 && pet.level <= 15;
  const isAdult = pet.level > 15 && pet.level <= 30;
  const isMegaEvolution = pet.level > 30 || showEvolution;

  // Scale based on stage
  const scale = isBaby ? 0.78 : isTeen ? 0.95 : isAdult ? 1.05 : 1.35;

  let animClass = '';
  if (action === 'jump') animClass = 'animate-bounce';
  else if (action === 'walk') animClass = 'animate-chibi-bounce';
  else animClass = 'animate-chibi-wiggle';

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Mega Evolution Glow & Sparkle */}
      {isMegaEvolution && (
        <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-md animate-pulse"></div>
      )}

      <div
        style={{ transform: `scale(${scale})` }}
        className={`w-full h-full flex items-center justify-center transition-transform ${animClass}`}
      >
        {/* PET 1: KUCING PUTIH PITA PINK */}
        {pet.type === 'kucing' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Shadow */}
            <ellipse cx="50" cy="92" rx="28" ry="6" fill="rgba(15, 23, 42, 0.15)" />
            {/* Tail */}
            <path d="M72 75 Q88 65 82 50 Q78 45 74 52" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="50" cy="72" rx="24" ry="18" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="46" r="24" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
            {/* Ears with pink inner */}
            <polygon points="30,34 22,12 42,22" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
            <polygon points="30,30 25,18 38,24" fill="#fbcfe8" />
            <polygon points="70,34 78,12 58,22" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
            <polygon points="70,30 75,18 62,24" fill="#fbcfe8" />
            {/* Eyes */}
            <ellipse cx="40" cy="45" rx="5" ry="6.5" fill="#0284c7" />
            <circle cx="42" cy="43" r="2.2" fill="#ffffff" />
            <ellipse cx="60" cy="45" rx="5" ry="6.5" fill="#0284c7" />
            <circle cx="62" cy="43" r="2.2" fill="#ffffff" />
            {/* Nose & mouth */}
            <polygon points="50,52 48,50 52,50" fill="#f43f5e" />
            <path d="M46 54 Q48 57 50 54 Q52 57 54 54" stroke="#c2410c" strokeWidth="1.5" fill="none" />
            {/* Pink Ribbon on neck */}
            <g transform="translate(42, 60)">
              <polygon points="0,4 8,0 8,8" fill="#f43f5e" />
              <polygon points="16,4 8,0 8,8" fill="#f43f5e" />
              <circle cx="8" cy="4" r="3" fill="#fb7185" />
            </g>
            {/* Sultan Crown if Mega Evolution */}
            {isMegaEvolution && (
              <polygon points="40,20 45,6 50,14 55,6 60,20" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            )}
          </svg>
        )}

        {/* PET 2: HIU KECIL GEMOY (FAVORIT DONAT) */}
        {pet.type === 'hiu' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <ellipse cx="50" cy="90" rx="26" ry="6" fill="rgba(15, 23, 42, 0.15)" />
            {/* Tail Fin */}
            <polygon points="15,48 2,34 2,62" fill="#38bdf8" />
            {/* Dorsal Fin */}
            <polygon points="50,28 42,6 62,25" fill="#38bdf8" />
            {/* Round Chibi Shark Body */}
            <ellipse cx="50" cy="55" rx="34" ry="24" fill="#38bdf8" />
            {/* White belly */}
            <ellipse cx="54" cy="62" rx="26" ry="15" fill="#f0f9ff" />
            {/* Big Shiny Eye */}
            <circle cx="68" cy="48" r="6.5" fill="#0f172a" />
            <circle cx="70" cy="45" r="2.8" fill="#ffffff" />
            {/* Cheerful Smile */}
            <path d="M62 60 Q68 68 76 60" stroke="#0369a1" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Donut Float Ring if Mega Evolution */}
            {isMegaEvolution && (
              <g transform="translate(32, 62)">
                <ellipse cx="18" cy="8" rx="22" ry="9" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
                <ellipse cx="18" cy="8" rx="10" ry="4" fill="#38bdf8" />
              </g>
            )}
          </svg>
        )}

        {/* PET 3: KELINCI PUTIH-PINK (FAVORIT WORTEL) */}
        {pet.type === 'kelinci' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <ellipse cx="50" cy="92" rx="24" ry="5.5" fill="rgba(15, 23, 42, 0.15)" />
            {/* Tall Ears with pink inner */}
            <ellipse cx="38" cy="22" rx="7" ry="20" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
            <ellipse cx="38" cy="22" rx="4" ry="14" fill="#fbcfe8" />
            <ellipse cx="62" cy="22" rx="7" ry="20" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
            <ellipse cx="62" cy="22" rx="4" ry="14" fill="#fbcfe8" />
            {/* Body */}
            <ellipse cx="50" cy="74" rx="22" ry="16" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1.5" />
            {/* Fluffy tail */}
            <circle cx="28" cy="74" r="6" fill="#ffffff" />
            {/* Head */}
            <circle cx="50" cy="52" r="22" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1.5" />
            {/* Blushing cheeks */}
            <circle cx="36" cy="58" r="4.5" fill="#f43f5e" opacity="0.4" />
            <circle cx="64" cy="58" r="4.5" fill="#f43f5e" opacity="0.4" />
            {/* Eyes */}
            <ellipse cx="42" cy="50" rx="4" ry="5.5" fill="#e11d48" />
            <circle cx="43" cy="48" r="2" fill="#ffffff" />
            <ellipse cx="58" cy="50" rx="4" ry="5.5" fill="#e11d48" />
            <circle cx="59" cy="48" r="2" fill="#ffffff" />
            {/* Twitching nose */}
            <polygon points="50,56 48,54 52,54" fill="#f43f5e" />
          </svg>
        )}

        {/* PET 4: AYAM KUNING CANGKANG TELUR (FAVORIT JAGUNG) */}
        {pet.type === 'ayam' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <ellipse cx="50" cy="92" rx="22" ry="5" fill="rgba(15, 23, 42, 0.15)" />
            {/* Round Yellow Body */}
            <circle cx="50" cy="50" r="26" fill="#fde047" stroke="#facc15" strokeWidth="1.5" />
            {/* Egg shell on head/bottom */}
            <path
              d="M26 62 L32 54 L40 62 L50 54 L60 62 L68 54 L74 62 C72 78 28 78 26 62 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Eyes */}
            <circle cx="42" cy="45" r="4" fill="#0f172a" />
            <circle cx="43" cy="43" r="1.6" fill="#ffffff" />
            <circle cx="58" cy="45" r="4" fill="#0f172a" />
            <circle cx="59" cy="43" r="1.6" fill="#ffffff" />
            {/* Orange Beak */}
            <polygon points="50,53 44,48 56,48" fill="#ea580c" />
            {/* Red Comb if Mega Evolution */}
            {isMegaEvolution ? (
              <path d="M42 24 C42 12 50 12 50 24 C50 10 58 10 58 24 Z" fill="#ef4444" />
            ) : (
              <circle cx="50" cy="24" r="3.5" fill="#ea580c" />
            )}
          </svg>
        )}
      </div>

      {/* Level Badge */}
      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
        Lv.{pet.level}
      </div>
    </div>
  );
}
