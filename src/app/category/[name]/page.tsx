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
  const decodedName = decodeURIComponent(name);
  const categoryDescriptions: Record<string, string> = {
    Defence: 'Latest Indian defence news for exam preparation. Stay updated on Indian Army, Navy, Air Force, defence deals, and military exercises for CDS, NDA, and AFCAT exams.',
    Sports: 'Latest sports news and updates for defence exam preparation. Important sporting events, awards, and records for CDS, NDA, and AFCAT.',
    Awards: 'Latest awards and honours news for defence exam preparation. National awards, Padma awards, gallantry medals for CDS, NDA, and AFCAT.',
    Books: 'Latest books and publications news for defence exam preparation. Important books and authors for CDS, NDA, and AFCAT exams.',
    Exercises: 'Latest Indian military exercise news for defence exam preparation. Bilateral and multilateral military exercises for CDS, NDA, and AFCAT.',
    'International Relations': 'Latest international relations news for defence exam preparation. Bilateral ties, treaties and summits for CDS, NDA, and AFCAT exams.',
  };
  const desc = categoryDescriptions[decodedName] || `Stay updated with the latest ${decodedName} news, analysis, and updates for defence exam preparation.`;
  return {
    title: `${decodedName} News for Defence Exam | Dfence Prep`,
    description: desc,
    keywords: [
      decodedName,
      `${decodedName} news`,
      `${decodedName} defence exam`,
      'defence exam',
      'CDS',
      'NDA',
      'AFCAT',
      'defence current affairs',
      'defence news today',
    ],
    alternates: {
      canonical: `https://dfenceprep.com/category/${encodeURIComponent(decodedName)}`,
    },
    openGraph: {
      title: `${decodedName} News for Defence Exam | Dfence Prep`,
      description: desc,
      type: 'website',
      url: `https://dfenceprep.com/category/${encodeURIComponent(decodedName)}`,
      siteName: 'Dfence Prep',
      locale: 'en_IN',
      images: [{ url: 'https://dfenceprep.com/hero-army.png', alt: 'Dfence Prep' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decodedName} News | Dfence Prep`,
      description: desc,
      images: ['https://dfenceprep.com/hero-army.png'],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'CollectionPage',
                '@id': `https://dfenceprep.com/category/${encodeURIComponent(categoryName)}`,
                name: `${categoryName} News for Defence Exam`,
                description: `Latest ${categoryName} news and updates for CDS, NDA, and AFCAT defence exam preparation.`,
                url: `https://dfenceprep.com/category/${encodeURIComponent(categoryName)}`,
                isPartOf: { '@id': 'https://dfenceprep.com/#website' },
                inLanguage: 'en-IN',
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dfenceprep.com' },
                  { '@type': 'ListItem', position: 2, name: `${categoryName} News`, item: `https://dfenceprep.com/category/${encodeURIComponent(categoryName)}` },
                ],
              },
            ],
          }),
        }}
      />
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
