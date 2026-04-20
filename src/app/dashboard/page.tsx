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
  Bell
} from 'lucide-react';

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
  fieldReport: string;
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
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Status</span>
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
