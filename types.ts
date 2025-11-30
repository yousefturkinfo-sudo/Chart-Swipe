
export enum TradeAction {
  LONG = 'LONG',
  SHORT = 'SHORT',
  HOLD = 'HOLD'
}

export type ChartSkin = 'DEFAULT' | 'MATRIX' | 'VAPORWAVE' | 'BLUEPRINT' | 'MIDNIGHT' | 'CYBERPUNK';

export enum PatternType {
  // --- CANDLESTICK PATTERNS (BASIC) ---
  DOJI = 'Doji',
  DRAGONFLY_DOJI = 'Dragonfly Doji',
  GRAVESTONE_DOJI = 'Gravestone Doji',
  HAMMER = 'Hammer',
  INVERTED_HAMMER = 'Inverted Hammer',
  HANGING_MAN = 'Hanging Man',
  SHOOTING_STAR = 'Shooting Star',
  SPINNING_TOP = 'Spinning Top',
  MARUBOZU_BULL = 'Bullish Marubozu',
  MARUBOZU_BEAR = 'Bearish Marubozu',
  LONG_LEGGED_DOJI = 'Long Legged Doji',
  
  // 2-Candle Patterns
  ENGULFING = 'Bullish Engulfing',
  BEARISH_ENGULFING = 'Bearish Engulfing',
  HARAMI_BULL = 'Bullish Harami',
  HARAMI_BEAR = 'Bearish Harami',
  PIERCING_LINE = 'Piercing Line',
  DARK_CLOUD_COVER = 'Dark Cloud Cover',
  TWEEZER_BOTTOM = 'Tweezer Bottom',
  TWEEZER_TOP = 'Tweezer Top',
  KICKER_PATTERN = 'Kicker Pattern',
  
  // 3-Candle & Advanced Patterns
  MORNING_STAR = 'Morning Star',
  EVENING_STAR = 'Evening Star',
  THREE_WHITE_SOLDIERS = 'Three White Soldiers',
  THREE_BLACK_CROWS = 'Three Black Crows',
  THREE_INSIDE_UP = 'Three Inside Up',
  THREE_INSIDE_DOWN = 'Three Inside Down',
  THREE_LINE_STRIKE = 'Three Line Strike',
  ABANDONED_BABY = 'Abandoned Baby',
  THREE_OUTSIDE_UP = 'Three Outside Up',
  THREE_OUTSIDE_DOWN = 'Three Outside Down',
  MAT_HOLD = 'Mat Hold',
  RISING_THREE_METHODS = 'Rising Three Methods',
  FALLING_THREE_METHODS = 'Falling Three Methods',

  // --- CHART PATTERNS ---
  DOUBLE_BOTTOM = 'Double Bottom',
  DOUBLE_TOP = 'Double Top',
  TRIPLE_BOTTOM = 'Triple Bottom',
  TRIPLE_TOP = 'Triple Top',
  HEAD_AND_SHOULDERS = 'Head & Shoulders',
  INVERSE_HEAD_AND_SHOULDERS = 'Inv. Head & Shoulders',
  ROUNDING_BOTTOM = 'Rounding Bottom',
  DIAMOND_TOP = 'Diamond Top',
  DIAMOND_BOTTOM = 'Diamond Bottom',
  V_SHAPE_RECOVERY = 'V-Shape Recovery',
  ISLAND_REVERSAL = 'Island Reversal',

  // Continuations
  BULL_FLAG = 'Bull Flag',
  BEAR_FLAG = 'Bear Flag',
  BULL_PENNANT = 'Bullish Pennant',
  BEAR_PENNANT = 'Bearish Pennant',
  BULLISH_RECTANGLE = 'Bullish Rectangle',
  BEARISH_RECTANGLE = 'Bearish Rectangle',
  CUP_AND_HANDLE = 'Cup & Handle',
  INVERSE_CUP_AND_HANDLE = 'Inv. Cup & Handle',
  
  // Triangles & Wedges
  ASCENDING_TRIANGLE = 'Ascending Triangle',
  DESCENDING_TRIANGLE = 'Descending Triangle',
  SYMMETRICAL_TRIANGLE = 'Symmetrical Triangle',
  FALLING_WEDGE = 'Falling Wedge',
  RISING_WEDGE = 'Rising Wedge',
  BROADENING_WEDGE = 'Broadening Wedge',
  FAKE_OUT = 'Fakeout',

  // --- HARMONIC PATTERNS ---
  GARTLEY = 'Gartley Pattern',
  BUTTERFLY = 'Butterfly Pattern',
  BAT = 'Bat Pattern',
  CRAB = 'Crab Pattern',
  CYPHER = 'Cypher Pattern',
  SHARK = 'Shark Pattern',

  // --- SMART MONEY CONCEPTS (SMC) ---
  ORDER_BLOCK_BULL = 'Bullish Order Block',
  ORDER_BLOCK_BEAR = 'Bearish Order Block',
  BREAKER_BLOCK = 'Breaker Block',
  MITIGATION_BLOCK = 'Mitigation Block',
  AMD_SETUP = 'AMD Setup (Power of 3)',
  MIDNIGHT_OPEN = 'Midnight Open Reversion',
  ASIAN_SWEEP = 'Asian Range Sweep',
  OTE_FIB = 'OTE (Optimal Trade Entry)',
  RANGE_PREMIUM = 'Premium Range Short',
  SFP_BOTTOM = 'Swing Failure Pattern (SFP)',
  LONDON_KILLZONE = 'London Killzone',
  IMBALANCE_FILL = 'Imbalance Fill (FVG)',
  WYCKOFF_SPRING = 'Wyckoff Spring',
  WYCKOFF_UPTHRUST = 'Wyckoff Upthrust',
  CHOCH_BULL = 'Bullish CHoCH',
  CHOCH_BEAR = 'Bearish CHoCH',
  LIQUIDITY_GRAB_BULL = 'Bullish Liquidity Grab',
  LIQUIDITY_GRAB_BEAR = 'Bearish Liquidity Grab',

  // --- QUANT / ALGO / EVENTS ---
  GAP_UP = 'Gap Up',
  GAP_DOWN = 'Gap Down',
  BREAKAWAY_GAP = 'Breakaway Gap',
  RUNAWAY_GAP = 'Runaway Gap',
  EXHAUSTION_GAP = 'Exhaustion Gap',
  DEAD_CAT_BOUNCE = 'Dead Cat Bounce',
  GOLDEN_CROSS = 'Golden Cross',
  DEATH_CROSS = 'Death Cross',
  INSIDE_BAR_BEAR = 'Inside Bar (Bearish)',
  FAKEOUT_TOP = 'Fakeout Top',
  VWAP_EXTENSION = 'VWAP Extension',
  ATR_BREAK = 'ATR Trailing Stop Break',
  POC_BOUNCE = 'Volume Profile POC Bounce',
  DXY_DIVERGENCE = 'DXY Divergence',
  STOCH_CROSS_DOWN = 'Stochastic Cross Down',
  ICHIMOKU_BREAK = 'Ichimoku Cloud Break',
  ADX_LOW = 'ADX Low Volatility',
  KELTNER_BREAK = 'Keltner Channel Break',
  OBV_DIVERGENCE = 'OBV Divergence',
  CHOP_RANGE = 'Choppiness Index Range',
  RSI_DIVERGENCE = 'RSI Divergence',
  BOLLINGER_SQUEEZE = 'Bollinger Band Squeeze',
  
  // Advanced/Exotic
  WOLFE_WAVE = 'Wolfe Wave',
  BART_SIMPSON = 'Bart Simpson Pattern',
  NONE = 'Random Walk'
}

export type PatternCategory = 'CANDLESTICK' | 'CHART_PATTERN' | 'HARMONIC' | 'SMC' | 'QUANT';

export enum AppView {
  HOME = 'HOME', 
  LEARN = 'LEARN',     
  PLAY = 'PLAY',         
  FIN_LIT = 'FIN_LIT',   
  ANALYZE = 'ANALYZE',   
  COMMUNITY = 'COMMUNITY', 
  PROFILE = 'PROFILE',
  QUANT = 'QUANT'
}

export enum AuthView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING = 'ONBOARDING',
  APP = 'APP'
}

export enum LearningStyle {
  VISUAL = 'VISUAL', 
  AUDITORY = 'AUDITORY',       
  KINESTHETIC = 'KINESTHETIC'  
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  sma20?: number;
  rsi?: number;
}

export interface ChartAnnotation {
  index: number;      // Candle index to point to
  price?: number;     // Specific price level (y-axis)
  text: string;       // Label text
  type: 'LABEL' | 'ARROW_UP' | 'ARROW_DOWN' | 'ZONE';
}

export interface ChartScenario {
  history: Candle[];     
  future: Candle[];      
  correctAction: TradeAction;
  pattern: PatternType;
  patternDescription: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isReview?: boolean;
  highlightRange?: { start: number; end: number }; 
  annotations?: ChartAnnotation[]; // NEW: For lesson demonstrations
}

export interface AcademyLesson {
  id: string;
  title: string;
  content: string; 
  question: string;    
  leftOption: string;  
  rightOption: string; 
  correctSide: 'LEFT' | 'RIGHT';
  feedback: string;    
  orderIndex: number;
  chartScenario?: ChartScenario; 
}

export type FinLitLesson = AcademyLesson;

export enum LearningTrack {
  TRADER = 'The Trader',
  STRATEGIST = 'The Strategist',
  QUANT = 'The Quant'
}

export interface AcademyModule {
  id: string;
  track: LearningTrack;
  title: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  isLockedByDefault: boolean;
  lessons: AcademyLesson[];
  relatedPatterns?: PatternType[]; 
  difficultyTier?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  tags?: string[];
  isBondBroken?: boolean; 
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isOnboardingComplete: boolean;
  learningStyle: LearningStyle;
  experience?: 'NOVICE' | 'INTERMEDIATE' | 'PRO';
  goal?: 'DAY_TRADING' | 'INVESTING' | 'ALGO';
  risk?: 'LOW' | 'HIGH';
}

export interface OnboardingData {
  experience: 'NOVICE' | 'INTERMEDIATE' | 'PRO';
  goal: 'DAY_TRADING' | 'INVESTING' | 'ALGO';
  risk: 'LOW' | 'HIGH';
  learningStyle: LearningStyle;
}

export interface UserStats {
  balance: number;
  hearts: number;
  candles: number; 
  xp: number;
  streak: number;
  unlockedPatterns: PatternType[];
  weakPatterns: PatternType[]; 
  currentTrack: LearningTrack; 
  currentModuleId: string; 
  currentLessonIndex: number; 
  personalizedPath?: string[]; 
  completedModules: string[];
  ownedSkins: ChartSkin[];
  equippedSkin: ChartSkin;
}

export interface UserProgress {
  lessonId: string;
  status: 'COMPLETED' | 'LOCKED' | 'UNLOCKED';
  completedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  avatar: string;
  rank: number;
}

export enum VoiceState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  SPEAKING = 'SPEAKING'
}

export type AppContext = ChartScenario | AcademyLesson | null;

// --- ALPHA VANTAGE / QUANT DATA TYPES ---
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export interface NewsSentiment {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  source: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
}

export interface CompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
}

export interface IntradayData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
