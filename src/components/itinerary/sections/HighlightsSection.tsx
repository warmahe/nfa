import React from 'react';
import { Package } from '../../../types/database';
import * as LucideIcons from 'lucide-react';

const IconRenderer = ({ name, className, size = 18 }: { name: string, className?: string, size?: number }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Crosshair;
  return <Icon className={className} size={size} />;
};

interface HighlightsSectionProps {
  pkg: Package;
}

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({ pkg }) => {
  const displayItems = pkg?.highlights?.slice(0, 10) || [];

  if (displayItems.length === 0) return null;

  return (
    <section
      id="highlights"
      className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto bg-[#FCFBF7]"
      aria-label="Mission Objectives"
    >
      <div className="border-4 border-[#121212] bg-white p-8 md:p-16 shadow-[12px_12px_0px_0px_#121212] relative overflow-hidden">
        {/* Background stamp */}
        <div className="absolute -bottom-20 -right-20 opacity-5 pointer-events-none">
           <LucideIcons.Target size={400} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">

          {/* Left: Header */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
            <span className="inline-block border-2 border-[#121212] px-4 py-1 font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#FCFBF7] bg-[#9E1B1D] mb-6 shadow-[4px_4px_0_0_#121212]">
              Key Intel
            </span>
            <h2 className="font-brand font-black text-5xl md:text-7xl uppercase tracking-tighter text-[#121212] leading-[0.85] mb-8">
              Mission<br />Objectives
            </h2>
            <div className="w-24 h-2 bg-[#F4BF4B] mb-8 border-2 border-[#121212]" />
            <p className="font-mono font-bold text-[#121212]/70 text-xs leading-relaxed tracking-widest max-w-sm uppercase">
              These are not mere activities. They are the defining operational parameters of this expedition.
            </p>
          </div>

          {/* Right: Highlights list */}
          <div className="lg:col-span-7 space-y-6">
            {displayItems.map((item, i) => {
              const text = typeof item === 'string' ? item : item.text;
              const iconName = typeof item === 'string' ? 'Crosshair' : (item.icon || 'Crosshair');

              return (
                <div
                  key={i}
                  className="group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-6 border-2 border-dashed border-[#121212]/30 hover:border-[#121212] hover:bg-[#F4BF4B] transition-colors relative bg-[#FCFBF7]"
                >
                  {/* Number */}
                  <span className="font-brand font-black text-4xl text-[#121212]/20 group-hover:text-[#121212] transition-colors shrink-0 leading-none">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>

                  {/* Icon badge */}
                  <div className="size-12 bg-white border-2 border-[#121212] flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#121212] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                    <IconRenderer name={iconName} size={20} className="text-[#9E1B1D]" />
                  </div>

                  {/* Text */}
                  <p className="font-sans font-bold text-[#121212] text-sm uppercase tracking-wide leading-relaxed pt-1">
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
