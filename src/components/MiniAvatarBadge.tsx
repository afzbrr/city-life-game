import React from 'react';
import { AvatarState } from '../types/game';

interface MiniAvatarBadgeProps {
  avatar: Pick<AvatarState, 'gender' | 'skinColor' | 'hairColor' | 'outfitType' | 'accessoryId' | 'name'>;
  size?: number;
  status?: 'online' | 'playing' | 'offline';
  className?: string;
}

const SKIN_HEX_MAP: Record<string, string> = {
  putih: '#fff0ea',
  kuning: '#ffe0b2',
  kuning_langsat: '#ffddb3',
  sawo_matang: '#d7a278',
  coklat_muda: '#c68b59',
  coklat_gelap: '#8d5524',
};

export default function MiniAvatarBadge({
  avatar,
  size = 40,
  status,
  className = '',
}: MiniAvatarBadgeProps) {
  const skinHex = avatar.skinColor?.startsWith('#')
    ? avatar.skinColor
    : SKIN_HEX_MAP[avatar.skinColor] || '#ffe4d6';
  const hairHex = avatar.hairColor || '#18181b';
  const shirtHex =
    avatar.outfitType === 'pink_cewe'
      ? '#f472b6'
      : avatar.outfitType === 'biru_cowo'
      ? '#60a5fa'
      : avatar.outfitType === 'sultan'
      ? '#f59e0b'
      : '#a855f7';

  const isGirl = avatar.gender === 'cewek';

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-white/20 flex items-center justify-center overflow-visible ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full rounded-full overflow-hidden"
        aria-label={avatar.name}
      >
        <defs>
          <linearGradient id={`bg-${avatar.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isGirl ? '#fce7f3' : '#dbeafe'} />
            <stop offset="100%" stopColor={isGirl ? '#fbcfe8' : '#bfdbfe'} />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill={`url(#bg-${avatar.name.replace(/\s+/g, '')})`} />

        {/* Back hair for long hair */}
        {isGirl && (
          <path
            d="M15 26 Q14 48 20 56 L44 56 Q50 48 49 26 Q48 10 32 10 Q16 10 15 26 Z"
            fill={hairHex}
          />
        )}

        {/* Torso / Shirt */}
        <path d="M16 64 C16 49 48 49 48 64 Z" fill={shirtHex} />
        <path d="M27 49 L32 54 L37 49 Z" fill="#ffffff" opacity="0.9" />

        {/* Neck */}
        <rect x="28" y="42" width="8" height="9" rx="4" fill={skinHex} />

        {/* Ears */}
        <circle cx="19" cy="30" r="3.5" fill={skinHex} />
        <circle cx="45" cy="30" r="3.5" fill={skinHex} />

        {/* Face */}
        <ellipse cx="32" cy="29" rx="13.5" ry="14" fill={skinHex} />

        {/* Soft Blush */}
        <ellipse cx="23" cy="33" rx="3" ry="1.6" fill="#fb7185" opacity="0.38" />
        <ellipse cx="41" cy="33" rx="3" ry="1.6" fill="#fb7185" opacity="0.38" />

        {/* Expressive Cartoon Eyes */}
        <ellipse cx="26.5" cy="29" rx="2.4" ry="3.1" fill="#18181b" />
        <circle cx="25.8" cy="27.8" r="0.95" fill="#ffffff" />
        <ellipse cx="37.5" cy="29" rx="2.4" ry="3.1" fill="#18181b" />
        <circle cx="36.8" cy="27.8" r="0.95" fill="#ffffff" />

        {/* Eyebrows */}
        <path d="M23.5 24 Q26.5 22.8 29.2 24" stroke={hairHex} strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <path d="M34.8 24 Q37.5 22.8 40.5 24" stroke={hairHex} strokeWidth="1.3" strokeLinecap="round" fill="none" />

        {/* Cute Smile */}
        <path d="M28.5 35.5 Q32 38.2 35.5 35.5" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Top Hair & Bangs Above Eyebrows */}
        {isGirl ? (
          <path
            d="M17.5 26 C17 13 24 9 32 9 C40 9 47 13 46.5 26 C44 19 40 17 32 17 C24 17 20 19 17.5 26 Z"
            fill={hairHex}
          />
        ) : (
          <path
            d="M18 25 C17 13 23 8 32 8 C41 8 47 13 46 25 C43 18 39 16 34 16 C29 16 23 18 18 25 Z"
            fill={hairHex}
          />
        )}

        {/* Accessory hint */}
        {avatar.accessoryId?.includes('cat') && (
          <>
            <polygon points="18,17 22,8 27,15" fill="#ffffff" stroke="#f9a8d4" strokeWidth="1" />
            <polygon points="46,17 42,8 37,15" fill="#ffffff" stroke="#f9a8d4" strokeWidth="1" />
          </>
        )}
        {avatar.accessoryId?.includes('kacamata') && (
          <g stroke="#1e293b" strokeWidth="1.4" fill="none">
            <circle cx="26.5" cy="29" r="4.2" />
            <circle cx="37.5" cy="29" r="4.2" />
            <line x1="30.7" y1="29" x2="33.3" y2="29" />
          </g>
        )}
      </svg>

      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
            status === 'playing'
              ? 'bg-emerald-400'
              : status === 'online'
              ? 'bg-sky-400'
              : 'bg-slate-500'
          }`}
          title={
            status === 'playing'
              ? 'Sedang Bermain'
              : status === 'online'
              ? 'Online'
              : 'Offline'
          }
        />
      )}
    </div>
  );
}
