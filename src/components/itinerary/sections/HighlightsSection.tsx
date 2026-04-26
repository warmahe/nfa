import React from 'react';
import { Package } from '../../../types/database';

interface HighlightsSectionProps {
  pkg: Package;
}

const DEFAULT_HIGHLIGHTS = [
  { icon: '🏔️', text: 'Trek across ancient glacier fields' },
  { icon: '🌌', text: 'Witness the Aurora Borealis in the wild' },
  { icon: '🚗', text: 'Off-road 4×4 expeditions through volcanic terrain' },
  { icon: '🏊', text: 'Hidden thermal pools accessible only to our group' },
  { icon: '📸', text: 'Guided photography sessions at golden hour' },
  { icon: '🍽️', text: 'Farm-to-table dinners with local chefs' },
];

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({ pkg }) => {
  const highlights = pkg?.highlights?.slice(0, 10);
  const displayItems = highlights && highlights.length > 0 ? highlights : DEFAULT_HIGHLIGHTS;

  return (
    <section
      id="highlights"
      className="py-24 px-6 md:px-16 bg-[#121212] overflow-hidden"
      aria-label="Trip highlights"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: Header */}
          <div className="lg:sticky lg:top-32">
            <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#F4BF4B] mb-4">
              Why This Trip
            </span>
            <h2 className="font-brand font-black text-[clamp(3rem,7vw,6rem)] uppercase tracking-tighter text-white leading-[0.85] mb-8">
              Trip<br />Highlights.
            </h2>
            <p className="font-sans text-white/50 text-sm leading-relaxed tracking-wide max-w-sm">
              These aren't just activities. They're the defining moments that make this expedition unlike anything else.
            </p>

            {/* Decorative number */}
            <div className="mt-12 font-brand font-black text-[140px] text-white/5 leading-none select-none">
              {displayItems.length.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Right: Highlights list */}
          <div className="space-y-0">
            {displayItems.map((item, i) => {
              const icon = typeof item === 'string' ? '✦' : (item.icon || '✦');
              const text = typeof item === 'string' ? item : item.text;

              return (
                <div
                  key={i}
                  className="group flex items-start gap-6 py-6 border-b border-white/10 hover:border-[#F4BF4B]/50 transition-colors"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Number */}
                  <span className="font-brand font-black text-3xl text-white/20 group-hover:text-[#F4BF4B] transition-colors shrink-0 w-10 text-right">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>

                  {/* Icon badge */}
                  <div className="size-10 bg-[#F4BF4B]/10 border border-[#F4BF4B]/20 flex items-center justify-center text-xl shrink-0 group-hover:bg-[#F4BF4B] group-hover:scale-110 transition-all">
                    {icon}
                  </div>

                  {/* Text */}
                  <p className="font-sans font-bold text-white/70 text-sm uppercase tracking-wider leading-relaxed group-hover:text-white transition-colors pt-2">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
