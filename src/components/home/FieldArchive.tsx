import React, { useRef } from 'react';
import { GALLERY_IMAGES } from '../../constants';
import { ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FieldArchive = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simple scroll function for desktop arrows (does not impact mobile touch scrolling)
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 800 : 350;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-nfa-cream py-16 md:py-32 border-t-4 border-nfa-charcoal relative overflow-hidden text-nfa-charcoal">
      
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #121212 1px, transparent 0)`, backgroundSize: '32px 32px' }}
      />

      <div className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] mb-10 md:mb-16">
        
        {/* Simple & Clear Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-[3px] border-[#121212] pb-6">
           <div className="relative">
             <div className="flex items-center gap-2 bg-[#F4BF4B] border-2 border-[#121212] w-fit px-2 py-1 shadow-[2px_2px_0px_0px_#121212] mb-4">
               <Camera size={14} />
               <span className="text-[10px] uppercase font-black tracking-[0.2em]">Visual Evidence</span>
             </div>
             
             <h2 className="font-brand font-black text-[clamp(2.5rem,7vw,6rem)] leading-[0.8] uppercase tracking-tighter drop-shadow-md">
               THE FIELD <br className="hidden sm:block"/><span className="text-[#9E1B1D]">ARCHIVE.</span>
             </h2>
           </div>

           <div className="flex flex-col items-start md:items-end gap-4">
             <p className="font-sans text-[clamp(0.75rem,1vw,0.9rem)] font-bold tracking-[0.1em] text-nfa-charcoal/70 uppercase max-w-sm md:text-right">
                Raw moments. Unedited landscapes. See what our groups have survived and explored.
             </p>
             {/* Desktop Navigation Arrows */}
             <div className="hidden md:flex gap-3">
               <button onClick={() => scroll('left')} className="p-3 border-4 border-[#121212] bg-[#FCFBF7] hover:bg-[#F4BF4B] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 transition-all shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212]">
                 <ArrowLeft size={20} strokeWidth={3} />
               </button>
               <button onClick={() => scroll('right')} className="p-3 border-4 border-[#121212] bg-[#FCFBF7] hover:bg-[#F4BF4B] hover:translate-x-1 hover:-translate-y-1 active:translate-x-1 transition-all shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212]">
                 <ArrowRight size={20} strokeWidth={3} />
               </button>
             </div>
           </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* NATIVE SCROLL GALLERY - Zero JS drag events, buttery smooth 60fps */}
      {/* ============================================================== */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-[clamp(1.5rem,4vw,3rem)] px-[clamp(1rem,4vw,3rem)] pb-12 pt-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {/* We use real images from your constants file */}
        {GALLERY_IMAGES.slice(0, 6).map((img, idx) => (
          
          <div 
            key={img.id} 
            // Alternate rotations to look like physical, hand-scattered photos on a desk
            className={`shrink-0 w-[85vw] sm:w-[60vw] lg:w-[450px] snap-center flex flex-col group cursor-pointer ${idx % 2 === 0 ? 'md:-rotate-2 hover:rotate-0' : 'md:rotate-[1.5deg] hover:-rotate-1 md:mt-10'} transition-transform duration-300 ease-out`}
          >
            {/* The Polaroid Card Border */}
            <div className="bg-[#FCFBF7] border-[4px] border-[#121212] p-2 pb-6 md:p-3 md:pb-8 shadow-[clamp(8px,1vw,12px)_clamp(8px,1vw,12px)_0px_0px_#121212]">
              
              <div className="relative aspect-[4/5] border-[3px] border-[#121212] bg-[#121212] overflow-hidden">
                <img 
                  src={img.url} 
                  alt={img.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                  loading="lazy" // Critical for fast mobile load times
                />
              </div>

              {/* Physical Stamp Labels under the photo */}
              <div className="mt-4 md:mt-6 px-2 flex justify-between items-start">
                 <div className="flex flex-col gap-1 border-l-4 border-[#9E1B1D] pl-3">
                   <h3 className="font-brand font-black text-xl md:text-2xl uppercase tracking-tighter text-[#121212] leading-none line-clamp-1">{img.destination}</h3>
                   <span className="font-sans text-[10px] md:text-xs font-bold text-[#121212]/60 uppercase tracking-[0.1em]">{img.location}</span>
                 </div>
                 {img.photographer && (
                   <span className="font-mono text-[8px] md:text-[10px] uppercase font-bold text-[#121212] bg-[#F4BF4B] border-2 border-[#121212] px-2 py-1 shadow-[2px_2px_0px_0px_#121212] text-right break-words max-w-[120px]">
                     Photo By <br className="hidden sm:block"/>{img.photographer}
                   </span>
                 )}
              </div>
            </div>
          </div>
        ))}

        {/* The End / View All Vault Trigger */}
        <div className="shrink-0 w-[60vw] md:w-[350px] snap-center flex items-center justify-center border-4 border-dashed border-[#121212]/30 ml-4 group hover:bg-[#F4BF4B] transition-colors hover:border-solid hover:border-[#121212]">
          <Link to="/gallery" className="flex flex-col items-center justify-center p-8 text-center text-[#121212]">
            <ArrowRight size={40} className="mb-4 text-[#9E1B1D] group-hover:translate-x-2 transition-transform" />
            <span className="font-brand font-black text-3xl uppercase leading-none tracking-tight">Open <br/>The Vault</span>
            <span className="font-sans text-xs uppercase tracking-widest mt-4 font-bold">View all 1,204 Files</span>
          </Link>
        </div>

      </div>
      
    </section>
  );
};