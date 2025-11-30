
import React, { useState, useEffect, useRef } from 'react';
import { oracleChat } from '../services/geminiService';
import { AppContext } from '../types';

interface ChatAssistantProps {
  scenario?: AppContext;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ scenario }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "I am The Oracle. The market whispers to me. What do you seek?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastContextIdRef = useRef<string>("");

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Inject context when scenario changes and Chat is OPEN (save tokens)
  useEffect(() => {
    if (scenario && isOpen) {
       const ctxId = JSON.stringify(scenario); // Simple hash
       if (lastContextIdRef.current !== ctxId) {
           lastContextIdRef.current = ctxId;
           oracleChat.injectContext(scenario);
       }
    }
  }, [scenario, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await oracleChat.sendMessage(userMsg);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  return (
    <div className="fixed bottom-32 right-4 z-50 flex flex-col items-end pointer-events-auto">
      
      {/* Chat Window - Grimoire Style */}
      {isOpen && (
        <div className="mb-4 w-80 h-[450px] bg-[#0a0a0a] bg-[url('https://www.transparenttextures.com/patterns/leather.png')] border-[3px] border-[#8B5CF6] rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md shadow-[0_0_40px_rgba(139,92,246,0.3)] flex flex-col overflow-hidden animate-pop origin-bottom-right relative">
          
          {/* Mystic Glows */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent animate-pulse"></div>

          {/* Header */}
          <div className="p-4 border-b border-[#8B5CF6]/30 bg-[#1a1a1a]/80 backdrop-blur flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] material-symbols-rounded text-2xl drop-shadow-[0_0_10px_#8B5CF6]">auto_awesome</span>
              <div>
                  <span className="font-black text-lg tracking-widest text-[#8B5CF6] font-mono">ORACLE</span>
                  <div className="h-0.5 w-full bg-[#8B5CF6]"></div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white material-symbols-rounded">close</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm leading-relaxed font-mono relative border ${
                  msg.role === 'user' 
                    ? 'bg-[#8B5CF6]/20 text-white rounded-2xl rounded-br-none border-[#8B5CF6]/50' 
                    : 'bg-[#111]/80 text-[#a8b3cf] rounded-2xl rounded-bl-none border-white/10'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="text-[#8B5CF6] animate-pulse font-mono text-xs tracking-widest">DIVINING...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-[#0a0a0a] border-t border-[#8B5CF6]/30 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Consult the spirits..."
              className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-sm font-mono text-[#8B5CF6] focus:outline-none focus:border-[#8B5CF6] placeholder-gray-700"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/50 flex items-center justify-center hover:bg-[#8B5CF6]/40 transition-colors"
            >
              <span className="material-symbols-rounded text-lg">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all hover:scale-105 active:scale-95 border-2
          ${isOpen ? 'bg-[#8B5CF6] text-black border-white' : 'bg-black text-[#8B5CF6] border-[#8B5CF6]'}
        `}
      >
        <span className="material-symbols-rounded text-3xl">{isOpen ? 'close' : 'import_contacts'}</span>
      </button>

    </div>
  );
};

export default ChatAssistant;
