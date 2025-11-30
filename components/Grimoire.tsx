
import React, { useState } from 'react';
import { PatternType, PatternCategory } from '../types';
import { KNOWLEDGE_BASE } from '../services/marketEngine';
import { SoundService } from '../services/soundService';

interface GrimoireProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedPatterns: PatternType[];
  xp: number;
  completedModules?: string[];
  onClaimDaily?: () => void;
  onPractice?: (pattern: PatternType) => void;
}

const CATEGORIES: { id: PatternCategory; label: string; icon: string }[] = [
    { id: 'CANDLESTICK', label: 'Candlesticks', icon: 'candlestick_chart' },
    { id: 'CHART_PATTERN', label: 'Chart Patterns', icon: 'show_chart' },
    { id: 'HARMONIC', label: 'Harmonics', icon: 'polyline' },
    { id: 'SMC', label: 'Smart Money', icon: 'account_balance' },
    { id: 'QUANT', label: 'Quant', icon: 'functions' }
];

// Helper to categorize (simple string matching for MVP)
const getCategory = (p: string): PatternCategory => {
    if (p.includes('Gartley') || p.includes('Bat') || p.includes('Crab') || p.includes('Shark') || p.includes('Butterfly')) return 'HARMONIC';
    if (p.includes('Order Block') || p.includes('Wyckoff') || p.includes('Liquidity') || p.includes('Killzone') || p.includes('SFP')) return 'SMC';
    if (p.includes('VWAP') || p.includes('RSI') || p.includes('Cloud') || p.includes('Gap')) return 'QUANT';
    if (p.includes('Flag') || p.includes('Head') || p.includes('Bottom') || p.includes('Top')) return 'CHART_PATTERN';
    return 'CANDLESTICK';
};

const Grimoire: React.FC<GrimoireProps> = ({ isOpen, onClose, unlockedPatterns, xp, onPractice }) => {
  const [activeTab, setActiveTab] = useState<PatternCategory>('CANDLESTICK');
  const [selectedPattern, setSelectedPattern] = useState<PatternType | null>(null);

  if (!isOpen) return null;

  // Filter patterns by category
  const categoryPatterns = Object.keys(KNOWLEDGE_BASE.patterns).filter(k => 
      getCategory(k) === activeTab && k !== 'Random Walk'
  ) as PatternType[];

  const handlePatternClick = (p: PatternType) => {
      setSelectedPattern(p);
      SoundService.playClick();
  };

  const handlePractice = () => {
      if (selectedPattern && onPractice) {
          onPractice(selectedPattern);
          onClose();
      }
  };

  const isUnlocked = (p: PatternType) => unlockedPatterns.includes(p);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[90vh] bg-[#0E1117] border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden relative">
         
         {/* SIDEBAR NAVIGATION */}
         <div className="w-64 bg-[#161b22] border-r border-white/5 flex flex-col">
             <div className="p-6">
                 <h2 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-blue-500 tracking-tighter">
                     GRIMOIRE
                 </h2>
                 <p className="text-xs text-gray-500 font-mono mt-1">PATTERN DATABASE v2.5</p>
             </div>
             
             <div className="flex-1 px-4 space-y-2 overflow-y-auto">
                 {CATEGORIES.map(cat => (
                     <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            activeTab === cat.id 
                            ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' 
                            : 'text-gray-400 hover:bg-white/5'
                        }`}
                     >
                         <span className="material-symbols-rounded">{cat.icon}</span>
                         <span className="text-sm font-bold">{cat.label}</span>
                     </button>
                 ))}
             </div>

             <div className="p-4 border-t border-white/5">
                 <button onClick={onClose} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">
                     CLOSE DATABASE
                 </button>
             </div>
         </div>

         {/* MAIN CONTENT AREA */}
         <div className="flex-1 flex relative">
             {/* PATTERN GRID */}
             <div className={`flex-1 p-6 overflow-y-auto ${selectedPattern ? 'w-1/2 hidden md:block' : 'w-full'}`}>
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                     <span className="w-2 h-6 bg-neon-green rounded-full"></span>
                     {CATEGORIES.find(c => c.id === activeTab)?.label}
                 </h3>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {categoryPatterns.map(p => {
                         const locked = !isUnlocked(p);
                         return (
                             <button 
                                key={p}
                                onClick={() => handlePatternClick(p)}
                                className={`aspect-square rounded-2xl p-4 flex flex-col justify-between border text-left transition-all hover:scale-105 active:scale-95
                                    ${selectedPattern === p ? 'ring-2 ring-neon-green border-transparent' : ''}
                                    ${locked 
                                        ? 'bg-[#0a0a0a] border-white/5 opacity-50 grayscale' 
                                        : 'bg-gradient-to-br from-[#1c2128] to-[#0d1117] border-white/10 hover:border-neon-green/50 shadow-lg'
                                    }
                                `}
                             >
                                 <div className="flex justify-between w-full">
                                    <span className="text-2xl">{locked ? '🔒' : '📈'}</span>
                                    {locked && <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">LOCKED</span>}
                                 </div>
                                 <div>
                                     <div className="text-[10px] text-gray-500 font-mono mb-1">{locked ? 'UNKNOWN' : getCategory(p)}</div>
                                     <div className="text-xs font-bold text-white leading-tight">{p}</div>
                                 </div>
                             </button>
                         )
                     })}
                 </div>
             </div>

             {/* DETAIL PANEL (DATA SHEET) */}
             {selectedPattern && (
                 <div className="absolute inset-0 md:static md:w-[400px] bg-[#0E1117] border-l border-white/10 flex flex-col z-20 animate-fade-in-up">
                     <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#161b22]">
                         <div>
                             <h2 className="text-2xl font-black text-white leading-tight mb-1">{selectedPattern}</h2>
                             <span className="text-xs font-mono text-neon-green px-2 py-0.5 bg-neon-green/10 rounded border border-neon-green/30">
                                 {isUnlocked(selectedPattern) ? 'MASTERED' : 'LOCKED INTEL'}
                             </span>
                         </div>
                         <button onClick={() => setSelectedPattern(null)} className="md:hidden p-2 bg-white/10 rounded-full">
                             <span className="material-symbols-rounded">close</span>
                         </button>
                     </div>

                     <div className="flex-1 p-6 overflow-y-auto space-y-6">
                         {/* Visual Representation Placeholder */}
                         <div className="w-full h-40 bg-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20"></div>
                             <span className="text-4xl animate-pulse">
                                 {KNOWLEDGE_BASE.patterns[selectedPattern].action === 'LONG' ? '🚀' : '📉'}
                             </span>
                         </div>

                         {/* Stats Grid */}
                         <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                 <div className="text-[10px] text-gray-500 uppercase">Win Rate</div>
                                 <div className="text-xl font-mono font-bold text-white">
                                     {isUnlocked(selectedPattern) ? `${(60 + Math.random() * 25).toFixed(1)}%` : '??%'}
                                 </div>
                             </div>
                             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                 <div className="text-[10px] text-gray-500 uppercase">Avg R:R</div>
                                 <div className="text-xl font-mono font-bold text-white">
                                     {isUnlocked(selectedPattern) ? '1 : 2.5' : '?:?'}
                                 </div>
                             </div>
                         </div>

                         {/* Description */}
                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tactical Analysis</h4>
                             <p className="text-sm text-gray-300 leading-relaxed">
                                 {KNOWLEDGE_BASE.patterns[selectedPattern].meaning}
                             </p>
                         </div>

                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Visual ID</h4>
                             <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-gray-700 pl-3">
                                 "{KNOWLEDGE_BASE.patterns[selectedPattern].visual}"
                             </p>
                         </div>
                     </div>

                     <div className="p-6 border-t border-white/10 bg-[#161b22]">
                         <button 
                            onClick={handlePractice}
                            className="w-full py-4 bg-neon-green hover:bg-white text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,148,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                         >
                             <span className="material-symbols-rounded">sports_esports</span>
                             SIMULATE PATTERN
                         </button>
                         {!isUnlocked(selectedPattern) && (
                             <p className="text-center text-[10px] text-gray-500 mt-2">
                                 Warning: Simulating locked patterns does not grant XP.
                             </p>
                         )}
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default Grimoire;
