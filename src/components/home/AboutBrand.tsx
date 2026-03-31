import React from 'react';
import { Map, ShieldAlert, Zap } from 'lucide-react';

export const AboutBrand = () => {
  return (
    <section className="border-b-4 border-[#121212] bg-[#FCFBF7]">
      <div className="grid grid-cols-1 md:grid-cols-3">
        
        {/* Title Block */}
        <div className="col-span-1 md:col-span-3 p-8 lg:p-16 border-b-4 border-[#121212] bg-[#121212] text-[#FCFBF7]">
          <h2 className="font-brand text-6xl md:text-8xl font-black uppercase text-[#F4BF4B]" style={{ textShadow: '3px 3px 0px #9E1B1D' }}>
            The NFA Ethos
          </h2>
          <p className="font-sans text-xl max-w-2xl mt-6">We don't do vacations. We build demanding, high-reward expeditions for individuals who want to feel the pulse of the planet.</p>
        </div>

        {/* Feature 1 */}
        <div className="p-10 border-b-4 md:border-b-0 md:border-r-4 border-[#121212] hover:bg-[#F4BF4B] transition-colors group">
          <Map className="size-16 mb-8 text-[#121212]" />
          <h3 className="font-brand text-3xl font-black uppercase mb-4 text-[#121212]">Uncharted</h3>
          <p className="font-sans font-medium text-[#121212]/80">If there is a tourist trap within 100 miles, we rip it from the itinerary.</p>
        </div>

        {/* Feature 2 */}
        <div className="p-10 border-b-4 md:border-b-0 md:border-r-4 border-[#121212] hover:bg-[#9E1B1D] hover:text-[#FCFBF7] transition-colors group">
          <ShieldAlert className="size-16 mb-8 text-[#121212] group-hover:text-[#FCFBF7] transition-colors" />
          <h3 className="font-brand text-3xl font-black uppercase mb-4">Tactical</h3>
          <p className="font-sans font-medium opacity-80">Military-grade logistics backing every single step of your journey.</p>
        </div>

        {/* Feature 3 */}
        <div className="p-10 hover:bg-[#121212] hover:text-[#FCFBF7] transition-colors group">
          <Zap className="size-16 mb-8 text-[#121212] group-hover:text-[#FCFBF7] transition-colors" />
          <h3 className="font-brand text-3xl font-black uppercase mb-4">Visceral</h3>
          <p className="font-sans font-medium opacity-80">Experiences designed to shock your system and reset your baseline.</p>
        </div>

      </div>
    </section>
  );
};