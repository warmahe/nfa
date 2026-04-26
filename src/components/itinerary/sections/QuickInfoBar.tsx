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
}> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center justify-center gap-4 px-4 py-8 border-b-2 sm:border-b-0 sm:border-r-2 border-[#121212]/10 last:border-0 group relative overflow-hidden transition-all hover:bg-[#FCFBF7]">
    {/* Decorative corner accent */}
    <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-[#121212]/5 group-hover:border-[#9E1B1D]/20 transition-colors" />
    
    <div className="size-12 bg-white border-2 border-[#121212] flex items-center justify-center shadow-[4px_4px_0_0_#121212] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-[#F4BF4B] transition-all">
      <IconRenderer name={icon} className="text-[#121212]" />
    </div>
    
    <div className="text-center">
      <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-[#121212]/40 mb-2 group-hover:text-[#9E1B1D] transition-colors">{label}</span>
      <span className="block font-brand font-black text-lg uppercase tracking-tighter text-[#121212] leading-none">{value}</span>
    </div>
  </div>
);

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ pkg }) => {
  const departureDateLabel = pkg?.departureDate
    ? new Date(pkg.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Multiple Dates';

  // Default items if no custom quickInfo is provided
  const defaultItems: QuickInfoItem[] = [
    { icon: 'Clock', label: 'Duration', value: pkg?.duration || '7 Days' },
    { icon: 'Calendar', label: 'Next Departure', value: departureDateLabel },
    { icon: 'Users', label: 'Group Size', value: `Max ${pkg?.maxTravelers || 6} People` },
    { icon: 'Zap', label: 'Trip Style', value: pkg?.tripStyle || 'Adventure' },
    { icon: 'BedDouble', label: 'Accommodation', value: pkg?.accommodation || 'Luxury Camps' },
    { icon: 'Compass', label: 'Guide', value: pkg?.guideType || 'Expert Local Guides' },
  ];

  const displayItems = (pkg?.quickInfo && pkg.quickInfo.length > 0) ? pkg.quickInfo : defaultItems;

  return (
    <section
      id="quick-info"
      className="border-y-4 border-[#121212] bg-white relative"
      aria-label="Trip quick info"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="max-w-[1440px] mx-auto relative">
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(displayItems.length, 6)} xl:grid-cols-${Math.min(displayItems.length, 8)}`}>
          {displayItems.map((item, i) => (
            <InfoItem key={i} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </section>
  );
};
