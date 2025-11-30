
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-scroll between Swipe Mode (0) and Quant Mode (1)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev === 0 ? 1 : 0));
    }, 6000); // Switch every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden relative">
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[120px] animate-blob"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-neon-green text-3xl">candlestick_chart</span>
            <span className="text-xl font-black italic tracking-tighter">CHART<span className="text-neon-green">//</span>SWIPE</span>
        </div>
        <div className="flex gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">LOGIN</button>
            <button onClick={onGetStarted} className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-bold transition-all">
                GET APP
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-bold tracking-widest mb-6 uppercase">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                v2.5: QUANT TERMINAL ONLINE
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-blue-400">DUOLINGO</span> FOR <br/>
                DAY TRADING.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Gamified technical analysis. Real-time Bloomberg-style terminal. <br className="hidden md:block" />
                Master <strong>Smart Money Concepts</strong> without risking a single dollar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                    onClick={onGetStarted}
                    className="px-8 py-4 bg-neon-green text-black font-black text-lg rounded-full shadow-[0_0_30px_rgba(0,255,148,0.4)] hover:scale-105 transition-transform flex items-center gap-2"
                >
                    START TRADING FREE
                    <span className="material-symbols-rounded">arrow_forward</span>
                </button>
                <button 
                    onClick={onLogin}
                    className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg rounded-full backdrop-blur-md transition-all"
                >
                    EXISTING USER
                </button>
            </div>
        </motion.div>

        {/* Dynamic Hero Mockup (Switches between Trade & Quant) */}
        <div className="mt-20 relative w-full max-w-sm aspect-[3/5] bg-[#050505] rounded-[3rem] border-8 border-[#2d333b] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* Top Notch UI */}
            <div className="absolute top-0 left-0 right-0 h-14 z-20 flex justify-between items-center px-6 opacity-50">
               <div className="text-[10px] font-bold">9:41</div>
               <div className="w-16 h-5 bg-black rounded-b-xl"></div>
               <div className="flex gap-1">
                   <div className="w-3 h-3 rounded-full bg-white"></div>
                   <div className="w-3 h-3 rounded-full bg-white"></div>
               </div>
            </div>

            {/* SCREEN CONTENT */}
            <div className="absolute inset-0 pt-14 pb-8 px-4">
                <AnimatePresence mode="wait">
                    
                    {/* SLIDE 1: SWIPE CHART (Default) */}
                    {activeSlide === 0 && (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex flex-col"
                        >
                            <div className="flex-1 bg-gradient-to-b from-gray-800/30 to-transparent rounded-2xl border border-white/5 mb-6 relative overflow-hidden">
                                <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0,50 Q25,20 50,50 T100,80" fill="none" stroke="#00FF94" strokeWidth="2" className="drop-shadow-[0_0_10px_#00FF94]" />
                                </svg>
                                {/* Hand Animation */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <motion.div 
                                        animate={{ x: [0, 60, 0], opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="text-6xl"
                                    >
                                        👆
                                    </motion.div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 h-14 rounded-xl border border-neon-pink/30 bg-neon-pink/10 flex items-center justify-center text-neon-pink font-bold">SHORT</div>
                                <div className="flex-1 h-14 rounded-xl border border-neon-green/30 bg-neon-green/10 flex items-center justify-center text-neon-green font-bold">LONG</div>
                            </div>
                        </motion.div>
                    )}

                    {/* SLIDE 2: QUANT TERMINAL (AI Powered) */}
                    {activeSlide === 1 && (
                        <motion.div
                            key="quant"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex flex-col bg-black rounded-2xl border border-neon-green/30 p-4 font-mono text-xs overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,255,148,0.1)]"
                        >
                            <div className="flex items-center justify-between mb-4 border-b border-neon-green/20 pb-2">
                                <span className="bg-neon-green text-black px-1 font-bold">QUANT//HUB</span>
                                <span className="text-neon-green animate-pulse">● LIVE</span>
                            </div>
                            
                            <div className="flex-1 space-y-2 text-neon-green/80">
                                <div>> Connecting to Neural Net... OK</div>
                                <div>> Ticker: BTC/USD</div>
                                
                                {/* Simulated Typing Animation */}
                                <div className="flex items-center gap-1">
                                    <span>></span>
                                    <motion.span
                                        initial={{ width: 0 }}
                                        animate={{ width: "auto" }}
                                        transition={{ duration: 1, ease: "steps(8)" }}
                                        className="overflow-hidden whitespace-nowrap border-r-2 border-neon-green pr-1"
                                    >
                                        /analyze
                                    </motion.span>
                                </div>

                                {/* Simulated AI Response (Delayed) */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="border border-neon-green/30 p-2 mt-2 bg-neon-green/5"
                                >
                                    <div className="font-bold text-white mb-1">AI ANALYSIS:</div>
                                    <div className="text-[10px]">TREND: <span className="text-neon-green">BULLISH</span></div>
                                    <div className="text-[10px]">RSI: 45 (Neutral)</div>
                                    <div className="text-[10px]">VOL: High</div>
                                    <div className="mt-2 text-[10px] text-gray-400">"Price holding key support at 64k. Look for liquidity sweep."</div>
                                </motion.div>
                            </div>

                            <div className="mt-auto pt-2 border-t border-neon-green/20 flex gap-2">
                                <span className="text-neon-green">></span>
                                <span className="animate-pulse">_</span>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 0 ? 'bg-neon-green' : 'bg-gray-700'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 1 ? 'bg-neon-green' : 'bg-gray-700'}`}></div>
            </div>

        </div>
      </section>

      {/* Ticker Tape */}
      <div className="w-full bg-[#00FF94] text-black font-mono font-bold py-2 overflow-hidden whitespace-nowrap -rotate-1 relative z-20">
         <motion.div 
           animate={{ x: "-50%" }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="inline-block"
         >
             BTC/USD +5.2% • ETH/USD -1.2% • SOL/USD +12% • NEW QUANT TERMINAL ONLINE • HYBRID DATA FEEDS ACTIVE • EARN SKINS • UNLOCK MATRIX MODE •
             BTC/USD +5.2% • ETH/USD -1.2% • SOL/USD +12% • NEW QUANT TERMINAL ONLINE • HYBRID DATA FEEDS ACTIVE • EARN SKINS • UNLOCK MATRIX MODE •
         </motion.div>
      </div>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">A FULL TRADING ECOSYSTEM</h2>
            <p className="text-gray-400">Everything you need to go from Novice to Quant.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
                icon="swipe"
                title="Swipe to Trade"
                desc="Left for Short. Right for Long. Test your instincts on thousands of historical chart scenarios."
                color="text-neon-green"
            />
            <FeatureCard 
                icon="terminal"
                title="Quant Hub"
                desc="Real-time Financial Terminal. Live Stocks & Crypto data, news feeds, and CLI analysis tools."
                color="text-amber-500"
            />
            <FeatureCard 
                icon="graphic_eq"
                title="Voice Mode"
                desc="Talk to the charts. Hands-free AI analysis and coaching while you trade."
                color="text-blue-400"
            />
            <FeatureCard 
                icon="psychology"
                title="The Oracle"
                desc="Powered by Gemini 2.5. Get real-time feedback, trade setups, and savage roasts."
                color="text-purple-400"
            />
             <FeatureCard 
                icon="shopping_bag"
                title="Skin Store"
                desc="Earn 'Candles' by winning trades. Buy exclusive chart themes like Matrix, Vaporwave, and Blueprint."
                color="text-pink-500"
            />
            <FeatureCard 
                icon="menu_book"
                title="The Grimoire"
                desc="Unlock 50+ patterns including Smart Money Concepts, Harmonics, and Algo strategies."
                color="text-cyan-400"
            />
         </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 px-6 relative border-t border-white/5 bg-[#0a0a0a]">
         <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">STRUCTURED MASTERY</h2>
            <p className="text-gray-400">From total novice to quantitative analyst.</p>
         </div>

         <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
             <TrackCard 
                title="The Trader" 
                subtitle="Patterns & Price Action" 
                level="Beginner" 
                color="from-blue-600 to-cyan-500" 
                features={["Candlestick Basics", "Support & Resistance", "Classic Reversals"]}
             />
             <TrackCard 
                title="The Strategist" 
                subtitle="Smart Money Concepts" 
                level="Advanced" 
                color="from-purple-600 to-indigo-500" 
                features={["Liquidity Sweeps", "Order Blocks", "Market Structure"]}
             />
             <TrackCard 
                title="The Quant" 
                subtitle="Data & Algorithms" 
                level="Pro" 
                color="from-pink-600 to-rose-500" 
                features={["RSI Divergence", "Standard Deviation", "Volume Profile"]}
             />
         </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-neon-green/10 to-transparent pointer-events-none"></div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">
              READY TO GET <span className="line-through decoration-neon-pink decoration-4 text-gray-500">REKT</span><br/>
              <span className="text-neon-green">GOOD?</span>
          </h2>
          <button 
              onClick={onGetStarted}
              className="px-12 py-5 bg-white text-black font-black text-xl rounded-full hover:bg-neon-green transition-colors relative z-10"
          >
              JOIN THE ACADEMY
          </button>
          <p className="mt-8 text-xs text-gray-600 font-mono">
              © 2024 ChartSwipe. Not financial advice. It's a game. <br/>
              Don't blame us if you lose your lunch money.
          </p>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: any) => (
    <div className="p-8 rounded-3xl bg-[#161b22] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-2 group">
        <span className={`material-symbols-rounded text-5xl mb-6 ${color} group-hover:scale-110 transition-transform block`}>{icon}</span>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

const TrackCard = ({ title, subtitle, level, color, features }: any) => (
    <div className="flex-1 rounded-3xl overflow-hidden bg-[#161b22] border border-white/5 group hover:border-white/20 transition-all">
        <div className={`h-2 w-full bg-gradient-to-r ${color}`}></div>
        <div className="p-8">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{level}</div>
            <h3 className="text-2xl font-black mb-1">{title}</h3>
            <p className="text-sm text-gray-400 mb-6">{subtitle}</p>
            
            <ul className="space-y-3">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="material-symbols-rounded text-neon-green text-sm">check_circle</span>
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

export default LandingPage;
