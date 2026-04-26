import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Package } from '../../../types/database';

interface InclusionsExclusionsProps {
  pkg: Package;
}

const DEFAULT_INCLUSIONS = [
  'All accommodation (3–4 star)',
  'Daily breakfast & selected meals',
  'Airport transfers (arrival & departure)',
  'All internal transportation',
  'Expert local guide throughout',
  'All entry permits & park fees',
  'Emergency evacuation insurance',
];

const DEFAULT_EXCLUSIONS = [
  'International flights',
  'Personal travel insurance',
  'Optional activities (marked separately)',
  'Meals not mentioned in itinerary',
  'Personal expenses & souvenirs',
  'Visa fees',
];

export const InclusionsExclusions: React.FC<InclusionsExclusionsProps> = ({ pkg }) => {
  const [activeTab, setActiveTab] = useState<'inclusions' | 'exclusions'>('inclusions');

  const inclusions = pkg?.inclusions && pkg.inclusions.length > 0 ? pkg.inclusions : DEFAULT_INCLUSIONS;
  const exclusions = pkg?.exclusions && pkg.exclusions.length > 0 ? pkg.exclusions : DEFAULT_EXCLUSIONS;

  return (
    <section
      id="inclusions"
      className="py-24 px-6 md:px-16 bg-white border-y-4 border-[#121212]"
      aria-label="Inclusions and exclusions"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
            What's Covered
          </span>
          <h2 className="font-brand font-black text-[clamp(3rem,7vw,5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
            In & Out.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex border-4 border-[#121212] mb-8 w-fit">
          <button
            id="tab-inclusions"
            onClick={() => setActiveTab('inclusions')}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-colors border-r-4 border-[#121212] ${
              activeTab === 'inclusions'
                ? 'bg-[#121212] text-[#F4BF4B]'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
            role="tab"
            aria-selected={activeTab === 'inclusions'}
          >
            ✓ Inclusions ({inclusions.length})
          </button>
          <button
            id="tab-exclusions"
            onClick={() => setActiveTab('exclusions')}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-colors ${
              activeTab === 'exclusions'
                ? 'bg-[#9E1B1D] text-white'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
            role="tab"
            aria-selected={activeTab === 'exclusions'}
          >
            ✗ Exclusions ({exclusions.length})
          </button>
        </div>

        {/* Content panel */}
        <div
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="animate-in fade-in duration-300"
        >
          {activeTab === 'inclusions' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inclusions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 border-2 border-[#121212] bg-[#FCFBF7] hover:bg-white hover:shadow-[4px_4px_0px_0px_#F4BF4B] transition-all group"
                >
                  <div className="size-6 bg-[#121212] text-[#F4BF4B] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F4BF4B] group-hover:text-[#121212] transition-colors">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="font-sans font-bold text-sm text-[#121212] uppercase tracking-wide leading-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exclusions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 border-2 border-[#9E1B1D]/30 bg-red-50/30 hover:bg-red-50 transition-colors group"
                >
                  <div className="size-6 bg-[#9E1B1D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <X size={14} strokeWidth={3} />
                  </div>
                  <span className="font-sans font-bold text-sm text-[#121212]/70 uppercase tracking-wide leading-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
