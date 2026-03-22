'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('userEmail');
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-red-600 transition"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  );
}
