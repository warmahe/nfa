import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Map, Clock, Target, CreditCard } from 'lucide-react';

export const OperationalCard = ({ dest }: { dest: any }) => {
  // Map difficulty string to geometric dots
  const difficultyLevel = dest.difficulty === 'Expert' ? 3 : dest.difficulty === 'Challenging' ? 2 : 1;

  return (
    <div className="group border-[3px] border-[#121212] bg-white shadow-[6px_6px_0px_0px_#121212] flex flex-col h-full overflow-hidden transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
      
      {/* 1. Header Media Slot */}
      <div className="relative aspect-[16/10] border-b-[3px] border-[#121212] bg-[#121212] overflow-hidden shrink-0">
        <img src={dest.image} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700" alt={dest.name}/>
        <div className="absolute top-3 left-3 bg-[#F4BF4B] border-2 border-[#121212] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
           {dest.region}
        </div>
      </div>

      {/* 2. Data Payload */}
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <h3 className="font-brand font-black text-2xl md:text-3xl uppercase leading-none mb-6 tracking-tighter">
          {dest.name}
        </h3>

        {/* Data Grid: Using icons and geometric shapes */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-[#121212]/10 pt-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
               <Clock size={10} /> Duration
            </span>
            <span className="text-xs font-bold uppercase">{dest.duration}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
               <Target size={10} /> Difficulty
            </span>
            <div className="flex gap-1 mt-1">
               {[1, 2, 3].map(dot => (
                 <div key={dot} className={`size-1.5 rotate-45 border border-[#121212] ${dot <= difficultyLevel ? 'bg-[#9E1B1D]' : 'bg-transparent opacity-20'}`} />
               ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
               <CreditCard size={10} /> Investment
            </span>
            <span className="text-xs font-bold uppercase text-[#9E1B1D]">{dest.price}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
               <Map size={10} /> Status
            </span>
            <span className="text-xs font-bold uppercase truncate">{dest.visaType}</span>
          </div>
        </div>

        {/* 3. Action Strip */}
        <Link 
          to={`/itinerary/${dest.id}`}
          className="mt-auto w-full bg-[#121212] text-[#FCFBF7] py-4 px-4 font-sans font-black text-[10px] uppercase tracking-[0.3em] flex justify-between items-center hover:bg-[#9E1B1D] transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          View Full Specs <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
};