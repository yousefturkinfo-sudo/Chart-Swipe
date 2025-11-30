
import { AcademyModule, LearningTrack, PatternType, AcademyLesson, TradeAction, Candle, ChartScenario, ChartAnnotation } from '../types';
import { generateScenario } from './marketEngine';

// --- ROBUST EDUCATIONAL DATA GENERATOR ---
// Wraps the main engine generator but forces the specific pattern for the lesson
const generateEducationalData = (pattern: PatternType): { candles: Candle[], highlight: { start: number, end: number }, annotations: ChartAnnotation[] } => {
    // We reuse the robust engine logic to ensure consistency
    const scenario = generateScenario('Easy', [], pattern);
    const history = scenario.history;
    const len = history.length;
    
    // Pattern is usually generated at the very end of history in generateScenario
    const highlightStart = len - 15;
    const highlightEnd = len - 1;
    
    // AUTO-ANNOTATE based on pattern type
    const annotations: ChartAnnotation[] = [];
    const lastCandle = history[len-1];
    
    if (pattern === PatternType.HAMMER || pattern === PatternType.DRAGONFLY_DOJI) {
        annotations.push({
            index: len - 1,
            type: 'ARROW_UP',
            text: 'REJECTION'
        });
        annotations.push({
            index: len - 1,
            type: 'LABEL',
            price: lastCandle.low,
            text: 'Long Wick'
        });
    }
    else if (pattern === PatternType.SHOOTING_STAR || pattern === PatternType.GRAVESTONE_DOJI) {
        annotations.push({
            index: len - 1,
            type: 'ARROW_DOWN',
            text: 'REJECTION'
        });
        annotations.push({
            index: len - 1,
            type: 'LABEL',
            price: lastCandle.high,
            text: 'Wick High'
        });
    }
    else if (pattern === PatternType.DOUBLE_BOTTOM) {
        // Approximate 2 bottoms in the last 15 candles
        annotations.push({ index: len - 10, type: 'ARROW_UP', text: 'B1' });
        annotations.push({ index: len - 1, type: 'ARROW_UP', text: 'B2' });
        annotations.push({ index: len - 5, type: 'LABEL', text: 'Neckline', price: lastCandle.high * 1.02 });
    }
    else if (pattern.includes('Bull')) {
        annotations.push({ index: len - 1, type: 'ARROW_UP', text: 'ENTRY' });
    }
    else if (pattern.includes('Bear') || pattern.includes('Top')) {
        annotations.push({ index: len - 1, type: 'ARROW_DOWN', text: 'ENTRY' });
    }

    return { 
        candles: history, 
        highlight: { start: highlightStart, end: highlightEnd },
        annotations
    };
};

const makeLesson = (id: string, modId: string, title: string, content: string, q: string, l: string, r: string, correct: 'LEFT'|'RIGHT', fb: string, pattern: PatternType, order: number): AcademyLesson => {
    const { candles, highlight, annotations } = generateEducationalData(pattern);
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
            annotations: annotations // Pass annotations
        }
    };
};

export const CURRICULUM: AcademyModule[] = [
    // --- TRACK 1: THE TRADER (Classic Patterns) ---
    {
        id: 'mod_trader_1',
        track: LearningTrack.TRADER,
        title: 'Technical Patterns I',
        description: 'Master the visual language of the market.',
        icon: 'candlestick_chart',
        color: 'from-blue-600 to-cyan-500',
        orderIndex: 0,
        isLockedByDefault: false,
        difficultyTier: 'Beginner',
        tags: ['Pattern Recognition', 'Basics'],
        lessons: [
            makeLesson('l_t1_1', 'mod_trader_1', 'The Hammer', 'A small body with a long lower wick found at the bottom of a downtrend. It shows buyers absorbing selling pressure.', 'Price dropped hard but closed near the open. Bullish or Bearish?', 'Bearish', 'Bullish', 'RIGHT', 'Bullish. The long tail shows rejection of lower prices.', PatternType.HAMMER, 0),
            makeLesson('l_t1_2', 'mod_trader_1', 'Shooting Star', 'The opposite of a Hammer. Found at the top of an uptrend with a long upper wick. Buyers tried to push up but failed.', 'Rally hit resistance and left a long wick up. Action?', 'Short', 'Long', 'LEFT', 'Short. The rejection of highs signals a reversal.', PatternType.SHOOTING_STAR, 1),
            makeLesson('l_t1_3', 'mod_trader_1', 'Bull Flag', 'A sharp rally (pole) followed by a gentle downward channel. It is a pause before the next leg up.', 'Strong move up, now drifting down slowly on low volume. Trade?', 'Sell', 'Buy', 'RIGHT', 'Buy the breakout. The trend is your friend.', PatternType.BULL_FLAG, 2),
            makeLesson('l_t1_4', 'mod_trader_1', 'Double Bottom', 'Price hits the same support level twice, forming a "W". It signals that the floor is solid.', 'Price bounced off $100 twice. Is this support strong?', 'No', 'Yes', 'RIGHT', 'Yes. A double test confirms the support level.', PatternType.DOUBLE_BOTTOM, 3),
            makeLesson('l_t1_5', 'mod_trader_1', 'Head & Shoulders', 'A higher peak (Head) between two lower peaks (Shoulders). The classic trend killer.', 'The middle peak is the highest. The trend is exhausting. Direction?', 'Down', 'Up', 'LEFT', 'Down. This is a major reversal pattern.', PatternType.HEAD_AND_SHOULDERS, 4),
            makeLesson('l_t1_6', 'mod_trader_1', 'Cup & Handle', 'A rounded bottom followed by a small dip. Sellers are done, buyers are reloading.', 'Chart looks like a tea cup. The handle is forming. Bullish?', 'Yes', 'No', 'LEFT', 'Yes. It is a powerful continuation pattern.', PatternType.CUP_AND_HANDLE, 5),
            makeLesson('l_t1_7', 'mod_trader_1', 'Rising Wedge', 'Highs are higher, but lows are catching up faster. The range is tightening up.', 'Price is squeezing up into a point. What usually happens?', 'Breakdown', 'Breakout', 'LEFT', 'Breakdown. Buyers are running out of steam.', PatternType.RISING_WEDGE, 6),
            makeLesson('l_t1_8', 'mod_trader_1', 'Gap Up', 'Price opens significantly higher than yesterday close. Institutional momentum is in play.', 'Market gapped up 2% at the open. Do we fade or follow?', 'Fade', 'Follow', 'RIGHT', 'Follow. "Gap and Go" is a strong momentum strategy.', PatternType.GAP_UP, 7),
            makeLesson('l_t1_9', 'mod_trader_1', 'Morning Star', '3-candle bottom: Big Red, Small Doji, Big Green. The sun is rising.', 'A confused doji appeared after a crash, then a big green candle. Buy?', 'Yes', 'No', 'LEFT', 'Yes. The 3-candle sequence confirms the turn.', PatternType.MORNING_STAR, 8),
            makeLesson('l_t1_10', 'mod_trader_1', 'Dead Cat Bounce', 'A small rally after a massive crash. Do not be fooled, it is usually a trap.', 'Market crashed 20% then rallied 2%. Safe to buy?', 'Yes', 'No', 'RIGHT', 'No. Wait for a real base to form.', PatternType.DEAD_CAT_BOUNCE, 9),
        ]
    },
    // --- TRADER TRACK: MASTERY ---
    {
        id: 'mod_trader_2',
        track: LearningTrack.TRADER,
        title: 'Advanced Candles',
        description: 'Rare but powerful reversal signals.',
        icon: 'workspace_premium',
        color: 'from-cyan-500 to-blue-700',
        orderIndex: 1,
        isLockedByDefault: true,
        difficultyTier: 'Intermediate',
        tags: ['Advanced', 'Reversals'],
        lessons: [
            makeLesson('l_t2_1', 'mod_trader_2', 'Three Line Strike', 'A massive reversal. Three bearish candles are completely erased by one giant bullish candle.', 'Three red candles down, then one huge green candle erased them all. Buy?', 'Yes', 'No', 'LEFT', 'Yes. This is one of the highest win-rate patterns statistically.', PatternType.THREE_LINE_STRIKE, 0),
            makeLesson('l_t2_2', 'mod_trader_2', 'Abandoned Baby', 'A Doji completely gapped away from the candles before and after it. A distinct island.', 'A Doji is floating alone at the bottom with gaps on both sides. Reversal?', 'Yes', 'No', 'LEFT', 'Yes. The "Baby" is abandoned, signaling a major trend change.', PatternType.ABANDONED_BABY, 1),
            makeLesson('l_t2_3', 'mod_trader_2', 'Kicker Pattern', 'Price gaps sharply in the opposite direction of the trend and never looks back.', 'Price gapped up and opened above the previous day high. Bullish?', 'Yes', 'No', 'LEFT', 'Yes. The Kicker is an explosive momentum signal.', PatternType.KICKER_PATTERN, 2),
            makeLesson('l_t2_4', 'mod_trader_2', 'Triple Top', 'Like a double top, but tested three times. The ceiling is concrete.', 'Price hit resistance three times and failed. What next?', 'Breakout', 'Drop', 'RIGHT', 'Drop. Three strikes and you are out.', PatternType.TRIPLE_TOP, 3),
            makeLesson('l_t2_5', 'mod_trader_2', 'Mat Hold', 'A strong green candle, a small pullback that stays in the top half, then another boom.', 'Price rallied, paused slightly, then broke out again. Valid?', 'Yes', 'No', 'LEFT', 'Yes. Mat Hold is a strong continuation signal.', PatternType.MAT_HOLD, 4),
        ]
    },

    // --- TRACK 2: THE STRATEGIST (SMC / Institutional) ---
    {
        id: 'mod_strat_1',
        track: LearningTrack.STRATEGIST,
        title: 'Institutional SMC',
        description: 'Think like a bank. Hunt liquidity.',
        icon: 'account_balance',
        color: 'from-purple-600 to-indigo-500',
        orderIndex: 0,
        isLockedByDefault: false,
        difficultyTier: 'Advanced',
        tags: ['Smart Money', 'Liquidity'],
        lessons: [
            makeLesson('l_s1_1', 'mod_strat_1', 'Breaker Block', 'When a support breaks, it becomes a "Breaker". Price often returns to test it as resistance.', 'Support broke violently. Price is rallying back to it. Short?', 'Yes', 'No', 'LEFT', 'Yes. The old floor is now a brick ceiling.', PatternType.BREAKER_BLOCK, 0),
            makeLesson('l_s1_2', 'mod_strat_1', 'Power of 3 (AMD)', 'Accumulation, Manipulation, Distribution. The fake move happens before the real move.', 'Market was flat, then dropped fast, now reversing. Was the drop real?', 'Yes', 'No', 'RIGHT', 'No. It was manipulation to trap sellers.', PatternType.AMD_SETUP, 1),
            makeLesson('l_s1_3', 'mod_strat_1', 'Midnight Open', 'The NY Midnight price is an institutional anchor. Algorithms use it to reset valuation.', 'Price is way below the midnight opening price. Bias?', 'Bearish', 'Bullish', 'RIGHT', 'Bullish. Algos often revert price to the mean (Open).', PatternType.MIDNIGHT_OPEN, 2),
            makeLesson('l_s1_4', 'mod_strat_1', 'Asian Sweep', 'London session often sweeps the highs/lows of the quiet Asian session to grab stops.', 'London open just spiked above the Asian high. Breakout?', 'Fakeout', 'Real', 'LEFT', 'Likely a fakeout (Sweep) to grab liquidity before dropping.', PatternType.ASIAN_SWEEP, 3),
            makeLesson('l_s1_5', 'mod_strat_1', 'Mitigation Block', 'A failed lower low. Price respects the last down-move candle to "mitigate" losses.', 'Price held the last down candle without making a new low. Long?', 'Yes', 'No', 'LEFT', 'Yes. This is a Mitigation Block holding price up.', PatternType.MITIGATION_BLOCK, 4),
            makeLesson('l_s1_6', 'mod_strat_1', 'OTE (Optimal Trade Entry)', 'Fibonacci retracement levels 0.62 to 0.79. This is the "Discount" zone for banks.', 'Price retraced 70% of the rally. Is this a buy zone?', 'Yes', 'No', 'LEFT', 'Yes. OTE is the sweet spot for risk/reward.', PatternType.OTE_FIB, 5),
            makeLesson('l_s1_7', 'mod_strat_1', 'Swing Failure (SFP)', 'Price wicks below a key low but closes above it. Stops were hunted, but sellers failed.', 'We made a new low but closed back inside the range. Bearish?', 'Yes', 'No', 'RIGHT', 'No. This is the Swing Failure Pattern.', PatternType.SFP_BOTTOM, 6),
            makeLesson('l_s1_8', 'mod_strat_1', 'Order Block', 'The last contrary candle before a violent move. Banks have pending orders here.', 'Price is returning to the origin of the rally. Buy?', 'Yes', 'No', 'LEFT', 'Yes. The Order Block often defends price.', PatternType.ORDER_BLOCK_BULL, 7),
            makeLesson('l_s1_9', 'mod_strat_1', 'Wyckoff Spring', 'A final shakeout below support to transfer assets from weak hands to strong hands.', 'Price dipped below support then rallied hard. Is support broken?', 'No', 'Yes', 'LEFT', 'No. It was a Spring. A major bullish sign.', PatternType.WYCKOFF_SPRING, 8),
            makeLesson('l_s1_10', 'mod_strat_1', 'CHoCH', 'Change of Character. The first time price breaks structure against the trend.', 'Downtrending market just made a higher high. Is trend over?', 'Yes', 'No', 'LEFT', 'Yes. Character has changed (CHoCH). Look for longs.', PatternType.CHOCH_BULL, 9),
        ]
    },

    // --- TRACK 2: HARMONICS (NEW) ---
    {
        id: 'mod_strat_2',
        track: LearningTrack.STRATEGIST,
        title: 'Harmonic Geometry',
        description: 'Advanced patterns using Fibonacci ratios.',
        icon: 'polyline',
        color: 'from-indigo-600 to-purple-500',
        orderIndex: 1,
        isLockedByDefault: true,
        difficultyTier: 'Advanced',
        tags: ['Harmonics', 'Fibonacci'],
        lessons: [
            makeLesson('l_s2_1', 'mod_strat_2', 'Gartley Pattern', 'The classic "M" shape retracement. Point B touches 0.618.', 'Price formed an "M" shape. The B point is exactly 61.8%. Buy at D?', 'Yes', 'No', 'LEFT', 'Yes. This is a classic Gartley reversal.', PatternType.GARTLEY, 0),
            makeLesson('l_s2_2', 'mod_strat_2', 'Butterfly Pattern', 'An extension pattern. Point D goes beyond X. Reverses at 1.27.', 'Price broke the low of X but stalled at 1.27 extension. Reversal?', 'Yes', 'No', 'LEFT', 'Yes. The Butterfly catches bottoms below the low.', PatternType.BUTTERFLY, 1),
            makeLesson('l_s2_3', 'mod_strat_2', 'Bat Pattern', 'A deep retrace. Point B is less than 0.50, but D goes to 0.886.', 'The pullback was deep, almost to the low. Reversal at 88.6%?', 'Yes', 'No', 'LEFT', 'Yes. The Bat is a high precision pattern.', PatternType.BAT, 2),
        ]
    },

    // --- TRACK 3: THE QUANT (Data / Indicators) ---
    {
        id: 'mod_quant_1',
        track: LearningTrack.QUANT,
        title: 'Quantitative Edge',
        description: 'Math, Data, and Probability.',
        icon: 'calculate',
        color: 'from-pink-600 to-rose-500',
        orderIndex: 0,
        isLockedByDefault: false,
        difficultyTier: 'Pro',
        tags: ['Algos', 'Statistics'],
        lessons: [
             makeLesson('l_q1_1', 'mod_quant_1', 'VWAP Extension', 'Volume Weighted Average Price. If price is 2+ deviations away, it is statistically overextended.', 'Price is 3 standard deviations above VWAP. Probability of reversion?', 'High', 'Low', 'LEFT', 'High. Price works like a rubber band around VWAP.', PatternType.VWAP_EXTENSION, 0),
             makeLesson('l_q1_2', 'mod_quant_1', 'ATR Trailing Stop', 'Average True Range measures volatility. If price closes past 2x ATR, the trend is mathematically broken.', 'Price closed below the ATR trailing dot. Signal?', 'Exit', 'Hold', 'LEFT', 'Exit. The trend structure has statistically failed.', PatternType.ATR_BREAK, 1),
             makeLesson('l_q1_3', 'mod_quant_1', 'Volume Profile (POC)', 'Point of Control. The price level with the most volume. It acts as a gravity well.', 'Price is falling into a high volume node. Will it stop?', 'Yes', 'No', 'LEFT', 'Likely. High volume areas act as strong support.', PatternType.POC_BOUNCE, 2),
             makeLesson('l_q1_4', 'mod_quant_1', 'RSI Divergence', 'Price makes a higher high, but RSI makes a lower high. Momentum is dying silently.', 'Chart made a new high, but the oscillator did not. Meaning?', 'Reversal', 'Continuation', 'LEFT', 'Reversal. This is Bearish Divergence.', PatternType.RSI_DIVERGENCE, 3),
             makeLesson('l_q1_5', 'mod_quant_1', 'Bollinger Squeeze', 'Volatility cycles from expansion to contraction. A tight squeeze predicts a massive move.', 'Bollinger bands are super tight and flat. What is coming?', 'Explosion', 'Nothing', 'LEFT', 'A volatility explosion. Get ready.', PatternType.BOLLINGER_SQUEEZE, 4),
             makeLesson('l_q1_6', 'mod_quant_1', 'Golden Cross', 'The 50-day SMA crosses above the 200-day SMA. A long-term buy signal for funds.', 'Short term average just crossed above long term average. Outlook?', 'Bullish', 'Bearish', 'LEFT', 'Bullish. This triggers institutional buying algos.', PatternType.GOLDEN_CROSS, 5),
             makeLesson('l_q1_7', 'mod_quant_1', 'Stochastic Cross', 'Momentum oscillator. Crossing down from above 80 signals overbought conditions.', 'Stochastics are at 90 and crossing down. Signal?', 'Sell', 'Buy', 'LEFT', 'Sell. The momentum is maxed out.', PatternType.STOCH_CROSS_DOWN, 6),
             makeLesson('l_q1_8', 'mod_quant_1', 'Ichimoku Break', 'The Cloud represents equilibrium. Breaking through it signals a regime change.', 'Price just blasted through the Ichimoku Cloud. Trend?', 'New Trend', 'Range', 'LEFT', 'New Trend. Cloud breaks are significant structure shifts.', PatternType.ICHIMOKU_BREAK, 7),
             makeLesson('l_q1_9', 'mod_quant_1', 'ADX Low', 'ADX measures trend strength. Below 20 means "Chop". Do not use trend strategies here.', 'ADX is at 15. Should we use a trend-following bot?', 'No', 'Yes', 'LEFT', 'No. Use mean-reversion in low ADX environments.', PatternType.ADX_LOW, 8),
             makeLesson('l_q1_10', 'mod_quant_1', 'Keltner Break', 'Similar to Bollinger Bands but uses ATR. Closing outside the channel signals an extreme outlier.', 'Price closed outside the Keltner Channel. Is this normal?', 'No', 'Yes', 'LEFT', 'No. It is a statistical anomaly. Expect a reaction.', PatternType.KELTNER_BREAK, 9),
        ]
    }
];
