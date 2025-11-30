import React, { useState, useEffect, useRef } from 'react';
import { GeminiLiveClient } from '../services/geminiService';
import { VoiceState, ChartScenario } from '../types';

interface VoiceAssistantProps {
  scenario?: ChartScenario | null;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ scenario }) => {
  const [state, setState] = useState<VoiceState>(VoiceState.IDLE);
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const lastScenarioIdRef = useRef<string>("");

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  // --- VISUAL CONTEXT INJECTION ---
  // When the scenario changes and the voice is active, we tell the AI what is on the screen.
  useEffect(() => {
    if (scenario && state !== VoiceState.IDLE && clientRef.current) {
      // Create a unique ID for this scenario to prevent spamming
      const scenarioId = `${scenario.pattern}-${scenario.history.length}`;
      
      if (lastScenarioIdRef.current !== scenarioId) {
        console.log("Injecting Visual Context to AI...", scenario.pattern);
        lastScenarioIdRef.current = scenarioId;
        
        // Prepare the Last 20 Candles for Context (JSON)
        const recentHistory = scenario.history.slice(-20).map(c => ({
            o: c.open.toFixed(2),
            h: c.high.toFixed(2),
            l: c.low.toFixed(2),
            c: c.close.toFixed(2),
            rsi: c.rsi?.toFixed(2)
        }));

        // Construct the context payload
        const contextPrompt = `
          [SYSTEM UPDATE: VISUAL CONTEXT]
          The user is looking at a new chart.
          Pattern Detected: ${scenario.pattern}
          Description: ${scenario.patternDescription}
          Market Difficulty: ${scenario.difficulty}
          Correct Move: ${scenario.correctAction}
          
          RAW OHLC DATA (Last 20 Candles):
          ${JSON.stringify(recentHistory)}
          
          Do not give the answer (Long/Short) immediately. 
          If the user asks "What do you see?", describe the visual features of the ${scenario.pattern} based on the OHLC data provided.
        `;
        
        clientRef.current.sendContext(contextPrompt);
      }
    }
  }, [scenario, state]);

  const toggleSession = async () => {
    if (state === VoiceState.IDLE) {
      setState(VoiceState.LISTENING); // Optimistic
      clientRef.current = new GeminiLiveClient((newState) => {
          if (newState === 'LISTENING') setState(VoiceState.LISTENING);
          if (newState === 'SPEAKING') setState(VoiceState.SPEAKING);
          if (newState === 'IDLE') setState(VoiceState.IDLE);
      });
      await clientRef.current.connect();
      
      // If we are already looking at a chart when connecting, inject context immediately
      if (scenario) {
         const recentHistory = scenario.history.slice(-20).map(c => ({
            o: c.open.toFixed(2),
            h: c.high.toFixed(2),
            l: c.low.toFixed(2),
            c: c.close.toFixed(2)
         }));

         const contextPrompt = `
          [SYSTEM UPDATE: VISUAL CONTEXT]
          The user is looking at a new chart.
          Pattern Detected: ${scenario.pattern}
          Description: ${scenario.patternDescription}
          Correct Move: ${scenario.correctAction}
          
          RAW OHLC DATA:
          ${JSON.stringify(recentHistory)}
        `;
        clientRef.current.sendContext(contextPrompt);
      }

    } else {
      clientRef.current?.disconnect();
      setState(VoiceState.IDLE);
    }
  };

  return (
    <div className="z-50">
      {/* Orbiting Particles for active state */}
      {state !== VoiceState.IDLE && (
         <div className="absolute inset-0 animate-spin-slow pointer-events-none">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-neon-green rounded-full shadow-[0_0_10px_#00FF94]" />
         </div>
      )}

      <button
        onClick={toggleSession}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300
          ${state === VoiceState.IDLE ? 'bg-[#161b22] border border-white/20' : ''}
          ${state === VoiceState.LISTENING ? 'bg-neon-green/10 border border-neon-green animate-pulse' : ''}
          ${state === VoiceState.SPEAKING ? 'bg-neon-pink/10 border border-neon-pink animate-[pulse_0.5s_infinite]' : ''}
        `}
      >
        {/* Inner Orb */}
        <div className={`w-10 h-10 rounded-full transition-all duration-500 flex items-center justify-center
           ${state === VoiceState.IDLE ? 'bg-gradient-to-tr from-gray-700 to-gray-900' : ''}
           ${state === VoiceState.LISTENING ? 'bg-gradient-to-tr from-neon-green to-emerald-600 scale-110' : ''}
           ${state === VoiceState.SPEAKING ? 'bg-gradient-to-tr from-neon-pink to-purple-600 scale-125' : ''}
        `}>
           <span className="material-symbols-rounded text-2xl text-white">
             {state === VoiceState.IDLE ? 'mic' : (state === VoiceState.SPEAKING ? 'graphic_eq' : 'hearing')}
           </span>
        </div>
      </button>
      
      {/* Label - Fixed to Left of Button */}
      {state !== VoiceState.IDLE && (
         <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">
            <span className="text-xs font-bold text-white">
              {state === VoiceState.LISTENING ? "I'm listening..." : "The Oracle speaks"}
            </span>
         </div>
      )}
    </div>
  );
};

export default VoiceAssistant;