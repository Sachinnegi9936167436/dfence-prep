'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, BookOpen, Shield, Trophy, Medal, Globe, Dumbbell } from 'lucide-react';

const CAT_ICONS: Record<string, any> = {
  Defence: Shield,
  Sports: Trophy,
  Awards: Medal,
  Books: BookOpen,
  Exercises: Dumbbell,
  'International Relations': Globe,
};

interface Article {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt: string;
}

export default function NewsArticleClient({ article, index }: { article: Article; index: number }) {
  const router = useRouter();
  const Icon = CAT_ICONS[article.category] || BookOpen;

  return (
    <>
      <div 
        onClick={() => router.push(`/article/${article._id}`)}
        className={`bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 opacity-0 animate-fade-in-up stagger-${(index % 6) + 1} group cursor-pointer h-full`}
      >
        {article.imageUrl && (
          <div className="relative h-56 w-full overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-4 left-4">
               <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                 <Icon className="h-3 w-3 text-blue-600" />
                 {article.category}
               </span>
            </div>
          </div>
        )}
        <div className="p-7 flex-1 flex flex-col">
          <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1.5" />
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-black text-xl mb-3 line-clamp-2 text-slate-900 group-hover:text-blue-700 transition-colors leading-tight font-heading">{article.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed font-medium">{article.content}</p>
          <div className="mt-auto pt-6 border-t border-slate-50">
            <button className="flex items-center justify-between w-full text-blue-600 text-xs font-black uppercase tracking-widest group/btn hover:text-indigo-700 transition-colors">
              <span>Detailed Summary</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all shadow-inner">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
