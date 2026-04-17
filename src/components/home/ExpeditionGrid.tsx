import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpeditionGrid = ({ customItems }: { customItems?: any[] }) => {
  return (
    <section className="bg-nfa-charcoal py-16 md:py-24 px-[clamp(0.5rem,3vw,3rem)] text-nfa-cream border-t-[6px] border-nfa-gold relative overflow-hidden">
      
      {/* Immersive background architectural mesh */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, #FCFBF7 1px, transparent 0)`,
          backgroundSize: '24px 24px' 
        }}
      />

      <div className="max-w-360 mx-auto relative z-10">
        
        {/* ======================= */}
        {/* EDITORIAL HEADER BLOCK  */}
        {/* ======================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-[clamp(1rem,4vw,3rem)] mb-8 md:mb-16 px-2">
           
           <div className="relative pt-6 w-full max-w-4xl">

             
             <h2 className="font-brand font-black text-[clamp(2rem,7vw,7.5rem)] leading-[0.85] text-nfa-cream uppercase tracking-tighter drop-shadow-xl mt-4">
                LOCATE YOUR <br className="hidden md:block"/><span className="text-nfa-gold">DROP ZONE.</span>
             </h2>
           </div>

           <p className="font-sans text-[clamp(0.6rem,1.2vw,0.85rem)] uppercase font-bold tracking-[0.15em] text-nfa-cream/60 max-w-70 leading-relaxed md:text-right border-l-[3px] border-nfa-burgundy pl-3 md:border-l-0 md:pl-0 mt-4 md:mt-0">
              No scripts. No safety nets. These coordinates represent total isolation. Evaluate readiness before engagement.
           </p>
        </div>


        {/* ============================== */}
        {/* STRICT 2x2 RESPONSIVE CARD GRID */}
        {/* ============================== */}
        {/* base is grid-cols-2 forcing mobile into 2 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-8 w-full">
           {customItems?.map((dest) => (
             <Link 
               to={`/itinerary/${dest.id}`} 
               key={dest.id} 
               className="group relative border-2 sm:border-[3px] border-nfa-gold overflow-hidden bg-nfa-charcoal aspect-4/5 flex flex-col justify-between shadow-[4px_4px_0px_0px_#9E1B1D] sm:shadow-[6px_6px_0px_0px_#9E1B1D] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-200"
             >
                
                {/* 1. Upper Data Strip */}
                <div className="absolute top-0 w-full flex justify-between items-start z-30 p-2 sm:p-4">
                  <span className="bg-nfa-gold border border-nfa-charcoal text-nfa-charcoal px-1.5 py-0.5 sm:px-3 sm:py-1 text-[6px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-[1px_1px_0px_0px_#121212] md:shadow-[2px_2px_0px_0px_#121212]">
                    [ {dest.difficulty} ]
                  </span>
                  
                  <div className="w-6 h-6 sm:w-10 sm:h-10 border-[1.5px] border-nfa-charcoal bg-nfa-cream group-hover:bg-nfa-burgundy group-hover:text-nfa-cream text-nfa-charcoal flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>

                <div className="absolute inset-0 z-0 bg-nfa-charcoal">
                  <img 
                    src={dest.media?.thumbnail} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 opacity-80 group-hover:opacity-100 transition-all duration-600" 
                    alt={dest.title}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-nfa-charcoal/30 via-transparent to-nfa-charcoal/95" />
                </div>

                {/* 3. Aggressively Compact Payload for 2x2 Fitting */}
                <div className="relative z-10 mt-auto p-2 sm:p-5 md:p-6 w-full flex flex-col">
                   
                   <div className="border-t-2 sm:border-t-[3px] border-nfa-burgundy pt-2 sm:pt-4 mb-3 sm:mb-6">
                     <h3 className="font-brand font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl text-nfa-cream uppercase leading-[0.9] tracking-tight w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
                        {dest.title}
                     </h3>
                   </div>
                   
                   <div className="grid grid-cols-2 items-end border-t border-nfa-cream/15 pt-2 sm:pt-4">
                      
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <span className="font-sans text-[7px] sm:text-[9px] md:text-xs font-black tracking-widest sm:tracking-[0.2em] uppercase text-nfa-cream">
                           {dest.duration}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <span className="block text-[5px] sm:text-[7px] md:text-[9px] text-nfa-cream/60 tracking-[0.2em] uppercase mb-0.5 sm:mb-1">Engage</span>
                        <span className="font-brand font-black text-[12px] sm:text-xl md:text-2xl lg:text-3xl leading-none text-nfa-gold">
                          ₹{dest.pricing?.basePrice.toLocaleString()}
                        </span>
                      </div>
                      
                   </div>
                </div>

             </Link>
           ))}
        </div>

        {/* ==================================== */}
        {/* VIEW ITINERARIES GLOBAL CALL TO ACTION */}
        {/* ==================================== */}
        <div className="mt-10 sm:mt-16 md:mt-24 w-full flex justify-center px-2">
           <Link 
             to="/destinations" 
             className="w-full md:w-auto relative group bg-nfa-gold border-2 sm:border-[3px] border-nfa-cream text-nfa-charcoal flex items-center justify-center p-[clamp(1rem,2vw,1.5rem)] overflow-hidden shadow-[4px_4px_0px_0px_#9E1B1D] sm:shadow-[clamp(6px,1vw,8px)_clamp(6px,1vw,8px)_0px_0px_#9E1B1D] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0.75 active:translate-y-0.75 active:shadow-none transition-all duration-200"
           >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.1)_4px,rgba(0,0,0,0.1)_8px)] z-0 pointer-events-none" />
              
              <span className="relative z-10 font-sans font-black text-[clamp(0.7rem,1.2vw,1.1rem)] uppercase tracking-[0.15em] sm:tracking-[0.25em] text-center">
                 ACCESS ALL ITINERARY FILES
              </span>
           </Link>
        </div>

      </div>
    </section>
  );
};