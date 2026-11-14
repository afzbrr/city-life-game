import React, { useState } from 'react';
import ChibiAvatar from './ChibiAvatar';
import ChibiPet from './ChibiPet';
import { AvatarState, PetState, CityLocation } from '../types/game';

interface CityViewProps {
  avatar: AvatarState;
  pet: PetState;
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onUpdatePet: (pet: PetState) => void;
  isOwner?: boolean;
}

export default function CityView({
  avatar,
  pet,
  coins,
  onUpdateCoins,
  onUpdatePet,
  isOwner = false,
}: CityViewProps) {
  const [activeLocation, setActiveLocation] = useState<CityLocation | null>(null);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);

  // Partner for dating / activities (Cowo if user is cewe, Cewe if user is cowo)
  const partnerAvatar: AvatarState = {
    name: avatar.gender === 'cewek' ? 'Faiz' : 'Ayu',
    gender: avatar.gender === 'cewek' ? 'cowok' : 'cewek',
    skinColor: avatar.gender === 'cewek' ? 'kuning_langsat' : 'putih',
    faceShape: 'oval',
    eyeType: 'gemoy',
    eyeColor: avatar.gender === 'cewek' ? 'biru' : 'pink',
    hairStyle: avatar.gender === 'cewek' ? 'wolf_cut' : 'kepang2',
    hairColor: '#111111', // Strictly black hair
    eyebrows: 'tebal',
    mouth: 'senyum',
    blush: 'pink',
    height: 'normal',
    outfitId: 'partner',
    outfitName: avatar.gender === 'cewek' ? 'Hoodie Biru Keren' : 'Hoodie Pink Gemoy',
    outfitType: avatar.gender === 'cewek' ? 'biru_cowo' : 'pink_cewe',
    accessoryId: avatar.gender === 'cewek' ? 'none' : 'cat_ears',
    shoesId: 'partner',
  };

  const say = (text: string) => {
    setSpeech(text);
    setTimeout(() => setSpeech(null), 3500);
  };

  // 6 City Locations Info
  const locations = [
    {
      id: 'taman' as CityLocation,
      title: 'Taman Bunga Mentari',
      emoji: '🌳',
      desc: 'Duduk berdua, makan es krim, balon & ayunan.',
      bgGradient: 'from-emerald-400 to-teal-500',
      activities: [
        { name: 'Makan Es Krim Bersama 🍦', cost: 50, rewardExp: 30, text: 'Nyam nyam! Es krim vanila stroberi manis banget!' },
        { name: 'Main Ayunan Berdua 🎡', cost: 0, rewardExp: 20, text: 'Wushhh! Ayunan melambung tinggi tertiup angin sejuk.' },
        { name: 'Beli Balon Pelangi 🎈', cost: 80, rewardExp: 25, text: 'Balon warna-warni terbang menghiasi langit taman!' },
      ],
    },
    {
      id: 'pantai' as CityLocation,
      title: 'Pantai Pasir Putih',
      emoji: '🏖️',
      desc: 'Berenang pelampung bebek, jetski & istana pasir.',
      bgGradient: 'from-cyan-400 to-blue-500',
      activities: [
        { name: 'Naik Jetski Berdua 🏄‍♂️', cost: 500, rewardExp: 80, text: 'Wusshh kencang banget menembus deburan ombak laut!' },
        { name: 'Berenang Pelampung Bebek 🦆', cost: 50, rewardExp: 25, text: 'Berenang santai sambil menikmati hangatnya matahari pantai.' },
        { name: 'Bikin Istana Pasir 🏰', cost: 0, rewardExp: 20, text: 'Kastil megah berhias kerang pelangi selesai dibuat!' },
      ],
    },
    {
      id: 'cafe' as CityLocation,
      title: 'Chibi Cat Cafe',
      emoji: '☕',
      desc: 'Ngedate satu meja berdua, boba & suap-suapan.',
      bgGradient: 'from-amber-400 to-orange-500',
      activities: [
        { name: 'Pesan Boba Brown Sugar 🧋', cost: 100, rewardExp: 35, text: 'Boba kenyal manis bikin mood langsung ceria maksimal!' },
        { name: 'Makan Pancake Madu 🥞', cost: 250, rewardExp: 50, text: 'Pancake hangat disuapin bareng, romantis banget! 💕' },
        { name: 'Ngopi Santai Berdua ☕', cost: 150, rewardExp: 30, text: 'Aroma kopi hazelnut semerbak menenangkan hati.' },
      ],
    },
    {
      id: 'bioskop' as CityLocation,
      title: 'Mega Cinema 21',
      emoji: '🎬',
      desc: 'Pilih film seru, lampu mati & makan popcorn karamel.',
      bgGradient: 'from-purple-500 to-indigo-600',
      activities: [
        { name: 'Nonton Film Chibi Romantis 🎟️', cost: 150, rewardExp: 40, text: 'Lampu bioskop mati... film seru bikin baper & tertawa bareng!' },
        { name: 'Beli Popcorn Karamel Jumbo 🍿', cost: 100, rewardExp: 25, text: 'Popcorn renyah manis menemani serunya film.' },
      ],
    },
    {
      id: 'pasar_malam' as CityLocation,
      title: 'Pasar Malam Festival',
      emoji: '🎡',
      desc: 'Bianglala berdua, capit boneka, cilok & jagung bakar.',
      bgGradient: 'from-rose-500 to-pink-600',
      activities: [
        { name: 'Naik Bianglala Romantis 🎡', cost: 300, rewardExp: 60, text: 'Melihat gemerlap lampu seluruh kota dari puncak bianglala!' },
        { name: 'Capit Boneka Beruang 🧸', cost: 150, rewardExp: 45, text: 'Hore! Capit berhasil dan dapat boneka beruang gemoy!' },
        { name: 'Beli Jagung Bakar & Cilok 🌽', cost: 50, rewardExp: 20, text: 'Jajanan pasar malam gurih pedas manis yang bikin nagih!' },
      ],
    },
    {
      id: 'aquarium' as CityLocation,
      title: 'Ocean Wonderland Aquarium',
      emoji: '🐬',
      desc: 'Terowongan kaca laut, hiu, ubur-ubur neon & nemo.',
      bgGradient: 'from-blue-600 to-indigo-900',
      activities: [
        {
          name: 'Terowongan Hiu & Ikan Pari 🦈',
          cost: 300,
          rewardExp: 70,
          text: pet.type === 'hiu'
            ? 'Sharky ngerasa kayak pulang kampung! Bonus Sayang +20! 🦈🌊'
            : 'Ikan pari dan hiu berenang anggun di atas terowongan kaca!',
        },
        { name: 'Foto di Tangki Ubur-ubur Neon 🪼', cost: 100, rewardExp: 35, text: 'Cahaya neon pink & ungu ubur-ubur estetik banget!' },
        { name: 'Beli Minuman Biru Laut 🥤', cost: 100, rewardExp: 25, text: 'Segarnya minuman soda biru bersoda dingin!' },
      ],
    },
  ];

  const handleDoActivity = (act: { name: string; cost: number; rewardExp: number; text: string }) => {
    if (coins < act.cost) {
      say('Koin kamu tidak cukup untuk aktivitas ini! 🪙');
      return;
    }
    if (act.cost > 0) {
      onUpdateCoins(-act.cost);
    }
    setActiveActivity(act.name);
    say(act.text);

    // Shark bonus in aquarium
    if (activeLocation === 'aquarium' && pet.type === 'hiu') {
      onUpdatePet({ ...pet, love: Math.min(100, pet.love + 20), happiness: 100 });
    } else {
      onUpdatePet({ ...pet, happiness: Math.min(100, pet.happiness + 20) });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 select-none relative overflow-hidden bg-gradient-to-b from-sky-50 via-pink-50 to-amber-50">
      
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between z-20 mb-2">
        <div>
          <h2 className="font-black text-sm text-slate-800 flex items-center gap-1.5 font-['Fredoka']">
            <span>🏙️</span> KOTA CITY LIFE
          </h2>
          <p className="text-[10px] text-slate-500 font-bold">
            Pilih destinasi seru untuk jalan-jalan & ngedate!
          </p>
        </div>
        <div className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black">
          🪙 {coins.toLocaleString()}
        </div>
      </div>

      {/* 2. IF NOT INSIDE LOCATION: SHOW 6 INTERACTIVE CARDS WITH CHIBI IN FRONT */}
      {!activeLocation && (
        <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto no-scrollbar py-1">
          {locations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => {
                setActiveLocation(loc.id);
                say(`Tiba di ${loc.title}! Ayo nikmati suasananya! ✨`);
              }}
              className="bg-white rounded-3xl p-3 border-2 border-pink-200/90 shadow-sm hover:border-pink-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-97 relative overflow-hidden group"
            >
              {/* Card Header Gradient */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${loc.bgGradient}`} />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
                    {loc.emoji}
                  </span>
                  <span className="text-[9px] font-black bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    Kunjungi
                  </span>
                </div>
                <h3 className="font-black text-xs text-slate-800 leading-tight">
                  {loc.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                  {loc.desc}
                </p>
              </div>

              {/* Mini Chibi Human standing in front of destination illustration */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <ChibiAvatar avatar={avatar} size={34} />
                  <ChibiPet pet={pet} size={22} />
                </div>
                <span className="text-[10px] font-bold text-pink-600">Masuk →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. INSIDE DESTINATION LOCATION VIEWPORT */}
      {activeLocation && (
        <div className="flex-1 flex flex-col justify-between bg-white rounded-3xl border-4 border-pink-300 shadow-xl overflow-hidden relative p-3">
          
          {/* Destination Header Bar */}
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {locations.find((l) => l.id === activeLocation)?.emoji}
              </span>
              <div>
                <h3 className="font-black text-xs text-slate-800 leading-none">
                  {locations.find((l) => l.id === activeLocation)?.title}
                </h3>
                <span className="text-[10px] text-pink-600 font-bold">
                  {activeActivity || 'Sedang Jalan-Jalan Santai'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveLocation(null);
                setActiveActivity(null);
              }}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full cursor-pointer"
            >
              ← Keluar
            </button>
          </div>

          {/* Real Animated Scene Canvas Inside Venue */}
          <div className="w-full flex-1 bg-gradient-to-b from-sky-100 to-amber-50 rounded-2xl border-2 border-pink-200 relative flex items-center justify-center overflow-hidden p-2">
            
            {/* Background Venue Atmosphere Decor */}
            {activeLocation === 'aquarium' && (
              <div className="absolute inset-0 bg-blue-950 text-white flex flex-col items-center justify-between p-3 opacity-95">
                <div className="w-full text-center text-xs text-cyan-300 font-black animate-pulse">
                  🌊 TEROWONGAN BAWAH LAUT AQUARIUM 🦈
                </div>
                <div className="flex justify-around w-full text-3xl opacity-60">
                  <span className="animate-bounce">🦈</span>
                  <span className="animate-pulse">🪼</span>
                  <span className="animate-bounce delay-150">🐠</span>
                  <span className="animate-pulse delay-300">🐢</span>
                </div>
              </div>
            )}

            {activeLocation === 'cafe' && (
              <div className="absolute top-2 inset-x-0 text-center text-[10px] font-bold text-amber-800 bg-amber-100/70 py-1 rounded-lg">
                ☕ Meja Romantis Lilin & Secangkir Kopi Boba
              </div>
            )}

            {activeLocation === 'pantai' && (
              <div className="absolute top-2 inset-x-0 text-center text-[10px] font-bold text-blue-800 bg-blue-100/70 py-1 rounded-lg">
                🏖️ Deburan Ombak Biru & Istana Pasir Cantik
              </div>
            )}

            {/* Both Avatars Dating / Playing + Pet Right There! */}
            <div className="relative z-10 flex items-end justify-center gap-6">
              {/* User Avatar */}
              <div className="flex flex-col items-center">
                <ChibiAvatar
                  avatar={avatar}
                  size={105}
                  action="dance"
                  showBubble={speech || undefined}
                  isOwner={isOwner}
                  nameTag={avatar.name}
                />
              </div>

              {/* Pet Chibi */}
              <div className="flex flex-col items-center">
                <ChibiPet pet={pet} size={50} action="jump" />
              </div>

              {/* Partner Avatar (Date / Friend) */}
              <div className="flex flex-col items-center">
                <ChibiAvatar
                  avatar={partnerAvatar}
                  size={105}
                  action="wave"
                  nameTag={partnerAvatar.name}
                  isCouple={true}
                />
              </div>
            </div>
          </div>

          {/* Activity Selection Buttons */}
          <div className="mt-2.5 space-y-1.5">
            <span className="text-[10px] font-black text-slate-700 block">
              Pilih Aktivitas di Tempat Ini:
            </span>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
              {locations
                .find((l) => l.id === activeLocation)
                ?.activities.map((act, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleDoActivity(act)}
                    className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                  >
                    <span className="text-xs font-black text-slate-800">{act.name}</span>
                    <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      {act.cost > 0 ? `🪙 ${act.cost}` : 'GRATIS'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
