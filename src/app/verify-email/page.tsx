'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function VerifyEmailContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
    if (token) {
      handleVerifyToken(token);
    }
  }, [token, emailParam]);

  const handleVerifyToken = async (verifyToken: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/verify-email?token=${verifyToken}`);
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Verification failed. The link may be expired.');
      }
    } catch (err) {
      setError('An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError('An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      setError('Please enter your email to resend OTP.');
      return;
    }
    setResending(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Verification OTP sent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend verification email.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setResending(false);
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

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Email Verification</h1>

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 font-medium">Verifying...</p>
          </div>
        ) : success ? (
          <div className="w-full bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="font-semibold text-lg">Email Verified!</p>
            <p className="text-sm">Your account has been successfully verified. You can now use all features.</p>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Continue to Login</Link>
          </div>
        ) : (
          <div className="w-full">
            {error && (
              <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 mb-6 text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-slate-500 text-center mb-6 text-sm">
              Enter the 6-digit OTP sent to <strong>{email || 'your email'}</strong>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Verification Code</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="000000"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex justify-center items-center mt-6 shadow-md shadow-blue-500/20 disabled:opacity-70"
              >
                Verify Account
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-3">
              <p className="text-sm text-slate-500">Didn't receive the code?</p>
              <button 
                onClick={() => handleResend()}
                disabled={resending}
                className="text-blue-600 font-semibold hover:underline flex items-center space-x-2 disabled:opacity-50"
              >
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend OTP"}
              </button>
              <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
       </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
