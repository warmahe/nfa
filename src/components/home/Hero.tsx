  import React, { useRef } from 'react';
  import { motion, useScroll, useTransform } from 'motion/react';
  import { ChevronDown } from 'lucide-react';

  export const Hero = () => {
    const containerRef = useRef(null);
    
    // Parallax effect calculations
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
      <section 
        ref={containerRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-nfa-charcoal"
      >
        {/* Cinematic Parallax Background Image */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]"
        >
          <img 
            src="https://static.wixstatic.com/media/bac227_5e350ad8886048cd8be917eab76f0555~mv2.jpg/v1/fill/w_1351,h_542,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bac227_5e350ad8886048cd8be917eab76f0555~mv2.jpg" 
            alt="Expedition Vehicle in raw landscape"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nfa-charcoal via-transparent to-nfa-charcoal/50" />
        </motion.div>

        {/* Foreground Content */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl mx-auto"
        >
          {/* Sequence fade-in using stagger */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-nfa-gold mb-8"
          >
            More Soul. More Depth. More Connection.
          </motion.p>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="font-brand font-black text-[13vw] lg:text-[10vw] leading-[0.8] text-nfa-cream uppercase tracking-tighter drop-shadow-2xl"
          >
            We Are <span className="text-[#D83333] block md:inline">Not A</span><br/>
            <span className="italic opacity-90 text-[10vw] lg:text-[10vw]"> Travel Agency.</span>
          </motion.h1>

        </motion.div>

        {/* Cinematic Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-nfa-cream/50"
        >
          <span className="text-[8px] font-sans font-black uppercase tracking-[0.3em] mb-4">Initialize</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={24} className="text-nfa-gold" />
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 right-8 hidden md:block border-t border-white/20 pt-2 text-[8px] font-sans font-bold uppercase tracking-[0.2em] text-white/40">
          Coordinates // <br/>
          <span className="text-white/80 text-[10px]">Unmapped Territory</span>
        </div>
      </section>
    );
  };