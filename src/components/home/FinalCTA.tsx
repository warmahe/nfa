import React from 'react';

export const FinalCTA = () => {
  return (
    <section className="relative w-full bg-[#D83333] flex flex-col items-center justify-center text-center overflow-hidden border-t-4 border-nfa-charcoal min-h-[70vh] py-32 px-4 md:px-8">
      
      {/* 
        Massive CSS-based background Globe Outline.
        Made completely using borders and rounded circles for that clean architectural line-art vibe.
      */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none">
        <div className="w-[150vw] h-[150vw] md:w-[90vw] md:h-[90vw] lg:w-[85vw] lg:h-[85vw] lg:max-w-300 lg:max-h-300 border-16 md:border-24 border-nfa-cream rounded-full flex items-center justify-center relative overflow-hidden mix-blend-overlay">
            {/* Vertical Line */}
            <div className="w-1 md:w-2 h-full bg-nfa-cream absolute left-1/2 transform -translate-x-1/2" />
            {/* Horizontal Line */}
            <div className="h-[4px] md:h-[8px] w-full bg-nfa-cream absolute top-1/2 transform -translate-y-1/2" />
            {/* Ellipses */}
            <div className="w-full h-[100vw] md:h-[60vw] lg:h-[800px] border-[16px] md:border-[24px] border-nfa-cream rounded-[100%] absolute" />
            <div className="h-full w-[100vw] md:w-[60vw] lg:w-[800px] border-[16px] md:border-[24px] border-nfa-cream rounded-[100%] absolute" />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Tiny top tag */}
        <span className="border border-nfa-cream/30 px-6 py-2 text-[8px] md:text-[10px] font-bold tracking-[0.4em] uppercase text-nfa-cream mb-12">
          Final Call
        </span>
        
        {/* 
          Brutalist giant interlocking text.
          Using leading-[0.7] so the text blocks overlap exactly like the image.
        */}
        <h2 className="font-brand font-black uppercase text-[20vw] md:text-[15vw] lg:text-[11vw] leading-[0.75] tracking-tighter mb-16 md:mb-20 text-center select-none drop-shadow-2xl flex flex-col items-center justify-center">
           <span className="text-nfa-cream block">
             STOP
           </span>
           <span className="text-nfa-cream block">
             WAITING.
           </span>
           <span className="text-nfa-gold block mix-blend-lighten text-[22vw] md:text-[16vw] lg:text-[13vw]">
             START
           </span>
           <span className="text-nfa-gold block mix-blend-lighten">
             MOVING.
           </span>
        </h2>

        {/* The harsh flat-yellow action button */}
        <button className="relative bg-nfa-gold text-nfa-charcoal px-10 md:px-16 py-6 md:py-8 font-sans font-black text-sm md:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all hover:bg-nfa-cream group w-full md:w-auto shadow-[12px_12px_0px_0px_rgba(18,18,18,1)] active:translate-y-[8px] active:translate-x-[8px] active:shadow-none outline-none">
           <span className="relative z-10">Apply For the 2026 Season</span>
           {/* Internal subtle white box trace just to match editorial ruggedness */}
           <div className="absolute inset-1 border border-nfa-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

    </section>
  );
};