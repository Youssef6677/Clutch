import React, { useState } from 'react';
import { usePomodoro } from '../context/PomodoroContext';

const PomodoroPage = () => {
  const { timeLeft, isActive, startPomodoro, stopPomodoro } = usePomodoro();
  const [minutes, setMinutes] = useState(25);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (minutes > 0 && minutes <= 240) {
      startPomodoro(minutes);
    } else {
      alert("Veuillez choisir une durée entre 1 et 240 minutes.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700 transition-colors duration-300">
      <header className="mb-12 text-center">
        <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_2px_rgba(255,255,255,0.1)]" style={{ fontFamily: 'monospace' }}>
          ⏳ Salle de Concentration
        </h2>
        <p className="text-lg font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          Lancez une quête de focus pour gagner de l'XP (1 min = 1 XP).
        </p>
      </header>

      <div className="w-full max-w-2xl">
        {!isActive ? (
          <div className="bevel-3d-deep p-12 bg-white dark:bg-slate-800 flex flex-col items-center gap-8 transition-all duration-300 dark:hover:shadow-[0_0_40px_rgba(52,211,153,0.1)]">
            <div className="flex flex-col items-center gap-4 w-full">
              <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">Durée de la session (minutes)</label>
              <input 
                type="number" 
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value))}
                min="1"
                max="240"
                className="w-48 text-center text-6xl font-black border-4 border-gray-800 dark:border-slate-600 p-4 rounded-lg focus:outline-none focus:ring-0 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors"
              />
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-emerald-400 dark:bg-emerald-500 text-gray-900 dark:text-white font-black py-8 rounded-xl border-b-8 border-emerald-600 dark:border-emerald-700 hover:border-b-0 hover:translate-y-2 active:scale-95 transition-all uppercase tracking-[0.2em] text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
            >
              Démarrer la Quête ⚔️
            </button>
            
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 italic">
              "Le temps est votre ressource la plus précieuse."
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 dark:bg-slate-950 border-8 border-gray-950 dark:border-slate-800 p-20 rounded-xl shadow-[20px_20px_0px_0px_rgba(31,41,55,0.2)] dark:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)] flex flex-col items-center gap-12 relative overflow-hidden group transition-all duration-300 glow-yellow">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-xl font-black text-yellow-400 uppercase tracking-[0.5em] mb-4 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">Session Active 🔥</span>
              <div className="text-[12rem] leading-none font-black text-white tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'monospace' }}>
                {formatTime(timeLeft)}
              </div>
            </div>

            <button 
              onClick={stopPomodoro}
              className="relative z-10 bg-rose-500 text-white font-black px-12 py-4 rounded-lg border-b-4 border-rose-700 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest"
            >
              Abandonner la Quête ⏹️
            </button>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <div className="p-4 border-4 border-gray-800 dark:border-slate-700 bg-white dark:bg-slate-800 text-center transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
          <span className="block text-2xl mb-2">⚡</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">Focus Total</span>
        </div>
        <div className="p-4 border-4 border-gray-800 dark:border-slate-700 bg-white dark:bg-slate-800 text-center transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
          <span className="block text-2xl mb-2">💎</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">Récompense XP</span>
        </div>
        <div className="p-4 border-4 border-gray-800 dark:border-slate-700 bg-white dark:bg-slate-800 text-center transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
          <span className="block text-2xl mb-2">🛡️</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">Zone de Paix</span>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
