'use client';

import { useState } from 'react';
import NewsArticleClient from '@/components/NewsArticleClient';
import { ChevronDown, Loader2 } from 'lucide-react';

interface ArticleType {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt: string;
}

interface OlderNewsArchiveProps {
  category: string;
  before: string;
}

export default function OlderNewsArchive({ category, before }: OlderNewsArchiveProps) {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoadArchive = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/news?category=${encodeURIComponent(category)}&before=${encodeURIComponent(before)}&limit=20`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setArticles(data.articles || []);
      } else {
        console.error('Failed to load news archive:', data.error);
      }
    } catch (err) {
      console.error('Error fetching older news archive:', err);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <div className="text-center pt-8 border-t border-slate-200">
        <button
          onClick={handleLoadArchive}
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              Loading Intel Archive <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              Load Older News Archive <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-700 border-t pt-8">Older News Archive</h2>
        <p className="text-slate-500 bg-white p-6 rounded-lg text-center shadow-sm">
          No older archived articles found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-700 border-t pt-8">Older News Archive</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 animate-fade-in-up">
        {articles.map((article: ArticleType, index: number) => (
          <NewsArticleClient key={article._id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}
