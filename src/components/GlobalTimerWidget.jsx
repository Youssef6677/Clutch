import React from 'react';
import { usePomodoro } from '../context/PomodoroContext';

const GlobalTimerWidget = () => {
  const { timeLeft, isActive, stopPomodoro } = usePomodoro();

  if (!isActive) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right duration-300">
      <div className="bg-gray-900 border-4 border-gray-950 p-4 rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.2)] flex items-center gap-4 group">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] mb-1">Concentration 🔥</span>
          <span className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <button 
          onClick={stopPomodoro}
          className="w-10 h-10 bg-rose-500 border-2 border-gray-950 rounded flex items-center justify-center text-xl hover:bg-rose-600 active:translate-y-1 active:shadow-none transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          title="Abandonner la session"
        >
          ⏹️
        </button>
      </div>
    </div>
  );
};

export default GlobalTimerWidget;
