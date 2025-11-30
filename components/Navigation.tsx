
import React from 'react';
import { AppView } from '../types';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
}

const TABS = [
  { id: AppView.HOME, icon: 'grid_view', label: 'Home' },
  { id: AppView.LEARN, icon: 'school', label: 'Learn' },
  { id: AppView.PLAY, icon: 'candlestick_chart', label: 'Trade' },
  { id: AppView.QUANT, icon: 'terminal', label: 'Quant' },
  { id: AppView.ANALYZE, icon: 'auto_awesome', label: 'Oracle' },
  { id: AppView.COMMUNITY, icon: 'leaderboard', label: 'Rank' },
  { id: AppView.PROFILE, icon: 'account_circle', label: 'Me' }
];

const Navigation: React.FC<NavigationProps> = ({ currentView, onChange }) => {
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[98vw]">
      <div className="glass-panel rounded-full px-2 py-2 flex gap-1 sm:gap-2 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl bg-black/40">
         
         {TABS.map((tab) => {
           const isActive = currentView === tab.id;
           return (
             <button
               key={tab.id}
               onClick={() => onChange(tab.id)}
               className={`relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center transition-colors duration-300 ${isActive ? 'text-black' : 'text-gray-400 hover:text-white'}`}
             >
               {isActive && (
                 <motion.div 
                   layoutId="activeTab"
                   className="absolute inset-0 bg-neon-green rounded-full -z-10 shadow-[0_0_20px_#00FF94]"
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
               )}
               <span className="material-symbols-rounded text-xl sm:text-2xl mb-0.5">{tab.icon}</span>
             </button>
           )
         })}
      </div>
    </div>
  );
};

export default Navigation;
