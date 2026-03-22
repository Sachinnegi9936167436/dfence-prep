'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function NavigationHeader({ session }: { session: any }) {
  const pathname = usePathname();

  // Hide the global navigation bar entirely on authentication pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl hidden sm:inline-block">
            Dfence<span className="text-blue-600">Prep</span>
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/category/Defence" className="transition-colors hover:text-blue-600">Defence</Link>
          <Link href="/category/Sports" className="transition-colors hover:text-blue-600">Sports</Link>
          <Link href="/category/Awards" className="transition-colors hover:text-blue-600">Awards</Link>
          <Link href="/category/Books" className="transition-colors hover:text-blue-600">Books</Link>
          <Link href="/category/Exercises" className="transition-colors hover:text-blue-600">Exercises</Link>
          <Link href="/category/International Relations" className="transition-colors hover:text-blue-600">Int'l Relations</Link>
        </nav>
        <div className="flex items-center space-x-4 ml-auto">
          {session ? (
            <div className="flex items-center space-x-4 border-l pl-4 border-slate-200">
              {session.subscriptionStatus === 'active' ? (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">PREMIUM</span>
              ) : (
                <Link href="/pricing" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full hidden sm:inline-block border border-blue-100 transition-colors">Go Premium</Link>
              )}
              <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">Hi, {session.name || 'User'}</span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600">Log in</Link>
              <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
