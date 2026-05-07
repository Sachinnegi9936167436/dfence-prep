'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Crown, ShieldAlert, ArrowRight } from 'lucide-react';
import PremiumBadge from './PremiumBadge';

interface SubscriptionShieldProps {
  children: ReactNode;
  session: any;
  title?: string;
  description?: string;
}

export default function SubscriptionShield({ 
  children, 
  session, 
  title = "Elite Intelligence Locked", 
  description = "This strategic asset is reserved for active Premium Officers. Upgrade your status to gain immediate access." 
}: SubscriptionShieldProps) {
  
  if (session?.subscriptionStatus === 'active') {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden glass-panel p-8 md:p-12 rounded-[2.5rem] border-2 border-blue-100 shadow-2xl bg-white/50 backdrop-blur-sm animate-fade-in-up">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
         <Crown size={200} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner animate-glow">
           <Lock size={40} />
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
           <ShieldAlert size={14} /> Tactical Restriction
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading leading-tight">{title}</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/pricing" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 active:scale-95">
             Upgrade to Elite Status <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition">
             Return to Base
          </Link>
        </div>
        
        <div className="mt-12 flex items-center gap-4 text-slate-400">
           <div className="h-px w-12 bg-slate-200"></div>
           <PremiumBadge size="sm" />
           <div className="h-px w-12 bg-slate-200"></div>
        </div>
      </div>
      
      {/* Blurred background preview of the children to tease content */}
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none select-none blur-xl scale-95 overflow-hidden">
         {children}
      </div>
    </div>
  );
}
