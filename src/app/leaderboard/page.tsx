'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Loader2, Shield } from 'lucide-react';
import NavigationHeader from '@/components/NavigationHeader';

interface LeaderboardUser {
  _id: string;
  name: string;
  score: number;
  quizzesAttempted: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard) {
          setUsers(data.leaderboard);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 opacity-0 animate-fade-in-up">
      <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
        <Trophy className="h-10 w-10 text-yellow-500" />
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-heading">Global Rankings</h1>
          <p className="text-slate-500 font-medium">Top tactical commanders by mission readiness score.</p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Compiling Dossiers...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-bold uppercase tracking-widest text-xs text-slate-400">Rank & Officer</span>
            <span className="font-bold uppercase tracking-widest text-xs text-slate-400">Total Score</span>
          </div>
          <div className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-medium">No tactical data found. Be the first to rank!</div>
            ) : (
              users.map((user, index) => {
                let RankIcon = Shield;
                let iconColor = "text-slate-400";
                let badgeColor = "bg-slate-100";
                
                if (index === 0) {
                  RankIcon = Trophy;
                  iconColor = "text-yellow-500";
                  badgeColor = "bg-yellow-50";
                } else if (index === 1) {
                  RankIcon = Medal;
                  iconColor = "text-slate-400";
                  badgeColor = "bg-slate-100";
                } else if (index === 2) {
                  RankIcon = Award;
                  iconColor = "text-amber-700";
                  badgeColor = "bg-orange-50";
                }

                return (
                  <div key={user._id} className="p-6 sm:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${badgeColor} flex items-center justify-center font-black text-xl text-slate-900 shadow-sm`}>
                         {index < 3 ? <RankIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} /> : `#${index + 1}`}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{user.name || 'Anonymous Cadet'}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{user.quizzesAttempted} Drills</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-black text-blue-600 font-heading">{user.score}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Points</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
