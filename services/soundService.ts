
// Simple synthesizer using Web Audio API to avoid external asset dependencies
// This ensures instant playback without network lag

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1, slideTo?: number, delay: number = 0) => {
  if (ctx.state === 'suspended') ctx.resume();
  
  setTimeout(() => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Frequency slide for mechanical sound effects (zips, slides)
    if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
    }
    
    // Volume Envelope (Attack/Decay)
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, delay);
};

export const SoundService = {
  playWin: () => {
    // THE "KA-CHING" SOUND
    // 1. The Cash Drawer Opening (Mechanical Slide)
    playTone(300, 'sawtooth', 0.2, 0.1, 600, 0); 
    
    // 2. The Coin Bell (Ding!) - Harmonic stack
    playTone(1800, 'sine', 0.8, 0.2, undefined, 100); 
    playTone(3600, 'triangle', 0.8, 0.05, undefined, 100);
  },

  playLoss: () => {
    // Dissonant/Failure sound
    playTone(150, 'sawtooth', 0.3, 0.15, 100, 0);
    playTone(130, 'sawtooth', 0.4, 0.15, 80, 150);
  },

  playUnlock: () => {
    // Magical chime for leveling up
    const base = 800;
    playTone(base, 'sine', 0.4, 0.1, undefined, 0);
    playTone(base * 1.25, 'sine', 0.4, 0.1, undefined, 80);
    playTone(base * 1.5, 'sine', 0.4, 0.1, undefined, 160);
    playTone(base * 2, 'sine', 0.8, 0.1, undefined, 240);
  },

  playClick: () => {
    // Crisp UI click - almost percussion
    playTone(600, 'sine', 0.05, 0.05, 300, 0);
  },

  playJackpot: () => {
    // MONEY DEPOSIT / BILL COUNTER SOUND
    // Simulates the rapid "thwip-thwip-thwip" of a money counter + Coin shower
    const count = 15;
    for(let i=0; i<count; i++) {
        // Paper money flip sound
        playTone(800 + (Math.random() * 400), 'square', 0.05, 0.05, 400, i * 60);
        
        // Occasional coin drop
        if (i % 3 === 0) {
             playTone(2000 + (Math.random() * 1000), 'sine', 0.3, 0.05, undefined, i * 60 + 20);
        }
    }
    
    // Final Confirmation Ding
    playTone(1200, 'sine', 1.5, 0.3, undefined, count * 60 + 200);
    playTone(2400, 'triangle', 1.5, 0.1, undefined, count * 60 + 200);
  },
  
  playCoin: () => {
     playTone(2200, 'sine', 0.4, 0.1, undefined, 0);
  }
};
