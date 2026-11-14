import React, { useState } from 'react';
import ChibiAvatar from './ChibiAvatar';
import ChibiPet from './ChibiPet';
import { AvatarState, PetState } from '../types/game';
import { sound } from '../game/soundManager';

interface PhotoBoothModalProps {
  avatar: AvatarState;
  pet: PetState;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

export default function PhotoBoothModal({
  avatar,
  pet,
  isOpen,
  onClose,
  isOwner = false,
}: PhotoBoothModalProps) {
  const [photoMode, setPhotoMode] = useState<'sendiri' | 'berdua'>('berdua');
  const [pose, setPose] = useState<string>('gemoy');
  const [frame, setFrame] = useState<'pink' | 'bintang' | 'hati'>('pink');
  const [filter, setFilter] = useState<'cerah' | 'vintage' | 'biru'>('cerah');
  const [capturedNotice, setCapturedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const partnerAvatar: AvatarState = {
    name: avatar.gender === 'cewek' ? 'Faiz' : 'Ayu',
    gender: avatar.gender === 'cewek' ? 'cowok' : 'cewek',
    skinColor: avatar.gender === 'cewek' ? 'kuning_langsat' : 'putih',
    faceShape: 'oval',
    eyeType: 'gemoy',
    eyeColor: avatar.gender === 'cewek' ? 'biru' : 'pink',
    hairStyle: avatar.gender === 'cewek' ? 'wolf_cut' : 'kepang2',
    hairColor: '#111111',
    eyebrows: 'tebal',
    mouth: 'senyum',
    blush: 'pink',
    height: 'normal',
    outfitId: 'partner',
    outfitName: avatar.gender === 'cewek' ? 'Hoodie Biru' : 'Hoodie Pink',
    outfitType: avatar.gender === 'cewek' ? 'biru_cowo' : 'pink_cewe',
    accessoryId: avatar.gender === 'cewek' ? 'none' : 'cat_ears',
    shoesId: 'partner',
  };

  const handleSavePhoto = () => {
    sound.playPhoto();
    setCapturedNotice('Foto berhasil disimpan ke Galeri HP! 📸💖');
    setTimeout(() => setCapturedNotice(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-3xl p-4 w-full max-w-[340px] border-4 border-pink-400 shadow-2xl flex flex-col justify-between max-h-[92%] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-['Fredoka']">
            <span className="text-xl">📸</span>
            <h3 className="font-black text-sm text-slate-800">STUDIO FOTO CHIBI</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-slate-100 rounded-full font-bold text-xs">
            ✕
          </button>
        </div>

        {capturedNotice && (
          <div className="bg-emerald-50 text-emerald-700 text-xs font-black p-2 rounded-xl border border-emerald-200 text-center animate-bounce mb-1">
            🎉 {capturedNotice}
          </div>
        )}

        {/* PHOTO FRAME PREVIEW */}
        <div
          className={`relative w-full h-[230px] rounded-2xl flex items-center justify-center overflow-hidden border-4 shadow-inner mb-2.5 ${
            frame === 'pink'
              ? 'border-pink-300 bg-pink-50'
              : frame === 'bintang'
              ? 'border-yellow-300 bg-amber-50'
              : 'border-rose-400 bg-rose-50'
          } ${
            filter === 'vintage'
              ? 'sepia-25 brightness-95'
              : filter === 'biru'
              ? 'hue-rotate-15 contrast-105'
              : 'brightness-105'
          }`}
        >
          {/* Frame Decors */}
          <div className="absolute top-2 left-3 text-sm">✨</div>
          <div className="absolute top-2 right-3 text-sm">💖</div>
          <div className="absolute bottom-2 left-3 text-[10px] font-black text-slate-700 bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
            CITY LIFE • {avatar.name}
          </div>

          {/* Avatars on Stage */}
          <div className="flex items-end justify-center gap-4">
            <ChibiAvatar
              avatar={avatar}
              size={120}
              action={pose === 'tidur' ? 'sleep' : 'dance'}
              faceExpression={pose === 'ngedate' ? 'love' : pose === 'sultan' ? 'berbinar' : pose === 'tidur' ? 'ngantuk' : 'kedip_satu'}
              isOwner={isOwner}
            />
            <ChibiPet pet={pet} size={45} action="jump" />
            {photoMode === 'berdua' && (
              <ChibiAvatar
                avatar={partnerAvatar}
                size={120}
                action="wave"
                faceExpression={pose === 'ngedate' ? 'love' : 'senyum_lebar'}
                isCouple={true}
              />
            )}
          </div>
        </div>

        {/* Customizer Controls */}
        <div className="space-y-2 text-xs">
          {/* Mode: Sendiri vs Berdua */}
          <div className="flex gap-2">
            <button
              onClick={() => setPhotoMode('sendiri')}
              className={`flex-1 py-1.5 rounded-xl font-bold border ${
                photoMode === 'sendiri' ? 'bg-pink-500 text-white' : 'bg-slate-50'
              }`}
            >
              Foto Sendiri
            </button>
            <button
              onClick={() => setPhotoMode('berdua')}
              className={`flex-1 py-1.5 rounded-xl font-bold border ${
                photoMode === 'berdua' ? 'bg-pink-500 text-white' : 'bg-slate-50'
              }`}
            >
              Foto Berdua 💕
            </button>
          </div>

          {/* Pose Selector */}
          <div>
            <span className="text-[10px] font-black text-slate-700 block mb-1">Gaya Pose:</span>
            <div className="flex gap-1.5">
              {['gemoy', 'ngedate', 'sultan', 'tidur'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPose(p)}
                  className={`flex-1 py-1 rounded-lg font-black text-[10px] uppercase border capitalize ${
                    pose === p ? 'bg-pink-100 text-pink-700 border-pink-400' : 'bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Selector */}
          <div>
            <span className="text-[10px] font-black text-slate-700 block mb-1">Filter Warna:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'cerah', name: '☀️ Cerah' },
                { id: 'vintage', name: '🎞️ Vintage' },
                { id: 'biru', name: '🌊 Biru Laut' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`flex-1 py-1 rounded-lg font-black text-[10px] border ${
                    filter === f.id ? 'bg-purple-100 text-purple-700 border-purple-400' : 'bg-slate-50'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Photo CTA Button */}
        <button
          onClick={handleSavePhoto}
          className="mt-3 w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>📸</span>
          <span>Save Foto ke Galeri HP</span>
        </button>

      </div>
    </div>
  );
}
