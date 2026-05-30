import connectToDatabase from '@/lib/mongoose';
import { Article } from '@/models/Article';
import { notFound } from 'next/navigation';
import NewsArticleClient from '@/components/NewsArticleClient';
import OlderNewsArchive from '@/components/OlderNewsArchive';

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

export const revalidate = 60;

export async function generateStaticParams() {
  return [
    { name: 'Defence' },
    { name: 'Sports' },
    { name: 'Awards' },
    { name: 'Books' },
    { name: 'Exercises' },
    { name: 'International Relations' },
  ];
}

interface CategoryPageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { name } = await params;
  return {
    title: `${name} News - Dfence Prep`,
    description: `Stay updated with the latest ${name} news, analysis, and updates for defense exam preparation.`,
    openGraph: {
      title: `${name} News - Dfence Prep`,
      description: `Stay updated with the latest ${name} news, analysis, and updates for defense exam preparation.`,
      type: 'website',
    },
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
  // eslint-disable-next-line react-hooks/purity
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Fetch articles for this category within last 24 hours
  const articles = await Article.find({ 
    category: categoryName,
    publishedAt: { $gte: twentyFourHoursAgo }
  })
    .sort({ publishedAt: -1 })
    .limit(20)
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentArticles = articles.map((article: any) => {
    const serialized = JSON.parse(JSON.stringify(article));
    return {
      ...serialized,
      content: serialized.summary || (serialized.content.length > 200 ? serialized.content.substring(0, 200) + '...' : serialized.content),
    };
  });

  const ArticleGrid = ({ items, emptyMessage }: { items: ArticleType[], emptyMessage: string }) => {
    if (items.length === 0) {
      return <p className="text-slate-500 bg-white p-6 rounded-lg text-center shadow-sm">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {items.map((article: ArticleType, index: number) => (
          <NewsArticleClient key={article._id} article={article} index={index} />
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

      <OlderNewsArchive category={categoryName} before={twentyFourHoursAgo.toISOString()} />

    </div>
  );
}
