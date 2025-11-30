
import React, { useState } from 'react';
import { OnboardingData, LearningStyle } from '../types';
import { SoundService } from '../services/soundService';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    experience: 'NOVICE',
    goal: 'DAY_TRADING',
    risk: 'LOW',
    learningStyle: LearningStyle.VISUAL
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelect = (key: keyof OnboardingData, value: any) => {
    SoundService.playClick();
    setData(prev => ({ ...prev, [key]: value }));
    
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    setIsGenerating(true);
    SoundService.playUnlock(); 
    await new Promise(r => setTimeout(r, 2000));
    onComplete(data);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#050505]">
         <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-neon-green/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🧠</div>
         </div>
         <h2 className="text-2xl font-black text-neon-green mb-2">OPTIMIZING NEURAL PATH...</h2>
         <p className="text-gray-400">Calibrating curriculum to your learning style.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#050505] relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-12 left-6 right-6 h-1 bg-white/10 rounded-full overflow-hidden">
         <div className="h-full bg-neon-green transition-all duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
      </div>

      <h1 className="text-4xl font-black text-white mb-2 mt-10">SETUP PROFILE</h1>
      <p className="text-gray-500 mb-12 text-sm uppercase tracking-widest">Let the AI customize your journey</p>

      <div className="w-full max-w-md space-y-4 z-10">
        {step === 0 && (
           <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-6 text-center">What is your trading experience?</h3>
              <OptionButton label="I'm a total beginner" sub="I don't know what a candle is" onClick={() => handleSelect('experience', 'NOVICE')} />
              <OptionButton label="I know the basics" sub="I've traded stocks before" onClick={() => handleSelect('experience', 'INTERMEDIATE')} />
              <OptionButton label="I'm a pro" sub="I want advanced strategies" onClick={() => handleSelect('experience', 'PRO')} />
           </div>
        )}
        
        {step === 1 && (
           <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-6 text-center">What is your main goal?</h3>
              <OptionButton label="Day Trading" sub="Quick profits, high activity" onClick={() => handleSelect('goal', 'DAY_TRADING')} />
              <OptionButton label="Long Term Investing" sub="Building wealth slowly" onClick={() => handleSelect('goal', 'INVESTING')} />
              <OptionButton label="Algorithmic Trading" sub="Building bots & code" onClick={() => handleSelect('goal', 'ALGO')} />
           </div>
        )}

        {step === 2 && (
           <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-6 text-center">What is your risk tolerance?</h3>
              <OptionButton label="Low Risk" sub="Slow & steady wins the race" onClick={() => handleSelect('risk', 'LOW')} />
              <OptionButton label="High Risk (YOLO)" sub="Go big or go home" onClick={() => handleSelect('risk', 'HIGH')} />
           </div>
        )}

        {step === 3 && (
           <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-6 text-center">What is your learning style?</h3>
              <OptionButton 
                label="Visual" 
                sub="I learn by seeing charts, patterns, and diagrams." 
                icon="visibility"
                onClick={() => handleSelect('learningStyle', LearningStyle.VISUAL)} 
              />
              <OptionButton 
                label="Auditory" 
                sub="I learn by listening to explanations and discussions." 
                icon="headphones"
                onClick={() => handleSelect('learningStyle', LearningStyle.AUDITORY)} 
              />
              <OptionButton 
                label="Kinesthetic" 
                sub="I learn by doing, touching, and swiping." 
                icon="touch_app"
                onClick={() => handleSelect('learningStyle', LearningStyle.KINESTHETIC)} 
              />
           </div>
        )}
      </div>
      
      {/* Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-neon-green/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

const OptionButton = ({ label, sub, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full bg-white/5 hover:bg-neon-green/10 border border-white/10 hover:border-neon-green p-5 rounded-2xl text-left transition-all group mb-3 flex items-center gap-4"
  >
    {icon && <span className="material-symbols-rounded text-2xl text-gray-400 group-hover:text-neon-green">{icon}</span>}
    <div>
        <div className="font-bold text-lg text-white group-hover:text-neon-green">{label}</div>
        <div className="text-sm text-gray-500 group-hover:text-gray-300">{sub}</div>
    </div>
  </button>
);

export default Onboarding;
