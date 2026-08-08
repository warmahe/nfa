import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  customImage?: string;
}

export const Hero: React.FC<HeroProps> = ({ customImage }) => {
  const defaultImage = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80";

  return (
    <section className="relative w-full overflow-x-clip bg-[#FCFBF7] border-b-4 border-[#121212] min-h-[calc(100svh-72px)] md:min-h-[calc(100svh-80px)] px-[clamp(16px,3vw,48px)] pt-[clamp(20px,4vw,40px)] pb-[clamp(24px,4vw,48px)]">
      {/* Background Architectural Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #121212 1px, transparent 1px), linear-gradient(to bottom, #121212 1px, transparent 1px)`,
          backgroundSize: 'clamp(18px,2.4vw,34px) clamp(18px,2.4vw,34px)'
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-350 min-h-[calc(100svh-120px)] grid items-center gap-[clamp(20px,3vw,48px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.85fr)]">

        {/* Left Headline & Body */}
        <div className="min-w-0 self-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-brand font-black uppercase tracking-tight text-transparent leading-[0.88] text-[clamp(2.8rem,6.8vw,6.5rem)]"
            style={{ WebkitTextStroke: '2px #121212' }}
          >
            ANYONE CAN
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="font-brand font-black uppercase tracking-tight text-[#121212] leading-[0.86] text-[clamp(2.8rem,6.5vw,6.2rem)]"
          >
            PLAN A TRIP.
          </motion.h1>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="relative mt-3 sm:mt-4 w-fit max-w-full -rotate-1"
          >
            <div className="relative bg-[#F4BF4B] border-[3px] md:border-4 border-[#121212] px-[clamp(14px,2.4vw,34px)] py-[clamp(10px,1.6vw,20px)] shadow-[6px_6px_0px_0px_#121212]">
              <h1 className="font-brand font-black uppercase text-[#121212] leading-[0.85] tracking-tight text-[clamp(2rem,5vw,5.2rem)]">
                WE ACTUALLY BUILD ONE.
              </h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="mt-[clamp(20px,3vw,34px)] flex max-w-xl flex-col gap-5"
          >
            <p className="bg-white/90 p-4 border-2 border-[#121212] font-sans font-bold text-xs md:text-sm text-[#121212]/80 leading-relaxed shadow-[4px_4px_0px_0px_#121212]">
              Anyone can put together an itinerary now. AI can do it in ten seconds. You can do it yourself at midnight with fifteen tabs open. <br /><br />
              <span className="text-[#9E1B1D]">What you can't do is get in where we get in.</span> Stays that aren't listed anywhere. Experiences you won't find by searching. Access that only comes from years of relationships on the ground. And somehow, we still cost less than the version you'd have booked yourself.
            </p>

            <Link
              to="/contact"
              className="group inline-flex w-fit items-center justify-center gap-3 bg-[#121212] text-[#FCFBF7] border-2 border-[#121212] px-8 py-4 text-xs font-sans font-black uppercase tracking-[0.2em] shadow-[5px_5px_0px_0px_#F4BF4B] hover:bg-[#9E1B1D] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              PLAN YOUR TRIP
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right Feature Card */}
        <div className="flex min-w-0 items-center justify-center lg:justify-end mt-4 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 3 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[480px] aspect-4/5"
          >
            <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 border-[3px] border-[#9E1B1D] pointer-events-none" />
            <div className="absolute inset-0 border-[3px] border-[#121212] bg-[#121212] p-3 shadow-[8px_8px_0px_0px_#121212]">
              <img src={customImage || defaultImage} alt="Expedition" className="h-full w-full object-cover object-center grayscale-[20%]" />

              {/* Badge */}
              <div className="absolute -left-3 bottom-4 z-20 flex items-center gap-2 rotate-[-6deg] border-2 border-[#121212] bg-[#F4BF4B] px-4 py-3 shadow-[4px_4px_0px_0px_#121212]">
                <Zap size={16} className="text-[#9E1B1D]" fill="currentColor" />
                <span className="font-brand font-black uppercase text-xs md:text-sm text-[#121212] tracking-wider">
                  BUILT FROM SCRATCH
                </span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};