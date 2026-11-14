import React, { useMemo, useState } from 'react';
import { FriendEntry, FriendRequest } from '../types/game';
import { GameWorldLocation } from '../game/types';
import MiniAvatarBadge from './MiniAvatarBadge';
import { sound } from '../game/soundManager';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendEntry[];
  requests: FriendRequest[];
  onJoinWorld: (worldId: GameWorldLocation, friendName: string) => void;
  onOpenDM: (friend: FriendEntry) => void;
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onAddFriend: (player: Omit<FriendEntry, 'status'>) => void;
  onRemoveFriend: (friendId: string) => void;
}

const DISCOVER_PLAYERS: Array<{
  id: string;
  name: string;
  username: string;
  worldId: GameWorldLocation;
  worldTitle: string;
  avatar: FriendEntry['avatar'];
}> = [
  {
    id: 'disc_citra',
    name: 'Citra',
    username: '@citra_star',
    worldId: 'cafe',
    worldTitle: 'CAFE COZY',
    avatar: {
      name: 'Citra',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'coklat',
      hairStyle: 'lurus_panjang',
      hairColor: '#451a03',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'cardigan_pink',
      outfitName: 'Cardigan Latte',
      outfitType: 'pink_cewe',
      accessoryId: 'kacamata_bulat',
      shoesId: 'sneakers_putih',
    },
  },
  {
    id: 'disc_dimas',
    name: 'Dimas',
    username: '@dimas_pro',
    worldId: 'pantai',
    worldTitle: 'PANTAI SUNSET',
    avatar: {
      name: 'Dimas',
      gender: 'cowok',
      skinColor: 'sawo_matang',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'hitam',
      hairStyle: 'two_block',
      hairColor: '#18181b',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'hoodie_biru',
      outfitName: 'Hoodie Pantai',
      outfitType: 'biru_cowo',
      accessoryId: 'none',
      shoesId: 'sneakers_putih',
    },
  },
  {
    id: 'disc_hana',
    name: 'Hana',
    username: '@hana_boba',
    worldId: 'aquarium',
    worldTitle: 'AQUARIUM UNDERWATER',
    avatar: {
      name: 'Hana',
      gender: 'cewek',
      skinColor: 'kuning',
      faceShape: 'bulat',
      eyeType: 'gemoy',
      eyeColor: 'pink',
      hairStyle: 'lurus_panjang',
      hairColor: '#f472b6',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'dress_pesta',
      outfitName: 'Dress Pastel',
      outfitType: 'pink_cewe',
      accessoryId: 'cat_ears',
      shoesId: 'sepatu_sekolah',
    },
  },
  {
    id: 'disc_rafi',
    name: 'Rafi',
    username: '@rafi_carnival',
    worldId: 'pasar_malam',
    worldTitle: 'PASAR MALAM',
    avatar: {
      name: 'Rafi',
      gender: 'cowok',
      skinColor: 'putih',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'biru',
      hairStyle: 'two_block',
      hairColor: '#e2e8f0',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'jaket_varsity',
      outfitName: 'Varsity Night',
      outfitType: 'biru_cowo',
      accessoryId: 'none',
      shoesId: 'sneakers_hitam',
    },
  },
];

export default function FriendsModal({
  isOpen,
  onClose,
  friends,
  requests,
  onJoinWorld,
  onOpenDM,
  onAcceptRequest,
  onDeclineRequest,
  onAddFriend,
  onRemoveFriend,
}: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'teman' | 'permintaan' | 'tambah'>('teman');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? friends.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.username.toLowerCase().includes(q) ||
            (f.worldTitle && f.worldTitle.toLowerCase().includes(q))
        )
      : friends;

    const order: Record<FriendEntry['status'], number> = {
      playing: 0,
      online: 1,
      offline: 2,
    };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [friends, searchQuery]);

  const discoverList = useMemo(() => {
    const existingIds = new Set(friends.map((f) => f.username.toLowerCase()));
    const q = searchQuery.trim().toLowerCase();
    return DISCOVER_PLAYERS.filter((p) => {
      if (existingIds.has(p.username.toLowerCase())) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.worldTitle.toLowerCase().includes(q)
      );
    });
  }, [friends, searchQuery]);

  if (!isOpen) return null;

  const onlineTotal = friends.filter((f) => f.status !== 'offline').length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center sm:p-4 font-['Quicksand']"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 text-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-t-2 sm:border border-slate-700 shadow-2xl flex flex-col max-h-[88vh] h-[85vh] sm:h-[600px] overflow-hidden"
      >
        {/* Roblox-style Header */}
        <div className="px-4 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/25 border border-indigo-400/40 flex items-center justify-center text-lg">
              👥
            </div>
            <div>
              <h2 className="font-black text-base font-['Fredoka'] tracking-wide leading-none">
                TEMAN KOTA
              </h2>
              <p className="text-[11px] text-emerald-400 font-bold mt-1">
                {onlineTotal} Online • {friends.length} Total Teman
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center cursor-pointer"
            aria-label="Tutup menu teman"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 pb-2 bg-slate-900 border-b border-slate-800 space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('teman');
              }}
              className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'teman'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Teman ({friends.length})
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('permintaan');
              }}
              className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'permintaan'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Permintaan</span>
              {requests.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('tambah');
              }}
              className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'tambah'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Tambah
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'tambah'
                  ? 'Cari username pemain baru (contoh: @citra)...'
                  : 'Cari teman atau dunia yang dimainkan...'
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-xs font-semibold text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {activeTab === 'teman' && (
            <>
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <div className="text-3xl">👥</div>
                  <p className="text-xs font-bold">
                    {searchQuery
                      ? `Tidak ada teman cocok dengan "${searchQuery}"`
                      : 'Belum ada teman. Ayo tambah di tab + Tambah!'}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-2.5 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MiniAvatarBadge
                        avatar={friend.avatar}
                        size={46}
                        status={friend.status}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-white truncate">
                            {friend.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold truncate">
                            {friend.username}
                          </span>
                        </div>

                        {friend.status === 'playing' && friend.worldTitle ? (
                          <div className="text-[11px] text-emerald-400 font-bold truncate mt-0.5">
                            🎮 Di {friend.worldTitle}
                            {friend.activity ? ` • ${friend.activity}` : ''}
                          </div>
                        ) : friend.status === 'online' ? (
                          <div className="text-[11px] text-sky-400 font-bold mt-0.5">
                            Online di Beranda
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Offline {friend.lastSeen ? `• ${friend.lastSeen}` : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {friend.status === 'playing' && friend.worldId && (
                        <button
                          onClick={() => {
                            sound.playFanfare();
                            onJoinWorld(friend.worldId!, friend.name);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-[11px] px-2.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
                          title={`Ikut main ke ${friend.worldTitle}`}
                        >
                          Ikut Main
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sound.playPop();
                          onOpenDM(friend);
                        }}
                        className="bg-slate-700 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition-all"
                        title={`Chat ${friend.name}`}
                      >
                        💬
                      </button>

                      {confirmRemoveId === friend.id ? (
                        <button
                          onClick={() => {
                            sound.playPop();
                            onRemoveFriend(friend.id);
                            setConfirmRemoveId(null);
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] px-2 py-1.5 rounded-xl cursor-pointer"
                        >
                          Hapus?
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(friend.id)}
                          className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-bold flex items-center justify-center cursor-pointer"
                          title="Hapus Teman"
                        >
                          ⋯
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'permintaan' && (
            <>
              {requests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <div className="text-3xl">✉️</div>
                  <p className="text-xs font-bold">Tidak ada permintaan pertemanan baru.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MiniAvatarBadge avatar={req.avatar} size={46} status="online" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-white truncate">
                            {req.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold truncate">
                            {req.username}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">
                          {req.note || `${req.mutualFriends} teman sama`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          sound.playFanfare();
                          onAcceptRequest(req.id);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => {
                          sound.playPop();
                          onDeclineRequest(req.id);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold text-[11px] px-2.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'tambah' && (
            <>
              <p className="text-[11px] text-slate-400 font-bold px-1">
                Pemain Aktif di City Life:
              </p>
              {discoverList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold">
                  Semua pemain cocok sudah ada di daftar temanmu! 🎉
                </div>
              ) : (
                discoverList.map((player) => {
                  const isSent = sentIds.has(player.id);
                  return (
                    <div
                      key={player.id}
                      className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MiniAvatarBadge
                          avatar={player.avatar}
                          size={44}
                          status="playing"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-white truncate">
                              {player.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold truncate">
                              {player.username}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-400 font-bold truncate mt-0.5">
                            🎮 Sedang di {player.worldTitle}
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isSent}
                        onClick={() => {
                          sound.playCoin();
                          setSentIds((prev) => new Set([...prev, player.id]));
                          onAddFriend(player);
                        }}
                        className={`text-[11px] font-black px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                          isSent
                            ? 'bg-slate-700 text-emerald-300 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white cursor-pointer'
                        }`}
                      >
                        {isSent ? 'Berteman ✓' : '+ Tambah'}
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
