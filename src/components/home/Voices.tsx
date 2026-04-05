import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { REVIEWS } from '../../utils/constants';
import { Quote, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Voices = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);

  const DURATION = 8000; // 8 seconds per slide

  // Handle auto-advance
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
    }, DURATION);
    return () => clearInterval(timer);
  }, [isHovered, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  // Framer motion variants for hard sliding
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      rotateY: dir > 0 ? 10 : -10,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      rotateY: dir < 0 ? -10 : 10,
    })
  };

  return (
    <section className="bg-nfa-gold py-16 md:py-32 px-[clamp(1rem,4vw,3rem)] text-nfa-charcoal border-t-4 border-b-4 border-nfa-charcoal relative overflow-hidden nfa-texture">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-nfa-burgundy/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-300 mx-auto flex flex-col items-center">
        
        {/* ======================= */}
        {/* HEADER                  */}
        {/* ======================= */}
        <div className="border-2 border-nfa-charcoal bg-nfa-cream px-6 py-1.5 mb-8 md:mb-12 shadow-[3px_3px_0px_0px_#121212] -rotate-2">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-nfa-charcoal">
            Intercepted Field Logs
          </span>
        </div>
        
        <h2 className="font-brand font-black text-[clamp(2.5rem,8vw,7rem)] tracking-tighter uppercase text-center mb-10 md:mb-16 leading-[0.85] drop-shadow-xl text-nfa-charcoal">
          VOICES FROM <br/> <span className="text-nfa-burgundy italic">THE FIELD.</span>
        </h2>

        {/* ======================= */}
        {/* INTERACTIVE CAROUSEL    */}
        {/* ======================= */}
        <div 
          className="relative w-full max-w-5xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Active Status & Timer Bar (Brutalist style) */}
          <div className="absolute -top-6 md:-top-8 left-0 w-full flex justify-between items-center px-1 mb-2">
            <span className="font-mono text-[8px] md:text-[10px] uppercase font-bold tracking-[0.3em] text-nfa-burgundy animate-pulse">
              {isHovered ? "[ SYSTEM PAUSED ]" : "[ AUTO-SEQ INITIATED ]"}
            </span>
            <span className="font-sans font-black text-[10px] md:text-sm tracking-widest text-nfa-charcoal/50">
              LOG {currentIndex + 1} / {REVIEWS.length}
            </span>
          </div>

          <div className="w-full bg-nfa-charcoal/5 h-1 border border-nfa-charcoal mb-4 overflow-hidden relative hidden md:block">
            <motion.div 
               className="h-full bg-nfa-burgundy origin-left"
               key={currentIndex}
               initial={{ scaleX: 0 }}
               animate={{ scaleX: isHovered ? [null] : 1 }}
               transition={{ duration: DURATION / 1000, ease: "linear" }}
               style={{ scaleX: isHovered ? "var(--current-scale, 1)" : undefined }}
            />
          </div>

          {/* Master Display Box */}
          <div className="bg-nfa-cream border-4 border-nfa-charcoal shadow-[clamp(8px,1vw,16px)_clamp(8px,1vw,16px)_0px_0px_rgba(158,27,29,1)] flex flex-col md:flex-row relative min-h-112.5 md:min-h-87.5">
             
             {/* Main Text Content */}
             <div className="flex-1 p-[clamp(1.5rem,4vw,4rem)] flex flex-col justify-center overflow-hidden relative">
                
                <Quote className="text-nfa-burgundy/20 absolute top-[clamp(1rem,3vw,3rem)] left-[clamp(1rem,3vw,3rem)] w-30 h-30 md:w-50 md:h-50 -rotate-12 pointer-events-none" fill="currentColor"/>
                
                <div className="relative z-10 w-full perspective-[1000px]">
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full"
                    >
                      <p className="font-brand italic font-black text-[clamp(1.2rem,3.5vw,2.5rem)] leading-snug text-nfa-charcoal mb-8 border-l-4 border-nfa-burgundy pl-4 md:pl-6">
                        "{REVIEWS[currentIndex].content}"
                      </p>
                      
                      <div className="flex items-center gap-4 border-t-2 border-nfa-charcoal/20 pt-6">
                         {REVIEWS[currentIndex].avatar && (
                           <img 
                            src={REVIEWS[currentIndex].avatar} 
                            alt={REVIEWS[currentIndex].author}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-none border-2 border-nfa-charcoal grayscale contrast-125 object-cover hidden sm:block" 
                           />
                         )}
                         <div>
                           <h4 className="font-sans font-black text-sm md:text-xl uppercase text-nfa-charcoal tracking-tight">
                             {REVIEWS[currentIndex].author}
                           </h4>
                           <p className="font-sans text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-nfa-burgundy mt-1 bg-nfa-burgundy/10 px-2 py-0.5 w-fit">
                             {REVIEWS[currentIndex].role}
                           </p>
                         </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

             </div>

             {/* Right/Bottom Desktop Controls Grid */}
             <div className="flex md:flex-col border-t-4 md:border-t-0 md:border-l-4 border-nfa-charcoal bg-nfa-gold shrink-0">
               <button 
                 onClick={handlePrev}
                 className="flex-1 p-6 md:p-8 border-r-4 md:border-r-0 md:border-b-4 border-nfa-charcoal flex items-center justify-center hover:bg-nfa-burgundy hover:text-nfa-cream text-nfa-charcoal transition-colors active:scale-95 group"
                 aria-label="Previous Review"
               >
                 <ArrowLeft className="w-8 h-8 md:w-10 md:h-10 group-hover:-translate-x-1 transition-transform" />
               </button>
               <button 
                 onClick={handleNext}
                 className="flex-1 p-6 md:p-8 flex items-center justify-center hover:bg-nfa-burgundy hover:text-nfa-cream text-nfa-charcoal transition-colors active:scale-95 group"
                 aria-label="Next Review"
               >
                 <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" />
               </button>
             </div>
          </div>
        </div>

        {/* ======================= */}
        {/* VIEW ALL CTA BUTTON     */}
        {/* ======================= */}
        <div className="mt-16 md:mt-24">
           <Link 
             to="/testimonials" 
             className="relative inline-flex items-center gap-4 bg-nfa-charcoal text-nfa-cream border-2 md:border-4 border-nfa-charcoal px-8 py-5 md:px-12 md:py-6 shadow-[clamp(6px,1vw,10px)_clamp(6px,1vw,10px)_0px_0px_rgba(252,251,247,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
           >
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-nfa-gold" />
              <span className="font-sans font-black text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em]">
                 ACCESS ALL DECLASSIFIED LOGS
              </span>
           </Link>
        </div>

      </div>
    </section>
  );
};