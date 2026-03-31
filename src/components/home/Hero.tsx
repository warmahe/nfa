import React from 'react';
import { motion } from 'motion/react';
import { Compass, ArrowDownRight, Globe2 } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col border-b-4 border-nfa-charcoal">
      {/* Grid Layout Brutalism */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Text Side */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 lg:p-16 border-b-4 lg:border-b-0 lg:border-r-4 border-nfa-charcoal relative">
          <div className="absolute top-8 left-8 flex items-center gap-2 font-sans font-bold uppercase tracking-widest text-xs">
             <Compass className="size-5" /> Est. 2024
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="mt-12"
          >
            {/* Logo Recreation in CSS */}
            <h1 
              className="font-brand text-[15vw] lg:text-[10vw] leading-[0.8] uppercase tracking-tighter text-nfa-gold"
              style={{ textShadow: '4px 4px 0px #9E1B1D, 8px 8px 0px #121212' }}
            >
              NO FIXED <br /> ADDRESS
            </h1>
            
            <p className="font-sans text-xl lg:text-3xl font-medium mt-12 max-w-xl leading-tight border-l-4 border-[#9E1B1D] pl-6">
              Reject the itinerary. <br/>
              Embrace the extreme.
            </p>

            <div className="mt-12 flex flex-wrap gap-6">
              <button className="flex items-center gap-3 bg-nfa-gold text-nfa-charcoal px-8 py-4 font-bold uppercase tracking-widest text-sm border-4 border-nfa-charcoal shadow-[8px_8px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#121212] transition-all">
                Commence <ArrowDownRight size={20} />
              </button>
              <button className="flex items-center gap-3 bg-nfa-cream text-nfa-charcoal px-8 py-4 font-bold uppercase tracking-widest text-sm border-4 border-nfa-charcoal hover:bg-nfa-charcoal hover:text-nfa-cream transition-colors">
                View Archive <Globe2 size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Image Side */}
        <div className="lg:col-span-5 relative bg-nfa-charcoal min-h-[50vh]">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200" 
            className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity"
            alt="Rugged Mountains"
          />
          {/* Brutalist Stamp */}
          <div className="absolute bottom-8 right-8 bg-[#9E1B1D] text-nfa-cream p-4 border-4 border-nfa-charcoal rotate-[-5deg] shadow-[8px_8px_0px_0px_#121212]">
            <p className="font-brand text-2xl font-black italic">RAW EARTH.</p>
          </div>
        </div>

      </div>
    </section>
  );
};