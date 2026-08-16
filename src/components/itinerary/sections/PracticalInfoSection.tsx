import React from 'react';
import { Compass, Calendar, Gauge, Users, Heart, Info, Sparkles, MapPin, Clock } from 'lucide-react';
import { Package } from '../../../types/database';

interface PracticalInfoSectionProps {
  pkg: Package;
}

const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  Easy: 'Gentle pace with leisurely walks, comfortable stays, and private transfers.',
  Moderate: 'Active exploration, cultural walking, and varied terrain suitable for most fitness levels.',
  Challenging: 'High-energy adventure, active trekking, or remote landscapes.',
  Expert: 'Demanding expedition requiring solid endurance and wilderness readiness.',
};

export const PracticalInfoSection: React.FC<PracticalInfoSectionProps> = ({ pkg }) => {
  const duration = pkg.duration?.trim();
  const stopsCount = pkg.itineraryCities?.length || pkg.destinations?.length || 0;
  const difficulty = pkg.difficulty;
  const bestTime = pkg.bestTime?.trim();
  const maxTravelers = (pkg as any).maxTravelers || pkg.availability?.maxSlots;
  const bestFor = Array.isArray(pkg.bestFor) ? pkg.bestFor.filter(Boolean) : [];
  const travelStyles = Array.isArray(pkg.travelStyle) ? pkg.travelStyle.filter(Boolean) : [];

  // Check if at least one meaningful piece of decision data exists
  const hasDecisionData = Boolean(
    duration ||
    stopsCount > 0 ||
    difficulty ||
    bestTime ||
    maxTravelers ||
    bestFor.length > 0 ||
    travelStyles.length > 0
  );

  if (!hasDecisionData) return null;

  return (
    <section
      id="travel-information"
      className="py-12 px-6 md:px-0 max-w-4xl space-y-8 text-left"
      aria-label="Travel decision support and practical information"
    >
      {/* Section Header */}
      <div className="space-y-2 border-b-2 border-[#121212]/10 pb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block">
          Decision Support
        </span>
        <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#121212]">
          AT A GLANCE & TRAVEL INFORMATION
        </h3>
      </div>

      {/* Grid of Decision Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Duration & Route Card */}
        {duration && (
          <div className="p-5 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-2">
            <div className="flex items-center gap-2 text-[#9E1B1D]">
              <Clock size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/60">
                Duration & Route
              </span>
            </div>
            <div className="font-brand font-black text-xl text-[#121212]">
              {duration} {stopsCount > 0 ? `• ${stopsCount} Stops` : ''}
            </div>
            {pkg.destinations && pkg.destinations.length > 0 && (
              <p className="text-xs font-bold text-slate-600 truncate">
                Route: {pkg.destinations.join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Pace & Difficulty Card */}
        {difficulty && (
          <div className="p-5 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-2">
            <div className="flex items-center gap-2 text-[#9E1B1D]">
              <Gauge size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/60">
                Pace & Difficulty
              </span>
            </div>
            <div className="font-brand font-black text-xl text-[#121212]">
              {difficulty} Pace
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {DIFFICULTY_DESCRIPTIONS[difficulty] || 'Curated pace with private transportation.'}
            </p>
          </div>
        )}

        {/* Best Time To Visit Card */}
        {bestTime && (
          <div className="p-5 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-2">
            <div className="flex items-center gap-2 text-[#9E1B1D]">
              <Calendar size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/60">
                When To Go
              </span>
            </div>
            <div className="font-brand font-black text-xl text-[#121212]">
              {bestTime}
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              Optimal seasonal weather window and wildlife/cultural highlights.
            </p>
          </div>
        )}

        {/* Group / Party Size Card */}
        {maxTravelers && (
          <div className="p-5 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-2">
            <div className="flex items-center gap-2 text-[#9E1B1D]">
              <Users size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/60">
                Expedition Format
              </span>
            </div>
            <div className="font-brand font-black text-xl text-[#121212]">
              Private or Intimate Group (Max {maxTravelers})
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              Tailored specifically for you or your private travelling party.
            </p>
          </div>
        )}
      </div>

      {/* Who This Journey Suits / Best For */}
      {(bestFor.length > 0 || travelStyles.length > 0) && (
        <div className="p-6 bg-[#FCFBF7] border-2 border-[#121212] space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#9E1B1D] flex items-center gap-1.5">
            <Heart size={14} /> WHO THIS JOURNEY SUITS
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {bestFor.map((item, idx) => (
              <span
                key={`bf-${idx}`}
                className="bg-[#121212] text-[#F4BF4B] border border-[#121212] px-3 py-1 font-black text-[10px] uppercase tracking-wider"
              >
                ✓ {item}
              </span>
            ))}
            {travelStyles.map((style, idx) => (
              <span
                key={`ts-${idx}`}
                className="bg-white text-[#121212] border-2 border-[#121212] px-3 py-1 font-black text-[10px] uppercase tracking-wider"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Transparency Explanation Note */}
      <div className="p-4 bg-white border-l-4 border-[#F4BF4B] border-y border-r border-slate-200 flex items-start gap-3">
        <Info size={18} className="text-[#9E1B1D] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#121212] block">
            Pricing Clarity & Transparency
          </span>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Starting prices are per person based on double occupancy. Final investment reflects your chosen travel dates, preferred boutique or luxury stays, party size, and customized private experiences.
          </p>
        </div>
      </div>
    </section>
  );
};
