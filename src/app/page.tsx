import Link from 'next/link';
import { BookOpen, Trophy, Shield, Medal, Globe, Dumbbell } from 'lucide-react';
import { Article } from '@/models/Article';
import connectToDatabase from '@/lib/mongoose';
import { getSession } from '@/lib/auth';
import NewsArticleClient from '@/components/NewsArticleClient';

const CAT_ICONS: Record<string, any> = {
  Defence: Shield,
  Sports: Trophy,
  Awards: Medal,
  Books: BookOpen,
  Exercises: Dumbbell,
  'International Relations': Globe,
};

export const dynamic = 'force-dynamic';

async function getLatestArticles() {
  await connectToDatabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articles = await Article.find({
    publishedAt: { $gte: sevenDaysAgo }
  }).sort({ publishedAt: -1 }).limit(6).lean();
  return JSON.parse(JSON.stringify(articles)); // Serialize for client
}

export default async function Home() {
  const latestArticles = await getLatestArticles();
  const session = await getSession();

  return (
    <div className="space-y-24 relative pb-20">
      {/* Revolutionary Hero Section */}
      <section className="relative -mt-10 pt-24 pb-32 overflow-hidden rounded-[4rem] shadow-2xl group">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-army.png" 
            alt="Defence Prep Tactical Background" 
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[10s] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 space-y-10 opacity-0 animate-fade-in-up stagger-1">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600 glass-panel text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl border-none">
            <Shield className="h-4 w-4 animate-pulse-slow" />
            Elite Strategic Academy
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white font-heading leading-[0.9] drop-shadow-2xl">
            MASTER YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">MISSION READY.</span>
          </h1>
          <p className="text-slate-200 text-lg sm:text-2xl max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
            Precision AI-powered intelligence for CDS, NDA, and AFCAT. The ultimate tactical advantage for modern officers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/daily-quiz" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
              Launch Today's Drill
            </Link>
            {!session && (
              <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95">
                Join the Academy
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Strategic Pillars / Value Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
         {[
           { title: 'Daily Intelligence', desc: 'Sourced from verified defence channels, curated by AI for exam relevance.', icon: Globe, color: 'blue' },
           { title: 'Tactical Drills', desc: 'Unlimited AI-generated MCQs that adapt to the latest exam patterns.', icon: Shield, color: 'indigo' },
           { title: 'Mission Success', desc: 'Real-time analytics and performance tracking for disciplined improvement.', icon: Trophy, color: 'amber' }
         ].map((pillar, i) => (
           <div key={i} className={`p-8 bg-white border-b-4 border-${pillar.color}-600 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 opacity-0 animate-fade-in-up stagger-${i+2}`}>
              <div className={`h-14 w-14 mb-6 rounded-2xl bg-${pillar.color}-50 text-${pillar.color}-600 flex items-center justify-center shadow-inner`}>
                <pillar.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 font-heading">{pillar.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{pillar.desc}</p>
           </div>
         ))}
      </section>

      {/* Operational Categories */}
      <section className="space-y-10 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-blue-600 pl-6">
           <div>
              <h2 className="text-3xl font-black text-slate-900 font-heading">Specialized Sectors</h2>
              <p className="text-slate-500 font-medium">Focused intelligence streams across all mandatory exam categories.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'].map((cat, index) => {
            const Icon = CAT_ICONS[cat];
            const hasCustomImage = cat === 'Exercises' || cat === 'Defence';
            const bgImage = cat === 'Exercises' ? '/obstacle-course.png' : cat === 'Defence' ? '/tactical-drills.png' : null;

            return (
              <Link key={cat} href={`/category/${cat}`} className={`group relative p-8 ${hasCustomImage ? 'min-h-[220px]' : 'bg-slate-50'} rounded-3xl border border-slate-200 hover:border-blue-500 transition-all duration-500 overflow-hidden opacity-0 animate-fade-in-up stagger-${(index % 6) + 1}`}>
                {bgImage && (
                  <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity">
                    <img src={bgImage} alt={cat} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                  </div>
                )}
                <div className="relative z-10 flex flex-col justify-end h-full">
                  <div className={`h-14 w-14 mb-4 rounded-2xl ${hasCustomImage ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon size={28} />
                  </div>
                  <h3 className={`font-black text-xl ${hasCustomImage ? 'text-white' : 'text-slate-900'} font-heading tracking-tight`}>{cat}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Intelligence Feed (Latest News) */}
      <section className="space-y-10 relative z-10 px-4">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black text-slate-900 font-heading">Recent Intelligence Feed</h2>
        </div>
        {latestArticles.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-20 rounded-[3rem] text-center opacity-0 animate-fade-in-up">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active intel confirmed for the last 7 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {latestArticles.map((article: any, index: number) => (
              <NewsArticleClient key={article._id} article={article} index={index} />
            ))}
          </div>
        )}
      </section>

      {session && session.role !== 'admin' && (
        <div className="fixed inset-x-0 bottom-8 z-50 flex justify-end px-6 pointer-events-none">
          <a
            href="https://wa.me/918630466511"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#075e54] px-6 py-4 text-white shadow-2xl transition-all hover:scale-110 hover:bg-[#128c7e] group"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0 group-hover:rotate-12 transition-transform">
              <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.113.553 4.18 1.602 6.007L.178 23.181l5.295-1.39C7.265 22.784 9.29 23.36 11.397 23.36c.21 0 .421-.005.632-.016h.001c6.643-.167 11.97-5.592 11.97-12.234C24 5.385 18.614 0 11.97 0h.061zm-.008 1.954c5.568 0 10.098 4.529 10.098 10.097 0 5.564-4.524 10.091-10.088 10.098h-.001c-.171.01-.345.014-.52.014-1.802 0-3.565-.461-5.118-1.336l-.367-.208-3.793.996.994-3.791-.228-.38c-.961-1.599-1.467-3.46-1.467-5.387 0-5.564 4.527-10.094 10.092-10.094l.398-.009zm4.673 14.802c-.19.531-1.076 1.01-1.516 1.053-.418.04-1.127.185-3.56-1.04-2.935-1.47-4.814-4.49-4.965-4.698-.152-.206-1.187-1.583-1.187-3.02 0-1.436.75-2.146 1.015-2.43.265-.285.578-.356.77-.356.19 0 .38.001.545.008.175.008.411-.065.64.496.228.563.78 1.905.851 2.046.071.141.118.307.024.496-.095.19-.142.307-.285.474-.142.167-.3.37-.428.498-.142.141-.295.295-.133.578.161.282.717 1.196 1.542 1.928 1.066.945 1.947 1.258 2.232 1.4.285.142.451.118.617-.071.166-.19 .712-.831.902-1.116.19-.285.38-.238.64-.143.261.095 1.663.794 1.948.935.285.143.475.214.546.333.071.118.071.688-.119 1.219z" />
            </svg>
            <span className="font-black uppercase tracking-widest text-[10px]">Command Support</span>
          </a>
        </div>
      )}
    </div>
  );
}

