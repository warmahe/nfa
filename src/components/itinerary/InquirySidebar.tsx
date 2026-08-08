import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Info, Mail, MessageSquare } from 'lucide-react';

export const InquirySidebar = ({ pkg }: { pkg: any }) => {
  const [travelers, setTravelers] = useState(1);
  const priceInt = pkg?.pricing?.basePrice || 0;
  const currency = pkg?.pricing?.currency || 'INR';

  return (
    <div className="sticky top-28 border-[4px] border-[#121212] bg-white p-6 md:p-8 shadow-[12px_12px_0px_0px_#121212]">
      <div className="mb-8 pb-6 border-b-2 border-gray-100 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#121212]/40 block mb-2">Estimated Investment</span>
        <div className="font-brand font-black text-5xl md:text-6xl text-[#121212] tracking-tighter">
          ₹{priceInt.toLocaleString()} <span className="text-xl text-[#F4BF4B]">{currency}</span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#9E1B1D]">
            <Calendar size={14} /> Season / Window
          </label>
          <div className="p-4 bg-[#FCFBF7] border-2 border-[#121212] font-bold text-xs uppercase">
            {pkg?.pricingDates?.[0]?.date_range || 'Multiple Departures Available'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#9E1B1D]">
            <Users size={14} /> Explorer Count
          </label>
          <div className="flex border-2 border-[#121212] h-14 bg-[#121212]">
            <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-16 text-white hover:bg-[#F4BF4B] hover:text-[#121212] font-black text-xl">-</button>
            <div className="flex-1 flex items-center justify-center font-black text-base bg-white border-x-2 border-[#121212]">{travelers} Pax</div>
            <button onClick={() => setTravelers(travelers + 1)} className="w-16 text-white hover:bg-[#F4BF4B] hover:text-[#121212] font-black text-xl">+</button>
          </div>
        </div>
      </div>

      <Link
        to={`/contact?trip=${encodeURIComponent(pkg?.title || '')}`}
        className="w-full bg-[#121212] text-[#F4BF4B] py-5 font-black text-xs uppercase tracking-[0.3em] flex justify-center items-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[6px_6px_0px_0px_#F4BF4B] active:translate-x-1 active:translate-y-1 active:shadow-none mb-4"
      >
        <Mail size={16} /> INQUIRE FOR DOSSIER
      </Link>

      <a
        href={`https://wa.me/?text=Hi%2C%20I%20want%20to%20inquire%20about%20${encodeURIComponent(pkg?.title || '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-white text-[#121212] border-2 border-[#121212] py-4 font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-2 hover:bg-[#F4BF4B] transition-colors shadow-[4px_4px_0px_0px_#121212]"
      >
        <MessageSquare size={14} /> WhatsApp Intelligence Line
      </a>

      <div className="mt-8 flex items-start gap-3 opacity-50">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest">Small-group vetting applied. Applications reviewed in order of transmission.</p>
      </div>
    </div>
  );
};
