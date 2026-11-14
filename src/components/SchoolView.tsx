import React, { useState } from 'react';
import ChibiAvatar from './ChibiAvatar';
import ChibiPet from './ChibiPet';
import { AvatarState, PetState, SchoolState } from '../types/game';

interface SchoolViewProps {
  avatar: AvatarState;
  pet: PetState;
  schoolState: SchoolState;
  coins: number;
  onUpdateCoins: (amount: number) => void;
  onUpdateSchool: (state: SchoolState) => void;
  isOwner?: boolean;
}

// Mini-quiz questions for UJIAN
const EXAM_QUESTIONS = [
  { q: '12 + 15 = ?', a: ['25', '27', '30'], correct: 1 },
  { q: 'Warna primer di seni lukis adalah?', a: ['Merah, Biru, Kuning', 'Pink, Hijau, Ungu', 'Hitam & Putih'], correct: 0 },
  { q: 'Berapa jumlah not dasar musik (Do Re Mi Fa Sol La Si)?', a: ['5 Not', '7 Not', '12 Not'], correct: 1 },
  { q: 'Manfaat olahraga pagi hari?', a: ['Badan Bugar & Sehat', 'Bikin Ngantuk', 'Habiskan Koin'], correct: 0 },
];

const JOBS = [
  { title: 'Programmer Game Chibi 💻', minGrade: 'SMA', salary: 350 },
  { title: 'Koki Restoran Gemoy 👨‍🍳', minGrade: 'SMP', salary: 200 },
  { title: 'Youtuber & Streamer 🎥', minGrade: 'SD', salary: 250 },
  { title: 'Dokter Hewan 🏥', minGrade: 'Kuliah', salary: 500 },
  { title: 'Barista Cat Cafe ☕', minGrade: 'SMP', salary: 180 },
];

export default function SchoolView({
  avatar,
  pet,
  schoolState,
  coins,
  onUpdateCoins,
  onUpdateSchool,
  isOwner = false,
}: SchoolViewProps) {
  const [inExam, setInExam] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Belajar di Kelas
  const handleStudy = () => {
    const pts = schoolState.studyPoints + 20;
    let nextGrade = schoolState.grade;

    if (pts >= 100 && schoolState.grade === 'TK') nextGrade = 'SD';
    else if (pts >= 200 && schoolState.grade === 'SD') nextGrade = 'SMP';
    else if (pts >= 350 && schoolState.grade === 'SMP') nextGrade = 'SMA';
    else if (pts >= 500 && schoolState.grade === 'SMA') nextGrade = 'Kuliah';

    onUpdateSchool({
      ...schoolState,
      studyPoints: pts,
      grade: nextGrade,
    });
    setFeedback(`Rajin belajar! Poin Pintar bertambah +20! (Tingkat: ${nextGrade}) 📚✨`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Mulai Ujian Mini-Game
  const startExam = () => {
    setInExam(true);
    setCurrentQuestionIdx(0);
    setScore(0);
    setExamFinished(false);
  };

  const handleAnswer = (choiceIdx: number) => {
    const q = EXAM_QUESTIONS[currentQuestionIdx];
    const isCorrect = choiceIdx === q.correct;
    const newScore = isCorrect ? score + 25 : score;
    setScore(newScore);

    if (currentQuestionIdx + 1 < EXAM_QUESTIONS.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setExamFinished(true);
      const earnedCoins = newScore * 2;
      onUpdateCoins(earnedCoins);
      onUpdateSchool({
        ...schoolState,
        lastExamScore: newScore,
        studyPoints: schoolState.studyPoints + 30,
      });
    }
  };

  // Bekerja & Bawa Pulang Koin
  const handleWork = (job: (typeof JOBS)[0]) => {
    onUpdateCoins(job.salary);
    onUpdateSchool({
      ...schoolState,
      jobTitle: job.title,
      salary: job.salary,
    });
    setFeedback(`Kerja selesai sebagai ${job.title}! Bawa pulang gajian +${job.salary} Koin! 💼🪙`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 select-none relative overflow-hidden bg-gradient-to-b from-sky-50 via-amber-50 to-pink-50">
      
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between z-20 mb-2">
        <div>
          <h2 className="font-black text-sm text-slate-800 flex items-center gap-1.5 font-['Fredoka']">
            <span>🏫</span> SEKOLAH & KARIER CHIBI
          </h2>
          <p className="text-[10px] text-slate-500 font-bold">
            Rajin sekolah → Nilai bagus → Kerja bawa banyak koin!
          </p>
        </div>
        <div className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black">
          🪙 {coins.toLocaleString()}
        </div>
      </div>

      {feedback && (
        <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full text-center shadow-md animate-bounce mb-1">
          {feedback}
        </div>
      )}

      {/* 2. SCHOOL STATUS CARD */}
      <div className="bg-white rounded-3xl p-3 border-2 border-pink-300 shadow-sm mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChibiAvatar avatar={avatar} size={55} action="wave" />
            <div>
              <div className="font-black text-xs text-slate-800">
                Tingkat Pendidikan: <span className="text-pink-600 font-black">{schoolState.grade}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                Poin Pintar: {schoolState.studyPoints} pts • Nilai Ujian Terakhir: {schoolState.lastExamScore}/100 ⭐
              </div>
              {schoolState.jobTitle && (
                <div className="text-[10px] text-emerald-600 font-extrabold mt-0.5">
                  Profesi: {schoolState.jobTitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleStudy}
            className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-black text-xs rounded-2xl shadow-xs cursor-pointer active:scale-95"
          >
            📖 Belajar
          </button>
        </div>
      </div>

      {/* 3. UJIAN MINI-GAME MODAL / CARD */}
      {!inExam ? (
        <div className="bg-white/90 rounded-3xl p-3 border-2 border-indigo-200 shadow-sm mb-2 flex items-center justify-between">
          <div>
            <div className="font-black text-xs text-indigo-900 flex items-center gap-1">
              <span>📝</span> Ruang Ujian Berhadiah Koin
            </div>
            <div className="text-[10px] text-slate-500">
              Jawab 4 soal cepat untuk dapat nilai 100 & koin bonus!
            </div>
          </div>
          <button
            onClick={startExam}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-xs cursor-pointer active:scale-95"
          >
            Mulai Ujian ✏️
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-3xl p-3 shadow-md mb-2">
          {!examFinished ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-indigo-900">
                <span>Soal {currentQuestionIdx + 1} dari {EXAM_QUESTIONS.length}</span>
                <span>Skor Sementara: {score}</span>
              </div>
              <p className="font-bold text-xs text-slate-800 bg-white p-2 rounded-xl border border-indigo-200">
                {EXAM_QUESTIONS[currentQuestionIdx].q}
              </p>
              <div className="space-y-1">
                {EXAM_QUESTIONS[currentQuestionIdx].a.map((ans, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => handleAnswer(aIdx)}
                    className="w-full text-left p-2 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 active:scale-98 transition-all"
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 space-y-1">
              <div className="text-2xl">🎉⭐</div>
              <div className="font-black text-sm text-indigo-950">
                Ujian Selesai! Nilai Kamu: {score}/100
              </div>
              <div className="text-xs font-bold text-emerald-600">
                Mendapatkan +{score * 2} Koin & +30 Poin Belajar! 🪙
              </div>
              <button
                onClick={() => setInExam(false)}
                className="mt-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black"
              >
                Tutup Ujian
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. DAFTAR PEKERJAAN & KARIER (PILIHAN KERJA UNTUK BAWA KOIN) */}
      <div className="flex-1 bg-white rounded-3xl p-3 border-2 border-pink-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-black text-xs text-slate-800 flex items-center gap-1">
            <span>💼</span> Lowongan Pekerjaan Kota (Bawa Pulang Koin):
          </span>
          <span className="text-[10px] font-bold text-pink-600">Gaji Langsung Cair</span>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[140px] no-scrollbar">
          {JOBS.map((job, idx) => (
            <div
              key={idx}
              className="p-2 bg-slate-50 hover:bg-pink-50 border border-slate-200 rounded-2xl flex items-center justify-between"
            >
              <div>
                <div className="font-black text-xs text-slate-800 leading-tight">{job.title}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Syarat: Minimal Lulus {job.minGrade}</div>
              </div>
              <button
                onClick={() => handleWork(job)}
                className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
              >
                Kerja (+🪙{job.salary})
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
