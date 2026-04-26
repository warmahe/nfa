import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Plane, Train, Bus, Ship, Car, Utensils, Star, CheckCircle } from 'lucide-react';
import { Package, ItineraryCity, ItineraryDay } from '../../../types/database';

interface ItineraryCitiesProps {
  pkg: Package;
}

const TransferIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'flight': return <Plane size={18} />;
    case 'train': return <Train size={18} />;
    case 'bus': return <Bus size={18} />;
    case 'ferry': return <Ship size={18} />;
    case 'car': return <Car size={18} />;
    default: return <Plane size={18} />;
  }
};

const DayDetails: React.FC<{ day: ItineraryDay }> = ({ day }) => {
  const alignmentClass = day.textAlign === 'center' ? 'text-center items-center' : day.textAlign === 'right' ? 'text-right items-end' : 'text-left items-start';
  
  return (
    <div className={`space-y-6 py-8 ${alignmentClass}`}>
      <div className="space-y-2">
        <h4 className="font-brand font-black text-xl uppercase tracking-tighter text-[#121212]">
          Day {day.day}: {day.title}
        </h4>
        <div className="w-12 h-1 bg-[#F4BF4B]" />
      </div>
      
      <p className="font-sans font-medium text-sm text-[#121212]/80 leading-relaxed max-w-2xl whitespace-pre-line">
        {day.description}
      </p>

      <div className={`flex flex-wrap gap-4 pt-4 ${day.textAlign === 'center' ? 'justify-center' : day.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
        {day.meals && day.meals.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-[#F4BF4B]/10 flex items-center justify-center text-[#F4BF4B]">
              <Utensils size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Meals:</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">+ {day.meals.join(', ')}</span>
            </div>
          </div>
        )}

        {day.addons && day.addons.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-[#9E1B1D]/10 flex items-center justify-center text-[#9E1B1D]">
              <Star size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Optional Add-on:</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">+ {day.addons.join(', ')}</span>
            </div>
          </div>
        )}

        {day.activities && day.activities.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-[#121212]/5 flex items-center justify-center text-[#121212]">
              <CheckCircle size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Included Today:</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">+ {day.activities.join(', ')}</span>
            </div>
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
    <section id="itinerary" className="py-24 px-6 md:px-16 max-w-[1440px] mx-auto bg-[#FCFBF7]">
      <div className="mb-20 text-center">
        <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-4">
          Mission Deployment
        </span>
        <h2 className="font-brand font-black text-[clamp(3.5rem,8vw,7.5rem)] uppercase tracking-tighter text-[#121212] leading-[0.8] mb-8">
          The Tactical<br />Timeline.
        </h2>
        <div className="w-24 h-2 bg-[#F4BF4B] mx-auto" />
      </div>

      <div className="relative max-w-4xl mx-auto pl-8 md:pl-0">
        {/* Vertical Center Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        {cities.map((city, cIdx) => (
          <div key={cIdx} className="relative mb-24 last:mb-0">
            
            {/* Arrival Transfer info */}
            {city.arrivalTransfer && (
              <div className="relative z-10 flex flex-col items-center mb-8">
                <div className="bg-white border-2 border-[#121212] p-3 shadow-[4px_4px_0_0_#121212] rounded-full">
                  <TransferIcon type={city.arrivalTransfer.type} />
                </div>
                <span className="mt-2 font-sans font-bold text-[10px] uppercase tracking-widest text-[#121212]/40 italic">
                  {city.arrivalTransfer.text}
                </span>
              </div>
            )}

            {/* City Header Card */}
            <div className="relative z-10 flex flex-col items-center">
              <button 
                onClick={() => toggleCity(cIdx)}
                className="group w-full max-w-lg bg-[#f0f0f0] border-2 border-[#121212]/5 p-6 rounded-3xl shadow-xl flex items-center gap-6 hover:shadow-2xl transition-all hover:scale-[1.02]"
              >
                <div className="size-14 rounded-full bg-[#9E1B1D]/10 flex items-center justify-center text-[#9E1B1D] shrink-0 border-2 border-white shadow-inner">
                  <MapPin size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-brand font-black text-3xl uppercase tracking-tighter text-[#121212] leading-none mb-1">
                    {city.city}
                  </h3>
                  <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">
                    {city.country || 'Expedition Sector'} | {city.nights} Night{city.nights !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`p-2 transition-transform duration-300 ${expandedCities[cIdx] ? 'rotate-180' : ''}`}>
                  <ChevronDown size={24} className="text-[#121212]/20 group-hover:text-[#9E1B1D]" />
                </div>
              </button>

              {/* Day Contents within this city block */}
              {expandedCities[cIdx] && (
                <div className="w-full mt-12 space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                  {city.days.map((day, dIdx) => (
                    <div key={dIdx} className="relative">
                      {/* Day dot on timeline */}
                      <div className="absolute left-[-26px] md:left-1/2 top-10 size-4 bg-[#F4BF4B] border-4 border-white rounded-full -translate-x-1/2 z-20 shadow-md" />
                      
                      <div className={`md:w-1/2 ${dIdx % 2 === 0 ? 'md:ml-auto md:pl-16' : 'md:mr-auto md:pr-16 md:text-right'}`}>
                         <DayDetails day={{...day, textAlign: day.textAlign || (dIdx % 2 === 0 ? 'left' : 'right')}} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Departure/Exit logic (last flight out) */}
        <div className="relative z-10 flex flex-col items-center mt-24">
          <div className="bg-white border-2 border-[#121212] p-3 shadow-[4px_4px_0_0_#F4BF4B] rounded-full">
            <Plane size={18} />
          </div>
          <span className="mt-2 font-sans font-bold text-[10px] uppercase tracking-widest text-[#121212]/40 italic">
            Mission Exfiltration Completed
          </span>
        </div>
      </div>
    </section>
  );
};
