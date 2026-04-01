import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Users, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutBrand = () => {
  // Motion settings for reusable smooth fade-ups
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="bg-nfa-charcoal text-nfa-cream py-24 md:py-40 px-6 lg:px-12 border-b border-nfa-cream/10 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-nfa-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto">
        
        {/* Statement 1: Center Aligned Giant Quote */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center mb-32 md:mb-48"
        >
          <h2 className="font-brand font-black text-4xl md:text-5xl lg:text-7xl leading-[1.1] tracking-tighter uppercase mb-8">
            The adventure is the framework, but the <span className="text-nfa-gold italic">connections are the magic.</span>
          </h2>
          <p className="font-sans text-base md:text-xl text-nfa-cream/60 leading-relaxed max-w-2xl mx-auto">
            We learned that the most powerful journeys are defined by the people you share them with. That's why we're obsessed with curating small, like-minded groups. This is travel that changes you.
          </p>
        </motion.div>

        {/* 2-Column Split: Image Left, Manifesto Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column - Cinematic Image Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative order-2 lg:order-1 h-125 md:h-175 w-full"
          >
            <div className="absolute inset-0 border border-nfa-gold/30 translate-x-4 translate-y-4" />
            <img 
              src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-125"
              alt="Raw Expedition Collective"
            />
            {/* Small floating tag */}
            <div className="absolute bottom-6 left-6 bg-[#D83333] px-4 py-2 text-nfa-cream text-[10px] font-sans font-black uppercase tracking-[0.2em] shadow-lg">
              Not For Tourists
            </div>
          </motion.div>

          {/* Right Column - Scrolling Copy Sequence */}
          <div className="order-1 lg:order-2 flex flex-col justify-center space-y-16">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-4 text-[#D83333]">
                <Flame size={20} />
                <h3 className="font-sans text-xs font-black uppercase tracking-[0.2em]">Built by Travellers</h3>
              </div>
              <h4 className="font-brand font-black text-3xl md:text-4xl text-nfa-gold uppercase tracking-tight mb-4 leading-none">Built For Explorers.</h4>
              <p className="font-sans text-nfa-cream/70 leading-relaxed text-sm md:text-base">
                We’ve walked these paths, ridden these roads, and chased these sunsets. Every journey we craft comes from real experience, not a checklist. We built this because it's what we wanted and couldn't find.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-4 text-[#D83333]">
                <Users size={20} />
                <h3 className="font-sans text-xs font-black uppercase tracking-[0.2em]">A Closed Ecosystem</h3>
              </div>
              <h4 className="font-brand font-black text-3xl md:text-4xl text-nfa-cream uppercase tracking-tight mb-4 leading-none">You Don't 'Book' This.</h4>
              <p className="font-sans text-nfa-cream/70 leading-relaxed text-sm md:text-base">
                You apply to join. This is a movement, not a marketplace, and we protect our community. We don't just handle the logistics; we curate the vibe. We're looking for people who know the best moments are unscripted.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
              className="pt-8 border-t border-white/10"
            >
              <Link 
                to="/destinations" 
                className="group inline-flex items-center justify-center bg-nfa-gold text-nfa-charcoal px-8 py-5 font-sans font-black text-xs md:text-sm uppercase tracking-widest hover:bg-nfa-cream transition-colors duration-300 w-full md:w-auto shadow-[6px_6px_0px_0px_rgba(216,51,51,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                View Expeditions
                <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
};