import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Flame, ArrowRight } from 'lucide-react';
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
      className="relative w-full h-[100svh] min-h-[600px] max-h-[960px] overflow-hidden bg-[#121212]"
      aria-label="Trip hero"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={pkg?.title || 'Trip'}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-[8s] ease-out will-change-transform"
          style={{ animation: 'heroZoom 8s ease-out forwards' }}
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-[#121212]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/60 via-transparent to-transparent" />
      </div>

      {/* Limited Seats Badge */}
      {pkg?.limitedSeats && (
        <div className="absolute top-32 right-6 md:right-12 z-20 animate-pulse">
          <div className="bg-[#9E1B1D] text-white px-5 py-2.5 border-2 border-white font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <Flame size={14} fill="white" /> Limited Seats
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-20 max-w-[1440px] mx-auto w-full">

        {/* Location / Tags */}
        <div className="flex flex-wrap gap-3 mb-6">
          {pkg?.destinations?.map((dest, i) => (
            <span
              key={i}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.3em]"
            >
              📍 {dest}
            </span>
          ))}
          {pkg?.rating?.average && (
            <span className="bg-[#F4BF4B] text-[#121212] px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.3em] border-2 border-[#121212] flex items-center gap-1.5">
              <Star size={12} fill="currentColor" /> {pkg.rating.average} / 5
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-brand font-black text-[clamp(3rem,10vw,8rem)] text-white leading-[0.85] uppercase tracking-tighter mb-6 drop-shadow-2xl max-w-5xl">
          {pkg?.title || 'Untitled Journey'}
        </h1>

        {/* Subtitle & Price Row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 border-t border-white/20 pt-8">
          <div className="flex-1">
            <p className="font-sans text-white/70 text-sm uppercase tracking-widest font-bold max-w-md">
              {pkg?.overview || pkg?.description?.substring(0, 120) + '…'}
            </p>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Starting From</span>
              <span className="font-brand font-black text-4xl md:text-5xl text-[#F4BF4B] leading-none">
                {price.toLocaleString()}
              </span>
              <span className="text-white/60 font-black text-sm ml-2">{currency}</span>
            </div>
            <Link
              to={`/booking/${pkg?.id}`}
              className="bg-[#F4BF4B] text-[#121212] px-8 py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(244,191,75,0.4)] active:translate-x-1 active:translate-y-1 active:shadow-none border-2 border-[#121212] group"
            >
              Book Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2">
        <div className="w-px h-8 bg-white/30 animate-bounce" />
        <span className="text-white/30 font-black text-[9px] uppercase tracking-widest">Scroll</span>
      </div>

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.05); }
          to { transform: scale(1); }
        }
      `}</style>
    </section>
  );
};
