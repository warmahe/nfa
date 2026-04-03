import React from 'react';
import { Mail } from 'lucide-react';

export const OracleCTA = () => {
  return (
    <section className="relative w-full py-24 md:py-32 px-4 lg:px-12 bg-[#1A1A1A] flex justify-center items-center overflow-hidden border-b-4 border-nfa-charcoal nfa-texture">
      
      {/* Decorative background grid line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-nfa-cream/5 pointer-events-none" />
      
      {/* Brutalist Shadow Box Wrapper */}
      <div className="relative w-full max-w-4xl mx-auto group mt-8">
        
        {/* The shifted "Border Frame" layer underneath */}
        <div className="absolute top-3 left-3 md:top-6 md:left-6 w-full h-full border-[3px] md:border-4 border-nfa-gold bg-transparent pointer-events-none" />
        
        {/* The Main Content Box */}
        <div className="relative z-10 bg-nfa-cream border-[3px] md:border-4 border-nfa-charcoal p-8 md:p-12 lg:p-20 shadow-[8px_8px_0px_0px_rgba(18,18,18,0.2)] md:shadow-[12px_12px_0px_0px_rgba(18,18,18,0.2)]">
          
          {/* Top Label Tag */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#D83333] border-2 border-nfa-charcoal px-6 py-1 flex items-center gap-2 shadow-[2px_2px_0px_0px_#121212]">
             <Mail size={12} className="text-nfa-cream" />
             <span className="text-[10px] md:text-xs font-sans font-black uppercase tracking-[0.2em] text-nfa-cream">
               Dispatch / Newsletter
             </span>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-brand font-black text-[clamp(2.2rem,5vw,4.5rem)] text-nfa-charcoal uppercase leading-[0.9] tracking-tight mb-4">
              BE THE FIRST <br className="md:hidden"/> TO KNOW.
            </h2>
            <p className="font-sans text-[11px] md:text-sm uppercase tracking-widest text-nfa-charcoal/70 font-bold mb-8 md:mb-10 border-b-2 border-nfa-charcoal/10 pb-6 max-w-lg mx-auto leading-relaxed">
              Expedition slots fill up fast. Join the roster to get early access alerts before we launch them to the public.
            </p>

            {/* Clear Input Form Area */}
            <form className="flex flex-col md:flex-row gap-3 md:gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                required
                placeholder="ENTER YOUR EMAIL ADDRESS" 
                className="flex-1 bg-nfa-charcoal text-nfa-cream font-sans text-xs md:text-sm font-bold placeholder-nfa-cream/40 p-4 md:p-5 outline-none border-[3px] border-nfa-charcoal focus:border-nfa-gold transition-colors uppercase tracking-widest"
              />
              <button 
                type="submit" 
                className="bg-nfa-gold text-nfa-charcoal px-8 py-4 md:py-5 font-sans font-black text-xs md:text-sm uppercase tracking-widest hover:bg-nfa-burgundy hover:text-nfa-cream border-[3px] border-nfa-charcoal transition-all whitespace-nowrap active:scale-[0.97]"
              >
                NOTIFY ME
              </button>
            </form>

            <div className="mt-6 hidden md:flex justify-between px-2 text-[8px] uppercase tracking-[0.25em] text-nfa-charcoal/40 font-bold">
              <span>ZERO SPAM. ONLY TRAVEL.</span>
              <span>100% SECURE.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};