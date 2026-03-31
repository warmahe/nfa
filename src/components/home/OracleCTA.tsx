import React from 'react';

export const OracleCTA = () => {
  return (
    <section className="relative w-full py-24 md:py-32 px-4 lg:px-12 bg-[#1A1A1A] flex justify-center items-center overflow-hidden border-b-2 border-nfa-charcoal nfa-texture">
      
      {/* Decorative background grid line (subtle brutalism) */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-nfa-cream/5 pointer-events-none" />
      
      {/* Absolute positioning container for the brutalist "shadow" box */}
      <div className="relative w-full max-w-4xl mx-auto group">
        
        {/* The shifted "Border Frame" layer underneath */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 w-full h-full border-4 border-nfa-gold bg-transparent pointer-events-none" />
        
        {/* The main content box */}
        <div className="relative z-10 bg-nfa-cream border-4 border-nfa-charcoal p-8 md:p-16 lg:p-20 shadow-[12px_12px_0px_0px_rgba(18,18,18,0.2)]">
          
          {/* Top Label Tag */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#D83333] border-2 border-nfa-charcoal px-4 py-1">
             <span className="text-[10px] md:text-xs font-sans font-black uppercase tracking-[0.3em] text-nfa-cream">
               ORACLE_v.2.0
             </span>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-brand font-black text-4xl md:text-5xl lg:text-6xl text-nfa-charcoal uppercase leading-[0.9] tracking-tighter mb-4">
              FIND YOUR <br className="md:hidden"/> FREQUENCY.
            </h2>
            <p className="font-sans text-xs md:text-sm uppercase tracking-widest text-nfa-charcoal/50 font-bold mb-10 border-b border-nfa-charcoal/20 pb-4">
              Input your current state. We will calculate your next extraction point.
            </p>

            {/* Input Form Area */}
            <form className="flex flex-col md:flex-row gap-4 w-full">
              <input 
                type="text" 
                placeholder="I AM SEEKING ABSOLUTE SILENCE AND RED EARTH..." 
                className="flex-1 bg-nfa-charcoal text-nfa-cream font-sans text-xs md:text-sm font-bold placeholder-nfa-cream/40 p-5 md:p-6 outline-none border-2 border-nfa-charcoal focus:border-nfa-gold transition-colors uppercase tracking-wider"
              />
              <button 
                type="button" 
                className="bg-[#D83333] text-nfa-cream px-8 py-5 md:py-6 font-sans font-black text-xs md:text-sm uppercase tracking-widest hover:bg-nfa-gold hover:text-nfa-charcoal border-2 border-[#D83333] hover:border-nfa-charcoal transition-all whitespace-nowrap active:scale-[0.98]"
              >
                Calculate
              </button>
            </form>

            <div className="mt-6 flex justify-between px-2 text-[8px] uppercase tracking-[0.4em] text-nfa-charcoal/30 font-bold hidden md:flex">
              <span>System: Online</span>
              <span>Syncing Vectors</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};