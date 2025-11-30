
import React from 'react';
import { UserProfile, UserStats, LearningStyle } from '../types';
import { BackendService } from '../services/backendService';

interface ProfileProps {
    profile: UserProfile;
    stats: UserStats;
    onLogout: () => void;
    onUpdateStyle: (style: LearningStyle) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, stats, onLogout, onUpdateStyle }) => {
    // Generate Avatar Initials
    const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'TR';
    
    // Calculate Level
    const level = Math.floor(stats.xp / 1000) + 1;
    const progressToNext = (stats.xp % 1000) / 1000 * 100;

    return (
        <div className="flex flex-col items-center px-4 pt-24 pb-32 min-h-screen w-full animate-fade-in-up">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-blue-500 mb-8">
                OPERATIVE STATUS
            </h2>

            {/* Profile Card */}
            <div className="w-full max-w-md bg-[#161b22] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-neon-green/10 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col items-center -mt-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-800 to-black border-4 border-[#161b22] flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4">
                        {initials}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
                    <p className="text-neon-green font-mono text-xs uppercase tracking-widest mb-6">Level {level} Trader</p>

                    {/* XP Progress */}
                    <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-white/5 mb-2">
                        <div className="h-full bg-neon-green shadow-[0_0_10px_#00FF94]" style={{ width: `${progressToNext}%` }}></div>
                    </div>
                    <div className="w-full flex justify-between text-[10px] text-gray-500 font-mono mb-8">
                        <span>{stats.xp % 1000} XP</span>
                        <span>1000 XP</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 w-full mb-8">
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/5">
                            <span className="text-2xl mb-1">🔥</span>
                            <span className="font-bold text-white">{stats.streak}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Streak</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/5">
                            <span className="text-2xl mb-1">💰</span>
                            <span className="font-bold text-white">${(stats.balance / 1000).toFixed(1)}k</span>
                            <span className="text-[10px] text-gray-400 uppercase">Balance</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/5">
                            <span className="text-2xl mb-1">📖</span>
                            <span className="font-bold text-white">{stats.unlockedPatterns.length}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Patterns</span>
                        </div>
                    </div>

                    {/* Persona / Onboarding Data */}
                    <div className="w-full bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Trader Persona</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-500 text-[10px]">Experience</div>
                                <div className="text-white font-bold">{profile.experience}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-[10px]">Goal</div>
                                <div className="text-white font-bold">{profile.goal?.replace('_', ' ')}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-[10px]">Risk Tolerance</div>
                                <div className={`font-bold ${profile.risk === 'HIGH' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {profile.risk}
                                </div>
                            </div>
                             <div>
                                <div className="text-gray-500 text-[10px]">Style</div>
                                <div className="text-white font-bold">{profile.learningStyle}</div>
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="w-full space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Neural Link (Learning Style)</h4>
                        <div className="flex gap-2 p-1 bg-black rounded-xl border border-white/10">
                            {[LearningStyle.VISUAL, LearningStyle.AUDITORY, LearningStyle.KINESTHETIC].map(style => (
                                <button
                                    key={style}
                                    onClick={() => onUpdateStyle(style)}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                                        profile.learningStyle === style 
                                        ? 'bg-neon-green text-black shadow-lg' 
                                        : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {style.substring(0, 4)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="mt-8 w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
