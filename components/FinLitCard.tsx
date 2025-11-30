
import React, { useState, useEffect, useRef } from 'react';
import { AcademyLesson, LearningStyle, PatternType, ChartSkin } from '../types';
import { explainLessonPattern } from '../services/geminiService';
import LessonChart from './LessonChart';
import { SoundService } from '../services/soundService';

interface FinLitCardProps {
  lesson: AcademyLesson;
  onComplete: (success: boolean) => void;
  learningStyle?: LearningStyle;
  skin?: ChartSkin;
}

const FinLitCard: React.FC<FinLitCardProps> = ({ lesson, onComplete, learningStyle = LearningStyle.VISUAL, skin = 'DEFAULT' }) => {
  const [step, setStep] = useState<'READING' | 'QUIZ' | 'FEEDBACK'>('READING');
  const [result, setResult] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  
  const cardRef = useRef<HTMLDivElement>(null);

  // --- FETCH AI EXPLANATION ON LOAD ---
  useEffect(() => {
    setStep('READING');
    setResult(null);
    setAiExplanation(null);
    setDisplayedText("");
    setIsAnalyzing(true);
    if(cardRef.current) cardRef.current.scrollTop = 0;

    const fetchAI = async () => {
        let text = lesson.content;
        
        if (lesson.chartScenario && lesson.chartScenario.pattern !== PatternType.NONE) {
             try {
                text = await explainLessonPattern(lesson.chartScenario.pattern, lesson.content);
             } catch (e) {
                console.error("AI Explanation Failed, using static");
             }
        }
        
        setAiExplanation(text);
        setIsAnalyzing(false);
        
        let i = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i += 5;
            if (i > text.length) clearInterval(interval);
        }, 10);
        return () => clearInterval(interval);
    };
    
    fetchAI();
  }, [lesson.id, learningStyle]);

  const handleAnswer = (side: 'LEFT' | 'RIGHT') => {
    const isCorrect = side === lesson.correctSide;
    setResult(isCorrect ? 'CORRECT' : 'WRONG');
    setStep('FEEDBACK');
    if (isCorrect) {
        SoundService.playWin();
    } else {
        SoundService.playLoss();
    }
  };

  const handleContinue = () => {
    if (result === 'CORRECT') {
      onComplete(true);
    } else {
      setStep('QUIZ');
      setResult(null);
    }
  };

  return (
    <div ref={cardRef} className="relative w-full max-w-md h-[700px] perspective-1000 overflow-y-auto hide-scrollbar rounded-3xl bg-[#1c2128] border border-white/10 shadow-2xl flex flex-col transition-all duration-500">
      
      {/* HEADER PROGRESS */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-[#1c2128]/95 backdrop-blur-xl p-4 border-b border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-2">
             <span className="material-symbols-rounded text-neon-green text-sm">school</span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MODULE {lesson.orderIndex + 1}</span>
         </div>
         <div className="flex gap-1">
             {[0,1,2].map(i => (
                 <div key={i} className={`w-2 h-2 rounded-full ${step === 'READING' && i === 0 ? 'bg-neon-green' : (step === 'QUIZ' && i <= 1 ? 'bg-neon-green' : (step === 'FEEDBACK' ? 'bg-neon-green' : 'bg-gray-700'))}`} />
             ))}
         </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        
        {/* CHART VISUALIZER (Always visible in Reading/Quiz) */}
        {lesson.chartScenario && (step === 'READING' || step === 'QUIZ') && (
            <div className="mb-6 animate-fade-in-up">
                <LessonChart 
                    candles={lesson.chartScenario.history} 
                    highlightRange={lesson.chartScenario.highlightRange} 
                    patternName={lesson.chartScenario.pattern}
                    annotations={lesson.chartScenario.annotations}
                    skin={skin}
                />
            </div>
        )}

        {/* --- STEP 1: READING (AI ANALYSIS) --- */}
        {step === 'READING' && (
            <div className="flex-1 flex flex-col animate-fade-in-up">
                <h2 className="text-2xl font-black text-white mb-4 leading-tight">{lesson.title}</h2>
                
                <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 mb-6 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent opacity-30 pointer-events-none animate-[scan_3s_linear_infinite]"></div>
                    
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                         <span className="material-symbols-rounded text-neon-green text-xs">auto_awesome</span>
                         <span className="text-[10px] font-bold text-neon-green uppercase tracking-widest font-mono">
                             {isAnalyzing ? 'DECRYPTING...' : 'ORACLE ANALYSIS'}
                         </span>
                    </div>

                    <div className="prose prose-invert prose-sm text-gray-300 leading-relaxed font-mono text-xs md:text-sm min-h-[120px]">
                        <p className="whitespace-pre-line">{displayedText}</p>
                    </div>
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={() => { SoundService.playClick(); setStep('QUIZ'); }}
                        className="w-full py-4 bg-neon-green text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,148,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        START CHALLENGE <span className="material-symbols-rounded">arrow_forward</span>
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP 2: QUIZ --- */}
        {step === 'QUIZ' && (
            <div className="flex-1 flex flex-col animate-pop">
                <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl mb-6">
                    <h3 className="text-lg font-bold text-white leading-snug">
                        {lesson.question}
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-auto">
                    <button 
                        onClick={() => handleAnswer('LEFT')}
                        className="group w-full py-4 bg-[#2d333b] rounded-xl border border-white/5 hover:border-neon-green transition-all flex items-center px-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-gray-400 font-bold mr-4 group-hover:bg-neon-green group-hover:text-black transition-colors">A</div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">{lesson.leftOption}</span>
                    </button>
                    <button 
                        onClick={() => handleAnswer('RIGHT')}
                        className="group w-full py-4 bg-[#2d333b] rounded-xl border border-white/5 hover:border-neon-green transition-all flex items-center px-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-gray-400 font-bold mr-4 group-hover:bg-neon-green group-hover:text-black transition-colors">B</div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">{lesson.rightOption}</span>
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP 3: FEEDBACK --- */}
        {step === 'FEEDBACK' && (
            <div className={`flex-1 flex flex-col items-center justify-center text-center animate-pop`}>
                <div className="mb-6 relative">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 ${result === 'CORRECT' ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                        {result === 'CORRECT' ? '✓' : '✗'}
                    </div>
                    {result === 'CORRECT' && <div className="absolute inset-0 rounded-full animate-ping border-2 border-neon-green"></div>}
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2">{result === 'CORRECT' ? 'SECURED!' : 'LIQUIDATED'}</h2>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">{result === 'CORRECT' ? '+10 XP GAINED' : 'TRY AGAIN'}</p>

                <div className="bg-[#0d1117] p-5 rounded-2xl mb-8 w-full border border-white/10 text-left">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Tactical Debrief</h4>
                    <p className="text-sm text-gray-200 font-medium leading-relaxed">
                        {lesson.feedback}
                    </p>
                </div>

                <button 
                    onClick={handleContinue}
                    className="w-full py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-gray-200 transition-colors"
                >
                    {result === 'CORRECT' ? 'NEXT LESSON' : 'RETRY'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default FinLitCard;
