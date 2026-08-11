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

const getDynamicGridClass = (count: number) => {
  switch (count) {
    case 1:
      return 'grid-cols-1 max-w-md mx-auto';
    case 2:
      return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    case 3:
      return 'grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto';
    case 4:
      return 'grid-cols-2 lg:grid-cols-4';
    case 5:
      return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    case 6:
    default:
      return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
  }
};

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ pkg }) => {
  const departureDateLabel = pkg?.departureDate
    ? new Date(pkg.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Multiple Dates';

  const defaultItems: QuickInfoItem[] = [
    { icon: 'Clock', label: 'Duration', value: pkg?.duration || '' },
    { icon: 'Calendar', label: 'Next Departure', value: departureDateLabel },
    { icon: 'Users', label: 'Group Size', value: pkg?.maxTravelers ? `Max ${pkg.maxTravelers} People` : '' },
    { icon: 'Zap', label: 'Trip Style', value: pkg?.tripStyle || '' },
    { icon: 'BedDouble', label: 'Accommodation', value: pkg?.accommodation || '' },
    { icon: 'Compass', label: 'Guide', value: pkg?.guideType || '' },
  ];

  const rawItems = (pkg?.quickInfo && pkg.quickInfo.length > 0) ? pkg.quickInfo : defaultItems;

  // Filter out any empty, undefined, NaN, or null fields
  const displayItems = rawItems.filter(item => {
    if (!item || !item.label || !item.value) return false;
    const v = String(item.value).trim();
    const l = String(item.label).trim();
    return v !== '' && v !== 'undefined' && v !== 'null' && v !== 'NaN' && l !== '';
  });

  if (displayItems.length === 0) return null;

  const dynamicGridClass = getDynamicGridClass(displayItems.length);

  return (
    <section
      id="quick-info"
      className="border-y-4 border-[#121212] bg-white relative overflow-hidden"
      aria-label="Trip quick info"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="max-w-[1440px] mx-auto relative">
        <div className={`grid ${dynamicGridClass} divide-x-2 divide-y-2 sm:divide-y-0 divide-[#121212]/10`}>
          {displayItems.map((item, i) => (
            <InfoItem key={i} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </section>
  );
};
