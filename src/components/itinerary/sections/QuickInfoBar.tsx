import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Package, QuickInfoItem } from '../../../types/database';

interface QuickInfoBarProps {
  pkg: Package;
}

const IconRenderer: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 18, className }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Compass;
  return <Icon size={size} className={className} />;
};

const InfoItem: React.FC<{
  icon: string;
  label: string;
  value: string;
  isLast: boolean;
}> = ({ icon, label, value, isLast }) => (
  <div className={`flex flex-col justify-center px-6 py-6 border-b-2 sm:border-b-0 border-dashed border-[#121212]/30 relative ${!isLast ? 'sm:border-r-2' : ''}`}>
    <div className="flex items-start gap-4">
      <div className="mt-1 text-[#9E1B1D]">
        <IconRenderer name={icon} size={24} />
      </div>
      <div>
        <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#121212]/50 mb-1">{label}</span>
        <span className="block font-sans font-black text-sm uppercase tracking-wide text-[#121212]">{value}</span>
      </div>
    </div>
  </div>
);

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ pkg }) => {
  const departureDateLabel = pkg?.departureDate
    ? new Date(pkg.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Multiple Dates';

  const defaultItems: QuickInfoItem[] = [
    { icon: 'Clock', label: 'Duration', value: pkg?.duration || '7 Days' },
    { icon: 'Calendar', label: 'Departure', value: departureDateLabel },
    { icon: 'Users', label: 'Group', value: `Max ${pkg?.maxTravelers || 6} Pax` },
    { icon: 'Zap', label: 'Pace', value: pkg?.tripStyle || 'Adventure' },
    { icon: 'BedDouble', label: 'Stay', value: pkg?.accommodation || 'Luxury Camps' },
  ];

  const displayItems = (pkg?.quickInfo && pkg.quickInfo.length > 0) ? pkg.quickInfo : defaultItems;

  return (
    <section id="quick-info" className="w-full bg-[#FCFBF7] px-4 md:px-8 lg:px-12 -mt-16 md:-mt-12 relative z-30" aria-label="Trip quick info">
      <div className="max-w-[1440px] mx-auto">
        {/* Ticket Outer Frame */}
        <div className="bg-[#FCFBF7] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] flex flex-col md:flex-row relative">
          
          {/* Left Ticket Stub */}
          <div className="hidden md:flex flex-col justify-center items-center w-20 border-r-4 border-[#121212] border-dashed bg-[#F4BF4B] py-4 relative z-10 overflow-hidden">
             {/* Left cutout */}
             <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FCFBF7] border-4 border-[#121212]" />
             
             <span className="font-mono font-black text-xs tracking-[0.3em] uppercase text-[#121212] rotate-180" style={{ writingMode: 'vertical-rl' }}>
               Admit One
             </span>
             
             {/* Right cutout */}
             <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FCFBF7] border-4 border-[#121212]" />
          </div>

          {/* Ticket Details Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 relative">
            {displayItems.slice(0, 5).map((item, i) => (
              <InfoItem key={i} icon={item.icon} label={item.label} value={item.value} isLast={i === Math.min(displayItems.length, 5) - 1} />
            ))}
          </div>

          {/* Mobile bottom cutout */}
          <div className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FCFBF7] border-t-4 border-[#121212]" />
          <div className="md:hidden absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FCFBF7] border-b-4 border-[#121212]" />
        </div>
      </div>
    </section>
  );
};
