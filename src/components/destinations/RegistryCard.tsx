import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

export const RegistryCard = ({ dest }: { dest: any }) => (
  <Link to={`/itinerary/${dest.id}`} className="group border-2 md:border-4 border-nfa-charcoal bg-[#FCFBF7] p-2 md:p-3 shadow-[4px_4px_0px_0px_#121212] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_#9E1B1D] transition-all duration-300 block">
    <div className="aspect-square border-[2px] border-nfa-charcoal bg-nfa-charcoal relative overflow-hidden mb-4">
      <img src={dest.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
      <div className="absolute top-2 left-2 bg-[#F4BF4B] px-2 py-1 font-black text-[9px] uppercase tracking-widest border-2 border-nfa-charcoal shadow-[2px_2px_0px_0px_#121212]">{dest.region}</div>
    </div>
    <h3 className="font-brand font-black text-lg md:text-2xl uppercase tracking-tighter mb-2 group-hover:text-[#9E1B1D] transition-colors">{dest.name}</h3>
    <div className="flex justify-between items-center border-t border-nfa-charcoal/20 pt-3">
       <span className="text-[10px] font-black uppercase tracking-widest">{dest.duration}</span>
       <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16}/>
    </div>
  </Link>
);