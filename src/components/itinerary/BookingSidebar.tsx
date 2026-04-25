import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export const BookingSidebar = ({ pkg, travelers, setTravelers, isEditing, onUpdate }: any) => {
  const priceInt = pkg?.pricing?.basePrice || 0;
  const currency = pkg?.pricing?.currency || 'INR';
  const total = (priceInt * travelers) + 150;

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        pricing: {
          ...pkg.pricing,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="sticky top-28 border-[4px] border-[#121212] bg-white p-6 md:p-8 shadow-[12px_12px_0px_0px_#121212]">
      
      {/* 1. Header: High Contrast Price */}
      <div className="mb-10 pb-6 border-b-2 border-gray-100">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#121212]/40 block mb-2 text-center">Cost Per Person</span>
        {isEditing ? (
           <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                 <input 
                   type="number"
                   value={priceInt}
                   onChange={(e) => handleUpdate('basePrice', parseInt(e.target.value) || 0)}
                   className="w-40 bg-[#FCFBF7] border-2 border-[#121212] p-2 font-brand font-black text-4xl text-[#121212] text-center outline-none"
                 />
                 <input 
                   type="text"
                   value={currency}
                   onChange={(e) => handleUpdate('currency', e.target.value)}
                   className="w-20 bg-[#FCFBF7] border-2 border-[#121212] p-2 font-black text-xl text-[#F4BF4B] text-center outline-none"
                 />
              </div>
              <span className="text-[8px] font-black uppercase text-[#9E1B1D]">Edit Investment Engine</span>
           </div>
        ) : (
          <div className="font-brand font-black text-6xl md:text-7xl text-[#121212] text-center tracking-tighter">
            {priceInt} <span className="text-3xl text-[#F4BF4B]">{currency}</span>
          </div>
        )}
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
            <span className="text-[#121212]">{ (priceInt * travelers).toLocaleString() } {currency}</span>
         </div>
         <div className="flex justify-between font-bold text-xs uppercase tracking-tight">
            <span className="opacity-50">Logistics Fee</span>
            <span className="text-[#121212]">150 {currency}</span>
         </div>
         <div className="pt-4 border-t-2 border-[#121212] flex justify-between items-end">
            <span className="font-black text-sm uppercase tracking-widest">Total</span>
            <span className="font-brand font-black text-4xl text-[#9E1B1D]">{total.toLocaleString()} {currency}</span>
         </div>
      </div>

      {/* 4. Action */}
      {!isEditing && (
        <Link 
          to={`/booking/${pkg.id}`} 
          className="w-full bg-[#121212] text-[#F4BF4B] py-6 font-black text-xs uppercase tracking-[0.4em] flex justify-center items-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[6px_6px_0px_0px_#F4BF4B] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          BOOK THIS JOURNEY <ArrowRight size={18}/>
        </Link>
      )}

      <div className="mt-8 flex items-start gap-3 opacity-40">
         <Info size={14} className="shrink-0 mt-1"/>
         <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest">No hidden costs. 100% transparent pricing for all verified travelers.</p>
      </div>
    </div>
  );
};