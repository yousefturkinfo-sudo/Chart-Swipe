
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SoundService } from '../services/soundService';

interface ModuleCompleteModalProps {
  xp: number;
  money: number;
  onClose: () => void;
}

const ModuleCompleteModal: React.FC<ModuleCompleteModalProps> = ({ xp, money, onClose }) => {
  const [coins, setCoins] = useState<{ id: number; x: number; delay: number; scale: number }[]>([]);

  useEffect(() => {
    // Generate raining money particles
    const newCoins = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      delay: Math.random() * 2,
      scale: 0.5 + Math.random() * 1
    }));
    setCoins(newCoins);
    
    SoundService.playJackpot();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden">
      
      {/* Raining Money Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ y: -100, x: `${coin.x}vw`, opacity: 0 }}
            animate={{ y: '110vh', opacity: 1 }}
            transition={{ 
              duration: 2 + Math.random(), 
              repeat: Infinity, 
              delay: coin.delay,
              ease: "linear"
            }}
            style={{ position: 'absolute', fontSize: `${coin.scale * 2}rem` }}
          >
            {Math.random() > 0.5 ? '💸' : (Math.random() > 0.5 ? '💰' : '💎')}
          </motion.div>
        ))}
      </div>

      {/* Main Card */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotateX: 45 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        className="relative z-10 w-full max-w-md bg-[#161b22] border-2 border-neon-green rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_100px_rgba(0,255,148,0.4)]"
      >
        <div className="absolute -top-12">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_50px_#FACC15] border-4 border-white"
            >
                <span className="text-4xl">🏆</span>
            </motion.div>
        </div>

        <h1 className="text-4xl font-black italic text-white mt-10 mb-2">MODULE COMPLETE!</h1>
        <p className="text-gray-400 text-sm font-mono uppercase tracking-widest mb-8">Knowledge Secured</p>

        <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-neon-green/30 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-2xl mb-1">⚡</span>
                <span className="text-3xl font-black text-neon-green">+{xp}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Experience</span>
            </div>
            <div className="bg-white/5 border border-neon-green/30 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-2xl mb-1">💵</span>
                <span className="text-3xl font-black text-neon-green">+${money}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Bonus Cash</span>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full py-4 bg-neon-green hover:bg-white text-black font-black text-lg rounded-xl shadow-[0_0_30px_rgba(0,255,148,0.6)] hover:shadow-[0_0_50px_rgba(255,255,255,0.8)] transition-all transform active:scale-95"
        >
            CLAIM REWARDS
        </button>
      </motion.div>
    </div>
  );
};

export default ModuleCompleteModal;
