import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongoose';
import { Article as ArticleModel } from '@/models/Article';
import { Clock, BookOpen, ExternalLink, Shield, Trophy, Medal, Globe, Dumbbell, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import NavigationHeader from '@/components/NavigationHeader';
import { getSession } from '@/lib/auth';
import PremiumBadge from '@/components/PremiumBadge';

const CAT_ICONS: Record<string, any> = {
  Defence: Shield,
  Sports: Trophy,
  Awards: Medal,
  Books: BookOpen,
  Exercises: Dumbbell,
  'International Relations': Globe,
};

async function getArticle(id: string) {
  try {
    await connectToDatabase();
    const article = await ArticleModel.findById(id).lean();
    return article ? JSON.parse(JSON.stringify(article)) : null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.summary || article.content.substring(0, 150),
    openGraph: {
      title: article.title,
      description: article.summary || article.content.substring(0, 150),
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary || article.content.substring(0, 150),
      images: article.imageUrl ? [article.imageUrl] : [],
    }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  const session = await getSession();

  if (!article) {
    notFound();
  }

  const Icon = CAT_ICONS[article.category] || BookOpen;
  
  // WhatsApp share link URL pointing to this specific page
  const shareText = `Read this on Dfence Prep: ${article.title}\n\nhttps://dfenceprep.com/article/${article._id}`;
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <>
      <NavigationHeader session={session} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 opacity-0 animate-fade-in-up">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mb-8 transition-colors">
          &larr; Back to Command Center
        </Link>
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="relative h-64 sm:h-96 shrink-0">
            {article.imageUrl ? (
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                 <Icon className="h-32 w-32 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-8 left-8 right-8">
               <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-blue-500">
                    <Icon className="h-3 w-3" />
                    {article.category}
                  </span>
                  {article.isPremium && <PremiumBadge />}
               </div>
               <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-md font-heading">{article.title}</h1>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="space-y-8">
              <div className="flex items-center text-sm text-slate-500 font-bold uppercase tracking-widest">
                 <Clock className="h-4 w-4 mr-2" />
                 {new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 sm:p-10 shadow-inner relative overflow-hidden">
                <h4 className="text-blue-800 font-black text-sm uppercase tracking-widest mb-6 flex items-center">
                  <BookOpen className="h-5 w-5 mr-3" />
                  Tactical Summary
                </h4>
                
                {article.isPremium && session?.subscriptionStatus !== 'active' ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-10"></div>
                    <div className="blur-[6px] select-none space-y-4">
                       <p className="text-slate-700 font-medium leading-loose text-lg">
                          This premium intelligence is restricted to Elite Personnel. 
                          It contains high-level strategic analysis and specific actionable data 
                          that provides a tactical advantage for competitive examinations.
                       </p>
                       <p className="text-slate-700 font-medium leading-loose text-lg">
                          Upgrade to Premium to unlock the full summary, AI-generated explanations, 
                          and specialized drills related to this sector.
                       </p>
                    </div>
                    
                    <div className="relative z-20 mt-10 p-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl border border-blue-500/30 overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                          <Lock size={100} />
                       </div>
                       <div className="relative z-10 text-center space-y-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                             <Sparkles size={12} /> Elite Intelligence Locked
                          </div>
                          <h3 className="text-2xl font-black font-heading">Ready for the Full Briefing?</h3>
                          <p className="text-slate-400 text-sm max-w-md mx-auto">Access the full tactical summary and unlimited AI drills for this and all other premium articles.</p>
                          <Link 
                            href="/pricing" 
                            className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95"
                          >
                             Upgrade to Premium
                          </Link>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-loose">
                    {article.summary ? (
                      <div className="whitespace-pre-line text-slate-700 font-medium leading-loose text-lg">
                        {article.summary.split('\n').map((line: string, i: number) => (
                          <div key={i} className="mb-3 flex items-start">
                             <span className="text-blue-500 mr-3 shrink-0 text-xl">•</span>
                             <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-slate-500 text-lg leading-loose">{article.content}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold uppercase tracking-widest group"
                >
                  Verify Source <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <a 
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-10 py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#128C7E] transition-all shadow-xl active:scale-95 flex items-center justify-center"
                >
                  Share to WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
