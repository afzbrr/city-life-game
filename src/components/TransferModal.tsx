import React, { useState } from 'react';

interface TransferModalProps {
  coins: number;
  onTransfer: (targetUsername: string, amount: number) => boolean;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

export default function TransferModal({
  coins,
  onTransfer,
  isOpen,
  onClose,
  isOwner = false,
}: TransferModalProps) {
  const [targetUsername, setTargetUsername] = useState<string>('');
  const [amount, setAmount] = useState<string>('50');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const num = parseInt(amount, 10);
    if (!targetUsername.trim()) {
      setErrorMsg('Masukkan username penerima (contoh: @maya atau @afzbrr)!');
      return;
    }
    if (isNaN(num) || num < 10) {
      setErrorMsg('Minimal transfer adalah 10 Koin! 🪙');
      return;
    }
    if (!isOwner && num > 5000) {
      setErrorMsg('Maksimal transfer harian pemain biasa adalah 5.000 Koin! (Owner tanpa batas) 🪙');
      return;
    }
    if (!isOwner && num > coins) {
      setErrorMsg('Koin kamu tidak cukup untuk transfer sejumlah ini!');
      return;
    }

    const success = onTransfer(targetUsername.trim(), num);
    if (success) {
      setSuccessMsg(`Berhasil mengirim ${num} Koin ke ${targetUsername}! 💸✨`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1800);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-4 w-full max-w-[320px] border-4 border-pink-400 shadow-2xl space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-1.5 font-['Fredoka']">
            <span className="text-xl">💸</span>
            <h3 className="font-black text-sm text-slate-800">TRANSFER KOIN</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-slate-100 rounded-full font-bold text-xs">
            ✕
          </button>
        </div>

        {/* Balance */}
        <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
          <span>Koin Tersedia:</span>
          <span className="text-sm font-black">🪙 {isOwner ? 'INFINITY' : coins.toLocaleString()}</span>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-[10px] font-bold p-2 rounded-xl border border-red-200">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 text-[11px] font-black p-2 rounded-xl border border-emerald-200 text-center animate-bounce">
            🎉 {successMsg}
          </div>
        )}

        {/* Target username input */}
        <div>
          <label className="text-[10px] font-black text-slate-700 block mb-1">
            Username Penerima (Telegram):
          </label>
          <input
            type="text"
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            placeholder="@username tujuan..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-pink-500"
          />
        </div>

        {/* Amount input */}
        <div>
          <label className="text-[10px] font-black text-slate-700 block mb-1">
            Jumlah Koin (Min 10):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-pink-500"
          />
        </div>

        {/* Quick Amount Pills */}
        <div className="flex gap-1.5">
          {[50, 100, 250, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(String(amt))}
              className="flex-1 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-[10px] font-black border border-pink-200 cursor-pointer"
            >
              +{amt}
            </button>
          ))}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
        >
          Kirim Koin Sekarang 💸
        </button>

      </div>
    </div>
  );
}
