
import { AcademyModule, LearningTrack, PatternType, AcademyLesson, TradeAction, Candle, ChartScenario, ChartAnnotation } from '../types';
import { generateScenario } from './marketEngine';

// --- ROBUST EDUCATIONAL DATA GENERATOR ---
// Wraps the main engine generator but forces the specific pattern for the lesson and generates appropriate overlays
const generateEducationalData = (pattern: PatternType, title: string): { candles: Candle[], highlight: { start: number, end: number }, annotations: ChartAnnotation[] } => {
    // We reuse the robust engine logic to ensure consistency
    const scenario = generateScenario('Easy', [], pattern);
    const history = scenario.history;
    const len = history.length;
    
    // Pattern is usually generated at the very end of history in generateScenario
    const highlightStart = len - 15;
    const highlightEnd = len - 1;
    
    // AUTO-ANNOTATE based on pattern type & title
    const annotations: ChartAnnotation[] = [];
    const lastCandle = history[len-1];
    
    // 1. Basic Candle Annotations
    if (pattern === PatternType.HAMMER || pattern === PatternType.DRAGONFLY_DOJI) {
        annotations.push({ index: len - 1, type: 'ARROW_UP', text: 'REJECTION' });
        annotations.push({ index: len - 1, type: 'LABEL', price: lastCandle.low, text: 'Long Wick' });
    }
    else if (pattern === PatternType.SHOOTING_STAR || pattern === PatternType.GRAVESTONE_DOJI) {
        annotations.push({ index: len - 1, type: 'ARROW_DOWN', text: 'REJECTION' });
        annotations.push({ index: len - 1, type: 'LABEL', price: lastCandle.high, text: 'Wick High' });
    }
    
    // 2. Support/Res Annotations (Lines)
    else if (pattern === PatternType.DOUBLE_BOTTOM || title.includes('Support')) {
        const supportLevel = lastCandle.low * 0.99;
        annotations.push({ type: 'LINE', price: supportLevel, text: 'SUPPORT ZONE', color: '#00FF94' });
        annotations.push({ index: len - 1, type: 'ARROW_UP', text: 'Bounce' });
    }
    else if (pattern === PatternType.DOUBLE_TOP || title.includes('Resistance')) {
        const resLevel = lastCandle.high * 1.01;
        annotations.push({ type: 'LINE', price: resLevel, text: 'RESISTANCE', color: '#FF0055' });
        annotations.push({ index: len - 1, type: 'ARROW_DOWN', text: 'Reject' });
    }

    // 3. SMC / Zones
    else if (pattern === PatternType.IMBALANCE_FILL || pattern.includes('FVG') || title.includes('Gap')) {
        const gapTop = history[len-3].low;
        const gapBottom = history[len-1].high;
        if (gapTop > gapBottom) {
             annotations.push({ type: 'ZONE', price: gapBottom, endPrice: gapTop, text: 'FAIR VALUE GAP', color: 'rgba(255, 255, 0, 0.3)' });
        }
    }
    else if (pattern === PatternType.ORDER_BLOCK_BULL) {
        annotations.push({ type: 'ZONE', price: lastCandle.low, endPrice: lastCandle.high, text: 'ORDER BLOCK', color: 'rgba(0, 255, 148, 0.2)' });
        annotations.push({ index: len - 1, type: 'LABEL', text: 'Institutional Entry', price: lastCandle.high });
    }

    // 4. Breakouts
    else if (pattern.includes('Bull') || title.includes('Up')) {
        annotations.push({ index: len - 1, type: 'ARROW_UP', text: 'ENTRY' });
    }
    else if (pattern.includes('Bear') || pattern.includes('Top') || title.includes('Down')) {
        annotations.push({ index: len - 1, type: 'ARROW_DOWN', text: 'ENTRY' });
    }

    return { 
        candles: history, 
        highlight: { start: highlightStart, end: highlightEnd },
        annotations
    };
};

const makeLesson = (id: string, modId: string, title: string, content: string, q: string, l: string, r: string, correct: 'LEFT'|'RIGHT', fb: string, pattern: PatternType, order: number): AcademyLesson => {
    const { candles, highlight, annotations } = generateEducationalData(pattern, title);
    return {
        id,
        title,
        content,
        question: q,
        leftOption: l,
        rightOption: r,
        correctSide: correct,
        feedback: fb,
        orderIndex: order,
        chartScenario: {
            history: candles,
            future: [],
            correctAction: correct === 'LEFT' ? TradeAction.SHORT : TradeAction.LONG,
            pattern: pattern,
            patternDescription: fb,
            difficulty: 'Easy',
            highlightRange: highlight,
            annotations: annotations
        }
    };
};

// --- THE UNIVERSITY CURRICULUM (150+ LESSONS) ---
export const CURRICULUM: AcademyModule[] = [
    // =============================================
    // TRACK 1: THE TRADER (Technical Analysis)
    // =============================================
    {
        id: 'mod_trader_1',
        track: LearningTrack.TRADER,
        title: 'Candlestick Anatomy',
        description: 'Reading the raw language of price.',
        icon: 'candlestick_chart',
        color: 'from-blue-600 to-cyan-500',
        orderIndex: 0,
        isLockedByDefault: false,
        difficultyTier: 'Beginner',
        tags: ['Basics', 'Candles'],
        lessons: [
            makeLesson('l_t1_1', 'mod_trader_1', 'The Body vs The Wick', 'The Body tells you who won the battle. The Wick tells you where the fight happened.', 'A long upper wick means buyers tried to push up but failed. Bullish or Bearish?', 'Bullish', 'Bearish', 'RIGHT', 'Bearish. Sellers rejected the high prices.', PatternType.SHOOTING_STAR, 0),
            makeLesson('l_t1_2', 'mod_trader_1', 'The Hammer', 'A small body with a long lower wick found at the bottom of a downtrend. It shows buyers absorbing selling pressure.', 'Price dropped hard but closed near the open. Bullish or Bearish?', 'Bearish', 'Bullish', 'RIGHT', 'Bullish. The long tail shows rejection of lower prices.', PatternType.HAMMER, 1),
            makeLesson('l_t1_3', 'mod_trader_1', 'The Doji', 'Open equals Close. Total indecision in the market.', 'Price moved a lot but closed exactly where it opened. Who won?', 'Buyers', 'Nobody', 'RIGHT', 'Nobody. It is a tie game.', PatternType.DOJI, 2),
            makeLesson('l_t1_4', 'mod_trader_1', 'Marubozu', 'A candle with no wicks. Pure aggression from open to close.', 'A giant green candle with zero wicks appears. What does it mean?', 'Exhaustion', 'Strength', 'RIGHT', 'Strength. Buyers were in control every single second.', PatternType.MARUBOZU_BULL, 3),
            makeLesson('l_t1_5', 'mod_trader_1', 'Spinning Top', 'Small body, long wicks on both sides. The market is catching its breath.', 'After a huge rally, a spinning top appears. Continue or Pause?', 'Continue', 'Pause', 'RIGHT', 'Pause. Momentum is fading.', PatternType.SPINNING_TOP, 4),
            makeLesson('l_t1_6', 'mod_trader_1', 'Inverted Hammer', 'Upside down hammer found at bottoms. Buyers tested higher prices.', 'Inverted hammer at support. Bullish?', 'Yes', 'No', 'LEFT', 'Yes. It shows buying interest despite the pullback.', PatternType.INVERTED_HAMMER, 5),
            makeLesson('l_t1_7', 'mod_trader_1', 'Engulfing Pattern', 'The new candle body completely swallows the previous one.', 'Green candle completely covers the previous red one. Signal?', 'Reversal', 'Continuation', 'LEFT', 'Reversal. Bullish Engulfing.', PatternType.ENGULFING, 6),
            makeLesson('l_t1_8', 'mod_trader_1', 'Harami (Pregnant)', 'A small candle contained inside the previous large one.', 'Volatility has contracted inside the previous range. What comes next?', 'Breakout', 'Nothing', 'LEFT', 'A breakout usually follows a Harami coil.', PatternType.HARAMI_BULL, 7),
            makeLesson('l_t1_9', 'mod_trader_1', 'Tweezer Tops', 'Two candles with the exact same high. A double rejection.', 'Price hit $50.00 twice and rejected both times. Trade?', 'Short', 'Long', 'LEFT', 'Short. Tweezer tops indicates a strong ceiling.', PatternType.TWEEZER_TOP, 8),
            makeLesson('l_t1_10', 'mod_trader_1', 'Three White Soldiers', 'Three consecutive green candles closing higher. The march is on.', 'Three strong green candles in a row. Trend status?', 'Strong', 'Weak', 'LEFT', 'Strong. Do not short the soldiers.', PatternType.THREE_WHITE_SOLDIERS, 9),
        ]
    },
    {
        id: 'mod_trader_2',
        track: LearningTrack.TRADER,
        title: 'Chart Patterns',
        description: 'Geometry of the markets.',
        icon: 'change_history',
        color: 'from-blue-600 to-cyan-500',
        orderIndex: 1,
        isLockedByDefault: true,
        difficultyTier: 'Intermediate',
        tags: ['Patterns'],
        lessons: [
            makeLesson('l_t2_1', 'mod_trader_2', 'Double Top', 'The M Pattern. Price fails to break a high twice.', 'Price hit resistance twice and formed an M shape. Trade?', 'Short', 'Long', 'LEFT', 'Short. The Double Top is a classic reversal.', PatternType.DOUBLE_TOP, 0),
            makeLesson('l_t2_2', 'mod_trader_2', 'Double Bottom', 'The W Pattern. Support holds twice.', 'W shape detected. Neckline broken. Action?', 'Sell', 'Buy', 'RIGHT', 'Buy. The Double Bottom confirms support.', PatternType.DOUBLE_BOTTOM, 1),
            makeLesson('l_t2_3', 'mod_trader_2', 'Head & Shoulders', 'Higher high (Head) flanked by two lower highs (Shoulders).', 'The trend made a higher high, then a lower high. Structure broken?', 'Yes', 'No', 'LEFT', 'Yes. This is a distribution pattern.', PatternType.HEAD_AND_SHOULDERS, 2),
            makeLesson('l_t2_4', 'mod_trader_2', 'Bull Flag', 'A sharp pole followed by a gentle pullback.', 'Price shot up, now drifting down slowly. Buy the break?', 'Yes', 'No', 'LEFT', 'Yes. Flags fly at half mast.', PatternType.BULL_FLAG, 3),
            makeLesson('l_t2_5', 'mod_trader_2', 'Rising Wedge', 'Highs are higher, lows are higher, but converging. Bearish.', 'Price is squeezing into a tight upward cone. Expected move?', 'Up', 'Down', 'RIGHT', 'Down. Rising Wedges typically break bearish.', PatternType.RISING_WEDGE, 4),
            makeLesson('l_t2_6', 'mod_trader_2', 'Cup & Handle', 'Rounded bottom plus a small pullback.', 'Looks like a tea cup. The handle is forming. Bullish?', 'Yes', 'No', 'LEFT', 'Yes. It indicates accumulation.', PatternType.CUP_AND_HANDLE, 5),
            makeLesson('l_t2_7', 'mod_trader_2', 'Symmetrical Triangle', 'Lower highs and higher lows. Coiling energy.', 'Market is compressing. Volatility is dying. What next?', 'Expansion', 'Sleep', 'LEFT', 'Expansion. Energy cannot be contained forever.', PatternType.SYMMETRICAL_TRIANGLE, 6),
            makeLesson('l_t2_8', 'mod_trader_2', 'Descending Triangle', 'Flat bottom, lower highs. Sellers are aggressive.', 'Support is flat, but highs are getting lower. Who is winning?', 'Buyers', 'Sellers', 'RIGHT', 'Sellers are pushing price into the floor.', PatternType.DESCENDING_TRIANGLE, 7),
            makeLesson('l_t2_9', 'mod_trader_2', 'Diamond Top', 'Rare expansion then contraction. A messy top.', 'Price expanded wildy then contracted. Signal?', 'Reversal', 'Continuation', 'LEFT', 'Reversal. Diamonds signal tops.', PatternType.DIAMOND_TOP, 8),
            makeLesson('l_t2_10', 'mod_trader_2', 'Gap Up', 'Price opens higher than yesterday close.', 'Gap up on high volume. Fade or Follow?', 'Fade', 'Follow', 'RIGHT', 'Follow. Momentum is strong.', PatternType.GAP_UP, 9),
        ]
    },
    {
        id: 'mod_trader_3',
        track: LearningTrack.TRADER,
        title: 'Market Structure',
        description: 'Trend, Support, and Resistance.',
        icon: 'stairs',
        color: 'from-blue-600 to-cyan-500',
        orderIndex: 2,
        isLockedByDefault: true,
        difficultyTier: 'Advanced',
        lessons: [
            makeLesson('l_t3_1', 'mod_trader_3', 'Higher Highs', 'The definition of an uptrend.', 'Market made a higher high and a higher low. Trend?', 'Up', 'Down', 'LEFT', 'Up. Structure is bullish.', PatternType.NONE, 0),
            makeLesson('l_t3_2', 'mod_trader_3', 'Support Flip', 'When support breaks, it becomes resistance.', 'Price fell through the floor. It is now rallying back to it. Short?', 'Yes', 'No', 'LEFT', 'Yes. The floor is now the ceiling.', PatternType.SUPPORT_FLIP, 1),
            makeLesson('l_t3_3', 'mod_trader_3', 'Breakout', 'Price moves outside a defined range.', 'Price broke above the resistance box. Buy?', 'Yes', 'No', 'LEFT', 'Yes. Volatility expansion.', PatternType.NONE, 2),
            makeLesson('l_t3_4', 'mod_trader_3', 'Fakeout', 'A failed breakout. Trap.', 'Price broke out but immediately closed back inside. Bullish?', 'Yes', 'No', 'RIGHT', 'No. This is a fakeout (Bull Trap).', PatternType.FAKE_OUT, 3),
            makeLesson('l_t3_5', 'mod_trader_3', 'Trendlines', 'Diagonal support.', 'Price touched the diagonal line 3 times. Buy the 4th?', 'Yes', 'No', 'LEFT', 'Yes. Trendlines act as dynamic support.', PatternType.NONE, 4),
        ]
    },

    // =============================================
    // TRACK 2: THE STRATEGIST (SMC / Institutional)
    // =============================================
    {
        id: 'mod_strat_1',
        track: LearningTrack.STRATEGIST,
        title: 'Smart Money Core',
        description: 'How algorithms trade.',
        icon: 'hub',
        color: 'from-purple-600 to-indigo-500',
        orderIndex: 0,
        isLockedByDefault: false,
        difficultyTier: 'Advanced',
        tags: ['SMC', 'Liquidity'],
        lessons: [
            makeLesson('l_s1_1', 'mod_strat_1', 'Liquidity Sweep', 'Algorithms target "obvious" stop losses before reversing.', 'Price spiked below the recent low then rallied instantly. What happened?', 'Breakout', 'Sweep', 'RIGHT', 'Liquidity Sweep. Stops were hunted.', PatternType.LIQUIDITY_GRAB_BULL, 0),
            makeLesson('l_s1_2', 'mod_strat_1', 'Fair Value Gap (FVG)', 'A 3-candle sequence where the wicks do not overlap. It is a magnet.', 'There is a gap between candle 1 high and candle 3 low. Will price return?', 'Yes', 'No', 'LEFT', 'Yes. Price seeks to balance inefficiency (FVG).', PatternType.IMBALANCE_FILL, 1),
            makeLesson('l_s1_3', 'mod_strat_1', 'Order Block', 'The last contrary candle before a violent displacement.', 'Price is returning to the origin of the impulse. Reaction expected?', 'Yes', 'No', 'LEFT', 'Yes. Banks defend their Order Blocks.', PatternType.ORDER_BLOCK_BULL, 2),
            makeLesson('l_s1_4', 'mod_strat_1', 'Change of Character', 'The first break of structure against the trend.', 'Downtrend just broke a lower high. Structure shift?', 'CHoCH', 'Fakeout', 'LEFT', 'Change of Character (CHoCH). Trend may be turning.', PatternType.CHOCH_BULL, 3),
            makeLesson('l_s1_5', 'mod_strat_1', 'Inducement', 'Creating a fake high to lure early buyers before the real move.', 'Price made a small high before the main zone. Is it a trap?', 'Yes', 'No', 'LEFT', 'Yes. This is Inducement liquidity.', PatternType.NONE, 4),
            makeLesson('l_s1_6', 'mod_strat_1', 'Breaker Block', 'Failed order block. Support becomes resistance.', 'The Order Block failed to hold. Price is testing it from below. Short?', 'Yes', 'No', 'LEFT', 'Yes. It is now a Breaker.', PatternType.BREAKER_BLOCK, 5),
            makeLesson('l_s1_7', 'mod_strat_1', 'Power of 3 (AMD)', 'Accumulation, Manipulation, Distribution.', 'Asian session ranged. London dropped. NY is rallying. What was London?', 'Trend', 'Manipulation', 'RIGHT', 'Manipulation (The Judas Swing).', PatternType.AMD_SETUP, 6),
            makeLesson('l_s1_8', 'mod_strat_1', 'Midnight Open', 'The Algo reset time (00:00 NY).', 'Price is far below the Midnight Open. Bias?', 'Bullish', 'Bearish', 'LEFT', 'Bullish. Reversion to mean.', PatternType.MIDNIGHT_OPEN, 7),
            makeLesson('l_s1_9', 'mod_strat_1', 'OTE Fib', 'Optimal Trade Entry (62-79%).', 'Retracement hit the 70.5% level. Buy?', 'Yes', 'No', 'LEFT', 'Yes. This is the OTE zone.', PatternType.OTE_FIB, 8),
            makeLesson('l_s1_10', 'mod_strat_1', 'Swing Failure (SFP)', 'Wick below low, close above.', 'Candle wicked the low but closed inside the range. Bearish?', 'Yes', 'No', 'RIGHT', 'No. SFP is a bullish reversal signal.', PatternType.SFP_BOTTOM, 9),
        ]
    },
    {
        id: 'mod_strat_2',
        track: LearningTrack.STRATEGIST,
        title: 'Harmonic Geometry',
        description: 'Advanced Fibonacci Patterns.',
        icon: 'polyline',
        color: 'from-purple-600 to-indigo-500',
        orderIndex: 1,
        isLockedByDefault: true,
        difficultyTier: 'Advanced',
        lessons: [
            makeLesson('l_s2_1', 'mod_strat_2', 'Gartley Pattern', 'The classic M/W pattern with specific ratios.', 'Retracement hit exactly 61.8%. Buy?', 'Yes', 'No', 'LEFT', 'Yes. Gartley confirms.', PatternType.GARTLEY, 0),
            makeLesson('l_s2_2', 'mod_strat_2', 'Butterfly Pattern', 'Extension pattern. Reverses at 1.27.', 'Price went lower than X but stopped at 1.27. Reversal?', 'Yes', 'No', 'LEFT', 'Yes. Butterfly catches the extension.', PatternType.BUTTERFLY, 1),
            makeLesson('l_s2_3', 'mod_strat_2', 'Bat Pattern', 'Deep retracement to 88.6%.', 'Price almost hit the low again (88%). Buy?', 'Yes', 'No', 'LEFT', 'Yes. The Bat allows a tight stop loss.', PatternType.BAT, 2),
            makeLesson('l_s2_4', 'mod_strat_2', 'Crab Pattern', 'Extreme extension to 1.618.', 'Price is flying away. Hits 1.618 extension. Short?', 'Yes', 'No', 'LEFT', 'Yes. Crab is a max extension reversal.', PatternType.CRAB, 3),
            makeLesson('l_s2_5', 'mod_strat_2', 'Shark Pattern', 'Predatory 2-stage harmonic.', 'A weird double top with a lower low. Shark?', 'Yes', 'No', 'LEFT', 'Yes. Sharks hunt liquidity.', PatternType.SHARK, 4),
        ]
    },

    // =============================================
    // TRACK 3: THE QUANT (Data Science)
    // =============================================
    {
        id: 'mod_quant_1',
        track: LearningTrack.QUANT,
        title: 'Quantitative Edge',
        description: 'Math over feelings.',
        icon: 'calculate',
        color: 'from-pink-600 to-rose-500',
        orderIndex: 0,
        isLockedByDefault: false,
        difficultyTier: 'Pro',
        tags: ['Math', 'Indicators'],
        lessons: [
            makeLesson('l_q1_1', 'mod_quant_1', 'RSI Divergence', 'Momentum disagrees with Price.', 'Price made a higher high, RSI made a lower high. Signal?', 'Reversal', 'Continuation', 'LEFT', 'Reversal. Bearish Divergence.', PatternType.RSI_DIVERGENCE, 0),
            makeLesson('l_q1_2', 'mod_quant_1', 'VWAP Bands', 'Volume Weighted Average Price.', 'Price is 2 standard deviations above VWAP. Buy?', 'Yes', 'No', 'RIGHT', 'No. Mean reversion is likely.', PatternType.VWAP_EXTENSION, 1),
            makeLesson('l_q1_3', 'mod_quant_1', 'Bollinger Squeeze', 'Volatility compression.', 'Bands are extremely tight. What is coming?', 'Explosion', 'Nothing', 'LEFT', 'Volatility expansion follows compression.', PatternType.BOLLINGER_SQUEEZE, 2),
            makeLesson('l_q1_4', 'mod_quant_1', 'Golden Cross', 'SMA 50 crosses above SMA 200.', 'Long term trend signal just triggered. Bullish?', 'Yes', 'No', 'LEFT', 'Yes. Institutional capital enters on Golden Cross.', PatternType.GOLDEN_CROSS, 3),
            makeLesson('l_q1_5', 'mod_quant_1', 'Volume Profile', 'Point of Control (POC).', 'Price is falling into the high volume node. Will it bounce?', 'Likely', 'Unlikely', 'LEFT', 'Likely. Volume acts as support.', PatternType.POC_BOUNCE, 4),
            makeLesson('l_q1_6', 'mod_quant_1', 'ATR Stop', 'Average True Range.', 'Price closed below the 2x ATR line. Exit?', 'Yes', 'No', 'LEFT', 'Yes. The volatility trend is broken.', PatternType.ATR_BREAK, 5),
            makeLesson('l_q1_7', 'mod_quant_1', 'Sharpe Ratio', 'Risk adjusted return.', 'System A makes 10% with low risk. System B makes 12% with huge risk. Better Sharpe?', 'A', 'B', 'LEFT', 'System A has a better Sharpe Ratio.', PatternType.NONE, 6),
            makeLesson('l_q1_8', 'mod_quant_1', 'Kelly Criterion', 'Position Sizing.', 'Win rate 60%, R:R 1:1. Should you bet 100%?', 'Yes', 'No', 'RIGHT', 'No. Kelly says bet ~20%. Betting 100% is ruin.', PatternType.NONE, 7),
            makeLesson('l_q1_9', 'mod_quant_1', 'Correlation', 'Assets moving together.', 'BTC and ETH are 0.9 correlated. Should you long both?', 'Yes', 'No', 'RIGHT', 'No. You are doubling risk on the same bet.', PatternType.NONE, 8),
            makeLesson('l_q1_10', 'mod_quant_1', 'Mean Reversion', 'Everything returns to average.', 'Price is 4 sigmas away from the mean. Trade?', 'Fade', 'Follow', 'LEFT', 'Fade. Statistical probability favors reversion.', PatternType.NONE, 9),
        ]
    }
];
