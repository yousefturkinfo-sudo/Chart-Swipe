
import { GoogleGenAI, Type, Modality, LiveServerMessage, Blob as GenAIBlob } from "@google/genai";
import { PatternType, TradeAction, FinLitLesson, ChartScenario, OnboardingData, AcademyModule } from "../types";
import { KNOWLEDGE_BASE } from "./marketEngine";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Audio Helpers ---
function floatTo16BitPCM(float32Array: Float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}

function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Personalized Path Generator ---
export const generatePersonalizedPath = async (answers: OnboardingData, allModules: AcademyModule[]): Promise<string[]> => {
    if (!apiKey) {
        return allModules.map(m => m.id);
    }

    const moduleList = allModules.map(m => ({ id: m.id, title: m.title, track: m.track }));
    
    const prompt = `
      You are the Headmaster of a Trading Academy.
      Student Profile:
      - Goal: ${answers.goal}
      - Experience: ${answers.experience}
      - Risk Tolerance: ${answers.risk}
      
      Available Modules:
      ${JSON.stringify(moduleList)}
      
      Task: Select the best 5-10 modules for this student and order them logically.
      Return ONLY a JSON array of module IDs strings. Example: ["mod_basics", "mod_quant_1"]
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text || "[]";
        const ids = JSON.parse(text);
        const validIds = ids.filter((id: string) => allModules.find(m => m.id === id));
        if (answers.experience === 'NOVICE' && !validIds.includes('mod_basics')) {
            validIds.unshift('mod_basics');
        }
        return validIds.length > 0 ? validIds : allModules.map(m => m.id);
    } catch (e) {
        console.error("Path Gen Error", e);
        return allModules.map(m => m.id);
    }
};


// --- Oracle Chat Session (Text Bot) ---
export class OracleChatSession {
  private chat: any = null;

  private async initChat() {
    if (!apiKey) return;
    
    this.chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `
          You are 'The Oracle', an elite trading mentor in the 'ChartSwipe' app.
          
          --- YOUR BRAIN (KNOWLEDGE BASE) ---
          Use these definitions strictly:
          ${JSON.stringify(KNOWLEDGE_BASE, null, 2)}
          
          --- ROLE ---
          1. Guide the user to the correct trade (Long/Short) using Socratic questioning.
          2. Explain indicators simply (ELI5).
          3. Be concise, encouraging, and use emojis 🕯️.
          4. If roast mode is triggered, be aggressive and funny.
        `
      }
    });
  }

  public async sendMessage(text: string): Promise<string> {
    if (!apiKey) return "Please configure your API_KEY.";
    if (!this.chat) await this.initChat();
    
    try {
      const result = await this.chat.sendMessage({ message: text });
      return result.text;
    } catch (e) {
      console.error("Chat Error", e);
      return "My connection to the market feed is fuzzy. Try again.";
    }
  }

  public async injectContext(context: any) {
    if (!apiKey) return;
    if (!this.chat) await this.initChat();
    
    let contextMsg = "";
    if (context && 'pattern' in context) {
        contextMsg = `
        [SYSTEM: SCREEN UPDATE]
        Pattern: ${context.pattern}
        Correct Action: ${context.correctAction}
        Indicators: RSI=${context.history?.[context.history.length-1]?.rsi?.toFixed(2)}
      `;
    } else if (context && 'content' in context) {
        contextMsg = `
        [SYSTEM: SCREEN UPDATE]
        Lesson: "${context.title}"
        Content: "${context.content}"
      `;
    } else {
        return;
    }

    try {
       await this.chat.sendMessage({ message: contextMsg });
    } catch (e) {}
  }
}

export const oracleChat = new OracleChatSession();

// --- Live Client (Voice Bot) ---
export class GeminiLiveClient {
    private sessionPromise: Promise<any> | null = null;
    private currentSession: any = null;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private outputNode: AudioNode | null = null;
    private onStateChange: (state: 'IDLE' | 'LISTENING' | 'SPEAKING') => void;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    private scriptProcessor: ScriptProcessorNode | null = null;
    private inputSource: MediaStreamAudioSourceNode | null = null;

    constructor(onStateChange: (state: 'IDLE' | 'LISTENING' | 'SPEAKING') => void) {
        this.onStateChange = onStateChange;
    }

    async connect() {
        if (!apiKey) {
            console.error("No API KEY");
            return;
        }
        
        this.onStateChange('LISTENING');
        
        // Initialize Audio Contexts
        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);

        // Setup Mic Stream
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
            this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            this.scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                if (this.sessionPromise) {
                    this.sessionPromise.then(session => {
                        try {
                            session.sendRealtimeInput({ media: pcmBlob });
                        } catch (err) {
                            // Ignore send errors if session closed
                        }
                    });
                }
            };
            
            this.inputSource.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.inputAudioContext.destination);

            // Connect to Gemini Live
            this.sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log("Live Session Connected");
                        this.onStateChange('LISTENING');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            this.onStateChange('SPEAKING');
                            if (this.outputAudioContext) {
                                this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                                const audioBuffer = await decodeAudioData(
                                    base64ToUint8Array(base64Audio),
                                    this.outputAudioContext,
                                    24000,
                                    1
                                );
                                const source = this.outputAudioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(this.outputNode!);
                                source.addEventListener('ended', () => {
                                    this.sources.delete(source);
                                    if (this.sources.size === 0) {
                                        this.onStateChange('LISTENING');
                                    }
                                });
                                source.start(this.nextStartTime);
                                this.nextStartTime += audioBuffer.duration;
                                this.sources.add(source);
                            }
                        }

                        // Handle Interruption
                        if (message.serverContent?.interrupted) {
                            this.sources.forEach(s => s.stop());
                            this.sources.clear();
                            this.nextStartTime = 0;
                            this.onStateChange('LISTENING');
                        }
                    },
                    onclose: () => {
                        console.log("Live Session Closed");
                        this.onStateChange('IDLE');
                    },
                    onerror: (e) => {
                        console.error("Live Session Error", e);
                        this.onStateChange('IDLE');
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: "You are 'The Oracle', a mystical and wise trading mentor. You speak concisely and use metaphors of the market. Help the user analyze charts."
                }
            });

            this.currentSession = await this.sessionPromise;

        } catch (e) {
            console.error("Failed to connect Live API", e);
            this.onStateChange('IDLE');
        }
    }

    disconnect() {
        if (this.currentSession) {
            try {
                this.currentSession.close();
            } catch (e) {}
        }
        
        this.inputSource?.disconnect();
        this.scriptProcessor?.disconnect();
        this.inputAudioContext?.close();
        
        this.sources.forEach(s => s.stop());
        this.sources.clear();
        this.outputAudioContext?.close();
        
        this.sessionPromise = null;
        this.currentSession = null;
        this.onStateChange('IDLE');
    }

    async sendContext(text: string) {
        if (this.currentSession) {
            try {
                if (typeof (this.currentSession as any).send === 'function') {
                    (this.currentSession as any).send({ parts: [{ text }] });
                }
            } catch (e) {
                console.warn("Could not send text context to Live API", e);
            }
        }
    }
}


// --- Existing Functions ---

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  if (!apiKey) return null;
  
  try {
      // Clean markdown stars for clearer speech
      const cleanText = text.replace(/\*/g, '');
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: { parts: [{ text: cleanText }] },
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              }
          }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      const audioBytes = base64ToUint8Array(base64Audio);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const float32 = new Float32Array(audioBytes.length / 2);
      const view = new DataView(audioBytes.buffer);
      for (let i = 0; i < float32.length; i++) {
           float32[i] = view.getInt16(i * 2, true) / 32768.0;
      }
      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      return buffer;

  } catch (e) {
      console.error("TTS Error", e);
      return null;
  }
}

const FALLBACK_TIPS = [
    "Trend is your friend until it bends.",
    "Buy the fear, sell the greed.",
    "Patience pays more than speed.",
    "Don't catch a falling knife.",
    "Volume confirms the trend."
];

export const getGuruWisdom = async (
  pattern: PatternType,
  userAction: TradeAction,
  isCorrect: boolean,
  priceChangePercent: number
): Promise<string> => {
  if (!apiKey) {
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  }

  const outcome = isCorrect ? "WIN" : "LOSS";
  const prompt = `
    You are an elite trading coach analyzing a recent trade.
    Pattern Detected: ${pattern}. 
    User Action: ${userAction}. 
    Result: ${outcome} (${priceChangePercent.toFixed(2)}%).
    
    Task: 
    1. Identify the specific visual cue on the chart (e.g., "See that long wick?").
    2. Explain why the move happened based on market psychology.
    3. Be encouraging but direct. Keep it under 2 sentences. ELI5.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Keep analyzing the wicks!";
  } catch (error) {
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  }
};

export const explainLessonPattern = async (pattern: PatternType, staticContent: string): Promise<string> => {
    if (!apiKey) return staticContent;

    const prompt = `
        You are 'The Oracle', an AI trading mentor in a cyberpunk future.
        Context: The student is looking at a chart pattern: "${pattern}".
        Standard Textbook Definition: "${staticContent}".
        
        Task: Rewrite this explanation to be more engaging, visceral, and psychology-focused. 
        Explain *why* the price moves this way. Who is trapped? Who is greedy?
        
        Style: 
        - High-stakes, intense, professional but edgy.
        - Use bolding for emphasis (e.g. **Buyers**).
        - Max 2 paragraphs.
        - Do not use H1 or H2 markdown headers.
        - Start with "ANALYSIS:"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || staticContent;
    } catch (e) {
        return staticContent;
    }
};

export const analyzeUploadedChart = async (base64Image: string): Promise<string> => {
  if (!apiKey) return "Please configure your API_KEY.";

  const prompt = `
    Analyze this chart for a beginner trader.
    1. Identify the overall trend (Bullish/Bearish/Neutral).
    2. Spot any key patterns (Flags, Head & Shoulders, etc.).
    3. Give a clear, actionable summary explanation.
    No markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', 
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    return "Could not analyze.";
  }
};

export const roastChart = async (base64Image: string): Promise<string> => {
    if (!apiKey) return "Please configure your API_KEY.";
    
    const prompt = `
      You are a savage WallStreetBets veteran. The user just uploaded this chart of their trade.
      ROAST THEM.
      - Use slang (Paper hands, Diamond hands, Rekt, Exit Liquidity).
      - Point out their terrible entry.
      - Be funny, aggressive, but accurately identifying the technical mistake (e.g. "Buying the top of a wick?").
      - Keep it short and punchy.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview', 
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64Image } },
            { text: prompt }
          ]
        }
      });
      return response.text || "Your trade is so bad I'm speechless.";
    } catch (error) {
      return "AI Roast Machine Broken. You got lucky.";
    }
};

export const generateTradeSetup = async (base64Image: string, intent: 'LONG' | 'SHORT' | 'UNKNOWN'): Promise<string> => {
    if (!apiKey) return "Please configure your API_KEY.";
    
    const prompt = `
        You are a Senior Risk Manager. The user wants to trade ${intent}.
        Look at the chart provided.
        Identify the best technical levels based on Support/Resistance/Liquidity.
        
        Return a Trade Plan:
        - Setup Viability: (High/Medium/Low)
        - Entry Zone: [Price]
        - Stop Loss: [Price] (Explain why e.g. "Below recent low")
        - Take Profit 1: [Price] (Conservative)
        - Take Profit 2: [Price] (Aggressive)
        - Risk to Reward Ratio: X:Y
        
        Keep it concise. No markdown formatting in output.
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview', 
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: base64Image } },
              { text: prompt }
            ]
          }
        });
        return response.text || "Could not generate setup.";
    } catch (error) {
        return "AI Brain Offline. Try again later.";
    }
};

export const generateFinLitLesson = async (levelContext: string = "Beginner"): Promise<FinLitLesson | null> => {
    return null; 
};

// --- QUANT TERMINAL / OPENQUANT SIMULATOR ---
export const executeQuantCommand = async (command: string, contextData: any = null): Promise<string> => {
    if (!apiKey) return "ERROR: API Key Missing";

    const prompt = `
        You are 'OpenQuant', a highly advanced financial terminal CLI.
        The user has entered a command: "${command}".
        
        Context Data (Current Symbol/Market):
        ${JSON.stringify(contextData)}
        
        Instructions:
        1. Act like a professional Quant terminal (Bloomberg/OpenBB).
        2. If the command asks for analysis, use the provided context data to give a technical answer.
        3. If the command is unknown, simulate a funny "Access Denied" or "Syntax Error".
        4. Supported 'fake' commands to simulate:
           - /scan: Show a fake list of high volatility tickers.
           - /backtest: Simulate a backtest result for a moving average strategy on the current symbol.
           - /sentiment: Analyze the provided news context.
           - /predict: Give a probability score for the next 15m candle.
           
        Format output as raw text, using ASCII tables or bullet points where appropriate. 
        Keep it monospaced-friendly.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "COMMAND FAILED";
    } catch (e) {
        return "SYSTEM ERROR: CONNECTION LOST";
    }
};
