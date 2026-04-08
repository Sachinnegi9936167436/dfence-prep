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
  const articles = await Article.find().sort({ publishedAt: -1 }).limit(6).lean();
  return JSON.parse(JSON.stringify(articles)); // Serialize for client
}

export default async function Home() {
  const latestArticles = await getLatestArticles();
  const session = await getSession();

  return (
    <div className="space-y-12 relative pb-10">
      {/* Decorative Animated Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '4s' }}></div>

      <section className="text-center py-12 sm:py-16 space-y-6 opacity-0 animate-fade-in-up stagger-1 relative z-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500">
          Prepare for your Defence Exams
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium px-4">
          Daily curated news and MCQ quizzes for Defence, Sports, Awards, Books, Exercises and International Relations.
        </p>
        <div className="pt-6">
          <Link href="/daily-quiz" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold shadow-[0_8px_30px_rgb(37,99,235,0.2)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 ring-4 ring-blue-50 text-sm sm:text-base">
            Take Today's Quiz
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 px-4">
        {['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'].map((cat, index) => {
          const Icon = CAT_ICONS[cat];
          return (
            <Link key={cat} href={`/category/${cat}`} className={`group p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 flex flex-col items-center justify-center space-y-4 opacity-0 animate-fade-in-up stagger-${(index % 6) + 1}`}>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <Icon size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">{cat}</h3>
            </Link>
          );
        })}
      </section>

      <section className="space-y-8 relative z-10 mt-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 border-b border-slate-200 pb-4">Latest News</h2>
        {latestArticles.length === 0 ? (
          <p className="text-slate-500 bg-white/50 backdrop-blur p-8 rounded-2xl text-center shadow-sm opacity-0 animate-fade-in-up stagger-1 font-medium">No news articles found. Ask the admin to fetch the latest news.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article: any, index: number) => (
              <NewsArticleClient key={article._id} article={article} index={index} />
            ))}
          </div>
        )}
      </section>

      {session && session.role !== 'admin' && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none sm:px-6 sm:pb-4">
          <a
            href="https://wa.me/918630466511"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex max-w-[min(100%,calc(100vw-2rem))] shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-all hover:scale-105 hover:bg-[#20bd5a] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] sm:px-5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0">
              <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.113.553 4.18 1.602 6.007L.178 23.181l5.295-1.39C7.265 22.784 9.29 23.36 11.397 23.36c.21 0 .421-.005.632-.016h.001c6.643-.167 11.97-5.592 11.97-12.234C24 5.385 18.614 0 11.97 0h.061zm-.008 1.954c5.568 0 10.098 4.529 10.098 10.097 0 5.564-4.524 10.091-10.088 10.098h-.001c-.171.01-.345.014-.52.014-1.802 0-3.565-.461-5.118-1.336l-.367-.208-3.793.996.994-3.791-.228-.38c-.961-1.599-1.467-3.46-1.467-5.387 0-5.564 4.527-10.094 10.092-10.094l.398-.009zm4.673 14.802c-.19.531-1.076 1.01-1.516 1.053-.418.04-1.127.185-3.56-1.04-2.935-1.47-4.814-4.49-4.965-4.698-.152-.206-1.187-1.583-1.187-3.02 0-1.436.75-2.146 1.015-2.43.265-.285.578-.356.77-.356.19 0 .38.001.545.008.175.008.411-.065.64.496.228.563.78 1.905.851 2.046.071.141.118.307.024.496-.095.19-.142.307-.285.474-.142.167-.3.37-.428.498-.142.141-.295.295-.133.578.161.282.717 1.196 1.542 1.928 1.066.945 1.947 1.258 2.232 1.4.285.142.451.118.617-.071.166-.19 .712-.831.902-1.116.19-.285.38-.238.64-.143.261.095 1.663.794 1.948.935.285.143.475.214.546.333.071.118.071.688-.119 1.219z" />
            </svg>
            <span className="font-bold whitespace-nowrap">Chat with us</span>
          </a>
        </div>
      )}
    </div>
  );
}
