'use client';

import { useState } from 'react';
import { Shield, Target, Zap, Award, BrainCircuit, Lock, Unlock, ChevronRight, MapPin } from 'lucide-react';

const SECTORS = [
  { id: 'sec_01', name: 'General Science', code: 'SEC-01', progress: 85, status: 'unlocked', color: 'blue', topics: ['Physics', 'Chemistry', 'Biology'] },
  { id: 'sec_02', name: 'Indian Polity', code: 'SEC-02', progress: 62, status: 'unlocked', color: 'indigo', topics: ['Constitution', 'Parliament', 'Judiciary'] },
  { id: 'sec_03', name: 'History & Ops', code: 'SEC-03', progress: 45, status: 'unlocked', color: 'emerald', topics: ['Ancient', 'Medieval', 'Modern', 'Military History'] },
  { id: 'sec_04', name: 'Geography', code: 'SEC-04', progress: 0, status: 'locked', color: 'slate', topics: ['Physical', 'Indian', 'World'] },
  { id: 'sec_05', name: 'Current Affairs', code: 'SEC-05', progress: 0, status: 'locked', color: 'slate', topics: ['National', 'International', 'Defence Updates'] },
  { id: 'sec_06', name: 'Strategic English', code: 'SEC-06', progress: 0, status: 'locked', color: 'slate', topics: ['Grammar', 'Vocabulary', 'Comprehension'] },
];

export default function CampaignMapPage() {
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-l-4 border-emerald-600 pl-6">
        <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <Target size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-heading">Campaign Map</h1>
          <p className="text-slate-500 font-medium">Conquer sectors to complete your syllabus. Advance to higher command.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Map Grid */}
        <div className="lg:col-span-2 relative p-8 glass-panel rounded-[2.5rem] bg-slate-50/50 border border-slate-100 overflow-hidden min-h-[500px]">
          {/* Tactical Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border border-slate-300 border-dashed"></div>
            ))}
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
            {SECTORS.map((sector) => (
              <div 
                key={sector.id}
                onClick={() => sector.status === 'unlocked' && setSelectedSector(sector)}
                className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                  sector.status === 'locked' 
                    ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : selectedSector.id === sector.id
                      ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10 -translate-y-1'
                      : 'bg-white border-white hover:border-blue-100 hover:shadow-lg hover:-translate-y-0.5 shadow-sm'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {sector.status === 'locked' ? (
                    <Lock size={14} className="text-slate-400" />
                  ) : (
                    <Unlock size={14} className="text-blue-600" />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${sector.status === 'locked' ? 'text-slate-400' : 'text-blue-600'}`}>{sector.code}</p>
                    <h3 className={`text-lg font-black font-heading ${sector.status === 'locked' ? 'text-slate-500' : 'text-slate-900'}`}>{sector.name}</h3>
                  </div>

                  {/* Progress Bar */}
                  {sector.status === 'unlocked' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Control</span>
                        <span className="text-slate-900">{sector.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                          style={{ width: `${sector.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {sector.status === 'locked' && (
                    <p className="text-xs font-medium text-slate-400">Complete previous sectors to unlock.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedSector.code}</p>
                <h2 className="text-2xl font-black text-slate-900 font-heading">{selectedSector.name}</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Syllabus Objectives</h4>
                <div className="space-y-2">
                  {selectedSector.topics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{topic}</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  <Zap size={14} />
                  Launch Operation
                </button>
              </div>
            </div>
          </div>

          {/* Strategic Intel */}
          <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-800">
            <h4 className="font-black text-sm mb-2 uppercase tracking-wider text-emerald-400">Commanders Intent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Focus on high-yield sectors first. General Science and Polity account for over 40% of the written exam score. Prioritize these zones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
