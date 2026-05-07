import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';
import { REVIEWS } from '../../utils/constants';

export const DetailReviews = () => {
  return (
    <section className="py-12 border-t-4 border-[#121212]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
           <h2 className="font-brand font-black text-4xl md:text-5xl uppercase text-[#121212] mb-2">Field Logs</h2>
           <p className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40">Authenticated Survivor Transmissions</p>
        </div>
        
        {/* Aggregate Rating Box */}
        <div className="bg-[#121212] text-white p-6 border-4 border-[#F4BF4B] shadow-[8px_8px_0px_0px_#121212] flex items-center gap-6">
           <div className="text-5xl font-black text-[#F4BF4B]">4.9</div>
           <div className="h-12 w-px bg-white/20" />
           <div>
              <div className="flex gap-1 mb-1">
                 {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F4BF4B" className="text-[#F4BF4B]"/>)}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Records</p>
           </div>
        </div>
      </div>

      {/* Individual Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {REVIEWS.slice(0, 4).map((review: any) => (
          <div key={review.id} className="border-2 border-[#121212] p-8 bg-white relative group shadow-[4px_4px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <Quote className="absolute top-4 right-4 text-[#121212]/5 group-hover:text-[#9E1B1D]/10 transition-colors" size={48} />
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
               <img src={review.avatar} className="size-12 rounded-none border-2 border-[#121212] grayscale object-cover" alt="user"/>
               <div>
                  <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                    {review.author} <ShieldCheck size={14} className="text-[#9E1B1D]"/>
                  </h4>
                  <p className="text-[9px] font-bold text-[#121212]/40 uppercase tracking-widest">{review.role}</p>
               </div>
            </div>

            <p className="font-brand italic text-lg text-[#121212]/80 leading-relaxed">
              "{review.content}"
            </p>

            <div className="mt-6 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`size-2 rotate-45 border border-[#121212] ${i < review.rating ? 'bg-[#F4BF4B]' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};