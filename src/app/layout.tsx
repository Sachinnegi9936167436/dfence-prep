import type { Metadata } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { getSession } from '@/lib/auth';
import NavigationHeader from '@/components/NavigationHeader';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Dfence Prep | AI-Powered Defence Exam Mastery',
  description: 'Daily curated news, strategic AI quizzes, and tactical MCQ practice for CDS, NDA, AFCAT, and more.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <NavigationHeader session={session} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
          <SpeedInsights />
        </main>
        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-800 pb-10">
            <div>
               <h3 className="text-white font-black text-xl mb-2 font-heading">Dfence<span className="text-blue-500">Prep</span></h3>
               <p className="max-w-xs text-sm leading-relaxed">The ultimate mission control for your defence career preparation. AI-powered excellence for tomorrow's officers.</p>
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

