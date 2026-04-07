'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 md:top-20 -left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
      <div className="absolute top-10 md:top-20 -right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col items-center relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        
        <Link href="/" className="flex items-center space-x-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-2xl text-slate-900">
            Dfence<span className="text-blue-600">Prep</span>
          </span>
        </Link>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500 text-center mb-6 text-sm">Enter your new password below.</p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 mb-6 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="w-full bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="font-semibold text-lg">Password Updated!</p>
            <p className="text-sm">Your password has been reset successfully. Redirecting to login...</p>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !token}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex justify-center items-center mt-6 shadow-md shadow-blue-500/20 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
