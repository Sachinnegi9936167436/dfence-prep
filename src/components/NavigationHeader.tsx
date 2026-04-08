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
    <header className="sticky top-0 z-[60] w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-6 w-6 text-white shrink-0" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors font-heading">
            Dfence<span className="text-blue-600">Prep</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-[13px] font-bold uppercase tracking-wider text-slate-500">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.path} 
              className={`transition-all hover:text-blue-600 relative py-1 ${pathname === link.path ? 'text-blue-600' : ''}`}
            >
              {link.name}
              {pathname === link.path && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="hidden lg:flex items-center space-x-5 ml-auto">
          {session ? (
            <div className="flex items-center space-x-5 border-l pl-5 border-slate-200">
              {session.subscriptionStatus === 'active' ? (
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-green-100 shadow-sm animate-pulse-slow">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0"></div>
                  PREMIUM
                </div>
              ) : (
                <Link href="/pricing" className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                   <div className="relative px-5 py-2 bg-blue-600 text-[11px] font-black text-white rounded-full hover:bg-blue-700 transition-all uppercase tracking-widest leading-none">Upgrade</div>
                </Link>
              )}
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Candidate</span>
                <span className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{session.name || 'User'}</span>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors">Login</Link>
              <Link href="/register" className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-95">Enroll Now</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2.5 text-slate-600 hover:text-blue-600 transition rounded-xl bg-slate-50" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl overflow-y-auto max-h-[calc(100vh-5rem)] p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-1">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Navigation</span>
             <nav className="flex flex-col space-y-1 pt-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.path} 
                  className={`flex items-center transition-all px-4 py-3.5 rounded-2xl text-[13px] font-bold ${pathname === link.path ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <div className="flex flex-col leading-tight">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Signed in as</span>
                      <span className="text-base font-black text-slate-900">{session.name || 'Officer Candidate'}</span>
                   </div>
                   {session.subscriptionStatus === 'active' && (
                     <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">PREMIUM</span>
                   )}
                </div>
                {!session.subscriptionStatus && (
                   <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30">Get Unlimited Access</Link>
                )}
                <LogoutButton />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 bg-slate-50 rounded-2xl text-[13px] font-bold text-slate-600">Login to Academy</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl">Start Preparation</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );

}
