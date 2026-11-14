import React, { useState } from 'react';
import ChibiAvatar from './ChibiAvatar';
import { AvatarState } from '../types/game';

interface ShopViewProps {
  avatar: AvatarState;
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onEquipOutfit: (outfit: { id: string; name: string; type: 'pink_cewe' | 'biru_cowo' | 'couple' | 'sultan' }) => void;
  isOwner?: boolean;
}

export default function ShopView({
  avatar,
  coins,
  onUpdateCoins,
  onEquipOutfit,
  isOwner = false,
}: ShopViewProps) {
  const [activeCategory, setActiveCategory] = useState<'pink_cewe' | 'biru_cowo' | 'elektronik' | 'perabot'>('pink_cewe');
  const [purchasedIds, setPurchasedIds] = useState<{ [id: string]: boolean }>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Koleksi Baru Pink Cewe (Semua Pink)
  const pinkCeweItems = [
    { id: 'p_hoodie', name: 'Hoodie Pink Pastel', price: 300, icon: '🎀', desc: 'Bahan lembut berbulu hangat' },
    { id: 'p_dress_princess', name: 'Dress Princess Pink', price: 450, icon: '👗', desc: 'Gaun putri berpita besar & sparkle' },
    { id: 'p_crop', name: 'Crop Top Pink Hati', price: 200, icon: '👚', desc: 'Atasan casual motif love imut' },
    { id: 'p_rok_plisket', name: 'Rok Plisket Pink', price: 250, icon: '🩰', desc: 'Rok lipit berayun anggun' },
    { id: 'p_sneakers', name: 'Sneakers Pink Pastel', price: 280, icon: '👟', desc: 'Sepatu kets gaya street kawaii' },
    { id: 'p_bando', name: 'Bando Telinga Kucing Pink', price: 150, icon: '🐱', desc: 'Bando bulu gemoy menggemaskan' },
    { id: 'p_tas', name: 'Tas Ransel Kelinci Pink', price: 220, icon: '🎒', desc: 'Tas sekolah motif kelinci berbulu' },
    { id: 'p_kacamata', name: 'Kacamata Bentuk Hati Pink', price: 180, icon: '👓', desc: 'Kacamata love estetik untuk foto' },
  ];

  // 2. Koleksi Baru Biru Cowo (Semua Biru)
  const biruCowoItems = [
    { id: 'b_hoodie_navy', name: 'Hoodie Biru Navy', price: 300, icon: '🧢', desc: 'Hoodie kasual keren warna navy' },
    { id: 'b_varsity', name: 'Jaket Varsity Biru', price: 450, icon: '🧥', desc: 'Jaket sporty kampus idola' },
    { id: 'b_kaos_grafis', name: 'Kaos Biru Grafis Street', price: 200, icon: '👕', desc: 'Kaos santai grafis modern' },
    { id: 'b_jeans', name: 'Jeans Biru Robek Distressed', price: 280, icon: '👖', desc: 'Celana denim cowok trendi' },
    { id: 'b_sneakers', name: 'Sneakers Biru Putih High', price: 320, icon: '👟', desc: 'Sepatu kets basket idaman' },
    { id: 'b_topi', name: 'Topi Baseball Biru', price: 150, icon: '🧢', desc: 'Topi keren melindungi dari matahari' },
    { id: 'b_jam', name: 'Smartwatch Digital Biru', price: 250, icon: '⌚', desc: 'Jam tangan modern multifungsi' },
  ];

  // 3. Toko Elektronik (Harga Wajib 500-5000 Koin)
  const elektronikItems = [
    { id: 'el_earphone', name: 'Earphone Nirkabel', price: 500, icon: '🎧', desc: 'Dengar musik riang kapan saja' },
    { id: 'el_headphone_cat', name: 'Headphone Kucing Pink', price: 800, icon: '🎧', desc: 'Headphone telinga kucing RGB menyala' },
    { id: 'el_smartwatch', name: 'Smartwatch Touchscreen', price: 1000, icon: '⌚', desc: 'Lihat status pet & jam realtime' },
    { id: 'el_kamera', name: 'Kamera Polaroid Aesthetic', price: 1500, icon: '📷', desc: 'Buka pose foto sultan & cetak foto' },
    { id: 'el_hp_pink', name: 'HP Smartphone Pink Chibi', price: 1800, icon: '📱', desc: 'Bisa main mini-game & chat cepat' },
    { id: 'el_tablet', name: 'iPad / Tablet Kreatif', price: 2000, icon: '📲', desc: 'Bisa menggambar & belajar online' },
    { id: 'el_laptop_gaming', name: 'Laptop Gaming RGB 4K', price: 2800, icon: '💻', desc: 'Laptop performa tinggi main game' },
    { id: 'el_konsol', name: 'Konsol Game TV Retro', price: 3000, icon: '🎮', desc: 'Main game bareng pet di ruang tamu' },
    { id: 'el_vr', name: 'VR Headset Metaverse', price: 4500, icon: '🥽', desc: 'Sensasi dunia virtual futuristik' },
    { id: 'el_hp_sultan', name: 'HP Sultan Emas 24K', price: 5000, icon: '👑', desc: 'Handphone berlapis emas murni berkilau' },
  ];

  // 4. Hias Rumah Perabot (50 - 500 Koin)
  const perabotItems = [
    { id: 'fur_kasur_tingkat', name: 'Kasur Bintang Double', price: 350, icon: '🛏️', desc: 'Kasur empuk berlapis sprei lembut' },
    { id: 'fur_sofa_l', name: 'Sofa L Mewah Ruang Tamu', price: 400, icon: '🛋️', desc: 'Sofa sudut muat banyak orang' },
    { id: 'fur_meja_makan', name: 'Set Meja Makan Marmer', price: 300, icon: '🍽️', desc: 'Meja makan keluarga romantis' },
    { id: 'fur_ac', name: 'AC Dingin Inverter', price: 450, icon: '❄️', desc: 'Kamar selalu adem & nyaman' },
    { id: 'fur_lampu_hati', name: 'Lampu Neon Dinding Love', price: 180, icon: '🏮', desc: 'Cahaya pink romantis di kamar' },
    { id: 'fur_karpet_bulu', name: 'Karpet Bulu Angsa Mewah', price: 150, icon: '🌸', desc: 'Karpet super halus di lantai' },
  ];

  const handleBuyItem = (item: { id: string; name: string; price: number; icon: string }) => {
    if (coins < item.price && !isOwner) {
      showToast('Koin tidak mencukupi! Ayo belajar atau kerja dulu 🪙');
      return;
    }

    if (!isOwner) {
      onUpdateCoins(-item.price);
    }
    setPurchasedIds({ ...purchasedIds, [item.id]: true });

    // If it's outfit, equip immediately!
    if (activeCategory === 'pink_cewe') {
      onEquipOutfit({ id: item.id, name: item.name, type: 'pink_cewe' });
    } else if (activeCategory === 'biru_cowo') {
      onEquipOutfit({ id: item.id, name: item.name, type: 'biru_cowo' });
    }

    showToast(`Berhasil membeli ${item.name}! Langsung masuk ke koleksi! ✨`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 select-none relative overflow-hidden bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50">
      
      {/* 1. TOP HEADER & COIN BALANCE */}
      <div className="flex items-center justify-between z-20 mb-1.5">
        <div>
          <h2 className="font-black text-sm text-slate-800 flex items-center gap-1.5 font-['Fredoka']">
            <span>🛍️</span> TOKO & BUTIK CITY LIFE
          </h2>
          <p className="text-[10px] text-slate-500 font-bold">
            Baju Pink Cewe, Biru Cowo & Gadget Elektronik!
          </p>
        </div>
        <div className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black">
          🪙 {isOwner ? 'INFINITY' : coins.toLocaleString()}
        </div>
      </div>

      {toastMessage && (
        <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full text-center shadow-md animate-bounce mb-1">
          {toastMessage}
        </div>
      )}

      {/* 2. CATEGORY TABS */}
      <div className="grid grid-cols-4 gap-1 bg-white/80 p-1 rounded-2xl border border-pink-200 shadow-xs mb-2">
        <button
          onClick={() => setActiveCategory('pink_cewe')}
          className={`py-1.5 text-[10px] font-black rounded-xl transition-all ${
            activeCategory === 'pink_cewe' ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-600'
          }`}
        >
          🌸 Pink Cewe
        </button>
        <button
          onClick={() => setActiveCategory('biru_cowo')}
          className={`py-1.5 text-[10px] font-black rounded-xl transition-all ${
            activeCategory === 'biru_cowo' ? 'bg-sky-500 text-white shadow-xs' : 'text-sky-600'
          }`}
        >
          🧢 Biru Cowo
        </button>
        <button
          onClick={() => setActiveCategory('elektronik')}
          className={`py-1.5 text-[10px] font-black rounded-xl transition-all ${
            activeCategory === 'elektronik' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-600'
          }`}
        >
          📱 Elektronik
        </button>
        <button
          onClick={() => setActiveCategory('perabot')}
          className={`py-1.5 text-[10px] font-black rounded-xl transition-all ${
            activeCategory === 'perabot' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700'
          }`}
        >
          🏠 Perabot
        </button>
      </div>

      {/* 3. ITEMS GRID LIST (With chibi icons & detailed preview) */}
      <div className="flex-1 bg-white rounded-3xl p-3 border-2 border-pink-200 shadow-sm overflow-y-auto no-scrollbar space-y-2">
        {activeCategory === 'pink_cewe' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-black text-pink-600 bg-pink-50 p-2 rounded-xl border border-pink-200 flex items-center justify-between">
              <span>Koleksi Manusia Chibi Pink Cewe</span>
              <span>Harga: 150 - 450 Koin</span>
            </div>
            {pinkCeweItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-50 hover:bg-pink-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-black text-xs text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyItem(item)}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  🪙 {item.price}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'biru_cowo' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-black text-sky-600 bg-sky-50 p-2 rounded-xl border border-sky-200 flex items-center justify-between">
              <span>Koleksi Manusia Chibi Biru Cowo</span>
              <span>Harga: 150 - 450 Koin</span>
            </div>
            {biruCowoItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-black text-xs text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyItem(item)}
                  className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  🪙 {item.price}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'elektronik' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-black text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-200 flex items-center justify-between">
              <span>Gadget & Elektronik Kota</span>
              <span>Harga: 500 - 5.000 Koin</span>
            </div>
            {elektronikItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-black text-xs text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyItem(item)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  🪙 {item.price.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'perabot' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-black text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>Perabotan Hias Rumah</span>
              <span>Harga: 150 - 450 Koin</span>
            </div>
            {perabotItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-black text-xs text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyItem(item)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  🪙 {item.price}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
