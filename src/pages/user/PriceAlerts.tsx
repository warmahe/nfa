import React from 'react';
import { Bell, ShieldCheck, ArrowRight } from 'lucide-react';

export const PriceAlerts = () => {
  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-4xl mx-auto">
        <div className="border-b-4 border-[#121212] pb-10 mb-16">
          <h1 className="font-brand font-black text-[clamp(3rem,8vw,6rem)] uppercase tracking-tighter text-[#121212]">Price Monitor.</h1>
          <p className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] opacity-50">Real-time alerts for your target expeditions.</p>
        </div>

        <div className="border-4 border-[#121212] bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_#F4BF4B]">
           <div className="space-y-6">
              {[
                { name: "The Icelandic Drift", threshold: "₹4,500", status: "Active" },
                { name: "Himalayan Heights", threshold: "₹4,000", status: "Active" }
              ].map((alert, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-[#121212]/10 py-6 gap-4">
                   <div className="flex items-center gap-4">
                      <Bell size={20} className="text-[#9E1B1D]" />
                      <div>
                        <p className="font-black uppercase tracking-tight text-lg">{alert.name}</p>
                        <p className="font-sans font-bold text-[9px] uppercase tracking-widest text-gray-400">Trigger: Below {alert.threshold}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <span className="font-black text-[10px] uppercase text-green-700 bg-green-50 px-3 py-1 border border-green-200">{alert.status}</span>
                      <button className="font-black text-[10px] uppercase tracking-widest hover:text-[#9E1B1D]">Remove</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};