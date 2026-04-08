'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

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
      } catch (e) {
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
    } catch (err: any) {
      console.error('Login Details:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Animated Background Blobs */}
      <div className="absolute top-10 md:top-20 -left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-10 md:top-20 -right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col items-center opacity-0 animate-login-enter relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Custom Header inside Login Box */}
        <div className="w-full flex flex-col items-center border-b border-slate-200/60 pb-6 mb-6">
          <Link href="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-md animate-float">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl text-slate-900">
              Dfence<span className="text-blue-600">Prep</span>
            </span>
          </Link>
          <div className="flex flex-wrap justify-center gap-2 w-full">
            {['Defence', 'Sports', 'Awards', 'Books', 'Exercises', "Int'l Relations"].map((cat) => (
               <Link 
                 key={cat} 
                 href={`/category/${cat === "Int'l Relations" ? 'International Relations' : cat}`} 
                 className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
               >
                 {cat}
               </Link>
            ))}
          </div>
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

        <div className="mt-8 flex flex-col items-center space-y-3">
          <p className="text-sm text-slate-500">
            Don't have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Sign up for free</Link>
          </p>
          <p className="text-xs text-slate-400">
            Need to verify your account? <Link href="/verify-email" virtual-id="verify-email-link" className="text-blue-500 font-medium hover:underline">Verify Email</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
