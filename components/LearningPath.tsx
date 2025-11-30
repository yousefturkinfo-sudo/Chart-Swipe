
import React, { useState, useEffect } from 'react';
import { AppView, UserStats, LearningTrack, AcademyModule } from '../types';
import { BackendService } from '../services/backendService';
import { SoundService } from '../services/soundService';
import { supabase } from '../services/supabaseClient';

interface LearningPathProps {
  stats: UserStats;
  onChangeView: (view: AppView) => void;
  onSelectTrack: (track: LearningTrack) => void;
  onSelectModule?: (moduleId: string) => void;
  onBreakBond?: (moduleId: string) => void; // New Handler
}

const LearningPath: React.FC<LearningPathProps> = ({ stats, onChangeView, onSelectTrack, onSelectModule, onBreakBond }) => {
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const loadData = async () => {
         const mods = await BackendService.fetchModulesWithLessons();
         setModules(mods);

         const { data: { session } } = await supabase.auth.getSession();
         if (session) {
             const progress = await BackendService.fetchUserProgress(session.user.id);
             setCompletedLessonIds(progress);
         }
         setLoading(false);
     };
     loadData();
  }, []);

  const trackModules = modules.filter(m => m.track === stats.currentTrack);

  const handleTrackChange = (track: LearningTrack) => {
      SoundService.playClick();
      onSelectTrack(track);
  }
  
  const handleModuleClick = (module: AcademyModule, isLocked: boolean) => {
      if (isLocked) {
          SoundService.playLoss();
          return;
      }
      SoundService.playClick();
      
      if (onSelectModule) {
          onSelectModule(module.id);
          onChangeView(AppView.FIN_LIT);
      }
  };

  const handleLineClick = (moduleId: string) => {
      if (onBreakBond) onBreakBond(moduleId);
  };

  if (loading) return <div className="text-center pt-20 text-neon-green font-mono animate-pulse">SYNCING ACADEMY DATA...</div>;

  return (
    <div className="flex flex-col items-center px-4 pt-24 pb-32 min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[#0E1117]">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
      </div>

      <h1 className="text-3xl font-black text-white mb-6 z-10 tracking-tight text-center">MASTERY PATH</h1>

      <div className="flex gap-3 mb-12 z-20 overflow-x-auto w-full max-w-lg px-2 pb-2 hide-scrollbar snap-x">
        {Object.values(LearningTrack).map((track) => (
            <button
                key={track}
                onClick={() => handleTrackChange(track)}
                className={`snap-center shrink-0 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                    ${stats.currentTrack === track 
                        ? 'bg-neon-green text-black border-neon-green shadow-[0_0_15px_rgba(0,255,148,0.3)]' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}
                `}
            >
                {track}
            </button>
        ))}
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center z-10">
        {/* Center Line visual (background) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-900 -translate-x-1/2 rounded-full -z-20"></div>

        {trackModules.map((module, index) => {
          let isUnlocked = false;
          let progressPercent = 0;

          // Check if previous module is done OR if current module is manually unlocked via Bond Breaking (using completedModules list as proxy or separate state)
          // For simplicity, we check if this module ID is in completedModules OR if the previous one is done.
          // Wait, unlocking via bond means we can access it. So we need to check if it's unlocked.
          
          if (index === 0) {
              isUnlocked = true;
          } else {
              // Check if specifically unlocked (Bond Broken)
              // NOTE: In a real app, 'completedModules' might also store unlocked-but-not-completed IDs, or we'd have a separate 'unlockedModules' list.
              // For this implementation, we will assume if it's in 'unlockedPatterns' it's accessible? No, patterns are different.
              // We will rely on stats logic passed down or assume standard progression unless bond broken.
              // Let's assume if stats.completedModules includes the ID, it is completed.
              // If the PREVIOUS module is completed, this one is unlocked.
              
              const prevModule = trackModules[index - 1];
              if (prevModule) {
                  const prevLessonsTotal = prevModule.lessons.length;
                  const prevLessonsDone = prevModule.lessons.filter(l => completedLessonIds.includes(l.id)).length;
                  
                  // Logic: Unlocked if previous finished OR if this module was "Bond Broken" (we'll implement that state in App)
                  // For now, let's use a temporary visual check based on standard progression
                  if ((prevLessonsTotal > 0 && prevLessonsDone >= prevLessonsTotal) || !module.isLockedByDefault) {
                      isUnlocked = true;
                  }
              }
          }
          
          // Override: If the user paid candles to unlock this specific module, it should be unlocked. 
          // We can check this by seeing if any lesson in it is completed? No.
          // We need to pass down unlocked state from App. 
          // For now, we stick to the sequential logic visually, but allow clicking the line to unlock.

          const currentTotal = module.lessons.length;
          const currentDone = module.lessons.filter(l => completedLessonIds.includes(l.id)).length;
          const isCompleted = currentTotal > 0 && currentDone >= currentTotal;
          if (currentTotal > 0) progressPercent = (currentDone / currentTotal) * 100;

          const isLocked = !isUnlocked;
          const isLeft = index % 2 === 0;

          return (
            <div 
              key={module.id} 
              className={`relative w-full flex mb-16 items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
            >
               {/* Node Animation */}
               <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-0 transition-all
                   ${isUnlocked ? 'bg-neon-green border-neon-green shadow-[0_0_10px_#00FF94]' : 'bg-gray-900 border-gray-600'}
               `} />

               {/* INTERACTIVE CONNECTION LINE */}
               <button
                  onClick={() => isLocked && handleLineClick(module.id)}
                  disabled={!isLocked}
                  className={`absolute top-1/2 h-1 -translate-y-1/2 z-0
                      ${isLeft ? 'right-1/2 origin-right' : 'left-1/2 origin-left'}
                      w-1/2 transition-all duration-300 group/line
                  `}
               >
                   <div className={`w-full h-full rounded-full ${isUnlocked ? 'bg-neon-green/50' : 'bg-gray-800 group-hover/line:bg-gray-600 cursor-pointer'}`}></div>
                   
                   {/* Break Bond Hint */}
                   {isLocked && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/20 rounded px-2 py-0.5 opacity-0 group-hover/line:opacity-100 transition-opacity whitespace-nowrap z-20">
                           <span className="text-[9px] text-white font-bold">✂️ 12.5 🕯️</span>
                       </div>
                   )}
               </button>

               <button
                onClick={() => handleModuleClick(module, isLocked)}
                className={`group relative w-[45%] aspect-square max-w-[140px] rounded-3xl p-4 flex flex-col items-center justify-between shadow-xl transition-all duration-300 hover:scale-105 z-10
                  ${isLocked 
                    ? 'bg-[#161b22] border border-white/5 grayscale opacity-60' 
                    : `bg-gradient-to-br ${module.color} border border-white/20`
                  }
                  ${isUnlocked && !isCompleted ? 'ring-2 ring-neon-green shadow-[0_0_25px_rgba(0,255,148,0.3)] animate-pulse-glow' : ''}
                `}
              >
                 <div className="flex-1 flex items-center justify-center">
                    {isLocked ? (
                        <span className="material-symbols-rounded text-3xl text-gray-500">lock</span>
                    ) : (
                        <span className="material-symbols-rounded text-4xl text-white drop-shadow-md group-hover:animate-bounce">{module.icon}</span>
                    )}
                 </div>

                 <div className="w-full text-center">
                   <div className="font-bold text-xs text-white leading-tight mb-1">{module.title}</div>
                   {!isLocked && (
                     <div className="w-full h-1 bg-black/30 mt-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-white transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }} 
                        />
                     </div>
                   )}
                 </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;
