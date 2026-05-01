import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, MapPin } from 'lucide-react';
import { Package } from '../../../types/database';

interface HeroSectionProps {
  pkg: Package;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ pkg }) => {
  const heroImage = pkg?.media?.thumbnail || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80';
  const price = pkg?.pricing?.basePrice || 0;
  const currency = pkg?.pricing?.currency || 'INR';

  return (
    <section
      id="hero"
      className="relative w-full min-h-[100svh] bg-[#FCFBF7] pt-24 pb-12 px-4 md:px-8 lg:px-12 flex items-center justify-center"
      aria-label="Trip hero"
    >
      {/* Postcard/Poster Frame */}
      <div className="relative w-full max-w-[1440px] h-[85vh] min-h-[600px] border-4 border-[#121212] bg-[#121212] flex flex-col overflow-hidden shadow-[12px_12px_0px_0px_#F4BF4B]">
        
        {/* Top Bar of the Poster */}
        <div className="h-14 border-b-4 border-[#121212] bg-[#FCFBF7] flex justify-between items-center px-6 z-20 shrink-0">
          <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-[#9E1B1D] border-2 border-[#121212]" />
             <div className="w-3 h-3 rounded-full bg-[#F4BF4B] border-2 border-[#121212]" />
             <div className="w-3 h-3 rounded-full bg-[#121212] border-2 border-[#121212]" />
          </div>
          <div className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[#121212]">
            NFA / Trip Dossier / 001
          </div>
        </div>

        {/* Image Area */}
        <div className="relative flex-1 bg-[#121212] overflow-hidden group">
          <img
            src={heroImage}
            alt={pkg?.title || 'Trip'}
            className="w-full h-full object-cover object-center opacity-90 transition-transform duration-[10s] ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#9E1B1D] mix-blend-overlay opacity-20 pointer-events-none" />
          
          {/* Central Title Plate (Wes Anderson Symmetry) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-center z-10 pointer-events-none">
            <div className="bg-[#FCFBF7] border-4 border-[#121212] p-6 md:p-12 shadow-[8px_8px_0px_0px_#121212] max-w-4xl w-full pointer-events-auto transform transition-transform hover:-translate-y-1">
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {pkg?.destinations?.map((dest, i) => (
                  <span
                    key={i}
                    className="border-2 border-[#121212] text-[#121212] px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em] bg-[#F4BF4B]"
                  >
                    <MapPin size={12} className="inline mr-1" />{dest}
                  </span>
                ))}
              </div>

              <h1 className="font-brand font-black text-4xl md:text-6xl lg:text-7xl text-[#121212] leading-[0.9] uppercase tracking-tight mb-6">
                {pkg?.title || 'Untitled Journey'}
              </h1>
              
              <div className="w-24 h-1 bg-[#9E1B1D] mx-auto mb-6 border border-[#121212]" />
              
              <p className="font-sans text-[#121212] font-bold text-xs md:text-sm uppercase tracking-widest max-w-2xl mx-auto mb-8">
                {pkg?.overview || pkg?.description?.substring(0, 120) + '…'}
              </p>

              {/* Price & CTA row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 border-t-4 border-[#121212] border-dashed">
                <div className="text-center sm:text-right">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-1">Investment</span>
                  <div className="flex items-baseline gap-1 justify-center sm:justify-end">
                    <span className="font-display font-black text-3xl text-[#9E1B1D] leading-none tracking-tighter">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-[#121212] font-black text-sm">{currency}</span>
                  </div>
                </div>
                
                <Link
                  to={`/booking/${pkg?.id}`}
                  className="bg-[#121212] text-[#FCFBF7] border-2 border-[#121212] px-8 py-4 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors shadow-[4px_4px_0px_0px_#9E1B1D] active:translate-x-1 active:translate-y-1 active:shadow-none group"
                >
                  Embark <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
          
          {/* Limited Seats Badge (Stamp style) */}
          {pkg?.limitedSeats && (
            <div className="absolute top-8 right-8 z-20 animate-pulse">
              <div className="bg-[#FCFBF7] text-[#9E1B1D] px-4 py-2 border-4 border-[#9E1B1D] font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-2 transform rotate-6 shadow-[4px_4px_0px_0px_#9E1B1D]">
                <Flame size={14} /> Rare
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
