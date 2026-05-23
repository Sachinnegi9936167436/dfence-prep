'use client';

import { useState } from 'react';
import { Send, Loader2, Shield, User, MessageSquare, Award, BrainCircuit, Target, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SSBSimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Jai Hind, Candidate. I am your SSB Mentor. Today we will simulate a personal interview. I will evaluate you on Officer Like Qualities (OLQs). Are you ready to begin? Please introduce yourself.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ssb-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        alert(`Error: ${data.message || 'Failed to get response'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-heading">SSB Interview Simulator</h1>
          <p className="text-slate-500 font-medium">Train with Command AI to master Officer Like Qualities (OLQs).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar - OLQ Tracker */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">OLQ Evaluation</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Your responses are being analyzed for core Officer Like Qualities.</p>
            
            <div className="space-y-3 pt-2">
              {[
                { name: 'Effective Intelligence', icon: BrainCircuit, color: 'text-blue-500' },
                { name: 'Sense of Responsibility', icon: Shield, color: 'text-indigo-500' },
                { name: 'Social Adaptability', icon: MessageSquare, color: 'text-emerald-500' },
                { name: 'Determination', icon: Target, color: 'text-red-500' },
                { name: 'Courage', icon: Zap, color: 'text-orange-500' },
              ].map((olq, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <olq.icon className={`h-4 w-4 ${olq.color}`} />
                    <span className="text-slate-700">{olq.name}</span>
                  </div>
                  <span className="text-slate-400">--</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800">
            <h4 className="font-black text-sm mb-2 uppercase tracking-wider text-blue-400">Mission Protocol</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>Be honest and authentic.</li>
              <li>Structure your answers logically.</li>
              <li>Demonstrate leadership and initiative.</li>
            </ul>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 glass-panel rounded-3xl flex flex-col h-[650px] overflow-hidden border border-slate-100 shadow-xl">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Shield size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-white text-slate-800 border border-slate-100 shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[75%] flex-row">
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Shield size={16} />
                  </div>
                  <div className="p-4 rounded-2xl text-sm bg-white text-slate-800 border border-slate-100 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Analyzing response...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response here..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
