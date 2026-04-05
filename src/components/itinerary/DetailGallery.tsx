import React, { useState } from 'react';
import { Star, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export const DetailGallery = ({ pkg, destination }: any) => {
  const [index, setIndex] = useState(0);
  const images = [pkg.image, pkg.image, pkg.image]; // In real use, map from your gallery array

  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full bg-[#121212] overflow-hidden border-b-4 border-[#121212]">
      {/* Background Image with Brutalist Filter */}
      <div className="absolute inset-0 z-0">
        <img src={images[index]} className="w-full h-full object-cover grayscale-[20%] contrast-110" alt="Hero"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]/40" />
      </div>

      {/* Cinematic Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-20 max-w-[1440px] mx-auto w-full">
         <div className="flex flex-wrap gap-4 mb-6">
            <span className="bg-[#9E1B1D] text-white px-4 py-1 font-black text-[10px] uppercase tracking-[0.3em] border-2 border-white shadow-[4px_4px_0px_0px_#121212]">
               Sector: {pkg.destination}
            </span>
            <span className="bg-[#F4BF4B] text-[#121212] px-4 py-1 font-black text-[10px] uppercase tracking-[0.3em] border-2 border-[#121212] flex items-center gap-2">
               <Star size={12} fill="currentColor"/> {pkg.rating} Rating
            </span>
         </div>

         <h1 className="font-brand font-black text-6xl md:text-9xl text-white leading-[0.8] uppercase tracking-tighter mb-8 drop-shadow-2xl">
            {pkg.title}
         </h1>

         <div className="flex items-center gap-12 border-t-2 border-white/20 pt-8 mt-4 text-white">
            <div className="flex items-center gap-3">
               <Clock className="text-[#F4BF4B]" size={20} />
               <span className="font-sans font-black text-xs md:text-sm uppercase tracking-widest">{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-3">
               <MapPin className="text-[#F4BF4B]" size={20} />
               <span className="font-sans font-black text-xs md:text-sm uppercase tracking-widest">{pkg.destination}</span>
            </div>
         </div>
      </div>

      {/* Navigation Arrows (Brutalist Squares) */}
      <div className="absolute bottom-8 right-8 flex gap-4 z-20">
         <button onClick={() => setIndex(i => i === 0 ? 2 : i - 1)} className="size-12 bg-white border-2 border-[#121212] flex items-center justify-center hover:bg-[#F4BF4B] transition-colors shadow-[4px_4px_0px_0px_#121212] active:translate-x-1 active:translate-y-1 active:shadow-none">
            <ChevronLeft size={24}/>
         </button>
         <button onClick={() => setIndex(i => (i + 1) % 3)} className="size-12 bg-white border-2 border-[#121212] flex items-center justify-center hover:bg-[#F4BF4B] transition-colors shadow-[4px_4px_0px_0px_#121212] active:translate-x-1 active:translate-y-1 active:shadow-none">
            <ChevronRight size={24}/>
         </button>
      </div>
    </section>
  );
};