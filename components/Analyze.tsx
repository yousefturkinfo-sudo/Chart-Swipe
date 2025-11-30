
import React, { useState, useRef } from 'react';
import { analyzeUploadedChart, generateTradeSetup, roastChart } from '../services/geminiService';

const Analyze: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'ANALYZE' | 'SIGNALS' | 'ROAST'>('ANALYZE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        const raw = base64.split(',')[1];
        setBase64Data(raw);
        
        // Auto-trigger depending on mode
        if (mode === 'ANALYZE') runAnalysis(raw);
        if (mode === 'ROAST') runRoast(raw);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (data: string) => {
    setIsLoading(true);
    setAnalysis('');
    const result = await analyzeUploadedChart(data);
    setAnalysis(result);
    setIsLoading(false);
  };

  const runRoast = async (data: string) => {
      setIsLoading(true);
      setAnalysis('');
      const result = await roastChart(data);
      setAnalysis(result);
      setIsLoading(false);
  }

  const handleSignalRequest = async (intent: 'LONG' | 'SHORT') => {
      if (!base64Data) return;
      setIsLoading(true);
      setAnalysis('');
      const result = await generateTradeSetup(base64Data, intent);
      setAnalysis(result);
      setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center px-6 pt-24 pb-32 min-h-screen w-full">
      <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
        THE ORACLE
      </h2>
      
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10 mb-6 overflow-x-auto max-w-full">
          <button 
            onClick={() => { setMode('ANALYZE'); setAnalysis(''); setImage(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mode === 'ANALYZE' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
              Explain
          </button>
          <button 
            onClick={() => { setMode('SIGNALS'); setAnalysis(''); setImage(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mode === 'SIGNALS' ? 'bg-neon-green text-black shadow-[0_0_10px_rgba(0,255,148,0.5)]' : 'text-gray-400'}`}
          >
              Signals
          </button>
          <button 
            onClick={() => { setMode('ROAST'); setAnalysis(''); setImage(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mode === 'ROAST' ? 'bg-neon-pink text-white shadow-[0_0_10px_rgba(255,0,85,0.5)]' : 'text-gray-400'}`}
          >
              Roast Me 🔥
          </button>
      </div>

      <p className="text-gray-400 text-center text-sm mb-6 max-w-xs leading-relaxed">
        {mode === 'ANALYZE' && "Upload a chart. I'll identify the trend, patterns, and indicators."}
        {mode === 'SIGNALS' && "Upload a setup. I'll give you precise Stop Loss & Take Profit levels."}
        {mode === 'ROAST' && "Upload your worst trade. I will destroy your ego."}
      </p>

      <div 
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`w-full max-w-md aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden relative shadow-inner ${isLoading ? 'pointer-events-none' : ''}`}
      >
        {image ? (
          <>
            <img src={image} alt="Upload" className="w-full h-full object-cover opacity-50" />
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                 <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4"></div>
                 <span className="text-neon-green font-bold animate-pulse">PROCESSING...</span>
              </div>
            )}
          </>
        ) : (
          <>
            <span className="material-symbols-rounded text-5xl text-gray-500 mb-2">add_a_photo</span>
            <span className="text-sm font-bold text-gray-500">TAP TO UPLOAD</span>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Signals Action Buttons */}
      {mode === 'SIGNALS' && image && !isLoading && !analysis && (
          <div className="flex gap-4 mt-6 w-full max-w-md animate-fade-in-up">
              <button 
                onClick={() => handleSignalRequest('LONG')}
                className="flex-1 bg-neon-green/10 border border-neon-green text-neon-green font-bold py-3 rounded-xl hover:bg-neon-green/20"
              >
                  I want to LONG 📈
              </button>
              <button 
                onClick={() => handleSignalRequest('SHORT')}
                className="flex-1 bg-red-500/10 border border-red-500 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/20"
              >
                  I want to SHORT 📉
              </button>
          </div>
      )}

      {analysis && (
        <div className={`w-full max-w-md mt-6 border rounded-2xl p-6 animate-fade-in-up shadow-[0_0_20px_rgba(0,255,148,0.1)]
            ${mode === 'ROAST' ? 'bg-red-900/20 border-red-500/50' : 'bg-[#161b22] border-neon-green/30'}
        `}>
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <span className="material-symbols-rounded text-neon-green">auto_awesome</span>
            <h3 className="text-neon-green font-bold tracking-wider text-sm">
                {mode === 'ROAST' ? 'DAMAGE REPORT' : 'INTELLIGENCE REPORT'}
            </h3>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed font-medium whitespace-pre-wrap font-mono">
            {analysis}
          </div>
          
          {/* Social Share Placeholder */}
          {mode === 'ROAST' && (
              <button className="mt-4 w-full py-2 bg-white text-black font-bold rounded-lg text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-rounded text-sm">share</span>
                  SHARE MY SHAME
              </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Analyze;
