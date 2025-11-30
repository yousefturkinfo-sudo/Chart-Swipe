
import { AcademyModule, UserStats, UserProfile, LearningTrack, LearningStyle, UserProgress, AcademyLesson, ChartSkin } from '../types';
import { supabase } from './supabaseClient';
import { CURRICULUM } from './curriculumData';

// --- DEFAULT STATS ---
export const DEFAULT_STATS: UserStats = {
  balance: 10000,
  hearts: 3,
  candles: 0, 
  xp: 0,
  streak: 0,
  unlockedPatterns: [],
  weakPatterns: [],
  currentTrack: LearningTrack.TRADER,
  currentModuleId: '',
  currentLessonIndex: 0,
  personalizedPath: [],
  completedModules: [],
  ownedSkins: ['DEFAULT'],
  equippedSkin: 'DEFAULT'
};

// --- HELPER: MAP DB TO APP TYPES ---
const mapStatsFromDB = (dbStats: any): UserStats => {
    if (!dbStats) return DEFAULT_STATS;
    
    // Safely parse JSON or array fields
    const ownedSkins: ChartSkin[] = Array.isArray(dbStats.owned_skins) ? dbStats.owned_skins : ['DEFAULT'];
    const equippedSkin: ChartSkin = dbStats.equipped_skin || 'DEFAULT';

    return {
        balance: dbStats.balance ?? DEFAULT_STATS.balance,
        hearts: dbStats.hearts ?? DEFAULT_STATS.hearts,
        candles: dbStats.candles ?? DEFAULT_STATS.candles,
        xp: dbStats.xp ?? DEFAULT_STATS.xp,
        streak: dbStats.streak ?? DEFAULT_STATS.streak,
        unlockedPatterns: dbStats.unlocked_patterns ?? [],
        weakPatterns: dbStats.weak_patterns ?? [],
        currentTrack: (dbStats.current_track as LearningTrack) || LearningTrack.TRADER,
        currentModuleId: '', 
        currentLessonIndex: 0,
        personalizedPath: [],
        completedModules: dbStats.completed_modules ?? [],
        ownedSkins,
        equippedSkin
    };
};

const mapProfileFromDB = (dbProfile: any): UserProfile => {
    return {
        id: dbProfile.id,
        email: dbProfile.email,
        name: dbProfile.name || 'Trader',
        isOnboardingComplete: dbProfile.is_onboarding_complete ?? false,
        learningStyle: (dbProfile.learning_style as LearningStyle) || LearningStyle.VISUAL,
        experience: dbProfile.experience || 'NOVICE',
        goal: dbProfile.goal || 'DAY_TRADING',
        risk: dbProfile.risk || 'LOW'
    };
};

// --- HELPER: LOCAL STORAGE FALLBACK ---
const getLocal = (key: string) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch { return null; }
};

const setLocal = (key: string, data: any) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export const BackendService = {
  
  // --- AUTHENTICATION ---
  login: async (email: string, pass: string): Promise<{ profile: UserProfile, stats: UserStats } | null> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error || !data.user) {
            console.error("Supabase Login Error:", error?.message);
            return null;
        }

        // 1. Try Fetch Profile
        let profileData = null;
        const { data: dbProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
             console.warn("DB Profile fetch failed (using fallback/default).", profileError.message);
             profileData = getLocal(`profile_${data.user.id}`);
        } else {
             profileData = dbProfile;
        }

        if (!profileData) {
            profileData = {
                id: data.user.id,
                email: email,
                name: 'Trader',
                is_onboarding_complete: false,
                learning_style: 'VISUAL',
                experience: 'NOVICE',
                goal: 'DAY_TRADING',
                risk: 'LOW'
            };
            await supabase.from('profiles').upsert(profileData);
        }

        // 2. Try Fetch Stats
        let statsData = null;
        const { data: dbStats, error: statsError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

        if (statsError) {
             console.warn("DB Stats fetch failed (using fallback).", statsError.message);
             statsData = getLocal(`stats_${data.user.id}`);
        } else {
             statsData = dbStats;
        }

        if (!statsData) {
            statsData = DEFAULT_STATS;
            await supabase.from('user_stats').upsert({ user_id: data.user.id, ...DEFAULT_STATS });
        }

        return {
            profile: mapProfileFromDB(profileData),
            stats: statsData ? (statsData.balance !== undefined ? mapStatsFromDB(statsData) : statsData) : DEFAULT_STATS
        };

    } catch (e) {
        console.error("Login Exception", e);
        return null;
    }
  },

  signup: async (email: string, pass: string, name: string): Promise<{ profile: UserProfile, stats: UserStats } | null> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { name: name }
            }
        });

        if (error || !data.user) {
            console.error("Signup Error:", error?.message);
            return null;
        }

        const newProfile = {
            id: data.user.id,
            email: email,
            name: name,
            isOnboardingComplete: false,
            learningStyle: LearningStyle.VISUAL,
            experience: 'NOVICE',
            goal: 'DAY_TRADING',
            risk: 'LOW'
        };

        setLocal(`profile_${data.user.id}`, { ...newProfile });
        setLocal(`stats_${data.user.id}`, DEFAULT_STATS);

        await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            name,
            is_onboarding_complete: false,
            learning_style: 'VISUAL',
            experience: 'NOVICE',
            goal: 'DAY_TRADING',
            risk: 'LOW'
        });

        await supabase.from('user_stats').upsert({
            user_id: data.user.id,
            ...DEFAULT_STATS
        });

        return { 
            profile: newProfile as UserProfile, 
            stats: DEFAULT_STATS 
        };

    } catch (e) {
        console.error("Signup Exception", e);
        return null;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // --- DATA PERSISTENCE ---
  loadStats: async (userId: string): Promise<UserStats> => {
      const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();
      
      if (!error && data) {
          return mapStatsFromDB(data);
      }
      return DEFAULT_STATS;
  },

  saveStats: async (userId: string, stats: UserStats) => {
    setLocal(`stats_${userId}`, stats);

    await supabase
        .from('user_stats')
        .upsert({
            user_id: userId,
            balance: stats.balance,
            hearts: stats.hearts,
            candles: stats.candles,
            xp: stats.xp,
            streak: stats.streak,
            unlocked_patterns: stats.unlockedPatterns || [],
            weak_patterns: stats.weakPatterns || [],
            current_track: stats.currentTrack,
            completed_modules: stats.completedModules,
            owned_skins: stats.ownedSkins,
            equipped_skin: stats.equippedSkin
        });
  },

  updateProfile: async (profile: UserProfile) => {
      await supabase
        .from('profiles')
        .upsert({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            is_onboarding_complete: profile.isOnboardingComplete,
            learning_style: profile.learningStyle,
            experience: profile.experience,
            goal: profile.goal,
            risk: profile.risk
        });
  },
  
  getAllModules: (): AcademyModule[] => {
    return CURRICULUM;
  },

  getModulesByIds: (ids: string[]): AcademyModule[] => {
    return CURRICULUM.filter(m => ids.includes(m.id));
  },

  fetchModulesWithLessons: async (): Promise<AcademyModule[]> => {
    // NOTE: We now use the local CURRICULUM file as the master source for content
    // This avoids SQL database seeding issues while keeping completion status live.
    return CURRICULUM;
  },

  fetchUserProgress: async (userId: string): Promise<string[]> => {
      const { data, error } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('status', 'COMPLETED');
          
      if (error || !data) return [];
      return data.map((r: any) => r.lesson_id);
  },

  completeLesson: async (userId: string, lessonId: string) => {
      await supabase
          .from('user_progress')
          .upsert({
              user_id: userId,
              lesson_id: lessonId,
              status: 'COMPLETED',
              completed_at: new Date().toISOString()
          }, { onConflict: 'user_id,lesson_id' });
  }
};
