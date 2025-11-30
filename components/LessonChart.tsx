
import React, { useState, useRef, useEffect } from 'react';
import { Candle, ChartAnnotation, ChartSkin } from '../types';
import { SoundService } from '../services/soundService';
import { ComposedChart, Line, Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

interface LessonChartProps {
  candles: Candle[];
  highlightRange?: { start: number; end: number };
  patternName?: string;
  annotations?: ChartAnnotation[];
  skin?: ChartSkin;
}

// Reuse Skin Configs for consistency
const SKIN_CONFIGS: Record<ChartSkin, { bg: string; grid: string; up: string; down: string; sma: string; text: string }> = {
    DEFAULT: { bg: 'glass-panel', grid: 'chart-grid', up: '#00FF94', down: '#FF0055', sma: '#3b82f6', text: 'text-white' },
    MATRIX: { bg: 'bg-black border border-green-900', grid: 'bg-[url("https://www.transparenttextures.com/patterns/binary.png")]', up: '#00FF00', down: '#003300', sma: '#00AA00', text: 'text-green-500' },
    VAPORWAVE: { bg: 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 backdrop-blur-xl', grid: 'chart-grid', up: '#00F0FF', down: '#FF00CC', sma: '#FFD700', text: 'text-cyan-200' },
    BLUEPRINT: { bg: 'bg-[#001133] border border-blue-500/50', grid: 'bg-[url("https://www.transparenttextures.com/patterns/graphy.png")]', up: '#FFFFFF', down: '#0055FF', sma: '#00FFFF', text: 'text-blue-100' },
    MIDNIGHT: { bg: 'bg-[#020202] border border-gray-800', grid: '', up: '#4ade80', down: '#60a5fa', sma: '#ffffff', text: 'text-gray-400' },
    CYBERPUNK: { bg: 'bg-[#1a0b2e] border border-yellow-400', grid: 'chart-grid', up: '#FACC15', down: '#EF4444', sma: '#00F0FF', text: 'text-yellow-400' },
};

const LessonChart: React.FC<LessonChartProps> = ({ candles, highlightRange, patternName, annotations, skin = 'DEFAULT' }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showRSI, setShowRSI] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = SKIN_CONFIGS[skin] || SKIN_CONFIGS['DEFAULT'];

  // Entrance Animation
  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
        setVisibleCount(prev => {
            if (prev < candles.length) return prev + 2; 
            clearInterval(interval);
            return prev;
        });
    }, 20);
    return () => clearInterval(interval);
  }, [candles]);

  if (!candles || candles.length === 0) return null;

  // Use full dataset but limit visibility by animation
  const visibleCandles = candles.slice(0, visibleCount);
  
  // Calculate Min/Max based on FULL range to keep chart stable during animation
  const allValues = candles.flatMap(c => [c.low, c.high]);
  const min = Math.min(...allValues) * 0.998;
  const max = Math.max(...allValues) * 1.002;
  const range = max - min;

  // Normalization Helper for SVG overlay
  const normalize = (val: number) => 100 - ((val - min) / range) * 100;

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let clientX = 0;
      if ('touches' in e) clientX = e.touches[0].clientX;
      else clientX = (e as React.MouseEvent).clientX;

      const x = clientX - rect.left;
      const index = Math.floor((x / rect.width) * candles.length);
      
      if (index >= 0 && index < visibleCount) {
          setHoverIndex(index);
      }
  };

  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : null;

  // Chart Data for Recharts (SMA/RSI)
  // We align this with the visualCandles for the SVG loop
  const chartData = visibleCandles.map(d => ({
      ...d,
      color: d.close >= d.open ? theme.up : theme.down
  }));

  // Pattern Highlight Box Logic
  let boxX = 0, boxWidth = 0, boxTop = 0, boxHeight = 0;
  if (highlightRange && visibleCount >= candles.length) {
      const { start, end } = highlightRange;
      let pMax = -Infinity;
      let pMin = Infinity;
      for(let i=start; i<=end; i++) {
          if(candles[i]?.high > pMax) pMax = candles[i].high;
          if(candles[i]?.low < pMin) pMin = candles[i].low;
      }
      const oneBarWidth = 100 / candles.length;
      boxX = start * oneBarWidth;
      boxWidth = (end - start + 1) * oneBarWidth;
      boxTop = normalize(pMax);
      boxHeight = Math.abs(normalize(pMin) - boxTop);
  }

  return (
    <div 
        ref={containerRef}
        className={`w-full min-h-[350px] rounded-[2rem] border border-white/10 relative overflow-hidden cursor-crosshair touch-none select-none group shadow-2xl transition-colors duration-300 ${theme.bg}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchMove={handleMouseMove}
        onTouchEnd={() => setHoverIndex(null)}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neon-green/5 pointer-events-none"></div>

      {/* Grid Pattern */}
      <div className={`absolute inset-0 z-0 opacity-50 ${theme.grid}`}></div>

      {/* TOP HUD (Indicators) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-40 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
             <div className={`px-2 py-1 rounded border border-white/10 bg-black/40 backdrop-blur text-[10px] font-bold tracking-widest ${theme.text}`}>
                 {patternName || 'ACADEMY MODE'}
             </div>
          </div>
          <div className="flex gap-2 pointer-events-auto">
             <button className={`flex items-center gap-1 text-[10px] font-mono hover:text-white transition-colors bg-black/20 px-2 py-0.5 rounded border border-transparent ${theme.text}`}>
                SMA(20)
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); setShowRSI(!showRSI); SoundService.playClick(); }}
                className={`flex items-center gap-1 text-[10px] font-mono transition-colors px-2 py-0.5 rounded border
                    ${showRSI ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-black/20 border-transparent text-gray-500 hover:text-white'}
                `}
            >
                RSI {showRSI ? 'ON' : 'OFF'}
            </button>
          </div>
      </div>

      {/* --- MAIN CHART AREA --- */}
      <div className="absolute inset-0 pt-16 px-4 pb-4 z-10">
        
        {/* RECHARTS LAYER (SMA) */}
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
             {/* SMA Line */}
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

        {/* SVG LAYER (CANDLES + ANNOTATIONS) */}
        <div className="absolute inset-0 pt-16 px-4 pb-4 pointer-events-none">
             <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                
                {/* Pattern Highlight Box */}
                {highlightRange && visibleCount >= candles.length && (
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

                {/* Candles */}
                {chartData.map((d, i) => {
                    if (!d) return null;
                    const yHigh = normalize(d.high);
                    const yLow = normalize(d.low);
                    const yOpen = normalize(d.open);
                    const yClose = normalize(d.close);
                    
                    const yBodyTop = Math.min(yOpen, yClose);
                    const yBodyHeight = Math.max(Math.abs(yOpen - yClose), 0.5);
                    
                    const widthPercent = 100 / candles.length;
                    const x = i * widthPercent;
                    const barW = widthPercent * 0.65; 

                    const color = d.color;
                    const isActive = i === hoverIndex;

                    return (
                        <g key={i} style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}>
                            <line 
                                x1={`${x + widthPercent/2}%`} y1={`${yHigh}%`} 
                                x2={`${x + widthPercent/2}%`} y2={`${yLow}%`} 
                                stroke={color} 
                                strokeWidth={isActive ? 2 : 1.2} 
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

                {/* EDUCATIONAL ANNOTATIONS */}
                {annotations && visibleCount >= candles.length && annotations.map((ann, i) => {
                    const c = candles[ann.index];
                    if (!c) return null;
                    
                    let yPrice = ann.price;
                    if (yPrice === undefined) {
                        // Default positioning logic
                        if (ann.type === 'ARROW_UP') yPrice = c.low - (range * 0.1); 
                        else if (ann.type === 'ARROW_DOWN') yPrice = c.high + (range * 0.1);
                        else yPrice = c.high;
                    }

                    const widthPercent = 100 / candles.length;
                    const cx = (ann.index * widthPercent) + (widthPercent / 2);
                    const cy = normalize(yPrice); 

                    return (
                        <g key={`ann-${i}`} className="animate-pop" style={{ animationDelay: `${i * 0.2}s` }}>
                            {/* Pulsing Target */}
                            <circle cx={`${cx}%`} cy={`${cy}%`} r="3" fill="white" className="animate-ping" opacity="0.5" />
                            <circle cx={`${cx}%`} cy={`${cy}%`} r="2" fill="white" />

                            {/* Arrow UP */}
                            {ann.type === 'ARROW_UP' && (
                                <>
                                    <path d={`M ${cx}% ${cy + 15}% L ${cx}% ${cy + 2}%`} stroke={theme.up} strokeWidth="2" markerEnd="url(#arrowhead)"/>
                                    <rect x={`${cx - 10}%`} y={`${cy + 16}%`} width="20%" height="8%" rx="4" fill="black" stroke={theme.up} strokeWidth="1"/>
                                    <text x={`${cx}%`} y={`${cy + 21}%`} textAnchor="middle" fill={theme.up} fontSize="8" fontWeight="bold" fontFamily="monospace">{ann.text}</text>
                                </>
                            )}

                            {/* Arrow DOWN */}
                            {ann.type === 'ARROW_DOWN' && (
                                <>
                                    <path d={`M ${cx}% ${cy - 15}% L ${cx}% ${cy - 2}%`} stroke={theme.down} strokeWidth="2"/>
                                    <rect x={`${cx - 10}%`} y={`${cy - 24}%`} width="20%" height="8%" rx="4" fill="black" stroke={theme.down} strokeWidth="1"/>
                                    <text x={`${cx}%`} y={`${cy - 19}%`} textAnchor="middle" fill={theme.down} fontSize="8" fontWeight="bold" fontFamily="monospace">{ann.text}</text>
                                </>
                            )}

                            {/* Label */}
                            {ann.type === 'LABEL' && (
                                <g>
                                    <rect x={`${cx + 2}%`} y={`${cy - 4}%`} width="25%" height="8%" rx="4" fill="rgba(0,0,0,0.8)" stroke="white" strokeWidth="0.5"/>
                                    <text x={`${cx + 4}%`} y={`${cy + 1}%`} fill="white" fontSize="8" fontWeight="bold">← {ann.text}</text>
                                </g>
                            )}
                        </g>
                    );
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

      {/* Tooltip */}
      {activeCandle && (
          <div className="absolute top-12 right-4 bg-black/80 backdrop-blur border border-white/20 p-2 rounded text-[10px] font-mono z-30 shadow-xl pointer-events-none">
              <div className="flex justify-between gap-4">
                  <span className="text-gray-400">O:</span> <span className="text-white">{activeCandle.open.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                  <span className="text-gray-400">C:</span> <span className={`${activeCandle.close >= activeCandle.open ? theme.text : 'text-neon-pink'}`}>{activeCandle.close.toFixed(2)}</span>
              </div>
          </div>
      )}

    </div>
  );
};

export default LessonChart;
