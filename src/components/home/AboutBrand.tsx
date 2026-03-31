import React from 'react';
import { Quote } from 'lucide-react';

export const AboutBrand = () => {
  return (
    <section className="bg-nfa-cream py-20 md:py-32 px-4 lg:px-12 border-b-2 border-nfa-charcoal/10">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Image / Graphic Side */}
        <div className="relative w-full max-w-md mx-auto lg:max-w-none order-2 lg:order-1 mt-12 lg:mt-0">
          <div className="absolute -inset-4 bg-nfa-gold -rotate-3 border-4 border-nfa-charcoal hidden md:block" />
          <div className="relative border-4 border-nfa-charcoal bg-nfa-charcoal p-2 md:p-3 shadow-[8px_8px_0px_0px_#121212] z-10 rotate-1">
            {/* FULL COLOR IMAGE */}
            <img 
              src="https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1000" 
              alt="Mountain range"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
          
          {/* Overlapping Red Box */}
          <div className="absolute -bottom-8 -right-4 md:-bottom-12 md:-right-8 w-24 h-24 md:w-32 md:h-32 bg-[#D83333] border-4 border-nfa-charcoal flex items-center justify-center z-20 shadow-[6px_6px_0px_0px_#121212] rotate-[-5deg]">
             <Quote className="size-10 md:size-16 text-nfa-cream opacity-90" />
          </div>
        </div>

        {/* Text Side */}
        <div className="order-1 lg:order-2 flex flex-col justify-center">
          <div className="border border-nfa-charcoal/20 inline-block px-4 py-1 mb-8 self-start text-[8px] md:text-[10px] font-black tracking-[0.3em] text-nfa-charcoal/60 uppercase">
            Our Philosophy
          </div>
          
          <h2 className="font-brand font-black text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.85] text-nfa-charcoal uppercase tracking-tighter mb-8">
            MODERN <br/> NOMADIC <br/> <span className="text-[#D83333]">HERITAGE.</span>
          </h2>
          
          <p className="font-brand italic text-lg md:text-xl text-nfa-charcoal/80 mb-12 max-w-lg leading-relaxed">
            We don't travel to escape life, but for life not to escape us. Our expeditions are built on the pillars of resilience, community, and the raw pursuit of the unmapped. We are not tourists; we are temporary locals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-nfa-charcoal pt-8">
            <div>
              <h3 className="font-sans font-black text-lg md:text-xl uppercase tracking-tight text-nfa-charcoal mb-2">RADICAL TRUTH</h3>
              <p className="font-sans text-xs md:text-sm text-nfa-charcoal/60 leading-snug">No filters. No staged moments. Just the raw reality of the road.</p>
            </div>
            <div>
              <h3 className="font-sans font-black text-lg md:text-xl uppercase tracking-tight text-nfa-charcoal mb-2">DEEP ROOTS</h3>
              <p className="font-sans text-xs md:text-sm text-nfa-charcoal/60 leading-snug">Connecting with the heritage of the lands we traverse.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};