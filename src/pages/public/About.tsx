import React from 'react';
import { motion } from 'motion/react';
import { Compass, Users, Map, Flame } from 'lucide-react';

export const About = () => {
  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 nfa-texture selection:bg-nfa-gold">
      
      {/* 1. KINETIC HEADER */}
      <motion.section 
        initial="hidden" animate="visible" variants={container}
        className="px-[clamp(1rem,4vw,3rem)] max-w-[1440px] mx-auto border-b-4 border-[#121212] pb-20 mb-20"
      >
        <motion.div variants={item} className="flex items-center gap-3 text-[#9E1B1D] mb-6">
           <Compass size={18} />
           <span className="font-black text-[10px] uppercase tracking-[0.3em]">The Manifesto</span>
        </motion.div>
        
        <motion.h1 variants={item} className="font-brand font-black text-[clamp(4rem,10vw,12rem)] uppercase leading-[0.8] tracking-tighter text-[#121212]">
          WE ARE NOT <br/><span className="text-[#9E1B1D] italic">A TRAVEL AGENCY.</span>
        </motion.h1>
      </motion.section>

      {/* 2. THE STORY */}
      <div className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] grid grid-cols-1 lg:grid-cols-12 gap-16">
         
         <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={container}
            className="lg:col-span-7 space-y-12"
         >
            <motion.p variants={item} className="font-brand text-3xl md:text-5xl italic text-[#121212]/90 leading-tight border-l-4 border-[#F4BF4B] pl-8">
              "We started this because we wanted more from travel. More soul. More depth. More connection."
            </motion.p>
            
            <motion.p variants={item} className="font-sans text-lg md:text-xl text-[#121212]/70 leading-relaxed">
              We’ve walked these paths, ridden these roads, and chased these sunsets. Every journey we craft comes from real experience, not a checklist. You don't just 'book' this; you apply to join. This is a movement, not a marketplace.
            </motion.p>

            {/* Grid of Values */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
               {[
                 { icon: Flame, title: "Built by Travellers", desc: "Crafted from raw experience." },
                 { icon: Users, title: "Like-Minded Groups", desc: "Stories are meant to be shared." }
               ].map((val, i) => (
                 <div key={i} className="border-2 border-[#121212] p-6 bg-white shadow-[4px_4px_0px_0px_#121212] hover:bg-[#F4BF4B] transition-colors group">
                    <val.icon className="mb-4 text-[#9E1B1D] group-hover:text-[#121212]" />
                    <h4 className="font-black text-xs uppercase tracking-widest mb-2">{val.title}</h4>
                    <p className="text-[10px] uppercase font-bold opacity-60">{val.desc}</p>
                 </div>
               ))}
            </motion.div>
         </motion.div>

         {/* 3. ASYMMETRICAL IMAGE */}
         <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
            className="lg:col-span-5 relative"
         >
            <div className="border-[4px] border-[#121212] bg-[#121212] p-2 shadow-[12px_12px_0px_0px_#9E1B1D]">
              <img 
                src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000" 
                className="w-full h-[600px] object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" 
                alt="Expedition"
              />
            </div>
            {/* Floating text stamp */}
            <div className="absolute -bottom-6 -left-6 bg-[#F4BF4B] border-2 border-[#121212] px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212]">
               Explorer-Led Expeditions
            </div>
         </motion.div>
      </div>

      {/* 4. THE PROMISE (Callout) */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-[1440px] mx-auto px-6 mt-32"
      >
        <div className="bg-[#121212] text-[#FCFBF7] p-12 md:p-20 border-[4px] border-[#F4BF4B]">
           <h2 className="font-brand font-black text-4xl md:text-6xl uppercase tracking-tighter mb-8 text-[#F4BF4B]">We are for Explorers, <br/>Not Tourists.</h2>
           <p className="font-sans font-bold text-sm md:text-base leading-relaxed max-w-2xl opacity-80">
             We curate the vibe, not just the hotels. If you are curious, respectful, and know that the best moments are unscripted, you belong here.
           </p>
        </div>
      </motion.section>
    </div>
  );
};