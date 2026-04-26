import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Utensils, Activity, Star } from 'lucide-react';
import { Package, ItineraryCity } from '../../../types/database';

interface ItineraryCitiesProps {
  pkg: Package;
}

const MealBadge: React.FC<{ meal: string }> = ({ meal }) => (
  <span className="flex items-center gap-1.5 bg-[#F4BF4B]/20 border border-[#F4BF4B] text-[#121212] px-3 py-1 font-black text-[9px] uppercase tracking-widest">
    <Utensils size={10} /> {meal}
  </span>
);

const DayCard: React.FC<{ day: Package['itineraryDays'] extends (infer D)[] ? D : never; dayIndex: number; isOpen: boolean; onToggle: () => void }> = ({
  day,
  dayIndex,
  isOpen,
  onToggle,
}) => (
  <div className={`border-2 border-[#121212] transition-all ${isOpen ? 'bg-white shadow-[6px_6px_0px_0px_#F4BF4B]' : 'bg-[#FCFBF7] hover:bg-white'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-5 p-5 text-left group"
      aria-expanded={isOpen}
    >
      <span className="font-brand font-black text-3xl text-[#9E1B1D]/40 group-hover:text-[#9E1B1D] transition-colors shrink-0 w-10">
        {(day.day || dayIndex + 1).toString().padStart(2, '0')}
      </span>
      <h4 className="flex-1 font-black text-sm uppercase tracking-tight text-[#121212]">
        {day.title || `Day ${day.day || dayIndex + 1}`}
      </h4>
      {isOpen ? <ChevronUp size={18} className="shrink-0 text-[#9E1B1D]" /> : <ChevronDown size={18} className="shrink-0" />}
    </button>

    {isOpen && (
      <div className="px-5 pb-6 pl-[calc(2.5rem+1.25rem)] space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
        {day.description && (
          <p className="font-serif italic text-base text-[#121212]/70 leading-relaxed border-l-2 border-[#F4BF4B] pl-4">
            {day.description}
          </p>
        )}

        {/* Meals */}
        {day.meals && day.meals.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40 self-center mr-1">Meals:</span>
            {day.meals.map((meal, i) => <MealBadge key={i} meal={meal} />)}
          </div>
        )}

        {/* Activities */}
        {day.activities && day.activities.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40 flex items-center gap-1">
              <Activity size={10} /> Activities:
            </span>
            <ul className="space-y-1">
              {day.activities.map((act, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-bold text-[#121212]/70 uppercase tracking-wide">
                  <div className="size-1.5 bg-[#9E1B1D] rounded-full shrink-0 mt-1.5" />
                  {act}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add-ons */}
        {day.addons && day.addons.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9E1B1D]/70 flex items-center gap-1">
              <Star size={10} /> Optional Add-ons:
            </span>
            <ul className="space-y-1">
              {day.addons.map((addon, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-bold text-[#9E1B1D]/80 uppercase tracking-wide">
                  <div className="size-1.5 bg-[#F4BF4B] rotate-45 shrink-0 mt-1.5" />
                  {addon}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
);

export const ItineraryCities: React.FC<ItineraryCitiesProps> = ({ pkg }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ '0-0': true }); // First day open by default
  const [openCities, setOpenCities] = useState<Record<number, boolean>>({ 0: true }); // First city open

  const toggle = (key: string) =>
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleCity = (i: number) =>
    setOpenCities(prev => ({ ...prev, [i]: !prev[i] }));

  // Prefer city-grouped itinerary; fall back to flat days
  const hasCities = pkg?.itineraryCities && pkg.itineraryCities.length > 0;
  const flatDays = pkg?.itineraryDays || [];

  return (
    <section id="itinerary" className="py-24 px-6 md:px-16 max-w-[1440px] mx-auto" aria-label="Trip itinerary">

      <div className="mb-14">
        <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
          Day by Day
        </span>
        <h2 className="font-brand font-black text-[clamp(3rem,7vw,6rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
          The Mission<br />Timeline.
        </h2>
      </div>

      {hasCities ? (
        /* --- CITY-GROUPED VIEW --- */
        <div className="space-y-8">
          {pkg.itineraryCities!.map((cityBlock: ItineraryCity, ci) => (
            <div key={ci} className="border-4 border-[#121212]">
              {/* City header */}
              <button
                onClick={() => toggleCity(ci)}
                className="w-full flex items-center gap-6 p-6 bg-[#121212] text-white group hover:bg-[#9E1B1D] transition-colors"
                aria-expanded={openCities[ci]}
              >
                <MapPin size={20} className="text-[#F4BF4B] shrink-0" />
                <div className="flex-1 text-left">
                  <span className="font-brand font-black text-2xl uppercase tracking-tight">{cityBlock.city}</span>
                  <span className="ml-4 text-white/50 font-black text-[10px] uppercase tracking-widest">
                    {cityBlock.nights} Night{cityBlock.nights !== 1 ? 's' : ''} · {cityBlock.days.length} Day{cityBlock.days.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {openCities[ci]
                  ? <ChevronUp size={20} className="text-[#F4BF4B] shrink-0" />
                  : <ChevronDown size={20} className="text-[#F4BF4B] shrink-0" />
                }
              </button>

              {openCities[ci] && (
                <div className="p-4 space-y-3 bg-[#FCFBF7] animate-in fade-in slide-in-from-top-2 duration-300">
                  {cityBlock.days.map((day, di) => (
                    <DayCard
                      key={di}
                      day={day}
                      dayIndex={di}
                      isOpen={!!openItems[`${ci}-${di}`]}
                      onToggle={() => toggle(`${ci}-${di}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : flatDays.length > 0 ? (
        /* --- FLAT LEGACY VIEW --- */
        <div className="space-y-4">
          {flatDays.map((day, di) => (
            <DayCard
              key={di}
              day={day}
              dayIndex={di}
              isOpen={!!openItems[`0-${di}`]}
              onToggle={() => toggle(`0-${di}`)}
            />
          ))}
        </div>
      ) : (
        /* --- EMPTY STATE --- */
        <div className="border-4 border-dashed border-[#121212]/20 p-16 text-center">
          <span className="font-black text-[#121212]/30 uppercase tracking-widest text-sm">
            Itinerary coming soon
          </span>
        </div>
      )}
    </section>
  );
};
