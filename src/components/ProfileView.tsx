import React from 'react';
import ChibiAvatar from './ChibiAvatar';
import ChibiPet from './ChibiPet';
import { AvatarState, PetState, TelegramUser } from '../types/game';

interface ProfileViewProps {
  avatar: AvatarState;
  pet: PetState;
  coins: number;
  telegramUser?: TelegramUser;
  isOwner?: boolean;
  onOpenAvatarCreator: () => void;
  onOpenTransfer: () => void;
}

export default function ProfileView({
  avatar,
  pet,
  coins,
  telegramUser,
  isOwner = false,
  onOpenAvatarCreator,
  onOpenTransfer,
}: ProfileViewProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-3 select-none relative overflow-y-auto no-scrollbar bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50 space-y-3">
      
      {/* 1. TOP CITIZEN ID CARD */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-4 text-white shadow-lg border-2 border-pink-300 relative overflow-hidden">
        
        {/* Glow & Owner Badge */}
        {isOwner && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full border border-yellow-200 shadow-md">
            👑 OWNER CITY LIFE
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/20 rounded-2xl border border-white/40">
            <ChibiAvatar avatar={avatar} size={70} isOwner={isOwner} />
          </div>
          <div className="truncate">
            <div className="text-[10px] text-pink-200 uppercase font-black tracking-widest">
              KARTU IDENTITAS WARGA
            </div>
            <h2 className="font-black text-base text-white truncate">
              {telegramUser?.first_name || avatar.name}
            </h2>
            <div className="text-xs text-pink-100 font-bold truncate">
              {telegramUser?.username ? `@${telegramUser.username}` : '@faiz_chibi'}
            </div>
            {telegramUser?.id && (
              <div className="text-[9px] text-pink-200 font-medium">
                Telegram ID: {telegramUser.id}
              </div>
            )}
          </div>
        </div>

        {/* Balance & Stats Row */}
        <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/15 p-2 rounded-2xl border border-white/20">
            <span className="text-[10px] text-pink-100 block">Total Koin</span>
            <span className="font-black text-sm text-yellow-300">
              🪙 {isOwner ? 'INFINITY' : coins.toLocaleString()}
            </span>
          </div>
          <div className="bg-white/15 p-2 rounded-2xl border border-white/20">
            <span className="text-[10px] text-pink-100 block">Status Akun</span>
            <span className="font-black text-xs text-white">
              {isOwner ? '👑 Sultan Owner' : '🌟 Warga Teladan'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PET COMPANION STREAK */}
      <div className="bg-white rounded-3xl p-3 border-2 border-pink-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
            <span>🐾</span> Pet Kesayangan Bersama:
          </span>
          <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
            🔥 Streak 7 Hari
          </span>
        </div>
        <div className="flex items-center gap-3 bg-pink-50/50 p-2.5 rounded-2xl border border-pink-100">
          <ChibiPet pet={pet} size={50} action="jump" />
          <div>
            <div className="font-black text-xs text-slate-900">{pet.name} (Lv.{pet.level})</div>
            <div className="text-[10px] text-slate-500 font-bold">Makanan: {pet.favoriteFood}</div>
            <div className="text-[10px] text-rose-500 font-extrabold mt-0.5">
              Tingkat Sayang: {pet.love}% 💕
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS: EDIT AVATAR & TRANSFER COIN */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenAvatarCreator}
          className="py-2.5 bg-white hover:bg-pink-50 border-2 border-pink-300 text-pink-700 font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>👗</span>
          <span>Edit Avatar</span>
        </button>
        <button
          onClick={onOpenTransfer}
          className="py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>💸</span>
          <span>Transfer Koin</span>
        </button>
      </div>

      {/* 4. RIWAYAT TRANSFER TRANSAKSI DUMMY */}
      <div className="bg-white rounded-3xl p-3 border-2 border-pink-200 shadow-sm space-y-1.5 text-xs">
        <span className="font-black text-slate-800 block text-[11px] mb-1">
          Riwayat Transfer Koin Terakhir:
        </span>
        <div className="p-2 bg-emerald-50 rounded-xl flex items-center justify-between text-[11px] font-bold text-emerald-800">
          <span>Dapat Koin Masuk dari @maya</span>
          <span>+250 🪙</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span>Kirim Hadiah ke @afzbrr</span>
          <span>-100 🪙</span>
        </div>
      </div>

    </div>
  );
}
