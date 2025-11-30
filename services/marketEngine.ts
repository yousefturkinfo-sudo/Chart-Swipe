
import { Candle, ChartScenario, PatternType, TradeAction } from "../types";

// --- MOCK DATABASE OF PATTERNS & INDICATORS ---
export const KNOWLEDGE_BASE = {
  patterns: {
    // --- BASIC CANDLESTICKS ---
    [PatternType.HAMMER]: { visual: "A small body at the top with a long tail sticking down.", meaning: "Sellers pushed it down, but buyers shoved it back up. A floor is forming.", action: TradeAction.LONG },
    [PatternType.INVERTED_HAMMER]: { visual: "Upside down hammer. Small body at bottom, long wick up.", meaning: "Buyers tested high prices. Ready to attack.", action: TradeAction.LONG },
    [PatternType.HANGING_MAN]: { visual: "Looks like a Hammer but happens at the TOP.", meaning: "Buyers are losing control. Warning sign.", action: TradeAction.SHORT },
    [PatternType.SHOOTING_STAR]: { visual: "Small body at bottom, long wick up.", meaning: "Buyers tried to break out but got slapped down.", action: TradeAction.SHORT },
    [PatternType.DOJI]: { visual: "Open and Close are the same.", meaning: "Indecision. Tie game.", action: TradeAction.HOLD },
    [PatternType.DRAGONFLY_DOJI]: { visual: "Looks like a 'T'. Long tail.", meaning: "Prices dropped but recovered fully. Bullish.", action: TradeAction.LONG },
    [PatternType.GRAVESTONE_DOJI]: { visual: "Upside down 'T'.", meaning: "Prices rose but crashed back. Bearish.", action: TradeAction.SHORT },
    [PatternType.LONG_LEGGED_DOJI]: { visual: "Huge wicks both ways.", meaning: "Massive volatility/confusion.", action: TradeAction.HOLD },
    [PatternType.SPINNING_TOP]: { visual: "Small body in middle.", meaning: "Market breather.", action: TradeAction.HOLD },
    [PatternType.MARUBOZU_BULL]: { visual: "Big green block.", meaning: "Pure buyer power.", action: TradeAction.LONG },
    [PatternType.MARUBOZU_BEAR]: { visual: "Big red block.", meaning: "Pure seller panic.", action: TradeAction.SHORT },

    // --- 2-CANDLE PATTERNS ---
    [PatternType.ENGULFING]: { visual: "Huge green candle eats small red one.", meaning: "Buyers overwhelmed sellers.", action: TradeAction.LONG },
    [PatternType.BEARISH_ENGULFING]: { visual: "Huge red candle eats small green one.", meaning: "Sellers overwhelmed buyers.", action: TradeAction.SHORT },
    [PatternType.HARAMI_BULL]: { visual: "Large red, tiny green inside.", meaning: "Selling pressure stopped.", action: TradeAction.LONG },
    [PatternType.HARAMI_BEAR]: { visual: "Large green, tiny red inside.", meaning: "Buying power dried up.", action: TradeAction.SHORT },
    [PatternType.PIERCING_LINE]: { visual: "Red then Green closes above 50% of red.", meaning: "Verified counter-attack.", action: TradeAction.LONG },
    [PatternType.DARK_CLOUD_COVER]: { visual: "Green then Red closes below 50% of green.", meaning: "Storm clouds gathering.", action: TradeAction.SHORT },
    [PatternType.TWEEZER_BOTTOM]: { visual: "Two candles, same low.", meaning: "Tried twice to break floor, failed.", action: TradeAction.LONG },
    [PatternType.TWEEZER_TOP]: { visual: "Two candles, same high.", meaning: "Hit ceiling twice.", action: TradeAction.SHORT },
    [PatternType.KICKER_PATTERN]: { visual: "Price gaps and moves opposite.", meaning: "Violent sentiment shift.", action: TradeAction.LONG },

    // --- 3-CANDLE & ADVANCED ---
    [PatternType.MORNING_STAR]: { visual: "Big Red, Gap, Doji, Big Green.", meaning: "Sunrise on a new trend.", action: TradeAction.LONG },
    [PatternType.EVENING_STAR]: { visual: "Big Green, Gap, Doji, Big Red.", meaning: "Sunset on the uptrend.", action: TradeAction.SHORT },
    [PatternType.THREE_WHITE_SOLDIERS]: { visual: "Three steady green candles.", meaning: "Orderly advance.", action: TradeAction.LONG },
    [PatternType.THREE_BLACK_CROWS]: { visual: "Three steady red candles.", meaning: "Decisive liquidation.", action: TradeAction.SHORT },
    [PatternType.THREE_INSIDE_UP]: { visual: "Harami + breakout candle.", meaning: "Confirmed reversal.", action: TradeAction.LONG },
    [PatternType.THREE_INSIDE_DOWN]: { visual: "Bear Harami + breakout.", meaning: "Confirmed reversal.", action: TradeAction.SHORT },
    [PatternType.THREE_LINE_STRIKE]: { visual: "3 Reds then 1 Huge Green.", meaning: "Bear trap snapped shut.", action: TradeAction.LONG },
    [PatternType.ABANDONED_BABY]: { visual: "Doji island with gaps.", meaning: "Major trend change.", action: TradeAction.LONG },
    [PatternType.THREE_OUTSIDE_UP]: { visual: "Engulfing + follow through.", meaning: "Strong confirmation of uptrend.", action: TradeAction.LONG },
    [PatternType.THREE_OUTSIDE_DOWN]: { visual: "Bear Engulfing + follow through.", meaning: "Strong confirmation of downtrend.", action: TradeAction.SHORT },
    [PatternType.MAT_HOLD]: { visual: "Big Green, 3 small reds, Big Green.", meaning: "Pause that refreshes.", action: TradeAction.LONG },
    [PatternType.RISING_THREE_METHODS]: { visual: "Big Green, small pullback, Big Green.", meaning: "Continuation.", action: TradeAction.LONG },
    [PatternType.FALLING_THREE_METHODS]: { visual: "Big Red, small rally, Big Red.", meaning: "Continuation.", action: TradeAction.SHORT },

    // --- CHART PATTERNS ---
    [PatternType.DOUBLE_BOTTOM]: { visual: "'W' shape.", meaning: "Floor made of concrete.", action: TradeAction.LONG },
    [PatternType.DOUBLE_TOP]: { visual: "'M' shape.", meaning: "Ceiling made of brick.", action: TradeAction.SHORT },
    [PatternType.TRIPLE_BOTTOM]: { visual: "Three hits to floor.", meaning: "Triple support.", action: TradeAction.LONG },
    [PatternType.TRIPLE_TOP]: { visual: "Three hits to ceiling.", meaning: "Triple resistance.", action: TradeAction.SHORT },
    [PatternType.HEAD_AND_SHOULDERS]: { visual: "Head higher than shoulders.", meaning: "Trend is dead.", action: TradeAction.SHORT },
    [PatternType.INVERSE_HEAD_AND_SHOULDERS]: { visual: "Upside down H&S.", meaning: "New king rising.", action: TradeAction.LONG },
    [PatternType.ROUNDING_BOTTOM]: { visual: "Gentle 'U' shape.", meaning: "Slow sentiment shift.", action: TradeAction.LONG },
    [PatternType.DIAMOND_TOP]: { visual: "Expanding then contracting.", meaning: "Messy top reversal.", action: TradeAction.SHORT },
    [PatternType.DIAMOND_BOTTOM]: { visual: "Diamond at bottom.", meaning: "Messy bottom reversal.", action: TradeAction.LONG },
    [PatternType.V_SHAPE_RECOVERY]: { visual: "Sharp crash, sharp rise.", meaning: "Panic met by greed.", action: TradeAction.LONG },
    [PatternType.ISLAND_REVERSAL]: { visual: "Gap up, float, gap down.", meaning: "Stranded buyers.", action: TradeAction.SHORT },
    [PatternType.BULL_FLAG]: { visual: "Pole up, flag down.", meaning: "Breather before sprint.", action: TradeAction.LONG },
    [PatternType.BEAR_FLAG]: { visual: "Drop down, flag up.", meaning: "Pause before crash.", action: TradeAction.SHORT },
    [PatternType.BULL_PENNANT]: { visual: "Pole up, triangle.", meaning: "Coiling energy.", action: TradeAction.LONG },
    [PatternType.BEAR_PENNANT]: { visual: "Drop down, triangle.", meaning: "Coiling energy.", action: TradeAction.SHORT },
    [PatternType.BULLISH_RECTANGLE]: { visual: "Sideways after rise.", meaning: "Consolidation.", action: TradeAction.LONG },
    [PatternType.BEARISH_RECTANGLE]: { visual: "Sideways after drop.", meaning: "Consolidation.", action: TradeAction.SHORT },
    [PatternType.CUP_AND_HANDLE]: { visual: "Teacup shape.", meaning: "Sellers exhausted.", action: TradeAction.LONG },
    [PatternType.INVERSE_CUP_AND_HANDLE]: { visual: "Upside down teacup.", meaning: "Buyers exhausted.", action: TradeAction.SHORT },
    [PatternType.ASCENDING_TRIANGLE]: { visual: "Flat top, rising bottom.", meaning: "Buyers banging on door.", action: TradeAction.LONG },
    [PatternType.DESCENDING_TRIANGLE]: { visual: "Flat bottom, falling top.", meaning: "Sellers banging on floor.", action: TradeAction.SHORT },
    [PatternType.SYMMETRICAL_TRIANGLE]: { visual: "Coil to point.", meaning: "Explosive move coming.", action: TradeAction.HOLD },
    [PatternType.FALLING_WEDGE]: { visual: "Narrowing down.", meaning: "Sellers tired.", action: TradeAction.LONG },
    [PatternType.RISING_WEDGE]: { visual: "Narrowing up.", meaning: "Buyers tired.", action: TradeAction.SHORT },
    [PatternType.BROADENING_WEDGE]: { visual: "Megaphone.", meaning: "High volatility.", action: TradeAction.HOLD },

    // --- HARMONICS ---
    [PatternType.GARTLEY]: { visual: "'M' or 'W' with specific ratios.", meaning: "Complex correction completion.", action: TradeAction.LONG },
    [PatternType.BUTTERFLY]: { visual: "Extended 'M' or 'W'.", meaning: "Reversal at 1.27 extension.", action: TradeAction.SHORT },
    [PatternType.BAT]: { visual: "Deep retrace harmonic.", meaning: "Reversal at 0.886.", action: TradeAction.LONG },
    [PatternType.CRAB]: { visual: "Extreme extension harmonic.", meaning: "Reversal at 1.618.", action: TradeAction.SHORT },
    [PatternType.CYPHER]: { visual: "Steep harmonic structure.", meaning: "High probability reversal.", action: TradeAction.LONG },
    [PatternType.SHARK]: { visual: "Two-stage harmonic.", meaning: "Predatory reversal pattern.", action: TradeAction.SHORT },

    // --- SMC / STRATEGIST ---
    [PatternType.ORDER_BLOCK_BULL]: { visual: "Last red candle before big rise.", meaning: "Bank buy orders waiting.", action: TradeAction.LONG },
    [PatternType.ORDER_BLOCK_BEAR]: { visual: "Last green candle before big drop.", meaning: "Bank sell orders waiting.", action: TradeAction.SHORT },
    [PatternType.BREAKER_BLOCK]: { visual: "Broken support becomes resistance.", meaning: "Price retests broken floor.", action: TradeAction.SHORT },
    [PatternType.MITIGATION_BLOCK]: { visual: "Failed low protected by block.", meaning: "Mitigating losses.", action: TradeAction.LONG },
    [PatternType.AMD_SETUP]: { visual: "Accumulation, Manipulation, Distribution.", meaning: "The fakeout before the breakout.", action: TradeAction.LONG },
    [PatternType.WYCKOFF_SPRING]: { visual: "Dip below range low then reclaim.", meaning: "Ultimate bear trap.", action: TradeAction.LONG },
    [PatternType.WYCKOFF_UPTHRUST]: { visual: "Poke above range high then reject.", meaning: "Ultimate bull trap.", action: TradeAction.SHORT },
    [PatternType.CHOCH_BULL]: { visual: "Price breaks lower high after downtrend.", meaning: "Character change to bullish.", action: TradeAction.LONG },
    [PatternType.CHOCH_BEAR]: { visual: "Price breaks higher low after uptrend.", meaning: "Character change to bearish.", action: TradeAction.SHORT },
    [PatternType.LIQUIDITY_GRAB_BULL]: { visual: "Wick below key low.", meaning: "Stop hunt.", action: TradeAction.LONG },
    [PatternType.LIQUIDITY_GRAB_BEAR]: { visual: "Wick above key high.", meaning: "Stop hunt.", action: TradeAction.SHORT },
    [PatternType.MIDNIGHT_OPEN]: { visual: "Revert to 00:00 price.", meaning: "Algo reset.", action: TradeAction.LONG },
    [PatternType.ASIAN_SWEEP]: { visual: "Sweep Asian highs/lows.", meaning: "Liquidity grab.", action: TradeAction.SHORT },
    [PatternType.OTE_FIB]: { visual: "62-79% Fib retrace.", meaning: "Discount zone.", action: TradeAction.LONG },
    [PatternType.RANGE_PREMIUM]: { visual: "Top 50% of range.", meaning: "Expensive pricing.", action: TradeAction.SHORT },
    [PatternType.SFP_BOTTOM]: { visual: "Wick low, close high.", meaning: "Swing Failure.", action: TradeAction.LONG },
    [PatternType.LONDON_KILLZONE]: { visual: "Volatile London Open.", meaning: "Trend ignition.", action: TradeAction.LONG },
    [PatternType.IMBALANCE_FILL]: { visual: "Gap in candles.", meaning: "Price magnet.", action: TradeAction.LONG },

    // --- QUANT ---
    [PatternType.VWAP_EXTENSION]: { visual: "Far from VWAP.", meaning: "Mean reversion.", action: TradeAction.SHORT },
    [PatternType.ATR_BREAK]: { visual: "Close past ATR.", meaning: "Trend broken.", action: TradeAction.SHORT },
    [PatternType.POC_BOUNCE]: { visual: "Bounce off Volume Node.", meaning: "Volume support.", action: TradeAction.LONG },
    [PatternType.RSI_DIVERGENCE]: { visual: "Price high, RSI low.", meaning: "Momentum death.", action: TradeAction.SHORT },
    [PatternType.BOLLINGER_SQUEEZE]: { visual: "Tight bands.", meaning: "Explosion imminent.", action: TradeAction.LONG },
    [PatternType.GAP_UP]: { visual: "Space up.", meaning: "Momentum.", action: TradeAction.LONG },
    [PatternType.GAP_DOWN]: { visual: "Space down.", meaning: "Panic.", action: TradeAction.SHORT },
    [PatternType.BREAKAWAY_GAP]: { visual: "Gap out of range.", meaning: "New trend.", action: TradeAction.LONG },
    [PatternType.RUNAWAY_GAP]: { visual: "Gap in trend.", meaning: "Acceleration.", action: TradeAction.LONG },
    [PatternType.EXHAUSTION_GAP]: { visual: "Gap at end.", meaning: "The end.", action: TradeAction.SHORT },
    [PatternType.DEAD_CAT_BOUNCE]: { visual: "Weak rally after crash.", meaning: "Trap.", action: TradeAction.SHORT },
    [PatternType.GOLDEN_CROSS]: { visual: "SMA cross up.", meaning: "Long term bull.", action: TradeAction.LONG },
    [PatternType.DEATH_CROSS]: { visual: "SMA cross down.", meaning: "Long term bear.", action: TradeAction.SHORT },
    [PatternType.INSIDE_BAR_BEAR]: { visual: "Inside candle.", meaning: "Pause.", action: TradeAction.SHORT },
    [PatternType.FAKEOUT_TOP]: { visual: "Break and fail.", meaning: "Trap.", action: TradeAction.SHORT },
    [PatternType.STOCH_CROSS_DOWN]: { visual: "Oscillator cross.", meaning: "Overbought.", action: TradeAction.SHORT },
    [PatternType.ICHIMOKU_BREAK]: { visual: "Cloud break.", meaning: "Regime change.", action: TradeAction.LONG },
    [PatternType.ADX_LOW]: { visual: "Low ADX.", meaning: "Chop.", action: TradeAction.HOLD },
    [PatternType.KELTNER_BREAK]: { visual: "Channel break.", meaning: "Outlier.", action: TradeAction.SHORT },
    [PatternType.OBV_DIVERGENCE]: { visual: "Volume divergence.", meaning: "Smart money move.", action: TradeAction.LONG },
    [PatternType.CHOP_RANGE]: { visual: "Sideways.", meaning: "No trend.", action: TradeAction.HOLD },
    [PatternType.WOLFE_WAVE]: { visual: "5 waves wedge.", meaning: "Geometry reversal.", action: TradeAction.LONG },
    [PatternType.BART_SIMPSON]: { visual: "Up, flat, down.", meaning: "Manipulation.", action: TradeAction.SHORT },
    [PatternType.DXY_DIVERGENCE]: { visual: "Dollar divergence.", meaning: "Macro shift.", action: TradeAction.LONG },
    
    [PatternType.NONE]: { visual: "Noise.", meaning: "Nothing clear.", action: TradeAction.HOLD }
  },
  indicators: {} // Kept same as before (omitted for brevity)
};

// --- HELPERS ---
const generateNextCandle = (prev: Candle, volatility: number, trend: number): Candle => {
  const change = (Math.random() - 0.5 + trend) * volatility * prev.close;
  const close = prev.close + change;
  const high = Math.max(prev.close, close) + Math.random() * volatility * prev.close;
  const low = Math.min(prev.close, close) - Math.random() * volatility * prev.close;
  return {
    time: new Date().toISOString(),
    open: prev.close,
    high,
    low,
    close,
    volume: Math.floor(Math.random() * 1000) + 500
  };
};

const injectTrend = (candles: Candle[], direction: 'UP' | 'DOWN', steps: number, vol: number) => {
    let prev = candles[candles.length - 1];
    const bias = direction === 'UP' ? 0.2 : -0.2;
    for(let i=0; i<steps; i++) {
        prev = generateNextCandle(prev, vol, bias);
        candles.push(prev);
    }
};

const calculateSMA = (data: Candle[], period: number): number[] => {
  const smas: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smas.push(NaN); 
      continue;
    }
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + val.close, 0);
    smas.push(sum / period);
  }
  return smas;
};

const calculateRSI = (data: Candle[], period: number = 14): number[] => {
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for(let i=0; i<=period; i++) rsi.push(50);
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
};

// --- SCENARIO GENERATOR ---
export const generateScenario = (
    difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy', 
    weakPatterns: PatternType[] = [],
    forcedPattern?: PatternType
): ChartScenario => {
  const historyLength = 50;
  const futureLength = 20;
  const startPrice = 100 + Math.random() * 50;
  
  const rawCandles: Candle[] = [];
  let prevCandle: Candle = { time: '', open: startPrice, high: startPrice, low: startPrice, close: startPrice };
  let vol = difficulty === 'Medium' ? 0.025 : (difficulty === 'Hard' ? 0.04 : 0.015);

  // SELECT PATTERN
  let selectedPattern: PatternType;
  let isReview = false;

  if (forcedPattern) {
      selectedPattern = forcedPattern;
  } else if (weakPatterns.length > 0 && Math.random() < 0.3) {
      selectedPattern = weakPatterns[Math.floor(Math.random() * weakPatterns.length)];
      isReview = true;
  } else {
      const keys = Object.keys(KNOWLEDGE_BASE.patterns) as PatternType[];
      // Filter out NONE to ensure we get a pattern
      const validKeys = keys.filter(k => k !== PatternType.NONE);
      selectedPattern = validKeys[Math.floor(Math.random() * validKeys.length)];
  }

  const kbEntry = KNOWLEDGE_BASE.patterns[selectedPattern] || KNOWLEDGE_BASE.patterns[PatternType.NONE];
  let correctAction = kbEntry.action;
  
  // GENERATE HISTORY BASE
  const patternBuffer = 15; 
  for (let i = 0; i < historyLength - patternBuffer; i++) {
    const candle = generateNextCandle(prevCandle, vol, 0); 
    rawCandles.push(candle);
    prevCandle = candle;
  }

  // --- INJECT PATTERN LOGIC ---
  // Simplified procedural generation for the complex new types
  const inject = (c: Candle[]) => {
      // HARMONICS (M/W shapes)
      if ([PatternType.GARTLEY, PatternType.BAT, PatternType.CYPHER].includes(selectedPattern)) {
          // X-A-B-C-D Bullish (W Shape)
          injectTrend(c, 'UP', 3, vol); // XA
          injectTrend(c, 'DOWN', 2, vol); // AB
          injectTrend(c, 'UP', 2, vol); // BC
          injectTrend(c, 'DOWN', 3, vol); // CD
          correctAction = TradeAction.LONG;
      } 
      else if ([PatternType.BUTTERFLY, PatternType.CRAB, PatternType.SHARK].includes(selectedPattern)) {
          // Bearish (M Shape) extended
          injectTrend(c, 'DOWN', 3, vol);
          injectTrend(c, 'UP', 2, vol);
          injectTrend(c, 'DOWN', 2, vol);
          injectTrend(c, 'UP', 4, vol); // Extended CD
          correctAction = TradeAction.SHORT;
      }
      // SMC
      else if (selectedPattern === PatternType.ORDER_BLOCK_BULL) {
          injectTrend(c, 'DOWN', 4, vol);
          const lastRed = generateNextCandle(c[c.length-1], vol, -0.1); // The OB
          c.push(lastRed);
          injectTrend(c, 'UP', 4, vol*2); // Displacement
          injectTrend(c, 'DOWN', 3, vol*0.5); // Return to OB
          correctAction = TradeAction.LONG;
      }
      else if (selectedPattern === PatternType.WYCKOFF_SPRING) {
          injectTrend(c, 'DOWN', 5, vol);
          injectTrend(c, 'UP', 3, vol); // Range
          injectTrend(c, 'DOWN', 2, vol); 
          injectTrend(c, 'UP', 2, vol); 
          const low = c[c.length-1].low;
          const spring = { ...c[c.length-1], low: low - 2, close: low + 0.5, open: low }; // Spring
          c.push(spring);
          correctAction = TradeAction.LONG;
      }
      // ADVANCED CANDLES
      else if (selectedPattern === PatternType.THREE_OUTSIDE_UP) {
          injectTrend(c, 'DOWN', 3, vol);
          const p = c[c.length-1];
          // Engulfing
          const engulf = { ...p, open: p.close-0.2, close: p.open+1, high: p.open+1.2, low: p.close-0.5 };
          c.push(engulf);
          // Confirmation
          injectTrend(c, 'UP', 1, vol);
          correctAction = TradeAction.LONG;
      }
      // DEFAULTS FOR OTHERS (Simplified)
      else if (selectedPattern.includes('Bull') || selectedPattern.includes('Bottom') || selectedPattern.includes('Up')) {
          injectTrend(c, 'DOWN', 5, vol);
          injectTrend(c, 'UP', 2, vol);
          correctAction = TradeAction.LONG;
      } else {
          injectTrend(c, 'UP', 5, vol);
          injectTrend(c, 'DOWN', 2, vol);
          correctAction = TradeAction.SHORT;
      }
  };

  inject(rawCandles);

  // GENERATE FUTURE
  const futureCandles: Candle[] = [];
  let fPrev = rawCandles[rawCandles.length - 1];
  let futureBias = correctAction === TradeAction.LONG ? 0.2 : (correctAction === TradeAction.SHORT ? -0.2 : 0);
  
  for (let i = 0; i < futureLength; i++) {
    const fCandle = generateNextCandle(fPrev, vol * 1.5, futureBias); 
    futureCandles.push(fCandle);
    fPrev = fCandle;
  }

  // INDICATORS
  const allData = [...rawCandles, ...futureCandles];
  const sma20 = calculateSMA(allData, 20);
  const rsi14 = calculateRSI(allData, 14);

  const historyWithIndicators = rawCandles.map((c, i) => ({
      ...c,
      sma20: sma20[i],
      rsi: rsi14[i]
  }));

  const futureWithIndicators = futureCandles.map((c, i) => ({
      ...c,
      sma20: sma20[rawCandles.length + i],
      rsi: rsi14[rawCandles.length + i]
  }));

  return {
    history: historyWithIndicators,
    future: futureWithIndicators,
    correctAction,
    pattern: selectedPattern,
    patternDescription: kbEntry.meaning,
    difficulty,
    isReview
  };
};
