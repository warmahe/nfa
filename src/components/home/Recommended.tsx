import React from 'react';
import { DESTINATIONS } from '../../constants';
import { ArrowUpRight } from 'lucide-react';

export const Recommended = () => {
  return (
    <section className="p-6 md:p-8 lg:p-16 border-b-4 border-nfa-charcoal bg-nfa-cream">
      
      {/* 
        MODIFIED: 
        1. items-start md:items-end for better mobile stacking 
        2. Responsive text sizing (text-4xl for mobile)
      */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
        <h2 className="font-brand text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none text-nfa-charcoal">
          Selected <br className="hidden md:block"/> <span className="text-[#9E1B1D]">Targets</span>
        </h2>
        <button className="font-sans font-bold uppercase tracking-widest text-xs md:text-sm border-b-4 border-nfa-charcoal pb-1 hover:text-[#9E1B1D] hover:border-[#9E1B1D] transition-colors">
          View All Sectors
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {DESTINATIONS.slice(0, 3).map((dest) => (
          <div 
            key={dest.id} 
            
            className="group relative border-4 border-nfa-charcoal bg-nfa-cream shadow-[8px_8px_0px_0px_#121212] md:shadow-[12px_12px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 hover:shadow-[4px_4px_0px_0px_#121212] active:shadow-[4px_4px_0px_0px_#121212] transition-all cursor-pointer flex flex-col"
          >
            
            {/* Brutalist Tag */}
            <div className="absolute top-4 left-4 z-10 bg-nfa-gold border-2 border-nfa-charcoal px-3 py-1 font-bold font-sans text-xs uppercase shadow-[4px_4px_0px_0px_#121212]">
              {dest.region}
            </div>

            {/* MODIFIED: Changed h-64 to h-56 md:h-64 for better mobile proportions */}
            <div className="h-56 md:h-64 border-b-4 border-nfa-charcoal overflow-hidden bg-nfa-charcoal">
              {/* 
                MODIFIED: Removed grayscale and opacity classes.
                Added group-hover:scale-105 for a premium zoom effect.
              */}
              <img 
                src={dest.image} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                alt={dest.name} 
              />
            </div>

            <div className="p-5 md:p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="font-brand text-2xl md:text-3xl font-black uppercase leading-tight">{dest.name}</h3>
                <span className="font-sans font-bold text-[#9E1B1D] whitespace-nowrap">{dest.duration}</span>
              </div>
              
              <p className="font-sans text-sm md:text-base text-nfa-charcoal/80 font-medium mb-8 flex-1">
                {dest.description}
              </p>

              <div className="flex items-center justify-between border-t-4 border-nfa-charcoal pt-4 mt-auto">
                <span className="font-brand text-xl md:text-2xl font-black">{dest.price}</span>
                <div className="bg-nfa-charcoal text-nfa-cream p-2 md:p-3 hover:bg-[#9E1B1D] transition-colors">
                  <ArrowUpRight size={20} className="md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};