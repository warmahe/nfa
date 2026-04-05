import React from 'react';
import { Target, Users, Zap, Calendar } from 'lucide-react';

export const DetailOverview = ({ pkg }: any) => {
  return (
    <section className="relative">
      {/* Background Ghost Text */}
      <span className="absolute -top-12 -left-4 text-9xl font-black text-[#121212]/5 select-none pointer-events-none uppercase">
        Intel
      </span>

      <div className="relative z-10">
        <h2 className="font-brand font-black text-4xl md:text-5xl uppercase text-[#121212] mb-8 flex items-center gap-4">
          <Target className="text-[#9E1B1D]" /> Mission Overview
        </h2>
        
        <p className="font-brand text-xl md:text-2xl leading-relaxed text-[#121212]/80 italic mb-12 max-w-3xl border-l-4 border-[#F4BF4B] pl-8">
          "{pkg.description || `This is not a vacation; it's an expedition. We leave the tourist traps behind and dive into the raw, unfiltered reality of ${pkg.destination}.`}"
        </p>

        {/* Tactical Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: "Travel Type", val: "Adventure", icon: Zap },
             { label: "Activity Level", val: "Extreme", icon: Target },
             { label: "Group Size", val: "06 Max", icon: Users },
             { label: "Window", val: "May — Sep", icon: Calendar },
           ].map((stat, idx) => (
             <div key={idx} className="border-2 border-[#121212] p-6 bg-white shadow-[4px_4px_0px_0px_#121212] hover:bg-[#FCFBF7] transition-colors">
                <stat.icon className="text-[#9E1B1D] mb-4" size={20} />
                <span className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/40 mb-1">{stat.label}</span>
                <span className="block font-black text-sm uppercase tracking-tight">{stat.val}</span>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};