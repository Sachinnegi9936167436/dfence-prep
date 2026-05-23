'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
      }

      if (res.ok && data.success) {
        // Save minimal data to localstorage for client-side easy access if needed
        localStorage.setItem('userEmail', email);
        router.push('/');
        router.refresh(); // Refresh to update layouts holding server state
      } else if (res.status === 403 && data.requiresVerification) {
        setError('Your email is not verified. Redirecting to verification page...');
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.error || `Error ${res.status}: ${res.statusText}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Login Details:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/soldier-silhouette.png" 
          alt="Tactical Background" 
          fill
          className="object-cover opacity-40 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-transparent to-slate-900/80"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col items-center opacity-0 animate-login-enter relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Custom Header inside Login Box */}
        <div className="w-full flex flex-col items-center border-b border-slate-200/60 pb-4 mb-6">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-md animate-float">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl text-slate-900">
              Dfence<span className="text-blue-600">Prep</span>
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-6 text-sm font-medium">Sign in to your account to continue your preparation.</p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 mb-6 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" virtual-id="forgot-password-link" className="text-xs font-semibold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex justify-center items-center mt-6 shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center space-y-3 w-full">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Sign up for free</Link>
          </p>
          <p className="text-xs text-slate-400">
            Need to verify your account? <Link href="/verify-email" virtual-id="verify-email-link" className="text-blue-500 font-medium hover:underline">Verify Email</Link>
          </p>
          <div className="pt-4 border-t border-slate-200/60 w-full flex flex-col items-center">
            <a
              href="https://wa.me/918630466511"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100/80 text-green-700 hover:text-green-800 border border-green-200 text-sm font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0 text-[#25D366]">
                <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.113.553 4.18 1.602 6.007L.178 23.181l5.295-1.39C7.265 22.784 9.29 23.36 11.397 23.36c.21 0 .421-.005.632-.016h.001c6.643-.167 11.97-5.592 11.97-12.234C24 5.385 18.614 0 11.97 0h.061zm-.008 1.954c5.568 0 10.098 4.529 10.098 10.097 0 5.564-4.524 10.091-10.088 10.098h-.001c-.171.01-.345.014-.52.014-1.802 0-3.565-.461-5.118-1.336l-.367-.208-3.793.996.994-3.791-.228-.38c-.961-1.599-1.467-3.46-1.467-5.387 0-5.564 4.527-10.094 10.092-10.094l.398-.009zm4.673 14.802c-.19.531-1.076 1.01-1.516 1.053-.418.04-1.127.185-3.56-1.04-2.935-1.47-4.814-4.49-4.965-4.698-.152-.206-1.187-1.583-1.187-3.02 0-1.436.75-2.146 1.015-2.43.265-.285.578-.356.77-.356.19 0 .38.001.545.008.175.008.411-.065.64.496.228.563.78 1.905.851 2.046.071.141.118.307.024.496-.095.19-.142.307-.285.474-.142.167-.3.37-.428.498-.142.141-.295.295-.133.578.161.282.717 1.196 1.542 1.928 1.066.945 1.947 1.258 2.232 1.4.285.142.451.118.617-.071.166-.19 .712-.831.902-1.116.19-.285.38-.238.64-.143.261.095 1.663.794 1.948.935.285.143.475.214.546.333.071.118.071.688-.119 1.219z" />
              </svg>
              <span>Need Help? Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
