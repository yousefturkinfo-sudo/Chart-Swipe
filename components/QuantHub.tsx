
import React, { useState, useEffect, useRef } from 'react';
import { AlphaVantageService } from '../services/alphaVantageService';
import { executeQuantCommand } from '../services/geminiService';
import { StockQuote, IntradayData, NewsSentiment, CompanyOverview } from '../types';
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import { SoundService } from '../services/soundService';

const DEFAULT_SYMBOL = 'BTC'; 

const QuantHub: React.FC = () => {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [searchInput, setSearchInput] = useState('');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<IntradayData[]>([]);
  const [news, setNews] = useState<NewsSentiment[]>([]);
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['> OpenQuant Terminal v2.1 (Hybrid Node)...', '> Finnhub/CoinCap Uplink Established.']);
  const [isLoading, setIsLoading] = useState(false);
  const [isCmdLoading, setIsCmdLoading] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
     loadData(symbol);
  }, []);

  useEffect(() => {
     terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    // Close existing connection
    if (wsRef.current) {
        wsRef.current.close();
    }

    const config = AlphaVantageService.getRealtimeConfig(symbol);
    const ws = new WebSocket(config.url);
    wsRef.current = ws;

    ws.onopen = () => {
        if (config.provider === 'finnhub') {
            ws.send(JSON.stringify({ type: 'subscribe', symbol: config.symbol }));
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (config.provider === 'coincap') {
            // CoinCap sends { "bitcoin": "65000.00" }
            const priceStr = Object.values(data)[0] as string;
            if (priceStr) {
                const price = parseFloat(priceStr);
                setQuote(prev => {
                    if (!prev) return null;
                    const change = price - prev.prevClose;
                    const changeP = (change / prev.prevClose) * 100;
                    return {
                        ...prev,
                        price: price,
                        change: change,
                        changePercent: changeP.toFixed(2) + '%'
                    };
                });
            }
        } else if (config.provider === 'finnhub') {
            // Finnhub sends { type: 'trade', data: [{ p: 150.00, ... }] }
            if (data.type === 'trade' && data.data) {
                const trade = data.data[data.data.length - 1];
                const price = trade.p;
                setQuote(prev => {
                    if (!prev) return null;
                    const change = price - prev.prevClose;
                    const changeP = (change / prev.prevClose) * 100;
                    return {
                        ...prev,
                        price: price,
                        change: change,
                        changePercent: changeP.toFixed(2) + '%'
                    };
                });
            }
        }
    };

    return () => {
        if (wsRef.current) wsRef.current.close();
    };
  }, [symbol]);

  const loadData = async (sym: string) => {
      setIsLoading(true);
      setTerminalOutput(prev => [...prev, `> Fetching live data for ${sym}...`]);
      
      try {
          const [q, c, n, o] = await Promise.all([
              AlphaVantageService.fetchQuote(sym),
              AlphaVantageService.fetchIntraday(sym),
              AlphaVantageService.fetchNews(sym),
              AlphaVantageService.fetchOverview(sym)
          ]);

          if (q) setQuote(q);
          if (c && c.length > 0) setChartData(c);
          if (n) setNews(n);
          if (o) setOverview(o);
          
          setTerminalOutput(prev => [...prev, `> ${sym} data stream active.`]);
          
      } catch (e) {
          setTerminalOutput(prev => [...prev, `> WARNING: Connection unstable. Switched to fallback node.`]);
      }

      setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim()) {
          const s = searchInput.toUpperCase();
          setSymbol(s);
          loadData(s);
          setSearchInput('');
      }
  };

  const handleRefresh = () => {
      SoundService.playClick();
      loadData(symbol);
  }

  const handleTerminalCommand = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!terminalInput.trim()) return;

      const cmd = terminalInput;
      setTerminalInput('');
      setTerminalOutput(prev => [...prev, `> ${cmd}`]);
      setIsCmdLoading(true);
      SoundService.playClick();

      if (cmd.startsWith('/clear')) {
          setTerminalOutput(['> Terminal cleared.']);
          setIsCmdLoading(false);
          return;
      }
      
      const context = { quote, overview, recentNews: news.slice(0, 2) };
      const response = await executeQuantCommand(cmd, context);
      
      setTerminalOutput(prev => [...prev, response]);
      setIsCmdLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neon-green font-mono text-xs md:text-sm p-2 pt-20 pb-32 overflow-hidden flex flex-col">
       
       {/* HEADER / TICKER */}
       <div className="flex items-center justify-between border-b border-neon-green/30 pb-2 mb-2 bg-[#0a0a0a]">
           <div className="flex items-center gap-4">
               <h1 className="text-xl font-black bg-neon-green text-black px-2">QUANT//HUB</h1>
               <div className="hidden md:flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                   <span className="text-gray-500 font-bold">LIVE FEED</span>
               </div>
               {isLoading && <span className="text-neon-green animate-pulse">STREAMING...</span>}
           </div>
           <div className="flex gap-4">
                <button 
                    onClick={handleRefresh}
                    className="hidden md:block text-neon-green hover:text-white border border-neon-green/30 px-2 rounded hover:bg-neon-green/10"
                >
                    SYNC
                </button>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <span className="text-neon-green/50">{'>'}</span>
                    <input 
                        type="text" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="SYMBOL"
                        className="bg-transparent border-b border-neon-green/50 text-white focus:outline-none focus:border-neon-green w-24 uppercase placeholder-gray-700"
                    />
                </form>
           </div>
       </div>

       {/* MAIN GRID */}
       <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 overflow-hidden">
           
           {/* LEFT COL: CHART & NEWS (8 Cols) */}
           <div className="md:col-span-8 flex flex-col gap-2 overflow-hidden">
               
               {/* CHART WIDGET */}
               <div className="flex-1 bg-[#0a0a0a] border border-neon-green/20 relative flex flex-col min-h-[350px] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,148,0.05)]">
                   <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur p-2 border border-neon-green/30 rounded-lg pointer-events-none">
                       <div className="text-xl font-black text-white">{quote?.symbol || symbol}</div>
                       <div className="text-3xl font-bold text-neon-green">${quote?.price.toFixed(2) || '---'}</div>
                       <div className={`text-xs font-bold ${quote && parseFloat(quote.changePercent) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                           {quote?.change.toFixed(2)} ({quote?.changePercent})
                       </div>
                   </div>
                   
                   {chartData.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={chartData}>
                               <defs>
                                   <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2}/>
                                       <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <XAxis dataKey="time" hide />
                               <YAxis domain={['auto', 'auto']} hide />
                               <Tooltip 
                                  contentStyle={{ backgroundColor: '#000', borderColor: '#00FF94', color: '#00FF94' }} 
                                  itemStyle={{ color: '#00FF94' }}
                                  cursor={{ stroke: '#00FF94', strokeWidth: 1, strokeDasharray: '4 4' }}
                               />
                               <Area type="monotone" dataKey="close" stroke="#00FF94" strokeWidth={2} fill="url(#chartGradient)" isAnimationActive={false} />
                               <Bar dataKey="volume" fill="#00FF94" opacity={0.1} yAxisId={0} />
                           </ComposedChart>
                       </ResponsiveContainer>
                   ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-2">
                           <span className="material-symbols-rounded text-4xl animate-pulse">satellite_alt</span>
                           <span>ESTABLISHING UPLINK...</span>
                       </div>
                   )}
               </div>

               {/* NEWS WIRE */}
               <div className="h-48 bg-[#0a0a0a] border border-neon-green/20 overflow-y-auto p-3 rounded-xl">
                   <div className="text-neon-green font-bold mb-2 border-b border-neon-green/20 sticky top-0 bg-[#0a0a0a] flex justify-between">
                       <span>>> NEWS WIRE</span>
                       <span className="animate-pulse">●</span>
                   </div>
                   {news.length === 0 ? (
                       <div className="text-gray-700 italic p-4 text-center">Scanning global feeds...</div>
                   ) : (
                       news.map((item, i) => (
                           <div key={i} className="mb-3 border-b border-white/5 pb-2 last:border-0">
                               <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                   <span>{item.source}</span>
                                   <span>{item.time_published}</span>
                               </div>
                               <a href={item.url} target="_blank" rel="noreferrer" className="text-white hover:text-neon-green hover:underline truncate block font-bold">
                                   {item.title}
                               </a>
                           </div>
                       ))
                   )}
               </div>
           </div>

           {/* RIGHT COL: STATS & CLI (4 Cols) */}
           <div className="md:col-span-4 flex flex-col gap-2 overflow-hidden">
               
               {/* KEY STATS */}
               <div className="h-1/3 bg-[#0a0a0a] border border-neon-green/20 p-3 overflow-y-auto rounded-xl">
                   <div className="text-neon-green font-bold mb-2 border-b border-neon-green/20">>> ASSET PROFILE</div>
                   {overview ? (
                       <div className="grid grid-cols-2 gap-3 text-xs">
                           <div className="bg-white/5 p-2 rounded">
                               <div className="text-gray-500 text-[10px]">SECTOR</div>
                               <div className="text-white truncate font-bold">{overview.Sector}</div>
                           </div>
                           <div className="bg-white/5 p-2 rounded">
                               <div className="text-gray-500 text-[10px]">P/E</div>
                               <div className="text-white font-bold">{overview.PERatio}</div>
                           </div>
                           <div className="bg-white/5 p-2 rounded">
                               <div className="text-gray-500 text-[10px]">MARKET CAP</div>
                               <div className="text-white font-bold">
                                   {overview.MarketCapitalization !== 'N/A' 
                                      ? `$${(parseFloat(overview.MarketCapitalization)/1000000).toFixed(1)}M` 
                                      : 'N/A'}
                               </div>
                           </div>
                           <div className="bg-white/5 p-2 rounded">
                               <div className="text-gray-500 text-[10px]">EPS</div>
                               <div className="text-white font-bold">{overview.EPS}</div>
                           </div>
                           <div className="col-span-2 bg-white/5 p-2 rounded">
                               <div className="text-gray-500 text-[10px]">DESCRIPTION</div>
                               <div className="text-gray-300 text-[10px] leading-tight line-clamp-3 mt-1">{overview.Description}</div>
                           </div>
                       </div>
                   ) : (
                       <div className="text-gray-700 italic text-center py-4">Loading profile...</div>
                   )}
               </div>

               {/* OPENQUANT CLI */}
               <div className="flex-1 bg-black border border-neon-green/50 p-3 flex flex-col shadow-[0_0_20px_rgba(0,255,148,0.1)] rounded-xl">
                   <div className="text-black bg-neon-green font-bold mb-2 px-2 rounded-sm text-xs">OpenQuant CLI [v2.1]</div>
                   <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 mb-2 hide-scrollbar">
                       {terminalOutput.map((line, i) => (
                           <div key={i} className="whitespace-pre-wrap break-words text-neon-green/80 leading-snug border-l-2 border-neon-green/20 pl-2">{line}</div>
                       ))}
                       {isCmdLoading && <div className="animate-pulse text-neon-green">_ PROCESSING...</div>}
                       <div ref={terminalEndRef} />
                   </div>
                   <form onSubmit={handleTerminalCommand} className="flex gap-2 border-t border-neon-green/30 pt-2">
                       <span className="text-neon-green font-bold animate-pulse">{'>'}</span>
                       <input 
                         type="text" 
                         value={terminalInput}
                         onChange={(e) => setTerminalInput(e.target.value)}
                         placeholder="CMD (e.g. /scan, /analyze)"
                         className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-800"
                         autoFocus
                       />
                   </form>
               </div>
           </div>
       </div>

    </div>
  );
};

export default QuantHub;
