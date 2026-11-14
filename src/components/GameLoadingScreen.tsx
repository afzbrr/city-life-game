import React, { useEffect, useState } from 'react';

interface GameLoadingScreenProps {
  onFinish: () => void;
}

/**
 * STEP 1 - LOADING MASUK GAME (MUNCUL PERTAMA):
 * - Background HITAM full
 * - Logo gede "CITY LIFE GAME" putih tebal, huruf miring dikit kayak logo Roblox
 * - Di bawah logo: Tulisan kecil "Welcome to Your City!"
 * - Progress bar putih jalan 0% -> 100%
 * - Tulisan ganti-ganti: "Loading Assets..." -> "Connecting to Server..." -> "Welcome to CITY LIFE GAME..."
 * - Durasi 2.5 detik, abis 100% OTOMATIS pindah ke Beranda
 */
export default function GameLoadingScreen({ onFinish }: GameLoadingScreenProps) {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Loading Assets...');

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('Loading Assets...');
      } else if (pct < 75) {
        setStatusText('Connecting to Server...');
      } else {
        setStatusText('Welcome to CITY LIFE GAME...');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onFinish();
        }, 150);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none font-['Quicksand'] p-6">
      <div className="flex flex-col items-center max-w-sm w-full text-center animate-fadeIn">
        {/* ROBLOX TILTED BOLD LOGO */}
        <div className="mb-2 relative">
          <div className="inline-block transform -skew-x-8 bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black px-6 py-3 rounded-2xl shadow-[0_0_35px_rgba(255,255,255,0.35)] border-4 border-slate-700">
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-wider text-slate-950 font-['Fredoka'] drop-shadow-sm">
              CITY LIFE
            </h1>
            <div className="text-[11px] font-black tracking-widest text-pink-600 bg-white/90 rounded-md py-0.5 px-2 mt-0.5 inline-block uppercase">
              GAME
            </div>
          </div>
        </div>

        {/* SUBTITLE */}
        <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wider mb-8">
          Welcome to Your City!
        </p>

        {/* PROGRESS BAR CONTAINER */}
        <div className="w-64 sm:w-72 h-3 bg-neutral-900 rounded-full border border-neutral-700 overflow-hidden shadow-inner p-0.5 mb-3">
          <div
            className="h-full bg-white rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* DYNAMIC PROGRESS TEXT */}
        <div className="flex items-center justify-between w-64 sm:w-72 text-[11px] text-slate-400 font-bold px-1">
          <span className="text-slate-300 animate-pulse">{statusText}</span>
          <span className="text-white font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
