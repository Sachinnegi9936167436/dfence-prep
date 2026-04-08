'use client';

import React, { useState } from 'react';
import { Clock, BookOpen, X, ExternalLink, Shield, Trophy, Medal, Globe, Dumbbell } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const Icon = CAT_ICONS[article.category] || BookOpen;

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <div 
        onClick={toggleModal}
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Image Area */}
            <div className="relative h-48 sm:h-64 shrink-0">
              {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                   <Icon className="h-20 w-20 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              <button 
                onClick={toggleModal}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-900 hover:bg-white hover:scale-110 transition-all shadow-lg"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-6 left-8 right-8">
                 <span className="inline-block px-3 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-lg">{article.category}</span>
                 <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight drop-shadow-sm">{article.title}</h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 pt-2">
              <div className="space-y-6">
                <div className="flex items-center text-xs text-slate-400 font-medium">
                   <Clock className="h-3.5 w-3.5 mr-1.5" />
                   Published on {new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 sm:p-8">
                  <h4 className="text-blue-800 font-bold text-sm uppercase tracking-widest mb-4 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    AI-Generated Summary
                  </h4>
                  <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700">
                    {article.summary ? (
                      <div className="whitespace-pre-line text-slate-700 font-medium leading-loose">
                        {article.summary.split('\n').map((line, i) => (
                          <div key={i} className="mb-2 flex items-start">
                             <span className="text-blue-500 mr-2 shrink-0">•</span>
                             <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-slate-500">{article.content.substring(0, 500)}...</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center text-slate-400 hover:text-blue-600 transition-colors text-xs font-semibold"
                  >
                    View Original Source <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <button 
                    onClick={toggleModal}
                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                  >
                    Close Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
