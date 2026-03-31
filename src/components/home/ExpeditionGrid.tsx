import React from 'react';
import { DESTINATIONS } from '../../constants';
import { ArrowRight } from 'lucide-react';

export const ExpeditionGrid = () => {
  return (
    <section className="bg-nfa-charcoal py-20 md:py-32 px-4 lg:px-12 text-nfa-cream">
      <div className="max-w-screen-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 mb-16 border-t border-nfa-cream/20 pt-10 relative">
           <div className="absolute top-0 left-0 text-[8px] uppercase font-bold tracking-[0.3em] bg-nfa-charcoal -translate-y-1/2 px-2 text-nfa-gold">Active Expeditions</div>
           
           <h2 className="font-brand font-black text-5xl md:text-7xl lg:text-8xl xl:text-[7rem] leading-[0.85] text-nfa-cream uppercase tracking-tighter max-w-3xl">
              SELECT YOUR <br/><span className="text-nfa-gold">FRONTIER.</span>
           </h2>

           <p className="font-sans text-xs uppercase font-medium tracking-wider text-nfa-cream/60 max-w-xs md:text-right border-l md:border-l-0 md:border-r border-nfa-cream/20 pl-4 md:pl-0 md:pr-4">
              Limited slots available for the 2026 season. All expeditions are group-led by veteran nomads.
           </p>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
           {DESTINATIONS.slice(0, 4).map((dest) => (
             <div key={dest.id} className="group relative border-2 md:border-4 border-nfa-gold overflow-hidden h-100 md:h-125 flex flex-col justify-end bg-nfa-charcoal shadow-[8px_8px_0px_0px_rgba(244,191,75,0.2)]">
                
                {/* Red Arrow Button inside Card */}
                <button className="absolute top-4 right-4 z-20 w-10 h-10 md:w-12 md:h-12 border-2 border-nfa-cream bg-[#D83333] flex items-center justify-center text-nfa-cream hover:bg-nfa-gold transition-colors">
                  <ArrowRight size={20} />
                </button>

                {/* FULL COLOR Image */}
                <div className="absolute inset-0 z-0">
                  <img src={dest.image} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={dest.name}/>
                  <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-[#111111]" />
                </div>

                {/* Card Content Footer */}
                <div className="relative z-10 p-6 md:p-8 flex justify-between items-end">
                   <div className="flex-1 pr-4">
                     {/* The distinct left yellow line block */}
                     <div className="border-l-4 border-nfa-gold pl-4 mb-4">
                        <span className="text-[10px] uppercase font-bold text-nfa-gold tracking-[0.2em]">{dest.region}</span>
                        <h3 className="font-brand font-black text-2xl md:text-3xl lg:text-4xl text-nfa-cream uppercase mt-1 leading-none warp-break-words">{dest.name}</h3>
                     </div>
                     <p className="font-sans text-[10px] md:text-xs text-nfa-cream/60 uppercase font-medium tracking-wide border-t border-nfa-cream/20 pt-4 leading-relaxed max-w-xs line-clamp-2">
                        {dest.description}
                     </p>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-[8px] uppercase tracking-widest text-nfa-cream/50 mb-1">Starting At</p>
                     <p className="font-brand font-black text-2xl md:text-3xl text-nfa-gold">{dest.price}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
};