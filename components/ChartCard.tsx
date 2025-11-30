
import React, { useEffect, useState } from 'react';
import { ComposedChart, YAxis, ResponsiveContainer, Line, Area, AreaChart, XAxis } from 'recharts';
import { Candle, ChartScenario, TradeAction, PatternType, LearningStyle, ChartSkin } from '../types';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { SoundService } from '../services/soundService';

interface ChartCardProps {
  scenario: ChartScenario;
  showResult: boolean;
  chartRef: React.RefObject<HTMLDivElement | null>;
  onVote?: (direction: TradeAction) => void;
  onTimeout?: () => void;
  learningStyle: LearningStyle;
  skin?: ChartSkin; // New Prop
}

const ASSETS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'TSLA', 'NVDA', 'AAPL', 'SPX', 'NDX', 'EUR/USD', 'XAU/USD'];

// Theme Configs
const SKIN_CONFIGS: Record<ChartSkin, { bg: string; grid: string; up: string; down: string; sma: string; text: string }> = {
    DEFAULT: { bg: 'glass-panel', grid: 'chart-grid', up: '#00FF94', down: '#FF0055', sma: '#3b82f6', text: 'text-white' },
    MATRIX: { bg: 'bg-black border border-green-900', grid: 'bg-[url("https://www.transparenttextures.com/patterns/binary.png")]', up: '#00FF00', down: '#003300', sma: '#00AA00', text: 'text-green-500' },
    VAPORWAVE: { bg: 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 backdrop-blur-xl', grid: 'chart-grid', up: '#00F0FF', down: '#FF00CC', sma: '#FFD700', text: 'text-cyan-200' },
    BLUEPRINT: { bg: 'bg-[#001133] border border-blue-500/50', grid: 'bg-[url("https://www.transparenttextures.com/patterns/graphy.png")]', up: '#FFFFFF', down: '#0055FF', sma: '#00FFFF', text: 'text-blue-100' },
    MIDNIGHT: { bg: 'bg-[#020202] border border-gray-800', grid: '', up: '#4ade80', down: '#60a5fa', sma: '#ffffff', text: 'text-gray-400' },
    CYBERPUNK: { bg: 'bg-[#1a0b2e] border border-yellow-400', grid: 'chart-grid', up: '#FACC15', down: '#EF4444', sma: '#00F0FF', text: 'text-yellow-400' },
};

const ChartCard: React.FC<ChartCardProps> = ({ scenario, showResult, chartRef, onVote, onTimeout, learningStyle, skin = 'DEFAULT' }) => {
  const [data, setData] = useState<Candle[]>([]);
  const controls = useAnimation();
  const [timeLeft, setTimeLeft] = useState(100); 
  const [dragDirection, setDragDirection] = useState<'NONE' | 'LEFT' | 'RIGHT'>('NONE');
  const [showHint, setShowHint] = useState(false);
  const [showRSI, setShowRSI] = useState(false); 
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [currentAsset, setCurrentAsset] = useState(ASSETS[0]);

  const theme = SKIN_CONFIGS[skin] || SKIN_CONFIGS['DEFAULT'];

  useEffect(() => {
      if (!showResult) {
          setCurrentAsset(ASSETS[Math.floor(Math.random() * ASSETS.length)]);
      }
  }, [scenario]);

  // --- DATA REVEAL LOGIC ---
  useEffect(() => {
    if (showResult) {
      let currentFutureIndex = 0;
      const interval = setInterval(() => {
        if (currentFutureIndex < scenario.future.length) {
          setData(prev => [...prev, scenario.future[currentFutureIndex]]);
          currentFutureIndex++;
        } else {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    } else {
      setData(scenario.history);
      setShowHint(false);
      setShowRSI(false);
    }
  }, [scenario, showResult]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (showResult) return;
    
    setTimeLeft(100);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          if (onTimeout && !showResult) onTimeout();
          return 0;
        }
        return prev - 0.5; 
      });
    }, 50);

    return () => clearInterval(timer);
  }, [scenario, showResult]);

  // --- GESTURE LOGIC ---
  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.x > 50) setDragDirection('RIGHT');
    else if (info.offset.x < -50) setDragDirection('LEFT');
    else setDragDirection('NONE');
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: 500, opacity: 0, rotate: 15 });
      if (onVote) onVote(TradeAction.LONG);
      resetCard();
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -500, opacity: 0, rotate: -15 });
      if (onVote) onVote(TradeAction.SHORT);
      resetCard();
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0 });
      setDragDirection('NONE');
    }
  };

  const resetCard = async () => {
    await controls.set({ x: 0, opacity: 0, rotate: 0 });
    await controls.start({ opacity: 1 });
    setDragDirection('NONE');
  };

  const allValues = [...scenario.history, ...scenario.future].flatMap(c => [c.low, c.high]);
  const min = Math.min(...allValues) * 0.998;
  const max = Math.max(...allValues) * 1.002;

  // Render Candles safely
  const chartData = data.map(d => ({
    ...d,
    color: d.close >= d.open ? theme.up : theme.down,
  }));

  const timerColor = timeLeft > 50 ? 'bg-neon-green shadow-[0_0_10px_#00FF94]' : (timeLeft > 20 ? 'bg-yellow-400 shadow-[0_0_10px_#FACC15]' : 'bg-red-500 shadow-[0_0_15px_#EF4444] animate-pulse');

  // Pattern Highlight Box Logic
  const patternLength = 5; 
  const patternIndices = Array.from({ length: patternLength }, (_, i) => scenario.history.length - patternLength + i);
  const oneBarWidth = 100 / chartData.length;
  const boxX = (scenario.history.length - patternLength) * oneBarWidth;
  const boxWidth = patternLength * oneBarWidth;

  // Calculate box vertical bounds
  let pMax = -Infinity;
  let pMin = Infinity;
  scenario.history.slice(-patternLength).forEach(c => {
      if(c.high > pMax) pMax = c.high;
      if(c.low < pMin) pMin = c.low;
  });
  
  const range = max - min;
  const normalize = (val: number) => 100 - ((val - min) / range) * 100;
  
  const boxTop = normalize(pMax);
  const boxHeight = Math.abs(normalize(pMin) - boxTop);

  const isGuided = learningStyle === LearningStyle.VISUAL || learningStyle === LearningStyle.AUDITORY;
  const shouldShowHint = showResult || (showHint && isGuided);

  return (
    <motion.div 
      ref={chartRef}
      drag={!showResult ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={{ cursor: "grabbing", scale: 0.98 }}
      className={`relative flex-1 w-full min-h-[420px] rounded-[2rem] overflow-hidden flex flex-col touch-none select-none transition-all duration-300 mb-28 md:mb-8 ${theme.bg}`}
      style={{
        borderColor: dragDirection === 'RIGHT' ? '#00FF94' : (dragDirection === 'LEFT' ? '#FF0055' : undefined),
        boxShadow: dragDirection === 'RIGHT' ? '0 0 50px rgba(0,255,148,0.2)' : (dragDirection === 'LEFT' ? '0 0 50px rgba(255,0,85,0.2)' : undefined)
      }}
    >
      {!showResult && (
        <div className="absolute top-0 left-0 h-1 z-30 w-full bg-gray-800">
           <div className={`h-full transition-all duration-100 ease-linear ${timerColor}`} style={{ width: `${timeLeft}%` }} />
        </div>
      )}

      {/* Info HUD */}
      <div className="absolute top-6 left-6 z-20 flex flex-col pointer-events-none">
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${theme.text === 'text-green-500' ? 'border-green-500/30' : 'border-orange-500/30 bg-orange-500/20'}`}>
                <span className={`text-lg ${theme.text}`}>{currentAsset.includes('USD') ? '₿' : '$'}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-400 leading-none">ASSET</span>
                <span className={`font-bold tracking-widest text-sm ${theme.text}`}>{currentAsset}</span>
            </div>
        </div>
      </div>
      
      {/* Pattern HUD */}
      {(showResult || (isGuided && !showResult)) && (
        <div className={`absolute top-6 right-6 z-50 animate-fade-in-up ${!showResult && !isGuided ? 'opacity-0' : 'opacity-100'}`}>
          <div className="relative">
            <button
               onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'PATTERN' ? null : 'PATTERN'); }}
               className="bg-neon-green/10 backdrop-blur border border-neon-green/50 px-4 py-1.5 rounded-full shadow hover:bg-neon-green/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neon-green uppercase tracking-widest neon-text">
                  {!showResult && !isGuided ? '???' : scenario.pattern}
                </span>
                <span className="material-symbols-rounded text-neon-green text-xs">info</span>
              </div>
            </button>
            
            {activeTooltip === 'PATTERN' && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-black/90 border border-neon-green/30 p-4 rounded-xl shadow-2xl animate-pop backdrop-blur-xl z-50">
                 <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {scenario.patternDescription}
                 </p>
                 <div className="mt-2 text-[9px] text-gray-500 uppercase tracking-widest">
                    Action: {scenario.correctAction}
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hint Button */}
      {!showResult && isGuided && !showHint && (
         <button 
           onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
           className="absolute top-20 right-2 z-30 bg-white/10 hover:bg-white/20 border border-white/20 w-8 h-16 rounded-full flex flex-col items-center justify-center text-[9px] font-bold text-gray-300 backdrop-blur gap-1"
         >
           <span>💡</span>
           <span className="rotate-90">HINT</span>
         </button>
      )}

      {/* Drag Overlay */}
      {dragDirection !== 'NONE' && !showResult && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center font-black tracking-widest opacity-60 backdrop-blur-[2px] transition-all ${dragDirection === 'RIGHT' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
           <span className={`text-6xl drop-shadow-lg ${dragDirection === 'RIGHT' ? 'text-neon-green' : 'text-neon-pink'}`}>
               {dragDirection === 'RIGHT' ? '🚀' : '📉'}
           </span>
           <span className={`text-2xl mt-4 ${dragDirection === 'RIGHT' ? 'text-neon-green' : 'text-neon-pink'}`}>
               {dragDirection === 'RIGHT' ? 'LONG' : 'SHORT'}
           </span>
        </div>
      )}

      {/* --- MAIN CHART --- */}
      <div className={`absolute top-0 left-0 right-0 bottom-0 pt-20 px-4 pb-4 z-10 ${theme.grid}`}>
        
        {/* Indicators */}
        <div className="absolute top-16 left-4 right-4 flex gap-4 z-40 pointer-events-auto">
            <button className={`flex items-center gap-1 text-[10px] font-mono hover:text-white transition-colors bg-black/20 px-2 py-0.5 rounded ${theme.text}`}>
                SMA(20)
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setShowRSI(!showRSI); SoundService.playClick(); }}
                className={`flex items-center gap-1 text-[10px] font-mono transition-colors px-2 py-0.5 rounded border
                    ${showRSI ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-black/20 border-transparent text-gray-500 hover:text-white'}
                `}
            >
                RSI (14) {showRSI ? 'ON' : 'OFF'}
            </button>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
             <YAxis domain={[min, max]} hide />
             <defs>
                <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
             </defs>
             <Line 
                type="monotone" 
                dataKey="sma20" 
                stroke={theme.sma} 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false} 
                style={{ filter: 'url(#glow)' }}
             />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Custom Candle Drawing */}
        <div className="absolute inset-0 pt-20 px-4 pb-4 pointer-events-none">
             <svg width="100%" height="100%" preserveAspectRatio="none">
                {shouldShowHint && (
                  <rect 
                    x={`${boxX}%`} 
                    y={`${boxTop}%`} 
                    width={`${boxWidth}%`} 
                    height={`${boxHeight}%`} 
                    fill="none" 
                    stroke={theme.up} 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    className="animate-pulse"
                    rx="4"
                  />
                )}
                {chartData.map((d, i) => {
                    const yHigh = normalize(d.high);
                    const yLow = normalize(d.low);
                    const yOpen = normalize(d.open);
                    const yClose = normalize(d.close);
                    
                    const yBodyTop = Math.min(yOpen, yClose);
                    const yBodyHeight = Math.max(Math.abs(yOpen - yClose), 0.5);
                    
                    const widthPercent = 100 / chartData.length;
                    const x = i * widthPercent;
                    const barW = widthPercent * 0.6; 

                    const color = d.color;
                    const shadowColor = d.close >= d.open ? theme.up : theme.down;

                    if (!d) return null;

                    return (
                        <g key={i} style={{ filter: `drop-shadow(0 0 4px ${shadowColor}80)` }}>
                            <line 
                                x1={`${x + widthPercent/2}%`} 
                                y1={`${yHigh}%`} 
                                x2={`${x + widthPercent/2}%`} 
                                y2={`${yLow}%`} 
                                stroke={color} 
                                strokeWidth="1.5" 
                                strokeLinecap="round"
                            />
                            <rect 
                                x={`${x + (widthPercent - barW)/2}%`} 
                                y={`${yBodyTop}%`} 
                                width={`${barW}%`} 
                                height={`${yBodyHeight}%`} 
                                fill={color}
                                rx="1"
                            />
                        </g>
                    )
                })}
             </svg>
        </div>
      </div>

      {/* RSI Overlay */}
      {showRSI && (
          <div className="absolute bottom-4 left-4 right-4 h-[30%] border border-purple-500/30 bg-black/90 backdrop-blur-xl z-50 rounded-2xl p-2 animate-fade-in-up shadow-2xl">
             <div className="absolute -top-3 left-2 bg-purple-500 text-[9px] text-white font-bold px-2 py-0.5 rounded">
                RELATIVE STRENGTH INDEX
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <YAxis domain={[0, 100]} hide />
                    <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Area type="monotone" dataKey="rsi" stroke="none" fill="url(#rsiGradient)" isAnimationActive={false} />
                    <Line dataKey={() => 70} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" strokeWidth={1} isAnimationActive={false} />
                    <Line dataKey={() => 30} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" strokeWidth={1} isAnimationActive={false} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
      )}

      {showResult && (
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent opacity-0 animate-[pulse_1.5s_ease-in-out_1] pointer-events-none" />
      )}
      
      {!showResult && (
         <div className="absolute bottom-4 left-4 right-4 flex gap-4 z-30">
            <button 
                onClick={() => onVote && onVote(TradeAction.SHORT)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl backdrop-blur-sm transition-all active:scale-95 text-xl"
            >
                SHORT 🐻
            </button>
            <button 
                onClick={() => onVote && onVote(TradeAction.LONG)}
                className="flex-1 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green font-bold py-3 rounded-xl backdrop-blur-sm transition-all active:scale-95 text-xl"
            >
                LONG 🐂
            </button>
         </div>
      )}

    </motion.div>
  );
};

export default ChartCard;
