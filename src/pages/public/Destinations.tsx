import React, { useState } from "react";
import { useDestinations } from "../../hooks/useDestinations";
import { OperationalCard } from "../../components/destinations/OperationalCard";
import { SlidersHorizontal, X, Target, Map as MapIcon, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Destinations = () => {
  const { filtered, region, setRegion, difficulty, setDifficulty } = useDestinations();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-#FCFBF7 pt-2 md:pt-2 pb-24 nfa-texture">
      
      {/* 1. HEADER SECTION */}
      <div className="max-w-[1440px] mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="relative">
          
          <h1 className="font-brand font-black uppercase text-[clamp(3.5rem,8vw,8rem)] leading-[0.8] tracking-tighter text-[#121212]">
             TARGET <br/><span className="text-[#F4BF4B] drop-shadow-[2px_2px_0px_#121212]">SECTORS.</span>
          </h1>
        </div>

        {/* Modular Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="group flex items-center gap-4 bg-[#121212] text-[#FCFBF7] px-8 py-4 border-2 border-[#121212] shadow-[6px_6px_0px_0px_#F4BF4B] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
           <span className="font-sans font-black text-xs uppercase tracking-widest">Adjust Parameters</span>
           <SlidersHorizontal size={18} className="text-[#F4BF4B]" />
        </button>
      </div>

      {/* 2. DYNAMIC GRID: 2x2 Mobile / 4x4 Desktop */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {filtered.map(dest => (
          <OperationalCard key={dest.id} dest={dest} />
        ))}
      </div>

      {/* 3. SLIDE-IN FILTER DRAWER */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-[#121212]/60 backdrop-blur-sm z-[1000]"
            />
            
            {/* Drawer Panel */}
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#FCFBF7] z-[1001] border-l-[6px] border-[#121212] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                 <h2 className="font-brand font-black text-4xl uppercase tracking-tighter">PARAMETERS</h2>
                 <button onClick={() => setIsFilterOpen(false)} className="p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
                   <X size={24} />
                 </button>
              </div>

              {/* Region Select */}
              <div className="mb-10">
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-6 flex items-center gap-2">
                   <MapIcon size={14} /> Select Sector
                </h4>
                <div className="flex flex-col gap-2">
                  {["ALL", "NORDIC", "ASIA", "SOUTH AMERICA"].map(r => (
                    <button 
                      key={r} onClick={() => setRegion(r)}
                      className={`text-left px-6 py-4 font-bold text-xs tracking-widest border-2 transition-all ${
                        region === r ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-transparent hover:border-[#121212]/20'
                      }`}
                    >
                      {r} {region === r && <ChevronRight size={14} className="inline ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Select */}
              <div className="mb-10">
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-6 flex items-center gap-2">
                   <Target size={14} /> Intensity Level
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["ALL", "EASY", "MODERATE", "CHALLENGING", "EXPERT"].map(d => (
                    <button 
                      key={d} onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 font-black text-[9px] tracking-tighter border-2 transition-all ${
                        difficulty === d ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-[#121212]/20 hover:border-[#121212]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="mt-auto w-full bg-[#9E1B1D] text-white py-6 font-sans font-black text-sm uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_#121212]"
              >
                Apply Parameters
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};