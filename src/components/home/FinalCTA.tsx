import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export const FinalCTA = () => {
  const containerRef = useRef<HTMLElement>(null);

  // --- PARALLAX TRACKING LOGIC (For Desktop 3D effect) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movements
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Map mouse movement to slight shifts. 
  // White text (Foreground) moves subtly away. Gold text (Background) pushes opposite.
  const fgX = useTransform(springX, [-1, 1], [-15, 15]);
  const fgY = useTransform(springY, [-1, 1], [-15, 15]);
  
  const bgX = useTransform(springX, [-1, 1], [25, -25]);
  const bgY = useTransform(springY, [-1, 1], [25, -25]);

  // Capture normalized mouse coordinates (-1 to 1) based on center of section
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  // --- ANIMATION VARIANTS FOR SCROLL REVEAL ---
  const dropIn = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } }
  };

  const scaleSlam = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full bg-[#D83333] flex flex-col items-center justify-center text-center overflow-hidden border-t-4 border-nfa-charcoal min-h-[70svh] py-24 md:py-32 px-[clamp(1rem,4vw,4rem)] perspective-[1000px]"
    >
      
      {/* 
        ====================================================
        KINETIC GLOBE BACKGROUND (Endless smooth rotation)
        ====================================================
      */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 md:opacity-15 pointer-events-none select-none z-0">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          className="w-[clamp(300px,120vw,900px)] h-[clamp(300px,120vw,900px)] border-[clamp(12px,2vw,24px)] border-nfa-cream rounded-full flex items-center justify-center relative overflow-hidden mix-blend-overlay"
        >
            {/* Architectural Grid Lines */}
            <div className="w-[clamp(4px,1vw,8px)] h-full bg-nfa-cream absolute left-1/2 transform -translate-x-1/2" />
            <div className="h-[clamp(4px,1vw,8px)] w-full bg-nfa-cream absolute top-1/2 transform -translate-y-1/2" />
            
            {/* Longitude / Latitude Rings */}
            <div className="w-full h-[70%] border-[clamp(12px,2vw,24px)] border-nfa-cream rounded-[100%] absolute" />
            <div className="h-full w-[70%] border-[clamp(12px,2vw,24px)] border-nfa-cream rounded-[100%] absolute" />
        </motion.div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Tiny top tag - simple fade in */}
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1 }}
          className="border border-nfa-cream/30 px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.2rem,0.5vw,0.5rem)] text-[clamp(8px,1vw,10px)] font-bold tracking-[0.4em] uppercase text-nfa-cream mb-[clamp(2rem,4vw,3rem)] backdrop-blur-sm"
        >
          Final Call
        </motion.span>
        
        {/* 
          ====================================================
          GIANT KINETIC TEXT COMPOSITION
          Uses explicit calculated overlap logic inside a standard flex box
          so mobile rendering never explodes outside boundaries.
          ====================================================
        */}
        <div className="font-brand font-black uppercase tracking-tighter mb-[clamp(3rem,6vw,5rem)] text-center select-none flex flex-col items-center justify-center leading-[0.8]">
           
           {/* Line 1 */}
           <motion.div 
             variants={dropIn} initial="hidden" whileInView="visible" viewport={{ once: true }} 
             style={{ x: fgX, y: fgY }}
             className="text-nfa-cream text-[clamp(4rem,14vw,11rem)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
           >
             STOP
           </motion.div>
           
           {/* Line 2 (Tucked upward tightly using em units for flawless scaling) */}
           <motion.div 
             variants={dropIn} initial="hidden" whileInView="visible" viewport={{ once: true }} 
             style={{ x: fgX, y: fgY }}
             className="text-nfa-cream text-[clamp(4rem,14vw,11rem)] -mt-[0.1em] drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
           >
             WAITING.
           </motion.div>

           {/* Line 3 (The Gold Impact - pushes in opposite parallax direction) */}
           <motion.div 
             variants={scaleSlam} initial="hidden" whileInView="visible" viewport={{ once: true }} 
             style={{ x: bgX, y: bgY }}
             className="text-nfa-gold text-[clamp(5rem,17vw,13rem)] -mt-[0.15em] mix-blend-lighten z-10"
           >
             START
           </motion.div>
           
           {/* Line 4 */}
           <motion.div 
             variants={dropIn} initial="hidden" whileInView="visible" viewport={{ once: true }} 
             style={{ x: fgX, y: fgY }}
             className="text-nfa-gold text-[clamp(4rem,14vw,11rem)] -mt-[0.15em] mix-blend-lighten drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
           >
             MOVING.
           </motion.div>
        </div>

        {/* 
          ====================================================
          ACTION BUTTON
          Rises gently after text resolves
          ====================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full sm:w-auto"
        >
          <button className="relative bg-nfa-gold text-nfa-charcoal w-full sm:w-auto px-[clamp(2rem,4vw,4rem)] py-[clamp(1.2rem,2vw,2rem)] font-sans font-black text-[clamp(0.8rem,1vw,1rem)] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all hover:bg-nfa-cream group shadow-[clamp(6px,1vw,12px)_clamp(6px,1vw,12px)_0px_0px_rgba(18,18,18,1)] active:translate-y-1 active:translate-x-1 active:shadow-none outline-none">
            <span className="relative z-10">Apply For the 2026 Season</span>
            {/* Subtle rugged box highlight inside the button */}
            <div className="absolute inset-1 border-2 border-nfa-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </motion.div>
        
      </div>

    </section>
  );
};