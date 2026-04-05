import React from 'react';
import { useDestinations } from '../../hooks/useDestinations';
import { RegistryCard } from '../../components/destinations/RegistryCard';
import { Crosshair, Map, Filter } from 'lucide-react';

export const Destinations = () => {
  // Logic is neatly encapsulated in your custom hook
  const { filtered, filterRegion, setFilterRegion, sortBy, setSortBy } = useDestinations();

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">

      {/* Header */}
      <div className="max-w-[1440px] mx-auto mb-16 border-b-[4px] border-[#121212] pb-1">

        <h1 className="font-brand font-black uppercase text-[clamp(3rem,8vw,7rem)] leading-[0.85] tracking-tighter text-[#121212]">
          ACTIVE <br /><span className="text-[#9E1B1D]">FRONTIERS.</span>
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 xl:grid-cols-[250px,1fr] gap-12">

        {/* Left Side: Filter Control Deck */}
        <aside className="space-y-6">
          <div className="sticky top-28 border-[3px] border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212]">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Filter size={14} /> Deployment Filters
            </h3>
            <div className="flex flex-wrap xl:flex-col gap-2">
              {["ALL", "NORDIC", "ASIA", "SOUTH AMERICA"].map(region => (
                <button
                  key={region}
                  onClick={() => setFilterRegion(region)}
                  className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-[2px] transition-all w-full text-left ${filterRegion === region
                    ? "bg-[#121212] text-[#FCFBF7]"
                    : "border-[#121212]/20 hover:border-[#121212]"
                    }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Destination Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filtered.map(dest => (
            <RegistryCard {...({ key: dest.id } as any)} dest={dest} />
          ))}
        </div>

      </div>
    </div>
  );
};