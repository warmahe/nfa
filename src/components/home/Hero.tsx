import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDownRight, Crosshair, Activity, Fingerprint } from 'lucide-react';

export const Hero = () => {
  const containerRef = useRef(null);

  // Setup Scroll-based "Out" Animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"] // Triggers as container leaves top of screen
  });

  // Transform values for scrolling away
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const yImageWrapper = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Hard, "snapping" animation curves for the initial load
  const brutalistSnap = { duration: 0.6, ease: [0.19, 1, 0.22, 1] };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex flex-col bg-nfa-cream border-b-4 border-nfa-charcoal overflow-hidden pt-20 lg:pt-0 text-nfa-charcoal"
    >
      
      {/* 1. Infinite Ticker Tape Mantra */}
      <motion.div 
        style={{ opacity: opacityOut }}
        className="border-b-4 border-nfa-charcoal bg-nfa-gold py-2 flex whitespace-nowrap overflow-hidden items-center mt-[-2px] relative z-20"
      >
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
          className="flex gap-4 font-sans font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em]"
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex gap-4 items-center">
              MORE SOUL <span className="text-[#9E1B1D]">✦</span> MORE DEPTH <span className="text-[#9E1B1D]">✦</span> MORE CONNECTION <span className="text-[#9E1B1D]">✦</span>
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* 2. Main Dossier Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full h-full relative z-10">
        
        {/* Left Typography Block */}
        <motion.div 
          style={{ y: yText, opacity: opacityOut }}
          className="lg:col-span-6 flex flex-col justify-center p-6 md:p-10 lg:p-16 xl:p-24 relative lg:border-r-4 border-nfa-charcoal"
        >
          
          {/* Top Dossier Label with Flashing "Live" dot */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3">
             <div className="font-sans font-bold uppercase tracking-widest text-[8px] md:text-[10px] border border-nfa-charcoal px-3 py-1 shadow-[2px_2px_0px_0px_#121212] bg-nfa-cream">
               Dossier No. 01 // Objective
             </div>
             <motion.div 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ duration: 2, repeat: Infinity }} 
                className="size-2 rounded-full bg-[#9E1B1D] border border-[#121212]" 
             />
          </div>

          <div className="mt-12 md:mt-8 relative">
            <div className="overflow-hidden pb-2">
              <motion.h1 
                initial={{ y: "110%", rotateZ: 2 }}
                animate={{ y: 0, rotateZ: 0 }}
                transition={brutalistSnap}
                className="font-brand font-black text-[15vw] lg:text-[7.5vw] xl:text-[8vw] uppercase leading-[0.85] tracking-tighter"
              >
                WE ARE <br className="hidden md:block"/>
                NOT A
              </motion.h1>
            </div>
            
            <div className="overflow-hidden flex items-end gap-4 mt-2 md:mt-0 pb-2">
              <motion.h1 
                initial={{ y: "110%", rotateZ: 2 }}
                animate={{ y: 0, rotateZ: 0 }}
                transition={{ ...brutalistSnap, delay: 0.1 }}
                className="font-brand font-black text-[15vw] lg:text-[7.5vw] xl:text-[8vw] uppercase leading-[0.85] tracking-tighter text-transparent bg-clip-text"
                style={{ WebkitTextStroke: '2px #121212' }}
              >
                TRAVEL
              </motion.h1>
            </div>

            {/* The Crossed-out "AGENCY" word */}
            <div className="relative inline-block mt-1">
              <motion.h1 
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ ...brutalistSnap, delay: 0.2 }}
                className="font-brand font-black text-[15vw] lg:text-[8vw] xl:text-[9vw] uppercase leading-[0.85] tracking-tighter text-nfa-charcoal/20"
              >
                AGENCY.
              </motion.h1>
              
              {/* Aggressive Red Strikethrough Animation */}
              <motion.div 
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
                className="absolute top-[45%] left-[-5%] w-[110%] h-[8px] md:h-[12px] bg-[#9E1B1D] origin-left shadow-[2px_4px_0px_rgba(18,18,18,0.2)] rotate-[-2deg]"
              />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="mt-10 lg:mt-16 border-t-4 border-nfa-charcoal pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
             <div className="flex flex-col gap-2">
               <p className="font-sans font-bold uppercase tracking-widest text-[9px] md:text-xs text-nfa-charcoal max-w-[200px] leading-relaxed">
                 For travelers who refuse the standard script.
               </p>
               {/* Decorative Barcode / ID Line */}
               <div className="flex items-center gap-2 text-nfa-charcoal/40 mt-2">
                 <Fingerprint size={16} />
                 <div className="h-4 w-[1px] bg-nfa-charcoal/40" />
                 <div className="font-mono text-[8px] tracking-[0.4em] uppercase font-bold">AUTH_REQ_77X</div>
               </div>
             </div>
             
             {/* Read Manifesto Prompt */}
             <motion.div 
               whileHover={{ x: 10 }}
               className="flex items-center gap-4 cursor-pointer group"
             >
               <div className="w-12 h-12 bg-nfa-charcoal flex items-center justify-center rounded-none border-2 border-transparent group-hover:bg-nfa-cream group-hover:border-nfa-charcoal transition-all shadow-[4px_4px_0px_0px_#9E1B1D] active:translate-x-1 active:translate-y-1 active:shadow-none">
                  <ArrowDownRight size={24} className="text-nfa-cream group-hover:text-nfa-charcoal transition-colors" />
               </div>
               <span className="font-sans font-black text-xs uppercase tracking-widest text-nfa-charcoal border-b-2 border-transparent group-hover:border-[#9E1B1D] transition-colors pb-1">
                 Manifesto
               </span>
             </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Defender Image Frame */}
        <motion.div 
          style={{ y: yImageWrapper }}
          className="lg:col-span-6 relative w-full h-[50vh] lg:h-auto border-t-4 lg:border-t-0 border-nfa-charcoal overflow-hidden p-6 md:p-12 lg:p-16 bg-nfa-charcoal nfa-texture flex flex-col items-center justify-center"
        >
                      
           <motion.div 
             initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
             animate={{ scale: 1, opacity: 1, rotate: 0 }}
             transition={{ delay: 0.4, duration: 0.8, type: "spring", bounce: 0.4 }}
             className="w-full h-full md:h-[85%] relative z-10 group cursor-crosshair"
           >
             {/* Offset brutalist yellow shadow box */}
             <motion.div 
                whileHover={{ x: 8, y: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="absolute inset-0 bg-nfa-gold translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6 border-4 border-[#121212]" 
             />
             
             {/* Actual Image Box */}
             <div className="absolute inset-0 border-4 border-[#121212] bg-[#121212] overflow-hidden">
               <motion.img 
                 style={{ scale: scaleImage }}
                 src="https://static.wixstatic.com/media/bac227_5e350ad8886048cd8be917eab76f0555~mv2.jpg/v1/fill/w_1351,h_542,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bac227_5e350ad8886048cd8be917eab76f0555~mv2.jpg"
                 className="w-full h-full object-cover object-center filter sepia-[0.2] contrast-125 saturate-50"
                 alt="Offroad Expedition Vehicle"
               />
               
               {/* Internal dark vignette & targeting UI elements */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 mix-blend-multiply" />
               <Crosshair size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-nfa-cream/30 mix-blend-overlay" strokeWidth={1} />
             </div>
           </motion.div>
           
           {/* Classified markings & Out Animations text */}
           <motion.div 
              style={{ opacity: opacityOut }}
              className="absolute bottom-6 left-6 flex items-end gap-4 text-white opacity-40 mix-blend-overlay"
           >
              <Activity size={32} className="text-[#D83333]" />
              <span className="font-mono text-[8px] md:text-[10px] tracking-[0.4em] uppercase font-bold flex flex-col">
                <span>COORD_LK: N 64.13 // W 21.94</span>
                <span className="text-nfa-gold mt-1">STATUS: OPERATIONAL</span>
              </span>
           </motion.div>
        </motion.div>

      </div>
    </section>
  );
};