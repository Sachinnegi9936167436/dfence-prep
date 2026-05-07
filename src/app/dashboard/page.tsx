'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Target, 
  Zap, 
  Award, 
  ChevronRight, 
  MessageSquare,
  Loader2,
  TrendingUp,
  Clock,
  Bell,
  Moon,
  Star,
  BarChart3,
  BrainCircuit,
  FileText,
  Gem
} from 'lucide-react';
import PremiumBadge from '@/components/PremiumBadge';
import Link from 'next/link';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface UserStats {
  name: string;
  email: string;
  score: number;
  quizzesAttempted: number;
  accuracy: number;
  rank: string;
  nextRank: string;
  progress: number;
  streak: number;
  badges: string[];
  fieldReport: string;
  subscriptionStatus: string;
  sectorStats?: { category: string; score: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState<string>('');
  const router = useRouter();

  const handleSubscribePush = async () => {
    setPushStatus('loading');
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
        });

        await fetch('/api/user/push-subscribe', {
          method: 'POST',
          body: JSON.stringify({ subscription }),
          headers: { 'Content-Type': 'application/json' },
        });
        setPushStatus('subscribed');
      } catch (e) {
        console.error(e);
        setPushStatus('error');
      }
    } else {
      setPushStatus('unsupported');
    }
  };

  useEffect(() => {
    fetch('/api/user/stats')
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Accessing Command Center...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-10 pb-20 opacity-0 animate-fade-in-up">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-blue-600 pl-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-heading">Command Center</h1>
          <p className="text-slate-500 font-medium">Tactical performance intelligence for {stats.name || 'Officer Candidate'}.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                 {stats.subscriptionStatus === 'active' && <PremiumBadge size="sm" />}
                 <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Current Status</span>
              </div>
              <span className="text-lg font-black text-blue-600 uppercase tracking-tighter">{stats.rank}</span>
           </div>
           <div className="h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Shield size={32} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Promotion & Progress */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Rank Progress Card */}
          <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Award size={160} />
            </div>
            
            <div className="relative z-10 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 font-heading">Promotion Track</h3>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{stats.nextRank} Target</span>
               </div>
               
               <div className="space-y-2">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tactical Readiness</span>
                     <span className="text-2xl font-black text-slate-900 font-heading">{stats.progress}%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                     <div 
                       className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out shadow-lg shadow-blue-500/30"
                       style={{ width: `${stats.progress}%` }}
                     ></div>
                  </div>
               </div>
               
               <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
                  Advanced promotion metrics are based on your tactical assessment scores and consistency across multi-sector intel feeds.
               </p>
            </div>
          </div>

          {/* AI Field Report */}
          <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] relative overflow-hidden border border-slate-800 shadow-2xl">
             <div className="absolute inset-0 subtle-grid opacity-10"></div>
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-blue-400">
                   <MessageSquare size={20} className="animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-[0.3em] leading-none">AI Intelligence Field Report</span>
                </div>
                <blockquote className="text-lg sm:text-2xl font-medium font-heading leading-snug italic text-slate-200">
                   "{stats.fieldReport}"
                </blockquote>
                 <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Source: Command AI 2.0</span>
                   <button onClick={() => router.push('/daily-quiz')} className="flex items-center gap-2 text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
                      Enter Drill Zone <ChevronRight size={14} />
                   </button>
                </div>
             </div>
          </div>

          {/* Trophy Room Badge Display */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                   <Award size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-heading">Trophy Room</h3>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {stats.badges && stats.badges.length > 0 ? (
                 stats.badges.map((badge, idx) => {
                   let Icon = Award;
                   let colors = "bg-slate-50 text-slate-600";
                   if (badge === 'Sniper Badge') { Icon = Target; colors = "bg-red-50 text-red-600 border-red-100"; }
                   if (badge === 'Night Owl Badge') { Icon = Moon; colors = "bg-indigo-50 text-indigo-600 border-indigo-100"; }
                   if (badge === 'Veteran Badge') { Icon = Star; colors = "bg-yellow-50 text-yellow-600 border-yellow-100"; }
                   
                   return (
                     <div key={idx} className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl border ${colors} shadow-sm group`}>
                        <Icon size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{badge}</span>
                     </div>
                   )
                 })
               ) : (
                 <div className="col-span-full p-8 rounded-2xl border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                   No badges unlocked yet. Complete missions to earn medals.
                 </div>
               )}
             </div>
          </div>

          {/* PREMIUM ONLY: Strategic Analytics */}
          {stats.subscriptionStatus === 'active' ? (
            <div className="glass-panel p-8 rounded-[2.5rem] border border-blue-100 shadow-xl opacity-0 animate-fade-in-up stagger-4">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <BarChart3 size={20} />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 font-heading">Strategic Sector Analysis</h3>
                  </div>
                  <PremiumBadge size="sm" />
               </div>
               
               <div className="space-y-6">
                  {[
                    { cat: 'Defence Intelligence', val: 85, color: 'bg-blue-500' },
                    { cat: 'Geopolitical Relations', val: 62, color: 'bg-indigo-500' },
                    { cat: 'Tactical Drills', val: 94, color: 'bg-emerald-500' },
                    { cat: 'Historical Ops', val: 45, color: 'bg-amber-500' },
                  ].map((sector, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-slate-500">{sector.cat}</span>
                          <span className="text-slate-900">{sector.val}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${sector.color} rounded-full transition-all duration-[1.5s] ease-out`}
                            style={{ width: `${sector.val}%`, transitionDelay: `${i * 150}ms` }}
                          ></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="relative group overflow-hidden p-8 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 text-center opacity-0 animate-fade-in-up stagger-4">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 space-y-4">
                  <Gem className="h-10 w-10 text-slate-300 mx-auto group-hover:scale-110 transition-transform text-premium" />
                  <h3 className="text-lg font-black text-slate-900">Unlock Strategic Intelligence</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">Get detailed performance breakdowns across all 6 sectors with Elite Strategic Analytics.</p>
                  <Link href="/pricing" className="inline-block px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all">
                     View Premium Plans
                  </Link>
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Stats Grid */}
        <div className="space-y-6">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 mb-8 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Bell size={100} />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-lg mb-1 leading-tight">Enable Tactical Alerts</h4>
                <p className="text-blue-100 text-xs mb-4">Never miss a daily drill and lose your streak.</p>
                {pushStatus === 'subscribed' ? (
                  <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-[#25D366] bg-white/10 px-4 py-2 rounded-xl">Alerts Active ✓</span>
                ) : pushStatus === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <button onClick={handleSubscribePush} className="w-full bg-white text-blue-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition active:scale-95 shadow-md">
                    Allow Notifications
                  </button>
                )}
              </div>
           </div>

           <div className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-4 border-l-4 border-slate-200">Personnel Dossier</div>
           
           <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
                 <Target size={24} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Score</div>
                 <div className="text-2xl font-black text-slate-900 font-heading">{stats.score}</div>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                 <Zap size={24} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drills Completed</div>
                 <div className="text-2xl font-black text-slate-900 font-heading">{stats.quizzesAttempted}</div>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                 <TrendingUp size={24} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Accuracy</div>
                 <div className="text-2xl font-black text-slate-900 font-heading">{stats.accuracy}%</div>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center transition-colors group-hover:bg-orange-600 group-hover:text-white">
                 <span className="text-2xl">🔥</span>
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</div>
                 <div className="text-2xl font-black text-slate-900 font-heading">{stats.streak} Days</div>
              </div>
           </div>

           {/* PREMIUM ONLY: Elite Action Center */}
           {stats.subscriptionStatus === 'active' && (
             <div className="space-y-4 pt-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-4 border-l-4 border-blue-600">Elite Resources</div>
                
                <button className="w-full glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-blue-300 transition-all group">
                   <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                   </div>
                   <div className="text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Download</div>
                      <div className="text-sm font-bold text-slate-900">Current Affairs PDF</div>
                   </div>
                </button>

                <button className="w-full glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-blue-300 transition-all group">
                   <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BrainCircuit size={20} />
                   </div>
                   <div className="text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">AI Module</div>
                      <div className="text-sm font-bold text-slate-900">Personalized Drills</div>
                   </div>
                </button>
             </div>
           )}

           {/* Quick Action */}
           <div className="pt-4">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-slate-900 text-white rounded-2xl py-5 text-center font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
              >
                  <Clock size={16} />
                  Access Latest Intel
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
