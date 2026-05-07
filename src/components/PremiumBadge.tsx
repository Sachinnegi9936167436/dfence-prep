'use client';

import { Crown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PremiumBadge({ className, size = 'md' }: PremiumBadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-[9px] gap-1',
    md: 'px-3 py-1 text-[10px] gap-1.5',
    lg: 'px-4 py-2 text-[12px] gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <div className={cn(
      "inline-flex items-center font-black uppercase tracking-[0.2em] rounded-full",
      "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600",
      "text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/30",
      "animate-pulse-slow",
      sizes[size],
      className
    )}>
      <Crown size={iconSizes[size]} className="fill-current" />
      <span>Premium</span>
    </div>
  );
}
