'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck, QrCode, Loader2, Star, Zap, Target, BarChart3, BrainCircuit, FileText, X } from 'lucide-react';
import PremiumBadge from '@/components/PremiumBadge';

const PLANS = [
  { id: '1_week', name: 'Elite Weekly', price: 30, duration: '7 days', features: ['Daily News Updates', 'Standard Quizzes', 'Progress Tracking'], popular: false },
  { id: '1_month', name: 'Command Monthly', price: 50, duration: '30 days', features: ['Daily News Updates', 'Premium Intelligence', 'Strategic Analytics', 'Priority Support'], popular: true },
  { id: '3_months', name: 'Officer Quarterly', price: 80, duration: '90 days', features: ['Everything in Monthly', 'PDF Command Reports', 'AI Exam Strategy', 'Offline Training Modules'], popular: false },
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
          <h2 className="text-3xl font-black text-slate-900 mb-4 font-heading">Mission Details Received</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
            Your payment verification request (UTR: {utrNumber}) has been submitted to Command. 
            Our officers will verify the transaction and activate your Elite Status shortly.
          </p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-2xl active:scale-95"
          >
            Return to Dashboard
          </button>
        </div>
      ) : !selectedPlan ? (
        <div className="space-y-24">
          {/* Comparison Bento Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, index) => (
              <div 
                key={plan.id} 
                className={`group relative glass-panel p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3 opacity-0 animate-fade-in-up stagger-${index + 1} ${plan.popular ? 'border-blue-500 ring-8 ring-blue-500/5' : ''}`}
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
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'}`}
                >
                  Select Plan
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
      ) : (
        <div className="max-w-4xl mx-auto opacity-0 animate-fade-in-up">
          <div className="glass-panel overflow-hidden rounded-[3rem] shadow-2xl border border-blue-100">
            <div className="flex flex-col lg:flex-row">
               {/* Left: Summary */}
               <div className="lg:w-2/5 bg-slate-900 p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                     <Zap size={180} />
                  </div>
                  <div className="relative z-10 space-y-8">
                     <button onClick={() => setSelectedPlan(null)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition mb-4">
                        <X size={20} />
                     </button>
                     <div>
                        <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Order Summary</p>
                        <h2 className="text-3xl font-black font-heading">{selectedPlan.name}</h2>
                        <div className="text-4xl font-black text-white mt-4">₹{selectedPlan.price}</div>
                        <p className="text-slate-400 text-sm mt-2">Access for {selectedPlan.duration}</p>
                     </div>
                     <div className="space-y-4 pt-8 border-t border-white/10">
                        {selectedPlan.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                             <Check size={14} className="text-blue-400" /> {f}
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
               
               {/* Right: Payment Form */}
               <div className="lg:w-3/5 p-12 bg-white">
                  <div className="space-y-10">
                     <div className="text-center lg:text-left">
                        <h3 className="text-2xl font-black text-slate-900 font-heading">Secure Transfer</h3>
                        <p className="text-slate-500 text-sm font-medium mt-2">Complete payment via UPI to activate your status.</p>
                     </div>
                     
                     <div className="flex flex-col items-center lg:items-start gap-8">
                        <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner relative group">
                           <div className="bg-white p-3 rounded-2xl shadow-sm">
                             <img 
                               src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DfencePrep&am=${selectedPlan.price}&cu=INR`)}`} 
                               alt="UPI QR Code" 
                               className="w-40 h-40"
                             />
                           </div>
                           <div className="mt-4 text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Elite UPI ID</p>
                              <code className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{upiId}</code>
                           </div>
                        </div>
                        
                        <form onSubmit={handleSubmitPayment} className="w-full space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">UTR / Transaction ID</label>
                              <input 
                                type="text" 
                                required
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                                placeholder="Enter 12-digit number"
                                className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
                              />
                           </div>
                           <button 
                             type="submit"
                             disabled={loading || utrNumber.length < 6}
                             className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-[0_0_40px_rgba(37,99,235,0.3)] disabled:opacity-50 flex justify-center items-center gap-3"
                           >
                             {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify Payment <ShieldCheck size={18} /></>}
                           </button>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
