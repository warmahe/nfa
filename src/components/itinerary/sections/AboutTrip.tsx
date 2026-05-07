import React from 'react';
import { Package } from '../../../types/database';

interface AboutTripProps {
  pkg: Package;
}

export const AboutTrip: React.FC<AboutTripProps> = ({ pkg }) => {
  const image = pkg?.aboutImage || pkg?.media?.gallery?.[0] || pkg?.media?.thumbnail;

  return (
    <section id="about" className="py-24 px-6 md:px-16 max-w-[1440px] mx-auto" aria-label="About this trip">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

        {/* Left: Image */}
        <div className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden border-4 border-[#121212] shadow-[12px_12px_0px_0px_#F4BF4B]">
            {image ? (
              <img
                src={image}
                alt="About this trip"
                className="w-full aspect-[4/3] object-cover object-center transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-[#121212]/10 flex items-center justify-center">
                <span className="font-black text-[#121212]/20 text-6xl">NFA</span>
              </div>
            )}
            {/* Accent box */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#9E1B1D] border-4 border-[#121212] z-[-1]" />
          </div>

          {/* Floating stat */}
          {pkg?.rating?.totalReviews > 0 && (
            <div className="absolute top-6 -right-4 md:-right-8 bg-[#121212] border-2 border-[#F4BF4B] text-white px-5 py-4 text-center shadow-lg">
              <span className="block font-brand font-black text-4xl text-[#F4BF4B] leading-none">
                {pkg.rating.average.toFixed(1)}
              </span>
              <span className="block text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">
                Avg Rating
              </span>
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="order-1 lg:order-2 space-y-8">
          {/* Ghost label */}
          <div className="relative">
            <span className="absolute -top-6 -left-2 text-7xl font-black text-[#121212]/5 select-none pointer-events-none uppercase leading-none">
              About
            </span>
            <div className="relative">
              <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
                {pkg?.aboutQuestion || 'The Journey'}
              </span>
              <h2 className="font-brand font-black text-4xl md:text-5xl uppercase tracking-tighter text-[#121212] leading-[0.9] mb-8">
                {pkg?.aboutTitle || 'What Is This\nAll About?'}
              </h2>
            </div>
          </div>

          <div className="border-l-4 border-[#F4BF4B] pl-6">
            <p className="font-serif italic text-xl md:text-2xl text-[#121212]/80 leading-relaxed">
              "{pkg?.description || 'An extraordinary journey into the unknown.'}"
            </p>
          </div>

          {pkg?.overview && pkg.overview !== pkg.description && (
            <p className="font-sans text-sm text-[#121212]/60 leading-relaxed tracking-wide">
              {pkg.overview}
            </p>
          )}

          {/* Key facts chips */}
          <div className="flex flex-wrap gap-3 pt-4">
            {[
              pkg?.difficulty && `${pkg.difficulty} Difficulty`,
              pkg?.duration,
              pkg?.tripStyle,
              pkg?.maxTravelers && `Max ${pkg.maxTravelers} Travelers`,
            ].filter(Boolean).map((chip, i) => (
              <span
                key={i}
                className="bg-[#FCFBF7] border-2 border-[#121212] px-4 py-2 font-black text-[10px] uppercase tracking-widest text-[#121212]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
