import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Home,
  MessageCircle,
  Play,
  Search,
  Shirt,
  Sparkles,
  Star,
  User,
  Users,
  X,
} from 'lucide-react';
import { GameWorldLocation } from '../game/types';
import { AvatarState } from '../types/game';
import { generateWorldSnapshots, SnapshotKey } from '../game/worldSnapshots';

interface HomeDashboardProps {
  avatar: AvatarState;
  coins: number;
  friendRequestsCount?: number;
  onlineFriendsCount?: number;
  unreadChatCount?: number;
  onEnterWorld: (location: GameWorldLocation) => void;
  onOpenAvatarCreator: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  onOpenFriends: () => void;
}

interface PlaceCardData {
  id: GameWorldLocation;
  title: string;
  subtitle: string;
  onlineCount: number;
  rating: string;
  icon: string;
}

const PLACES: PlaceCardData[] = [
  {
    id: 'taman',
    title: 'TAMAN KOTA',
    subtitle: 'Santai & Main Ayunan',
    onlineCount: 127,
    rating: '4.7',
    icon: '🌳',
  },
  {
    id: 'pantai',
    title: 'PANTAI SUNSET',
    subtitle: 'Main Pasir & Renang',
    onlineCount: 347,
    rating: '4.9',
    icon: '🏖️',
  },
  {
    id: 'cafe',
    title: 'CAFE COZY',
    subtitle: 'Ngopi & Nongkrong',
    onlineCount: 214,
    rating: '4.8',
    icon: '☕',
  },
  {
    id: 'aquarium',
    title: 'AQUARIUM UNDERWATER',
    subtitle: 'Lihat Ikan & Hiu',
    onlineCount: 238,
    rating: '4.9',
    icon: '🦈',
  },
  {
    id: 'pasar_malam',
    title: 'PASAR MALAM',
    subtitle: 'Jajan & Main Wahana',
    onlineCount: 487,
    rating: '4.6',
    icon: '🎡',
  },
];

export default function HomeDashboard({
  avatar,
  coins,
  friendRequestsCount = 0,
  onlineFriendsCount = 0,
  unreadChatCount = 0,
  onEnterWorld,
  onOpenAvatarCreator,
  onOpenChat,
  onOpenProfile,
  onOpenFriends,
}: HomeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [joiningTarget, setJoiningTarget] = useState<PlaceCardData | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'avatar' | 'teman' | 'chat' | 'profil'>('home');
  const [scrollY, setScrollY] = useState<number>(0);

  // Genuine 3D PBR WebGL renders generated once and cached for hero + 5 places
  const snapshots = useMemo<Record<SnapshotKey, string>>(() => {
    try {
      return generateWorldSnapshots();
    } catch {
      return {
        hero_city: '',
        taman: '',
        pantai: '',
        cafe: '',
        aquarium: '',
        pasar_malam: '',
      };
    }
  }, []);

  const filteredPlaces = PLACES.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinPlace = (place: PlaceCardData) => {
    setJoiningTarget(place);
    setTimeout(() => {
      setJoiningTarget(null);
      onEnterWorld(place.id);
    }, 1350);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 text-white flex flex-col font-['Quicksand'] select-none overflow-hidden">
      {/* Subtle atmospheric backdrop glow behind glass cards */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-pink-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* 1. TOP HEADER */}
      <div className="relative bg-slate-900/80 backdrop-blur-md px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-2 z-30 shadow-lg">
        {/* 3D EMBOSSED CITY LIFE LOGO */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="transform -skew-x-8 bg-gradient-to-b from-white via-slate-100 to-slate-300 text-slate-950 font-black italic px-3 py-1 rounded-xl text-xs sm:text-sm font-['Fredoka'] tracking-wide border-t border-white border-b-2 border-b-slate-400 shadow-[0_4px_0_#db2777,0_8px_18px_rgba(236,72,153,0.4)]"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.85)' }}
          >
            CITY LIFE
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 max-w-xs mx-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tempat... (taman, pantai...)"
            className="w-full bg-slate-800/85 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-pink-400 transition-all pl-8 pr-8 shadow-inner"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 shrink-0">
          {/* COINS WITH SLOWLY ROTATING 3D COIN ICON */}
          <div className="bg-gradient-to-b from-amber-500/25 to-amber-600/15 border border-amber-400/45 text-amber-200 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_3px_10px_rgba(245,158,11,0.2)]">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border border-yellow-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-[9px] font-black text-amber-950"
              style={{ transformStyle: 'preserve-3d' }}
            >
              C
            </motion.div>
            <span>{coins.toLocaleString()}</span>
          </div>

          {/* CHAT ICON */}
          <button
            onClick={onOpenChat}
            className="relative w-8 h-8 rounded-full bg-gradient-to-b from-slate-700/90 to-slate-800/95 hover:from-slate-600 hover:to-slate-700 border border-white/15 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-[0_3px_0_rgba(15,23,42,0.9),0_6px_12px_rgba(0,0,0,0.35)]"
            title="Buka Chat"
          >
            <MessageCircle className="w-4 h-4 text-slate-200" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1 rounded-full leading-tight shadow">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* AVATAR PROFILE ICON */}
          <button
            onClick={onOpenAvatarCreator}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 border border-white/60 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-[0_3px_0_#9d174d,0_6px_14px_rgba(236,72,153,0.4)]"
            title="Edit Avatar"
          >
            <Shirt className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <div
        onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-24 max-w-5xl w-full mx-auto"
      >
        {/* HERO BANNER: GENUINE 3D NIGHT CITY SKYLINE RENDER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[24px] overflow-hidden border border-white/20 shadow-[0_18px_36px_rgba(0,0,0,0.5)] min-h-[126px] sm:min-h-[150px] flex items-center justify-between px-4 sm:px-6 py-4"
        >
          {/* 3D Night City Skyline Image with scroll parallax */}
          {snapshots.hero_city ? (
            <img
              src={snapshots.hero_city}
              alt="City Life Night Skyline 3D"
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
              style={{
                transform: `translateY(${Math.min(18, scrollY * 0.08)}px) scale(1.08)`,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
          )}

          {/* Atmospheric dark scrim for crisp readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/35" />

          <div className="relative z-10 max-w-md">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-300 tracking-wider bg-slate-950/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-300/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>KOTA VIRTUAL 3D REALISTIS</span>
            </span>
            <h2
              className="text-base sm:text-xl font-black leading-tight font-['Fredoka'] text-white mt-1.5"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}
            >
              Selamat Datang di CITY LIFE GAME!
            </h2>
            <p
              className="text-[11px] sm:text-xs text-slate-200 font-semibold mt-0.5"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              Jelajahi 5 dunia 3D seru, main wahana &amp; ketemu teman!
            </p>
          </div>

          {/* Custom Elevated 3D Emerald CTA */}
          <button
            onClick={() => handleJoinPlace(PLACES[0])}
            className="relative z-10 shrink-0 bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 active:translate-y-0.5 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl border-t border-emerald-200 border-b-2 border-b-emerald-800 shadow-[0_4px_0_#065f46,0_10px_20px_rgba(16,185,129,0.45)] flex items-center gap-1.5 cursor-pointer transition-all ml-2"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>MAIN</span>
          </button>
        </motion.div>

        {/* SECTION TITLE */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h3 className="text-base font-black font-['Fredoka'] tracking-wide text-slate-100 flex items-center gap-2">
              <span>JELAJAHI KOTA</span>
              <span className="text-[11px] px-2.5 py-0.5 bg-pink-500/20 text-pink-300 rounded-full border border-pink-400/35 font-bold backdrop-blur-sm">
                5 Dunia 3D
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Mau jalan kemana hari ini?
            </p>
          </div>
        </div>

        {/* GRID 2 KOLOM: GLASSMORPHISM 24px ROUNDED CARDS + 3D RENDERS + SCROLL PARALLAX */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 pb-4">
          {filteredPlaces.map((place, idx) => {
            const parallaxY = Math.max(-10, Math.min(12, (scrollY - idx * 30) * 0.045));
            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.46,
                  delay: idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleJoinPlace(place)}
                className="bg-slate-900/65 backdrop-blur-md rounded-[24px] border border-white/15 hover:border-pink-400/60 overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.48)] hover:shadow-[0_18px_36px_rgba(236,72,153,0.24)] transition-colors duration-200 flex flex-col cursor-pointer group"
              >
                {/* ATAS (80% CARD): GENUINE 3D PBR RENDER */}
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-950">
                  {snapshots[place.id] ? (
                    <img
                      src={snapshots[place.id]}
                      alt={place.title}
                      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110 will-change-transform"
                      style={{
                        transform: `translateY(${parallaxY}px) scale(1.07)`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-900">
                      {place.icon}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/80 to-transparent" />
                </div>

                {/* BAWAH (20% CARD): 2 BARIS BERSIH + RATING BEDA + ONLINE BERKEDIP PELAN */}
                <div className="px-3 py-2.5 bg-slate-900/75 backdrop-blur-md flex flex-col justify-center border-t border-white/10">
                  <h4 className="font-black text-xs sm:text-sm text-white font-['Fredoka'] tracking-wide truncate group-hover:text-pink-300 transition-colors">
                    {place.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-bold mt-1">
                    <span className="flex items-center gap-1.5 text-emerald-400 animate-[pulse_2.6s_ease-in-out_infinite]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                      <span>{place.onlineCount} online</span>
                    </span>
                    <span className="text-amber-300 font-black flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{place.rating}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredPlaces.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-900/65 backdrop-blur-md rounded-[24px] border border-white/10 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-xs font-bold">Tidak ada tempat dengan nama &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-black cursor-pointer hover:bg-pink-500/30 transition-all"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. SMOOTH ZOOM-IN TRANSITION OVERLAY WHEN CLICKING CARD */}
      {joiningTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1.04, opacity: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/90 border border-white/20 rounded-[24px] overflow-hidden max-w-xs w-full text-center shadow-[0_24px_60px_rgba(0,0,0,0.75)] flex flex-col"
          >
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-950">
              {snapshots[joiningTarget.id] ? (
                <motion.img
                  src={snapshots[joiningTarget.id]}
                  alt={joiningTarget.title}
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.22 }}
                  transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {joiningTarget.icon}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <div className="p-5 flex flex-col items-center">
              <h3 className="font-black text-base font-['Fredoka'] text-white">
                Memasuki Dunia 3D...
              </h3>
              <p className="text-xs text-pink-400 font-bold mt-1">
                Joining {joiningTarget.title}...
              </p>

              <div className="w-48 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500"
                />
              </div>

              <span className="text-[10px] text-slate-400 mt-3 font-semibold">
                Menyiapkan dunia PBR, cahaya &amp; suara lingkungan...
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 4. BOTTOM NAVIGATION BAR: LUCIDE LINE ICONS (PINK ACTIVE, GRAY INACTIVE) */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 px-3 py-1.5 flex items-center justify-around z-30 shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-pink-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('avatar');
            onOpenAvatarCreator();
          }}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'avatar' ? 'text-pink-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shirt className="w-5 h-5" strokeWidth={activeTab === 'avatar' ? 2.4 : 1.8} />
          <span className="text-[10px] font-bold">Avatar</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('teman');
            onOpenFriends();
          }}
          className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'teman' ? 'text-pink-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" strokeWidth={activeTab === 'teman' ? 2.4 : 1.8} />
          <span className="text-[10px] font-bold">
            Teman{onlineFriendsCount > 0 ? ` (${onlineFriendsCount})` : ''}
          </span>
          {friendRequestsCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
              {friendRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('chat');
            onOpenChat();
          }}
          className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'chat' ? 'text-pink-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-5 h-5" strokeWidth={activeTab === 'chat' ? 2.4 : 1.8} />
          <span className="text-[10px] font-bold">Chat</span>
          {unreadChatCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-1 rounded-full">
              {unreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('profil');
            onOpenProfile();
          }}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profil' ? 'text-pink-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" strokeWidth={activeTab === 'profil' ? 2.4 : 1.8} />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>
    </div>
  );
}
