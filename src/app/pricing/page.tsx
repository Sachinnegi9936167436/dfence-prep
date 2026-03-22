'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck, QrCode, Loader2 } from 'lucide-react';

const PLANS = [
  { id: '1_week', name: '1 Week Access', price: 30, duration: '7 days', features: ['Daily News Updates', 'AI Generated Quizzes', 'Progress Tracking'] },
  { id: '1_month', name: '1 Month Access', price: 50, duration: '30 days', features: ['Daily News Updates', 'AI Generated Quizzes', 'Progress Tracking', 'Priority Support'], popular: true },
  { id: '3_months', name: '3 Months Access', price: 80, duration: '90 days', features: ['Daily News Updates', 'AI Generated Quizzes', 'Progress Tracking', 'Priority Support', 'Exam Strategy Guide'] },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'admin@upi';

  const handleCheckout = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);
    setSuccess(false);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !utrNumber) return;

    setLoading(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: selectedPlan.id, 
          amount: selectedPlan.price,
          utrNumber 
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setSelectedPlan(null);
        setUtrNumber('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit payment details');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto relative pb-20">
      {/* Decorative Animated Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '2s' }}></div>
      
      <div className="text-center mb-16 opacity-0 animate-fade-in-up stagger-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Invest in your Preparation</h1>
        <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">Get unlimited access to daily defence news and AI-powered quizzes to stay ahead of the curve.</p>
      </div>

      {success && (
        <div className="mb-12 bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center max-w-2xl mx-auto">
          <ShieldCheck className="h-12 w-12 mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Submitted Successfully!</h2>
          <p>Your UTR number has been received. Our team will verify the payment and activate your premium access shortly. You will be able to access all locked content once approved.</p>
          <button onClick={() => router.push('/')} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition">Return Home</button>
        </div>
      )}

      {!selectedPlan && !success && (
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <div key={plan.id} className={`bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border opacity-0 animate-fade-in-up stagger-${index + 2} ${plan.popular ? 'border-blue-500 ring-4 ring-blue-500/20 relative' : 'border-slate-100'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-md uppercase">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="my-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                ₹{plan.price}
              </div>
              <ul className="space-y-4 my-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-slate-600">
                    <Check className="h-5 w-5 text-blue-500 mr-3 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleCheckout(plan)}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPlan && !success && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200">
          <div className="bg-blue-600 p-6 text-white text-center flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">Complete your Payment</h2>
            <p className="opacity-90">You selected <strong>{selectedPlan.name}</strong> for <strong>₹{selectedPlan.price}</strong></p>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                <QrCode className="h-8 w-8 mx-auto text-slate-400 mb-4" />
                <p className="text-sm text-slate-600 mb-4">Scan this QR Code using GPay, PhonePe, or Paytm.</p>
                {/* Switch to a more reliable QR Provider */}
                <div className="bg-white p-2 rounded-xl inline-block shadow-sm border border-slate-100">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DfencePrep&am=${selectedPlan.price}&cu=INR`)}`} 
                    alt="UPI QR Code" 
                    className="mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<div class="h-[200px] w-[200px] flex items-center justify-center bg-slate-100 rounded text-slate-400">QR Code Failed to Load</div>');
                    }}
                  />
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-blue-400 mb-1 tracking-wider">UPI ID</p>
                  <p className="text-sm font-mono font-bold text-blue-700">{upiId}</p>
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <h3 className="font-bold text-slate-900 mb-2">Step 2: Submit Details</h3>
                <p className="text-sm text-slate-500 mb-6">After completing the payment, please enter the 12-digit UTR or Transaction Reference number below.</p>
                
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">UTR / Transaction Number</label>
                    <input 
                      type="text" 
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 315629471822"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading || utrNumber.length < 6}
                      className="flex-[2] py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Payment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
