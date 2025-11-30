
import React from 'react';
import { ChartSkin } from '../types';
import { SoundService } from '../services/soundService';

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
  candles: number;
  ownedSkins: ChartSkin[];
  equippedSkin: ChartSkin;
  onBuySkin: (skin: ChartSkin, cost: number) => void;
  onEquipSkin: (skin: ChartSkin) => void;
}

const SKINS: { id: ChartSkin; name: string; cost: number; colors: string; desc: string }[] = [
    { id: 'DEFAULT', name: 'Standard Issue', cost: 0, colors: 'from-gray-800 to-gray-900', desc: 'Reliable. Classic.' },
    { id: 'MATRIX', name: 'The Construct', cost: 25, colors: 'from-green-900 to-black', desc: 'Code rain aesthetic.' },
    { id: 'VAPORWAVE', name: 'Miami 84', cost: 50, colors: 'from-pink-500 to-cyan-500', desc: 'Retro sunset vibes.' },
    { id: 'BLUEPRINT', name: 'Architect', cost: 75, colors: 'from-blue-900 to-blue-800', desc: 'Technical schematics.' },
    { id: 'MIDNIGHT', name: 'Void Walker', cost: 100, colors: 'from-purple-900 to-black', desc: 'Deep space stealth.' },
    { id: 'CYBERPUNK', name: 'Night City', cost: 150, colors: 'from-yellow-400 to-red-600', desc: 'High tech, low life.' },
];

const Store: React.FC<StoreProps> = ({ isOpen, onClose, candles, ownedSkins, equippedSkin, onBuySkin, onEquipSkin }) => {
  if (!isOpen) return null;

  const handleAction = (skin: typeof SKINS[0]) => {
      if (ownedSkins.includes(skin.id)) {
          if (equippedSkin !== skin.id) {
              onEquipSkin(skin.id);
              SoundService.playClick();
          }
      } else {
          if (candles >= skin.cost) {
              onBuySkin(skin.id, skin.cost);
              SoundService.playWin(); // Purchase sound
          } else {
              SoundService.playLoss(); // Not enough funds
          }
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <div className="w-full max-w-4xl h-[80vh] bg-[#0E1117] border border-white/10 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#161b22]">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 tracking-tighter">
                        SKIN STORE
                    </h2>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                        <span className="text-xl">🕯️</span>
                        <span className="font-mono font-bold text-white">{candles.toFixed(1)}</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <span className="material-symbols-rounded text-white">close</span>
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SKINS.map(skin => {
                    const isOwned = ownedSkins.includes(skin.id);
                    const isEquipped = equippedSkin === skin.id;
                    const canAfford = candles >= skin.cost;

                    return (
                        <div key={skin.id} className={`relative group rounded-2xl p-4 border transition-all duration-300
                            ${isEquipped ? 'border-neon-green bg-neon-green/5 shadow-[0_0_20px_rgba(0,255,148,0.2)]' : 'border-white/10 bg-[#1c2128] hover:border-white/30'}
                        `}>
                            {/* Preview Box */}
                            <div className={`w-full h-32 rounded-xl mb-4 bg-gradient-to-br ${skin.colors} relative overflow-hidden shadow-inner`}>
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                                {/* Mock Chart Line */}
                                <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                                    <path d="M0,25 Q25,10 50,25 T100,40" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
                                </svg>
                                {isEquipped && (
                                    <div className="absolute top-2 right-2 bg-neon-green text-black text-[10px] font-bold px-2 py-0.5 rounded">
                                        EQUIPPED
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-white">{skin.name}</h3>
                                    <p className="text-[10px] text-gray-400">{skin.desc}</p>
                                </div>
                                {!isOwned && (
                                    <div className="text-neon-pink font-mono font-bold text-sm">
                                        {skin.cost} 🕯️
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => handleAction(skin)}
                                disabled={!isOwned && !canAfford}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-2
                                    ${isEquipped 
                                        ? 'bg-neon-green/20 text-neon-green cursor-default'
                                        : isOwned 
                                            ? 'bg-white text-black hover:bg-gray-200'
                                            : canAfford 
                                                ? 'bg-neon-pink text-white hover:bg-pink-600 shadow-[0_0_15px_rgba(255,0,85,0.3)]'
                                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }
                                `}
                            >
                                {isEquipped ? 'ACTIVE' : (isOwned ? 'EQUIP' : (canAfford ? 'PURCHASE' : 'LOCKED'))}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default Store;
