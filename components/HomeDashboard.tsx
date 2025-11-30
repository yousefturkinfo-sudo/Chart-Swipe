
import React from 'react';
import { motion } from 'framer-motion';
import { UserStats, UserProfile, AppView } from '../types';
import { SoundService } from '../services/soundService';

interface HomeDashboardProps {
  stats: UserStats;
  profile: UserProfile;
  onNavigate: (view: AppView) => void;
  onOpenGrimoire: () => void;
  onOpenStore?: () => void; // New Prop
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ stats, profile, onNavigate, onOpenGrimoire, onOpenStore }) => {
  
  // Calculate Levels
  const level = Math.floor(stats.xp / 1000) + 1;
  const xpForNextLevel = 1000;
  const currentLevelXp = stats.xp % 1000;
  const progressPercent = (currentLevelXp / xpForNextLevel) * 100;

  const handleNav = (view: AppView) => {
      SoundService.playClick();
      onNavigate(view);
  };

  return (
    <div className="flex flex-col px-4 pt-24 pb-32 min-h-screen w-full relative overflow-hidden">
      
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in-up z-10">
        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">TERMINAL ONLINE</h2>
        <h1 className="text-3xl font-black text-white">
          WELCOME BACK, <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-blue-500">
            {profile.name?.toUpperCase() || 'TRADER'}
          </span>
        </h1>
      </div>

      {/* Mastery Tracking Bar (Animated) */}
      <div className="w-full bg-[#161b22] border border-white/10 rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-end mb-2 relative z-10">
             <div>
                <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Current Clearance</span>
                <span className="text-2xl font-black text-white">LEVEL {level}</span>
             </div>
             <div className="text-right">
                <span className="text-neon-green font-mono font-bold">{currentLevelXp} / {xpForNextLevel} XP</span>
             </div>
          </div>

          {/* Progress Bar Container */}
          <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-neon-green to-emerald-600 shadow-[0_0_15px_#00FF94] relative"
              >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12 transform origin-left"></div>
              </motion.div>
          </div>
          
          <p className="text-[10px] text-gray-500 mt-3 relative z-10">
             {1000 - currentLevelXp} XP remaining until next tier upgrade.
          </p>

          {/* Background Decoration */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Feature Showcase (Carousel style) */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
         <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
            SYSTEM UPDATES
         </h3>
         
         <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x">
             
             {/* Feature 0: Skin Store (NEW) */}
             <button onClick={onOpenStore} className="snap-center shrink-0 w-[85%] bg-gradient-to-br from-pink-900/40 to-[#161b22] border border-pink-500/30 rounded-3xl p-5 relative overflow-hidden group text-left">
                 <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                     <span className="material-symbols-rounded text-6xl text-pink-400">palette</span>
                 </div>
                 <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-300 text-[9px] font-bold border border-pink-500/50 mb-3 inline-block">
                    MARKETPLACE
                 </span>
                 <h4 className="text-xl font-black text-white mb-1">SKIN STORE</h4>
                 <p className="text-sm text-gray-400 leading-snug">
                     Spend your Candles. Unlock Matrix, Cyberpunk, and Vaporwave chart themes.
                 </p>
             </button>

             {/* Feature 1: Grimoire */}
             <button onClick={onOpenGrimoire} className="snap-center shrink-0 w-[85%] bg-gradient-to-br from-purple-900/40 to-[#161b22] border border-purple-500/30 rounded-3xl p-5 relative overflow-hidden group text-left">
                 <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                     <span className="material-symbols-rounded text-6xl text-purple-400">menu_book</span>
                 </div>
                 <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/50 mb-3 inline-block">
                    NEW MODULE
                 </span>
                 <h4 className="text-xl font-black text-white mb-1">THE GRIMOIRE 2.0</h4>
                 <p className="text-sm text-gray-400 leading-snug">
                     25+ New Patterns added. Harmonics, SMC, and Algo strategies now unlockable.
                 </p>
             </button>

             {/* Feature 2: Voice Mode */}
             <button onClick={() => handleNav(AppView.PLAY)} className="snap-center shrink-0 w-[85%] bg-gradient-to-br from-blue-900/40 to-[#161b22] border border-blue-500/30 rounded-3xl p-5 relative overflow-hidden group text-left">
                 <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                     <span className="material-symbols-rounded text-6xl text-blue-400">graphic_eq</span>
                 </div>
                 <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/50 mb-3 inline-block">
                    BETA
                 </span>
                 <h4 className="text-xl font-black text-white mb-1">VOICE MODE</h4>
                 <p className="text-sm text-gray-400 leading-snug">
                     Talk to the charts. Real-time AI analysis with hands-free interaction.
                 </p>
             </button>
         </div>
      </div>

      {/* Quick Actions Grid */}
      <h3 className="text-sm font-bold text-white mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          QUICK DEPLOY
      </h3>
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => handleNav(AppView.PLAY)}
            className="bg-[#161b22] hover:bg-[#1c2128] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
              <div className="w-12 h-12 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green">
                  <span className="material-symbols-rounded text-2xl">candlestick_chart</span>
              </div>
              <span className="font-bold text-sm">SIMULATOR</span>
          </button>

          <button 
            onClick={() => handleNav(AppView.LEARN)}
            className="bg-[#161b22] hover:bg-[#1c2128] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <span className="material-symbols-rounded text-2xl">school</span>
              </div>
              <span className="font-bold text-sm">ACADEMY</span>
          </button>

          <button 
            onClick={() => handleNav(AppView.ANALYZE)}
            className="bg-[#161b22] hover:bg-[#1c2128] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-rounded text-2xl">center_focus_weak</span>
              </div>
              <span className="font-bold text-sm">SCANNER</span>
          </button>
          
          <button 
             onClick={() => handleNav(AppView.QUANT)}
             className="bg-[#161b22] hover:bg-[#1c2128] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-rounded text-2xl">terminal</span>
              </div>
              <span className="font-bold text-sm">QUANT HUB</span>
          </button>
      </div>

    </div>
  );
};

export default HomeDashboard;
