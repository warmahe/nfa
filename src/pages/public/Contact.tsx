import React, { useState } from 'react';
import { MapPin, Mail, Phone, ArrowRight } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="min-h-screen bg-nfa-cream pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-[1200px] mx-auto">
        
        <div className="mb-20 border-b-4 border-[#121212] pb-12">
          <h1 className="font-brand font-black text-[clamp(3rem,8vw,8rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
             CONTACT <br/><span className="text-[#9E1B1D]">PROTOCOLS.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Direct Communication Form */}
          <form className="border-[4px] border-[#121212] bg-white p-8 md:p-12 shadow-[12px_12px_0px_0px_#121212]">
             <h3 className="font-brand font-black text-2xl uppercase mb-8">Send a Dispatch</h3>
             <div className="space-y-6">
                <input type="text" placeholder="NAME" className="w-full border-2 border-[#121212] p-4 font-black uppercase text-xs tracking-widest outline-none focus:bg-[#F4BF4B]/10" />
                <input type="email" placeholder="EMAIL" className="w-full border-2 border-[#121212] p-4 font-black uppercase text-xs tracking-widest outline-none focus:bg-[#F4BF4B]/10" />
                <textarea rows={5} placeholder="MESSAGE" className="w-full border-2 border-[#121212] p-4 font-black uppercase text-xs tracking-widest outline-none focus:bg-[#F4BF4B]/10" />
                <button className="w-full bg-[#121212] text-white py-5 font-black text-xs uppercase tracking-[0.3em] hover:bg-[#9E1B1D] transition-colors shadow-[4px_4px_0px_0px_#F4BF4B]">
                   Transmit Message
                </button>
             </div>
          </form>

          {/* Contact Details Grid */}
          <div className="space-y-8">
             <div className="border-[3px] border-[#121212] bg-[#121212] text-white p-8">
                <MapPin className="text-[#F4BF4B] mb-6" />
                <h4 className="font-black uppercase tracking-widest text-xs mb-2">Global Headquarters</h4>
                <p className="font-serif italic text-xl">Geneva, Switzerland <br/> NFA Global Command Center</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="border-[3px] border-[#121212] p-6 hover:bg-[#F4BF4B] transition-colors cursor-pointer">
                   <Mail className="mb-4" />
                   <h4 className="font-black text-[10px] uppercase">Email</h4>
                   <p className="font-bold text-sm">hello@nfa.com</p>
                </div>
                <div className="border-[3px] border-[#121212] p-6 hover:bg-[#F4BF4B] transition-colors cursor-pointer">
                   <Phone className="mb-4" />
                   <h4 className="font-black text-[10px] uppercase">Secure Line</h4>
                   <p className="font-bold text-sm">+41 22 518 7000</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};