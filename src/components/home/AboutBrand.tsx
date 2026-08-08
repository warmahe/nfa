import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Users, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutBrand = () => {
  return (
    <section className="bg-[#121212] text-[#FCFBF7] py-20 md:py-32 px-[clamp(1rem,4vw,3rem)] border-b-4 border-[#121212] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column Image */}
          <div className="relative h-[400px] md:h-[550px] w-full border-4 border-[#FCFBF7] shadow-[12px_12px_0px_0px_#9E1B1D]">
            <img
              src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200"
              className="w-full h-full object-cover filter brightness-90 contrast-125 grayscale-[30%]"
              alt="Built by Travellers"
            />
            <div className="absolute -bottom-4 -right-4 bg-[#F4BF4B] border-2 border-[#121212] text-[#121212] px-4 py-2 font-sans font-black text-[10px] uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#9E1B1D]">
              NOT FOR TOURISTS
            </div>
          </div>

          {/* Right Column Content */}
          <div className="flex flex-col justify-center space-y-12">

            {/* Section 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-[#F4BF4B]">
                <Flame size={18} />
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em]">Real Field Experience</span>
              </div>
              <h3 className="font-brand font-black text-3xl md:text-5xl text-[#FCFBF7] uppercase tracking-tight mb-4 leading-tight">
                BUILT BY TRAVELLERS. <br /><span className="text-[#F4BF4B]">BUILT FOR YOU.</span>
              </h3>
              <p className="font-sans text-[#FCFBF7]/70 leading-relaxed text-sm md:text-base font-bold">
                We've been to these places ourselves. Walked the streets, stayed in the same hotels, eaten at the same tables. Every trip we build comes from what we've actually seen and done, not from a brochure. That's why we started this in the first place, we wanted this kind of travel and couldn't find it anywhere else.
              </p>
            </div>

            {/* Section 2 */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3 text-[#F4BF4B]">
                <Compass size={18} />
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em]">How We Work</span>
              </div>
              <h3 className="font-brand font-black text-2xl md:text-4xl text-[#FCFBF7] uppercase tracking-tight mb-4 leading-tight">
                YOU DON'T PICK FROM A LIST.
              </h3>
              <p className="font-sans text-[#FCFBF7]/70 leading-relaxed text-sm md:text-base font-bold">
                You tell us what you want and we take it from there. No fixed dates, no fixed itinerary, nothing pulled off a shelf. We don't just book your flights and hotels, we shape the whole trip around you and the people you're travelling with.
              </p>
            </div>

            <div className="pt-4">
              <Link
                to="/destinations"
                className="group inline-flex items-center gap-3 bg-[#F4BF4B] text-[#121212] px-8 py-4 font-sans font-black text-xs uppercase tracking-widest border-2 border-[#FCFBF7] hover:bg-white transition-all shadow-[6px_6px_0px_0px_#9E1B1D]"
              >
                VIEW DESTINATIONS
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};