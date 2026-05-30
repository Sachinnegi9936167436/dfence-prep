'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck, Loader2, Star, Target, BarChart3, BrainCircuit, FileText } from 'lucide-react';
import PremiumBadge from '@/components/PremiumBadge';

const PLANS = [
  { id: '1_week', name: 'Elite Weekly', price: 30, duration: '7 days', features: ['Curated Defence Intelligence Feed', 'AI-Powered Exam-Specific Mock Drills', 'Progress Tracking'], popular: false },
  { id: '1_month', name: 'Command Monthly', price: 50, duration: '30 days', features: ['Curated Defence Intelligence Feed', 'Premium Intelligence', 'Strategic Analytics', 'Priority Support'], popular: true },
  { id: '3_months', name: 'Officer Quarterly', price: 80, duration: '90 days', features: ['Everything in Monthly', 'PDF Command Reports', 'AI Exam Strategy', 'Offline Training Modules'], popular: false },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPage() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCheckout = async (plan: typeof PLANS[0]) => {
    setLoadingPlanId(plan.id);
    try {
      // 1. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoadingPlanId(null);
        return;
      }

      // 2. Create Razorpay order on backend
      const res = await fetch('/api/subscription/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initialize payment');
        setLoadingPlanId(null);
        return;
      }

      // 3. Open Razorpay checkout overlay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'DfencePrep',
        description: `Activate ${plan.name}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          setLoadingPlanId(plan.id);
          try {
            const verifyRes = await fetch('/api/subscription/razorpay-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setSuccess(true);
            } else {
              alert(verifyData.error || 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error(err);
            alert('An error occurred during verification.');
          } finally {
            setLoadingPlanId(null);
          }
        },
        prefill: {
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: '#2563eb', // blue-600
        },
        modal: {
          ondismiss: function () {
            setLoadingPlanId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto relative pb-32">
      {/* Premium Background Elements */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-blue-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10"></div>
      <div className="absolute bottom-40 -right-20 w-[500px] h-[500px] bg-indigo-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '3s' }}></div>
      
      <div className="text-center mb-20 opacity-0 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-100">
           <Star size={14} className="fill-blue-600" /> Strategic Advancement
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight font-heading leading-tight">
          Secure Your <span className="text-premium">Command.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Choose the tactical advantage that fits your mission. Unlock elite intelligence and AI-powered assessments.
        </p>
      </div>

      {success ? (
        <div className="mb-12 glass-panel p-12 rounded-[3rem] text-center max-w-2xl mx-auto border-green-200 shadow-green-500/10">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
             <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 font-heading">Payment Verified</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
            Your payment has been successfully processed and verified. 
            Your Elite Status has been activated instantly!
          </p>
          <button 
            onClick={() => {
              router.push('/dashboard');
              router.refresh();
            }} 
            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-2xl active:scale-95"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-24">
          {/* Comparison Bento Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, index) => (
              <div 
                key={plan.id} 
                className={`group relative glass-panel p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3 opacity-0 animate-fade-in-up stagger-${index + 1} ${plan.popular ? 'border-blue-500 ring-8 ring-blue-500/5 shadow-[0_0_40px_rgba(37,99,235,0.25)]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <PremiumBadge />
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 font-heading">₹{plan.price}</span>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">/ {plan.duration}</span>
                  </div>
                </div>

                <ul className="space-y-5 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                         <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-slate-600 font-medium text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlanId !== null}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'} disabled:opacity-50 flex justify-center items-center`}
                >
                  {loadingPlanId === plan.id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Select Plan"}
                </button>
              </div>
            ))}
          </div>

          {/* Value Proposition Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: Target, title: 'Precision Intel', desc: 'Curated defence news specifically for AFCAT/NDA patterns.' },
               { icon: BrainCircuit, title: 'AI Assessment', desc: 'Unlimited mock tests generated from current affairs.' },
               { icon: BarChart3, title: 'Elite Metrics', desc: 'Strategic breakdown of your performance across all sectors.' },
               { icon: FileText, title: 'Command Docs', desc: 'Downloadable PDF summaries and strategy guides.' }
             ].map((item, i) => (
               <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm opacity-0 animate-fade-in-up stagger-5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <item.icon size={24} />
                  </div>
                  <h4 className="font-black text-slate-900 mb-2 font-heading uppercase tracking-tight">{item.title}</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
