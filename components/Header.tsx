
import React from 'react';
import { UserStats, AppView } from '../types';

interface HeaderProps {
  stats: UserStats;
  currentView: AppView; // Add currentView prop
  onOpenGrimoire: () => void;
}

const Header: React.FC<HeaderProps> = ({ stats, currentView, onOpenGrimoire }) => {
  const isPlayMode = currentView === AppView.PLAY;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center bg-gradient-to-b from-[#050505] to-transparent pointer-events-none">
      
      {/* Left: Brand & Grimoire */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {isPlayMode && (
            <button 
              onClick={onOpenGrimoire}
              className="glass-button w-10 h-10 rounded-full flex items-center justify-center text-xl hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pop"
            >
              📖
            </button>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">CHART//SWIPE</span>
          <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_5px_#00FF94]"></span>
              <span className="text-neon-green font-mono text-xs font-bold">LVL {Math.floor(stats.xp / 1000) + 1}</span>
          </div>
        </div>
      </div>

      {/* Only show Stats in Play Mode */}
      {isPlayMode && (
        <>
            {/* Center: Balance & Candles */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in-up">
                <div className="flex gap-2">
                    <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="text-lg">🕯️</span>
                        <span className="font-mono font-bold text-sm text-white drop-shadow-md">
                        {stats.candles.toFixed(1)}
                        </span>
                    </div>
                    <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="font-mono font-bold text-sm text-white drop-shadow-md">
                        ${stats.balance.toLocaleString()}
                        </span>
                    </div>
                </div>
                {stats.streak > 1 && (
                <span className="text-[10px] font-black text-orange-400 animate-pulse mt-1 tracking-wider drop-shadow-md">
                    🔥 {stats.streak} STREAK
                </span>
                )}
            </div>

            {/* Right: Lives */}
            <div className="glass-panel px-3 py-1.5 rounded-full flex gap-1 pointer-events-auto animate-fade-in-up">
                {[...Array(3)].map((_, i) => (
                <span 
                    key={i} 
                    className={`text-sm transition-all duration-500 material-symbols-rounded ${i < stats.hearts ? 'text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]' : 'text-gray-700'}`}
                >
                    favorite
                </span>
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default Header;
