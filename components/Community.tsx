
import React from 'react';
import { UserStats } from '../types';

const MOCK_LEADERBOARD = [
  { id: '1', name: 'CryptoKing', xp: 15400, avatar: '👑' },
  { id: '2', name: 'SatoshiGhost', xp: 12250, avatar: '👻' },
  { id: '3', name: 'AlphaHunter', xp: 9800, avatar: '🦁' },
  { id: '4', name: 'WallStBets', xp: 8500, avatar: '🦍' },
  { id: '5', name: 'DiamondHands', xp: 7200, avatar: '💎' },
  { id: '6', name: 'BagHolder', xp: 6500, avatar: '🎒' },
  { id: '7', name: 'MoonBoy', xp: 5400, avatar: '🚀' },
];

const Community: React.FC<{ myStats: UserStats }> = ({ myStats }) => {
  return (
    <div className="flex flex-col items-center px-4 pt-24 pb-32 min-h-screen w-full">
       <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-8 tracking-tighter">
        GLOBAL RANK
      </h2>

      <div className="w-full max-w-md bg-[#161b22]/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top 3 Podium */}
        <div className="bg-gradient-to-b from-[#1c2128] to-[#161b22] p-6 border-b border-white/5 flex justify-between items-end pb-8">
           {/* 2nd Place */}
           <div className="flex flex-col items-center translate-y-2">
              <div className="text-xs font-bold text-gray-400 mb-1">2ND</div>
              <div className="w-16 h-16 rounded-full bg-gray-700/50 border-2 border-gray-400 flex items-center justify-center text-2xl mb-2 relative">
                  <span>👻</span>
                  <div className="absolute -bottom-2 bg-gray-600 text-[9px] px-2 rounded-full border border-gray-400">Satoshi</div>
              </div>
              <span className="text-[10px] text-neon-green font-mono">12.2k</span>
           </div>
           
           {/* 1st Place */}
           <div className="flex flex-col items-center -translate-y-4 relative z-10">
              <div className="text-xs font-bold text-yellow-400 mb-1">CHAMPION</div>
              <div className="w-20 h-20 rounded-full bg-yellow-900/30 border-2 border-yellow-400 flex items-center justify-center text-4xl mb-2 shadow-[0_0_30px_rgba(250,204,21,0.4)] relative">
                  <span>👑</span>
                  <div className="absolute -bottom-2 bg-yellow-600 text-[10px] px-2 rounded-full border border-yellow-400 font-bold text-black">King</div>
              </div>
              <span className="text-xs text-neon-green font-mono font-bold">15.4k XP</span>
           </div>

           {/* 3rd Place */}
           <div className="flex flex-col items-center translate-y-2">
              <div className="text-xs font-bold text-orange-700 mb-1">3RD</div>
              <div className="w-16 h-16 rounded-full bg-orange-900/20 border-2 border-orange-700 flex items-center justify-center text-2xl mb-2 relative">
                  <span>🦁</span>
                  <div className="absolute -bottom-2 bg-orange-800 text-[9px] px-2 rounded-full border border-orange-700 text-orange-200">Alpha</div>
              </div>
              <span className="text-[10px] text-neon-green font-mono">9.8k</span>
           </div>
        </div>

        {/* Scrollable List */}
        <div className="flex flex-col max-h-[400px] overflow-y-auto hide-scrollbar">
           {MOCK_LEADERBOARD.slice(3).map((user, i) => (
             <div key={user.id} className="flex items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                <span className="w-8 text-center font-mono text-gray-500 font-bold text-sm">{i + 4}</span>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-4 text-lg group-hover:scale-110 transition-transform">{user.avatar}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-200">{user.name}</h4>
                </div>
                <span className="font-mono text-neon-green text-sm opacity-80">{user.xp.toLocaleString()} XP</span>
             </div>
           ))}
           
           {/* Current User Sticky Row */}
           <div className="sticky bottom-0 flex items-center p-4 bg-[#1c2128] border-t-2 border-neon-green/50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                <span className="w-8 text-center font-mono text-neon-green font-bold">99</span>
                <div className="w-10 h-10 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center mr-4 text-lg">👤</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-white">YOU</h4>
                </div>
                <span className="font-mono text-neon-green text-sm font-bold">{myStats.xp.toLocaleString()} XP</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
