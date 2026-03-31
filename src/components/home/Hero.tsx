import React from 'react';
import { motion } from 'motion/react';

export const Hero = () => {
  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen bg-nfa-charcoal flex flex-col items-center justify-center px-4 overflow-hidden py-20 border-b border-nfa-cream/10">
      
      {/* Grain/Star texture hint */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col items-center text-center">
        <span className="border border-white/20 text-white/50 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1 mb-8">
          Established in the unknown
        </span>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full flex flex-col items-center font-brand font-black uppercase tracking-tighter leading-[0.85]"
        >
          <h1 className="text-nfa-cream text-[18vw] md:text-[15vw] lg:text-[12rem] whitespace-nowrap mb-0">
            THE WORLD
          </h1>
          <h2 className="text-nfa-cream text-[12vw] md:text-[10vw] lg:text-[8rem] mt-[-2vw] mb-0">
            IS
          </h2>
          <h2 className="text-nfa-gold text-[16vw] md:text-[14vw] lg:text-[11rem] mt-[-1vw]">
            NOT A MAP.
          </h2>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 border-t border-white/20 pt-2 text-[8px] font-sans font-bold uppercase tracking-[0.2em] text-white/40">
        Coordinates // <br/>
        <span className="text-white/80 text-[10px]">00.0000° N, 00.0000° E</span>
      </div>
    </section>
  );
};