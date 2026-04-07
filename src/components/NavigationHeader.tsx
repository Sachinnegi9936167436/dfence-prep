'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function NavigationHeader({ session }: { session: any }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide the global navigation bar entirely on authentication pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navLinks = [
    { name: 'Defence', path: '/category/Defence' },
    { name: 'Sports', path: '/category/Sports' },
    { name: 'Awards', path: '/category/Awards' },
    { name: 'Books', path: '/category/Books' },
    { name: 'Exercises', path: '/category/Exercises' },
    { name: 'International Relations', path: '/category/International Relations' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
          <span className="font-bold text-lg sm:text-xl inline-block text-slate-900 truncate max-w-[120px] sm:max-w-none">
            Dfence<span className="text-blue-600">Prep</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} className="transition-colors hover:text-blue-600">
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="hidden lg:flex items-center space-x-4 ml-auto">
          {session ? (
            <div className="flex items-center space-x-3 sm:space-x-4 border-l pl-3 sm:pl-4 border-slate-200">
              {session.subscriptionStatus === 'active' ? (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">PREMIUM</span>
              ) : (
                <Link href="/pricing" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 sm:px-3 py-1.5 rounded-full border border-blue-100 transition-colors whitespace-nowrap">Go Premium</Link>
              )}
              <span className="text-sm font-medium text-slate-700 truncate max-w-[80px] md:max-w-[150px]">Hi, {session.name || 'User'}</span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-2 py-1">Log in</Link>
              <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm whitespace-nowrap">Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)] p-4 space-y-4 animate-fade-in-up">
          <nav className="flex flex-col space-y-4 text-sm font-medium border-b border-slate-100 pb-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="transition-colors hover:text-blue-600 text-slate-700 px-2 py-1 rounded hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex flex-col space-y-4 pt-2">
            {session ? (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-slate-700 px-2">Hi, {session.name || 'User'}</span>
                  {session.subscriptionStatus === 'active' ? (
                    <span className="bg-green-100 text-green-700 text-[10px] w-fit font-bold px-2 py-1 rounded-full uppercase tracking-wider mx-2">PREMIUM</span>
                  ) : (
                    <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 transition-colors text-center">Go Premium</Link>
                  )}
                </div>
                <div className="w-full flex" onClick={() => setMobileMenuOpen(false)}>
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-blue-600 text-center py-2 bg-slate-50 rounded-lg">Log in</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
