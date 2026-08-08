import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpeditionGrid = ({ customItems }: { customItems?: any[] }) => {
  return (
    <section className="bg-[#121212] py-20 md:py-28 px-[clamp(1rem,4vw,3rem)] text-[#FCFBF7] border-t-4 border-[#F4BF4B] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        {/* Banner 4 Header */}
        <div className="mb-12 md:mb-16 border-b-2 border-white/10 pb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F4BF4B] mb-3 block">
            Sample Custom Builds
          </span>
          <h2 className="font-brand font-black text-[clamp(2.2rem,6vw,5.5rem)] leading-[0.88] text-[#FCFBF7] uppercase tracking-tighter mb-6">
            SOME TRIPS WE'VE ALREADY BUILT. <br />
            <span className="text-[#F4BF4B]">YOURS COULD START HERE.</span>
          </h2>
          <p className="font-sans text-sm md:text-base font-bold text-[#FCFBF7]/70 max-w-2xl leading-relaxed">
            These aren't packages you book. They're a look at how we work, real trips we've built for real people. Use them as a starting point, then we change everything that doesn't fit you.
          </p>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {customItems?.map((dest) => (
            <Link
              to={`/itinerary/${dest.id}`}
              key={dest.id}
              className="group relative border-3 border-[#F4BF4B] overflow-hidden bg-[#121212] aspect-4/5 flex flex-col justify-between shadow-[6px_6px_0px_0px_#9E1B1D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200"
            >
              <div className="absolute top-0 w-full flex justify-between items-start z-30 p-4">
                <span className="bg-[#F4BF4B] text-[#121212] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_0px_#121212]">
                  [ {dest.duration || 'Custom'} ]
                </span>
                <div className="w-8 h-8 border-2 border-[#121212] bg-[#FCFBF7] text-[#121212] flex items-center justify-center group-hover:bg-[#9E1B1D] group-hover:text-white transition-colors">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="absolute inset-0 z-0 bg-[#121212]">
                <img
                  src={dest.media?.thumbnail || dest.coverImage}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 opacity-80 group-hover:opacity-100 transition-all duration-500"
                  alt={dest.title || dest.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
              </div>

              <div className="relative z-10 mt-auto p-5 w-full">
                <div className="border-t-2 border-[#9E1B1D] pt-3">
                  <h3 className="font-brand font-black text-2xl text-[#FCFBF7] uppercase leading-[0.9] tracking-tight truncate">
                    {dest.title || dest.name}
                  </h3>
                  <p className="text-[10px] font-bold text-[#F4BF4B] uppercase tracking-widest mt-2">
                    Sample Investment: ₹{dest.pricing?.basePrice?.toLocaleString() || 'Custom'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Banner 4 CTA */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            to="/packages"
            className="bg-[#F4BF4B] text-[#121212] border-2 border-[#FCFBF7] px-10 py-5 font-sans font-black text-xs md:text-sm uppercase tracking-[0.25em] shadow-[6px_6px_0px_0px_#9E1B1D] hover:bg-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            VIEW ALL ITINERARIES →
          </Link>
        </div>

      </div>
    </section>
  );
};