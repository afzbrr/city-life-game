import React from 'react';
import { AvatarState } from '../types/game';
import AvatarManusia from './AvatarManusia';
import { AvatarConfig, AvatarAnimState, FaceExpression } from '../game/types';

interface ChibiAvatarProps {
  avatar: AvatarState;
  size?: number;
  action?: 'stand' | 'walk' | 'sit' | 'sleep' | 'wave' | 'dance';
  faceExpression?: FaceExpression;
  showBubble?: string;
  isOwner?: boolean;
  isCouple?: boolean;
  nameTag?: string;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

/**
 * ADAPTER KOMPONEN AVATAR
 * - Menampilkan 3D Manusia Kartun Mulus (<AvatarManusia />)
 */
export default function ChibiAvatar({
  avatar,
  size = 180,
  action = 'stand',
  faceExpression = 'senyum',
  showBubble,
  isOwner = false,
  isCouple = false,
  nameTag,
  onClick,
  className = '',
  interactive,
}: ChibiAvatarProps) {
  const isGirl = avatar.gender === 'cewek';

  const config: AvatarConfig = {
    gender: avatar.gender,
    ageGroup: 'dewasa',
    skinColor: avatar.skinColor === 'putih' ? '#fff0ea' : '#ffe0b2',
    hairStyle: avatar.hairStyle || (isGirl ? 'cewe_long_hair' : 'cowo_two_block'),
    hairColor: avatar.hairColor || '#18181b',
    top: avatar.outfitId || (isGirl ? 'cardigan_pink' : 'hoodie_biru'),
    bottom: isGirl ? 'rok_plisket_biru' : 'jeans_denim',
    shoes: avatar.shoesId || (isGirl ? 'mary_jane_black' : 'sneakers_biru_putih'),
    hat: 'none',
    glasses: 'none',
    accessory: avatar.accessoryId || (isGirl ? 'pita_pink' : 'none'),
    faceExpression,
  };

  const animState: AvatarAnimState =
    action === 'stand' ? 'idle' : (action as AvatarAnimState);

  const canDrag = interactive !== undefined ? interactive : size >= 90;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
    >
      {(nameTag || isOwner) && (
        <div className="absolute -top-3 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-pink-400/50 shadow-md">
          {isOwner && <span>👑</span>}
          <span>{nameTag || avatar.name}</span>
        </div>
      )}

      {showBubble && (
        <div className="absolute -top-10 z-30 bg-white text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-2xl shadow-lg border-2 border-pink-300 animate-bounce whitespace-nowrap">
          <span>{showBubble}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white" />
        </div>
      )}

      <AvatarManusia
        config={config}
        action={animState}
        size={size}
        interactive={canDrag}
      />
    </div>
  );
}
