import React, { useState } from 'react';
import { ChevronDown, MapPin, Plane, Train, Bus, Ship, Car, Utensils, Star, CheckCircle } from 'lucide-react';
import { Package, ItineraryCity, ItineraryDay } from '../../../types/database';

interface ItineraryCitiesProps {
  pkg: Package;
}

const TransferIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'flight': return <Plane size={24} />;
    case 'train': return <Train size={24} />;
    case 'bus': return <Bus size={24} />;
    case 'ferry': return <Ship size={24} />;
    case 'car': return <Car size={24} />;
    default: return <Plane size={24} />;
  }
};

const DayDetails: React.FC<{ day: ItineraryDay }> = ({ day }) => {
  return (
    <div className={`relative bg-white border-4 border-[#121212] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212] group hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#F4BF4B] transition-all`}>
      <div className="flex items-center gap-4 border-b-4 border-[#121212] pb-4 mb-6">
        <div className="bg-[#121212] text-white size-12 flex items-center justify-center font-brand font-black text-2xl shrink-0">
          {day.day}
        </div>
        <h4 className="font-brand font-black text-xl md:text-2xl uppercase tracking-tighter text-[#121212] leading-tight">
          {day.title}
        </h4>
      </div>
      
      <p className="font-sans font-medium text-sm text-[#121212]/80 leading-relaxed mb-6 whitespace-pre-line">
        {day.description}
      </p>

      <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-dashed border-[#121212]/30">
        {day.meals && day.meals.length > 0 && (
          <div className="flex items-center gap-2">
            <Utensils size={16} className="text-[#9E1B1D]" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{day.meals.join(', ')}</span>
          </div>
        )}
        {day.addons && day.addons.length > 0 && (
          <div className="flex items-center gap-2">
            <Star size={16} className="text-[#F4BF4B]" />
            <span className="text-[10px] font-bold uppercase tracking-wide">+{day.addons.length} Opt</span>
          </div>
        )}
        {day.activities && day.activities.length > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-[#121212]" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{day.activities.length} Incl</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ItineraryCities: React.FC<ItineraryCitiesProps> = ({ pkg }) => {
  const [expandedCities, setExpandedCities] = useState<Record<number, boolean>>({ 0: true });

  const toggleCity = (idx: number) => {
    setExpandedCities(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const cities = pkg?.itineraryCities || [];

  if (cities.length === 0) return null;

  return (
    <section id="itinerary" className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto bg-[#FCFBF7] overflow-hidden">
      <div className="mb-24 text-center relative z-10">
        <span className="inline-block border-2 border-[#121212] px-4 py-1 font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#121212] bg-[#F4BF4B] mb-6 shadow-[4px_4px_0_0_#121212]">
          Dossier
        </span>
        <h2 className="font-brand font-black text-5xl md:text-7xl uppercase tracking-tighter text-[#121212] leading-[0.85] mb-8">
          The Tactical Timeline
        </h2>
        <div className="w-full max-w-md h-2 bg-[repeating-linear-gradient(45deg,#121212,#121212_10px,transparent_10px,transparent_20px)] mx-auto" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Central Vertical Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-[#121212] -translate-x-1/2 z-0" />

        {cities.map((city, cIdx) => (
          <div key={cIdx} className="relative mb-24 last:mb-0 z-10">
            
            {/* Arrival Transfer info */}
            {city.arrivalTransfer && (
              <div className="relative flex flex-col items-center justify-center mb-12 pl-8 md:pl-0 z-10">
                <div className="bg-[#FCFBF7] border-4 border-[#121212] size-16 flex items-center justify-center shadow-[4px_4px_0_0_#9E1B1D] rotate-45">
                   <div className="-rotate-45 text-[#121212]">
                     <TransferIcon type={city.arrivalTransfer.type} />
                   </div>
                </div>
                <span className="mt-4 bg-[#121212] text-white px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-widest">
                  {city.arrivalTransfer.text}
                </span>
              </div>
            )}

            {/* City Header Stamp */}
            <div className="relative flex flex-col items-center pl-8 md:pl-0 mb-12 z-20">
              <button 
                onClick={() => toggleCity(cIdx)}
                className="group relative bg-[#FCFBF7] border-4 border-[#121212] p-2 hover:bg-[#F4BF4B] transition-colors shadow-[8px_8px_0_0_#121212] w-full max-w-sm"
              >
                <div className="border-2 border-dashed border-[#121212] p-4 flex flex-col items-center justify-center bg-white relative overflow-hidden">
                  {/* Stamp motif */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                    <div className="size-32 rounded-full border-4 border-[#9E1B1D] rotate-12 flex items-center justify-center">
                      <span className="font-brand font-black text-3xl text-[#9E1B1D] uppercase">Visa</span>
                    </div>
                  </div>
                  
                  <MapPin size={28} className="text-[#9E1B1D] mb-2 relative z-10" />
                  <h3 className="font-brand font-black text-3xl uppercase tracking-tighter text-[#121212] leading-none mb-2 text-center relative z-10">
                    {city.city}
                  </h3>
                  <p className="font-mono font-black text-[10px] uppercase tracking-widest text-[#121212]/60 relative z-10">
                    {city.country || 'Sector'} // {city.nights} Night{city.nights !== 1 ? 's' : ''}
                  </p>
                  
                  <ChevronDown size={20} className={`mt-4 transition-transform duration-300 relative z-10 ${expandedCities[cIdx] ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </div>

            {/* Day Contents */}
            {expandedCities[cIdx] && (
              <div className="w-full space-y-12 md:space-y-16 animate-in fade-in slide-in-from-top-4 duration-500 z-10 relative">
                {city.days.map((day, dIdx) => {
                  const isEven = dIdx % 2 === 0;
                  return (
                    <div key={dIdx} className="relative flex flex-col md:flex-row items-center w-full group pl-8 md:pl-0">
                      
                      {/* Timeline Node */}
                      <div className="absolute left-8 md:left-1/2 top-1/2 md:top-1/2 top-[50%] size-6 bg-[#FCFBF7] border-4 border-[#121212] -translate-x-1/2 -translate-y-1/2 z-20 group-hover:bg-[#F4BF4B] transition-colors" />
                      
                      {/* Timeline Node Line (Desktop) */}
                      <div className={`hidden md:block absolute top-1/2 w-16 h-1 bg-[#121212] -translate-y-1/2 z-10 ${isEven ? 'left-1/2' : 'right-1/2'}`} />
                      
                      {/* Timeline Node Line (Mobile) */}
                      <div className={`md:hidden absolute left-8 top-1/2 w-8 h-1 bg-[#121212] -translate-y-1/2 z-10`} />

                      {/* Content Box */}
                      <div className={`w-full md:w-[45%] ml-auto md:ml-0 ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}>
                        <DayDetails day={day} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Departure stamp */}
        <div className="relative z-20 flex flex-col items-center justify-center mt-24 pl-8 md:pl-0">
           <div className="bg-[#121212] text-[#FCFBF7] border-4 border-[#121212] size-16 flex items-center justify-center shadow-[4px_4px_0_0_#F4BF4B] rounded-full">
             <Plane size={24} className="rotate-45" />
           </div>
           <span className="mt-4 bg-[#FCFBF7] border-2 border-[#121212] px-4 py-2 font-mono font-black text-[10px] uppercase tracking-[0.2em] shadow-[2px_2px_0_0_#121212]">
             Mission Complete
           </span>
        </div>
      </div>
    </section>
  );
};
