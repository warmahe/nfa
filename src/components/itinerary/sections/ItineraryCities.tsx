import React, { useState } from 'react';
import { ChevronDown, MapPin, Plane, Train, Bus, Ship, Car, Utensils, Star, CheckCircle, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { Package, ItineraryCity, ItineraryDay } from '../../../types/database';
import { HotelCard } from '../HotelCard';

interface ItineraryCitiesProps {
  pkg: Package;
  onOpenGallery?: (images: string[], initialIndex?: number, hotelName?: string, location?: string) => void;
}

const TransferIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'flight': return <Plane size={16} />;
    case 'train': return <Train size={16} />;
    case 'bus': return <Bus size={16} />;
    case 'ferry': return <Ship size={16} />;
    case 'car': return <Car size={16} />;
    default: return <Plane size={16} />;
  }
};

// ── Day Details Component ─────────────────────────────────────────────────────
const DayDetails: React.FC<{
  day: ItineraryDay;
  onOpenGallery?: (images: string[], initialIndex?: number, hotelName?: string, location?: string) => void;
}> = ({ day, onOpenGallery }) => {
  return (
    <div className="space-y-6 py-6 text-left items-start w-full max-w-3xl">
      {/* Day Header & Metadata */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-brand font-black text-xs uppercase tracking-[0.25em] text-[#9E1B1D] bg-[#9E1B1D]/10 px-2.5 py-1 rounded">
            DAY {String(day.day).padStart(2, '0')}
          </span>
          {day.location && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#121212] bg-[#F4BF4B]/30 border border-[#F4BF4B] px-2.5 py-0.5 rounded-full">
              <MapPin size={10} className="text-[#9E1B1D]" /> {day.location}
            </span>
          )}
          {day.transfer && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
              <Compass size={10} /> {day.transfer}
            </span>
          )}
        </div>
        <h4 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tighter text-[#121212]">
          {day.title}
        </h4>
        <div className="w-14 h-1.5 bg-[#F4BF4B]" />
      </div>

      {/* Editorial Narrative */}
      {day.description && (
        <p className="font-sans font-medium text-sm text-[#121212]/85 leading-relaxed whitespace-pre-line">
          {day.description}
        </p>
      )}

      {/* Day Highlights (E2 Editorial Feature) */}
      {day.highlights && day.highlights.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-900 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#9E1B1D]" /> TODAY'S HIGHLIGHTS
          </span>
          <div className="flex flex-wrap gap-2">
            {day.highlights.map((highlight, idx) => (
              <span key={idx} className="text-[11px] font-bold text-[#121212] bg-white border border-amber-300 px-2.5 py-1 rounded shadow-xs">
                • {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Curated Day Experiences (E2 Editorial Feature) */}
      {day.experiences && day.experiences.length > 0 && (
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-700 flex items-center gap-1.5">
            <ChevronRight size={12} className="text-[#9E1B1D]" /> CURATED EXPERIENCES
          </span>
          <div className="flex flex-wrap gap-2">
            {day.experiences.map((exp, idx) => (
              <span key={idx} className="text-[11px] font-bold text-[#121212] bg-white border border-stone-300 px-2.5 py-1 rounded shadow-xs">
                ✨ {exp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Existing Activities, Meals, and Addons Stream */}
      <div className="flex flex-wrap gap-4 pt-1">
        {day.meals && day.meals.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <div className="size-7 rounded-full bg-[#F4BF4B]/20 flex items-center justify-center text-[#121212] shrink-0">
              <Utensils size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-0.5">Meals:</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#121212]">{day.meals.join(', ')}</span>
            </div>
          </div>
        )}

        {day.activities && day.activities.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <div className="size-7 rounded-full bg-[#121212]/10 flex items-center justify-center text-[#121212] shrink-0">
              <CheckCircle size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-0.5">Included Today:</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#121212]">{day.activities.join(', ')}</span>
            </div>
          </div>
        )}

        {day.addons && day.addons.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <div className="size-7 rounded-full bg-[#9E1B1D]/10 flex items-center justify-center text-[#9E1B1D] shrink-0">
              <Star size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-0.5">Optional Add-on:</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#9E1B1D]">{day.addons.join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Day Accommodation Block (Uses Canonical HotelCard Component) */}
      {day.hotel && day.hotel.name && (
        <div className="w-full max-w-2xl mt-4">
          <HotelCard hotel={day.hotel} onOpenGallery={onOpenGallery} />
        </div>
      )}
    </div>
  );
};

// ── Main Itinerary Presentation Component ─────────────────────────────────────
export const ItineraryCities: React.FC<ItineraryCitiesProps> = ({ pkg, onOpenGallery }) => {
  const [expandedCities, setExpandedCities] = useState<Record<number, boolean>>({ 0: true });

  const toggleCity = (idx: number) => {
    setExpandedCities(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const cities = pkg?.itineraryCities || [];

  if (cities.length === 0) return null;

  return (
    <section id="itinerary" className="py-16 bg-[#FCFBF7]">
      {/* Editorial Section Title Header */}
      <div className="mb-16 text-center">
        <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
          Editorial Expedition Timeline
        </span>
        <h2 className="font-brand font-black text-[clamp(2.5rem,6vw,5.5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85] mb-6">
          Your Journey<br />Stops.
        </h2>
        <div className="w-20 h-2 bg-[#F4BF4B] mx-auto" />
      </div>

      <div className="relative pl-2 md:pl-4">
        {/* Left-Aligned Vertical Rail Line (Preserved from B6 fix) */}
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-[#121212]/15 -translate-x-1/2" />

        {cities.map((city, cIdx) => {
          const stopNumber = String(cIdx + 1).padStart(2, '0');

          return (
            <div key={cIdx} className="relative mb-20 last:mb-0">
              
              {/* Sector Arrival Transfer Banner */}
              {city.arrivalTransfer && city.arrivalTransfer.text && (
                <div className="relative z-10 flex items-center gap-3 mb-6 pl-10 md:pl-14">
                  <div className="bg-white border-2 border-[#121212] p-2.5 shadow-[3px_3px_0_0_#121212] rounded-full shrink-0">
                    <TransferIcon type={city.arrivalTransfer.type} />
                  </div>
                  <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/75 italic">
                    ARRIVAL: {city.arrivalTransfer.text}
                  </span>
                </div>
              )}

              {/* Journey Stop Header Chapter Card */}
              <div className="relative z-10 mb-8 pl-10 md:pl-14">
                <button 
                  onClick={() => toggleCity(cIdx)}
                  className="group w-full max-w-3xl bg-white border-4 border-[#121212] p-6 rounded-2xl shadow-[8px_8px_0px_0px_#121212] flex items-center gap-6 hover:shadow-[10px_10px_0px_0px_#F4BF4B] transition-all text-left"
                >
                  {/* Sequential Stop Index Number */}
                  <div className="size-14 rounded-xl bg-[#121212] text-[#F4BF4B] font-brand font-black text-2xl flex items-center justify-center shrink-0 border-2 border-[#F4BF4B]">
                    {stopNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#9E1B1D]">
                        Journey Stop {stopNumber}
                      </span>
                      {city.country && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/60">
                          • {city.country}
                        </span>
                      )}
                    </div>
                    <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tighter text-[#121212] leading-none truncate">
                      {city.city}
                    </h3>
                    <p className="font-black text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                      {city.nights} Night{city.nights !== 1 ? 's' : ''} Stay
                    </p>
                  </div>

                  <div className={`p-3 rounded-full bg-[#FCFBF7] border-2 border-[#121212] transition-transform duration-300 ${expandedCities[cIdx] ? 'rotate-180 bg-[#F4BF4B]' : ''}`}>
                    <ChevronDown size={22} className="text-[#121212]" />
                  </div>
                </button>
              </div>

              {/* Stop Editorial Content & Day Timeline */}
              {expandedCities[cIdx] && (
                <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-400">
                  
                  {/* Journey Stop Hero Image, Narrative Description, Highlights & Experiences */}
                  <div className="pl-10 md:pl-14 w-full max-w-3xl space-y-6">
                    {/* Hero Image */}
                    {city.heroImage && (
                      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] bg-[#121212]">
                        <img 
                          src={city.heroImage} 
                          alt={`${city.city} — ${city.country || 'Journey Stop'}`} 
                          loading="lazy" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Editorial Stop Description */}
                    {city.description && (
                      <div className="p-6 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#F4BF4B] rounded-xl">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block mb-2">
                          Destination Story
                        </span>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                          "{city.description}"
                        </p>
                      </div>
                    )}

                    {/* Stop Highlights Grid */}
                    {city.highlights && city.highlights.length > 0 && (
                      <div className="p-5 bg-white border-2 border-[#121212] rounded-xl space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#121212] flex items-center gap-2">
                          <Sparkles size={14} className="text-[#F4BF4B]" /> STOP HIGHLIGHTS
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {city.highlights.map((hl, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2 p-2 bg-[#FCFBF7] border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                              <span className="size-2 rounded-full bg-[#9E1B1D]" />
                              {hl}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stop Curated Experiences Grid */}
                    {city.experiences && city.experiences.length > 0 && (
                      <div className="p-5 bg-[#121212] text-white border-2 border-[#121212] rounded-xl space-y-3 shadow-[6px_6px_0px_0px_#F4BF4B]">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F4BF4B] flex items-center gap-2">
                          <Star size={14} /> CURATED EXPERIENCES
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {city.experiences.map((exp, eIdx) => (
                            <div key={eIdx} className="p-2.5 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-amber-100 flex items-center gap-2">
                              <span>✨</span> {exp}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sector-Wide Accommodation Card (Uses Canonical HotelCard Component) */}
                    {city.hotel && city.hotel.name && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block">
                          YOUR STAY TONIGHT
                        </span>
                        <HotelCard hotel={city.hotel} onOpenGallery={onOpenGallery} />
                      </div>
                    )}
                  </div>

                  {/* Day-by-Day Detailed Timeline for this Stop */}
                  <div className="space-y-12">
                    {city.days.map((day, dIdx) => (
                      <div key={dIdx} className="relative pl-10 md:pl-14 w-full">
                        {/* Day timeline dot on left rail line */}
                        <div className="absolute left-4 md:left-6 top-8 size-4 bg-[#F4BF4B] border-4 border-white rounded-full -translate-x-1/2 z-20 shadow-[0_0_0_2px_#121212]" />
                        
                        <DayDetails day={day} onOpenGallery={onOpenGallery} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Departure / Expedition Completion Milestone */}
        <div className="relative z-10 flex items-center gap-3 mt-16 pl-10 md:pl-14">
          <div className="bg-[#121212] text-[#F4BF4B] border-2 border-[#121212] p-3 shadow-[4px_4px_0_0_#F4BF4B] rounded-full shrink-0">
            <Plane size={20} />
          </div>
          <div>
            <span className="font-brand font-black text-sm uppercase tracking-widest text-[#121212] block">
              Journey Expedition Completed
            </span>
            <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-[#121212]/60 italic">
              All sectors visited & mission exfiltration completed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
