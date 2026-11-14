import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AvatarState, ChatMessage, FriendEntry } from '../types/game';
import MiniAvatarBadge from './MiniAvatarBadge';
import { sound } from '../game/soundManager';

interface ChatSystemProps {
  currentRoom: string;
  myAvatar: AvatarState;
  friends: FriendEntry[];
  activeChannelId: string; // 'room' or friend.id
  onChangeChannel: (channelId: string) => void;
  onSendMessage: (text: string, channelId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

const QUICK_REPLIES = [
  'Haii 👋',
  'Sini main bareng!',
  'Otw ke situ nih 🏃',
  'Wkwk ngakak 😂',
  'Foto yuk 📸',
  'Lagi di mana?',
];

const WA_REACTIONS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'seed_room_1',
    channelId: 'room',
    senderName: 'Maya',
    senderAvatar: {
      name: 'Maya',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'bulat',
      eyeType: 'gemoy',
      eyeColor: 'pink',
      hairStyle: 'lurus_panjang',
      hairColor: '#111111',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'cardigan_pink',
      outfitName: 'Cardigan Pink',
      outfitType: 'pink_cewe',
      accessoryId: 'cat_ears',
      shoesId: 'sepatu_sekolah',
    },
    text: 'Haii semuanya! Ayo kumpul & foto bareng di spot utama 👋✨',
    time: '14:20',
    reactions: { '❤️': 2 },
    isMe: false,
    read: true,
  },
  {
    id: 'seed_room_2',
    channelId: 'room',
    senderName: 'Faiz',
    senderAvatar: {
      name: 'Faiz',
      gender: 'cowok',
      skinColor: 'kuning',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'biru',
      hairStyle: 'two_block',
      hairColor: '#18181b',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'hoodie_biru',
      outfitName: 'Hoodie Biru',
      outfitType: 'biru_cowo',
      accessoryId: 'none',
      shoesId: 'sneakers_putih',
    },
    text: 'Gas! Aku lagi di deket wahana nih, rame banget seru 😍',
    time: '14:21',
    reactions: { '👍': 1 },
    isMe: false,
    read: true,
  },
  {
    id: 'seed_dm_maya_1',
    channelId: 'friend_maya',
    senderName: 'Maya',
    senderAvatar: {
      name: 'Maya',
      gender: 'cewek',
      skinColor: 'putih',
      faceShape: 'bulat',
      eyeType: 'gemoy',
      eyeColor: 'pink',
      hairStyle: 'lurus_panjang',
      hairColor: '#111111',
      eyebrows: 'tipis',
      mouth: 'senyum',
      blush: 'pink',
      height: 'tinggi',
      outfitId: 'cardigan_pink',
      outfitName: 'Cardigan Pink',
      outfitType: 'pink_cewe',
      accessoryId: 'cat_ears',
      shoesId: 'sepatu_sekolah',
    },
    text: 'P! Jadi nongkrong di Cafe Cozy atau ke Pasar Malam malam ini? ☕🎡',
    time: '14:18',
    reactions: {},
    isMe: false,
    read: true,
  },
  {
    id: 'seed_dm_bima_1',
    channelId: 'friend_bima',
    senderName: 'Bima',
    senderAvatar: {
      name: 'Bima',
      gender: 'cowok',
      skinColor: 'kuning',
      faceShape: 'oval',
      eyeType: 'gemoy',
      eyeColor: 'hitam',
      hairStyle: 'two_block',
      hairColor: '#334155',
      eyebrows: 'tebal',
      mouth: 'senyum',
      blush: 'none',
      height: 'tinggi',
      outfitId: 'jaket_denim',
      outfitName: 'Jaket Denim',
      outfitType: 'biru_cowo',
      accessoryId: 'kacamata_bulat',
      shoesId: 'sneakers_hitam',
    },
    text: 'Bro, aku lagi nyobain jetski di Pantai Sunset nih! Ikut main sini 🚤🌊',
    time: '14:15',
    reactions: { '😂': 1 },
    isMe: false,
    read: true,
  },
];

const AUTO_REPLY_BANK = [
  'Siap! Otw ke tempatmu nih 🚀',
  'Wih seru banget! Tungguin aku ya 😄',
  'Haha setuju banget 😂👍',
  'Boleh banget! Ayo ketemu di spot foto 📸✨',
  'Mantap! Jangan lupa jajan dulu biar gak laper 😋',
];

export default function ChatSystem({
  currentRoom,
  myAvatar,
  friends,
  activeChannelId,
  onChangeChannel,
  onSendMessage,
  isOpen,
  onClose,
  isOwner = false,
}: ChatSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    senderName: string;
    text: string;
  } | null>(null);
  const [actionMsgId, setActionMsgId] = useState<string | null>(null);
  const [deleteDialogMsg, setDeleteDialogMsg] = useState<ChatMessage | null>(null);
  const [typingChannelId, setTypingChannelId] = useState<string | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const replyTimeoutRef = useRef<number | null>(null);

  const activeFriend = useMemo(
    () => friends.find((f) => f.id === activeChannelId) || null,
    [friends, activeChannelId]
  );

  const channelMessages = useMemo(
    () => messages.filter((m) => (m.channelId || 'room') === activeChannelId),
    [messages, activeChannelId]
  );

  useEffect(() => {
    if (isOpen) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, channelMessages.length, activeChannelId]);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const scheduleAutoReply = (channelId: string) => {
    if (replyTimeoutRef.current !== null) {
      window.clearTimeout(replyTimeoutRef.current);
    }
    const friend = friends.find((f) => f.id === channelId);
    const responder = friend
      ? { name: friend.name, avatar: friend.avatar }
      : {
          name: 'Maya',
          avatar: SEED_MESSAGES[0].senderAvatar,
        };

    setTypingChannelId(channelId);
    replyTimeoutRef.current = window.setTimeout(() => {
      const replyLine =
        AUTO_REPLY_BANK[Math.floor(Math.random() * AUTO_REPLY_BANK.length)];
      const incoming: ChatMessage = {
        id: `msg_${Date.now()}_auto`,
        channelId,
        senderName: responder.name,
        senderAvatar: responder.avatar,
        text: replyLine,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        reactions: {},
        isMe: false,
        read: true,
      };
      setMessages((prev) => [...prev, incoming]);
      setTypingChannelId((cur) => (cur === channelId ? null : cur));
      sound.playPop();
    }, 1100);
  };

  const handleSend = (textToSend?: string) => {
    const raw = textToSend ?? inputText;
    const text = raw.trim();
    if (!text) return;

    sound.playPop();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      channelId: activeChannelId,
      senderName: myAvatar.name,
      senderAvatar: myAvatar,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwner,
      reactions: {},
      replyTo: replyTarget || undefined,
      isMe: true,
      read: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    onSendMessage(text, activeChannelId);
    setInputText('');
    setReplyTarget(null);
    setActionMsgId(null);
    scheduleAutoReply(activeChannelId);
  };

  // Toggle or switch WhatsApp reaction without duplicate count bugs
  const handleToggleReaction = (msgId: string, emoji: string) => {
    sound.playPop();
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || m.deletedForEveryone) return m;
        const nextReactions = { ...m.reactions };
        const prevEmoji = m.myReaction;

        if (prevEmoji === emoji) {
          // Remove reaction
          const count = (nextReactions[emoji] || 1) - 1;
          if (count <= 0) delete nextReactions[emoji];
          else nextReactions[emoji] = count;
          return { ...m, reactions: nextReactions, myReaction: undefined };
        }

        // Remove previous reaction if switching
        if (prevEmoji) {
          const oldCount = (nextReactions[prevEmoji] || 1) - 1;
          if (oldCount <= 0) delete nextReactions[prevEmoji];
          else nextReactions[prevEmoji] = oldCount;
        }

        nextReactions[emoji] = (nextReactions[emoji] || 0) + 1;
        return { ...m, reactions: nextReactions, myReaction: emoji };
      })
    );
    setActionMsgId(null);
  };

  const handleDeleteForMe = (msgId: string) => {
    sound.playPop();
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setDeleteDialogMsg(null);
    setActionMsgId(null);
  };

  const handleDeleteForEveryone = (msgId: string) => {
    sound.playPop();
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              deletedForEveryone: true,
              text: 'Pesan ini telah dihapus',
              reactions: {},
              myReaction: undefined,
            }
          : m
      )
    );
    setDeleteDialogMsg(null);
    setActionMsgId(null);
  };

  const scrollToMessage = (targetId?: string) => {
    if (!targetId) return;
    const node = msgRefs.current[targetId];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(targetId);
      window.setTimeout(() => setHighlightedMsgId(null), 1300);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center sm:p-4 font-['Quicksand']"
      onClick={onClose}
    >
      {/* WhatsApp-Style Chat Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b141a] text-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl h-[88vh] sm:h-[620px] flex flex-col overflow-hidden shadow-2xl border-t-2 sm:border border-slate-700 relative"
      >
        {/* 1. WHATSAPP HEADER */}
        <div className="px-4 py-3 bg-[#202c33] border-b border-slate-700/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {activeFriend ? (
              <MiniAvatarBadge
                avatar={activeFriend.avatar}
                size={40}
                status={activeFriend.status}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600/25 border border-emerald-400/40 flex items-center justify-center text-lg shrink-0">
                🌍
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-[#e9edef] truncate font-['Fredoka']">
                  {activeFriend ? activeFriend.name : `Grup ${currentRoom}`}
                </h3>
                {activeFriend?.status === 'playing' && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                    Online
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8696a0] font-semibold truncate">
                {typingChannelId === activeChannelId
                  ? 'sedang mengetik...'
                  : activeFriend
                  ? activeFriend.worldTitle
                    ? `Bermain di ${activeFriend.worldTitle}`
                    : activeFriend.status === 'online'
                    ? 'online'
                    : `terakhir dilihat ${activeFriend.lastSeen || 'baru saja'}`
                  : 'Chat Kota • Tap pesan untuk Reply / React / Hapus'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 font-bold flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Tutup chat"
          >
            ✕
          </button>
        </div>

        {/* 2. CHANNEL SWITCHER BAR (ROOM + FRIENDS DMs) */}
        <div className="px-3 py-2 bg-[#111b21] border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sound.playPop();
              onChangeChannel('room');
              setActionMsgId(null);
              setReplyTarget(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
              activeChannelId === 'room'
                ? 'bg-[#00a884] text-slate-950 shadow-sm'
                : 'bg-[#202c33] text-[#aebac1] hover:text-white'
            }`}
          >
            <span>🌍</span>
            <span>Grup Dunia</span>
          </button>

          {friends.slice(0, 8).map((friend) => (
            <button
              key={friend.id}
              onClick={() => {
                sound.playPop();
                onChangeChannel(friend.id);
                setActionMsgId(null);
                setReplyTarget(null);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                activeChannelId === friend.id
                  ? 'bg-[#00a884] text-slate-950 font-black shadow-sm'
                  : 'bg-[#202c33] text-[#d1d7db] hover:bg-[#2a3942]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  friend.status === 'playing'
                    ? 'bg-emerald-400'
                    : friend.status === 'online'
                    ? 'bg-sky-400'
                    : 'bg-slate-500'
                }`}
              />
              <span>{friend.name}</span>
            </button>
          ))}
        </div>

        {/* 3. MESSAGE FEED (WHATSAPP WALLPAPER) */}
        <div
          onClick={() => setActionMsgId(null)}
          className="flex-1 px-3 py-3 overflow-y-auto space-y-3 relative"
          style={{
            backgroundColor: '#0b141a',
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        >
          <div className="flex justify-center">
            <span className="bg-[#182229] text-[#8696a0] text-[10px] font-bold px-3 py-1 rounded-lg border border-white/5">
              Hari Ini • Enkripsi City Life
            </span>
          </div>

          {channelMessages.length === 0 && (
            <div className="text-center py-12 text-[#8696a0] text-xs font-semibold">
              Belum ada pesan dengan {activeFriend ? activeFriend.name : 'grup ini'}. Mulai sapa sekarang! 👋
            </div>
          )}

          {channelMessages.map((msg) => {
            const isMenuOpen = actionMsgId === msg.id;
            const isHighlighted = highlightedMsgId === msg.id;

            return (
              <div
                key={msg.id}
                ref={(el) => {
                  msgRefs.current[msg.id] = el;
                }}
                onClick={(e) => e.stopPropagation()}
                className={`flex flex-col ${
                  msg.isMe ? 'items-end' : 'items-start'
                } transition-colors duration-300 rounded-xl ${
                  isHighlighted ? 'bg-emerald-500/15 p-1' : ''
                }`}
              >
                {/* Sender name on incoming group messages */}
                {!msg.isMe && activeChannelId === 'room' && (
                  <div className="flex items-center gap-1.5 mb-1 pl-1">
                    <MiniAvatarBadge avatar={msg.senderAvatar} size={20} />
                    <span className="text-[11px] font-black text-emerald-400">
                      {msg.senderName}
                    </span>
                    {msg.isOwner && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 rounded">
                        OWNER
                      </span>
                    )}
                  </div>
                )}

                {/* WhatsApp Floating Action Menu (React + Reply + Delete) */}
                {isMenuOpen && (
                  <div
                    className={`mb-1.5 bg-[#233138] border border-slate-600/70 rounded-2xl px-2.5 py-1.5 shadow-xl flex flex-wrap items-center gap-1.5 z-20 ${
                      msg.isMe ? 'self-end' : 'self-start'
                    }`}
                  >
                    {!msg.deletedForEveryone &&
                      WA_REACTIONS.map((emo) => (
                        <button
                          key={emo}
                          onClick={() => handleToggleReaction(msg.id, emo)}
                          className={`text-base w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 ${
                            msg.myReaction === emo ? 'bg-white/20 ring-1 ring-emerald-400' : ''
                          }`}
                          title={`React ${emo}`}
                        >
                          {emo}
                        </button>
                      ))}

                    {!msg.deletedForEveryone && (
                      <button
                        onClick={() => {
                          setReplyTarget({
                            id: msg.id,
                            senderName: msg.isMe ? 'Kamu' : msg.senderName,
                            text: msg.text,
                          });
                          setActionMsgId(null);
                        }}
                        className="text-[11px] font-black text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        ↩ Balas
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDeleteDialogMsg(msg);
                        setActionMsgId(null);
                      }}
                      className="text-[11px] font-black text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                )}

                {/* Chat Bubble */}
                <div
                  onClick={() =>
                    setActionMsgId(isMenuOpen ? null : msg.id)
                  }
                  className={`max-w-[82%] min-w-[92px] px-3 py-2 rounded-2xl shadow-sm cursor-pointer select-none relative group ${
                    msg.isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-xs'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-xs'
                  }`}
                >
                  {/* Quoted Reply Inside Bubble */}
                  {msg.replyTo && !msg.deletedForEveryone && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToMessage(msg.replyTo?.id);
                      }}
                      className="mb-1.5 px-2.5 py-1 rounded-lg bg-black/25 border-l-4 border-[#00a884] text-[11px] cursor-pointer hover:bg-black/35"
                    >
                      <div className="font-black text-[#00d8a8] truncate">
                        {msg.replyTo.senderName}
                      </div>
                      <div className="text-[#aebac1] truncate">
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  {/* Message Text / Deleted Placeholder */}
                  {msg.deletedForEveryone ? (
                    <div className="text-xs italic text-[#8696a0] flex items-center gap-1.5">
                      <span>🚫</span>
                      <span>Pesan ini telah dihapus</span>
                    </div>
                  ) : (
                    <div className="text-[13px] font-medium leading-relaxed break-words pr-3">
                      {msg.text}
                    </div>
                  )}

                  {/* Timestamp + Blue Double Checkmark */}
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px]">
                    <span className="text-[#aebac1]/80 font-semibold">
                      {msg.time}
                    </span>
                    {msg.isMe && !msg.deletedForEveryone && (
                      <span
                        className={
                          msg.read ? 'text-[#53bdeb] font-black' : 'text-[#8696a0]'
                        }
                      >
                        ✓✓
                      </span>
                    )}
                  </div>

                  {/* Subtle Chevron Trigger */}
                  <span className="absolute top-1.5 right-2 text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    ▾
                  </span>

                  {/* Reaction Badges Below Bubble */}
                  {!msg.deletedForEveryone &&
                    Object.keys(msg.reactions).length > 0 && (
                      <div
                        className={`mt-1.5 inline-flex items-center gap-1 bg-[#182229] border border-slate-700 px-2 py-0.5 rounded-full text-[11px] shadow-sm`}
                      >
                        {Object.entries(msg.reactions).map(([emo, count]) => (
                          <button
                            key={emo}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleReaction(msg.id, emo);
                            }}
                            className={`flex items-center gap-0.5 cursor-pointer ${
                              msg.myReaction === emo ? 'text-emerald-300 font-black' : 'text-slate-200'
                            }`}
                          >
                            <span>{emo}</span>
                            {count > 1 && (
                              <span className="text-[10px]">{count}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            );
          })}

          {typingChannelId === activeChannelId && (
            <div className="flex items-start">
              <div className="bg-[#202c33] text-[#8696a0] text-xs font-bold px-3 py-2 rounded-2xl rounded-tl-xs">
                sedang mengetik...
              </div>
            </div>
          )}

          <div ref={feedEndRef} />
        </div>

        {/* 4. QUICK REPLIES BAR */}
        <div className="px-3 py-1.5 bg-[#111b21] border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_REPLIES.map((qc) => (
            <button
              key={qc}
              onClick={() => handleSend(qc)}
              className="text-[11px] font-bold bg-[#202c33] hover:bg-[#2a3942] text-[#d1d7db] px-2.5 py-1 rounded-xl whitespace-nowrap border border-slate-700/70 cursor-pointer active:scale-95"
            >
              {qc}
            </button>
          ))}
        </div>

        {/* 5. REPLY QUOTE BAR */}
        {replyTarget && (
          <div className="px-3 py-2 bg-[#182229] border-t border-slate-700 flex items-center justify-between gap-2">
            <div className="border-l-4 border-[#00a884] pl-2.5 min-w-0 flex-1">
              <div className="text-[11px] font-black text-[#00d8a8] truncate">
                Membalas {replyTarget.senderName}
              </div>
              <div className="text-xs text-[#aebac1] truncate">
                {replyTarget.text}
              </div>
            </div>
            <button
              onClick={() => setReplyTarget(null)}
              className="w-6 h-6 rounded-full bg-white/10 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 6. WHATSAPP INPUT BAR */}
        <div className="p-2.5 bg-[#202c33] border-t border-slate-700/70 flex items-center gap-2">
          <div className="flex gap-1">
            {['😊', '❤️', '😂'].map((emo) => (
              <button
                key={emo}
                onClick={() => setInputText((t) => `${t}${emo}`)}
                className="w-7 h-7 rounded-full hover:bg-white/10 text-base flex items-center justify-center cursor-pointer"
                title={`Sisipkan ${emo}`}
              >
                {emo}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ketik pesan..."
            className="flex-1 bg-[#2a3942] border border-slate-600/50 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#e9edef] placeholder-[#8696a0] outline-hidden focus:border-[#00a884]"
          />

          <button
            onClick={() => handleSend()}
            className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#06cf9c] text-slate-950 font-black text-sm flex items-center justify-center shadow-md cursor-pointer active:scale-95 shrink-0"
            aria-label="Kirim pesan"
          >
            ➤
          </button>
        </div>

        {/* 7. WHATSAPP DELETE MESSAGE MODAL */}
        {deleteDialogMsg && (
          <div
            onClick={() => setDeleteDialogMsg(null)}
            className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#233138] border border-slate-600 rounded-2xl p-4 w-full max-w-xs shadow-2xl space-y-3"
            >
              <h4 className="font-black text-sm text-white">Hapus pesan?</h4>
              <p className="text-xs text-[#aebac1] line-clamp-2">
                "{deleteDialogMsg.text}"
              </p>

              <div className="flex flex-col gap-1.5 pt-1">
                {deleteDialogMsg.isMe && !deleteDialogMsg.deletedForEveryone && (
                  <button
                    onClick={() => handleDeleteForEveryone(deleteDialogMsg.id)}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-black text-xs text-right cursor-pointer"
                  >
                    Hapus untuk semua orang
                  </button>
                )}

                <button
                  onClick={() => handleDeleteForMe(deleteDialogMsg.id)}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#00d8a8] font-black text-xs text-right cursor-pointer"
                >
                  Hapus untuk saya
                </button>

                <button
                  onClick={() => setDeleteDialogMsg(null)}
                  className="w-full py-2 px-3 rounded-xl text-[#aebac1] hover:text-white font-bold text-xs text-right cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
