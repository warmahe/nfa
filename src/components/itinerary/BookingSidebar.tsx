import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export const BookingSidebar = ({ pkg, travelers, setTravelers }: any) => {
  const priceInt = parseInt(pkg.price.replace(/[^0-9]/g, ''));
  const total = (priceInt * travelers) + 150;

  return (
    <div className="sticky top-28 border-[4px] border-[#121212] bg-white p-6 md:p-8 shadow-[12px_12px_0px_0px_#121212]">
      
      {/* 1. Header: High Contrast Price */}
      <div className="mb-10 pb-6 border-b-2 border-gray-100">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#121212]/40 block mb-2 text-center">Cost Per Person</span>
        <div className="font-brand font-black text-6xl md:text-7xl text-[#121212] text-center tracking-tighter">
          {pkg.price}
        </div>
      </div>

      {/* 2. Selection Controls */}
      <div className="space-y-6 mb-10">
        <div className="flex flex-col gap-3">
           <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#9E1B1D]">
              <Calendar size={14}/> Departure Date
           </label>
           <div className="relative">
              <select className="w-full bg-[#FCFBF7] border-2 border-[#121212] p-4 font-bold text-sm uppercase appearance-none outline-none focus:bg-white transition-colors">
                <option>Oct 15, 2026 — Available</option>
                <option>Nov 02, 2026 — Few Seats</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">▼</div>
           </div>
        </div>

        <div className="flex flex-col gap-3">
           <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#9E1B1D]">
              <Users size={14}/> Party Size
           </label>
           <div className="flex border-2 border-[#121212] h-16 bg-[#121212]">
              <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-20 text-white hover:bg-[#F4BF4B] hover:text-[#121212] font-black text-2xl transition-colors">-</button>
              <div className="flex-1 flex items-center justify-center font-black text-lg bg-white border-x-2 border-[#121212]">{travelers}</div>
              <button onClick={() => setTravelers(travelers + 1)} className="w-20 text-white hover:bg-[#F4BF4B] hover:text-[#121212] font-black text-2xl transition-colors">+</button>
           </div>
        </div>
      </div>

      {/* 3. Cost Breakdown: Stark & Readable */}
      <div className="bg-[#FCFBF7] border-2 border-[#121212] p-6 mb-8 space-y-4">
         <div className="flex justify-between font-bold text-xs uppercase tracking-tight">
            <span className="opacity-50">Base Transfer x{travelers}</span>
            <span className="text-[#121212]">₹{ (priceInt * travelers).toLocaleString() }</span>
         </div>
         <div className="flex justify-between font-bold text-xs uppercase tracking-tight">
            <span className="opacity-50">Logistics Fee</span>
            <span className="text-[#121212]">₹150</span>
         </div>
         <div className="pt-4 border-t-2 border-[#121212] flex justify-between items-end">
            <span className="font-black text-sm uppercase tracking-widest">Total</span>
            <span className="font-brand font-black text-4xl text-[#9E1B1D]">₹{total.toLocaleString()}</span>
         </div>
      </div>

      {/* 4. Action */}
      <Link 
        to={`/booking/${pkg.id}`} 
        className="w-full bg-[#121212] text-[#F4BF4B] py-6 font-black text-xs uppercase tracking-[0.4em] flex justify-center items-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[6px_6px_0px_0px_#F4BF4B] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        BOOK THIS JOURNEY <ArrowRight size={18}/>
      </Link>

      <div className="mt-8 flex items-start gap-3 opacity-40">
         <Info size={14} className="shrink-0 mt-1"/>
         <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest">No hidden costs. 100% transparent pricing for all verified travelers.</p>
      </div>
    </div>
  );
};