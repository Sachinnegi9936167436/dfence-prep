import type { Metadata } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { getSession } from '@/lib/auth';
import NavigationHeader from '@/components/NavigationHeader';
import { Analytics } from '@vercel/analytics/react';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { siteUrl } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dfence Prep | #1 Defence Exam Preparation Platform — CDS, NDA, AFCAT',
    template: '%s | Dfence Prep',
  },
  description: "Dfence Prep is India's #1 AI-powered defence exam preparation platform. Get daily curated defence news, AI-generated MCQs, mock tests and tactical analysis for CDS, NDA, AFCAT, MNS, CAPF, SSB Interview and more. Join thousands of future officers.",
  keywords: [
    'defence exam preparation',
    'defence',
    'defence exam',
    'CDS preparation',
    'NDA preparation',
    'AFCAT preparation',
    'defence news today',
    'Indian defence exam',
    'defence MCQ',
    'defence mock test',
    'NDA exam 2025',
    'CDS exam 2025',
    'AFCAT exam 2025',
    'Indian Army exam',
    'Indian Navy exam',
    'Indian Air Force exam',
    'SSB interview preparation',
    'defence current affairs',
    'defence quiz',
    'dfenceprep',
    'defence exam online coaching',
    'best defence exam app India',
  ],
  authors: [{ name: 'Dfence Prep Team', url: siteUrl }],
  creator: 'Dfence Prep',
  publisher: 'Dfence Prep',
  category: 'Education',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Dfence Prep | #1 Defence Exam Preparation — CDS, NDA, AFCAT',
    description: "India's #1 AI-powered defence exam prep platform. Daily defence news, AI MCQs & mock tests for CDS, NDA, AFCAT, SSB and more. Prepare smarter. Serve with honour.",
    type: 'website',
    url: siteUrl,
    siteName: 'Dfence Prep',
    locale: 'en_IN',
    images: [
      {
        url: `${siteUrl}/hero-army.png`,
        width: 1200,
        height: 630,
        alt: "Dfence Prep - India's #1 Defence Exam Preparation Platform",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dfence Prep | #1 Defence Exam Prep — CDS, NDA, AFCAT',
    description: "India's #1 AI-powered defence exam prep. Daily defence news, AI MCQs & mock tests for CDS, NDA, AFCAT, SSB. Join future officers!",
    images: [`${siteUrl}/hero-army.png`],
    creator: '@dfenceprep',
    site: '@dfenceprep',
  },
  verification: {
    google: 'I2eOgR-HgHWciAeXUXeTGC9uF-gQ6_3wW2BGfumWzAc',
  },
}

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Dfence Prep',
      description: "India's #1 AI-powered defence exam preparation platform for CDS, NDA, AFCAT, SSB and more.",
      inLanguage: 'en-IN',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/category/{search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Dfence Prep',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-192x192.png`,
        width: 192,
        height: 192,
      },
      description: "India's #1 AI-powered defence exam preparation platform. Prepare for CDS, NDA, AFCAT, SSB Interview with daily defence news, AI-generated MCQs and mock tests.",
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Defence Exam Preparation Plans',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Elite Weekly Plan',
            price: '30',
            priceCurrency: 'INR',
            description: 'Weekly access to AI-powered defence exam preparation',
            url: `${siteUrl}/pricing`,
          },
          {
            '@type': 'Offer',
            name: 'Command Monthly Plan',
            price: '50',
            priceCurrency: 'INR',
            description: 'Monthly access to premium defence exam intelligence',
            url: `${siteUrl}/pricing`,
          },
          {
            '@type': 'Offer',
            name: 'Officer Quarterly Plan',
            price: '80',
            priceCurrency: 'INR',
            description: 'Quarterly access to all premium defence exam features',
            url: `${siteUrl}/pricing`,
          },
        ],
      },
    },
    {
      '@type': 'Course',
      name: 'Defence Exam Preparation — CDS, NDA, AFCAT',
      description: 'Comprehensive AI-powered preparation course for Indian defence exams including CDS, NDA, AFCAT, MNS, CAPF and SSB Interview.',
      provider: { '@id': `${siteUrl}/#organization` },
      url: siteUrl,
      educationalLevel: 'Advanced',
      teaches: [
        'Defence Current Affairs',
        'General Knowledge for Defence Exams',
        'Defence MCQ Practice',
        'SSB Interview Preparation',
        'NDA Mathematics',
        'CDS English',
      ],
      hasCourseInstance: [
        {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en-IN',
        },
      ],
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <ServiceWorkerRegister />
        <NavigationHeader session={session} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
          <SpeedInsights />
        </main>
        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-800 pb-10">
            <div>
               <h3 className="text-white font-black text-xl mb-2 font-heading">Dfence<span className="text-blue-500">Prep</span></h3>
               <p className="max-w-xs text-sm leading-relaxed">The ultimate mission control for your defence career preparation. AI-powered excellence for tomorrow&apos;s officers.</p>
            </div>
            <div className="flex space-x-8 md:justify-end text-sm font-bold uppercase tracking-widest overflow-x-auto no-scrollbar">
              <Link href="/admin" className="text-slate-500 hover:text-white transition-colors">Admin Portal</Link>
            </div>
          </div>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs tracking-wide">
            <p>© {new Date().getFullYear()} DfencePrep Strategy Lab. Built for Excellence.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
               <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div> System Operational</span>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
