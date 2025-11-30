
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChartCard from './components/ChartCard';
import Grimoire from './components/Grimoire';
import Store from './components/Store'; // NEW STORE
import LearningPath from './components/LearningPath';
import HomeDashboard from './components/HomeDashboard';
import Community from './components/Community';
import Analyze from './components/Analyze';
import Profile from './components/Profile';
import QuantHub from './components/QuantHub';
import FinLitCard from './components/FinLitCard';
import ChatAssistant from './components/ChatAssistant';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import ModuleCompleteModal from './components/ModuleCompleteModal';
import LandingPage from './components/LandingPage';
import { 
    UserStats, ChartScenario, TradeAction, PatternType, AppView, 
    AcademyLesson, LearningTrack, AuthView, UserProfile, OnboardingData, LearningStyle, AcademyModule, ChartSkin
} from './types';
import { generateScenario } from './services/marketEngine';
import { getGuruWisdom, generatePersonalizedPath } from './services/geminiService';
import { BackendService, DEFAULT_STATS } from './services/backendService';
import { SoundService } from './services/soundService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // --- STATE ---
  const [authView, setAuthView] = useState<AuthView>(AuthView.LOGIN);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [scenario, setScenario] = useState<ChartScenario | null>(null);
  
  const [allModules, setAllModules] = useState<AcademyModule[]>([]);
  const [currentModule, setCurrentModule] = useState<AcademyModule | null>(null);
  const [currentLesson, setCurrentLesson] = useState<AcademyLesson | null>(null);
  
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [guruMsg, setGuruMsg] = useState<string>("");
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false); // STORE STATE
  const [isJackpot, setIsJackpot] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);

  // --- INIT & AUTH CHECK ---
  useEffect(() => {
     const checkSession = async () => {
         try {
             const modules = await BackendService.fetchModulesWithLessons();
             setAllModules(modules);

             const { data: { session }, error: sessionError } = await supabase.auth.getSession();
             
             if (sessionError || !session || !session.user) {
                 setShowLanding(true);
                 setAuthView(AuthView.LOGIN);
                 setIsLoadingAuth(false);
                 return;
             }

             setShowLanding(false);
             const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
             const loadedStats = await BackendService.loadStats(session.user.id);
             
             if (profileData) {
                 const profile: UserProfile = {
                     id: profileData.id,
                     email: profileData.email,
                     name: profileData.name || 'Trader',
                     isOnboardingComplete: profileData.is_onboarding_complete,
                     learningStyle: (profileData.learning_style as LearningStyle) || LearningStyle.VISUAL,
                     experience: profileData.experience || 'NOVICE',
                     goal: profileData.goal || 'DAY_TRADING',
                     risk: profileData.risk || 'LOW'
                 };
                 setUserProfile(profile);
                 setStats(loadedStats);
                 setIsDataLoaded(true);
                 setAuthView(profile.isOnboardingComplete ? AuthView.APP : AuthView.ONBOARDING);
             } else {
                 setAuthView(AuthView.LOGIN);
             }
         } catch (err) {
             console.error("Critical Auth Error:", err);
             setAuthView(AuthView.LOGIN);
             setShowLanding(true);
         } finally {
             setIsLoadingAuth(false);
         }
     };
     checkSession();
  }, []);

  // --- AUTO SAVE ---
  useEffect(() => {
      if (authView === AuthView.APP && userProfile && isDataLoaded) {
          BackendService.saveStats(userProfile.id, stats);
      }
  }, [stats, authView, userProfile, isDataLoaded]);

  // --- INSTAGRAM SWIPE NAVIGATION ---
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (currentView === AppView.PLAY && !showResult) return; // Disable swipe during active trade
      
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStartRef.current - touchEnd;
      const threshold = 75;

      if (Math.abs(diff) > threshold) {
          const views = [AppView.HOME, AppView.LEARN, AppView.PLAY, AppView.COMMUNITY, AppView.PROFILE];
          const currentIndex = views.indexOf(currentView);
          
          if (diff > 0) { // Swipe Left -> Next Tab
              if (currentIndex < views.length - 1) {
                  setCurrentView(views[currentIndex + 1]);
                  SoundService.playClick();
              }
          } else { // Swipe Right -> Prev Tab
              if (currentIndex > 0) {
                  setCurrentView(views[currentIndex - 1]);
                  SoundService.playClick();
              }
          }
      }
  };

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) { alert("Enter email/password"); return; }
      setIsLoadingAuth(true);
      const res = await BackendService.login(email, password); 
      if (res) {
          setUserProfile(res.profile);
          setStats(res.stats);
          setIsDataLoaded(true);
          const modules = await BackendService.fetchModulesWithLessons();
          setAllModules(modules);
          setAuthView(res.profile.isOnboardingComplete ? AuthView.APP : AuthView.ONBOARDING);
          setShowLanding(false);
          SoundService.playUnlock();
      } else { alert("Login failed."); }
      setIsLoadingAuth(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) { alert("Enter email/password"); return; }
      setIsLoadingAuth(true);
      const res = await BackendService.signup(email, password, "Trader");
      if (res) {
          setUserProfile(res.profile);
          setStats(res.stats);
          setIsDataLoaded(true);
          const modules = await BackendService.fetchModulesWithLessons();
          setAllModules(modules);
          setAuthView(AuthView.ONBOARDING);
          setShowLanding(false);
          SoundService.playUnlock();
      } else { alert("Signup failed."); }
      setIsLoadingAuth(false);
  };

  const handleLogout = async () => {
      await BackendService.logout();
      setAuthView(AuthView.LOGIN);
      setUserProfile(null);
      setIsDataLoaded(false);
      setShowLanding(true);
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
      if (!userProfile) return;
      const path = await generatePersonalizedPath(data, allModules);
      const updatedStats = { ...stats, personalizedPath: path };
      const updatedProfile: UserProfile = { 
          ...userProfile, 
          isOnboardingComplete: true,
          learningStyle: data.learningStyle,
          experience: data.experience,
          goal: data.goal,
          risk: data.risk
      };
      setStats(updatedStats);
      setUserProfile(updatedProfile);
      setIsDataLoaded(true);
      await BackendService.updateProfile(updatedProfile);
      await BackendService.saveStats(updatedProfile.id, updatedStats);
      setAuthView(AuthView.APP);
      SoundService.playUnlock();
  };

  const handleUpdateStyle = async (style: LearningStyle) => {
      if (!userProfile) return;
      const updated = { ...userProfile, learningStyle: style };
      setUserProfile(updated);
      await BackendService.updateProfile(updated);
      SoundService.playClick();
  };

  // --- STORE HANDLERS ---
  const handleBuySkin = (skin: ChartSkin, cost: number) => {
      setStats(prev => ({
          ...prev,
          candles: prev.candles - cost,
          ownedSkins: [...(prev.ownedSkins || ['DEFAULT']), skin]
      }));
  };

  const handleEquipSkin = (skin: ChartSkin) => {
      setStats(prev => ({ ...prev, equippedSkin: skin }));
  };

  const handleModuleSelect = (moduleId: string) => {
      const sourceModules = allModules.length > 0 ? allModules : BackendService.getAllModules();
      const module = sourceModules.find(m => m.id === moduleId);
      if (module) {
          setCurrentModule(module);
          setStats(prev => ({ ...prev, currentModuleId: moduleId, currentLessonIndex: 0 }));
          if (module.lessons.length > 0) {
              setCurrentLesson(module.lessons[0]);
              setCurrentView(AppView.FIN_LIT); 
          } else {
              alert("This module has no lessons yet.");
          }
      }
  };

  const handleBreakBond = (moduleId: string) => {
      const COST = 12.5;
      if (stats.candles >= COST) {
          // Deduct candles
          setStats(prev => ({
              ...prev,
              candles: prev.candles - COST,
              completedModules: [...prev.completedModules, moduleId] 
          }));
          SoundService.playUnlock();
          alert("Bond Broken! Module Unlocked.");
      } else {
          SoundService.playLoss();
          alert(`You need ${COST} Candles to break this bond! You have ${stats.candles.toFixed(1)}.`);
      }
  };

  const handleFinLitComplete = async (success: boolean) => {
    if (!currentModule || !currentLesson || !userProfile) return;
    if (success) {
       SoundService.playWin();
       await BackendService.completeLesson(userProfile.id, currentLesson.id);
       const nextIndex = stats.currentLessonIndex + 1;
       
       setStats(prev => ({ ...prev, xp: prev.xp + 10 })); 

       if (nextIndex < currentModule.lessons.length) {
           setStats(prev => ({ ...prev, currentLessonIndex: nextIndex }));
           setCurrentLesson(currentModule.lessons[nextIndex]);
       } else {
           setStats(prev => ({ 
               ...prev, 
               currentLessonIndex: 0, 
               xp: prev.xp + 500, 
               balance: prev.balance + 1000,
               candles: (prev.candles || 0) + 2.5, // AWARD CANDLES
               completedModules: [...(prev.completedModules || []), currentModule.id]
           }));
           setShowModuleComplete(true);
       }
    } else {
      SoundService.playLoss();
    }
  };
  
  const handleCloseModuleModal = () => {
      setShowModuleComplete(false);
      setCurrentView(AppView.LEARN);
  };

  const handleClaimDaily = () => {
      setStats(prev => ({ ...prev, balance: prev.balance + 500 }));
  };

  const handleTrackSelect = (track: LearningTrack) => {
      setStats(prev => ({ ...prev, currentTrack: track, currentModuleId: '', currentLessonIndex: 0 }));
  };

  // --- PLAY LOGIC ---
  useEffect(() => {
    if (currentView === AppView.PLAY && !scenario && authView === AuthView.APP) {
      loadNewScenario();
    }
  }, [currentView, authView]);

  const loadNewScenario = (forcedPattern?: PatternType) => {
    const difficulty = stats.xp > 2000 ? 'Medium' : 'Easy';
    setScenario(generateScenario(difficulty, stats.weakPatterns || [], forcedPattern));
    setShowResult(false);
    setLastResult(null);
    setGuruMsg("");
    setIsJackpot(false);
    setIsAnimating(false);
    if (chartRef.current) chartRef.current.classList.remove('animate-shake');
  };

  // Handle Practice from Grimoire
  const handlePracticePattern = (pattern: PatternType) => {
      loadNewScenario(pattern);
      setCurrentView(AppView.PLAY);
      SoundService.playUnlock();
  };

  const handleTrade = async (action: TradeAction) => {
    if (!scenario || showResult || isAnimating || isGameOver) return;
    setIsAnimating(true);
    setShowResult(true); 

    const startPrice = scenario.future[0].open;
    const endPrice = scenario.future[scenario.future.length - 1].close;
    const percentChange = ((endPrice - startPrice) / startPrice) * 100;
    
    let isWin = false;
    if (action === TradeAction.LONG && percentChange > 0) isWin = true;
    if (action === TradeAction.SHORT && percentChange < 0) isWin = true;

    const jackpotRoll = Math.random() < 0.05;
    const winAmount = jackpotRoll ? 500 : 100;
    const bonus = 50; 
    const xpGain = isWin ? (jackpotRoll ? 250 : 50) : 10;

    setLastResult(isWin ? 'WIN' : 'LOSS');

    if (isWin) {
      if (jackpotRoll) { setIsJackpot(true); SoundService.playJackpot(); } else { SoundService.playWin(); }
      setStats(prev => {
        const newPatterns = [...prev.unlockedPatterns];
        if (scenario.pattern !== PatternType.NONE && !newPatterns.includes(scenario.pattern)) {
           newPatterns.push(scenario.pattern);
           SoundService.playUnlock(); 
        }
        let newWeakPatterns = prev.weakPatterns || [];
        if (scenario.isReview) newWeakPatterns = newWeakPatterns.filter(p => p !== scenario.pattern);
        return {
          ...prev,
          balance: prev.balance + winAmount + bonus,
          xp: prev.xp + xpGain,
          streak: prev.streak + 1,
          unlockedPatterns: newPatterns,
          weakPatterns: newWeakPatterns
        };
      });
    } else {
      SoundService.playLoss();
      setStats(prev => {
        const currentWeak = prev.weakPatterns || [];
        const updatedWeak = !currentWeak.includes(scenario.pattern) && scenario.pattern !== PatternType.NONE ? [...currentWeak, scenario.pattern] : currentWeak;
        return {
            ...prev,
            balance: prev.balance - 50,
            hearts: Math.max(0, prev.hearts - 1),
            streak: 0,
            weakPatterns: updatedWeak
        }
      });
      if (chartRef.current) chartRef.current.classList.add('animate-shake');
    }
    const tip = await getGuruWisdom(scenario.pattern, action, isWin, percentChange);
    setGuruMsg(tip);
    if (!isWin && stats.hearts <= 1) setTimeout(() => setIsGameOver(true), 250);
  };

  const handleTimeout = () => {
    if(showResult || isGameOver) return;
    SoundService.playLoss();
    setStats(prev => ({ ...prev, balance: prev.balance - 20, hearts: Math.max(0, prev.hearts - 1), streak: 0 }));
    if(chartRef.current) chartRef.current.classList.add('animate-shake');
    if (stats.hearts <= 1) setTimeout(() => setIsGameOver(true), 250);
  }

  const handleLearnMore = (pattern: PatternType) => {
    const module = allModules.find(m => m.relatedPatterns?.includes(pattern));
    if (module) {
        setStats(prev => ({ ...prev, currentTrack: module.track, currentModuleId: module.id, currentLessonIndex: 0 }));
        setCurrentView(AppView.LEARN);
        SoundService.playClick();
    } else {
        setCurrentView(AppView.LEARN);
        SoundService.playClick();
    }
  };

  const handleRespawn = () => {
    SoundService.playUnlock();
    setStats(prev => ({ ...prev, hearts: 3, balance: 10000 }));
    setIsGameOver(false);
    loadNewScenario();
  };

  if (isLoadingAuth) {
      return (
          <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute w-[300px] h-[300px] bg-neon-green/20 rounded-full blur-[120px] animate-pulse"></div>
              <h1 className="relative z-10 text-5xl md:text-6xl font-black italic tracking-tighter text-white animate-pulse" style={{ textShadow: '0 0 30px rgba(0,255,148,0.4)' }}>
                  CHART<span className="text-neon-green" style={{ textShadow: '0 0 30px #00FF94' }}>//</span>SWIPE
              </h1>
              <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
          </div>
      );
  }

  if (showLanding) {
      return (
          <LandingPage 
            onGetStarted={() => { setShowLanding(false); setAuthView(AuthView.SIGNUP); SoundService.playClick(); }}
            onLogin={() => { setShowLanding(false); setAuthView(AuthView.LOGIN); SoundService.playClick(); }}
          />
      );
  }

  if (authView === AuthView.LOGIN || authView === AuthView.SIGNUP) {
      return (
          <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              
              <button onClick={() => setShowLanding(true)} className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center gap-1">
                  <span className="material-symbols-rounded">arrow_back</span> Back
              </button>

              <div className="z-10 w-full max-w-sm glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl animate-pop">
                  <h1 className="text-4xl font-black italic text-center mb-8 tracking-tighter">CHART<span className="text-neon-green">//</span>SWIPE</h1>
                  <form onSubmit={authView === AuthView.LOGIN ? handleLogin : handleSignup} className="space-y-4">
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-[#0E1117] border border-white/10 rounded-xl p-4 text-white focus:border-neon-green outline-none transition-all" required />
                      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-[#0E1117] border border-white/10 rounded-xl p-4 text-white focus:border-neon-green outline-none transition-all" required />
                      
                      <button type="submit" className="w-full bg-neon-green text-black font-bold rounded-xl p-4 mt-4 shadow-[0_0_15px_rgba(0,255,148,0.3)] hover:scale-[1.02] transition-transform">
                          {authView === AuthView.LOGIN ? 'LOGIN' : 'CREATE ACCOUNT'}
                      </button>
                      
                      <div className="flex justify-center mt-4">
                          <button 
                            type="button" 
                            onClick={() => setAuthView(authView === AuthView.LOGIN ? AuthView.SIGNUP : AuthView.LOGIN)} 
                            className="text-sm text-gray-400 hover:text-white"
                          >
                            {authView === AuthView.LOGIN ? 'Need an account? Sign up' : 'Have an account? Login'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  if (authView === AuthView.ONBOARDING) return <Onboarding onComplete={handleOnboardingComplete} />;

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
            <HomeDashboard 
                stats={stats} 
                profile={userProfile!} 
                onNavigate={setCurrentView}
                onOpenGrimoire={() => setIsGrimoireOpen(true)}
                onOpenStore={() => setIsStoreOpen(true)}
            />
        );
      case AppView.LEARN: 
        return (
            <LearningPath 
                stats={stats} 
                onChangeView={setCurrentView} 
                onSelectTrack={handleTrackSelect} 
                onSelectModule={handleModuleSelect}
                onBreakBond={handleBreakBond}
            />
        );
      case AppView.COMMUNITY: 
        return <Community myStats={stats} />;
      case AppView.ANALYZE: 
        return <Analyze />;
      case AppView.PROFILE: 
        return <Profile profile={userProfile!} stats={stats} onLogout={handleLogout} onUpdateStyle={handleUpdateStyle} />;
      case AppView.QUANT:
        return <QuantHub />; 
      case AppView.FIN_LIT:
        if (!currentLesson) return <div className="text-center mt-40 text-gray-400 font-mono">LOADING LESSON...</div>;
        return <div className="flex flex-col items-center justify-center px-4 pt-20 pb-32 w-full h-full">
            <FinLitCard 
                lesson={currentLesson} 
                onComplete={handleFinLitComplete} 
                learningStyle={userProfile?.learningStyle}
                skin={stats.equippedSkin} // PASS SKIN HERE
            />
        </div>;
      case AppView.PLAY:
        if (!scenario) return <div className="text-white text-center mt-40">SEARCHING...</div>;
        return (
          <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto relative px-4 pt-12">
            <div className="absolute top-14 left-0 right-0 flex justify-center opacity-30 pointer-events-none z-0">
               <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">CHART<span className="text-neon-green/30">//</span>SWIPE</h1>
            </div>
            {isJackpot && <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none text-6xl animate-bounce neon-text">💎 JACKPOT! 💎</div>}
            
            <ChartCard 
                scenario={scenario} 
                showResult={showResult} 
                chartRef={chartRef} 
                onVote={handleTrade} 
                onTimeout={handleTimeout}
                learningStyle={userProfile?.learningStyle || LearningStyle.VISUAL}
                skin={stats.equippedSkin} 
            />

            {/* FLOATING RESULT SHEET */}
            {showResult && (
                <div className="fixed bottom-[88px] left-0 right-0 z-50 px-4 pb-2 animate-fade-in-up">
                    <div className="bg-[#161b22]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden max-w-md mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                        
                        {/* Header: Result */}
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div>
                                <h2 className={`text-2xl font-black italic ${lastResult === 'WIN' ? 'text-neon-green' : 'text-neon-pink'}`}>
                                    {lastResult === 'WIN' ? 'PROFIT SECURED' : 'LIQUIDATED'}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                        {scenario?.pattern}
                                    </span>
                                    {scenario?.pattern !== PatternType.NONE && (
                                        <button onClick={() => handleLearnMore(scenario!.pattern)} className="text-[10px] text-blue-400 font-bold hover:text-white transition-colors flex items-center gap-0.5">
                                            LEARN <span className="material-symbols-rounded text-xs">arrow_forward</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5 max-h-[140px] overflow-y-auto relative z-10">
                            <div className="flex items-center gap-2 mb-2 opacity-70">
                                <span className="material-symbols-rounded text-neon-green text-xs">auto_awesome</span>
                                <span className="text-[10px] font-bold text-neon-green uppercase tracking-widest">Intelligence Report</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                {guruMsg || "Analyzing market data..."}
                            </p>
                        </div>

                        {/* Next Button */}
                        <button 
                            onClick={() => { SoundService.playClick(); loadNewScenario(); }} 
                            className="w-full h-14 rounded-2xl bg-white text-black font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all relative z-10"
                        >
                            NEXT TRADE ➔
                        </button>
                    </div>
                </div>
            )}
            
          </div>
        );
    }
  };

  return (
    <div 
      className="h-[100dvh] bg-[#050505] font-sans text-white flex flex-col relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-blob"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <Header stats={stats} currentView={currentView} onOpenGrimoire={() => setIsGrimoireOpen(true)} />
      
      <main className="relative z-10 flex-1 overflow-y-auto hide-scrollbar pb-24">
        {renderContent()}
      </main>

      {(currentView === AppView.PLAY) && (
         <div className="pointer-events-auto relative z-40">
            <div className="fixed bottom-24 left-4">
                <ChatAssistant scenario={scenario} />
            </div>
         </div>
      )}

      <Navigation currentView={currentView} onChange={(view) => { SoundService.playClick(); setCurrentView(view); }} />
      
      {/* Modals & Overlays */}
      {isGameOver && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-pop">
          <h1 className="text-6xl font-black text-neon-pink mb-2">LIQUIDATED</h1>
          <button onClick={handleRespawn} className="px-8 py-4 bg-neon-green text-black font-bold text-xl rounded-full mt-8">INSERT COIN 🪙</button>
        </div>
      )}

      {showModuleComplete && (
          <ModuleCompleteModal 
            xp={500} 
            money={1000} 
            onClose={handleCloseModuleModal} 
          />
      )}

      <Grimoire 
          isOpen={isGrimoireOpen} 
          onClose={() => setIsGrimoireOpen(false)} 
          unlockedPatterns={stats.unlockedPatterns} 
          xp={stats.xp}
          completedModules={stats.completedModules}
          onClaimDaily={handleClaimDaily}
          onPractice={handlePracticePattern}
      />

      <Store 
          isOpen={isStoreOpen}
          onClose={() => setIsStoreOpen(false)}
          candles={stats.candles}
          ownedSkins={stats.ownedSkins}
          equippedSkin={stats.equippedSkin}
          onBuySkin={handleBuySkin}
          onEquipSkin={handleEquipSkin}
      />
    </div>
  );
};

export default App;
