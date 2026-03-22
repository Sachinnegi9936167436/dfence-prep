import connectToDatabase from '@/lib/mongoose';
import { Article } from '@/models/Article';
import { notFound } from 'next/navigation';
import { Clock, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { name } = await params;
  return {
    title: `${name} News - Dfence Prep`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { name: categoryNameRaw } = await params;
  const categoryName = decodeURIComponent(categoryNameRaw);

  const validCategories = ['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'];
  if (!validCategories.includes(categoryName)) {
    notFound();
  }

  await connectToDatabase();
  // Fetch articles for this category
  const articles = await Article.find({ category: categoryName })
    .sort({ publishedAt: -1 })
    .limit(100) // Increase limit so older articles are fetched
    .lean();

  const serializedArticles = JSON.parse(JSON.stringify(articles));

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const recentArticles = serializedArticles.filter((a: any) => new Date(a.publishedAt) >= twentyFourHoursAgo);
  const olderArticles = serializedArticles.filter((a: any) => new Date(a.publishedAt) < twentyFourHoursAgo);

  const ArticleGrid = ({ items, emptyMessage }: { items: any[], emptyMessage: string }) => {
    if (items.length === 0) {
      return <p className="text-slate-500 bg-white p-6 rounded-lg text-center shadow-sm">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {items.map((article: any, index: number) => (
          <div key={article._id} className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 opacity-0 animate-fade-in-up stagger-${(index % 6) + 1} group`}>
            {article.imageUrl && (
              <div className="relative h-52 w-full overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center text-xs text-slate-500 mb-3">
                <Clock className="h-3 w-3 mr-1 text-blue-600" />
                <span className="font-medium">{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-extrabold text-xl mb-3 line-clamp-2 text-slate-900 group-hover:text-blue-700 transition-colors">{article.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">{article.content}</p>
              <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 text-sm font-bold hover:text-indigo-700 transition-colors">
                Read source <ExternalLink className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12 relative pb-20">
      {/* Decorative Animated Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '2s' }}></div>

      <div className="pb-6 border-b border-slate-200 opacity-0 animate-fade-in-up stagger-1">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-2">{categoryName} News</h1>
        <p className="text-lg text-slate-500 font-medium">Latest updates from the world of {categoryName.toLowerCase()}.</p>
      </div>

      <div className="space-y-6">
         <h2 className="text-2xl font-semibold tracking-tight">Latest News (Last 24 Hours)</h2>
         <ArticleGrid items={recentArticles} emptyMessage="No new articles published in the last 24 hours." />
      </div>

      <div className="space-y-6">
         <h2 className="text-2xl font-semibold tracking-tight text-slate-700 border-t pt-8">Older News Archive</h2>
         <ArticleGrid items={olderArticles} emptyMessage="No older archived articles found in this category." />
      </div>

    </div>
  );
}
